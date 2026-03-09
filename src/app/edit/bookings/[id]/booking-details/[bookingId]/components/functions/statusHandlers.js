import { generateConfirmationStub } from "@/lib/bookingFlow";
import { generateTicketAccessToken, getTicketAccessExpiry } from "@/lib/ticketAccess";
import { PREVIOUS_STATUS } from "../bookingEditorConfig";

export async function handleSetStatusAction({
  actionBusy,
  setActionBusy,
  draft,
  setDraft,
  nextStatus,
  booking,
  resortName,
  persist,
}) {
  if (actionBusy) return;
  setActionBusy(true);
  try {
    const next = { ...draft, status: nextStatus };
    if (nextStatus === "Confirmed" && !next.confirmationStub?.code) {
      next.confirmationStub = generateConfirmationStub(booking.id, resortName, draft.guestName);
      // When confirming, treat any pending payment as accepted: merge into downpayment so total due reflects it
      const pending = Number(next.pendingDownpayment || 0);
      if (pending > 0) {
        next.downpayment = Number(next.downpayment || 0) + pending;
        next.paymentMethod = next.pendingPaymentMethod || next.paymentMethod;
      }
      next.paymentPendingApproval = false;
      next.pendingDownpayment = 0;
      next.pendingPaymentMethod = null;
    }
    setDraft(next);
    await persist(next);
  } finally {
    setActionBusy(false);
  }
}

export async function handleDeclineAction({ handleSetStatus }) {
  const confirmed = window.confirm("Decline this inquiry?");
  if (!confirmed) return;
  await handleSetStatus("Declined");
}

export async function handleRequestPaymentAction({
  actionBusy,
  setActionBusy,
  draft,
  setDraft,
  persist,
}) {
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
}

export async function handleApproveInquiryAction({
  actionBusy,
  setActionBusy,
  draft,
  setDraft,
  persist,
  bookingId,
  toast,
}) {
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

    try {
      const response = await fetch("/api/booking/approve-inquiry-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        toast?.({
          message: result?.error || "Failed to send approval email.",
          color: "red",
        });
        console.error("Approved inquiry email failed:", result?.error || response.statusText);
      } else if (result?.skipped) {
        toast?.({
          message: "Approval email was already sent for this booking.",
          color: "amber",
        });
      } else {
        toast?.({
          message: "Approval email sent to client.",
          color: "green",
        });
      }
    } catch (error) {
      toast?.({
        message: "Failed to send approval email.",
        color: "red",
      });
      console.error("Approved inquiry email failed:", error?.message || error);
    }
  } finally {
    setActionBusy(false);
  }
}

export async function handleRevertStepAction({
  actionBusy,
  setActionBusy,
  draft,
  setDraft,
  persist,
}) {
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
}

export async function handleVerifyProofAction({
  draft,
  actionBusy,
  setActionBusy,
  setDraft,
  persist,
  createBookingTransaction,
  notifyCaretakerOnPaymentApproval,
  booking,
}) {
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
}
