"use client";

import React from "react";
import { FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";

function formatDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function buildPresetInquiryPayload(resort) {
  const today = new Date();
  const checkIn = new Date(today);
  checkIn.setDate(today.getDate() + 7);

  const checkOut = new Date(checkIn);
  checkOut.setDate(checkIn.getDate() + 1);

  const defaultRoom = Array.isArray(resort?.rooms) && resort.rooms.length > 0 ? resort.rooms[0] : null;

  return {
    inquirerType: "client",
    guestName: "Test Inquiry Guest",
    email: "test.inquiry@example.com",
    phoneNumber: "09171234567",
    address: "Calamba, Laguna",
    adultCount: 2,
    childrenCount: 0,
    guestCount: 2,
    pax: 2,
    sleepingGuests: 0,
    checkInDate: formatDate(checkIn),
    checkOutDate: formatDate(checkOut),
    checkInTime: "12:00",
    checkOutTime: "17:00",
    message: "Preset inquiry created from Booking Console.",
    selectedServices: [],
    selectedRoomIds: defaultRoom?.id ? [defaultRoom.id] : [],
    roomId: defaultRoom?.id || "",
    roomName: defaultRoom?.name || "",
    roomCount: defaultRoom ? 1 : 0,
    status: "Inquiry",
    paymentMethod: "Pending",
    downpayment: 0,
  };
}

export default function PresetInquiryButton({
  resort,
  onCreate,
  disabled = false,
}) {
  const handleClick = async () => {
    if (!resort || typeof onCreate !== "function") return;
    const payload = buildPresetInquiryPayload(resort);
    await onCreate(payload);
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleClick}
      disabled={disabled || !resort}
      className="rounded-full px-4 text-sm font-semibold border-amber-200 text-amber-700 hover:bg-amber-50"
    >
      <FlaskConical size={16} className="mr-2" />
      Preset Inquiry
    </Button>
  );
}
