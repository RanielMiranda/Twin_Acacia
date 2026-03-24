import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function buildHtml({ name, email, message }) {
  return `
    <div style="font-family:Arial,sans-serif;color:#0f172a;max-width:640px;margin:0 auto;padding:24px">
      <h2 style="margin:0 0 16px;font-size:24px;">New contact message</h2>
      <p style="margin:0 0 8px;"><strong>Name:</strong> ${name || "Anonymous"}</p>
      <p style="margin:0 0 8px;"><strong>Email:</strong> ${email || "Not provided"}</p>
      <p style="margin:16px 0 8px;"><strong>Message:</strong></p>
      <p style="margin:0;white-space:pre-wrap;">${message || ""}</p>
    </div>
  `;
}

export async function POST(request) {
  const resendApiKey = process.env.RESEND_API;
  if (!resendApiKey) {
    return NextResponse.json({ ok: false, error: "Missing RESEND_API" }, { status: 500 });
  }
  const adminEmail = String(process.env.ADMIN_CONTACT_EMAIL || "").trim();
  if (!adminEmail) {
    return NextResponse.json({ ok: false, error: "Missing ADMIN_CONTACT_EMAIL" }, { status: 500 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const name = String(body?.name || "").trim();
  const email = String(body?.email || "").trim();
  const message = String(body?.message || "").trim();
  if (!message) {
    return NextResponse.json({ ok: false, error: "Message is required" }, { status: 400 });
  }

  const payload = {
    from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
    to: [adminEmail],
    subject: `Contact form message${name ? ` from ${name}` : ""}`,
    reply_to: email || undefined,
    html: buildHtml({ name, email, message }),
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

  const responseBody = await response.json().catch(() => ({}));
  if (!response.ok) {
    return NextResponse.json(
      { ok: false, error: responseBody?.message || responseBody?.error || "Failed to send contact email" },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true, providerMessageId: responseBody?.id || null }, { status: 200 });
}
