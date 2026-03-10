"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useResort } from "./ResortEditorClient";
import { BUCKET_NAME, getStoragePathFromPublicUrl } from "@/lib/utils";
import { isCheckoutOverdueRow } from "@/lib/bookingDateTime";

const BookingsContext = createContext(null);
const BOOKING_COLUMNS = [
  "id",
  "resort_id",
  "room_ids",
  "start_date",
  "end_date",
  "check_in_time",
  "check_out_time",
  "status",
  "adult_count",
  "children_count",
  "pax",
  "sleeping_guests",
  "room_count",
  "payment_deadline",
  "booking_form",
  "created_at",
  "updated_at",
].join(", ");

function toModel(row) {
  return {
    id: row.id,
    resortId: row.resort_id,
    roomIds: row.room_ids || [],
    startDate: row.start_date,
    endDate: row.end_date,
    checkInTime: row.check_in_time || "14:00",
    checkOutTime: row.check_out_time || "11:00",
    bookingForm: row.booking_form || {},
    status: row.status || row.booking_form?.status || "Inquiry",
    adultCount: Number(row.adult_count ?? row.booking_form?.adultCount ?? 0),
    childrenCount: Number(row.children_count ?? row.booking_form?.childrenCount ?? 0),
    pax: Number(row.pax ?? row.booking_form?.guestCount ?? row.booking_form?.pax ?? 0),
    sleepingGuests: Number(row.sleeping_guests ?? row.booking_form?.sleepingGuests ?? 0),
    roomCount: Number(row.room_count ?? row.booking_form?.roomCount ?? row.room_ids?.length ?? 0),
    paymentDeadline: row.payment_deadline || row.booking_form?.paymentDeadline || null,
    updatedAt: row.updated_at || null,
  };
}

function toRow(booking, resortId) {
  const form = booking.bookingForm || {};
  const adults = Number(form.adultCount ?? booking.adultCount ?? 0);
  const children = Number(form.childrenCount ?? booking.childrenCount ?? 0);
  const pax = Number(form.guestCount ?? form.pax ?? booking.pax ?? adults + children);
  return {
    id: booking.id?.toString(),
    resort_id: Number(resortId),
    room_ids: booking.roomIds || [],
    start_date: booking.startDate || null,
    end_date: booking.endDate || null,
    check_in_time: booking.checkInTime || null,
    check_out_time: booking.checkOutTime || null,
    status: booking.status || booking.bookingForm?.status || "Inquiry",
    adult_count: adults,
    children_count: children,
    pax,
    sleeping_guests: Number(form.sleepingGuests ?? booking.sleepingGuests ?? 0),
    room_count: Number(form.roomCount ?? booking.roomCount ?? booking.roomIds?.length ?? 1),
    payment_deadline: booking.paymentDeadline || booking.bookingForm?.paymentDeadline || null,
    booking_form: {
      ...form,
      adultCount: adults,
      childrenCount: children,
      guestCount: pax,
      pax,
    },
  };
}

function isPastDeadline(deadline) {
  if (!deadline) return false;
  const date = new Date(deadline);
  if (Number.isNaN(date.getTime())) return false;
  return date.getTime() < Date.now();
}

