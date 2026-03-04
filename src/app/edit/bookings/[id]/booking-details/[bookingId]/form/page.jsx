"use client";

import React, { useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useResort } from "@/components/useclient/ContextEditor";
import { useBookings } from "@/components/useclient/BookingsClient";
import BookingForm from "./BookingConfirmation";

export default function BookingDetailsFormPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resort, loadResort, setResort, loading } = useResort();
  const { bookings, createBooking, updateBookingById, deleteBookingById, loadingBookings } = useBookings();

  const resortId = params?.id;
  const bookingId = params?.bookingId;
  const draftKey = searchParams.get("draft");

  useEffect(() => {
    if (resortId) loadResort(resortId, true);
  }, [loadResort, resortId]);

  useEffect(() => {
    if (!resortId || loading) return;
    if (resort?.id?.toString() === resortId?.toString()) return;
    const numericId = Number(resortId);
    if (!Number.isFinite(numericId)) return;
    setResort((prev) => {
      if (prev?.id?.toString() === resortId?.toString()) return prev;
      return {
        id: numericId,
        name: prev?.name || `Resort ${resortId}`,
        rooms: prev?.rooms || [],
        bookings: prev?.bookings || [],
      };
    });
  }, [loading, resort?.id, resortId, setResort]);

  const currentResort = resort?.id?.toString() === resortId?.toString() ? resort : null;
  const bookingList = bookings || [];
  const isNewBooking = bookingId === "new";
  const storageKey = `booking_form_draft:${resortId}:${bookingId}`;

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
        paymentDeadline: formData.paymentDeadline || booking.paymentDeadline || null,
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
      paymentDeadline: formData.paymentDeadline || null,
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
      {(loading && !currentResort) || loadingBookings ? (
        <div className="text-center text-slate-500 mt-20">Loading booking form...</div>
      ) : (
      <BookingForm
        title={isNewBooking ? "New Booking Form" : "Booking Form"}
        data={initialData}
        resortName={currentResort?.name}
        storageKey={storageKey}
        onCancel={() => router.back()}
        onSave={handleSave}
        onDelete={!isNewBooking ? handleDelete : undefined}
      />
      )}
    </div>
  );
}
