import { overlapsByDateTime } from "../bookingEditorUtils";

function isBlockingStatus(status) {
  const normalized = String(status || "").toLowerCase();
  return normalized.includes("confirm") || normalized.includes("ongoing");
}

export function resolveApprovedByName({ bookingFormAudits = [], dbAudits = [] }) {
  const approvalAuditFromDb = dbAudits.find((entry) => {
    const next = String(entry?.new_status || "").toLowerCase();
    return next.includes("confirmed") || next.includes("approved inquiry");
  });

  const approvalAuditFromForm = [...bookingFormAudits].reverse().find((entry) => {
    const next = String(entry?.to || "").toLowerCase();
    return next.includes("confirmed") || next.includes("approved inquiry");
  });

  return (
    approvalAuditFromForm?.actorName ||
    approvalAuditFromDb?.actor_name ||
    "Not approved yet"
  );
}

export function isRoomConflictingForBooking({
  roomId,
  booking,
  draft,
  allBookings = [],
}) {
  void roomId;
  const probe = {
    id: booking.id,
    startDate: draft.checkInDate || booking.startDate,
    endDate: draft.checkOutDate || booking.endDate || draft.checkInDate || booking.startDate,
    checkInTime: draft.checkInTime || booking.checkInTime,
    checkOutTime: draft.checkOutTime || booking.checkOutTime,
    bookingForm: {
      checkInTime: draft.checkInTime || booking.checkInTime,
      checkOutTime: draft.checkOutTime || booking.checkOutTime,
    },
  };

  return (allBookings || []).some((entry) => {
    if (entry.id?.toString() === booking.id?.toString()) return false;
    if (!isBlockingStatus(entry.status || entry.bookingForm?.status)) return false;
    return overlapsByDateTime(entry, probe);
  });
}