export function BookingsProvider({ children }) {
  const { resort, updateResort } = useResort();
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [bookingsError, setBookingsError] = useState(null);
  const [lastFetchedAt, setLastFetchedAt] = useState(null);
  const [hasHydratedCache, setHasHydratedCache] = useState(false);
  const [autoFetchedResortId, setAutoFetchedResortId] = useState(null);

  const getCacheKey = (resortId) => `bookings_cache:${resortId}`;

  const syncResortBookings = useCallback(
    (nextBookings) => {
      setBookings(nextBookings);
      updateResort((prev) => {
        if (!prev) return prev;
        if (prev.bookings === nextBookings) return prev;
        return { ...prev, bookings: nextBookings };
      });
      if (typeof window !== "undefined" && resort?.id) {
        localStorage.setItem(getCacheKey(resort.id), JSON.stringify(nextBookings));
      }
    },
    [resort?.id, updateResort]
  );

  const refreshBookings = useCallback(async () => {
    if (!resort?.id) return;
    setLoadingBookings(true);
    setBookingsError(null);
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(BOOKING_COLUMNS)
        .eq("resort_id", resort.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      const rows = data || [];
      const expiredRows = rows.filter((row) => {
        const status = (row.status || row.booking_form?.status || "").toLowerCase();
        const pendingPayment = status.includes("pending payment");
        const unpaid = Number(row.booking_form?.downpayment || 0) <= 0;
        return pendingPayment && unpaid && isPastDeadline(row.payment_deadline || row.booking_form?.paymentDeadline);
      });
      const overdueCheckoutRows = rows.filter((row) => {
        const status = (row.status || row.booking_form?.status || "").toLowerCase();
        const isConfirmed = status.includes("confirmed");
        return isConfirmed && isCheckoutOverdueRow(row);
      });

      if (expiredRows.length > 0) {
        const nowIso = new Date().toISOString();
        await Promise.all(
          expiredRows.map((row) =>
            supabase
              .from("bookings")
              .update({
                status: "Cancelled",
                payment_deadline: row.payment_deadline || row.booking_form?.paymentDeadline || null,
                booking_form: {
                  ...(row.booking_form || {}),
                  status: "Cancelled",
                  autoCancelledAt: nowIso,
                  cancellationReason: "Payment deadline expired",
                },
              })
              .eq("id", row.id)
          )
        );
      }
      if (overdueCheckoutRows.length > 0) {
        const nowIso = new Date().toISOString();
        await Promise.all(
          overdueCheckoutRows.map((row) =>
            supabase
              .from("bookings")
              .update({
                status: "Pending Checkout",
                booking_form: {
                  ...(row.booking_form || {}),
                  status: "Pending Checkout",
                  autoPendingCheckoutAt: nowIso,
                },
              })
              .eq("id", row.id)
          )
        );
      }

      const normalizedRows = rows.map((row) => {
        const shouldCancel = expiredRows.some((entry) => entry.id === row.id);
        const shouldMoveToPendingCheckout = overdueCheckoutRows.some((entry) => entry.id === row.id);
        if (!shouldCancel && !shouldMoveToPendingCheckout) return row;
        if (shouldCancel) {
          return {
            ...row,
            status: "Cancelled",
            booking_form: {
              ...(row.booking_form || {}),
              status: "Cancelled",
            },
          };
        }
        return {
          ...row,
          status: "Pending Checkout",
          booking_form: {
            ...(row.booking_form || {}),
            status: "Pending Checkout",
          },
        };
      });

      const mapped = normalizedRows.map(toModel);
      syncResortBookings(mapped);
      const fetchedAt = new Date().toISOString();
      setLastFetchedAt(fetchedAt);
      if (typeof window !== "undefined") {
        localStorage.setItem(`bookings_cache_ts:${resort.id}`, fetchedAt);
      }
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
    if (typeof window === "undefined") return;
    try {
      const cached = localStorage.getItem(getCacheKey(resort.id));
      const cachedTs = localStorage.getItem(`bookings_cache_ts:${resort.id}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        setBookings(parsed);
        updateResort((prev) => {
          if (!prev) return prev;
          const current = prev.bookings || [];
          const isSame =
            current.length === parsed.length &&
            current.every((item, index) => item?.id?.toString() === parsed[index]?.id?.toString());
          if (isSame) return prev;
          return { ...prev, bookings: parsed };
        });
      } else {
        const local = resort.bookings || [];
        setBookings(local);
      }
      if (cachedTs) setLastFetchedAt(cachedTs);
    } catch (err) {
      console.error("Bookings cache read error:", err.message);
    } finally {
      setHasHydratedCache(true);
    }
  }, [resort?.id, updateResort]);

  useEffect(() => {
    if (!resort?.id || !hasHydratedCache) return;
    if (autoFetchedResortId === resort.id) return;
    setAutoFetchedResortId(resort.id);
    refreshBookings();
  }, [autoFetchedResortId, hasHydratedCache, refreshBookings, resort?.id]);

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

  const createSignedProofUrl = useCallback(async (publicUrl, expiresIn = 60 * 60) => {
    const path = getStoragePathFromPublicUrl(publicUrl, BUCKET_NAME);
    if (!path) return null;
    const { data, error } = await supabase.storage.from(BUCKET_NAME).createSignedUrl(path, expiresIn);
    if (error) throw error;
    return data?.signedUrl || null;
  }, []);

  const createBookingTransaction = useCallback(async (payload) => {
    const { error } = await supabase.from("booking_transactions").insert(payload);
    if (error) throw error;
  }, []);

  const value = useMemo(
    () => ({
      bookings,
      loadingBookings,
      bookingsError,
      lastFetchedAt,
      refreshBookings,
      createBooking,
      updateBookingById,
      deleteBookingById,
      createSignedProofUrl,
      createBookingTransaction,
      setBookings: syncResortBookings,
    }),
    [
      bookings,
      bookingsError,
      createBooking,
      deleteBookingById,
      lastFetchedAt,
      loadingBookings,
      refreshBookings,
      syncResortBookings,
      updateBookingById,
      createBookingTransaction,
      createSignedProofUrl,
    ]
  );

  return <BookingsContext.Provider value={value}>{children}</BookingsContext.Provider>;
}

export const useBookings = () => useContext(BookingsContext);
