import { NextResponse } from "next/server";
import { completeAccountSetup, getAccountBySetupToken } from "@/lib/server/accounts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  const token = new URL(request.url).searchParams.get("token") || "";
  if (!token) {
    return NextResponse.json({ ok: false, error: "Missing setup token." }, { status: 400 });
  }

  const account = await getAccountBySetupToken(token);
  return NextResponse.json({ ok: true, account }, { status: 200 });
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const token = String(body?.token || "");
  const password = String(body?.password || "");
  const profile_image = body?.profile_image || null;

  if (!token || !password) {
    return NextResponse.json({ ok: false, error: "Token and password are required." }, { status: 400 });
  }

  const account = await completeAccountSetup(token, { password, profile_image });
  return NextResponse.json({ ok: true, account }, { status: 200 });
}
