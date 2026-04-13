import { NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/server/serviceSupabase";
import { getSessionFromRequest } from "@/lib/server/session";
import { isTicketTokenValid } from "@/lib/ticketAccess";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BOOKING_COLUMNS = [
  "id",
  "resort_id",
  "status",
  "start_date",
  "end_date",
  "check_in_time",
  "check_out_time",
  "payment_deadline",
  "booking_form",
].join(", ");

function shouldAutoMoveToPendingCheckout(status) {
  const normalized = String(status || "").toLowerCase();
  const isConfirmedStay = normalized.includes("confirm") || normalized.includes("ongoing");
  if (!isConfirmedStay) return false;
  if (normalized.includes("pending checkout")) return false;
  if (normalized.includes("checked out")) return false;
  if (normalized.includes("cancel")) return false;
  if (normalized.includes("declin")) return false;
  return true;
}

function shouldAutoMoveToOngoing(status) {
  const normalized = String(status || "").toLowerCase();
  if (!normalized.includes("confirm")) return false;
  if (normalized.includes("pending checkout")) return false;
  if (normalized.includes("checked out")) return false;
  if (normalized.includes("cancel")) return false;
  if (normalized.includes("declin")) return false;
  if (normalized.includes("ongoing")) return false;
  return true;
}

function shouldAutoCancelForPayment(status) {
  const normalized = String(status || "").toLowerCase();
  if (!normalized.includes("pending payment")) return false;
  if (normalized.includes("cancel")) return false;
  if (normalized.includes("declin")) return false;
  return true;
}

function isPastDeadline(deadline, nowMs) {
  if (!deadline) return false;
  const date = new Date(deadline);
  if (Number.isNaN(date.getTime())) return false;
  return date.getTime() < nowMs;
}

function buildDateTimeMs(dateStr, timeStr) {
  if (!dateStr) return null;
  const safeTime = timeStr || "00:00";
  const [hh, mm] = safeTime.split(":").map((part) => Number(part || 0));
  const date = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(Number.isFinite(hh) ? hh : 0, Number.isFinite(mm) ? mm : 0, 0, 0);
  return date.getTime();
}

function resolveStayDates(row) {
  const form = row.booking_form || {};
  const startDate = row.start_date || form.checkInDate || null;
  const endDate = row.end_date || form.checkOutDate || null;
  const checkInTime = row.check_in_time || form.checkInTime || null;
  const checkOutTime = row.check_out_time || form.checkOutTime || null;
  return { startDate, endDate, checkInTime, checkOutTime };
}

function withAutomationActor(nextForm) {
  return {
    ...nextForm,
    lastActionRole: "system",
    lastActionBy: "System automation",
  };
}

function computeStatusUpdate(row, nowMs) {
  const status = row.status || row.booking_form?.status || "";
  const form = row.booking_form || {};

  const unpaid = Number(form.downpayment || 0) <= 0;
  const deadline = row.payment_deadline || form.paymentDeadline || null;

  if (unpaid && shouldAutoCancelForPayment(status) && isPastDeadline(deadline, nowMs)) {
    const nextForm = withAutomationActor({
      ...form,
      status: "Cancelled",
      autoCancelledAt: new Date(nowMs).toISOString(),
      cancellationReason: "Payment deadline expired",
    });
    return {
      status: "Cancelled",
      booking_form: nextForm,
      payment_deadline: row.payment_deadline || form.paymentDeadline || null,
    };
  }

  if (shouldAutoMoveToPendingCheckout(status)) {
    const { endDate, checkOutTime } = resolveStayDates(row);
    const checkoutMs = buildDateTimeMs(endDate, checkOutTime || "17:00");
    if (checkoutMs && checkoutMs <= nowMs) {
      const nextForm = withAutomationActor({
        ...form,
        status: "Pending Checkout",
        autoPendingCheckoutAt: new Date(nowMs).toISOString(),
      });
      return { status: "Pending Checkout", booking_form: nextForm };
    }
  }

  if (shouldAutoMoveToOngoing(status)) {
    const { startDate, checkInTime } = resolveStayDates(row);
    const todayIsoDate = new Date(nowMs).toISOString().slice(0, 10);
    const startOfTodayMs = buildDateTimeMs(todayIsoDate, "00:00");
    const endOfTodayMs = buildDateTimeMs(todayIsoDate, "23:59");
    const checkinMs = buildDateTimeMs(startDate, checkInTime || "00:00");
    if (checkinMs && checkinMs >= startOfTodayMs && checkinMs <= endOfTodayMs) {
      const nextForm = withAutomationActor({
        ...form,
        status: "Ongoing",
        autoOngoingAt: new Date(nowMs).toISOString(),
      });
      return { status: "Ongoing", booking_form: nextForm };
    }
  }

  return null;
}

async function assertAuthorized({ request, bookingId, token, resortId }) {
  const session = await getSessionFromRequest(request);
  if (session && ["admin", "owner"].includes(String(session.role || "").toLowerCase())) {
    if (resortId) {
      const supabase = createServiceSupabaseClient();
      if (String(session.role || "").toLowerCase() === "owner") {
        const { data: account } = await supabase
          .from("accounts")
          .select("id, resort_id")
          .eq("id", Number(session.accountId || 0))
          .maybeSingle();
        if (account?.resort_id && Number(account.resort_id) !== Number(resortId)) {
          throw new Error("Unauthorized");
        }
      }
    }
    return { ok: true };
  }

  if (bookingId && token) {
    const supabase = createServiceSupabaseClient();
    const { data: booking } = await supabase
      .from("bookings")
      .select("id, booking_form")
      .eq("id", bookingId)
      .maybeSingle();
    if (!booking || !isTicketTokenValid(booking.booking_form || {}, token)) {
      throw new Error("Unauthorized");
    }
    return { ok: true };
  }

  throw new Error("Unauthorized");
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const bookingId = String(body?.bookingId || "").trim() || null;
  const resortId = body?.resortId ? Number(body.resortId) : null;
  const token = String(body?.token || "").trim() || null;

  if (!bookingId && !resortId) {
    return NextResponse.json({ ok: false, error: "bookingId or resortId is required" }, { status: 400 });
  }

  try {
    await assertAuthorized({ request, bookingId, token, resortId });
  } catch {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceSupabaseClient();
  const nowMs = Date.now();
  let rows = [];

  try {
    if (bookingId) {
      const { data, error } = await supabase
        .from("bookings")
        .select(BOOKING_COLUMNS)
        .eq("id", bookingId)
        .limit(1);
      if (error) throw error;
      rows = data || [];
    } else if (resortId) {
      const { data, error } = await supabase
        .from("bookings")
        .select(BOOKING_COLUMNS)
        .eq("resort_id", resortId)
        .limit(500);
      if (error) throw error;
      rows = data || [];
    }
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message || "Failed to load bookings" }, { status: 500 });
  }

  let updated = 0;
  const failed = [];

  for (const row of rows) {
    const update = computeStatusUpdate(row, nowMs);
    if (!update) continue;
    const { error } = await supabase
      .from("bookings")
      .update(update)
      .eq("id", row.id);
    if (error) {
      failed.push({ id: row.id, error: error.message });
    } else {
      updated += 1;
    }
  }

  return NextResponse.json({ ok: true, updated, failed }, { status: 200 });
}
