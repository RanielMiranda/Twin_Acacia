import { supabase } from "@/lib/supabase";

export async function notifyCaretakerOnPaymentApproval({
  bookingId,
  resortId,
  guestName,
  amount,
  method,
}) {
  const message = `Payment approved for booking ${bookingId}. Guest: ${guestName || "Guest"}, Amount: PHP ${Number(amount || 0).toLocaleString()}, Method: ${method || "Pending"}.`;
  // Hook point for future SMS/email integration.
  console.info("[CaretakerHook]", message);

  try {
    await supabase.from("ticket_messages").insert({
      booking_id: bookingId,
      resort_id: resortId || null,
      sender_role: "admin",
      sender_name: "Caretaker Hook",
      message,
    });
  } catch {
    // Silent fallback; table permissions may vary per environment.
  }
}
