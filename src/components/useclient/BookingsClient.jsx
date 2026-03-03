"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useResort } from "./ResortEditorClient";

const BookingsContext = createContext(null);

function toModel(row) {
  return {
    id: row.id,
    roomIds: row.room_ids || [],
    startDate: row.start_date,
    endDate: row.end_date,
    checkInTime: row.check_in_time || "14:00",
    checkOutTime: row.check_out_time || "11:00",
    colorClass: row.color_class || "bg-blue-600",
    bookingForm: row.booking_form || {},
    status: row.status || row.booking_form?.status || "Inquiry",
  };
}

function toRow(booking, resortId) {
  return {
    id: booking.id?.toString(),
    resort_id: Number(resortId),
    room_ids: booking.roomIds || [],
    start_date: booking.startDate || null,
    end_date: booking.endDate || null,
    check_in_time: booking.checkInTime || null,
    check_out_time: booking.checkOutTime || null,
    color_class: booking.colorClass || "bg-blue-600",
    status: booking.status || booking.bookingForm?.status || "Inquiry",
    booking_form: booking.bookingForm || {},
  };
}

export function BookingsProvider({ children }) {
  const { resort, updateResort } = useResort();
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [bookingsError, setBookingsError] = useState(null);

  const syncResortBookings = useCallback(
    (nextBookings) => {
      setBookings(nextBookings);
      updateResort("bookings", nextBookings);
    },
    [updateResort]
  );

  const refreshBookings = useCallback(async () => {
    if (!resort?.id) return;
    setLoadingBookings(true);
    setBookingsError(null);
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("resort_id", resort.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      const mapped = (data || []).map(toModel);
      syncResortBookings(mapped);
    } catch (err) {
      setBookingsError(err.message);
      const fallback = resort.bookings || [];
      syncResortBookings(fallback);
    } finally {
      setLoadingBookings(false);
    }
  }, [resort, syncResortBookings]);

  useEffect(() => {
    if (!resort?.id) return;
    refreshBookings();
  }, [refreshBookings, resort?.id]);

  const createBooking = useCallback(
    async (booking) => {
      const nextBooking = { ...booking, id: booking.id?.toString() || Date.now().toString() };
      const optimistic = [...bookings, nextBooking];
      syncResortBookings(optimistic);

      if (!resort?.id) return nextBooking;
      try {
        const { error } = await supabase.from("bookings").upsert(toRow(nextBooking, resort.id));
        if (error) throw error;
      } catch (err) {
        setBookingsError(err.message);
      }
      return nextBooking;
    },
    [bookings, resort?.id, syncResortBookings]
  );

  const updateBookingById = useCallback(
    async (bookingId, updater) => {
      const optimistic = bookings.map((entry) => {
        if (entry.id.toString() !== bookingId.toString()) return entry;
        return typeof updater === "function" ? updater(entry) : { ...entry, ...updater };
      });
      syncResortBookings(optimistic);

      if (!resort?.id) return;
      const changed = optimistic.find((entry) => entry.id.toString() === bookingId.toString());
      if (!changed) return;

      try {
        const { error } = await supabase.from("bookings").upsert(toRow(changed, resort.id));
        if (error) throw error;
      } catch (err) {
        setBookingsError(err.message);
      }
    },
    [bookings, resort?.id, syncResortBookings]
  );

  const deleteBookingById = useCallback(
    async (bookingId) => {
      const optimistic = bookings.filter((entry) => entry.id.toString() !== bookingId.toString());
      syncResortBookings(optimistic);

      if (!resort?.id) return;
      try {
        const { error } = await supabase.from("bookings").delete().eq("id", bookingId.toString());
        if (error) throw error;
      } catch (err) {
        setBookingsError(err.message);
      }
    },
    [bookings, resort?.id, syncResortBookings]
  );

  const value = useMemo(
    () => ({
      bookings,
      loadingBookings,
      bookingsError,
      refreshBookings,
      createBooking,
      updateBookingById,
      deleteBookingById,
      setBookings: syncResortBookings,
    }),
    [
      bookings,
      bookingsError,
      createBooking,
      deleteBookingById,
      loadingBookings,
      refreshBookings,
      syncResortBookings,
      updateBookingById,
    ]
  );

  return <BookingsContext.Provider value={value}>{children}</BookingsContext.Provider>;
}

export const useBookings = () => useContext(BookingsContext);
