"use client";

import React from "react";
import BookingCreationTemplate from "@/components/booking/BookingCreationTemplate";

export default function ManualBookingModal({
  isOpen,
  onClose,
  onSubmit,
  resort,
  isSubmitting = false,
}) {
  return (
    <BookingCreationTemplate
      isOpen={isOpen}
      onClose={onClose}
      resort={resort}
      unavailableRoomIds={[]}
      initialSelectedRoomIds={[]}
      enableDraftPersistence={false}
      showMessage={false}
      showTerms={false}
      showAddOns
      showStatus
      submitLabel={isSubmitting ? "Adding..." : "Add Booking"}
      isSubmitting={isSubmitting}
      title="Manual Booking"
      addressLabel="Inquirer Address"
      onSubmit={onSubmit}
    />
  );
}
