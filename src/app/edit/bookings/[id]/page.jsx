"use client";

import React, { useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { resorts } from "@/components/data/resorts";
import BookingCalendar from "./components/BookingsCalendar";
import RentalManager from "./components/RentalManager";
import { useResort } from "@/components/useclient/ContextEditor";
import { useBookings } from "@/components/useclient/BookingsClient";

export default function Page() {
  const { id } = useParams();
  const router = useRouter();
  const { resort, setResort, loadResort } = useResort();
  const { bookings } = useBookings();

  useEffect(() => {
    if (!id) return;
    loadResort(id, true);
  }, [id, loadResort]);

  const fallbackResort = useMemo(
    () => resorts.find((r) => r.id.toString() === id?.toString()),
    [id]
  );

  useEffect(() => {
    if (!resort && fallbackResort) {
      setResort(fallbackResort);
    }
  }, [resort, fallbackResort, setResort]);

  const currentResort = resort?.id?.toString() === id?.toString() ? resort : fallbackResort;

  const openForm = (guestData = {}, targetBookingId = null) => {
    if (targetBookingId) {
      router.push(`/edit/bookings/${id}/booking-details/${targetBookingId}/form`);
      return;
    }

    const payload = {
      ...guestData,
      location: currentResort?.location,
      rates: currentResort?.price,
      resortServices: guestData?.resortServices || currentResort?.extraServices || [],
      resortName: currentResort?.name,
    };

    const draftKey = `booking-form:${Date.now()}`;
    sessionStorage.setItem(draftKey, JSON.stringify(payload));
    router.push(`/edit/bookings/${id}/booking-details/new/form?draft=${encodeURIComponent(draftKey)}`);
  };

  const openDetails = (guestData = {}, targetBookingId = null) => {
    if (targetBookingId) {
      router.push(`/edit/bookings/${id}/booking-details/${targetBookingId}`);
      return;
    }

    const existing = (bookings || []).find(
      (booking) =>
        booking.bookingForm?.email &&
        guestData?.email &&
        booking.bookingForm.email.toLowerCase() === guestData.email.toLowerCase()
    );

    if (existing) {
      router.push(`/edit/bookings/${id}/booking-details/${existing.id}`);
      return;
    }

    openForm(guestData);
  };

  if (!currentResort) return <div className="p-20 text-center">Resort not found.</div>;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-10 mt-[10vh]">
      <div className="flex justify-between items-center px-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
            Booking Management
          </h1>
          <p className="text-blue-600 font-bold text-sm">{currentResort.name}</p>
        </div>

        <button
          onClick={() => openForm({ status: "Inquiry" })}
          className="text-xs font-bold bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-4 py-2 rounded-xl transition-all shadow-sm"
        >
          Open Booking Form
        </button>
      </div>

      <section>
        <BookingCalendar />
      </section>

      <section>
        <RentalManager onOpenForm={openForm} onOpenDetails={openDetails} />
      </section>
    </div>
  );
}
