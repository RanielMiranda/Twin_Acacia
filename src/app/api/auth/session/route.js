import { NextResponse } from "next/server";
import { clearSessionCookie, getSessionFromRequest } from "@/lib/server/session";
import { getAccountById, sanitizeAccount } from "@/lib/server/accounts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ ok: true, account: null }, { status: 200 });
  }

  const account = await getAccountById(session.accountId);
  if (!account || (account.status || "").toLowerCase() === "suspended") {
    return clearSessionCookie(NextResponse.json({ ok: true, account: null }, { status: 200 }));
  }

  return NextResponse.json({ ok: true, account: sanitizeAccount(account) }, { status: 200 });
}
