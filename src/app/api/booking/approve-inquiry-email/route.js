import { NextResponse } from "next/server";
import { logEmailDelivery } from "@/lib/emailTracking";
import { createServiceSupabaseClient } from "@/lib/server/serviceSupabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function buildBaseUrl(request) {
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const forwardedHost = request.headers.get("x-forwarded-host");
  if (forwardedProto && forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }
  return request.nextUrl.origin;
}

function buildHtml({ recipientName, resortName, ticketUrl, expiresAt }) {
  return `
    <div style="font-family:Arial,sans-serif;color:#0f172a;max-width:640px;margin:0 auto;padding:24px">
      <h2 style="margin:0 0 16px;font-size:24px;">Your inquiry has been approved</h2>
      <p style="margin:0 0 12px;">Hello ${recipientName || "Guest"},</p>
      <p style="margin:0 0 12px;">
        Your inquiry for <strong>${resortName || "the resort"}</strong> has been approved.
      </p>
      <p style="margin:0 0 20px;">
        Open your booking ticket here:
      </p>
      <p style="margin:0 0 24px;">
        <a href="${ticketUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:999px;font-weight:700;">
          View Booking Ticket
        </a>
      </p>
      <p style="margin:0 0 8px;color:#475569;font-size:14px;">
        Link: <a href="${ticketUrl}">${ticketUrl}</a>
      </p>
      <p style="margin:0;color:#475569;font-size:14px;">
        Access expires: ${expiresAt ? new Date(expiresAt).toLocaleString() : "Not set"}
      </p>
    </div>
  `;
}

export async function POST(request) {
  const resendApiKey = process.env.RESEND_API;
  if (!resendApiKey) {
    return NextResponse.json({ ok: false, error: "Missing RESEND_API" }, { status: 500 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const bookingId = String(body?.bookingId || "").trim();
  if (!bookingId) {
    return NextResponse.json({ ok: false, error: "bookingId is required" }, { status: 400 });
  }

  const supabase = createServiceSupabaseClient();
  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .select("id, resort_id, status, booking_form")
    .eq("id", bookingId)
    .single();

  if (bookingError || !booking) {
    return NextResponse.json({ ok: false, error: bookingError?.message || "Booking not found" }, { status: 404 });
  }

  const status = String(booking.status || booking.booking_form?.status || "");
  if (status !== "Approved Inquiry") {
    return NextResponse.json({ ok: false, error: "Booking is not in Approved Inquiry status" }, { status: 409 });
  }

  if (booking.booking_form?.approvedInquiryEmailSentAt) {
    return NextResponse.json({ ok: true, skipped: true, reason: "Already sent" }, { status: 200 });
  }

  const clientEmail = booking.booking_form?.stayingGuestEmail || booking.booking_form?.email || "";
  const agentEmail = booking.booking_form?.email || "";

  const clientToken = booking.booking_form?.ticketAccessToken;
  const agentToken = booking.booking_form?.agentTicketAccessToken;

  const clientEmailSent = !!booking.booking_form?.approvedInquiryEmailSentAtClient;
  const agentEmailSent = !!booking.booking_form?.approvedInquiryEmailSentAtAgent;

  const shouldSendClientEmail = !!clientEmail && !!clientToken && !clientEmailSent;
  const shouldSendAgentEmail = !!agentEmail && !!agentToken && !agentEmailSent;

  if (!shouldSendClientEmail && !shouldSendAgentEmail) {
    return NextResponse.json({ ok: true, skipped: true, reason: "Already sent" }, { status: 200 });
  }

  const { data: resort } = await supabase
    .from("resorts")
    .select("id, name")
    .eq("id", Number(booking.resort_id))
    .maybeSingle();

  const baseUrl = buildBaseUrl(request);

  const sendEmail = async (email, token, role) => {
    const ticketUrl = `${baseUrl}/ticket/${booking.id}${token ? `?token=${encodeURIComponent(token)}` : ""}`;
    const expiresAt = role === "agent" ? booking.booking_form?.agentTicketAccessExpiresAt : booking.booking_form?.ticketAccessExpiresAt;

    const recipientName =
      role === "agent"
        ? booking.booking_form?.agentName || booking.booking_form?.guestName || "Agent"
        : booking.booking_form?.stayingGuestName || booking.booking_form?.guestName || "Guest";

    const payload = {
      from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
      to: [email],
      subject: `Inquiry approved${resort?.name ? ` - ${resort.name}` : ""}`,
      html: buildHtml({
        recipientName,
        resortName: resort?.name,
        ticketUrl,
        expiresAt,
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

    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(body?.message || body?.error || "Failed to send email");
    }
    return body?.id || null;
  };

  const nowIso = new Date().toISOString();
  const updates = {
    ...(booking.booking_form || {}),
  };
  if (shouldSendClientEmail) updates.approvedInquiryEmailSentAtClient = nowIso;
  if (shouldSendAgentEmail) updates.approvedInquiryEmailSentAtAgent = nowIso;

  let providerMessageId = null;

  try {
    if (shouldSendClientEmail) {
      providerMessageId = await sendEmail(clientEmail, clientToken, "client");
    }
    if (shouldSendAgentEmail) {
      // Send separately even if it’s the same email address.
      providerMessageId = await sendEmail(agentEmail, agentToken, "agent");
    }

    await supabase
      .from("bookings")
      .update({ booking_form: updates })
      .eq("id", booking.id);

    try {
      await logEmailDelivery(supabase);
    } catch {
      // Do not fail successful email delivery because analytics logging is missing.
    }

    return NextResponse.json({ ok: true, providerMessageId }, { status: 200 });
  } catch (error) {
    try {
      await logEmailDelivery(supabase);
    } catch {
      // Keep email failure as primary error.
    }
    return NextResponse.json({ ok: false, error: error.message || String(error) }, { status: 502 });
  }
}
