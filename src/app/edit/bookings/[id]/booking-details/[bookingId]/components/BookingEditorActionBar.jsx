"use client";

import React from "react";
import { CheckCircle, Clock, Edit3, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PREVIOUS_STATUS } from "./bookingEditorConfig";

export default function BookingEditorActionBar({
  showDecisionActions,
  showPaymentReviewActions = false,
  checkoutPaymentRequested = false,
  checkoutPaymentApproved = false,
  status,
  draftStatus,
  isEditing,
  onDecline,
  onAcceptPayment,
  onDeclinePayment,
  onBackOneStep,
  onApproveInquiry,
  onRequestPayment,
  onConfirmStay,
  onConfirmCheckout,
  onDeleteTicket,
  onOpenEditInline,
  onSaveInline,
  onCancelInline,
  actionBusy = false,
}) {
  const normalizedStatus = String(status || "").toLowerCase();
  const isDeclined = normalizedStatus === "declined";
  const isPendingCheckout = normalizedStatus === "pending checkout";
  const primaryActionLabel =
    status === "Pending Payment"
      ? "Confirm Stay"
      : status === "Pending Checkout"
        ? "Confirm Checkout"
        : "Approve";
  const runWithConfirmation = async (message, action) => {
    if (actionBusy || !action) return;
    const confirmed = window.confirm(message);
    if (!confirmed) return;
    await action();
  };

  return (
    <div className="fixed bottom-3 left-3 right-3 md:bottom-8 md:left-1/2 md:right-auto md:-translate-x-1/2 z-50 flex flex-col md:flex-row items-stretch md:items-center justify-center md:justify-start gap-2 bg-white/90 backdrop-blur-xl p-3 rounded-2xl border border-slate-200 shadow-2xl no-print max-h-[55vh] overflow-y-auto">
      {showDecisionActions && status === "Inquiry" && (
        <Button
          variant="ghost"
          className="rounded-full w-full md:w-auto px-6 md:px-8 h-11 md:h-12 text-slate-400 hover:text-rose-600 font-bold"
          onClick={() => runWithConfirmation("Are you sure you want to decline this inquiry?", onDecline)}
          disabled={actionBusy}
        >
          Decline
        </Button>
      )}
      {showPaymentReviewActions ? (
        <>
          <Button
            className="rounded-full w-full md:w-auto flex items-center justify-center px-6 md:px-10 h-11 md:h-12 font-bold shadow-lg transition-all flex gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => runWithConfirmation("Are you sure you want to accept this payment?", onAcceptPayment)}
            disabled={actionBusy}
          >
            Accept Payment
          </Button>
          <Button
            variant="outline"
            className="rounded-full w-full md:w-auto px-6 md:px-8 h-11 md:h-12 font-bold text-xs border-rose-300 text-rose-600 hover:bg-rose-50"
            onClick={() => runWithConfirmation("Are you sure you want to decline this payment?", onDeclinePayment)}
            disabled={actionBusy}
          >
            Decline Payment
          </Button>
        </>
      ) : null}
      {!showPaymentReviewActions && !isPendingCheckout && PREVIOUS_STATUS[draftStatus] ? (
        <Button
          variant="outline"
          className="rounded-full w-full md:w-auto px-6 md:px-8 h-11 md:h-12 font-bold text-xs border-slate-300 text-slate-600 hover:bg-slate-50"
          onClick={() => runWithConfirmation("Are you sure you want to go back one step?", onBackOneStep)}
          disabled={actionBusy}
        >
          Back One Step
        </Button>
      ) : null}
      {showDecisionActions && !isDeclined ? (
        status === "Inquiry" ? (
          <Button
            className="rounded-full w-full md:w-auto flex items-center justify-center px-6 md:px-10 h-11 md:h-12 font-bold shadow-lg transition-all flex gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => runWithConfirmation("Are you sure you want to approve this inquiry?", onApproveInquiry)}
            disabled={actionBusy}
          >
            <CheckCircle size={18} />
            Approve Inquiry
          </Button>
        ) : status === "Approved Inquiry" ? (
          <Button
            className="rounded-full w-full md:w-auto flex items-center justify-center px-6 md:px-10 h-11 md:h-12 font-bold shadow-lg transition-all flex gap-2 bg-amber-600 hover:bg-amber-700 text-white"
            onClick={() => runWithConfirmation("Are you sure you want to request payment for this booking?", onRequestPayment)}
            disabled={actionBusy}
          >
            <Clock size={18} />
            Request Payment
          </Button>
        ) : status === "Pending Payment" ? (
          <Button
            className="rounded-full w-full md:w-auto flex items-center justify-center px-6 md:px-10 h-11 md:h-12 font-bold shadow-lg transition-all flex gap-2 bg-amber-600 hover:bg-amber-700 text-white"
            onClick={() => runWithConfirmation("Request final payment for checkout?", onRequestPayment)}
            disabled={actionBusy}
          >
            <CheckCircle size={18} />
            Confirm Stay
          </Button>
        ) : status === "Pending Checkout" ? (
          <Button
            className="rounded-full w-full md:w-auto flex items-center justify-center px-6 md:px-10 h-11 md:h-12 font-bold shadow-lg transition-all flex gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
            onClick={onConfirmCheckout}
            disabled={actionBusy}
          >
            <CheckCircle size={18} />
            Confirm Checkout
          </Button>
        ) : null
      ) : null}
      {showDecisionActions && isDeclined ? (
        <Button
          className="rounded-full w-full md:w-auto flex items-center justify-center px-6 md:px-10 h-11 md:h-12 font-bold shadow-lg transition-all flex gap-2 bg-rose-600 hover:bg-rose-700 text-white"
          onClick={() => runWithConfirmation("Are you sure you want to delete this ticket?", onDeleteTicket)}
          disabled={actionBusy}
        >
          <Trash2 size={18} />
          Delete Ticket
        </Button>
      ) : null}
      {!isEditing ? (
        <Button
          onClick={() => {
            if (actionBusy) return;
            onOpenEditInline?.();
          }}
          disabled={actionBusy}
          className="items-center justify-center w-full md:w-auto bg-slate-900 hover:bg-black text-white rounded-full px-6 md:px-10 h-11 md:h-12 font-bold shadow-lg flex gap-2"
        >
          <Edit3 size={18} /> Edit
        </Button>
      ) : (
        <>
          <Button
            onClick={() => {
              if (actionBusy) return;
              onSaveInline?.();
            }}
            disabled={actionBusy}
            className="w-full md:w-auto bg-blue-600 flex items-center justify-center hover:bg-blue-700 text-white rounded-full px-6 md:px-10 h-11 md:h-12 font-bold shadow-lg"
          >
            Save Changes
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              if (actionBusy) return;
              onCancelInline?.();
            }}
            disabled={actionBusy}
            className="w-full md:w-auto rounded-full px-6 md:px-8 h-11 md:h-12 text-slate-600 border-slate-300"
          >
            Cancel
          </Button>
        </>
      )}
    </div>
  );
}
