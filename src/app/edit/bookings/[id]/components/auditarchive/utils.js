export const getContactMeta = (item) => {
  const form = item.bookingForm || {};
  const inquirerType = (item.inquirerType || form.inquirerType || "client").toString().toLowerCase();
  const guestEmail = item.stayingGuestEmail || form.stayingGuestEmail || form.email || "";
  const guestPhone = item.stayingGuestPhone || form.stayingGuestPhone || form.phoneNumber || "";
  const inquirerEmail = item.inquirerEmail || form.email || "";
  const inquirerPhone = item.inquirerPhone || form.phoneNumber || "";
  const contactEmail = inquirerType === "agent" ? inquirerEmail : guestEmail;
  const contactPhone = inquirerType === "agent" ? inquirerPhone : guestPhone;
  return {
    inquirerType,
    contactEmail,
    contactPhone,
    clientEmail: guestEmail,
    clientPhone: guestPhone,
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

export const formatDateMeta = (value) => {
  if (!value || value === "-") {
    return { dateLabel: "-", weekdayLabel: "" };
  }
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return { dateLabel: value, weekdayLabel: "" };
  }
  return {
    dateLabel: date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    weekdayLabel: date.toLocaleDateString("en-US", { weekday: "short" }),
  };
};

export const formatTime12h = (timeValue) => {
  if (!timeValue || timeValue === "--:--") return "--:--";
  const [rawHours, rawMinutes] = String(timeValue).split(":");
  const hours = Number(rawHours);
  if (!Number.isFinite(hours)) return timeValue;
  const minutes = rawMinutes ?? "00";
  const suffix = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  return `${hour12}:${minutes} ${suffix}`;
};
