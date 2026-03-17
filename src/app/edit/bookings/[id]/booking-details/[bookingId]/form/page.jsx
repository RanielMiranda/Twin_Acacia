"use client";

import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import { useResort } from "@/components/useclient/ContextEditor";
import { useBookings } from "@/components/useclient/BookingsClient";
import BookingForm from "./BookingConfirmation";

export default function BookingDetailsFormPage() {
  const params = useParams();
  const { resort, loadResort, setResort, loading } = useResort();
  const { bookings, loadingBookings } = useBookings();

  const resortId = params?.id;
  const bookingId = params?.bookingId;
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
  const existingBooking = !isNewBooking
    ? bookingList.find((booking) => booking.id.toString() === bookingId?.toString())
    : null;

  const bookingForm = existingBooking?.bookingForm || {};
  const adultCount = Number(existingBooking?.adultCount ?? bookingForm.adultCount ?? 0);
  const childrenCount = Number(existingBooking?.childrenCount ?? bookingForm.childrenCount ?? 0);
  const guestCount = Number(
    existingBooking?.pax ?? bookingForm.guestCount ?? bookingForm.pax ?? adultCount + childrenCount
  );
  const sleepingGuests = Number(existingBooking?.sleepingGuests ?? bookingForm.sleepingGuests ?? 0);
  const roomCount = Number(
    existingBooking?.roomCount ?? bookingForm.roomCount ?? existingBooking?.roomIds?.length ?? 1
  );
  const totalAmount = Number(existingBooking?.totalAmount ?? bookingForm.totalAmount ?? 0);
  const address = bookingForm.address || bookingForm.guestAddress || "";

  const initialData = {
    ...bookingForm,
    adultCount,
    childrenCount,
    guestCount,
    pax: guestCount,
    sleepingGuests,
    roomCount,
    totalAmount,
    address,
    guestAddress: address,
    checkInDate: existingBooking?.startDate || bookingForm.checkInDate || "",
    checkOutDate: existingBooking?.endDate || bookingForm.checkOutDate || "",
    checkInTime: existingBooking?.checkInTime || bookingForm.checkInTime || "14:00",
    checkOutTime: existingBooking?.checkOutTime || bookingForm.checkOutTime || "11:00",
    roomName:
      bookingForm.roomName ||
      (existingBooking?.roomIds || [])
        .map((roomId) => (currentResort?.rooms || []).find((room) => room.id === roomId)?.name)
        .filter(Boolean)
        .join(", ") ||
      "",
    resortServices: Array.isArray(existingBooking?.resortServiceIds)
      ? existingBooking.resortServiceIds
      : Array.isArray(bookingForm.resortServices)
        ? bookingForm.resortServices
        : [],
    resortName: currentResort?.name,
  };

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      {(loading && !currentResort) || loadingBookings ? (
        <div className="text-center text-slate-500 mt-20">Loading booking form...</div>
      ) : (
      <BookingForm
        data={initialData}
        resortName={currentResort?.name}
        resortProfileImage={currentResort?.profileImage}
        resortPrice={Number(currentResort?.price || 0)}
        resortExtraServices={currentResort?.extraServices || []}
        readOnly
      />
      )}
    </div>
  );
}
