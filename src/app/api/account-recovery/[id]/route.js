import { NextResponse } from "next/server";
import {
  ensureAccountSetupToken,
  deleteRecoveryRequest,
  getAccountByEmail,
  getAccountById,
  getRecoveryRequestById,
  resolveRecoveryRequest,
} from "@/lib/server/accounts";
import { getSessionFromRequest } from "@/lib/server/session";
import { logEmailDelivery } from "@/lib/emailTracking";
import { createServiceSupabaseClient } from "@/lib/server/serviceSupabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(request, { params }) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const requestRow = await getRecoveryRequestById(id);
  if (!requestRow) {
    return NextResponse.json({ ok: false, error: "Recovery request not found." }, { status: 404 });
  }

  const resendApiKey = process.env.RESEND_API;
  if (!resendApiKey) {
    return NextResponse.json({ ok: false, error: "Missing RESEND_API" }, { status: 500 });
  }

  const account = requestRow?.account_id
    ? await getAccountById(requestRow.account_id)
    : requestRow?.email
      ? await getAccountByEmail(requestRow.email)
      : null;

  if (!account?.id) {
    return NextResponse.json({ ok: false, error: "Account not found for this recovery request." }, { status: 404 });
  }

  const setupToken = await ensureAccountSetupToken(account.id);
  if (!setupToken) {
    return NextResponse.json({ ok: false, error: "Unable to generate setup link." }, { status: 500 });
  }

  const baseUrl = (() => {
    const forwardedProto = request.headers.get("x-forwarded-proto");
    const forwardedHost = request.headers.get("x-forwarded-host");
    if (forwardedProto && forwardedHost) {
      return `${forwardedProto}://${forwardedHost}`;
    }
    return request.nextUrl.origin;
  })();
  const setupLink = `${baseUrl}/auth/setup-resort?token=${encodeURIComponent(setupToken)}`;

  const emailPayload = {
    from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
    to: [account.email],
    subject: "Reset your Twin Acacia password",
    html: `
      <div style="font-family:Arial,sans-serif;color:#0f172a;max-width:640px;margin:0 auto;padding:24px">
        <h2 style="margin:0 0 16px;font-size:22px;">Reset your password</h2>
        <p style="margin:0 0 12px;">We received a password reset request for your account.</p>
        <p style="margin:0 0 20px;">
          Use the link below to set a new password:
        </p>
        <p style="margin:0 0 24px;">
          <a href="${setupLink}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:999px;font-weight:700;">
            Reset Password
          </a>
        </p>
        <p style="margin:0;color:#475569;font-size:14px;">
          Link: <a href="${setupLink}">${setupLink}</a>
        </p>
      </div>
    `,
  };

  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(emailPayload),
    cache: "no-store",
  });

  const resendBody = await resendResponse.json().catch(() => ({}));
  const supabase = createServiceSupabaseClient();
  if (!resendResponse.ok) {
    try {
      await logEmailDelivery(supabase);
    } catch {
      // ignore logging errors
    }
    return NextResponse.json(
      { ok: false, error: resendBody?.message || resendBody?.error || "Failed to send recovery email" },
      { status: 502 }
    );
  }

  try {
    await logEmailDelivery(supabase);
  } catch {
    // ignore logging errors
  }

  const resolved = await resolveRecoveryRequest(id);
  return NextResponse.json(
    { ok: true, request: resolved, setupLink, providerMessageId: resendBody?.id || null },
    { status: 200 }
  );
}

export async function DELETE(request, { params }) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const requestId = Number(id);
  if (!Number.isFinite(requestId)) {
    return NextResponse.json({ ok: false, error: "Invalid request id." }, { status: 400 });
  }

  await deleteRecoveryRequest(requestId);
  return NextResponse.json({ ok: true }, { status: 200 });
}
