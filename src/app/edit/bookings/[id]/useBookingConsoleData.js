"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
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
  enableAudits = false,
  enableArchive = false,
  archiveAutoLoad = true,
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

  const archiveCursorRef = useRef(0);
  const archiveQueryRef = useRef({ search: "", rangeStart: null, rangeEnd: null });
  const [archivedHasMore, setArchivedHasMore] = useState(false);
  const getSessionStorage = () => (typeof window === "undefined" ? null : window.sessionStorage);
  const getArchiveCacheKey = (keyParts) => `booking_archive:${keyParts.join(":")}`;
  const clearArchiveCache = useCallback(() => {
    const storage = getSessionStorage();
    if (!storage || !resortId) return;
    const prefix = `booking_archive:${resortId}:`;
    for (let i = storage.length - 1; i >= 0; i -= 1) {
      const key = storage.key(i);
      if (key && key.startsWith(prefix)) {
        storage.removeItem(key);
      }
    }
  }, [resortId]);

  const normalizeArchiveRows = useCallback((data) => {
    return (data || []).map((row) => {
      let bookingForm = row.booking_form || {};
      if (typeof bookingForm === "string") {
        try {
          bookingForm = JSON.parse(bookingForm);
        } catch {
          bookingForm = {};
        }
      }
      const inquirerType = (bookingForm.inquirerType || "client").toString().toLowerCase();
      const stayingGuestEmail = bookingForm.stayingGuestEmail || "";
      const stayingGuestPhone = bookingForm.stayingGuestPhone || "";
      const inquirerEmail = bookingForm.email || "";
      const inquirerPhone = bookingForm.phoneNumber || "";

      return {
        id: row.id,
        bookingId: row.booking_id || null,
        resortId: row.resort_id,
        startDate: row.start_date || bookingForm.checkInDate || null,
        endDate: row.end_date || bookingForm.checkOutDate || null,
        checkInTime: row.check_in_time || bookingForm.checkInTime || "12:00",
        checkOutTime: row.check_out_time || bookingForm.checkOutTime || "17:00",
        roomCount: row.room_count || bookingForm.roomCount || 1,
        inquirerType,
        guestName: bookingForm.guestName || "",
        agentName: bookingForm.agentName || "",
        stayingGuestName: bookingForm.stayingGuestName || "",
        stayingGuestEmail,
        stayingGuestPhone,
        inquirerEmail,
        inquirerPhone,
        bookingForm,
        archivedAt: row.archived_at,
        isArchived: true,
      };
    });
  }, []);

  const loadArchivedBookings = useCallback(
    async ({ append = false, search = "", rangeStart = null, rangeEnd = null, limit = 50 } = {}) => {
      if (!resortId) return;
      setLoadingArchivedBookings(true);
      const trimmedSearch = String(search || "").trim().toLowerCase();
      const nextQuery = { search: trimmedSearch, rangeStart, rangeEnd };
      const sameQuery =
        archiveQueryRef.current.search === nextQuery.search &&
        archiveQueryRef.current.rangeStart === nextQuery.rangeStart &&
        archiveQueryRef.current.rangeEnd === nextQuery.rangeEnd;
      const shouldAppend = append && sameQuery;
      const offset = shouldAppend ? archiveCursorRef.current : 0;

      try {
        const storage = getSessionStorage();
        const cacheScope = rangeStart && rangeEnd ? [rangeStart, rangeEnd] : ["all"];
        const canUseCache = !!storage && !shouldAppend;
        if (canUseCache) {
          const cacheKey = getArchiveCacheKey([resortId, ...cacheScope, trimmedSearch || "_"]);
          const cachedRaw = storage.getItem(cacheKey);
          if (cachedRaw) {
            const cachedRows = JSON.parse(cachedRaw);
            if (Array.isArray(cachedRows) && cachedRows.length > 0) {
              setArchivedBookings(cachedRows);
              archiveCursorRef.current = cachedRows.length;
              archiveQueryRef.current = nextQuery;
              setArchivedHasMore(cachedRows.length === limit);
              setLoadingArchivedBookings(false);
              return;
            }
          }
        }

        let query = supabase
          .from("booking_archive")
          .select(
            "id, booking_id, resort_id, booking_form, start_date, end_date, check_in_time, check_out_time, room_count, archived_at"
          )
          .eq("resort_id", resortId)
          .order("archived_at", { ascending: false })
          .range(offset, offset + limit - 1);

        if (rangeStart && rangeEnd) {
          query = query.lte("start_date", rangeEnd).or(`end_date.gte.${rangeStart},end_date.is.null`);
        }

        if (trimmedSearch) {
          const searchDate = /^\d{4}-\d{2}-\d{2}$/.test(trimmedSearch) ? trimmedSearch : null;
          if (searchDate) {
            query = query.or(`start_date.eq.${searchDate},end_date.eq.${searchDate}`);
          } else {
            const like = `%${trimmedSearch}%`;
            query = query.or(
              `booking_form->>stayingGuestName.ilike.${like},booking_form->>guestName.ilike.${like},booking_form->>agentName.ilike.${like},booking_form->>roomName.ilike.${like}`
            );
          }
        }

        const { data, error } = await query;
        if (error) throw error;
        const mapped = normalizeArchiveRows(data);

        if (shouldAppend) {
          setArchivedBookings((prev) => [...prev, ...mapped]);
        } else {
          setArchivedBookings(mapped);
        }

        archiveCursorRef.current = offset + mapped.length;
        archiveQueryRef.current = nextQuery;
        setArchivedHasMore(mapped.length === limit);

        const shouldCache = !!storage && !shouldAppend;
        if (shouldCache) {
          const cacheKey = getArchiveCacheKey([resortId, ...cacheScope, trimmedSearch || "_"]);
          storage.setItem(cacheKey, JSON.stringify(mapped));
        }
      } catch (error) {
        const missingTable =
          error.message?.includes("booking_archive") &&
          (error.message?.includes("does not exist") || error.message?.includes("schema cache"));
        if (!missingTable) {
          console.error("Archive load error:", error?.message || error);
        }
        if (!append) {
          setArchivedBookings([]);
        }
        setArchivedHasMore(false);
      } finally {
        setLoadingArchivedBookings(false);
      }
    },
    [normalizeArchiveRows, resortId]
  );

  useEffect(() => {
    if (!resortId) return;
    loadConcerns();
  }, [loadConcerns, resortId]);

  useEffect(() => {
    if (!enableAudits) return;
    loadAudits();
  }, [enableAudits, loadAudits]);

  useEffect(() => {
    if (!resortId || !enableArchive || !archiveAutoLoad) return;
    loadArchivedBookings({ append: false, limit: 50 });
  }, [archiveAutoLoad, enableArchive, loadArchivedBookings, resortId]);

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
        (status.includes("inquiry") || status.includes("pending payment")) &&
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
      const confirmed = window.confirm("Resolve this concern?");
      if (!confirmed) return;
      try {
        await updateConcernStatus(issueId, "resolved");
        setConcerns((prev) =>
          prev.map((entry) => (entry.id === issueId ? { ...entry, status: "resolved" } : entry))
        );
        toast?.({ message: "Concern resolved.", color: "blue", icon: AlertTriangle });
      } catch (error) {
        console.error("Resolve concern error:", error?.message || error);
      }
    },
    [toast, updateConcernStatus]
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
        if (enableAudits) {
          await loadAudits();
        }
      } catch (error) {
        console.error("Reopen booking error:", error?.message || error);
      }
    },
    [enableAudits, loadAudits, refreshBookings]
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
        if (enableAudits) {
          await loadAudits();
        }
        toast?.({ message: `Booking resolved.`, color: toastColor, icon: CheckCircle2 });
      } catch (error) {
        console.error("Resolve booking error:", error?.message || error);
        toast?.({ message: `Unable to resolve: ${error?.message}`, color: "red", icon: XCircle });
      }
    },
    [deleteBookingById, enableAudits, loadAudits, toast]
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
        toast?.({ message: "Resolve blocked: this booking has unresolved issues.", color: "amber", icon: AlertTriangle });
        return;
      }

      const confirmed = window.confirm("Resolve and archive this booking permanently?");
      if (!confirmed) return;

      const source = (bookings || []).find((entry) => entry.id?.toString() === bookingId?.toString());
      if (!source) {
        toast?.({ message: "Booking not found. Attempting cleanup.", color: "amber", icon: AlertTriangle });
        await deleteBookingById(bookingId);
        return;
      }

      let form = source.bookingForm || {};
      const needsProofHydrate =
        !form?.paymentProofFolder &&
        !(Array.isArray(form?.paymentProofUrls) && form.paymentProofUrls.length > 0) &&
        !form?.paymentProofUrl;
      if (needsProofHydrate) {
        try {
          const { data, error } = await supabase
            .from("bookings")
            .select("booking_form")
            .eq("id", bookingId)
            .maybeSingle();
          if (!error && data?.booking_form) {
            form = data.booking_form;
          }
        } catch {
          // If hydrate fails, continue without proof cleanup.
        }
      }
      const inquirerType = (source.inquirerType || form.inquirerType || "client").toString().toLowerCase();
      const guestEmail = source.stayingGuestEmail || form.stayingGuestEmail || "";
      const guestPhone = source.stayingGuestPhone || form.stayingGuestPhone || "";
      const contactEmail =
        inquirerType === "agent"
          ? source.inquirerEmail || form.email || ""
          : guestEmail || source.inquirerEmail || form.email || "";
      const contactPhone =
        inquirerType === "agent"
          ? source.inquirerPhone || form.phoneNumber || ""
          : guestPhone || source.inquirerPhone || form.phoneNumber || "";

      const archiveForm = {
        stayingGuestName: source.stayingGuestName || form.stayingGuestName || form.guestName || "",
        guestName: source.guestName || form.guestName || "",
        agentName: source.agentName || form.agentName || "",
        stayingGuestEmail: guestEmail,
        stayingGuestPhone: guestPhone,
        roomName: source.roomName || form.roomName || "",
        checkInDate: source.startDate || form.checkInDate || null,
        checkOutDate: source.endDate || form.checkOutDate || null,
        checkInTime: source.checkInTime || form.checkInTime || "12:00",
        checkOutTime: source.checkOutTime || form.checkOutTime || "17:00",
        roomCount: Number(source.roomCount || form.roomCount || 1),
        inquirerType,
        email: contactEmail,
        phoneNumber: contactPhone,
        address: source.inquirerAddress || form.address || "",
        adultCount: Number(source.adultCount ?? form.adultCount ?? 0),
        childrenCount: Number(source.childrenCount ?? form.childrenCount ?? 0),
        sleepingGuests: Number(source.sleepingGuests ?? form.sleepingGuests ?? 0),
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
        clearArchiveCache();
        if (enableArchive) {
          await loadArchivedBookings({ append: false, limit: 50 });
        }
        if (enableAudits) {
          await loadAudits();
        }
        toast?.({ message: "Checked-out booking archived.", color: "green", icon: CheckCircle2 });
      } catch (error) {
        console.error("Delete checked-out booking error:", error?.message || error);
        toast?.({ message: `Archive failed: ${error?.message}`, color: "red", icon: XCircle });
      }
    },
    [
      bookings,
      deleteBookingById,
      enableArchive,
      enableAudits,
      loadAudits,
      loadArchivedBookings,
      resortId,
      toast,
      clearArchiveCache,
      unresolvedIssueBookingIds,
    ]
  );

  const handleDeleteArchivedBooking = useCallback(
    async (archiveId) => {
      const confirmed = window.confirm("Remove this archived booking permanently?");
      if (!confirmed) return;
      try {
        const { error } = await supabase.from("booking_archive").delete().eq("id", archiveId);
        if (error) throw error;
        setArchivedBookings((prev) => prev.filter((entry) => entry.id?.toString() !== archiveId?.toString()));
        clearArchiveCache();
      } catch (error) {
        console.error("Delete archived booking error:", error?.message || error);
      }
    },
    [clearArchiveCache]
  );

  const refreshAuditArchive = useCallback(async () => {
    const tasks = [];
    if (enableAudits) tasks.push(loadAudits());
    if (enableArchive) {
      tasks.push(loadArchivedBookings({ append: false, limit: 50 }));
    }
    await Promise.all(tasks);
  }, [enableArchive, enableAudits, loadAudits, loadArchivedBookings]);

  return {
    concerns,
    loadingConcerns,
    audits,
    loadingAudits,
    archivedBookings,
    loadingArchivedBookings,
    archivedHasMore,
    loadArchivedBookings,
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
