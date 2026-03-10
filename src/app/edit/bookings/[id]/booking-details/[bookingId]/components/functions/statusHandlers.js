import { generateConfirmationStub } from "@/lib/bookingFlow";
import { generateTicketAccessToken, getTicketAccessExpiry } from "@/lib/ticketAccess";
import { getCheckoutMismatchMessage, isCheckoutAmountSettled } from "@/lib/bookingPayments";
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
  if (nextStatus === "Checked Out") {
    const isSettled = isCheckoutAmountSettled({
      totalAmount: draft.totalAmount,
      paidAmount: draft.downpayment,
    });
    if (!isSettled) {
      window.alert(
        getCheckoutMismatchMessage({
          totalAmount: draft.totalAmount,
          paidAmount: draft.downpayment,
        })
      );
      return;
    }
    const confirmed = window.confirm("Confirm checkout for this booking?");
    if (!confirmed) return;
  }
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
    const normalizedStatus = String(draft.status || "").toLowerCase();

    const next =
      normalizedStatus === "pending checkout"
        ? {
            ...draft,
            checkoutPaymentRequestedAt: draft.checkoutPaymentRequestedAt || new Date().toISOString(),
            checkoutPaymentDeadline: deadline,
            paymentDeadline: deadline,
          }
        : {
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
  booking,
}) {
  if (draft.paymentVerified || actionBusy) return;
  setActionBusy(true);
  try {
    const approvedAmount = Number(draft.pendingDownpayment || 0);
    const nextDownpayment = Number(draft.downpayment || 0) + approvedAmount;
    const nextMethod = draft.pendingPaymentMethod || draft.paymentMethod;
    const isFullyPaid = Number(draft.totalAmount || 0) > 0
      ? nextDownpayment >= Number(draft.totalAmount || 0)
      : false;

    const next = {
      ...draft,
      paymentVerified: true,
      paymentVerifiedAt: new Date().toISOString(),
      checkoutPaymentApprovedAt:
        String(draft.status || "").toLowerCase() === "pending checkout"
          ? new Date().toISOString()
          : draft.checkoutPaymentApprovedAt || null,
      downpayment: nextDownpayment,
      paymentMethod: nextMethod,
      pendingDownpayment: 0,
      pendingPaymentMethod: null,
      paymentPendingApproval: false,
      status:
        draft.status === "Pending Payment" && isFullyPaid
          ? "Confirmed"
          : draft.status,
    };
    setDraft(next);
    await persist(next);
  } finally {
    setActionBusy(false);
  }
}

export async function handleDeclineProofAction({
  draft,
  actionBusy,
  setActionBusy,
  setDraft,
  persist,
}) {
  if (!draft.paymentPendingApproval || actionBusy) return;
  const confirmed = window.confirm("Decline this submitted payment and allow the client to upload again?");
  if (!confirmed) return;

  setActionBusy(true);
  try {
    const next = {
      ...draft,
      paymentPendingApproval: false,
      pendingDownpayment: 0,
      pendingPaymentMethod: null,
      paymentSubmittedAt: null,
      paymentVerified: false,
      paymentVerifiedAt: null,
      paymentProofUrl: null,
      paymentProofUrls: [],
    };
    setDraft(next);
    await persist(next);
  } finally {
    setActionBusy(false);
  }
}
