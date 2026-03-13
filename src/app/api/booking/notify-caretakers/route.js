import { NextResponse } from "next/server";
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

function buildCaretakerMessage({ booking, resortName, ticketUrl }) {
  const form = booking.booking_form || {};
  const guestName = form.guestName || "Guest";
  const entryCode = form.confirmationStub?.code || "Pending";
  const checkInDate = form.checkInDate || booking.start_date || "TBD";
  const checkOutDate = form.checkOutDate || booking.end_date || checkInDate || "TBD";
  const stayRange = [checkInDate, checkOutDate].filter(Boolean).join(" to ") || "Dates pending";
  return [
    `Confirmed stay for booking ${booking.id} at ${resortName || "resort"}.`,
    `Guest: ${guestName}.`,
    `Entry Code: ${entryCode}.`,
    `Stay: ${stayRange}.`,
    ticketUrl ? `Ticket: ${ticketUrl}` : null,
  ]
    .filter(Boolean)
    .join(" ");
}

export async function POST(request) {
  const apiKey = process.env.SEMAPHORE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ ok: false, error: "Missing SEMAPHORE_API_KEY" }, { status: 500 });
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
    .select("id, resort_id, start_date, end_date, booking_form")
    .eq("id", bookingId)
    .single();

  if (bookingError || !booking) {
    return NextResponse.json({ ok: false, error: bookingError?.message || "Booking not found" }, { status: 404 });
  }

  const { data: resort } = await supabase
    .from("resorts")
    .select("id, name")
    .eq("id", Number(booking.resort_id))
    .maybeSingle();

  const { data: caretakers, error: caretakersError } = await supabase
    .from("resort_caretakers")
    .select("id, name, phone")
    .eq("resort_id", Number(booking.resort_id));

  if (caretakersError) {
    return NextResponse.json({ ok: false, error: caretakersError.message }, { status: 500 });
  }

  const ticketToken = booking.booking_form?.ticketAccessToken;
  const ticketUrl = `${buildBaseUrl(request)}/ticket/${booking.id}${
    ticketToken ? `?token=${encodeURIComponent(ticketToken)}` : ""
  }`;
  const message = buildCaretakerMessage({
    booking,
    resortName: resort?.name,
    ticketUrl,
  });

  const senderName = process.env.SEMAPHORE_SENDER_NAME;
  const recipients = (caretakers || [])
    .map((entry) => String(entry.phone || "").trim())
    .filter(Boolean);

  if (recipients.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, skipped: "No caretakers with phone numbers" }, { status: 200 });
  }

  const results = await Promise.all(
    recipients.map(async (number) => {
      const params = new URLSearchParams();
      params.append("apikey", apiKey);
      params.append("number", number);
      params.append("message", message);
      if (senderName) params.append("sendername", senderName);

      const response = await fetch("https://api.semaphore.co/api/v4/messages", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
        cache: "no-store",
      });

      const body = await response.json().catch(() => ({}));
      return {
        number,
        ok: response.ok,
        response: body,
      };
    })
  );

  const sent = results.filter((entry) => entry.ok).length;
  const failed = results.filter((entry) => !entry.ok);

  return NextResponse.json({ ok: true, sent, failed }, { status: 200 });
}
