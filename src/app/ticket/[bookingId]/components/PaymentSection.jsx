"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  CreditCard,
  Upload,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  X,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getTransformedSupabaseImageUrl } from "@/lib/utils";

const PaymentSection = React.memo(function PaymentSection({
  totalAmount,
  totalRate = 0,
  serviceCosts = 0,
  paid,
  pendingPaid = 0,
  paymentPendingApproval = false,
  balance,
  requiredDownpayment = 0,
  requiredDownpaymentRemaining = 0,
  paymentMethod,
  setPaymentMethod,
  downpayment,
  setDownpayment,
  paymentNote,
  setPaymentNote,
  proofFiles,
  setProofFiles,
  isSubmitting,
  onSubmitDownpayment,
  resortPaymentImageUrl,
  resortBankPaymentImageUrl,
  gcashAccountName,
  gcashAccountNumber,
  bankName,
  bankAccountName,
  bankAccountNumber,
  canSubmitPayment = true,
  submittedProofItems = [],
}) {
  const chosenReferenceUrl =
    paymentMethod === "Bank"
      ? resortBankPaymentImageUrl || resortPaymentImageUrl
      : resortPaymentImageUrl || resortBankPaymentImageUrl;
  const hasReference = !!chosenReferenceUrl && typeof chosenReferenceUrl === "string";
  const [referenceExpanded, setReferenceExpanded] = useState(false);
  const [proofPreviewExpanded, setProofPreviewExpanded] = useState(null);
  const [submittedActiveIndex, setSubmittedActiveIndex] = useState(0);
  const locked = !canSubmitPayment;
  const bigImageUrl = hasReference
    ? getTransformedSupabaseImageUrl(chosenReferenceUrl, { width: 1024, quality: 95, format: "webp" })
    : null;
  const gcashDetails = [
    gcashAccountName ? `Account Name: ${gcashAccountName}` : null,
    gcashAccountNumber ? `Account Number: ${gcashAccountNumber}` : null,
  ].filter(Boolean);
  const bankDetails = [
    bankName ? `Bank: ${bankName}` : null,
    bankAccountName ? `Account Name: ${bankAccountName}` : null,
    bankAccountNumber ? `Account Number: ${bankAccountNumber}` : null,
  ].filter(Boolean);
  const proofPreviews = useMemo(
    () =>
      (proofFiles || [])
        .filter((file) => file instanceof File)
        .map((file) => ({
          name: file.name,
          url: URL.createObjectURL(file),
        })),
    [proofFiles]
  );

  useEffect(() => {
    return () => {
      proofPreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [proofPreviews]);

  useEffect(() => {
    if (submittedProofItems.length === 0) {
      setSubmittedActiveIndex(0);
      return;
    }
    setSubmittedActiveIndex((prev) => Math.min(prev, submittedProofItems.length - 1));
  }, [submittedProofItems]);

  return (
    <Card className="rounded-[2.5rem] bg-white border-slate-100 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.04)] md:p-8">
      <h3 className="mb-6 flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em] text-emerald-600 md:mb-8">
        <CreditCard size={18} /> Payment & Verification
      </h3>

      {locked && (
        <div className="mb-6 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600">
          <p className="font-bold text-white">Amount paid (verified): PHP {Number(paid || 0).toLocaleString()}</p>
          {paymentPendingApproval && Number(pendingPaid || 0) > 0 && (
            <p className="mt-1 font-bold text-amber-600">
              Amount submitted (pending approval): PHP {Number(pendingPaid || 0).toLocaleString()}
            </p>
          )}
          <p className="mt-1 font-bold">Amount still due: PHP {Number(balance || 0).toLocaleString()}</p>
          <p className="mt-2 text-xs text-slate-500">
            {paymentPendingApproval
              ? "Your last payment submission is still pending approval. Wait for the owner to accept it before sending another one."
              : "Payment has been submitted or confirmed. Use the form below only when requested to pay."}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:gap-8">
        <div className={`grid gap-6 md:gap-8 ${hasReference ? "grid-cols-1 lg:grid-cols-12" : "grid-cols-1 lg:grid-cols-12"}`}>
          {hasReference && (
            <div className="order-1 flex flex-col items-center justify-start lg:col-span-3">
              <p className="mb-2 w-full text-[10px] font-black uppercase tracking-wider text-slate-500">
                Payment reference (click to enlarge)
              </p>
              <button
                type="button"
                onClick={() => setReferenceExpanded(true)}
                className="aspect-square max-h-[200px] w-full max-w-[200px] cursor-pointer rounded-2xl border border-slate-100 bg-slate-50 p-3 transition-all hover:border-emerald-200 hover:ring-2 hover:ring-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-200 sm:max-h-[240px] sm:max-w-[240px] lg:max-h-[220px] lg:max-w-full"
                aria-label="View payment reference larger"
              >
                <img
                  src={getTransformedSupabaseImageUrl(chosenReferenceUrl, { width: 512, quality: 90, format: "webp" })}
                  alt="Payment reference"
                  className="h-full w-full object-contain"
                />
              </button>
              {(paymentMethod === "Bank" ? bankDetails : gcashDetails).length > 0 ? (
                <div className="mt-3 w-full space-y-1 rounded-2xl border border-slate-100 bg-white p-3 text-[11px] text-slate-600">
                  {(paymentMethod === "Bank" ? bankDetails : gcashDetails).map((line, idx) => (
                    <p key={`payment-detail-${idx}`} className="font-semibold">
                      {line}
                    </p>
                  ))}
                </div>
              ) : (
                <div className="mt-3 w-full rounded-2xl border border-slate-100 bg-white p-3 text-[11px] text-slate-400">
                  Add payment account details in the resort builder.
                </div>
              )}
              {referenceExpanded && bigImageUrl && (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
                  onClick={() => setReferenceExpanded(false)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Escape" && setReferenceExpanded(false)}
                  aria-label="Close"
                >
                  <button
                    type="button"
                    className="absolute right-4 top-4 rounded-full bg-white/90 p-2 text-slate-700 hover:bg-white"
                    onClick={() => setReferenceExpanded(false)}
                    aria-label="Close"
                  >
                    <X size={20} />
                  </button>
                  <img
                    src={bigImageUrl}
                    alt="Payment reference (enlarged)"
                    className="h-auto max-h-[90vh] w-auto max-w-full rounded-xl object-contain shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              )}
            </div>
          )}

          <div className={`space-y-6 ${hasReference ? "order-2 lg:col-span-5" : "lg:col-span-8"}`}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
              <label className="space-y-2">
                <span className="ml-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Payment Method
                </span>
                <select
                  className="w-full rounded-2xl border-slate-100 bg-slate-50 px-4 py-3 font-bold text-slate-700 outline-none transition-all focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  disabled={locked}
                >
                  <option value="GCash">GCash</option>
                  <option value="Bank">Bank Transfer</option>
                </select>
              </label>

              <label className="space-y-2">
                <span className="ml-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Deposit Amount (PHP)
                </span>
                <input
                  className="w-full rounded-2xl border-slate-100 bg-slate-50 px-4 py-3 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                  type="number"
                  max={requiredDownpaymentRemaining > 0 ? Number(requiredDownpaymentRemaining) : undefined}
                  value={downpayment}
                  onChange={(e) => setDownpayment(Number(e.target.value))}
                  disabled={locked}
                />
              </label>
            </div>

            <label className="block space-y-2">
              <span className="ml-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                Upload Screenshot / Receipt
              </span>
              <div className={`group relative rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-4 transition-all md:p-6 ${locked ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:border-blue-400 hover:bg-white"}`}>
                <input
                  className="absolute inset-0 cursor-pointer opacity-0 disabled:cursor-not-allowed"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setProofFiles(Array.from(e.target.files || []))}
                  disabled={locked}
                />
                <div className="flex flex-col items-center justify-center gap-2 text-slate-400 group-hover:text-blue-500">
                  {proofFiles?.length ? <CheckCircle2 size={24} className="text-emerald-500" /> : <Upload size={24} />}
                  <p className="text-center text-xs font-bold uppercase tracking-tighter">
                    {proofFiles?.length
                      ? `${proofFiles.length} file${proofFiles.length === 1 ? "" : "s"} selected`
                      : "Tap to browse or drop files here"}
                  </p>
                  {proofFiles?.length ? (
                    <p className="text-center text-[11px] text-slate-500">{proofFiles.map((file) => file.name).join(", ")}</p>
                  ) : null}
                </div>
              </div>
            </label>

            <label className="block space-y-2">
              <span className="ml-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                Payment Note (Reference / Sender Details)
              </span>
              <textarea
                className="min-h-[90px] w-full resize-none rounded-2xl border-slate-100 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                value={paymentNote || ""}
                onChange={(e) => setPaymentNote?.(e.target.value)}
                placeholder="Example: Ref #123456, sent from Juan D."
                disabled={locked}
              />
            </label>

            {proofPreviews.length ? (
              <div className="space-y-2">
                <p className="ml-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Selected Image Preview
                </p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {proofPreviews.map((preview) => (
                    <button
                      type="button"
                      key={preview.url}
                      className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                      onClick={() => setProofPreviewExpanded(preview.url)}
                      aria-label={`Preview ${preview.name}`}
                    >
                      <img src={preview.url} alt={preview.name} className="h-28 w-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className={`flex flex-col justify-between rounded-2xl bg-slate-900 p-6 text-white md:p-8 ${hasReference ? "order-3 lg:col-span-4" : "lg:col-span-4"}`}>
            <div className="space-y-4">
              <div>
                <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Total Contract Price
                </p>
                <p className="text-3xl font-black italic">PHP {Number(totalAmount || 0).toLocaleString()}</p>
              </div>
              <div className="h-px w-full bg-white/10" />
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-white">Already Paid</span>
                  <span className="font-bold">PHP {Number(paid || 0).toLocaleString()}</span>
                </div>
                {paymentPendingApproval && Number(pendingPaid || 0) > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-amber-400">Submitted (pending approval)</span>
                    <span className="font-bold text-amber-300">PHP {Number(pendingPaid || 0).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs">
                  <span className="text-emerald-400">Resort Rate</span>
                  <span className="font-bold text-emerald-300">PHP {Number(totalRate || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-emerald-400">Downpayment Required</span>
                  <span className="font-bold text-emerald-300">PHP {Number(requiredDownpayment || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-emerald-400">Services Costs</span>
                  <span className="font-bold text-emerald-300">PHP {Number(serviceCosts || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-2 text-lg font-black text-emerald-500">
                  <span>Balance</span>
                  <span>PHP {Number(balance || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <Button
              disabled={locked || isSubmitting || !proofFiles?.length}
              className="mt-8 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-900/20 transition-all hover:bg-emerald-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={onSubmitDownpayment}
            >
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
              {isSubmitting ? "Processing..." : "Submit Payment"}
            </Button>
          </div>
        </div>
      </div>

      {proofPreviewExpanded ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setProofPreviewExpanded(null)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Escape" && setProofPreviewExpanded(null)}
          aria-label="Close preview"
        >
          <button
            type="button"
            className="absolute right-4 top-4 rounded-full bg-white/90 p-2 text-slate-700 hover:bg-white"
            onClick={() => setProofPreviewExpanded(null)}
            aria-label="Close"
          >
            <X size={20} />
          </button>
          <img
            src={proofPreviewExpanded}
            alt="Uploaded proof (enlarged)"
            className="h-auto max-h-[90vh] w-auto max-w-full rounded-xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      ) : null}

      {submittedProofItems.length ? (
        <div className="mt-6 space-y-2">
          <p className="ml-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Submitted Proofs
          </p>
          <div className="rounded-2xl border border-slate-200 bg-white/90 p-3">
            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
              <button
                type="button"
                className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/80 p-2 text-slate-700 shadow hover:bg-white"
                onClick={() =>
                  setSubmittedActiveIndex((prev) =>
                    submittedProofItems.length ? (prev - 1 + submittedProofItems.length) % submittedProofItems.length : 0
                  )
                }
                aria-label="Previous proof"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/80 p-2 text-slate-700 shadow hover:bg-white"
                onClick={() =>
                  setSubmittedActiveIndex((prev) =>
                    submittedProofItems.length ? (prev + 1) % submittedProofItems.length : 0
                  )
                }
                aria-label="Next proof"
              >
                <ChevronRight size={18} />
              </button>
              <button
                type="button"
                className="block w-full"
                onClick={() => setProofPreviewExpanded(submittedProofItems[submittedActiveIndex]?.url)}
                aria-label="Open proof fullscreen"
              >
                <img
                  src={submittedProofItems[submittedActiveIndex]?.url}
                  alt={`Submitted proof ${submittedActiveIndex + 1}`}
                  className="h-56 w-full object-cover sm:h-72"
                />
              </button>
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity hover:opacity-100">
                <Button
                  variant="secondary"
                  size="sm"
                  className="rounded-full text-[10px]"
                  onClick={() => setProofPreviewExpanded(submittedProofItems[submittedActiveIndex]?.url)}
                >
                  View Fullscreen <ExternalLink size={12} className="ml-2" />
                </Button>
              </div>
            </div>
            {submittedProofItems[submittedActiveIndex]?.note ? (
              <div className="mt-2 text-[10px] font-semibold text-slate-600">
                {submittedProofItems[submittedActiveIndex].note}
              </div>
            ) : null}
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {submittedProofItems.map((proof, index) => (
                <button
                  type="button"
                  key={`${proof.url}-${index}`}
                  onClick={() => setSubmittedActiveIndex(index)}
                  className={`h-16 w-24 flex-shrink-0 overflow-hidden rounded-xl border ${
                    index === submittedActiveIndex ? "border-emerald-400 ring-2 ring-emerald-200" : "border-slate-200"
                  }`}
                  aria-label={`Preview proof ${index + 1}`}
                >
                  <img
                    src={proof.url}
                    alt={`Submitted proof ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </Card>
  );
});

export { PaymentSection };
