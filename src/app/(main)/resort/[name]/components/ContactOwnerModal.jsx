"use client";

import React from "react";
import { useFilters } from "@/components/useclient/ContextFilter";
import BookingCreationTemplate from "@/components/booking/BookingCreationTemplate";

const getDraftKey = (resortId) => `contact_owner_draft:${resortId}`;

export default function ContactOwnerModal({
  isOpen,
  onClose,
  resort,
  unavailableRoomIds = [],
  initialSelectedRoomIds = [],
  onSubmitInquiry,
}) {
  const { guests, startDate, endDate, destination, checkInTime, checkOutTime } = useFilters();

  if (!resort || !isOpen) return null;

  return (
    <BookingCreationTemplate
      isOpen={isOpen}
      onClose={onClose}
      resort={resort}
      unavailableRoomIds={unavailableRoomIds}
      initialSelectedRoomIds={initialSelectedRoomIds}
      destination={destination}
      guests={guests}
      startDate={startDate}
      endDate={endDate}
      checkInTime={checkInTime}
      checkOutTime={checkOutTime}
      enableDraftPersistence
      draftKey={resort?.id ? getDraftKey(resort.id) : ""}
      showMessage
      showTerms
      showAddOns
      submitLabel="Send Inquiry"
      title={resort?.name || "Resort Inquiry"}
      headerImageUrl={resort?.profileImage}
      addressLabel="Address"
      onSubmit={onSubmitInquiry}
    />
  );
}
