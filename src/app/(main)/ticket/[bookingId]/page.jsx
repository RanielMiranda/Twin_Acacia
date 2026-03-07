"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { BUCKET_NAME } from "@/lib/utils";
import { useToast } from "@/components/ui/toast/ToastProvider";
import Toast from "@/components/ui/toast/Toast";
import { isTicketTokenValid } from "@/lib/ticketAccess";
import { toPng } from "html-to-image";
import {
  TicketHeaderSection,
  TicketStayInfoCardSection,
  TicketPaymentCardSection,
  TicketSupportDeskCardSection,
} from "./components";

const BOOKING_TICKET_COLUMNS = [
  "id",
  "resort_id",
  "room_ids",
  "start_date",
  "end_date",
  "check_in_time",
  "check_out_time",
  "status",
  "booking_form",
].join(", ");
const TICKET_MESSAGE_COLUMNS = ["id", "booking_id", "sender_role", "sender_name", "message", "created_at"].join(", ");
const isMissingSupportTableError = (error) =>
  !!error?.message &&
  (error.message.includes("Could not find the table") ||
    error.message.includes("does not exist") ||
    error.message.includes("schema cache"));

const toSafeSegment = (value) =>
  String(value || "unknown")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_\s]/g, "")
    .replace(/\s+/g, "-");

