import { supabase } from "@/lib/supabase";

export async function notifyCaretakerOnPaymentApproval({
  bookingId,
  resortId,
  guestName,
  amount,
  method,
}) {
  const message = `Payment approved for booking ${bookingId}. Guest: ${guestName || "Guest"}, Amount: PHP ${Number(amount || 0).toLocaleString()}, Method: ${method || "Pending"}.`;
  return message;
}

export function buildCaretakerConfirmationMessage({
  bookingId,
  resortName,
  guestName,
  entryCode,
  checkInDate,
  checkOutDate,
}) {
  const stayRange = [checkInDate, checkOutDate].filter(Boolean).join(" to ") || "Dates pending";
  return `Confirmed stay for booking ${bookingId} at ${resortName || "resort"}. Guest: ${guestName || "Guest"}. Entry Code: ${entryCode || "Pending"}. Stay: ${stayRange}.`;
}

export async function notifyCaretakerOnBookingConfirmed(payload) {
  const message = buildCaretakerConfirmationMessage(payload);
  return message;
}
