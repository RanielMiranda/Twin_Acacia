import { NextResponse } from "next/server";
import { getAccountByEmail, sanitizeAccount, upgradeLegacyPassword } from "@/lib/server/accounts";
import { verifyPassword } from "@/lib/server/passwords";
import { attachSessionCookie } from "@/lib/server/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const email = String(body?.email || "").trim().toLowerCase();
  const password = String(body?.password || "");
  if (!email || !password) {
    return NextResponse.json({ ok: false, error: "Email and password are required." }, { status: 400 });
  }

  const account = await getAccountByEmail(email, { includePassword: true });
  if (!account) {
    return NextResponse.json({ ok: false, error: "Invalid credentials." }, { status: 401 });
  }

  const isValid = await verifyPassword(password, account.password);
  if (!isValid) {
    return NextResponse.json({ ok: false, error: "Invalid credentials." }, { status: 401 });
  }

  if ((account.status || "").toLowerCase() === "suspended") {
    return NextResponse.json({ ok: false, error: "This account is suspended. Contact admin for access." }, { status: 403 });
  }

  await upgradeLegacyPassword(account.id, account.password);

  const response = NextResponse.json({ ok: true, account: sanitizeAccount(account) }, { status: 200 });
  return attachSessionCookie(response, account);
}
