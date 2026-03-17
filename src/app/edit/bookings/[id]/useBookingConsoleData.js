"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { deleteSupabasePublicUrls, deleteSupabaseFolder, getStorageFolderFromPublicUrl } from "@/lib/utils";

const normalizeStatus = (entry) =>
  (entry.status || entry.bookingForm?.status || "").toString().toLowerCase();

export function useBookingConsoleData({
  resortId,
  bookings = [],
  refreshBookings,
  updateBookingById,
  deleteBookingById,
  listResortConcerns,
  updateConcernStatus,
  toast,
}) {
  const [concerns, setConcerns] = useState([]);
  const [loadingConcerns, setLoadingConcerns] = useState(false);
  const [audits, setAudits] = useState([]);
  const [loadingAudits, setLoadingAudits] = useState(false);
  const [archivedBookings, setArchivedBookings] = useState([]);
  const [loadingArchivedBookings, setLoadingArchivedBookings] = useState(false);

  const loadConcerns = useCallback(async () => {
    if (!resortId) return;
    setLoadingConcerns(true);
    try {
      const rows = await listResortConcerns(resortId);
      setConcerns(rows);
    } catch (error) {
      console.error("Concerns load error:", error?.message || error);
    } finally {
      setLoadingConcerns(false);
    }
  }, [listResortConcerns, resortId]);

  const lastAuditBookingIdsRef = useRef("");

  const loadAudits = useCallback(async () => {
    const bookingIds = (bookings || [])
      .map((entry) => entry.id?.toString())
      .filter(Boolean);
    const bookingIdsKey = bookingIds.join(",");
    if (bookingIdsKey === lastAuditBookingIdsRef.current) {
      return;
    }
    lastAuditBookingIdsRef.current = bookingIdsKey;

    if (bookingIds.length === 0) {
      setAudits([]);
      return;
    }

    setLoadingAudits(true);
    try {
      // Ensure table exists before querying full audit.
      const baseQuery = supabase
        .from("booking_status_audit")
        .select("id")
        .eq("booking_id", bookingIds[0])
        .limit(1);
      const { error: tableCheckError } = await baseQuery;
      if (tableCheckError) {
        setAudits([]);
        return;
      }

      const { data, error } = await supabase
        .from("booking_status_audit")
        .select("id, booking_id, changed_at, actor_role, actor_name, old_status, new_status")
        .in("booking_id", bookingIds)
        .order("changed_at", { ascending: false })
        .limit(300);

      if (!error) {
        setAudits(data || []);
        return;
      }

      const missingActorName =
        error.message?.includes("actor_name") &&
        (error.message?.includes("does not exist") ||
          error.message?.includes("schema cache"));
      if (!missingActorName) {
        setAudits([]);
        return;
      }

      const fallback = await supabase
        .from("booking_status_audit")
        .select("id, booking_id, changed_at, actor_role, old_status, new_status")
        .in("booking_id", bookingIds)
        .order("changed_at", { ascending: false })
        .limit(300);

      if (!fallback.error) {
        setAudits(fallback.data || []);
      } else {
        setAudits([]);
      }
    } finally {
      setLoadingAudits(false);
    }
  }, [bookings]);

  const loadArchivedBookings = useCallback(async () => {
    if (!resortId) return;
    setLoadingArchivedBookings(true);
    try {
      const { data, error } = await supabase
        .from("booking_archive")
        .select(
          "id, booking_id, resort_id, booking_form, start_date, end_date, check_in_time, check_out_time, room_count, archived_at"
        )
        .eq("resort_id", resortId)
        .order("archived_at", { ascending: false });
      if (error) throw error;

      const mapped = (data || []).map((row) => ({
        id: row.id,
        bookingId: row.booking_id || null,
        resortId: row.resort_id,
        startDate: row.start_date || row.booking_form?.checkInDate || null,
        endDate: row.end_date || row.booking_form?.checkOutDate || null,
        checkInTime: row.check_in_time || row.booking_form?.checkInTime || "14:00",
        checkOutTime: row.check_out_time || row.booking_form?.checkOutTime || "11:00",
        roomCount: row.room_count || row.booking_form?.roomCount || 1,
        bookingForm: row.booking_form || {},
        archivedAt: row.archived_at,
        isArchived: true,
      }));

      setArchivedBookings(mapped);
    } catch (error) {
      const missingTable =
        error.message?.includes("booking_archive") &&
        (error.message?.includes("does not exist") || error.message?.includes("schema cache"));
      if (!missingTable) {
        console.error("Archive load error:", error?.message || error);
      }
      setArchivedBookings([]);
    } finally {
      setLoadingArchivedBookings(false);
    }
  }, [resortId]);

  useEffect(() => {
    if (!resortId) return;
    loadConcerns();
  }, [loadConcerns, resortId]);

  useEffect(() => {
    loadAudits();
  }, [loadAudits]);

  useEffect(() => {
    if (!resortId) return;
    loadArchivedBookings();
  }, [loadArchivedBookings, resortId]);

  const declinedBookings = useMemo(
    () =>
      (bookings || []).filter((entry) => normalizeStatus(entry).includes("declined")),
    [bookings]
  );

  const checkedOutBookings = useMemo(
    () =>
      (bookings || []).filter((entry) => {
        const status = normalizeStatus(entry);
        return (
          status.includes("checked out") ||
          status.includes("checked-out") ||
          status.includes("cancelled")
        );
      }),
    [bookings]
  );

  const workflowCounts = useMemo(() => {
    const source = bookings || [];
    const inquiry = source.filter((entry) => {
      const status = normalizeStatus(entry);
      return (
        (status.includes("inquiry") || status.includes("pending payment") || status.includes("pending checkout")) &&
        !status.includes("declined")
      );
    }).length;
    const checkout = source.filter((entry) => normalizeStatus(entry).includes("pending checkout")).length;
    return { inquiry, checkout };
  }, [bookings]);

  const unresolvedIssueBookingIds = useMemo(() => {
    const ids = new Set();
    (concerns || []).forEach((issue) => {
      if (issue.status !== "resolved" && issue.booking_id) {
        ids.add(issue.booking_id.toString());
      }
    });
    return ids;
  }, [concerns]);

  const handleResolveConcern = useCallback(
    async (issueId) => {
      const confirmed = window.confirm("Resolve and permanently delete this concern?");
      if (!confirmed) return;
      try {
        const { error } = await supabase.from("ticket_issues").delete().eq("id", issueId);
        if (error) throw error;
        setConcerns((prev) => prev.filter((entry) => entry.id !== issueId));
      } catch (error) {
        console.error("Resolve concern error:", error?.message || error);
      }
    },
    []
  );

  const handleReopenConcern = useCallback(
    async (issueId) => {
      try {
        await updateConcernStatus(issueId, "open");
        setConcerns((prev) =>
          prev.map((entry) => (entry.id === issueId ? { ...entry, status: "open" } : entry))
        );
      } catch (error) {
        console.error("Reopen concern error:", error?.message || error);
      }
    },
    [updateConcernStatus]
  );

  const reopenBooking = useCallback(
    async (bookingId, newStatus) => {
      try {
        // Refresh to ensure the local cache matches the DB before making updates.
        await refreshBookings();

        // Fetch the latest booking form from the DB to avoid overwriting fields (dates, counts) with stale values.
        const { data: latestRow, error: fetchError } = await supabase
          .from("bookings")
          .select("booking_form")
          .eq("id", bookingId)
          .maybeSingle();
        if (fetchError) throw fetchError;

        const existingForm = (latestRow?.booking_form || {}) ?? {};
        const nextForm = {
          ...existingForm,
          status: newStatus,
          reopenedAt: new Date().toISOString(),
        };

        const { error } = await supabase
          .from("bookings")
          .update({
            status: newStatus,
            booking_form: nextForm,
          })
          .eq("id", bookingId);

        if (error) throw error;

        await refreshBookings();
        await loadAudits();
      } catch (error) {
        console.error("Reopen booking error:", error?.message || error);
      }
    },
    [loadAudits, refreshBookings]
  );

  const handleReopenDeclined = useCallback(
    (bookingId) => reopenBooking(bookingId, "Inquiry"),
    [reopenBooking]
  );

  const handleReopenCancelled = useCallback(
    (bookingId) => reopenBooking(bookingId, "Inquiry"),
    [reopenBooking]
  );

  const handleReopenCheckedOut = useCallback(
    (bookingId) => reopenBooking(bookingId, "Ongoing"),
    [reopenBooking]
  );

  const handleResolveBooking = useCallback(
    async (bookingId, message, toastColor) => {
      const confirmed = window.confirm(message);
      if (!confirmed) return;
      try {
        await deleteBookingById(bookingId);
        await loadAudits();
        toast?.({ message: `Booking resolved.`, color: toastColor });
      } catch (error) {
        console.error("Resolve booking error:", error?.message || error);
        toast?.({ message: `Unable to resolve: ${error?.message}`, color: "red" });
      }
    },
    [deleteBookingById, loadAudits, toast]
  );

  const handleResolveDeclined = useCallback(
    (bookingId) => handleResolveBooking(bookingId, "Resolve and delete this declined inquiry?", "green"),
    [handleResolveBooking]
  );

  const handleResolveCancelled = useCallback(
    (bookingId) => handleResolveBooking(bookingId, "Resolve and delete this cancelled booking?", "green"),
    [handleResolveBooking]
  );

  const handleResolveCheckedOut = useCallback(
    async (bookingId) => {
      if (unresolvedIssueBookingIds.has(bookingId?.toString())) {
        toast?.({ message: "Resolve blocked: this booking has unresolved issues.", color: "amber" });
        return;
      }

      const confirmed = window.confirm("Resolve and archive this booking permanently?");
      if (!confirmed) return;

      const source = (bookings || []).find((entry) => entry.id?.toString() === bookingId?.toString());
      if (!source) {
        toast?.({ message: "Booking not found. Attempting cleanup.", color: "amber" });
        await deleteBookingById(bookingId);
        return;
      }

      const form = source.bookingForm || {};
      const inquirerType = (source.inquirerType || form.inquirerType || "client").toString().toLowerCase();
      const guestEmail = form.stayingGuestEmail || "";
      const guestPhone = form.stayingGuestPhone || "";
      const contactEmail = inquirerType === "agent" ? form.email || "" : guestEmail;
      const contactPhone = inquirerType === "agent" ? form.phoneNumber || "" : guestPhone;

      const archiveForm = {
        stayingGuestName: form.stayingGuestName || form.guestName || "",
        guestName: form.guestName || "",
        agentName: form.agentName || "",
        stayingGuestEmail: form.stayingGuestEmail || "",
        stayingGuestPhone: form.stayingGuestPhone || "",
        roomName: form.roomName || "",
        checkInDate: source.startDate || form.checkInDate || null,
        checkOutDate: source.endDate || form.checkOutDate || null,
        checkInTime: source.checkInTime || form.checkInTime || "14:00",
        checkOutTime: source.checkOutTime || form.checkOutTime || "11:00",
        roomCount: Number(source.roomCount || form.roomCount || 1),
        inquirerType,
        email: contactEmail,
        phoneNumber: contactPhone,
        address: form.address || "",
        adultCount: Number(source.adultCount ?? form.adultCount ?? 0),
        childrenCount: Number(source.childrenCount ?? form.childrenCount ?? 0),
        sleepingGuests: Number(source.sleepingGuests ?? form.sleepingGuests ?? 0),
        status: "Checked Out",
      };

      try {
        const proofFolder =
          source.bookingForm?.paymentProofFolder ||
          getStorageFolderFromPublicUrl((source.bookingForm?.paymentProofUrls || [])[0]) ||
          getStorageFolderFromPublicUrl(source.bookingForm?.paymentProofUrl);

        if (proofFolder) {
          try {
            await deleteSupabaseFolder(supabase, proofFolder);
          } catch (deleteError) {
            console.warn("Failed to delete payment proof folder", deleteError?.message || deleteError);
          }
        }

        const { error: archiveError } = await supabase.from("booking_archive").insert({
          booking_id: source.id?.toString(),
          resort_id: resortId,
          booking_form: archiveForm,
          start_date: archiveForm.checkInDate,
          end_date: archiveForm.checkOutDate,
          check_in_time: archiveForm.checkInTime,
          check_out_time: archiveForm.checkOutTime,
          room_count: archiveForm.roomCount,
          archived_at: new Date().toISOString(),
          reopen_deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        });
        if (archiveError) throw archiveError;

        await deleteBookingById(bookingId);
        await loadArchivedBookings();
        await loadAudits();
        toast?.({ message: "Checked-out booking archived.", color: "green" });
      } catch (error) {
        console.error("Delete checked-out booking error:", error?.message || error);
        toast?.({ message: `Archive failed: ${error?.message}`, color: "red" });
      }
    },
    [bookings, deleteBookingById, loadAudits, loadArchivedBookings, resortId, toast, unresolvedIssueBookingIds]
  );

  const handleDeleteArchivedBooking = useCallback(
    async (archiveId) => {
      const confirmed = window.confirm("Remove this archived booking permanently?");
      if (!confirmed) return;
      try {
        const { error } = await supabase.from("booking_archive").delete().eq("id", archiveId);
        if (error) throw error;
        setArchivedBookings((prev) => prev.filter((entry) => entry.id?.toString() !== archiveId?.toString()));
      } catch (error) {
        console.error("Delete archived booking error:", error?.message || error);
      }
    },
    []
  );

  const refreshAuditArchive = useCallback(async () => {
    await Promise.all([loadAudits(), loadArchivedBookings()]);
  }, [loadAudits, loadArchivedBookings]);

  return {
    concerns,
    loadingConcerns,
    audits,
    loadingAudits,
    archivedBookings,
    loadingArchivedBookings,
    workflowCounts,
    declinedBookings,
    checkedOutBookings,
    // Count only final-status bookings (cancelled/declined/checked-out). Archived records are shown separately.
    auditArchiveCount: declinedBookings.length + checkedOutBookings.length,
    openConcernCount: concerns.filter((item) => item.status !== "resolved").length,
    unresolvedIssueBookingIds,
    loadConcerns,
    loadAudits,
    loadArchivedBookings,
    handleResolveConcern,
    handleReopenConcern,
    handleReopenDeclined,
    handleReopenCancelled,
    handleReopenCheckedOut,
    handleResolveDeclined,
    handleResolveCancelled,
    handleResolveCheckedOut,
    handleDeleteArchivedBooking,
    refreshAuditArchive,
  };
}
