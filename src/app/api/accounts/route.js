import { NextResponse } from "next/server";
import { createAccountInvite, listAccounts } from "@/lib/server/accounts";
import { getSessionFromRequest } from "@/lib/server/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function ensureAdmin(session) {
  return session && session.role === "admin";
}

export async function GET(request) {
  const session = await getSessionFromRequest(request);
  if (!ensureAdmin(session)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const accounts = await listAccounts();
  return NextResponse.json({ ok: true, accounts }, { status: 200 });
}

export async function POST(request) {
  const session = await getSessionFromRequest(request);
  if (!ensureAdmin(session)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const setupToken = `setup-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const account = await createAccountInvite({ ...body, setupToken });
  return NextResponse.json(
    { ok: true, account, setupLink: `/auth/setup-resort?token=${encodeURIComponent(setupToken)}` },
    { status: 200 }
  );
}
