"use client";

import React from "react";
import { CheckCircle, Clock, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  onDeleteTicket,
  onOpenEditInline,
  onSaveInline,
  onCancelInline,
  actionBusy = false,
  disableSave = false,
  balanceDue = 0,
}) {
  const normalizedStatus = String(status || "").toLowerCase();
  const isPendingCheckout = normalizedStatus === "pending checkout";
  const hasBalance = Number(balanceDue || 0) > 0;

  const runWithConfirmation = async (message, action) => {
    if (actionBusy || !action) return;
    const confirmed = window.confirm(message);
    if (!confirmed) return;
    await action();
  };

  const renderActionButton = (key, button) => (
    <Button
      key={key}
      variant={button.variant ?? ""}
      className={button.className}
      onClick={button.onClick}
      disabled={actionBusy || button.disabled}
    >
      {button.icon}
      {button.label}
    </Button>
  );

  const buildActions = () => {
    if (isEditing) {
      return [
        {
          key: "save",
          label: "Save Changes",
          className: `w-full md:w-auto bg-blue-600 flex items-center justify-center hover:bg-blue-700 text-white rounded-full px-6 md:px-10 h-11 md:h-12 font-bold shadow-lg ${
            disableSave ? "opacity-60 cursor-not-allowed" : ""
          }`,
          onClick: () => onSaveInline?.(),
          disabled: disableSave,
        },
        {
          key: "cancel",
          label: "Cancel",
          variant: "",
          className: "w-full md:w-auto rounded-full px-6 md:px-8 h-11 md:h-12 text-slate-700 border-slate-300",
          onClick: () => onCancelInline?.(),
        },
      ];
    }

    if (showPaymentReviewActions) {
      return [
        {
          key: "decline-payment",
          label: "Decline Payment",
          variant: "",
          className:
            "rounded-full w-full md:w-auto px-6 md:px-8 h-11 md:h-12 font-bold text-xs border-rose-300 text-rose-600 hover:bg-rose-50",
          onClick: () => runWithConfirmation("Are you sure you want to decline this payment?", onDeclinePayment),
        },
        {
          key: "accept-payment",
          label: "Accept Payment",
          className:
            "rounded-full w-full md:w-auto flex items-center justify-center px-6 md:px-10 h-11 md:h-12 font-bold shadow-lg transition-all flex gap-2 bg-emerald-600 hover:bg-emerald-700 text-white",
          icon: <CheckCircle size={18} />,
          onClick: () => runWithConfirmation("Are you sure you want to accept this payment?", onAcceptPayment),
        },
        {
          key: "edit",
          label: "Edit",
          className:
            "items-center justify-center w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-6 md:px-10 h-11 md:h-12 font-bold shadow-lg flex gap-2",
          icon: <Edit3 size={18} />,
          onClick: () => onOpenEditInline?.(),
        },
      ];
    }

    if (isPendingCheckout) {
      return [
        {
          key: "back",
          label: "Previous Step",
          className:
            "border shadow-md hover:bg-slate-100 rounded-full w-full md:w-auto px-6 md:px-8 h-11 md:h-12 font-bold text-xs border-slate-300 text-slate-700 hover:bg-slate-50",
          onClick: () => runWithConfirmation("Are you sure you want to go back one step?", onBackOneStep),
        },
        hasBalance
          ? {
              key: "request-payment",
              label: "Request Payment",
              className:
                "rounded-full w-full md:w-auto flex items-center justify-center px-6 md:px-10 h-11 md:h-12 font-bold shadow-lg transition-all flex gap-2 bg-amber-600 hover:bg-amber-700 text-white",
              icon: <Clock size={18} />,
              onClick: () => runWithConfirmation("Request final payment for checkout?", onRequestPayment),
            }
          : {
              key: "confirm-checkout",
              label: "Confirm Checkout",
              className:
                "rounded-full w-full md:w-auto flex items-center justify-center px-6 md:px-10 h-11 md:h-12 font-bold shadow-lg transition-all flex gap-2 bg-emerald-600 hover:bg-emerald-700 text-white",
              icon: <CheckCircle size={18} />,
              onClick: () => runWithConfirmation("Are you sure you want to confirm checkout?", onConfirmStay),
            },
        {
          key: "edit",
          label: "Edit",
          className:
            "items-center justify-center w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-6 md:px-10 h-11 md:h-12 font-bold shadow-lg flex gap-2",
          icon: <Edit3 size={18} />,
          onClick: () => onOpenEditInline?.(),
        },
      ];
    }

    if (status === "Inquiry") {
      return [
        {
          key: "decline",
          label: "Decline",
          variant: "",
          className: "rounded-full w-full md:w-auto px-6 md:px-8 h-11 md:h-12 text-rose-600 hover:text-rose-700 font-bold",
          onClick: () => runWithConfirmation("Are you sure you want to decline this inquiry?", onDecline),
        },
        {
          key: "approve",
          label: "Approve",
          className:
            "rounded-full w-full md:w-auto flex items-center justify-center px-6 md:px-10 h-11 md:h-12 font-bold shadow-lg transition-all flex gap-2 bg-blue-600 hover:bg-blue-700 text-white",
          icon: <CheckCircle size={18} />,
          onClick: () => runWithConfirmation("Are you sure you want to approve this inquiry?", onApproveInquiry),
        },
        {
          key: "edit",
          label: "Edit",
          className:
            "items-center justify-center w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-6 md:px-10 h-11 md:h-12 font-bold shadow-lg flex gap-2",
          icon: <Edit3 size={18} />,
          onClick: () => onOpenEditInline?.(),
        },
      ];
    }

    if (status === "Approved Inquiry") {
      return [
        {
          key: "back",
          label: "Previous Step",
          className:
            "border shadow-md hover:bg-slate-100 rounded-full w-full md:w-auto px-6 md:px-8 h-11 md:h-12 font-bold text-xs border-slate-300 text-slate-700 hover:bg-slate-50",
          onClick: () => runWithConfirmation("Are you sure you want to go back one step?", onBackOneStep),
        },
        {
          key: "request-payment",
          label: "Request Payment",
          className:
            "rounded-full w-full md:w-auto flex items-center justify-center px-6 md:px-10 h-11 md:h-12 font-bold shadow-lg transition-all flex gap-2 bg-amber-600 hover:bg-amber-700 text-white",
          icon: <Clock size={18} />,
          onClick: () => runWithConfirmation("Are you sure you want to request payment for this booking?", onRequestPayment),
        },
        {
          key: "edit",
          label: "Edit",
          className:
            "items-center justify-center w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-6 md:px-10 h-11 md:h-12 font-bold shadow-lg flex gap-2",
          icon: <Edit3 size={18} />,
          onClick: () => onOpenEditInline?.(),
        },
      ];
    }

    if (status === "Pending Payment") {
      return [
        {
          key: "back",
          label: "Previous Step",
          className:
            "border shadow-md hover:bg-slate-100 rounded-full w-full md:w-auto px-6 md:px-8 h-11 md:h-12 font-bold text-xs border-slate-300 text-slate-700 hover:bg-slate-50",
          onClick: () => runWithConfirmation("Are you sure you want to go back one step?", onBackOneStep),
        },
        {
          key: "request-payment",
          label: "Request Payment",
          className:
            "rounded-full w-full md:w-auto flex items-center justify-center px-6 md:px-10 h-11 md:h-12 font-bold shadow-lg transition-all flex gap-2 bg-amber-600 hover:bg-amber-700 text-white",
          icon: <Clock size={18} />,
          onClick: () =>
            runWithConfirmation("Request payment reminder for this booking?", onRequestPayment),
        },
        {
          key: "confirm",
          label: "Confirm",
          className:
            "rounded-full w-full md:w-auto flex items-center justify-center px-6 md:px-10 h-11 md:h-12 font-bold shadow-lg transition-all flex gap-2 bg-emerald-600 hover:bg-emerald-700 text-white",
          icon: <CheckCircle size={18} />,
          onClick: () => runWithConfirmation("Confirm this booking?", onConfirmStay),
        },
        {
          key: "edit",
          label: "Edit",
          className:
            "items-center justify-center w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-6 md:px-10 h-11 md:h-12 font-bold shadow-lg flex gap-2",
          icon: <Edit3 size={18} />,
          onClick: () => onOpenEditInline?.(),
        },
      ];
    }

    if (["Confirmed", "Ongoing", "Checked Out"].includes(status)) {
      return [
        {
          key: "back",
          label: "Previous Step",
          className:
            "border shadow-md hover:bg-slate-100 rounded-full w-full md:w-auto px-6 md:px-8 h-11 md:h-12 font-bold text-xs border-slate-300 text-slate-700 hover:bg-slate-50",
          onClick: () => runWithConfirmation("Are you sure you want to go back one step?", onBackOneStep),
        },
        {
          key: "edit",
          label: "Edit",
          className:
            "items-center justify-center w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-6 md:px-10 h-11 md:h-12 font-bold shadow-lg flex gap-2",
          icon: <Edit3 size={18} />,
          onClick: () => onOpenEditInline?.(),
        },
      ];
    }

    return [
      {
        key: "edit",
        label: "Edit",
        className:
          "items-center justify-center w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-6 md:px-10 h-11 md:h-12 font-bold shadow-lg flex gap-2",
        icon: <Edit3 size={18} />,
        onClick: () => onOpenEditInline?.(),
      },
    ];
  };

  const actions = buildActions();

  return (
    <div className="fixed bottom-3 left-3 right-3 md:bottom-8 md:left-1/2 md:right-auto md:-translate-x-1/2 z-50 flex flex-col md:flex-row items-stretch md:items-center justify-center md:justify-start gap-2 bg-white/90 backdrop-blur-xl p-3 rounded-2xl border border-slate-200 shadow-2xl no-print max-h-[55vh] overflow-y-auto">
      {actions.map((button) => renderActionButton(button.key, button))}
    </div>
  );
}
