export const BOOKING_TICKET_COLUMNS = [
  "id",
  "resort_id",
  "room_ids",
  "start_date",
  "end_date",
  "check_in_time",
  "check_out_time",
  "status",
  "booking_form",
].join(", ");

export const TICKET_MESSAGE_COLUMNS = ["id", "booking_id", "sender_role", "sender_name", "visibility", "message", "created_at"].join(", ");

export const DEFAULT_PAYMENT_METHOD = "GCash";
