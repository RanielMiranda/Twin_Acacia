import { CheckCircle2, AlertTriangle, XCircle, Mail } from "lucide-react";
import { generateConfirmationStub } from "@/lib/bookingFlow";
import { generateTicketAccessToken, getTicketAccessExpiry } from "@/lib/ticketAccess";
import { getCheckoutMismatchMessage, isCheckoutAmountSettled } from "@/lib/bookingPayments";
import { PREVIOUS_STATUS } from "../bookingEditorConfig";
import { notifyCaretakerOnBookingConfirmed } from "@/lib/caretakerNotifications";
import { deleteSupabasePublicUrls, getStorageFolderFromPublicUrl } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

function getProofFolder(draft) {
  const explicit = draft?.paymentProofFolder;
  if (explicit) return explicit;
  const urlCandidate =
    Array.isArray(draft?.paymentProofLog)
      ? draft.paymentProofLog
          .flatMap((entry) => (Array.isArray(entry?.urls) ? entry.urls : []))
          .filter(Boolean)[0]
      : null;
  return getStorageFolderFromPublicUrl(urlCandidate);
}

export async function handleSetStatusAction({
  actionBusy,
  setActionBusy,
  draft,
  setDraft,
  nextStatus,
  booking,
  resortName,
  resortExtraServices = [],
  persist,
  onStayConfirmed,
  toast,
  actorMeta,
}) {
  if (actionBusy) return;
  const wasConfirmed = String(draft.status || "").toLowerCase().includes("confirm");
  if (nextStatus === "Confirmed") {
    const totalPaid = Number(draft.downpayment || 0) + Number(draft.pendingDownpayment || 0);
    if (totalPaid <= 0) {
      window.alert("Cannot confirm: please request and receive a downpayment first.");
      return;
    }
  }
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
    if (nextStatus === "Confirmed" && !wasConfirmed) {
      const message = await notifyCaretakerOnBookingConfirmed({
        bookingId: booking.id,
        resortName,
        guestName: next.guestName,
        entryCode: next.confirmationStub?.code,
        checkInDate: next.checkInDate,
        checkOutDate: next.checkOutDate,
      });
      onStayConfirmed?.(message);
      try {
        const response = await fetch("/api/booking/notify-caretakers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingId: booking.id }),
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok || result?.ok === false) {
          toast?.({
            message: `Error: ${result?.error || response.statusText || "Caretaker notification failed."}`,
            color: "red",
          });
        }
      } catch (error) {
        toast?.({
          message: `Error: ${error?.message || "Caretaker notification failed."}`,
          color: "red",
        });
        console.error("Caretaker SMS failed:", error?.message || error);
      }
    }
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
      agentTicketAccessToken:
        String(draft.inquirerType || "").toLowerCase() === "agent"
          ? (draft.agentTicketAccessToken || generateTicketAccessToken())
          : (draft.agentTicketAccessToken || ""),
      agentTicketAccessExpiresAt:
        String(draft.inquirerType || "").toLowerCase() === "agent"
          ? (draft.agentTicketAccessExpiresAt || getTicketAccessExpiry(30))
          : (draft.agentTicketAccessExpiresAt || ""),
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
          icon: XCircle,
        });
        console.error("Approved inquiry email failed:", result?.error || response.statusText);
      } else if (result?.skipped) {
        toast?.({
          message: "Approval email was already sent for this booking.",
          color: "amber",
          icon: AlertTriangle,
        });
      } else {
        const sentClient = result?.sent?.client;
        const sentAgent = result?.sent?.agent;
        let message = "Approval email sent.";
        if (sentClient && sentAgent) {
          message = "Approval emails sent to client and agent.";
        } else if (sentClient) {
          message = "Approval email sent to client.";
        } else if (sentAgent) {
          message = "Approval email sent to agent.";
        }
        toast?.({
          message,
          color: "green",
          icon: Mail,
        });
      }
    } catch (error) {
      toast?.({
        message: "Failed to send approval email.",
        color: "red",
        icon: XCircle,
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
    const proofFolder = getProofFolder(draft);
    const submittedUrls = Array.isArray(draft.paymentProofLog)
      ? draft.paymentProofLog.flatMap((entry) => (Array.isArray(entry?.urls) ? entry.urls : [])).filter(Boolean)
      : [];
    const loggedUrls = (Array.isArray(draft.paymentProofLog) ? draft.paymentProofLog : [])
      .flatMap((entry) => (Array.isArray(entry?.urls) ? entry.urls : []))
      .filter(Boolean);
    const missingUrls = submittedUrls.filter((url) => !loggedUrls.includes(url));
    const submitLogEntry =
      missingUrls.length > 0
        ? {
            at: draft.paymentSubmittedAt || new Date().toISOString(),
            action: "submit_payment_proof",
            paymentMethod: draft.pendingPaymentMethod || draft.paymentMethod,
            amount: Number(draft.pendingDownpayment || 0),
            folder: proofFolder,
            urls: missingUrls,
            note: draft.pendingPaymentNote || "",
          }
        : null;

    const nextLogEntry = {
      at: new Date().toISOString(),
      action: "payment_verified",
      folder: proofFolder,
      note: draft.pendingPaymentNote || "",
    };

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
      pendingPaymentNote: "",
      paymentPendingApproval: false,
      paymentProofLog: Array.isArray(draft.paymentProofLog)
        ? [...draft.paymentProofLog, ...(submitLogEntry ? [submitLogEntry] : []), nextLogEntry]
        : [...(submitLogEntry ? [submitLogEntry] : []), nextLogEntry],
      // Keep proof urls for audit/log viewing (do not delete the image immediately)
      status: draft.status,
    };
    setDraft(next);
    await persist(next);
    if (createBookingTransaction && approvedAmount > 0) {
      try {
        const totalAmount = Number(next.totalAmount || 0);
        await createBookingTransaction({
          booking_id: booking.id,
          method: nextMethod || "Pending",
          amount: approvedAmount,
          balance_after: Math.max(0, totalAmount - nextDownpayment),
          note: "Payment approved",
        });
      } catch {
        // Non-blocking: transaction logs are best-effort.
      }
    }
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
    const proofFolder = getProofFolder(draft);
    const logUrls = (Array.isArray(draft.paymentProofLog) ? draft.paymentProofLog : [])
      .flatMap((entry) => (Array.isArray(entry?.urls) ? entry.urls : []))
      .filter(Boolean);
    const urlsToDelete = Array.from(new Set([...logUrls]));
    if (urlsToDelete.length > 0) {
      try {
        await deleteSupabasePublicUrls(supabase, urlsToDelete);
      } catch (error) {
        console.error("Failed to delete proof images:", error?.message || error);
      }
    }

    const nextLogEntry = {
      at: new Date().toISOString(),
      action: "payment_declined",
      folder: proofFolder,
      note: draft.pendingPaymentNote || "",
    };
    const cleanedLog = (Array.isArray(draft.paymentProofLog) ? draft.paymentProofLog : []).map((entry) => {
      if (!Array.isArray(entry?.urls) || entry.urls.length === 0) return entry;
      return {
        ...entry,
        urls: entry.urls.filter((url) => !urlsToDelete.includes(url)),
      };
    });

    const next = {
      ...draft,
      paymentPendingApproval: false,
      pendingDownpayment: 0,
      pendingPaymentMethod: null,
      pendingPaymentNote: "",
      paymentSubmittedAt: null,
      paymentVerified: false,
      paymentVerifiedAt: null,
      paymentProofLog: [...cleanedLog, nextLogEntry],
    };
    setDraft(next);
    await persist(next);
  } finally {
    setActionBusy(false);
  }
}
