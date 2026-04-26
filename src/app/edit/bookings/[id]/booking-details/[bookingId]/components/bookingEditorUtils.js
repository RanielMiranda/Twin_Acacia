import { resolveDownpaymentRequirement } from "@/lib/bookingPayments";

export function buildDraftFromBooking(booking) {
  const form = booking.bookingForm || {};
  const adults = Number(booking.adultCount ?? form.adultCount ?? 0);
  const children = Number(booking.childrenCount ?? form.childrenCount ?? 0);
  const derivedPax = Number(
    (booking.pax ?? form.guestCount ?? form.pax ?? (adults + children)) || 0
  );
  const sleepingGuests = Number(booking.sleepingGuests ?? form.sleepingGuests ?? 0);
  const roomCount = Number(
    booking.roomCount ?? form.roomCount ?? booking.roomIds?.length ?? 1
  );
  const totalAmount = Number(booking.totalAmount ?? form.totalAmount ?? 0);
  const downpaymentRequirement = resolveDownpaymentRequirement({
    bookingForm: form,
    totalAmount,
    resortDownpaymentPercentage: 0,
  });
  const paymentVerified = !!form.paymentVerified;
  const paymentPendingApproval = !!form.paymentPendingApproval && !paymentVerified;
  const pendingDownpayment = paymentPendingApproval ? Number(form.pendingDownpayment || 0) : 0;
  const pendingPaymentMethod = paymentPendingApproval ? form.pendingPaymentMethod || null : null;
  const pendingPaymentNote = paymentPendingApproval ? form.pendingPaymentNote || "" : form.pendingPaymentNote || "";
  const roomNameFromAssigned =
    (form.assignedRoomNames || []).length > 0
      ? form.assignedRoomNames.join(", ")
      : (form.roomName || "");

  const inquirerType = (form.inquirerType || booking.inquirerType || "client").toString().toLowerCase();

  // `email` / `phoneNumber` should always reflect the inquirer (agent vs client).
  // Prioritize the canonical `email`/`phoneNumber` fields first, but fall back to legacy fields
  // for backwards compatibility with older bookings.
  const agentContactEmail = form.agentEmail || form.agentContactEmail || "";
  const agentContactPhone = form.agentPhone || form.agentContactPhone || "";
  const guestContactEmail = form.stayingGuestEmail || form.guestEmail || "";
  const guestContactPhone = form.stayingGuestPhone || form.guestPhone || "";

  const contactEmail =
    inquirerType === "agent"
      ? form.email || agentContactEmail
      : form.email || guestContactEmail;
  const contactPhone =
    inquirerType === "agent"
      ? form.phoneNumber || agentContactPhone
      : form.phoneNumber || guestContactPhone;

  const baseStatus = form.status || booking.status || "Inquiry";
  const paymentDeadline =
    form.paymentDeadline ||
    (String(baseStatus).toLowerCase() === "pending checkout" ? form.checkoutPaymentDeadline : null) ||
    booking.paymentDeadline ||
    null;

  return {
    ...form,
    status: baseStatus,
    inquirerType,
    guestName: form.guestName || "Guest",
    email: contactEmail,
    phoneNumber: contactPhone,
    stayingGuestName:
      form.stayingGuestName || (inquirerType === "client" ? form.guestName || "Guest" : ""),
    stayingGuestEmail:
      form.stayingGuestEmail || (inquirerType === "client" ? contactEmail : ""),
    stayingGuestPhone:
      form.stayingGuestPhone || (inquirerType === "client" ? contactPhone : ""),
    address: form.address || "",
    adultCount: adults,
    childrenCount: children,
    guestCount: derivedPax,
    roomCount,
    roomName: roomNameFromAssigned,
    sleepingGuests,
    checkInDate: form.checkInDate || booking.startDate || "",
    checkOutDate: form.checkOutDate || booking.endDate || "",
    checkInTime: form.checkInTime || booking.checkInTime || "12:00",
    checkOutTime: form.checkOutTime || booking.checkOutTime || "17:00",
    paymentMethod: form.paymentMethod || "Pending",
    downpayment: Number(form.downpayment || 0),
    downpaymentRequiredAmount: downpaymentRequirement.requiredAmount,
    downpaymentRequirementSource: downpaymentRequirement.source,
    pendingDownpayment,
    pendingPaymentMethod,
    pendingPaymentNote,
    paymentPendingApproval,
    totalAmount,
    paymentDeadline,
    paymentProofLog: Array.isArray(form.paymentProofLog) ? form.paymentProofLog : [],
    paymentSubmittedAt: form.paymentSubmittedAt || null,
    paymentVerified,
    paymentVerifiedAt: form.paymentVerifiedAt || null,
    confirmationStub: form.confirmationStub || null,
    resortServices: Array.isArray(booking.resortServiceIds)
      ? booking.resortServiceIds.filter(Boolean)
      : Array.isArray(form.resortServices)
        ? form.resortServices
            .map((entry) => {
              if (entry && typeof entry === "object") return entry.id || entry.name || "";
              return entry || "";
            })
            .filter(Boolean)
        : [],
  };
}

export {
  formatWeekdayLabel,
  formatTotalStayDays,
  overlapsByDateTime,
} from "@/lib/bookingDateTime";
