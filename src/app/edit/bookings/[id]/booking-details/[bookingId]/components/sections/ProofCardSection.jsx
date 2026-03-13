import React from "react";
import { Image as ImageIcon, ExternalLink, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionLabel } from "../BookingEditorAtoms";

export default function ProofCardSection({
  hasProof,
  proofPreviewUrls,
  draft,
  resolveSignedProofUrl,
}) {
  const proofUrls =
    Array.isArray(proofPreviewUrls) && proofPreviewUrls.length > 0
      ? proofPreviewUrls
      : Array.isArray(draft.paymentProofUrls)
        ? draft.paymentProofUrls
        : [];
  return (
    <div className={`p-6 rounded-[2rem] border-2 transition-all shadow-xl ${
      hasProof ? "bg-white border-emerald-100 shadow-emerald-50" : "bg-slate-50 border-dashed border-slate-200 shadow-none"
    }`}>
      <div className="flex justify-between items-center mb-6">
        <SectionLabel icon={<ImageIcon size={14} />} label="Proof of Payment" />
        {hasProof ? (
          <span className="bg-emerald-500 text-white text-[9px] font-black px-2 py-1 rounded-md animate-pulse">RECEIVED</span>
        ) : (
          <span className="bg-slate-200 text-slate-500 text-[9px] font-black px-2 py-1 rounded-md">AWAITING</span>
        )}
      </div>

      {hasProof ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {proofUrls.map((proofUrl, index) => (
              <div key={`${proofUrl}-${index}`} className="relative group cursor-pointer overflow-hidden rounded-2xl border border-slate-100">
                <img
                  src={proofUrl}
                  alt={`Payment receipt ${index + 1}`}
                  className="w-full h-40 object-cover group-hover:scale-105 transition-transform"
                  onError={resolveSignedProofUrl}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button variant="secondary" size="sm" className="rounded-full text-xs" onClick={() => window.open(proofUrl)}>
                    View Fullscreen <ExternalLink size={12} className="ml-2" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
            <p className="text-[10px] text-emerald-700 font-bold mb-1">Owner Verification</p>
            <p className="text-[10px] text-emerald-700/80 mb-2">
              {proofUrls.length} proof image{proofUrls.length === 1 ? "" : "s"} uploaded by client.
            </p>
            {draft.paymentPendingApproval && Number(draft.pendingDownpayment || 0) > 0 ? (
              <p className="text-[10px] text-emerald-700/80 mb-2">
                Pending approval: PHP {Number(draft.pendingDownpayment || 0).toLocaleString()} ({draft.pendingPaymentMethod || "Pending"})
              </p>
            ) : null}
            {!draft.paymentPendingApproval ? (
              <div className="flex items-center gap-2 text-xs font-black text-emerald-600 uppercase tracking-tighter">
                <CheckCircle size={14} />
                Payment Accepted
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="py-8 text-center flex flex-col items-center">
          <div className="p-4 bg-slate-100 rounded-full mb-3 text-slate-400"><ImageIcon size={24} /></div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">Client has not uploaded <br /> proof yet</p>
        </div>
      )}
    </div>
  );
}
