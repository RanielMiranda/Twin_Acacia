import { NextResponse } from "next/server";
import { createRecoveryRequest, listRecoveryRequests } from "@/lib/server/accounts";
import { getSessionFromRequest } from "@/lib/server/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const requests = await listRecoveryRequests();
  return NextResponse.json({ ok: true, requests }, { status: 200 });
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const requestRow = await createRecoveryRequest(body);
  return NextResponse.json({ ok: true, request: requestRow }, { status: 200 });
}
