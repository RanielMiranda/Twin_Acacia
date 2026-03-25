"use client";

import React, { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useParams, useSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/toast/ToastProvider";
import Toast from "@/components/ui/toast/Toast";
import {
  TicketHeaderSection,
  TicketStayInfoCardSection,
} from "./components";
import { DEFAULT_PAYMENT_METHOD } from "./ticket-page/constants";
import { buildStayInfoPayload } from "./ticket-page/helpers";
import { TicketLoadingSkeleton } from "./ticket-page/TicketLoadingSkeleton";
import { useTicketData } from "./ticket-page/useTicketData";
import { useTicketActions } from "./ticket-page/useTicketActions";
import { useTicketImageActions } from "./ticket-page/useTicketImageActions";

const TicketPaymentCardSection = dynamic(
  () => import("./components").then((mod) => mod.TicketPaymentCardSection),
  { loading: () => <div className="h-40 rounded-2xl border border-slate-200 bg-white" /> }
);
const TicketAddOnsCardSection = dynamic(
  () => import("./components").then((mod) => mod.TicketAddOnsCardSection),
  { loading: () => <div className="h-40 rounded-2xl border border-slate-200 bg-white" /> }
);
const TicketSupportDeskCardSection = dynamic(
  () => import("./components").then((mod) => mod.TicketSupportDeskCardSection),
  { loading: () => <div className="h-40 rounded-2xl border border-slate-200 bg-white" /> }
);
const TicketIssueCardSection = dynamic(
  () => import("./components").then((mod) => mod.TicketIssueCardSection),
  { loading: () => <div className="h-40 rounded-2xl border border-slate-200 bg-white" /> }
);

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
  const [paymentNote, setPaymentNote] = useState("");
  const [proofFiles, setProofFiles] = useState([]);

  const { loading, booking, setBooking, resort, messages, issues, loadingMessages, fetchTicket, fetchMessages, viewerRole } = useTicketData({
    normalizedBookingId,
    accessToken,
    toast,
  });

  const form = useMemo(() => {
    if (!booking) return {};
    const rawForm = booking?.booking_form || {};
    const adults = Number(booking.adult_count ?? rawForm.adultCount ?? 0);
    const children = Number(booking.children_count ?? rawForm.childrenCount ?? 0);
    const guestCount = Number(booking.pax ?? rawForm.guestCount ?? rawForm.pax ?? adults + children);
    const inquirerType =
      booking.inquirer_type === true || rawForm.inquirerType === "agent" ? "agent" : "client";
    const contactEmail = rawForm.email || rawForm.stayingGuestEmail || "";
    const contactPhone = rawForm.phoneNumber || rawForm.stayingGuestPhone || "";
    return {
      ...rawForm,
      inquirerType,
      adultCount: adults,
      childrenCount: children,
      guestCount,
      pax: guestCount,
      sleepingGuests: Number(booking.sleeping_guests ?? rawForm.sleepingGuests ?? 0),
      roomCount: Number(booking.room_count ?? rawForm.roomCount ?? booking.room_ids?.length ?? 1),
      stayingGuestName:
        rawForm.stayingGuestName || (inquirerType === "client" ? rawForm.guestName || "" : ""),
      stayingGuestEmail:
        rawForm.stayingGuestEmail || (inquirerType === "client" ? contactEmail : ""),
      stayingGuestPhone:
        rawForm.stayingGuestPhone || (inquirerType === "client" ? contactPhone : ""),
      resortServices: Array.isArray(rawForm.resortServices)
        ? rawForm.resortServices
        : Array.isArray(booking.resort_service_ids)
          ? booking.resort_service_ids
              .filter(Boolean)
              .map((id) => ({ id, name: id, cost: 0 }))
          : [],
    };
  }, [booking]);
  const paymentMethod = paymentDraft.method ?? (form.paymentMethod === "Bank" ? "Bank" : DEFAULT_PAYMENT_METHOD);
  const downpayment = paymentDraft.downpayment ?? Number(form.downpayment || 0);
  const setPaymentMethod = (method) => setPaymentDraft((prev) => ({ ...prev, method }));
  const setDownpayment = (value) => setPaymentDraft((prev) => ({ ...prev, downpayment: value }));

  const {
    isSubmitting,
    isSavingAddOns,
    isSendingIssue,
    isSendingMessage,
    handleSubmitDownpayment,
    handleSubmitAddOns,
    handleSendIssue,
    handleSendMessage,
  } = useTicketActions({
    booking,
    resort,
    form,
    normalizedBookingId,
    viewerRole,
    paymentMethod,
    downpayment,
    paymentNote,
    proofFiles,
    fetchTicket,
    fetchMessages,
    setBooking,
    setProofFiles,
    setPaymentNote,
    issueSubject,
    setIssueSubject,
    issueMessage,
    setIssueMessage,
    chatMessage,
    setChatMessage,
    toast,
  });

  const { downloadTicket } = useTicketImageActions({ booking, toast });

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
  const proofLogItems = Array.isArray(form.paymentProofLog)
    ? form.paymentProofLog.flatMap((entry) =>
        Array.isArray(entry?.urls)
          ? entry.urls.filter(Boolean).map((url) => ({ url, note: entry?.note ? String(entry.note).trim() : "" }))
          : []
      )
    : [];
  const proofNoteByUrl = proofLogItems.reduce((acc, item) => {
    if (!acc[item.url] && item.note) acc[item.url] = item.note;
    return acc;
  }, {});
  const orderedUrls = [];
  const seen = new Set();
  const pushUrl = (url) => {
    if (!url || seen.has(url)) return;
    seen.add(url);
    orderedUrls.push(url);
  };
  // Only use proof log URLs (single source of truth).
  proofLogItems.forEach((item) => pushUrl(item.url));
  const pendingNote = form.pendingPaymentNote && String(form.pendingPaymentNote).trim();
  const submittedProofItems = orderedUrls.map((url) => ({
    url,
    note: proofNoteByUrl[url] || pendingNote || "",
  }));
  const status = String(booking.status || "").toLowerCase();
  const isConcernOnlyMode =
    status.includes("declined") ||
    status.includes("cancel") ||
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
        onDownloadTicket={downloadTicket}
        viewerRole={viewerRole}
      />

      <TicketStayInfoCardSection
        form={form}
        booking={booking}
        resort={resort}
        approvedByName={stayInfoPayload?.approvedByName}
        assignedRoomNames={stayInfoPayload?.assignedRoomNames}
        viewerRole={viewerRole}
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
        paymentNote={paymentNote}
        setPaymentNote={setPaymentNote}
        proofFiles={proofFiles}
        setProofFiles={setProofFiles}
        isSubmitting={isSubmitting}
        onSubmitDownpayment={handleSubmitDownpayment}
        resortPaymentImageUrl={resort?.payment_image_url}
        resortBankPaymentImageUrl={resort?.bank_payment_image_url}
        gcashAccountName={resort?.gcash_account_name}
        gcashAccountNumber={resort?.gcash_account_number}
        bankName={resort?.bank_name}
        bankAccountName={resort?.bank_account_name}
        bankAccountNumber={resort?.bank_account_number}
        submittedProofItems={submittedProofItems}
        canSubmitPayment={!form.paymentPendingApproval}
      />

      {viewerRole !== "agent" ? (
        <TicketAddOnsCardSection
          key={`${booking.id}:${form.addOnsUpdatedAt || ""}:${JSON.stringify(form.resortServices || [])}`}
          initialServices={Array.isArray(form.resortServices) ? form.resortServices : []}
          availableServices={Array.isArray(resort?.extraServices) ? resort.extraServices : []}
          onSubmit={handleSubmitAddOns}
          isSubmitting={isSavingAddOns}
          canEdit={!status.includes("checked out") && !status.includes("cancel") && !status.includes("declined")}
        />
      ) : null}

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
        isSendingMessage={isSendingMessage}
      />

      <TicketIssueCardSection
        issueSubject={issueSubject}
        setIssueSubject={setIssueSubject}
        issueMessage={issueMessage}
        setIssueMessage={setIssueMessage}
        onSendIssue={handleSendIssue}
        isSendingIssue={isSendingIssue}
      />

      <Toast />
    </div>
  );
}