export default function ClientTicketPage() {
  const { bookingId } = useParams();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const normalizedBookingId = Array.isArray(bookingId) ? bookingId[0] : bookingId;
  const accessToken = searchParams.get("token") || "";

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [booking, setBooking] = useState(null);
  const [resort, setResort] = useState(null);

  const [issueSubject, setIssueSubject] = useState("");
  const [issueMessage, setIssueMessage] = useState("");
  const [chatMessage, setChatMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState("GCash");
  const [downpayment, setDownpayment] = useState(0);
  const [proofFile, setProofFile] = useState(null);

  const form = useMemo(() => booking?.booking_form || {}, [booking?.booking_form]);

  useEffect(() => {
    if (!form) return;
    setPaymentMethod(form.paymentMethod === "Bank" ? "Bank" : "GCash");
    setDownpayment(Number(form.downpayment || 0));
  }, [form]);

  const fetchMessages = useCallback(async (activeBookingId) => {
    setLoadingMessages(true);
    try {
      const { data, error } = await supabase
        .from("ticket_messages")
        .select(TICKET_MESSAGE_COLUMNS)
        .eq("booking_id", activeBookingId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      if (isMissingSupportTableError(err)) {
        setMessages([]);
        return;
      }
      toast({ message: `Unable to load messages: ${err.message}`, color: "red" });
    } finally {
      setLoadingMessages(false);
    }
  }, [toast]);

  const fetchTicket = useCallback(async () => {
    setLoading(true);
    try {
      const { data: bookingRows, error: bookingError } = await supabase
        .from("bookings")
        .select(BOOKING_TICKET_COLUMNS)
        .eq("id", normalizedBookingId)
        .order("created_at", { ascending: false })
        .limit(2);
      if (bookingError) throw bookingError;
      if (!bookingRows || bookingRows.length === 0) {
        throw new Error(`Ticket not found for ID: ${normalizedBookingId}`);
      }
      if (bookingRows.length > 1) {
        toast({
          message: "Duplicate ticket IDs found. Showing latest record.",
          color: "amber",
        });
      }
      const bookingData = bookingRows[0];
      const cookieRoleMatch = typeof document !== "undefined"
        ? document.cookie.match(/(?:^|;\s*)app_role=([^;]+)/)
        : null;
      const role = cookieRoleMatch ? decodeURIComponent(cookieRoleMatch[1] || "").toLowerCase() : "";
      const isStaff = role === "admin" || role === "owner";
      if (!isStaff && !isTicketTokenValid(bookingData?.booking_form || {}, accessToken)) {
        throw new Error("Ticket access token is missing, invalid, or expired.");
      }

      setBooking(bookingData);

      if (bookingData?.resort_id) {
        const { data: resortData, error: resortError } = await supabase
          .from("resorts")
          .select("id, name, location, contactEmail, contactPhone, contactMedia, rooms")
          .eq("id", bookingData.resort_id)
          .single();
        if (resortError) throw resortError;
        setResort(resortData);
      }

      await fetchMessages(bookingData.id);
    } catch (err) {
      toast({ message: `Unable to load ticket: ${err.message}`, color: "red" });
    } finally {
      setLoading(false);
    }
  }, [accessToken, fetchMessages, normalizedBookingId, toast]);

  useEffect(() => {
    if (!normalizedBookingId) return;
    fetchTicket();
  }, [fetchTicket, normalizedBookingId]);

  const uploadProof = async () => {
    if (!proofFile) return null;
    const resortName = resort?.name || form?.resortName || `resort-${booking?.resort_id || "unknown"}`;
    const safeResort = toSafeSegment(resortName);
    const safeTicket = toSafeSegment(normalizedBookingId);
    const path = `resort-bookings/${safeResort}/${safeTicket}/proof.webp`;
    const { error } = await supabase.storage.from(BUCKET_NAME).upload(path, proofFile, {
      upsert: true,
      contentType: proofFile.type || "image/webp",
    });
    if (error) throw error;
    const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);
    return urlData.publicUrl;
  };

  const handleSubmitDownpayment = async () => {
    if (!booking) return;
    if (!proofFile) {
      toast({ message: "Please attach proof of payment image before submitting.", color: "red" });
      return;
    }
    setIsSubmitting(true);
    try {
      const proofUrl = await uploadProof();
      const bookingForm = {
        ...(booking.booking_form || {}),
        pendingPaymentMethod: paymentMethod,
        pendingDownpayment: Number(downpayment || 0),
        paymentPendingApproval: true,
        paymentVerified: false,
        paymentVerifiedAt: null,
        paymentProofUrl: proofUrl || booking.booking_form?.paymentProofUrl || null,
        paymentSubmittedAt: new Date().toISOString(),
      };

      const nextStatus =
        (booking.status || "").toLowerCase().includes("inquiry") || (booking.status || "").toLowerCase().includes("pending")
          ? "Pending Payment"
          : booking.status;
      const adults = Number(bookingForm.adultCount || form.adultCount || 0);
      const children = Number(bookingForm.childrenCount || form.childrenCount || 0);
      const pax = Number(bookingForm.guestCount || bookingForm.pax || adults + children || 0);

      const { error } = await supabase
        .from("bookings")
        .update({
          booking_form: bookingForm,
          status: nextStatus,
          adult_count: adults,
          children_count: children,
          pax,
          sleeping_guests: Number(bookingForm.sleepingGuests || form.sleepingGuests || 0),
          room_count: Number(bookingForm.roomCount || form.roomCount || 1),
        })
        .eq("id", booking.id);

      if (error) throw error;

      setBooking((prev) => ({ ...prev, booking_form: bookingForm, status: nextStatus }));
      await fetchTicket();

      toast({
        message: "Payment proof submitted. Waiting for owner approval.",
        color: "green",
      });
    } catch (err) {
      toast({ message: `Payment submission failed: ${err.message}`, color: "red" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendIssue = async () => {
    if (!issueMessage.trim()) {
      toast({ message: "Issue message cannot be empty.", color: "red" });
      return;
    }

    try {
      const payload = {
        booking_id: booking.id,
        resort_id: booking.resort_id,
        guest_name: form.guestName || "Guest",
        guest_email: form.email || "",
        subject: issueSubject || "Ticket Issue",
        message: issueMessage,
        status: "open",
      };

      const { error } = await supabase.from("ticket_issues").insert(payload);
      if (error) throw error;

      setIssueSubject("");
      setIssueMessage("");
      toast({ message: "Issue sent to owner support.", color: "green" });
    } catch (err) {
      if (isMissingSupportTableError(err)) {
        toast({ message: "Issue table missing. Ask admin to run phase3 SQL.", color: "amber" });
        return;
      }
      toast({ message: `Issue send failed: ${err.message}`, color: "red" });
    }
  };

  const handleSendMessage = async () => {
    if (!chatMessage.trim() || !booking) return;
    try {
      const payload = {
        booking_id: booking.id,
        resort_id: booking.resort_id,
        sender_role: "client",
        sender_name: form.guestName || "Client",
        message: chatMessage.trim(),
      };
      const { error } = await supabase.from("ticket_messages").insert(payload);
      if (error) throw error;
      setChatMessage("");
      await fetchMessages(booking.id);
      toast({ message: "Message sent to owner.", color: "green" });
    } catch (err) {
      if (isMissingSupportTableError(err)) {
        toast({ message: "Messaging table missing. Ask admin to run phase4 SQL.", color: "amber" });
        return;
      }
      toast({ message: `Message send failed: ${err.message}`, color: "red" });
    }
  };

  const stayInfoPayload = useMemo(() => {
    if (!booking || !form) return null;
    const statusAuditEntries = Array.isArray(form.statusAudit) ? form.statusAudit : [];
    const latestApprovalAudit = [...statusAuditEntries].reverse().find((entry) => {
      const toStatus = String(entry?.to || "").toLowerCase();
      return toStatus.includes("approved inquiry") || toStatus.includes("confirmed");
    });
    const approvedByName =
      latestApprovalAudit?.actorName || latestApprovalAudit?.actorRole || latestApprovalAudit?.actor || "Not approved yet";
    const assignedRoomNames =
      (form.assignedRoomNames && form.assignedRoomNames.length > 0
        ? form.assignedRoomNames
        : (booking.room_ids || [])
            ?.map((roomId) => (resort?.rooms || []).find((room) => room.id === roomId)?.name)
            .filter(Boolean)) || [];
    const entryCode = form.confirmationStub?.code || `TKT-${String(booking.id).slice(-6).toUpperCase()}`;
    return { form, booking, resort, approvedByName, assignedRoomNames, entryCode };
  }, [booking, form, resort]);

  const getTicketImageDataUrl = useCallback(async () => {
    const el = document.getElementById("ticket-stay-card");
    if (!el) return null;
    return toPng(el, {
      quality: 1,
      pixelRatio: 2,
      backgroundColor: "#ffffff",
      style: { borderRadius: "1.5rem" },
    });
  }, []);

  const openPrintEntryPass = useCallback(async () => {
    try {
      const dataUrl = await getTicketImageDataUrl();
      if (!dataUrl) return;
      const win = window.open("", "_blank", "noopener,noreferrer,width=900,height=700");
      if (!win) {
        toast({ message: "Please allow popups to print the entry pass.", color: "amber" });
        return;
      }
      const printContent = `
<!DOCTYPE html><html><head><meta charset="utf-8"><title>Entry Pass</title>
<style>body{margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#fff}
img{max-width:100%;height:auto;display:block}
@media print{body{margin:0;padding:0}img{max-width:100%}}</style></head>
<body><img src="${dataUrl}" alt="Entry Pass" onload="window.print();window.onafterprint=function(){window.close()}" /></body></html>`;
      win.document.write(printContent);
      win.document.close();
      win.focus();
    } catch (err) {
      toast({ message: `Print failed: ${err?.message || "Unknown error"}`, color: "red" });
    }
  }, [getTicketImageDataUrl, toast]);

  const downloadTicket = useCallback(async () => {
    if (!booking) return;
    try {
      const dataUrl = await getTicketImageDataUrl();
      if (!dataUrl) return;
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `ticket-${booking.id}.png`;
      link.click();
    } catch (err) {
      toast({ message: `Download failed: ${err?.message || "Unknown error"}`, color: "red" });
    }
  }, [booking, getTicketImageDataUrl, toast]);

  if (loading && !booking) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-8 mt-16 pb-20 animate-pulse">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="h-8 w-56 rounded bg-slate-200" />
            <div className="h-3 w-44 rounded bg-slate-100" />
          </div>
          <div className="h-12 w-40 rounded-full bg-slate-100" />
        </div>

        <div className="p-8 md:p-10 border border-slate-100 rounded-[2.5rem] bg-white">
          <div className="h-3 w-40 rounded bg-slate-200 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <div className="h-2 w-20 rounded bg-slate-100" />
                <div className="h-8 w-full rounded bg-slate-100" />
              </div>
            ))}
          </div>
        </div>

        <div className="p-8 md:p-10 border border-slate-100 rounded-[2.5rem] bg-white">
          <div className="h-3 w-52 rounded bg-slate-200 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8 space-y-4">
              <div className="h-12 w-full rounded-2xl bg-slate-100" />
              <div className="h-12 w-full rounded-2xl bg-slate-100" />
              <div className="h-28 w-full rounded-2xl bg-slate-100" />
            </div>
            <div className="lg:col-span-4 h-52 rounded-[2rem] bg-slate-900/90" />
          </div>
        </div>

        <div className="p-8 border border-slate-100 rounded-[2.5rem] bg-white">
          <div className="h-3 w-40 rounded bg-slate-200 mb-4" />
          <div className="h-40 w-full rounded-2xl bg-slate-100 mb-4" />
          <div className="h-12 w-full rounded-2xl bg-slate-100" />
        </div>
      </div>
    );
  }
  if (!booking) return <div className="p-10 text-center text-slate-500">Ticket not found.</div>;

  const totalAmount = Number(form.totalAmount || 0);
  const paid = Number(form.downpayment || 0);
  const balance = Math.max(0, totalAmount - paid);
  const status = String(booking.status || "").toLowerCase();
  const isConcernOnlyMode =
    status.includes("confirm") ||
    status.includes("ongoing") ||
    status.includes("pending checkout") ||
    status.includes("checked out");
  const canAccessEntryPass =
    status.includes("confirm") ||
    status.includes("ongoing") ||
    status.includes("pending checkout") ||
    status.includes("checked out");

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8 mt-16 pb-20">
      <TicketHeaderSection
        bookingId={booking.id}
        canAccessEntryPass={canAccessEntryPass}
        onPrintEntryPass={openPrintEntryPass}
        onDownloadTicket={downloadTicket}
      />

      <TicketStayInfoCardSection
        form={form}
        booking={booking}
        resort={resort}
        approvedByName={stayInfoPayload?.approvedByName}
        assignedRoomNames={stayInfoPayload?.assignedRoomNames}
        entryCode={stayInfoPayload?.entryCode}
      />

      {status.includes("pending payment") ? (
        <TicketPaymentCardSection
          totalAmount={totalAmount}
          paid={paid}
          balance={balance}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          downpayment={downpayment}
          setDownpayment={setDownpayment}
          proofFile={proofFile}
          setProofFile={setProofFile}
          isSubmitting={isSubmitting}
          onSubmitDownpayment={handleSubmitDownpayment}
        />
      ) : null}

      <TicketSupportDeskCardSection
        resort={resort}
        loadingMessages={loadingMessages}
        messages={messages}
        isConcernOnlyMode={isConcernOnlyMode}
        chatMessage={chatMessage}
        setChatMessage={setChatMessage}
        onSendMessage={handleSendMessage}
        issueSubject={issueSubject}
        setIssueSubject={setIssueSubject}
        issueMessage={issueMessage}
        setIssueMessage={setIssueMessage}
        onSendIssue={handleSendIssue}
      />

      <Toast />
    </div>
  );
}
