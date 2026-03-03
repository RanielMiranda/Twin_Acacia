"use client";

import React, { useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { resorts } from "@/components/data/resorts";
import { useResort } from "@/components/useclient/ContextEditor";
import { useBookings } from "@/components/useclient/BookingsClient";
import BookingForm from "../../../components/BookingConfirmation";

const GROUP_COLORS = ["bg-blue-600", "bg-emerald-600", "bg-amber-500", "bg-rose-500", "bg-violet-600", "bg-cyan-500"];

export default function BookingDetailsFormPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resort } = useResort();
  const { bookings, createBooking, updateBookingById, deleteBookingById } = useBookings();

  const resortId = params?.id;
  const bookingId = params?.bookingId;
  const draftKey = searchParams.get("draft");

  const fallbackResort = useMemo(
    () => resorts.find((entry) => entry.id.toString() === resortId?.toString()),
    [resortId]
  );

  const currentResort = resort?.id?.toString() === resortId?.toString() ? resort : fallbackResort;
  const bookingList = bookings || currentResort?.bookings || [];
  const isNewBooking = bookingId === "new";

  let draftData = null;
  if (typeof window !== "undefined" && draftKey) {
    const raw = sessionStorage.getItem(draftKey);
    if (raw) {
      try {
        draftData = JSON.parse(raw);
      } catch {
        draftData = null;
      }
    }
  }

  const existingBooking = !isNewBooking
    ? bookingList.find((booking) => booking.id.toString() === bookingId?.toString())
    : null;

  const initialData = {
    ...(draftData || {}),
    ...(existingBooking?.bookingForm || {}),
    checkInDate: existingBooking?.startDate || draftData?.checkInDate || "",
    checkOutDate: existingBooking?.endDate || draftData?.checkOutDate || "",
    checkInTime: existingBooking?.checkInTime || draftData?.checkInTime || "14:00",
    checkOutTime: existingBooking?.checkOutTime || draftData?.checkOutTime || "11:00",
    resortName: currentResort?.name,
  };

  const handleSave = (formData) => {
    if (!isNewBooking && existingBooking) {
      updateBookingById(bookingId, (booking) => ({
        ...booking,
        startDate: formData.checkInDate || booking.startDate,
        endDate: formData.checkOutDate || booking.endDate,
        checkInTime: formData.checkInTime || booking.checkInTime,
        checkOutTime: formData.checkOutTime || booking.checkOutTime,
        bookingForm: formData,
        status: formData.status || booking.status,
      }));
      router.push(`/edit/bookings/${resortId}/booking-details/${bookingId}`);
      return;
    }

    const newBookingId = Date.now().toString();
    const nextBooking = {
      id: newBookingId,
      roomIds: currentResort?.rooms?.[0]?.id ? [currentResort.rooms[0].id] : [],
      startDate: formData.checkInDate || null,
      endDate: formData.checkOutDate || null,
      checkInTime: formData.checkInTime || "14:00",
      checkOutTime: formData.checkOutTime || "11:00",
      colorClass: GROUP_COLORS[bookingList.length % GROUP_COLORS.length],
      status: formData.status || "Inquiry",
      bookingForm: formData,
    };

    createBooking(nextBooking);
    router.push(`/edit/bookings/${resortId}/booking-details/${newBookingId}`);
  };

  const handleDelete = () => {
    if (isNewBooking) {
      router.push(`/edit/bookings/${resortId}`);
      return;
    }
    deleteBookingById(bookingId);
    router.push(`/edit/bookings/${resortId}`);
  };

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      <BookingForm
        title={isNewBooking ? "New Booking Form" : "Booking Form"}
        data={initialData}
        resortName={currentResort?.name}
        onCancel={() => router.back()}
        onSave={handleSave}
        onDelete={!isNewBooking ? handleDelete : undefined}
      />
    </div>
  );
}
