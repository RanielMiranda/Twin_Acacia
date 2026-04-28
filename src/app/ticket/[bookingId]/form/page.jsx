"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { isTicketTokenValid } from "@/lib/ticketAccess";
import { useToast } from "@/components/ui/toast/ToastProvider";
import Toast from "@/components/ui/toast/Toast";
import BookingForm from "@/app/edit/bookings/[id]/booking-details/[bookingId]/form/BookingConfirmation";

export default function TicketFormPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const bookingId = params?.bookingId;
  const token = searchParams.get("token") || "";

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(null);
  const [resort, setResort] = useState(null);

  const normalizedBookingId = Array.isArray(bookingId) ? bookingId[0] : bookingId;

  const fetchData = useCallback(async () => {
    if (!normalizedBookingId) return;
    setLoading(true);
    try {
      // Fetch booking
      const { data: bookingRows, error: bookingError } = await supabase
        .from("bookings")
        .select("id, resort_id, start_date, end_date, check_in_time, check_out_time, room_ids, adult_count, children_count, pax, sleeping_guests, room_count, status, booking_form")
        .eq("id", normalizedBookingId)
        .limit(1);

      if (bookingError) throw bookingError;
      if (!bookingRows || bookingRows.length === 0) {
        throw new Error("Booking not found.");
      }

      const bookingData = bookingRows[0];

      // Validate token
      if (!isTicketTokenValid(bookingData?.booking_form || {}, token)) {
        throw new Error("Invalid or missing access token.");
      }

      setBooking(bookingData);

      // Fetch resort if available (select all fields)
      if (bookingData?.resort_id) {
        const { data: resortData, error: resortError } = await supabase
          .from("resorts")
          .select("*")
          .eq("id", bookingData.resort_id)
          .single();
        if (resortError) throw resortError;
        setResort(resortData);
      }
    } catch (err) {
      toast({ message: err.message || "Failed to load booking form", color: "red" });
    } finally {
      setLoading(false);
    }
  }, [normalizedBookingId, token, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500">Loading booking form...</p>
      </div>
    );
  }

  if (!booking || !resort) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500">Unable to load booking information.</p>
      </div>
    );
  }

  // Build initialData similar to the owner form page
  const bookingForm = booking.booking_form || {};
  const adultCount = Number(booking.adult_count ?? bookingForm.adultCount ?? 0);
  const childrenCount = Number(booking.children_count ?? bookingForm.childrenCount ?? 0);
  const guestCount = Number(booking.pax ?? bookingForm.guestCount ?? bookingForm.pax ?? adultCount + childrenCount);
  const sleepingGuests = Number(booking.sleeping_guests ?? bookingForm.sleepingGuests ?? 0);
  const roomCount = Number(booking.room_count ?? bookingForm.roomCount ?? booking.room_ids?.length ?? 1);
  const totalAmount = Number(bookingForm.totalAmount ?? 0);
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
    checkInDate: booking.start_date || bookingForm.checkInDate || "",
    checkOutDate: booking.end_date || bookingForm.checkOutDate || "",
    checkInTime: booking.check_in_time || bookingForm.checkInTime || "12:00",
    checkOutTime: booking.check_out_time || bookingForm.checkOutTime || "17:00",
    roomName:
      bookingForm.roomName ||
      (booking.room_ids || [])
        .map((roomId) => resort?.rooms?.find((r) => r.id === roomId)?.name)
        .filter(Boolean)
        .join(", ") ||
      "",
    resortServices: Array.isArray(bookingForm.resortServices) ? bookingForm.resortServices : [],
    resortName: resort.name,
  };

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      <div className="max-w-4xl min-h-[297mm] mx-auto mb-28">
        <BookingForm
          data={initialData}
          resortName={resort.name}
          resortProfileImage={resort.profile_image}
          resortPrice={Number(resort.price || 0)}
          resortExtraServices={resort.extra_services || []}
          readOnly
        />
      </div>
      <Toast />
    </div>
  );
}
