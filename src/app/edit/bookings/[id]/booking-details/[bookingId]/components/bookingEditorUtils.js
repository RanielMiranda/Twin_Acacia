function normalizeProofUrls(form) {
  if (Array.isArray(form.paymentProofUrls) && form.paymentProofUrls.length > 0) {
    return form.paymentProofUrls.filter(Boolean);
  }
  if (form.paymentProofUrl) {
    return [form.paymentProofUrl];
  }
  return [];
}

export function buildDraftFromBooking(booking) {
  const form = booking.bookingForm || {};
  const adults = Number(form.adultCount || 0);
  const children = Number(form.childrenCount || 0);
  const derivedPax = Number(form.guestCount || form.pax || adults + children || 0);
  const paymentVerified = !!form.paymentVerified;
  const paymentPendingApproval = !!form.paymentPendingApproval && !paymentVerified;
  const pendingDownpayment = paymentPendingApproval ? Number(form.pendingDownpayment || 0) : 0;
  const pendingPaymentMethod = paymentPendingApproval ? form.pendingPaymentMethod || null : null;
  const paymentProofUrls = normalizeProofUrls(form);
  const roomNameFromAssigned =
    (form.assignedRoomNames || []).length > 0
      ? form.assignedRoomNames.join(", ")
      : (form.roomName || "");

  const baseStatus = form.status || booking.status || "Inquiry";
  const paymentDeadline =
    form.paymentDeadline ||
    (String(baseStatus).toLowerCase() === "pending checkout" ? form.checkoutPaymentDeadline : null) ||
    booking.paymentDeadline ||
    null;

  return {
    ...form,
    status: baseStatus,
    guestName: form.guestName || "Guest",
    email: form.email || "",
    phoneNumber: form.phoneNumber || "",
    address: form.address || "",
    adultCount: adults,
    childrenCount: children,
    guestCount: derivedPax,
    roomCount: Number(form.roomCount || booking.roomIds?.length || 1),
    roomName: roomNameFromAssigned,
    sleepingGuests: Number(form.sleepingGuests || 0),
    checkInDate: form.checkInDate || booking.startDate || "",
    checkOutDate: form.checkOutDate || booking.endDate || "",
    checkInTime: form.checkInTime || booking.checkInTime || "14:00",
    checkOutTime: form.checkOutTime || booking.checkOutTime || "11:00",
    paymentMethod: form.paymentMethod || "Pending",
    downpayment: Number(form.downpayment || 0),
    pendingDownpayment,
    pendingPaymentMethod,
    paymentPendingApproval,
    totalAmount: Number(form.totalAmount || 0),
    paymentDeadline,
    paymentProofUrl: paymentProofUrls[0] || null,
    paymentProofUrls,
    paymentSubmittedAt: form.paymentSubmittedAt || null,
    paymentVerified,
    paymentVerifiedAt: form.paymentVerifiedAt || null,
    confirmationStub: form.confirmationStub || null,
    resortServices: Array.isArray(form.resortServices) ? form.resortServices : [],
  };
}

export {
  formatWeekdayLabel,
  formatTotalStayDays,
  overlapsByDateTime,
} from "@/lib/bookingDateTime";
