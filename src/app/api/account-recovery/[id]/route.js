import { NextResponse } from "next/server";
import { resolveRecoveryRequest } from "@/lib/server/accounts";
import { getSessionFromRequest } from "@/lib/server/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(request, { params }) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const requestRow = await resolveRecoveryRequest(id);
  return NextResponse.json({ ok: true, request: requestRow }, { status: 200 });
}
