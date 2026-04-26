import { buildServiceSnapshots, computeBookingTotalAmount } from "@/lib/utils";
import { resolveDownpaymentRequirement } from "@/lib/bookingPayments";

export function normalizeBookingSubmission({ resort = {}, submittedData = {} }) {
  const selectedServiceKeys = Array.isArray(submittedData.selectedServices)
    ? submittedData.selectedServices
        .map((item) => (item && typeof item === "object" ? item.id || item.name : item))
        .filter(Boolean)
    : [];

  const serviceSnapshots = buildServiceSnapshots(selectedServiceKeys, resort.extraServices || []);

  const selectedRoomIds = Array.isArray(submittedData.selectedRoomIds)
    ? submittedData.selectedRoomIds.map((id) => String(id)).filter(Boolean)
    : [];

  const resolvedRooms =
    (resort.rooms || []).filter((room) => selectedRoomIds.includes(String(room?.id))) || [];

  const fallbackRoom = (resort.rooms || []).find(
    (room) =>
      String(room?.id) === String(submittedData.roomId) ||
      room?.name === submittedData.roomName
  );

  const finalRooms = resolvedRooms.length > 0 ? resolvedRooms : fallbackRoom ? [fallbackRoom] : [];
  const resolvedRoomIds = finalRooms.map((room) => room.id).filter(Boolean);
  const resolvedRoomNames = finalRooms.map((room) => room.name).filter(Boolean);

  const adultCount = Number(submittedData.adultCount || 0);
  const childrenCount = Number(submittedData.childrenCount || 0);
  const guestCount = submittedData.guestCount != null ? Number(submittedData.guestCount) : adultCount + childrenCount;
  const pax = submittedData.pax != null ? Number(submittedData.pax) : guestCount;

  const inquirerType = submittedData.inquirerType || "client";
  const isAgent = inquirerType === "agent";

  const submittedTotal = Number(submittedData.totalAmount);
  const computedTotal = computeBookingTotalAmount({
    basePrice: resort?.price || 0,
    serviceSnapshots,
  });
  const totalAmount =
    Number.isFinite(submittedTotal) && submittedTotal > 0 ? submittedTotal : computedTotal;
  const downpaymentRequirement = resolveDownpaymentRequirement({
    bookingForm: submittedData,
    totalAmount,
    resortDownpaymentPercentage: resort?.description?.meta?.pricing?.downpaymentPercentage || 0,
  });

  const bookingForm = {
    inquirerType,
    agentName: submittedData.agentName || "",
    guestName: submittedData.guestName || "",
    adultCount,
    childrenCount,
    guestCount,
    pax,
    sleepingGuests: Number(submittedData.sleepingGuests || 0),
    ...(isAgent
      ? {
          stayingGuestName: submittedData.stayingGuestName || "",
          stayingGuestEmail: submittedData.stayingGuestEmail || "",
          stayingGuestPhone: submittedData.stayingGuestPhone || "",
        }
      : {}),
    email: submittedData.email || "",
    phoneNumber: submittedData.phoneNumber || "",
    address: submittedData.address || submittedData.area || "",
    roomName:
      resolvedRoomNames.length > 0
        ? resolvedRoomNames.join(", ")
        : submittedData.roomName || "",
    roomId: resolvedRoomIds[0] || submittedData.roomId || "",
    assignedRoomNames: resolvedRoomNames,
    assignedRoomIds: resolvedRoomIds,
    checkInDate: submittedData.checkInDate || "",
    checkOutDate: submittedData.checkOutDate || "",
    checkInTime: submittedData.checkInTime || "12:00",
    checkOutTime: submittedData.checkOutTime || "17:00",
    status: submittedData.status || "Inquiry",
    paymentMethod: submittedData.paymentMethod || "Pending",
    downpayment: Number(submittedData.downpayment || 0),
    totalAmount,
    downpaymentRequiredAmount: downpaymentRequirement.requiredAmount,
    downpaymentRequirementSource: downpaymentRequirement.source,
    resortServices: serviceSnapshots,
  };

  const bookingModel = {
    ...bookingForm,
    adultCount,
    childrenCount,
    pax,
    sleepingGuests: Number(submittedData.sleepingGuests || 0),
    roomCount: resolvedRoomIds.length || Number(submittedData.roomCount || 0) || 0,
    resortServiceIds: selectedServiceKeys.map(String),
    roomIds: resolvedRoomIds,
    startDate: submittedData.checkInDate || null,
    endDate: submittedData.checkOutDate || null,
    checkInTime: submittedData.checkInTime || "12:00",
    checkOutTime: submittedData.checkOutTime || "17:00",
    inquirerType,
  };

  const bookingRow = {
    resort_id: Number(resort.id),
    room_ids: bookingModel.roomIds,
    start_date: bookingModel.startDate,
    end_date: bookingModel.endDate,
    check_in_time: bookingModel.checkInTime,
    check_out_time: bookingModel.checkOutTime,
    status: bookingModel.status,
    adult_count: bookingModel.adultCount,
    children_count: bookingModel.childrenCount,
    pax: bookingModel.pax,
    sleeping_guests: bookingModel.sleepingGuests,
    room_count: bookingModel.roomCount,
    inquirer_type: inquirerType === "agent",
    guest_name: bookingForm.guestName || "",
    agent_name: bookingForm.agentName || "",
    staying_guest_name: bookingForm.stayingGuestName || "",
    staying_guest_email: bookingForm.stayingGuestEmail || "",
    staying_guest_phone: bookingForm.stayingGuestPhone || "",
    inquirer_email: bookingForm.email || "",
    inquirer_phone: bookingForm.phoneNumber || "",
    inquirer_address: bookingForm.address || "",
    room_name: bookingForm.roomName || "",
    resort_service_ids: bookingModel.resortServiceIds,
    booking_form: bookingForm,
  };

  return {
    bookingForm,
    bookingModel,
    bookingRow,
    serviceSnapshots,
    selectedServiceKeys,
    resolvedRoomIds,
    resolvedRoomNames,
    totalAmount: bookingForm.totalAmount,
  };
}
