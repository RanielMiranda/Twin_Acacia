"use client";

import React, { useEffect, useState } from "react";
import { ChevronLeft, FileText, AlertCircle, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import Toast from "@/components/ui/toast/Toast";
import { useToast } from "@/components/ui/toast/ToastProvider";
import { useAccounts } from "@/components/useclient/AccountsClient";
import {
  buildDraftFromBooking,
  formatWeekdayLabel,
  formatTotalStayDays,
} from "./bookingEditorUtils";
import { overlapsByDateTime } from "./bookingEditorUtils";
import { PAYMENT_CHANNELS, STATUS_PHASES } from "./bookingEditorConfig";
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
import { buildPersistPayload } from "./functions/payloadHandlers";
import { handleCancelInlineAction, handleSaveInlineAction, loadDraftFromStorage, persistDraftToStorage, syncPaxFromCounts } from "./functions/editHandlers";
import { handleApproveInquiryAction, handleDeclineAction, handleDeclineProofAction, handleRequestPaymentAction, handleRevertStepAction, handleSetStatusAction, handleVerifyProofAction } from "./functions/statusHandlers";
import { isRoomConflictingForBooking, resolveApprovedByName } from "./functions/utilHandlers";
import { isCheckoutAmountSettled } from "@/lib/bookingPayments";
export default function BookingModernEditor({
  booking,
  resortName,
  onBack,
  onSave,
  onDelete,
  onOpenForm,
  onOpenTicket,
  onOpenBooking,
  onOpenCalendar,
  messages,
  issues,
  ownerReply,
  setOwnerReply,
  onSendReply,
  onRefreshMessages,
  refreshingMessages = false,
  onResolveIssue,
  createSignedProofUrl,
  createBookingTransaction,
  resortRooms = [],
  resortExtraServices = [],
  allBookings = [],
  statusAudits = [],
  transactions = [],
  resortPaymentImageUrl,
  onEditingChange,
}) {
  const { toast, persistentToast } = useToast();
  const { activeAccount } = useAccounts();
  const [isEditing, setIsEditing] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);
  const [renderedAt] = useState(() => Date.now());
  const inlineDraftKey = `booking_inline_draft:${booking.id}`;
  const [draft, setDraft] = useState(() => buildDraftFromBooking(booking));
  const [proofPreviewUrls, setProofPreviewUrls] = useState(() => buildDraftFromBooking(booking).paymentProofUrls || []);
  const [assignedRoomIds, setAssignedRoomIds] = useState(() => booking.roomIds || []);
  const [actorMeta, setActorMeta] = useState({ name: "Owner", role: "owner", id: "" });
  useEffect(() => {
    onEditingChange?.(isEditing);
  }, [isEditing, onEditingChange]);
  const dynamicConflicts = React.useMemo(() => {
    const probe = {
      id: booking.id,
      startDate: draft.checkInDate || booking.startDate,
      endDate: draft.checkOutDate || booking.endDate || draft.checkInDate || booking.startDate,
      checkInTime: draft.checkInTime || booking.checkInTime,
      checkOutTime: draft.checkOutTime || booking.checkOutTime,
      bookingForm: {
        checkInTime: draft.checkInTime || booking.checkInTime,
        checkOutTime: draft.checkOutTime || booking.checkOutTime,
      },
    };

    return (allBookings || []).filter((entry) => {
      if (entry.id?.toString() === booking.id?.toString()) return false;
      const normalized = String(entry.status || entry.bookingForm?.status || "").toLowerCase();
      if (!normalized.includes("confirm") && !normalized.includes("ongoing")) return false;
      return overlapsByDateTime(entry, probe);
    });
  }, [allBookings, booking, draft]);

  const hasConflicts = dynamicConflicts.length > 0;
  const blockedRanges = React.useMemo(() => {
    const normalizeRoomIds = (value) => {
      if (Array.isArray(value)) return value;
      if (typeof value === "string") {
        try {
          const parsed = JSON.parse(value);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      }
      return [];
    };
    const roomIds =
      assignedRoomIds.length > 0
        ? assignedRoomIds
        : normalizeRoomIds(booking.roomIds || booking.room_ids);
    if (!roomIds || roomIds.length === 0) return [];
    return (allBookings || [])
      .filter((entry) => {
        if (entry.id?.toString() === booking.id?.toString()) return false;
        const normalized = String(entry.status || entry.bookingForm?.status || "").toLowerCase();
        if (!normalized.includes("confirm") && !normalized.includes("ongoing") && !normalized.includes("pending checkout")) {
          return false;
        }
        const entryRoomIds = normalizeRoomIds(
          entry.roomIds || entry.room_ids || entry.bookingForm?.assignedRoomIds
        );
        return entryRoomIds.some((roomId) => roomIds.includes(roomId));
      })
      .map((entry) => {
        const startValue =
          entry.startDate ||
          entry.checkInDate ||
          entry.bookingForm?.checkInDate ||
          entry.bookingForm?.checkIn ||
          "";
        const endValue =
          entry.endDate ||
          entry.checkOutDate ||
          entry.bookingForm?.checkOutDate ||
          entry.bookingForm?.checkOut ||
          startValue;
        if (!startValue) return null;
        const start = new Date(`${startValue}T00:00:00Z`);
        const end = new Date(`${(endValue || startValue)}T00:00:00Z`);
        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
        return { start, end };
      })
      .filter(Boolean);
  }, [allBookings, assignedRoomIds, booking.id, booking.roomIds]);

  useEffect(() => {
    setAssignedRoomIds(booking.roomIds || []);
  }, [booking.id, booking.roomIds]);

  useEffect(() => {
    if (!activeAccount) {
      setActorMeta({ name: "Owner", role: "owner", id: "" });
      return;
    }
    setActorMeta({
      name: activeAccount?.full_name || activeAccount?.email || "Owner",
      role: activeAccount?.role || "owner",
      id: activeAccount?.id ? String(activeAccount.id) : "",
    });
  }, [activeAccount]);

  useEffect(() => {
    syncPaxFromCounts({
      adultCount: draft.adultCount,
      childrenCount: draft.childrenCount,
      guestCount: draft.guestCount,
      setDraft,
    });
  }, [draft.adultCount, draft.childrenCount, draft.guestCount]);

  useEffect(() => {
    const next = loadDraftFromStorage({ booking, inlineDraftKey, isEditing });
    if (!isEditing) setDraft(next);
  }, [booking, inlineDraftKey, isEditing]);

  useEffect(() => {
    setProofPreviewUrls(Array.isArray(draft.paymentProofUrls) ? draft.paymentProofUrls : []);
  }, [draft.paymentProofUrls]);

  const resolveSignedProofUrls = async () => {
    if (!Array.isArray(draft.paymentProofUrls) || draft.paymentProofUrls.length === 0) return;
    try {
      const signedUrls = await Promise.all(
        draft.paymentProofUrls.map(async (proofUrl) => (await createSignedProofUrl?.(proofUrl, 60 * 60)) || proofUrl)
      );
      setProofPreviewUrls(signedUrls.filter(Boolean));
    } catch {
      // Keep original URL when signing fails.
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const timer = setTimeout(() => {
      persistDraftToStorage({ draft, inlineDraftKey });
    }, 200);
    return () => clearTimeout(timer);
  }, [draft, inlineDraftKey]);

  const status = draft.status || "Inquiry";
  const totalStayDays = formatTotalStayDays(draft.checkInDate, draft.checkOutDate);
  const isStayRangeInvalid =
    !!draft.checkInDate &&
    !!draft.checkOutDate &&
    new Date(draft.checkOutDate).getTime() < new Date(draft.checkInDate).getTime();
  const normalizedStatus = status.toLowerCase();
  const hasProof = Array.isArray(draft.paymentProofUrls) && draft.paymentProofUrls.length > 0;
  const effectivePaid = Number(draft.downpayment || 0) + (status === "Confirmed" ? Number(draft.pendingDownpayment || 0) : 0);
  const balance = Math.max(0, Number(draft.totalAmount || 0) - effectivePaid);
  const paymentDeadlineDate = draft.paymentDeadline ? new Date(draft.paymentDeadline) : null;
  const hasDeadline = paymentDeadlineDate && !Number.isNaN(paymentDeadlineDate.getTime());
  const isDeadlineExpired = hasDeadline && paymentDeadlineDate.getTime() < renderedAt;
  const showDecisionActions = ["inquiry", "approved inquiry", "pending payment", "pending checkout", "declined"].includes(normalizedStatus);
  const bookingFormAudits = Array.isArray(draft.statusAudit) ? draft.statusAudit : [];
  const dbAudits = Array.isArray(statusAudits) ? statusAudits : [];
  const approvedByName = resolveApprovedByName({ bookingFormAudits, dbAudits });

  const setField = (field, value) => setDraft((prev) => ({ ...prev, [field]: value }));

  const persist = async (nextDraft) => {
    const payload = buildPersistPayload({ booking, nextDraft, assignedRoomIds, resortRooms, actorMeta });
    await Promise.resolve(onSave(payload));
  };

  const isRoomConflicting = (roomId) => {
    return isRoomConflictingForBooking({ roomId, booking, draft, allBookings });
  };

  const toggleAssignedRoom = (roomId) => {
    setAssignedRoomIds((prev) =>
      prev.includes(roomId) ? prev.filter((id) => id !== roomId) : [...prev, roomId]
    );
  };

  const handleSaveInline = async () => {
    await handleSaveInlineAction({
      actionBusy,
      setActionBusy,
      persist,
      draft,
      inlineDraftKey,
      setIsEditing,
      booking,
    });
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
    handleCancelInlineAction({
      booking,
      setDraft,
      setProofPreviewUrl: (value) => setProofPreviewUrls(value ? [value] : []),
      inlineDraftKey,
      setIsEditing,
    });
  };

  const handleSetStatus = async (nextStatus) => {
    await handleSetStatusAction({
      actionBusy,
      setActionBusy,
      draft,
      setDraft,
      nextStatus,
      booking,
      resortName,
      persist,
      onStayConfirmed: (message) => {
        persistentToast?.({
          message: message || "Caretaker notification prepared for confirmed stay.",
          color: "emerald",
        });
      },
    });
  };

  const handleDecline = async () => {
    await handleDeclineAction({ handleSetStatus });
  };

  const handleRequestPayment = async () => {
    await handleRequestPaymentAction({ actionBusy, setActionBusy, draft, setDraft, persist });
  };

  const handleApproveInquiry = async () => {
    if (hasConflicts) {
      toast({
        message: "Approval blocked: this booking conflicts with existing reservations.",
        color: "amber",
      });
      return;
    }
    await handleApproveInquiryAction({
      actionBusy,
      setActionBusy,
      draft,
      setDraft,
      persist,
      bookingId: booking.id,
      toast,
    });
  };

  const handleRevertStep = async () => {
    await handleRevertStepAction({ actionBusy, setActionBusy, draft, setDraft, persist });
  };

  const handleVerifyProof = async () => {
    await handleVerifyProofAction({
      draft,
      actionBusy,
      setActionBusy,
      setDraft,
      persist,
      createBookingTransaction,
      booking,
    });
  };

  const handleDeclineProof = async () => {
    await handleDeclineProofAction({
      draft,
      actionBusy,
      setActionBusy,
      setDraft,
      persist,
    });
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
                onDelete();
              }}
              className="rounded-full w-full sm:w-auto flex items-center justify-center bg-white shadow-sm border-red-200 text-red-600 hover:bg-red-50 font-bold text-xs px-4 sm:px-6"
            >
              Cancel Booking
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
                conflicts={dynamicConflicts}
                formatWeekdayLabel={formatWeekdayLabel}
                onOpenConflict={() => {
                  const conflictBooking = dynamicConflicts[0];
                  if (!conflictBooking?.id) return;
                  onOpenBooking?.(conflictBooking.id);
                }}
              onOpenCalendar={onOpenCalendar}
              isStayRangeInvalid={isStayRangeInvalid}
              blockedRanges={blockedRanges}
            />
            </div>

            <AddOnsCardSection
              draft={draft}
              isEditing={isEditing}
              setField={setField}
              availableServices={resortExtraServices}
            />

            <StatusAuditCardSection dbAudits={dbAudits} bookingFormAudits={bookingFormAudits} transactions={transactions} />
          </div>

          <div className="space-y-6">
            <ProofCardSection
              hasProof={hasProof}
              proofPreviewUrls={proofPreviewUrls}
              draft={draft}
              resolveSignedProofUrl={resolveSignedProofUrls}
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
            isEditing={isEditing}
          />

          <MessagesInboxCardSection
            issues={issues}
            onResolveIssue={onResolveIssue}
            messages={messages}
            onRefreshMessages={onRefreshMessages}
            refreshingMessages={refreshingMessages}
            ownerReply={ownerReply}
            setOwnerReply={setOwnerReply}
            onSendReply={onSendReply}
          />
        </div>
      </div>

      <BookingEditorActionBar
        showDecisionActions={showDecisionActions}
        showPaymentReviewActions={draft.paymentPendingApproval}
        checkoutPaymentRequested={!!draft.checkoutPaymentRequestedAt}
        checkoutPaymentApproved={
          normalizedStatus === "pending checkout"
            ? isCheckoutAmountSettled({ totalAmount: draft.totalAmount, paidAmount: draft.downpayment }) &&
              !draft.paymentPendingApproval
            : false
        }
        status={status}
        draftStatus={draft.status}
        isEditing={isEditing}
        onDecline={handleDecline}
        onAcceptPayment={handleVerifyProof}
    onDeclinePayment={handleDeclineProof}
    onBackOneStep={handleRevertStep}
    onApproveInquiry={handleApproveInquiry}
    onRequestPayment={handleRequestPayment}
    onConfirmStay={() => handleSetStatus(status === "Pending Checkout" ? "Checked Out" : "Confirmed")}
        onDeleteTicket={() => {
          const confirmed = window.confirm("Delete this declined ticket and related data?");
          if (!confirmed) return;
          if (typeof window !== "undefined") localStorage.removeItem(inlineDraftKey);
          onDelete();
        }}
        onOpenEditInline={() => setIsEditing(true)}
        onSaveInline={handleSaveInline}
        onCancelInline={handleCancelInline}
        actionBusy={actionBusy}
        disableSave={isStayRangeInvalid}
      />
      <Toast/>
    </div>
  );
}
