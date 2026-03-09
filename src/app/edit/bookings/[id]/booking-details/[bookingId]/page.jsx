"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useResort } from "@/components/useclient/ContextEditor";
import { useBookings } from "@/components/useclient/BookingsClient";
import { useSupport } from "@/components/useclient/SupportClient";
import { useToast } from "@/components/ui/toast/ToastProvider";
import Toast from "@/components/ui/toast/Toast";
import BookingModernEditor from "./components/BookingModernEditor";
import { overlapsByDateTime } from "./components/bookingEditorUtils";
import { supabase } from "@/lib/supabase";

export default function BookingDetailsPage() {
  const { id, bookingId } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { resort, loadResort, setResort, loading } = useResort();
  const { bookings, updateBookingById, deleteBookingById, loadingBookings, createSignedProofUrl, createBookingTransaction } = useBookings();
  const { loadBookingSupport, updateConcernStatus, sendTicketMessage, isMissingSupportTableError } = useSupport();
  const [messages, setMessages] = useState([]);
  const [issues, setIssues] = useState([]);
  const [ownerReply, setOwnerReply] = useState("");
  const [statusAudits, setStatusAudits] = useState([]);
  const [refreshingMessages, setRefreshingMessages] = useState(false);

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
  const bookingConflicts = (bookings || []).filter((entry) => {
    if (!booking || entry.id?.toString() === booking.id?.toString()) return false;
    const sharedRoom = (entry.roomIds || []).some((rid) => (booking.roomIds || []).includes(rid));
    if (!sharedRoom) return false;
    return overlapsByDateTime(booking, entry);
  });

  useEffect(() => {
    if (!booking?.id) return;
    loadSupportData(booking.id);
    loadStatusAudits(booking.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booking?.id]);

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
        });
      }
    } catch (err) {
      toast({ message: `Unable to load support data: ${err.message}`, color: "red" });
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
        return;
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
    try {
      const payload = {
        booking_id: booking.id,
        resort_id: booking.resortId || booking.resort_id || Number(id),
        sender_role: "owner",
        sender_name: "Owner",
        message: ownerReply.trim(),
      };
      await sendTicketMessage(payload);
      setOwnerReply("");
      await loadSupportData(booking.id);
      toast({ message: "Reply sent to client.", color: "green" });
    } catch (err) {
      if (isMissingSupportTableError(err)) {
        toast({ message: "Messaging table missing. Run supabase/schema.sql first.", color: "amber" });
        return;
      }
      toast({ message: `Reply failed: ${err.message}`, color: "red" });
    }
  };

  const handleResolveIssue = async (issueId) => {
    try {
      await updateConcernStatus(issueId, "resolved");
      await loadSupportData(booking.id);
      toast({ message: "Issue marked as resolved.", color: "green" });
    } catch (err) {
      toast({ message: `Resolve failed: ${err.message}`, color: "red" });
    }
  };

  return (
    <div>
    <BookingModernEditor
      key={booking.id}
      booking={booking}
      resortName={currentResort?.name}
      onBack={() => router.push(`/edit/bookings/${id}`)}
      onSave={(next) => updateBookingById(booking.id, next)}
      onDelete={() => {
        deleteBookingById(booking.id);
        router.push(`/edit/bookings/${id}`);
      }}
      onOpenForm={() => router.push(`/edit/bookings/${id}/booking-details/${booking.id}/form`)}
      onOpenTicket={() => router.push(`/ticket/${booking.id}`)}
      messages={messages}
      issues={issues}
      ownerReply={ownerReply}
      setOwnerReply={setOwnerReply}
      onSendReply={handleSendReply}
      onRefreshMessages={() => loadSupportData(booking.id)}
      refreshingMessages={refreshingMessages}
      onResolveIssue={handleResolveIssue}
      conflicts={bookingConflicts}
      createSignedProofUrl={createSignedProofUrl}
      createBookingTransaction={createBookingTransaction}
      resortRooms={currentResort?.rooms || []}
      allBookings={bookings || []}
      statusAudits={statusAudits}
      resortPaymentImageUrl={currentResort?.payment_image_url}
    />
    <Toast />
  </div>    
  );
}
