import { isCheckoutOverdueRow } from "@/lib/bookingDateTime";
import { createServiceSupabaseClient } from "@/lib/server/serviceSupabase";
import { isCheckoutOverdueRow } from "@/lib/bookingDateTime";

const BOOKING_AUTOMATION_COLUMNS = [
  "id",
  "status",
  "end_date",
  "start_date",
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
    .lte("end_date", todayIsoDate)
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
    return shouldAutoMoveToPendingCheckout(status) && isCheckoutOverdueRow(row, nowMs);
  });

  let cancelled = 0;
  let movedToCheckout = 0;
  const failed = [];

  for (const row of paymentExpired) {
    const nextBookingForm = {
      ...(row.booking_form || {}),
      status: "Cancelled",
      autoCancelledAt: nowIso,
      cancellationReason: "Payment deadline expired",
    };
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
    movedToCheckout += 1;
  }

  return {
    scanned: Number((paymentRows || []).length + (checkoutRows || []).length),
    paymentExpired: Number(paymentExpired.length),
    overdueCheckout: Number(overdueCheckout.length),
    cancelled,
    movedToCheckout,
    failed,
    runAt: nowIso,
  };
}
