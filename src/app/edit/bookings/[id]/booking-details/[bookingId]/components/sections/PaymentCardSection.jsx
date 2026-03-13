import React from "react";
import { ReceiptText } from "lucide-react";

export default function PaymentCardSection({ isEditing, draft, setField, balance, statusPhases, paymentChannels, status }) {
  return (
    <div className="bg-slate-900 text-white p-8 rounded-[2rem] shadow-2xl space-y-6 relative overflow-hidden">
      <div className="absolute -top-4 -right-4 p-4 opacity-5"><ReceiptText size={120} /></div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Due</p>
        {isEditing ? (
          <input type="number" min="0" className="text-3xl font-black italic bg-transparent border-b border-white/20 outline-none w-full" value={draft.totalAmount || 0} onChange={(e) => setField("totalAmount", Number(e.target.value) || 0)} />
        ) : (
          <p className="text-4xl font-black italic">PHP {Number(draft.totalAmount || 0).toLocaleString()}</p>
        )}
      </div>
      <div className="space-y-3 pt-4 border-t border-white/10 text-sm">
        <div className="flex justify-between items-center gap-2">
          <span className="text-slate-400">Total Paid Balance</span>
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
          <span className="text-slate-400">Channel</span>
          {isEditing ? (
            <select className="bg-slate-800 border border-white/10 rounded px-2 py-1 text-xs" value={draft.paymentMethod || "Pending"} onChange={(e) => setField("paymentMethod", e.target.value)}>
              {paymentChannels.map((channel) => (
                <option key={channel} value={channel}>{channel}</option>
              ))}
            </select>
          ) : (
            <span className="font-black text-blue-400 text-[10px] tracking-widest">{draft.paymentMethod || "Pending"}</span>
          )}
        </div>
        <div className="flex justify-between items-center gap-2">
          <span className="text-slate-400">Status</span>
          {isEditing ? (
            <select className="bg-slate-800 border border-white/10 rounded px-2 py-1 text-xs" value={status} onChange={(e) => setField("status", e.target.value)}>
              {statusPhases.map((phase) => (
                <option key={phase} value={phase}>{phase}</option>
              ))}
            </select>
          ) : (
            <span className="font-black text-emerald-300 text-[10px] tracking-widest">{status}</span>
          )}
        </div>
        <div className="bg-white/5 p-4 rounded-2xl mt-4">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Balance to Pay</p>
          <p className="text-2xl font-black">PHP {balance.toLocaleString()}</p>
        </div>
        <div className="bg-white/5 p-4 rounded-2xl mt-4">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Confirmation Stub</p>
          <p className="text-sm font-black tracking-wider">
            {draft.confirmationStub?.code || "Generated on confirmation"}
          </p>
        </div>
      </div>
    </div>
  );
}
