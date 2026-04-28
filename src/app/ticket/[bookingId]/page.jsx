"use client";

import React, { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useParams, useSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/toast/ToastProvider";
import Toast from "@/components/ui/toast/Toast";
import {
  HeaderSection,
  InfoSection,
  ContactSection,
} from "./components";
import { DEFAULT_PAYMENT_METHOD } from "./ticket-page/constants";
import { buildStayInfoPayload } from "./ticket-page/helpers";
import { TicketLoadingSkeleton } from "./ticket-page/TicketLoadingSkeleton";
import { useTicketData } from "./ticket-page/useTicketData";
import { useTicketActions } from "./ticket-page/useTicketActions";
import { useTicketImageActions } from "./ticket-page/useTicketImageActions";
import { computeRequiredDownpayment, getRequiredDownpaymentRemaining } from "@/lib/bookingPayments";
import { computeSelectedServicesTotal } from "@/lib/utils";

const PaymentSection = dynamic(
  () => import("./components").then((mod) => mod.PaymentSection),
  { loading: () => <div className="h-40 rounded-2xl border border-slate-200 bg-white" /> }
);
const ServicesSection = dynamic(
  () => import("./components").then((mod) => mod.ServicesSection),
  { loading: () => <div className="h-40 rounded-2xl border border-slate-200 bg-white" /> }
);
const SupportSection = dynamic(
  () => import("./components").then((mod) => mod.SupportSection),
  { loading: () => <div className="h-40 rounded-2xl border border-slate-200 bg-white" /> }
);
const IssueSection = dynamic(
  () => import("./components").then((mod) => mod.IssueSection),
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
      baseAmount: Number(rawForm.baseAmount ?? resort?.price ?? 0),
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
  }, [booking, resort]);
  const paymentMethod = paymentDraft.method ?? (form.paymentMethod === "Bank" ? "Bank" : DEFAULT_PAYMENT_METHOD);
  const paid = Number(form.downpayment || 0);
  const pendingPaid = form.paymentPendingApproval ? Number(form.pendingDownpayment || 0) : 0;
  const normalizedStatus = String(booking?.status || "").toLowerCase();
  const isInitialDownpaymentStage =
    normalizedStatus === "approved inquiry" || normalizedStatus === "pending payment";
  const requiredDownpayment = Number(
    form.downpaymentRequiredAmount ||
      computeRequiredDownpayment({
        totalAmount: Number(form.totalAmount || 0),
        percentage: Number(resort?.description?.meta?.pricing?.downpaymentPercentage || 0),
      })
  );
  const requiredDownpaymentRemaining = getRequiredDownpaymentRemaining({
    requiredAmount: requiredDownpayment,
    paidAmount: paid,
    pendingAmount: pendingPaid,
  });
  const downpayment =
    paymentDraft.downpayment ??
    (isInitialDownpaymentStage && requiredDownpaymentRemaining > 0
      ? requiredDownpaymentRemaining
      : Math.max(0, Number(form.totalAmount || 0) - paid - pendingPaid));
  const setPaymentMethod = (method) => setPaymentDraft((prev) => ({ ...prev, method }));
  const setDownpayment = (value) => setPaymentDraft((prev) => ({ ...prev, downpayment: value }));
  React.useEffect(() => {
    setPaymentDraft((prev) => {
      if (prev.downpayment != null) return prev;
      return { ...prev, downpayment };
    });
  }, [downpayment]);

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
    requiredDownpaymentRemaining,
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

  // Handler to open the original booking form in a new tab
  const handleOpenForm = () => {
    if (typeof window === "undefined") return;
    const url = `/ticket/${normalizedBookingId}/form?token=${accessToken}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (loading && !booking) {
    return <TicketLoadingSkeleton />;
  }
  if (!booking) return <div className="p-10 text-center text-slate-500">Ticket not found.</div>;

  const totalAmount = Number(form.totalAmount || 0);
  const totalRate = Number(form.baseAmount || 0);
  const serviceCosts = computeSelectedServicesTotal(Array.isArray(form.resortServices) ? form.resortServices : []);
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
      <HeaderSection
        bookingId={booking.id}
        referenceNumber={booking.booking_form?.referenceNumber}
        resortName={resort?.name}
        canAccessEntryPass={canAccessEntryPass}
        onDownloadTicket={downloadTicket}
        onOpenForm={handleOpenForm}
        viewerRole={viewerRole}
      />

      <section id="stay" className="scroll-mt-32">
        <InfoSection
          form={form}
          booking={booking}
          resort={resort}
          approvedByName={stayInfoPayload?.approvedByName}
          assignedRoomNames={stayInfoPayload?.assignedRoomNames}
          viewerRole={viewerRole}
        />
      </section>

      <section id="contact" className="scroll-mt-32">
        <ContactSection resort={resort} />
      </section>

      {viewerRole !== "agent" && (
        <section id="extraservices" className="scroll-mt-32">
          <ServicesSection
            key={`${booking.id}:${form.addOnsUpdatedAt || ""}:${JSON.stringify(form.resortServices || [])}`}
            initialServices={Array.isArray(form.resortServices) ? form.resortServices : []}
            availableServices={Array.isArray(resort?.extraServices) ? resort.extraServices : []}
            onSubmit={handleSubmitAddOns}
            isSubmitting={isSavingAddOns}
            canEdit={!status.includes("checked out") && !status.includes("cancel") && !status.includes("declined")}
          />
        </section>
      )}

      <section id="payment" className="scroll-mt-32">
        <PaymentSection
          totalAmount={totalAmount}
          totalRate={totalRate}
          serviceCosts={serviceCosts}
          paid={paid}
          pendingPaid={pendingPaid}
          paymentPendingApproval={!!form.paymentPendingApproval}
          balance={balance}
          requiredDownpayment={requiredDownpaymentRemaining}
          requiredDownpaymentRemaining={requiredDownpaymentRemaining}
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
      </section>

      <SupportSection
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

      <section id="issue" className="scroll-mt-32">
        <IssueSection
          issueSubject={issueSubject}
          setIssueSubject={setIssueSubject}
          issueMessage={issueMessage}
          setIssueMessage={setIssueMessage}
          onSendIssue={handleSendIssue}
          isSendingIssue={isSendingIssue}
        />
      </section>

      <Toast />
    </div>
  );
}
  if (!booking) return <div className="p-10 text-center text-slate-500">Ticket not found.</div>;

  const totalAmount = Number(form.totalAmount || 0);
  const totalRate = Number(form.baseAmount || 0);
  const serviceCosts = computeSelectedServicesTotal(Array.isArray(form.resortServices) ? form.resortServices : []);
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

  const scrollTo = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div >
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-8 mt-16 pb-20">
        <HeaderSection
          bookingId={booking.id}
          referenceNumber={booking.booking_form?.referenceNumber}
          resortName={resort?.name}
          canAccessEntryPass={canAccessEntryPass}
          onDownloadTicket={downloadTicket}
          onOpenForm={handleOpenForm}
          viewerRole={viewerRole}
        />        
      </div>

      {/* Sub-navigation matching resort ShortcutBar style */}
      <div className="mx-auto max-w-5xl rounded-b-2xl flex justify-center sticky top-16 z-10 border-y border-slate-200/70 bg-white/85 shadow-sm backdrop-blur">
        <nav>
          <div className="mx-auto flex max-w-5xl gap-3 overflow-x-auto px-4 py-3 text-sm font-medium text-slate-600">
            {[
              { id: "stay", label: "Stay Details" },
              { id: "contact", label: "Contact" },
              ...(viewerRole !== "agent" ? [{ id: "extraservices", label: "Extra Services" }] : []),
              { id: "payment", label: "Payment" },
              { id: "issue", label: "Issue" },
            ].map((link) => (
              <button
                key={link.id}
                onClick={() => scrollTo(link.id)}
                className="whitespace-nowrap rounded-full border border-transparent px-4 py-2 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-950"
              >
                {link.label}
              </button>
            ))}
          </div>
        </nav>        
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
        <section id="stay" className="scroll-mt-32">
            <InfoSection
              form={form}
              booking={booking}
              resort={resort}
              approvedByName={stayInfoPayload?.approvedByName}
              assignedRoomNames={stayInfoPayload?.assignedRoomNames}
              viewerRole={viewerRole}
            />
          </section>

          <section id="contact" className="scroll-mt-32">
            <ContactSection resort={resort} />
          </section>

          {viewerRole !== "agent" && (
            <section id="extraservices" className="scroll-mt-32">
              <ServicesSection
                key={`${booking.id}:${form.addOnsUpdatedAt || ""}:${JSON.stringify(form.resortServices || [])}`}
                initialServices={Array.isArray(form.resortServices) ? form.resortServices : []}
                availableServices={Array.isArray(resort?.extraServices) ? resort.extraServices : []}
                onSubmit={handleSubmitAddOns}
                isSubmitting={isSavingAddOns}
                canEdit={!status.includes("checked out") && !status.includes("cancel") && !status.includes("declined")}
              />
            </section>
          )}

          <section id="payment" className="scroll-mt-32">
            <PaymentSection
              totalAmount={totalAmount}
              totalRate={totalRate}
              serviceCosts={serviceCosts}
              paid={paid}
              pendingPaid={pendingPaid}
              paymentPendingApproval={!!form.paymentPendingApproval}
              balance={balance}
              requiredDownpayment={requiredDownpaymentRemaining}
              requiredDownpaymentRemaining={requiredDownpaymentRemaining}
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
          </section>

          <SupportSection
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

          <section id="issue" className="scroll-mt-32">
            <IssueSection
              issueSubject={issueSubject}
              setIssueSubject={setIssueSubject}
              issueMessage={issueMessage}
              setIssueMessage={setIssueMessage}
              onSendIssue={handleSendIssue}
              isSendingIssue={isSendingIssue}
            />
          </section>
        </div>
      <Toast />
    </div>
  );
}
