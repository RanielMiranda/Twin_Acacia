import { NextResponse } from "next/server";
import { createAccountInvite, listAccounts } from "@/lib/server/accounts";
import { getSessionFromRequest } from "@/lib/server/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function ensureAdmin(session) {
  return session && session.role === "admin";
}

function buildBaseUrl(request) {
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const forwardedHost = request.headers.get("x-forwarded-host");
  if (forwardedProto && forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }
  return request.nextUrl.origin;
}

function buildInviteHtml({ recipientName, setupUrl }) {
  return `
    <div style="font-family:Arial,sans-serif;color:#0f172a;max-width:640px;margin:0 auto;padding:24px">
      <h2 style="margin:0 0 16px;font-size:24px;">Your resort account is ready</h2>
      <p style="margin:0 0 12px;">Hello ${recipientName || "there"},</p>
      <p style="margin:0 0 20px;">
        Your account has been created. Please use the link below to complete setup.
      </p>
      <p style="margin:0 0 24px;">
        <a href="${setupUrl}" style="display:inline-block;background:#16a34a;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:999px;font-weight:700;">
          Complete Account Setup
        </a>
      </p>
      <p style="margin:0 0 8px;color:#475569;font-size:14px;">
        Link: <a href="${setupUrl}">${setupUrl}</a>
      </p>
    </div>
  `;
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

  const resendApiKey = process.env.RESEND_API;
  if (!resendApiKey) {
    return NextResponse.json({ ok: false, error: "Missing RESEND_API" }, { status: 500 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const recipientEmail = String(body?.email || "").trim().toLowerCase();
  if (!recipientEmail) {
    return NextResponse.json({ ok: false, error: "Email is required" }, { status: 400 });
  }

  const setupToken = `setup-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const account = await createAccountInvite({ ...body, setupToken });
  const baseUrl = buildBaseUrl(request);
  const setupLink = `/auth/setup-resort?token=${encodeURIComponent(setupToken)}`;
  const setupUrl = `${baseUrl}${setupLink}`;

  const payload = {
    from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
    to: [recipientEmail],
    subject: "Complete your resort account setup",
    html: buildInviteHtml({
      recipientName: body?.fullName || body?.email,
      setupUrl,
    }),
  };

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const emailBody = await response.json().catch(() => ({}));
  if (!response.ok) {
    return NextResponse.json(
      { ok: false, error: emailBody?.message || emailBody?.error || "Failed to send invite email" },
      { status: 502 }
    );
  }

  return NextResponse.json(
    { ok: true, account, setupLink, emailSent: true, providerMessageId: emailBody?.id || null },
    { status: 200 }
  );
}
