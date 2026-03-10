import { isCheckinStartedRow, isCheckoutOverdueRow } from "@/lib/bookingDateTime";
import { createServiceSupabaseClient } from "@/lib/server/serviceSupabase";

const BOOKING_AUTOMATION_COLUMNS = [
  "id",
  "status",
  "end_date",
  "start_date",
  "check_out_time",
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
  if (normalized.includes("ongoing")) return false;
  if (normalized.includes("pending checkout")) return false;
  if (normalized.includes("checked out")) return false;
  if (normalized.includes("cancel")) return false;
  if (normalized.includes("declin")) return false;
  return true;
}

export async function runOngoingAutomation({ limit = 500, nowMs = Date.now() } = {}) {
  const supabase = createServiceSupabaseClient();
  const nowIso = new Date(nowMs).toISOString();
  const todayIsoDate = nowIso.slice(0, 10);

  const { data, error } = await supabase
    .from("bookings")
    .select(BOOKING_AUTOMATION_COLUMNS)
    .lte("start_date", todayIsoDate)
    .limit(Math.max(1, Number(limit || 500)));
  if (error) throw new Error(`Failed to fetch bookings for automation: ${error.message}`);

  const candidates = (data || []).filter((row) => {
    const status = row.status || row.booking_form?.status || "";
    if (!shouldAutoMoveToOngoing(status)) return false;
    if (isCheckoutOverdueRow(row, nowMs)) return false;
    return isCheckinStartedRow(row, nowMs);
  });

  let updated = 0;
  const failed = [];

  for (const row of candidates) {
    const nextBookingForm = {
      ...(row.booking_form || {}),
      status: "Ongoing",
      autoOngoingAt: nowIso,
    };
    const { error: updateError } = await supabase
      .from("bookings")
      .update({
        status: "Ongoing",
        booking_form: nextBookingForm,
      })
      .eq("id", row.id)
      .not("status", "ilike", "%ongoing%")
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
