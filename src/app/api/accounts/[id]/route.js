import { NextResponse } from "next/server";
import { deleteAccount, getAccountById, updateAccount } from "@/lib/server/accounts";
import { getSessionFromRequest } from "@/lib/server/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAllowed(session, accountId) {
  if (!session) return false;
  if (session.role === "admin") return true;
  return Number(session.accountId) === Number(accountId);
}

export async function GET(request, { params }) {
  const { id } = await params;
  const session = await getSessionFromRequest(request);
  if (!isAllowed(session, id)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const account = await getAccountById(id);
  return NextResponse.json({ ok: true, account }, { status: 200 });
}

export async function PATCH(request, { params }) {
  const { id } = await params;
  const session = await getSessionFromRequest(request);
  if (!isAllowed(session, id)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const payload = { ...body };
  if (session.role !== "admin") {
    delete payload.role;
    delete payload.status;
    delete payload.setup_token;
    delete payload.resort_id;
  }

  const account = await updateAccount(id, payload);
  return NextResponse.json({ ok: true, account }, { status: 200 });
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  await deleteAccount(id);
  return NextResponse.json({ ok: true }, { status: 200 });
}
