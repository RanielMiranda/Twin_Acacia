"use client";

import React, { useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/toast/ToastProvider";
import Toast from "@/components/ui/toast/Toast";
import {
  TicketHeaderSection,
  TicketStayInfoCardSection,
  TicketPaymentCardSection,
  TicketSupportDeskCardSection,
} from "./components";
import { DEFAULT_PAYMENT_METHOD } from "./ticket-page/constants";
import { buildStayInfoPayload } from "./ticket-page/helpers";
import { TicketLoadingSkeleton } from "./ticket-page/TicketLoadingSkeleton";
import { useTicketData } from "./ticket-page/useTicketData";
import { useTicketActions } from "./ticket-page/useTicketActions";
import { useTicketImageActions } from "./ticket-page/useTicketImageActions";

export default function ClientTicketPage() {
  const { bookingId } = useParams();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const normalizedBookingId = Array.isArray(bookingId) ? bookingId[0] : bookingId;
  const accessToken = searchParams.get("token") || "";

  const [issueSubject, setIssueSubject] = useState("");
  const [issueMessage, setIssueMessage] = useState("");
  const [chatMessage, setChatMessage] = useState("");

  const [paymentDraft, setPaymentDraft] = useState({ method: null, downpayment: null });
  const [proofFile, setProofFile] = useState(null);

  const { loading, booking, setBooking, resort, messages, issues, loadingMessages, fetchTicket, fetchMessages } = useTicketData({
    normalizedBookingId,
    accessToken,
    toast,
  });

  const form = useMemo(() => booking?.booking_form || {}, [booking]);
  const paymentMethod = paymentDraft.method ?? (form.paymentMethod === "Bank" ? "Bank" : DEFAULT_PAYMENT_METHOD);
  const downpayment = paymentDraft.downpayment ?? Number(form.downpayment || 0);
  const setPaymentMethod = (method) => setPaymentDraft((prev) => ({ ...prev, method }));
  const setDownpayment = (value) => setPaymentDraft((prev) => ({ ...prev, downpayment: value }));

  const { isSubmitting, handleSubmitDownpayment, handleSendIssue, handleSendMessage } = useTicketActions({
    booking,
    resort,
    form,
    normalizedBookingId,
    paymentMethod,
    downpayment,
    proofFile,
    fetchTicket,
    fetchMessages,
    setBooking,
    issueSubject,
    setIssueSubject,
    issueMessage,
    setIssueMessage,
    chatMessage,
    setChatMessage,
    toast,
  });

  const { openPrintEntryPass, downloadTicket } = useTicketImageActions({ booking, toast });

  const stayInfoPayload = useMemo(() => buildStayInfoPayload(booking, form, resort), [booking, form, resort]);

  if (loading && !booking) {
    return <TicketLoadingSkeleton />;
  }
  if (!booking) return <div className="p-10 text-center text-slate-500">Ticket not found.</div>;

  const totalAmount = Number(form.totalAmount || 0);
  const paid = Number(form.downpayment || 0);
  const pendingPaid = form.paymentPendingApproval ? Number(form.pendingDownpayment || 0) : 0;
  const effectivePaid = paid + pendingPaid;
  const balance = Math.max(0, totalAmount - effectivePaid);
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

      <TicketPaymentCardSection
        totalAmount={totalAmount}
        paid={paid}
        pendingPaid={pendingPaid}
        paymentPendingApproval={!!form.paymentPendingApproval}
        balance={balance}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        downpayment={downpayment}
        setDownpayment={setDownpayment}
        proofFile={proofFile}
        setProofFile={setProofFile}
        isSubmitting={isSubmitting}
        onSubmitDownpayment={handleSubmitDownpayment}
        resortPaymentImageUrl={resort?.payment_image_url}
        canSubmitPayment={status.includes("pending payment")}
      />

      <TicketSupportDeskCardSection
        resort={resort}
        loadingMessages={loadingMessages}
        messages={messages}
        issues={issues}
        onRefreshMessages={() => fetchMessages(booking.id)}
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
