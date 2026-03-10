import { buildDraftFromBooking } from "../bookingEditorUtils";
import { getCheckoutMismatchMessage, isCheckoutAmountSettled } from "@/lib/bookingPayments";

export function syncPaxFromCounts({ adultCount, childrenCount, guestCount, setDraft }) {
  const adults = Number(adultCount || 0);
  const children = Number(childrenCount || 0);
  const pax = adults + children;
  if (Number(guestCount || 0) === pax) return;
  setDraft((prev) => ({ ...prev, guestCount: pax, pax }));
}

export function loadDraftFromStorage({ booking, inlineDraftKey, isEditing }) {
  const base = buildDraftFromBooking(booking);
  if (typeof window === "undefined") return base;
  if (isEditing) return base;

  try {
    const raw = localStorage.getItem(inlineDraftKey);
    if (!raw) return base;
    const cached = JSON.parse(raw);
    return {
      ...base,
      ...cached,
      status: base.status,
      paymentMethod: base.paymentMethod,
      downpayment: base.downpayment,
      pendingDownpayment: base.pendingDownpayment,
      pendingPaymentMethod: base.pendingPaymentMethod,
      paymentPendingApproval: base.paymentPendingApproval,
      paymentProofUrl: base.paymentProofUrl,
      paymentProofUrls: base.paymentProofUrls,
      paymentSubmittedAt: base.paymentSubmittedAt,
      paymentVerified: base.paymentVerified,
      paymentVerifiedAt: base.paymentVerifiedAt,
    };
  } catch {
    return base;
  }
}

export function persistDraftToStorage({ draft, inlineDraftKey }) {
  if (typeof window === "undefined") return;
  localStorage.setItem(inlineDraftKey, JSON.stringify(draft));
}

export async function handleSaveInlineAction({
  actionBusy,
  setActionBusy,
  persist,
  draft,
  inlineDraftKey,
  setIsEditing,
  booking,
}) {
  if (actionBusy) return;
  const currentStatus = booking?.bookingForm?.status || booking?.status || "Inquiry";
  if (draft.status === "Checked Out" && currentStatus !== "Checked Out") {
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
  }
  setActionBusy(true);
  try {
    await persist(draft);
    if (typeof window !== "undefined") localStorage.removeItem(inlineDraftKey);
    setIsEditing(false);
  } finally {
    setActionBusy(false);
  }
}

export function handleCancelInlineAction({
  booking,
  setDraft,
  setProofPreviewUrl,
  inlineDraftKey,
  setIsEditing,
}) {
  const base = buildDraftFromBooking(booking);
  setDraft(base);
  setProofPreviewUrl(base.paymentProofUrl || null);
  if (typeof window !== "undefined") localStorage.removeItem(inlineDraftKey);
  setIsEditing(false);
}
