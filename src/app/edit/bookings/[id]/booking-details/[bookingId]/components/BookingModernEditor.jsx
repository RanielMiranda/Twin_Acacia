"use client";

import React, { useEffect, useState } from "react";
import { ChevronLeft, FileText, AlertCircle, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import Toast from "@/components/ui/toast/Toast";
import { generateConfirmationStub } from "@/lib/bookingFlow";
import { notifyCaretakerOnPaymentApproval } from "@/lib/caretakerNotifications";
import { generateTicketAccessToken, getTicketAccessExpiry } from "@/lib/ticketAccess";
import {
  buildDraftFromBooking,
  formatWeekdayLabel,
  formatTotalStayDays,
  overlapsByDateTime,
} from "./bookingEditorUtils";
import { PAYMENT_CHANNELS, PREVIOUS_STATUS, STATUS_PHASES } from "./bookingEditorConfig";
import BookingEditorActionBar from "./BookingEditorActionBar";
import {
  AddOnsCardSection,
  AssignRoomsCardSection,
  ClientCardSection,
  MessagesInboxCardSection,
  PaymentCardSection,
  ProofCardSection,
  StatusAuditCardSection,
  StayCardSection,
} from "./BookingEditorSections";
export default function BookingModernEditor({
  booking,
  resortName,
  onBack,
  onSave,
  onDelete,
  onOpenForm,
  onOpenTicket,
  messages,
  issues,
  ownerReply,
  setOwnerReply,
  onSendReply,
  onResolveIssue,
  conflicts = [],
  createSignedProofUrl,
  createBookingTransaction,
  resortRooms = [],
  allBookings = [],
  statusAudits = [],
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);
  const [renderedAt] = useState(() => Date.now());
  const inlineDraftKey = `booking_inline_draft:${booking.id}`;
  const [draft, setDraft] = useState(() => buildDraftFromBooking(booking));
  const [proofPreviewUrl, setProofPreviewUrl] = useState(() => buildDraftFromBooking(booking).paymentProofUrl || null);
  const [assignedRoomIds, setAssignedRoomIds] = useState(() => booking.roomIds || []);
  const [actorMeta, setActorMeta] = useState({ name: "Owner", role: "owner", id: "" });

  useEffect(() => {
    setAssignedRoomIds(booking.roomIds || []);
  }, [booking.id, booking.roomIds]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = sessionStorage.getItem("active_account_v1");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      setActorMeta({
        name: parsed?.full_name || parsed?.email || "Owner",
        role: parsed?.role || "owner",
        id: parsed?.id ? String(parsed.id) : "",
      });
    } catch {
      // keep default actor
    }
  }, []);

  useEffect(() => {
    const adults = Number(draft.adultCount || 0);
    const children = Number(draft.childrenCount || 0);
    const pax = adults + children;
    if (Number(draft.guestCount || 0) === pax) return;
    setDraft((prev) => ({ ...prev, guestCount: pax, pax }));
  }, [draft.adultCount, draft.childrenCount, draft.guestCount]);

  useEffect(() => {
    const base = buildDraftFromBooking(booking);
    if (typeof window === "undefined") {
      if (!isEditing) setDraft(base);
      return;
    }
    let next = base;
    try {
      const raw = localStorage.getItem(inlineDraftKey);
      if (raw) {
        const cached = JSON.parse(raw);
        next = {
          ...base,
          ...cached,
          status: base.status,
          paymentMethod: base.paymentMethod,
          downpayment: base.downpayment,
          pendingDownpayment: base.pendingDownpayment,
          pendingPaymentMethod: base.pendingPaymentMethod,
          paymentPendingApproval: base.paymentPendingApproval,
          paymentProofUrl: base.paymentProofUrl,
          paymentSubmittedAt: base.paymentSubmittedAt,
          paymentVerified: base.paymentVerified,
          paymentVerifiedAt: base.paymentVerifiedAt,
        };
      }
    } catch {
      next = base;
    }
    if (!isEditing) setDraft(next);
  }, [booking, inlineDraftKey, isEditing]);

  useEffect(() => {
    setProofPreviewUrl(draft.paymentProofUrl || null);
  }, [draft.paymentProofUrl]);

  const resolveSignedProofUrl = async () => {
    if (!draft.paymentProofUrl) return;
    try {
      const signed = await createSignedProofUrl?.(draft.paymentProofUrl, 60 * 60);
      if (signed) setProofPreviewUrl(signed);
    } catch {
      // Keep original URL when signing fails.
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const timer = setTimeout(() => {
      localStorage.setItem(inlineDraftKey, JSON.stringify(draft));
    }, 200);
    return () => clearTimeout(timer);
  }, [draft, inlineDraftKey]);

  const status = draft.status || "Inquiry";
  const totalStayDays = formatTotalStayDays(draft.checkInDate, draft.checkOutDate);
  const normalizedStatus = status.toLowerCase();
  const hasProof = !!draft.paymentProofUrl;
  const balance = Math.max(0, Number(draft.totalAmount || 0) - Number(draft.downpayment || 0));
  const paymentDeadlineDate = draft.paymentDeadline ? new Date(draft.paymentDeadline) : null;
  const hasDeadline = paymentDeadlineDate && !Number.isNaN(paymentDeadlineDate.getTime());
  const isDeadlineExpired = hasDeadline && paymentDeadlineDate.getTime() < renderedAt;
  const showDecisionActions = !normalizedStatus.includes("confirm");
  const bookingFormAudits = Array.isArray(draft.statusAudit) ? draft.statusAudit : [];
  const dbAudits = Array.isArray(statusAudits) ? statusAudits : [];
  const approvalAuditFromDb = dbAudits.find((entry) => {
    const next = String(entry?.new_status || "").toLowerCase();
    return next.includes("confirmed") || next.includes("approved inquiry");
  });
  const approvalAuditFromForm = [...bookingFormAudits].reverse().find((entry) => {
    const next = String(entry?.to || "").toLowerCase();
    return next.includes("confirmed") || next.includes("approved inquiry");
  });
  const approvedByName =
    approvalAuditFromForm?.actorName ||
    approvalAuditFromDb?.actor_name ||
    (approvalAuditFromDb?.actor_role === "audit" ? "system" : approvalAuditFromDb?.actor_role) ||
    "Not approved yet";

  const setField = (field, value) => setDraft((prev) => ({ ...prev, [field]: value }));

  const persist = async (nextDraft) => {
    const selectedRoomNames = (resortRooms || [])
      .filter((room) => (assignedRoomIds || []).includes(room.id))
      .map((room) => room.name)
      .filter(Boolean);
    const previousStatus = booking.bookingForm?.status || booking.status || null;
    const nextStatus = nextDraft.status || previousStatus || "Inquiry";
    const currentAudit = Array.isArray(booking.bookingForm?.statusAudit)
      ? booking.bookingForm.statusAudit
      : Array.isArray(nextDraft.statusAudit)
        ? nextDraft.statusAudit
        : [];
    const statusAudit =
      previousStatus && nextStatus && previousStatus !== nextStatus
        ? [
            ...currentAudit,
            {
              from: previousStatus,
              to: nextStatus,
              at: new Date().toISOString(),
              actor: "owner-ui",
              actorRole: actorMeta.role || "owner",
              actorId: actorMeta.id || "",
              actorName: actorMeta.name || "Owner",
            },
          ]
        : currentAudit;

    const payload = {
      ...booking,
      roomIds: assignedRoomIds,
      status: nextStatus,
      startDate: nextDraft.checkInDate || booking.startDate,
      endDate: nextDraft.checkOutDate || booking.endDate,
      checkInTime: nextDraft.checkInTime || booking.checkInTime,
      checkOutTime: nextDraft.checkOutTime || booking.checkOutTime,
      paymentDeadline: nextDraft.paymentDeadline || null,
      bookingForm: {
        ...(booking.bookingForm || {}),
        ...nextDraft,
        roomCount: assignedRoomIds.length || nextDraft.roomCount || booking.roomIds?.length || 1,
        roomName: selectedRoomNames.length > 0 ? selectedRoomNames.join(", ") : nextDraft.roomName || "",
        assignedRoomIds,
        assignedRoomNames: selectedRoomNames,
        statusAudit,
        lastActionBy: actorMeta.name || "Owner",
        lastActionRole: actorMeta.role || "owner",
        lastActionById: actorMeta.id || "",
      },
    };

    await Promise.resolve(onSave(payload));
  };

  const isRoomConflicting = (roomId) => {
    const probe = {
      id: booking.id,
      roomIds: [roomId],
      startDate: draft.checkInDate || booking.startDate,
      endDate: draft.checkOutDate || booking.endDate || draft.checkInDate || booking.startDate,
      checkInTime: draft.checkInTime || booking.checkInTime,
      checkOutTime: draft.checkOutTime || booking.checkOutTime,
      bookingForm: {
        checkInTime: draft.checkInTime || booking.checkInTime,
        checkOutTime: draft.checkOutTime || booking.checkOutTime,
      },
    };
    return (allBookings || []).some((entry) => {
      if (entry.id?.toString() === booking.id?.toString()) return false;
      if (!(entry.roomIds || []).includes(roomId)) return false;
      return overlapsByDateTime(entry, probe);
    });
  };

  const toggleAssignedRoom = (roomId) => {
    setAssignedRoomIds((prev) =>
      prev.includes(roomId) ? prev.filter((id) => id !== roomId) : [...prev, roomId]
    );
  };

  const handleSaveInline = async () => {
    if (actionBusy) return;
    setActionBusy(true);
    try {
      await persist(draft);
      if (typeof window !== "undefined") localStorage.removeItem(inlineDraftKey);
      setIsEditing(false);
    } finally {
      setActionBusy(false);
    }
  };

  useEffect(() => {
    const current = JSON.stringify(booking.roomIds || []);
    const next = JSON.stringify(assignedRoomIds || []);
    if (current === next) return;
    Promise.resolve(
      persist({
        ...draft,
        roomCount: assignedRoomIds.length || draft.roomCount || 1,
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignedRoomIds]);

  const handleCancelInline = () => {
    const base = buildDraftFromBooking(booking);
    setDraft(base);
    setProofPreviewUrl(base.paymentProofUrl || null);
    if (typeof window !== "undefined") localStorage.removeItem(inlineDraftKey);
    setIsEditing(false);
  };

  const handleSetStatus = async (nextStatus) => {
    if (actionBusy) return;
    setActionBusy(true);
    try {
      const next = { ...draft, status: nextStatus };
      if (nextStatus === "Confirmed" && !next.confirmationStub?.code) {
        next.confirmationStub = generateConfirmationStub(booking.id, resortName, draft.guestName);
        if (next.paymentVerified) {
          next.paymentPendingApproval = false;
          next.pendingDownpayment = 0;
          next.pendingPaymentMethod = null;
        }
      }
      setDraft(next);
      await persist(next);
    } finally {
      setActionBusy(false);
    }
  };

  const handleRequestPayment = async () => {
    if (actionBusy) return;
    setActionBusy(true);
    try {
      const deadline = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const next = {
        ...draft,
        status: "Pending Payment",
        paymentDeadline: deadline,
      };
      setDraft(next);
      await persist(next);
    } finally {
      setActionBusy(false);
    }
  };

  const handleApproveInquiry = async () => {
    if (actionBusy) return;
    setActionBusy(true);
    try {
      const next = {
        ...draft,
        status: "Approved Inquiry",
        ticketAccessToken: draft.ticketAccessToken || generateTicketAccessToken(),
        ticketAccessExpiresAt: draft.ticketAccessExpiresAt || getTicketAccessExpiry(30),
      };
      setDraft(next);
      await persist(next);
    } finally {
      setActionBusy(false);
    }
  };

  const handleRevertStep = async () => {
    if (actionBusy) return;
    const previous = PREVIOUS_STATUS[draft.status];
    if (!previous) return;
    const confirmed = window.confirm(`Revert status from "${draft.status}" to "${previous}"?`);
    if (!confirmed) return;
    setActionBusy(true);
    try {
      const next = { ...draft, status: previous };
      setDraft(next);
      await persist(next);
    } finally {
      setActionBusy(false);
    }
  };

  const handleVerifyProof = async () => {
    if (draft.paymentVerified || actionBusy) return;
    setActionBusy(true);
    try {
      const approvedAmount = Number(draft.pendingDownpayment || 0);
      const nextDownpayment = Number(draft.downpayment || 0) + approvedAmount;
      const nextMethod = draft.pendingPaymentMethod || draft.paymentMethod;

      const next = {
        ...draft,
        paymentVerified: true,
        paymentVerifiedAt: new Date().toISOString(),
        downpayment: nextDownpayment,
        paymentMethod: nextMethod,
        pendingDownpayment: 0,
        pendingPaymentMethod: null,
        paymentPendingApproval: false,
      };
      setDraft(next);
      await persist(next);

      if (approvedAmount > 0) {
        const balanceAfter = Math.max(0, Number(next.totalAmount || 0) - Number(next.downpayment || 0));
        try {
          await createBookingTransaction?.({
          booking_id: booking.id,
          method: nextMethod || "Pending",
          amount: approvedAmount,
          balance_after: balanceAfter,
          note: "Downpayment approved by owner",
          });
        } catch (error) {
          console.error("Failed to log booking transaction:", error.message);
        }
        await notifyCaretakerOnPaymentApproval({
          bookingId: booking.id,
          resortId: booking.resortId || booking.resort_id || null,
          guestName: next.guestName,
          amount: approvedAmount,
          method: nextMethod,
        });
      }
    } finally {
      setActionBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-52 md:pb-32 pt-10 px-4 md:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center no-print">
          <button onClick={onBack} className="group flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-all font-bold text-xs uppercase tracking-widest">
            <ChevronLeft size={16} /> Back to Overview
          </button>

          <div className="flex flex-wrap gap-2 sm:gap-3 items-center justify-start sm:justify-center">
            <Button variant="outline" onClick={onOpenForm} className="rounded-full w-full sm:w-auto flex items-center justify-center bg-white shadow-sm border-slate-200 hover:bg-slate-50 font-bold text-xs px-4 sm:px-6">
              <FileText size={16} className="mr-2" /> View Form
            </Button>
            <Button variant="outline" onClick={onOpenTicket} className="rounded-full w-full sm:w-auto flex items-center justify-center bg-white shadow-sm border-slate-200 hover:bg-slate-50 font-bold text-xs px-4 sm:px-6">
              <Ticket size={16} className="mr-2" /> Client Ticket
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const confirmed = window.confirm("Delete this booking and all related form data?");
                if (!confirmed) return;
                if (typeof window !== "undefined") localStorage.removeItem(inlineDraftKey);
                onDelete();
              }}
              className="rounded-full w-full sm:w-auto flex items-center justify-center bg-white shadow-sm border-red-200 text-red-600 hover:bg-red-50 font-bold text-xs px-4 sm:px-6"
            >
              Delete Booking
            </Button>
          </div>
        </div>

        {status === "Pending Payment" && (
          <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3 text-amber-700">
              <AlertCircle size={18} />
              <p className="text-xs font-bold uppercase tracking-wider">
                Payment Deadline: {hasDeadline ? paymentDeadlineDate.toLocaleString() : "Not set"}
              </p>
            </div>
            <span className="text-[10px] font-black text-amber-500 bg-white px-3 py-1 rounded-full border border-amber-100">
              {isDeadlineExpired ? "EXPIRED" : "AUTO-CANCEL ACTIVE"}
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <ClientCardSection
              resortName={resortName}
              isEditing={isEditing}
              draft={draft}
              setField={setField}
              status={status}
            />

            <div>
              <StayCardSection
                isEditing={isEditing}
                draft={draft}
                setField={setField}
                totalStayDays={totalStayDays}
                approvedByName={approvedByName}
                assignedRoomIds={assignedRoomIds}
                resortRooms={resortRooms}
                conflicts={conflicts}
                formatWeekdayLabel={formatWeekdayLabel}
              />
            </div>

            <AddOnsCardSection draft={draft} />

            <StatusAuditCardSection dbAudits={dbAudits} bookingFormAudits={bookingFormAudits} />
          </div>

          <div className="space-y-6">
            <ProofCardSection
              hasProof={hasProof}
              proofPreviewUrl={proofPreviewUrl}
              draft={draft}
              resolveSignedProofUrl={resolveSignedProofUrl}
              handleVerifyProof={handleVerifyProof}
            />

            <PaymentCardSection
              isEditing={isEditing}
              draft={draft}
              setField={setField}
              balance={balance}
              status={status}
              statusPhases={STATUS_PHASES}
              paymentChannels={PAYMENT_CHANNELS}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <AssignRoomsCardSection
            resortRooms={resortRooms}
            assignedRoomIds={assignedRoomIds}
            toggleAssignedRoom={toggleAssignedRoom}
            isRoomConflicting={isRoomConflicting}
          />

          <MessagesInboxCardSection
            draft={draft}
            issues={issues}
            onResolveIssue={onResolveIssue}
            messages={messages}
            ownerReply={ownerReply}
            setOwnerReply={setOwnerReply}
            onSendReply={onSendReply}
          />
        </div>
      </div>

      <BookingEditorActionBar
        showDecisionActions={showDecisionActions}
        status={status}
        draftStatus={draft.status}
        isEditing={isEditing}
        onDecline={() => handleSetStatus("Declined")}
        onBackOneStep={handleRevertStep}
        onApproveInquiry={handleApproveInquiry}
        onRequestPayment={handleRequestPayment}
        onConfirmStay={() => handleSetStatus("Confirmed")}
        onOpenEditInline={() => setIsEditing(true)}
        onSaveInline={handleSaveInline}
        onCancelInline={handleCancelInline}
        actionBusy={actionBusy}
      />
      <Toast/>
    </div>
  );
}
