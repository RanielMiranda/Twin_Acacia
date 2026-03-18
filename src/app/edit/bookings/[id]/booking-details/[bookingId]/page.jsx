"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { useResort } from "@/components/useclient/ContextEditor";
import { useBookings } from "@/components/useclient/BookingsClient";
import { useSupport } from "@/components/useclient/SupportClient";
import { useToast } from "@/components/ui/toast/ToastProvider";
import Toast from "@/components/ui/toast/Toast";
import PersistentToast from "@/components/ui/toast/PersistentToast";
import BookingModernEditor from "./components/BookingModernEditor";
import { overlapsByDateTime } from "./components/bookingEditorUtils";
import { supabase } from "@/lib/supabase";
import { BUCKET_NAME } from "@/lib/utils";

export default function BookingDetailsPage() {
  const { id, bookingId } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { resort, loadResort, setResort, loading } = useResort();
  const { bookings, updateBookingById, deleteBookingById, loadingBookings, createSignedProofUrl, createBookingTransaction, refreshBookings } = useBookings();
  const { loadBookingSupport, updateConcernStatus, sendTicketMessage, isMissingSupportTableError } = useSupport();
  const [messages, setMessages] = useState([]);
  const [issues, setIssues] = useState([]);
  const [ownerReply, setOwnerReply] = useState("");
  const [statusAudits, setStatusAudits] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [proofOverrideForm, setProofOverrideForm] = useState(null);
  const [ownerReplyTarget, setOwnerReplyTarget] = useState("all");
  const [refreshingMessages, setRefreshingMessages] = useState(false);
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const lastOwnerReplySentAtRef = useRef(0);

  const hashString = (value) => {
    let hash = 0;
    for (let i = 0; i < value.length; i += 1) {
      hash = (hash << 5) - hash + value.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(36);
  };

  const buildOwnerIdempotencyKey = (message) => {
    const bucket = Math.floor(Date.now() / 5000);
    const base = `${booking?.id || ""}:owner:${message}`.toLowerCase().trim();
    return `ticket-msg:${bucket}:${hashString(base)}`;
  };

  const toSafeSegment = (value) =>
    String(value || "unknown")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-_\s]/g, "")
      .replace(/\s+/g, "-");

  const listStorageFilesRecursively = async (prefix) => {
    const filePaths = [];
    const walk = async (folderPath) => {
      let offset = 0;
      let hasMore = true;
      while (hasMore) {
        const { data, error } = await supabase.storage.from(BUCKET_NAME).list(folderPath, {
          limit: 100,
          offset,
          sortBy: { column: "name", order: "asc" },
        });
        if (error) throw error;
        const entries = data || [];
        for (const entry of entries) {
          const currentPath = folderPath ? `${folderPath}/${entry.name}` : entry.name;
          if (entry.id) {
            filePaths.push(currentPath);
          } else {
            await walk(currentPath);
          }
        }
        hasMore = entries.length === 100;
        offset += 100;
      }
    };
    if (prefix) await walk(prefix);
    return filePaths;
  };

  useEffect(() => {
    if (id) loadResort(id, true);
  }, [id, loadResort]);

  useEffect(() => {
    if (!id || loading) return;
    if (resort?.id?.toString() === id?.toString()) return;
    const numericId = Number(id);
    if (!Number.isFinite(numericId)) return;
    setResort((prev) => {
      if (prev?.id?.toString() === id?.toString()) return prev;
      return {
        id: numericId,
        name: prev?.name || `Resort ${id}`,
        rooms: prev?.rooms || [],
        bookings: prev?.bookings || [],
      };
    });
  }, [id, loading, resort?.id, setResort]);

  const currentResort = resort?.id?.toString() === id?.toString() ? resort : null;
  const booking = (bookings || []).find(
    (entry) => entry.id.toString() === bookingId?.toString()
  );
  const effectiveBookingForm = proofOverrideForm || booking?.bookingForm || {};
  const bookingConflicts = (bookings || []).filter((entry) => {
    if (!booking || entry.id?.toString() === booking.id?.toString()) return false;
    const normalizedStatus = String(entry.status || entry.bookingForm?.status || "").toLowerCase();
    if (!normalizedStatus.includes("confirm")) return false;
    return overlapsByDateTime(booking, entry);
  });

  useEffect(() => {
    if (!booking?.id) return;
    loadSupportData(booking.id);
    loadStatusAudits(booking.id);
    loadProofData(booking.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booking?.id]);

  useEffect(() => {
    if (!booking?.id) return;
    const channel = supabase
      .channel(`booking-live-${booking.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "ticket_messages", filter: `booking_id=eq.${booking.id}` },
        () => loadSupportData(booking.id)
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "ticket_issues", filter: `booking_id=eq.${booking.id}` },
        () => loadSupportData(booking.id)
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings", filter: `id=eq.${booking.id}` },
        () => {
          refreshBookings();
          loadProofData(booking.id);
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "booking_status_audit", filter: `booking_id=eq.${booking.id}` },
        () => loadStatusAudits(booking.id)
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "booking_transactions", filter: `booking_id=eq.${booking.id}` },
        () => loadStatusAudits(booking.id)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [booking?.id]);

  useEffect(() => {
    if (!booking?.id || isEditing) return undefined;
    const interval = setInterval(() => {
      loadSupportData(booking.id);
      loadStatusAudits(booking.id);
      loadProofData(booking.id);
    }, 15000);
    return () => clearInterval(interval);
  }, [booking?.id, isEditing]);

  const loadSupportData = async (activeBookingId) => {
    setRefreshingMessages(true);
    try {
      const { messages: messageRows, issues: issueRows, missingTables } = await loadBookingSupport(activeBookingId);
      setMessages(messageRows);
      setIssues(issueRows);
      if (missingTables) {
        toast({
          message: "Support tables are not installed yet. Run supabase/schema.sql.",
          color: "amber",
          icon: AlertTriangle,
        });
      }
    } catch (err) {
      toast({ message: `Unable to load support data: ${err.message}`, color: "red", icon: XCircle });
    } finally {
      setRefreshingMessages(false);
    }
  };

  const loadStatusAudits = async (activeBookingId) => {
    try {
      const { data, error } = await supabase
        .from("booking_status_audit")
        .select("id, booking_id, changed_at, actor_role, actor_name, old_status, new_status")
        .eq("booking_id", activeBookingId)
        .order("changed_at", { ascending: false });
      if (!error) {
        setStatusAudits(data || []);
      }
      const missingActorName =
        error.message?.includes("actor_name") &&
        (error.message?.includes("does not exist") || error.message?.includes("schema cache"));
      if (!missingActorName) throw error;

      const fallback = await supabase
        .from("booking_status_audit")
        .select("id, booking_id, changed_at, actor_role, old_status, new_status")
        .eq("booking_id", activeBookingId)
        .order("changed_at", { ascending: false });
      if (fallback.error) throw fallback.error;
      setStatusAudits(fallback.data || []);
    } catch {
      setStatusAudits([]);
    }

    try {
      const { data: transactionRows, error: transactionError } = await supabase
        .from("booking_transactions")
        .select("id, booking_id, method, amount, balance_after, note, created_at")
        .eq("booking_id", activeBookingId)
        .order("created_at", { ascending: false });
      if (transactionError) throw transactionError;
      setTransactions(transactionRows || []);
    } catch {
      setTransactions([]);
    }
  };

  const loadProofData = async (activeBookingId) => {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select("booking_form")
        .eq("id", activeBookingId)
        .maybeSingle();
      if (error) throw error;
      setProofOverrideForm(data?.booking_form || null);
    } catch {
      setProofOverrideForm(null);
    }
  };

  if ((loading && !currentResort) || loadingBookings) {
    return <div className="p-10 text-center text-slate-500">Loading booking details...</div>;
  }

  if (!booking) {
    return (
      <div className="p-10 text-center">
        <p className="text-slate-500">Booking not found.</p>
        <Button className="mt-4" onClick={() => router.push(`/edit/bookings/${id}`)}>
          Back to Booking Page
        </Button>
      </div>
    );
  }

  const handleSendReply = async () => {
    if (!ownerReply.trim()) return;
    if (isSendingReply) return;
    const now = Date.now();
    if (now - lastOwnerReplySentAtRef.current < 5000) {
      toast({ message: "Please wait a few seconds before sending another message.", color: "amber", icon: AlertTriangle });
      return;
    }
    try {
      setIsSendingReply(true);
      lastOwnerReplySentAtRef.current = now;
      const payload = {
        booking_id: booking.id,
        resort_id: booking.resortId || booking.resort_id || Number(id),
        sender_role: "owner",
        sender_name: "Owner",
        visibility:
          ownerReplyTarget === "agent"
            ? true
            : ownerReplyTarget === "client"
              ? false
              : null,
        message: ownerReply.trim(),
        idempotency_key: buildOwnerIdempotencyKey(ownerReply),
      };
      await sendTicketMessage(payload);
      setOwnerReply("");
      await loadSupportData(booking.id);
      toast({ message: "Reply sent to client.", color: "green", icon: CheckCircle2 });
    } catch (err) {
      if (isMissingSupportTableError(err)) {
        toast({ message: "Messaging table missing. Run supabase/schema.sql first.", color: "amber", icon: AlertTriangle });
        return;
      }
      toast({ message: `Reply failed: ${err.message}`, color: "red" });
    } finally {
      setIsSendingReply(false);
    }
  };

  const handleResolveIssue = async (issueId) => {
    try {
      await updateConcernStatus(issueId, "resolved");
      try {
        const resortName =
          currentResort?.name ||
          effectiveBookingForm?.resortName ||
          booking?.booking_form?.resortName ||
          `resort-${booking?.resort_id || booking?.resortId || "unknown"}`;
        const safeResort = toSafeSegment(resortName);
        const safeTicket = toSafeSegment(booking?.id || bookingId || "unknown");
        const prefix = `resort-bookings/${safeResort}/${safeTicket}`;
        const allPaths = await listStorageFilesRecursively(prefix);
        if (allPaths.length > 0) {
          for (let i = 0; i < allPaths.length; i += 100) {
            const chunk = allPaths.slice(i, i + 100);
            const { error: removeError } = await supabase.storage.from(BUCKET_NAME).remove(chunk);
            if (removeError) throw removeError;
          }
        }
      } catch (storageError) {
        console.error("Failed to remove proof files:", storageError?.message || storageError);
      }
      await loadSupportData(booking.id);
      toast({ message: "Issue marked as resolved.", color: "green" });
    } catch (err) {
      toast({ message: `Resolve failed: ${err.message}`, color: "red" });
    }
  };

  const cancelBookingWithConfirmation = async () => {
    if (!booking) return;
    const confirmed = window.confirm("Cancel this booking?");
    if (!confirmed) return;
    try {
      await updateBookingById(booking.id, (entry) => ({
        ...entry,
        status: "Cancelled",
        bookingForm: {
          ...(entry.bookingForm || {}),
          status: "Cancelled",
          cancelledAt: new Date().toISOString(),
          statusAudit: (() => {
            const currentAudit = Array.isArray(entry.bookingForm?.statusAudit)
              ? entry.bookingForm.statusAudit
              : [];
            const previousStatus = entry.bookingForm?.status || entry.status || null;
            if (!previousStatus || previousStatus === "Cancelled") return currentAudit;
            const lastAudit = currentAudit[currentAudit.length - 1];
            if (lastAudit?.from === previousStatus && lastAudit?.to === "Cancelled") {
              return currentAudit;
            }
            return [
              ...currentAudit,
              {
                from: previousStatus,
                to: "Cancelled",
                at: new Date().toISOString(),
                actor: "owner-ui",
                actorRole: "owner",
                actorId: "",
                actorName: "Owner",
              },
            ];
          })(),
        },
      }));
      toast({ message: "Booking cancelled.", color: "green" });
    } catch (err) {
      toast({ message: `Cancel failed: ${err.message}`, color: "red" });
    }
  };

  return (
    <div className = "mt-10">
    <BookingModernEditor
      booking={{ ...booking, bookingForm: effectiveBookingForm }}
      resortName={currentResort?.name}
      onBack={() => router.push(`/edit/bookings/${id}`)}
      onSave={(next) => updateBookingById(booking.id, next)}
      onDelete={cancelBookingWithConfirmation}
      onOpenForm={() => {
        if (typeof window === "undefined") return;
        const url = `${window.location.origin}/edit/bookings/${id}/booking-details/${booking.id}/form`;
        window.open(url, "_blank", "noopener,noreferrer");
      }}
      onOpenTicket={() => {
        if (typeof window === "undefined") return;
        const token = effectiveBookingForm?.ticketAccessToken
          || booking?.booking_form?.ticketAccessToken
          || booking?.booking_form?.ticket_access_token
          || "";
        const url = `${window.location.origin}/ticket/${booking.id}${token ? `?token=${encodeURIComponent(token)}` : ""}`;
        window.open(url, "_blank", "noopener,noreferrer");
      }}
      onOpenBooking={(targetId) => router.push(`/edit/bookings/${id}/booking-details/${targetId}`)}
      onOpenCalendar={() => router.push(`/edit/bookings/${id}?tab=calendar`)}
      messages={messages}
      issues={issues}
      ownerReply={ownerReply}
      setOwnerReply={setOwnerReply}
      ownerReplyTarget={ownerReplyTarget}
      setOwnerReplyTarget={setOwnerReplyTarget}
      onSendReply={handleSendReply}
      onRefreshMessages={() => loadSupportData(booking.id)}
      refreshingMessages={refreshingMessages}
      onResolveIssue={handleResolveIssue}
      conflicts={bookingConflicts}
      createSignedProofUrl={createSignedProofUrl}
      createBookingTransaction={createBookingTransaction}
      resortRooms={currentResort?.rooms || []}
      resortExtraServices={currentResort?.extraServices || []}
      allBookings={bookings || []}
      statusAudits={statusAudits}
      transactions={transactions}
      resortPaymentImageUrl={currentResort?.payment_image_url}
      onEditingChange={setIsEditing}
      proofOverrideForm={proofOverrideForm}
    />
    <Toast />
    <PersistentToast />
  </div>    
  );
}
