import { overlapsByDateTime } from "@/lib/bookingDateTime";

export function normalizeDateInput(value) {
  if (!value) return null;
  if (typeof value === "string") return value.slice(0, 10);
  if (!(value instanceof Date)) return null;
  const local = new Date(value.getTime() - value.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

export function normalizeRoomIds(roomIds) {
  if (!Array.isArray(roomIds)) return [];
  return roomIds.map((id) => id?.toString()).filter(Boolean);
}

export function isBlockingStatus(status) {
  const normalized = String(status || "").toLowerCase();
  return (
    normalized.includes("confirm") ||
    normalized.includes("ongoing") ||
    normalized.includes("pending checkout")
  );
}

export function buildRequestedRange({ startDate, endDate, checkInTime, checkOutTime }) {
  const start = normalizeDateInput(startDate);
  const end = normalizeDateInput(endDate);
  if (!start || !end) return null;
  return {
    startDate: start,
    endDate: end,
    checkInTime: checkInTime || "12:00",
    checkOutTime: checkOutTime || "17:00",
  };
}

export function toBookingRange(bookingRow) {
  return {
    startDate: bookingRow.start_date,
    endDate: bookingRow.end_date || bookingRow.start_date,
    checkInTime: bookingRow.check_in_time || bookingRow.booking_form?.checkInTime || "12:00",
    checkOutTime: bookingRow.check_out_time || bookingRow.booking_form?.checkOutTime || "17:00",
    bookingForm: bookingRow.booking_form || {},
  };
}

export function getUnavailableRoomIds(bookings, requestedRange, resortRoomIds = []) {
  if (!requestedRange) return new Set();
  const blocked = new Set();
  const overlappingRows = (bookings || []).filter((row) => {
    if (!isBlockingStatus(row.status || row.booking_form?.status)) return;
    const overlaps = overlapsByDateTime(toBookingRange(row), requestedRange);
    return overlaps;
  });
  if (overlappingRows.length === 0) return blocked;

  if (Array.isArray(resortRoomIds) && resortRoomIds.length > 0) {
    resortRoomIds.map((id) => id?.toString()).filter(Boolean).forEach((id) => blocked.add(id));
    return blocked;
  }

  overlappingRows.forEach((row) => {
    normalizeRoomIds(row.room_ids).forEach((id) => blocked.add(id));
  });
  return blocked;
}
