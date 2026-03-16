export const getContactMeta = (item) => {
  const form = item.bookingForm || {};
  const inquirerType = (item.inquirerType || form.inquirerType || "client").toString().toLowerCase();
  const guestEmail = form.stayingGuestEmail || form.guestEmail || form.email || "";
  const guestPhone = form.guestPhone || form.phoneNumber || "";
  const agentEmail = form.agentEmail || form.agentContactEmail || "";
  const agentPhone = form.agentPhone || form.agentContactPhone || "";
  return {
    inquirerType,
    guestEmail,
    guestPhone,
    agentEmail: inquirerType === "agent" ? agentEmail : "",
    agentPhone: inquirerType === "agent" ? agentPhone : "",
  };
};

export const getPaxSummary = (item) => {
  const form = item.bookingForm || {};
  const adultCount = Number(item.adultCount ?? form.adultCount ?? 0);
  const childrenCount = Number(item.childrenCount ?? form.childrenCount ?? 0);
  const sleepingGuests = Number(item.sleepingGuests ?? form.sleepingGuests ?? 0);
  const paxTotal = adultCount + childrenCount;
  return { adultCount, childrenCount, sleepingGuests, paxTotal };
};

export const getDateTimeParts = (item) => {
  const form = item.bookingForm || {};
  const checkInDate = item.startDate || form.checkInDate || "-";
  const checkOutDate = item.endDate || form.checkOutDate || "-";
  const checkInTime = item.checkInTime || form.checkInTime || "--:--";
  const checkOutTime = item.checkOutTime || form.checkOutTime || "--:--";
  return { checkInDate, checkOutDate, checkInTime, checkOutTime };
};
