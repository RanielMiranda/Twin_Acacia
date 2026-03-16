export function buildStatusAudit({
  booking,
  nextDraft,
  actorMeta,
}) {
  const bookingAudit = Array.isArray(booking.bookingForm?.statusAudit)
    ? booking.bookingForm.statusAudit
    : [];
  const draftAudit = Array.isArray(nextDraft.statusAudit)
    ? nextDraft.statusAudit
    : [];
  const currentAudit = draftAudit.length > 0 ? draftAudit : bookingAudit;
  const lastAudit = currentAudit[currentAudit.length - 1];
  const previousStatus = lastAudit?.to || booking.bookingForm?.status || booking.status || null;
  const nextStatus = nextDraft.status || previousStatus || "Inquiry";

  if (!previousStatus || !nextStatus || previousStatus === nextStatus) {
    return currentAudit;
  }

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

  const normalizedInquirerType = String(nextDraft.inquirerType || booking.bookingForm?.inquirerType || booking.inquirerType || "client").toLowerCase();
  const sanitizedDraft = {
    ...nextDraft,
    agentName: normalizedInquirerType === "agent" ? nextDraft.agentName || "" : "",
    agentEmail: normalizedInquirerType === "agent" ? nextDraft.agentEmail || "" : "",
    agentPhone: normalizedInquirerType === "agent" ? nextDraft.agentPhone || "" : "",
    agentContactEmail: normalizedInquirerType === "agent" ? nextDraft.agentContactEmail || "" : "",
    agentContactPhone: normalizedInquirerType === "agent" ? nextDraft.agentContactPhone || "" : "",
  };

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
      ...sanitizedDraft,
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
