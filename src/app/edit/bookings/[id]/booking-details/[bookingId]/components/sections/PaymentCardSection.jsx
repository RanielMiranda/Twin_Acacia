import React from "react";
import { ReceiptText } from "lucide-react";

export default function PaymentCardSection({
  isEditing,
  draft,
  setField,
  setDownpaymentRequirement,
  balance,
  totalRate = 0,
  serviceCosts = 0,
  configuredRequiredDownpayment,
  displayedRequiredDownpayment,
}) {
  const handleResortRateChange = (value) => {
    const nextRate = Number(value) || 0;
    setField("baseAmount", nextRate);
    setField("totalAmount", nextRate + Number(serviceCosts || 0));
  };

  return (
    <div className="bg-slate-900 text-white p-8 rounded-[2rem] shadow-2xl space-y-6 relative overflow-hidden">
      <div className="absolute -top-4 -right-4 p-4 opacity-5"><ReceiptText size={120} /></div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Due</p>
        <p className="text-4xl font-black italic">PHP {Number(draft.totalAmount || 0).toLocaleString()}</p>
      </div>
      <div className="space-y-3 pt-4 border-t border-white/10 text-sm">
        <div className="flex justify-between items-center gap-2">
          <span className="text-white">Already Paid</span>
          {isEditing ? (
            <input type="number" min="0" className="bg-transparent border-b border-white/20 outline-none text-right font-bold" value={draft.downpayment || 0} onChange={(e) => setField("downpayment", Number(e.target.value) || 0)} />
          ) : (
            <span className="font-bold">PHP {Number(draft.downpayment || 0).toLocaleString()}</span>
          )}
        </div>
        {status !== "Confirmed" && draft.paymentPendingApproval && Number(draft.pendingDownpayment || 0) > 0 ? (
          <div className="flex justify-between items-center gap-2">
            <span className="text-slate-400">Pending Approval</span>
            <span className="font-bold text-amber-300">
              PHP {Number(draft.pendingDownpayment || 0).toLocaleString()}
            </span>
          </div>
        ) : null}
        <div className="flex justify-between items-center gap-2">
          <span className="text-emerald-300">Resort Rate</span>
          {isEditing ? (
            <input
              type="number"
              min="0"
              className="bg-transparent border-b border-emerald-300/40 outline-none text-right font-bold text-emerald-300"
              value={draft.baseAmount ?? totalRate ?? 0}
              onChange={(e) => handleResortRateChange(e.target.value)}
            />
          ) : (
            <span className="font-bold text-emerald-300">PHP {Number(totalRate || 0).toLocaleString()}</span>
          )}
        </div>
        <div className="flex justify-between items-center gap-2">
          <span className="text-emerald-300">Downpayment Required</span>
          {isEditing ? (
            <input
              type="number"
              min="0"
              className="bg-transparent border-b border-emerald-300/40 outline-none text-right font-bold text-emerald-300"
              value={draft.downpaymentRequiredAmount ?? configuredRequiredDownpayment ?? 0}
              onChange={(e) => setDownpaymentRequirement(Number(e.target.value) || 0)}
            />
          ) : (
            <span className="font-bold text-emerald-300">PHP {Number(displayedRequiredDownpayment || 0).toLocaleString()}</span>
          )}
        </div>
        <div className="flex justify-between items-center gap-2">
          <span className="text-emerald-300">Services Costs</span>
          <span className="font-bold text-emerald-300">PHP {Number(serviceCosts || 0).toLocaleString()}</span>
        </div>
        <div className="bg-white/5 p-4 rounded-2xl mt-4">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Balance to Pay</p>
          <p className="text-2xl font-black">PHP {balance.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
