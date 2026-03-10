"use client";

import React, { useState } from "react";
import { CreditCard, Upload, ShieldCheck, Loader2, CheckCircle2, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getTransformedSupabaseImageUrl } from "@/lib/utils";

export function TicketPaymentCardSection({
  totalAmount,
  paid,
  pendingPaid = 0,
  paymentPendingApproval = false,
  balance,
  paymentMethod,
  setPaymentMethod,
  downpayment,
  setDownpayment,
  proofFiles,
  setProofFiles,
  isSubmitting,
  onSubmitDownpayment,
  resortPaymentImageUrl,
  resortBankPaymentImageUrl,
  canSubmitPayment = true,
}) {
  const chosenReferenceUrl =
    paymentMethod === "Bank"
      ? resortBankPaymentImageUrl || resortPaymentImageUrl
      : resortPaymentImageUrl || resortBankPaymentImageUrl;
  const hasReference = !!chosenReferenceUrl && typeof chosenReferenceUrl === "string";
  const [referenceExpanded, setReferenceExpanded] = useState(false);
  const locked = !canSubmitPayment;
  const bigImageUrl = hasReference
    ? getTransformedSupabaseImageUrl(chosenReferenceUrl, { width: 1024, quality: 95, format: "webp" })
    : null;
  return (
    <Card className="p-6 md:p-8 border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.04)] rounded-[2.5rem]">
      <h3 className="text-sm font-black text-emerald-600 uppercase tracking-[0.2em] mb-6 md:mb-8 flex items-center gap-2">
        <CreditCard size={18} /> Payment & Verification
      </h3>

      {locked && (
        <div className="mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-600 text-sm">
          <p className="font-bold">Amount paid (verified): ₱{Number(paid || 0).toLocaleString()}</p>
          {paymentPendingApproval && Number(pendingPaid || 0) > 0 && (
            <p className="font-bold mt-1 text-amber-600">Amount submitted (pending approval): ₱{Number(pendingPaid || 0).toLocaleString()}</p>
          )}
          <p className="font-bold mt-1">Amount still due: ₱{Number(balance || 0).toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-2">
            {paymentPendingApproval
              ? "Your last payment submission is still pending approval. Wait for the owner to accept it before sending another one."
              : "Payment has been submitted or confirmed. Use the form below only when requested to pay."}
          </p>
        </div>
      )}

      <div className={`grid gap-6 md:gap-8 ${hasReference ? "grid-cols-1 lg:grid-cols-12" : "grid-cols-1 lg:grid-cols-12"}`}>
        {hasReference && (
          <div className="lg:col-span-3 order-1 flex flex-col items-center justify-start">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2 w-full">Payment reference (click to enlarge)</p>
            <button
              type="button"
              onClick={() => setReferenceExpanded(true)}
              className="w-full max-w-[200px] sm:max-w-[240px] lg:max-w-full aspect-square max-h-[200px] sm:max-h-[240px] lg:max-h-[220px] bg-slate-50 rounded-2xl border border-slate-100 p-3 flex items-center justify-center cursor-pointer hover:border-emerald-200 hover:ring-2 hover:ring-emerald-100 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-200"
              aria-label="View payment reference larger"
            >
              <img
                src={getTransformedSupabaseImageUrl(chosenReferenceUrl, { width: 512, quality: 90, format: "webp" })}
                alt="Payment reference"
                className="w-full h-full object-contain pointer-events-none"
              />
            </button>
            {referenceExpanded && bigImageUrl && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
                onClick={() => setReferenceExpanded(false)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Escape" && setReferenceExpanded(false)}
                aria-label="Close"
              >
                <button
                  type="button"
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/90 text-slate-700 hover:bg-white"
                  onClick={() => setReferenceExpanded(false)}
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
                <img
                  src={bigImageUrl}
                  alt="Payment reference (enlarged)"
                  className="max-w-full max-h-[90vh] w-auto h-auto object-contain rounded-xl shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}
          </div>
        )}

        <div className={`space-y-6 ${hasReference ? "lg:col-span-5 order-2" : "lg:col-span-8"}`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            <label className="space-y-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Payment Method
              </span>
              <select
                className="w-full rounded-2xl border-slate-100 bg-slate-50 px-4 py-3 font-bold text-slate-700 focus:ring-2 focus:ring-blue-100 outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                disabled={locked}
              >
                <option value="GCash">GCash</option>
                <option value="Bank">Bank Transfer</option>
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Deposit Amount (PHP)
              </span>
              <input
                className="w-full rounded-2xl border-slate-100 bg-slate-50 px-4 py-3 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-100 disabled:opacity-60 disabled:cursor-not-allowed"
                type="number"
                value={downpayment}
                onChange={(e) => setDownpayment(Number(e.target.value))}
                disabled={locked}
              />
            </label>
          </div>

          <label className="block space-y-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Upload Screenshot / Receipt
            </span>
            <div className={`relative group border-2 border-dashed border-slate-200 rounded-2xl p-4 md:p-6 bg-slate-50/50 transition-all ${locked ? "cursor-not-allowed opacity-60" : "hover:bg-white hover:border-blue-400 cursor-pointer"}`}>
              <input
                className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setProofFiles(Array.from(e.target.files || []))}
                disabled={locked}
              />
              <div className="flex flex-col items-center justify-center gap-2 text-slate-400 group-hover:text-blue-500">
                {proofFiles?.length ? (
                  <CheckCircle2 size={24} className="text-emerald-500" />
                ) : (
                  <Upload size={24} />
                )}
                <p className="text-xs font-bold uppercase tracking-tighter text-center">
                  {proofFiles?.length
                    ? `${proofFiles.length} file${proofFiles.length === 1 ? "" : "s"} selected`
                    : "Tap to browse or drop files here"}
                </p>
                {proofFiles?.length ? (
                  <p className="text-[11px] text-slate-500 text-center">
                    {proofFiles.map((file) => file.name).join(", ")}
                  </p>
                ) : null}
              </div>
            </div>
          </label>
        </div>

        <div className={`bg-slate-900 rounded-2xl p-6 md:p-8 text-white flex flex-col justify-between ${hasReference ? "lg:col-span-4 order-3" : "lg:col-span-4"}`}>
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
                Total Contract Price
              </p>
              <p className="text-3xl font-black italic">₱{Number(totalAmount || 0).toLocaleString()}</p>
            </div>
            <div className="h-px bg-white/10 w-full" />
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Already Paid</span>
                <span className="font-bold">₱{Number(paid || 0).toLocaleString()}</span>
              </div>
              {paymentPendingApproval && Number(pendingPaid || 0) > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-amber-400">Submitted (pending approval)</span>
                  <span className="font-bold text-amber-300">₱{Number(pendingPaid || 0).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-black text-blue-400 pt-2">
                <span>Balance</span>
                <span>₱{Number(balance || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <Button
            disabled={locked || isSubmitting || !proofFiles?.length}
            className="w-full mt-8 bg-emerald-500 hover:bg-emerald-600 h-14 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-900/20 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={onSubmitDownpayment}
          >
            {isSubmitting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <ShieldCheck size={18} />
            )}
            {isSubmitting ? "Processing..." : "Submit Payment"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
