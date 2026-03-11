import { NextResponse } from "next/server";
import { createRecoveryRequest, getAccountByEmail } from "@/lib/server/accounts";

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
  const message = String(body?.message || "").trim();
  if (!email) {
    return NextResponse.json({ ok: false, error: "Email is required." }, { status: 400 });
  }

  const account = await getAccountByEmail(email);
  if (!account) {
    return NextResponse.json({ ok: false, error: "No account found for this email." }, { status: 404 });
  }

  await createRecoveryRequest({ email, message });
  return NextResponse.json({ ok: true }, { status: 200 });
}
