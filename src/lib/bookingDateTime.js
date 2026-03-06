export function toDateTimeMs(dateValue, timeValue, fallbackTime = "00:00") {
  if (!dateValue) return null;
  const safeTime = (timeValue || fallbackTime).slice(0, 5);
  const parsed = new Date(`${dateValue}T${safeTime}:00`);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.getTime();
}

export function overlapsByDateTime(a, b) {
  const startA = toDateTimeMs(a.startDate, a.checkInTime || a.bookingForm?.checkInTime, "00:00");
  const endA = toDateTimeMs(a.endDate || a.startDate, a.checkOutTime || a.bookingForm?.checkOutTime, "23:59");
  const startB = toDateTimeMs(b.startDate, b.checkInTime || b.bookingForm?.checkInTime, "00:00");
  const endB = toDateTimeMs(b.endDate || b.startDate, b.checkOutTime || b.bookingForm?.checkOutTime, "23:59");
  if ([startA, endA, startB, endB].some((value) => value === null)) return false;
  return startA < endB && startB < endA;
}

export function formatWeekdayLabel(dateValue) {
  if (!dateValue) return "No date selected";
  const parsed = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return "Invalid date";
  return parsed.toLocaleDateString(undefined, { weekday: "long" });
}

export function formatTotalStayDays(checkInDate, checkOutDate) {
  if (!checkInDate || !checkOutDate) return "Not set";
  const start = new Date(`${checkInDate}T00:00:00`);
  const end = new Date(`${checkOutDate}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return "Invalid date";
  const diffDays = Math.floor((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
  if (diffDays < 0) return "Invalid range";
  const totalDays = diffDays === 0 ? 1 : diffDays;
  return `${totalDays} day${totalDays > 1 ? "s" : ""}`;
}

export function isCheckoutOverdueRow(row, nowMs = Date.now()) {
  const checkoutDate = row.end_date || row.start_date || row.booking_form?.checkOutDate || row.booking_form?.checkInDate;
  const checkoutTime = row.check_out_time || row.booking_form?.checkOutTime || "11:00";
  const checkoutMs = toDateTimeMs(checkoutDate, checkoutTime, "23:59");
  if (checkoutMs === null) return false;
  return checkoutMs < nowMs;
}
