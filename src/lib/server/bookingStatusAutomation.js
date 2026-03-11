import { createServiceSupabaseClient } from "@/lib/server/serviceSupabase";
import { isCheckoutOverdueRow } from "@/lib/bookingDateTime";

const BOOKING_AUTOMATION_COLUMNS = [
  "id",
  "status",
  "end_date",
  "start_date",
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

export async function runPendingCheckoutAutomation({ limit = 500, nowMs = Date.now() } = {}) {
  const supabase = createServiceSupabaseClient();
  const nowIso = new Date(nowMs).toISOString();
  const todayIsoDate = nowIso.slice(0, 10);

  const { data, error } = await supabase
    .from("bookings")
    .select(BOOKING_AUTOMATION_COLUMNS)
    .lte("end_date", todayIsoDate)
    .limit(Math.max(1, Number(limit || 500)));
  if (error) throw new Error(`Failed to fetch bookings for automation: ${error.message}`);

  const candidates = (data || []).filter((row) => {
    const status = row.status || row.booking_form?.status || "";
    return shouldAutoMoveToPendingCheckout(status) && isCheckoutOverdueRow(row, nowMs);
  });

  let updated = 0;
  const failed = [];

  for (const row of candidates) {
    const nextBookingForm = {
      ...(row.booking_form || {}),
      status: "Pending Checkout",
      autoPendingCheckoutAt: nowIso,
    };
    const { error: updateError } = await supabase
      .from("bookings")
      .update({
        status: "Pending Checkout",
        booking_form: nextBookingForm,
      })
      .eq("id", row.id)
      .not("status", "ilike", "%pending checkout%")
      .not("status", "ilike", "%checked out%")
      .not("status", "ilike", "%cancel%")
      .not("status", "ilike", "%declin%");

    if (updateError) {
      failed.push({ id: row.id, error: updateError.message });
      continue;
    }
    updated += 1;
  }

  return {
    scanned: Number(data?.length || 0),
    candidates: Number(candidates.length),
    updated,
    failed,
    runAt: nowIso,
  };
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

export async function runBookingStatusAutomation({ limit = 500, nowMs = Date.now() } = {}) {
  const supabase = createServiceSupabaseClient();
  const nowIso = new Date(nowMs).toISOString();
  const todayIsoDate = nowIso.slice(0, 10);

  const safeLimit = Math.max(1, Number(limit || 500));
  const { data: paymentRows, error: paymentError } = await supabase
    .from("bookings")
    .select(BOOKING_AUTOMATION_COLUMNS)
    .ilike("status", "%Pending Payment%")
    .limit(safeLimit);
  if (paymentError) throw new Error(`Failed to fetch pending payment bookings: ${paymentError.message}`);

  const { data: checkoutRows, error: checkoutError } = await supabase
    .from("bookings")
    .select(BOOKING_AUTOMATION_COLUMNS)
    .limit(safeLimit);
  if (checkoutError) throw new Error(`Failed to fetch checkout bookings: ${checkoutError.message}`);

  const paymentExpired = (paymentRows || []).filter((row) => {
    const status = row.status || row.booking_form?.status || "";
    const unpaid = Number(row.booking_form?.downpayment || 0) <= 0;
    const deadline = row.payment_deadline || row.booking_form?.paymentDeadline || null;
    return unpaid && shouldAutoCancelForPayment(status) && isPastDeadline(deadline, nowMs);
  });

  const overdueCheckout = (checkoutRows || []).filter((row) => {
    const status = row.status || row.booking_form?.status || "";
    if (!shouldAutoMoveToPendingCheckout(status)) return false;
    const { endDate, checkOutTime } = resolveStayDates(row);
    if (!endDate) return false;
    const checkoutMs = buildDateTimeMs(endDate, checkOutTime || "12:00");
    if (!checkoutMs) return false;
    return checkoutMs <= nowMs;
  });

  const startOfTodayMs = buildDateTimeMs(todayIsoDate, "00:00");
  const endOfTodayMs = buildDateTimeMs(todayIsoDate, "23:59");
  const shouldOngoing = (checkoutRows || []).filter((row) => {
    const status = row.status || row.booking_form?.status || "";
    if (!shouldAutoMoveToOngoing(status)) return false;
    const { startDate, checkInTime } = resolveStayDates(row);
    if (!startDate) return false;
    const checkinMs = buildDateTimeMs(startDate, checkInTime || "00:00");
    if (!checkinMs) return false;
    return checkinMs >= startOfTodayMs && checkinMs <= endOfTodayMs;
  });

  let cancelled = 0;
  let movedToCheckout = 0;
  let movedToOngoing = 0;
  const failed = [];

  for (const row of paymentExpired) {
    const nextBookingForm = withAutomationActor({
      ...(row.booking_form || {}),
      status: "Cancelled",
      autoCancelledAt: nowIso,
      cancellationReason: "Payment deadline expired",
    });
    const { error: updateError } = await supabase
      .from("bookings")
      .update({
        status: "Cancelled",
        payment_deadline: row.payment_deadline || row.booking_form?.paymentDeadline || null,
        booking_form: nextBookingForm,
      })
      .eq("id", row.id)
      .not("status", "ilike", "%cancel%")
      .not("status", "ilike", "%declin%");

    if (updateError) {
      failed.push({ id: row.id, error: updateError.message });
      continue;
    }
    cancelled += 1;
  }

  for (const row of overdueCheckout) {
    const nextBookingForm = withAutomationActor({
      ...(row.booking_form || {}),
      status: "Pending Checkout",
      autoPendingCheckoutAt: nowIso,
    });
    const { error: updateError } = await supabase
      .from("bookings")
      .update({
        status: "Pending Checkout",
        booking_form: nextBookingForm,
      })
      .eq("id", row.id)
      .not("status", "ilike", "%pending checkout%")
      .not("status", "ilike", "%checked out%")
      .not("status", "ilike", "%cancel%")
      .not("status", "ilike", "%declin%");

    if (updateError) {
      failed.push({ id: row.id, error: updateError.message });
      continue;
    }
    movedToCheckout += 1;
  }

  for (const row of shouldOngoing) {
    const nextBookingForm = withAutomationActor({
      ...(row.booking_form || {}),
      status: "Ongoing",
      autoOngoingAt: nowIso,
    });
    const { error: updateError } = await supabase
      .from("bookings")
      .update({
        status: "Ongoing",
        booking_form: nextBookingForm,
      })
      .eq("id", row.id)
      .not("status", "ilike", "%pending checkout%")
      .not("status", "ilike", "%checked out%")
      .not("status", "ilike", "%cancel%")
      .not("status", "ilike", "%declin%");

    if (updateError) {
      failed.push({ id: row.id, error: updateError.message });
      continue;
    }
    movedToOngoing += 1;
  }

  return {
    scanned: Number((paymentRows || []).length + (checkoutRows || []).length),
    paymentExpired: Number(paymentExpired.length),
    overdueCheckout: Number(overdueCheckout.length),
    shouldOngoing: Number(shouldOngoing.length),
    cancelled,
    movedToCheckout,
    movedToOngoing,
    failed,
    runAt: nowIso,
  };
}
