export const isMissingSupportTableError = (error) =>
  !!error?.message &&
  (error.message.includes("Could not find the table") ||
    error.message.includes("does not exist") ||
    error.message.includes("schema cache"));

export const toSafeSegment = (value) =>
  String(value || "unknown")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_\s]/g, "")
    .replace(/\s+/g, "-");

export const buildStayInfoPayload = (booking, form, resort) => {
  if (!booking || !form) return null;

  const statusAuditEntries = Array.isArray(form.statusAudit) ? form.statusAudit : [];
  const latestApprovalAudit = [...statusAuditEntries].reverse().find((entry) => {
    const toStatus = String(entry?.to || "").toLowerCase();
    return toStatus.includes("approved inquiry") || toStatus.includes("confirmed");
  });
  const approvedByName =
    latestApprovalAudit?.actorName || latestApprovalAudit?.actorRole || latestApprovalAudit?.actor || "Not approved yet";
  const assignedRoomNames =
    (form.assignedRoomNames && form.assignedRoomNames.length > 0
      ? form.assignedRoomNames
      : (booking.room_ids || [])
          ?.map((roomId) => (resort?.rooms || []).find((room) => room.id === roomId)?.name)
          .filter(Boolean)) || [];

  return { approvedByName, assignedRoomNames };
};
