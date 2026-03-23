"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useResort } from "@/components/useclient/ContextEditor";
import { useBookings } from "@/components/useclient/BookingsClient";
import BookingForm from "./BookingConfirmation";
import { Button } from "@/components/ui/button";
import { toPng } from "html-to-image";

export default function BookingDetailsFormPage() {
  const params = useParams();
  const { resort, loadResort, setResort, loading } = useResort();
  const { bookings, loadingBookings, refreshBookingById } = useBookings();
  const [detailedBooking, setDetailedBooking] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

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

  useEffect(() => {
    let isActive = true;
    if (!bookingId || isNewBooking) return undefined;
    setLoadingDetail(true);
    refreshBookingById(bookingId)
      .then((result) => {
        if (!isActive) return;
        if (result) setDetailedBooking(result);
      })
      .finally(() => {
        if (!isActive) return;
        setLoadingDetail(false);
      });
    return () => {
      isActive = false;
    };
  }, [bookingId, isNewBooking, refreshBookingById]);

  const sourceBooking = detailedBooking || existingBooking;
  const bookingForm = sourceBooking?.bookingForm || {};
  const adultCount = Number(sourceBooking?.adultCount ?? bookingForm.adultCount ?? 0);
  const childrenCount = Number(sourceBooking?.childrenCount ?? bookingForm.childrenCount ?? 0);
  const guestCount = Number(
    sourceBooking?.pax ?? bookingForm.guestCount ?? bookingForm.pax ?? adultCount + childrenCount
  );
  const sleepingGuests = Number(sourceBooking?.sleepingGuests ?? bookingForm.sleepingGuests ?? 0);
  const roomCount = Number(
    sourceBooking?.roomCount ?? bookingForm.roomCount ?? sourceBooking?.roomIds?.length ?? 1
  );
  const totalAmount = Number(sourceBooking?.totalAmount ?? bookingForm.totalAmount ?? 0);
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
    checkInDate: sourceBooking?.startDate || bookingForm.checkInDate || "",
    checkOutDate: sourceBooking?.endDate || bookingForm.checkOutDate || "",
    checkInTime: sourceBooking?.checkInTime || bookingForm.checkInTime || "14:00",
    checkOutTime: sourceBooking?.checkOutTime || bookingForm.checkOutTime || "11:00",
    roomName:
      bookingForm.roomName ||
      (sourceBooking?.roomIds || [])
        .map((roomId) => (currentResort?.rooms || []).find((room) => room.id === roomId)?.name)
        .filter(Boolean)
        .join(", ") ||
      "",
    resortServices: Array.isArray(sourceBooking?.resortServiceIds)
      ? sourceBooking.resortServiceIds
      : Array.isArray(bookingForm.resortServices)
        ? bookingForm.resortServices
        : [],
    resortName: currentResort?.name,
  };

  const handleDownload = useCallback(async () => {
    const el = document.getElementById("booking-confirmation-sheet");
    if (!el) return;
    try {
      const dataUrl = await toPng(el, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        style: { borderRadius: "1.125rem" },
      });
      if (!dataUrl) return;
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `booking-form-${currentResort?.name || "resort"}.png`;
      link.click();
    } catch (error) {
      console.error("Failed to download booking form image:", error);
    }
  }, [currentResort?.name]);

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      {(loading && !currentResort) || loadingBookings || loadingDetail ? (
        <div className="text-center text-slate-500 mt-20">Loading booking form...</div>
      ) : (
      <>
        <div className="max-w-[210mm] min-h-[297mm] mx-auto mb-28">
          <BookingForm
            data={initialData}
            resortName={currentResort?.name}
            resortProfileImage={currentResort?.profileImage}
            resortPrice={Number(currentResort?.price || 0)}
            resortExtraServices={currentResort?.extraServices || []}
            readOnly
          />
        </div>
        <div className="fixed bottom-4 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 z-50 flex items-center justify-between gap-3 bg-white/95 backdrop-blur border border-slate-200 shadow-xl rounded-2xl px-4 py-3">
          <Button type="button" variant="" onClick={handleDownload}>
            Download
          </Button>
        </div>
      </>
      )}
    </div>
  );
}
