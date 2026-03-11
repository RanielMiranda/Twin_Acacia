export function buildStatusAudit({
  booking,
  nextDraft,
  actorMeta,
}) {
  const previousStatus = booking.bookingForm?.status || booking.status || null;
  const nextStatus = nextDraft.status || previousStatus || "Inquiry";
  const currentAudit = Array.isArray(booking.bookingForm?.statusAudit)
    ? booking.bookingForm.statusAudit
    : Array.isArray(nextDraft.statusAudit)
      ? nextDraft.statusAudit
      : [];

  if (!previousStatus || !nextStatus || previousStatus === nextStatus) {
    return currentAudit;
  }

  const lastAudit = currentAudit[currentAudit.length - 1];
  if (
    lastAudit?.from === previousStatus &&
    lastAudit?.to === nextStatus &&
    lastAudit?.actorId === (actorMeta.id || "") &&
    lastAudit?.actorRole === (actorMeta.role || "owner")
  ) {
    return currentAudit;
  }

  return [
    ...currentAudit,
    {
      from: previousStatus,
      to: nextStatus,
      at: new Date().toISOString(),
      actor: "owner-ui",
      actorRole: actorMeta.role || "owner",
      actorId: actorMeta.id || "",
      actorName: actorMeta.name || "Owner",
    },
  ];
}

export function buildPersistPayload({
  booking,
  nextDraft,
  assignedRoomIds,
  resortRooms,
  actorMeta,
}) {
  const selectedRoomNames = (resortRooms || [])
    .filter((room) => (assignedRoomIds || []).includes(room.id))
    .map((room) => room.name)
    .filter(Boolean);

  const nextStatus = nextDraft.status || booking.bookingForm?.status || booking.status || "Inquiry";
  const statusAudit = buildStatusAudit({ booking, nextDraft: { ...nextDraft, status: nextStatus }, actorMeta });

  const normalizedCheckInDate = nextDraft.checkInDate || booking.startDate || "";
  const normalizedCheckOutDate =
    nextDraft.checkOutDate || booking.endDate || normalizedCheckInDate || "";

  return {
    ...booking,
    roomIds: assignedRoomIds,
    status: nextStatus,
    startDate: normalizedCheckInDate,
    endDate: normalizedCheckOutDate,
    checkInTime: nextDraft.checkInTime || booking.checkInTime,
    checkOutTime: nextDraft.checkOutTime || booking.checkOutTime,
    paymentDeadline: nextDraft.paymentDeadline || null,
    bookingForm: {
      ...(booking.bookingForm || {}),
      ...nextDraft,
      checkInDate: normalizedCheckInDate,
      checkOutDate: normalizedCheckOutDate,
      roomCount: assignedRoomIds.length || nextDraft.roomCount || booking.roomIds?.length || 1,
      roomName: selectedRoomNames.length > 0 ? selectedRoomNames.join(", ") : nextDraft.roomName || "",
      assignedRoomIds,
      assignedRoomNames: selectedRoomNames,
      statusAudit,
      lastActionBy: actorMeta.name || "Owner",
      lastActionRole: actorMeta.role || "owner",
      lastActionById: actorMeta.id || "",
    },
  };
}
