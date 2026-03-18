import React, { useEffect, useMemo, useState } from "react";
import { Image as ImageIcon, ExternalLink, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionLabel } from "../BookingEditorAtoms";
import { supabase } from "@/lib/supabase";
import { BUCKET_NAME, getPublicUrl, getStorageFolderFromPublicUrl } from "@/lib/utils";

export default function ProofCardSection({
  proofPreviewUrls,
  draft,
  resolveSignedProofUrl,
}) {
  const [folderProofUrls, setFolderProofUrls] = useState([]);

  const proofFolder = useMemo(() => {
    if (draft?.paymentProofFolder) return draft.paymentProofFolder;
    const urlCandidate =
      (Array.isArray(proofPreviewUrls) && proofPreviewUrls.length > 0 && proofPreviewUrls[0]) ||
      (Array.isArray(draft.paymentProofUrls) && draft.paymentProofUrls.length > 0 && draft.paymentProofUrls[0]) ||
      draft.paymentProofUrl;
    return getStorageFolderFromPublicUrl(urlCandidate);
  }, [draft?.paymentProofFolder, draft?.paymentProofUrl, draft?.paymentProofUrls, proofPreviewUrls]);

  useEffect(() => {
    if (!proofFolder) return;

    let cancelled = false;
    const loadAll = async () => {
      try {
        const urls = [];
        const limit = 1000;
        let offset = 0;

        while (true) {
          const { data: items, error } = await supabase.storage.from(BUCKET_NAME).list(proofFolder, {
            limit,
            offset,
            sortBy: { column: "name", order: "asc" },
          });
          if (error || cancelled) break;
          if (!items || items.length === 0) break;

          urls.push(...items.map((item) => getPublicUrl(`${proofFolder}/${item.name}`)));
          if (items.length < limit) break;
          offset += limit;
        }

        if (!cancelled) setFolderProofUrls(urls);
      } catch {
        // ignore
      }
    };

    loadAll();
    return () => {
      cancelled = true;
    };
  }, [proofFolder]);

  const proofUrls =
    folderProofUrls.length > 0
      ? folderProofUrls
      : Array.isArray(proofPreviewUrls) && proofPreviewUrls.length > 0
      ? proofPreviewUrls
      : Array.isArray(draft.paymentProofUrls)
      ? draft.paymentProofUrls
      : [];

  const proofLogUrls = (Array.isArray(draft.paymentProofLog) ? draft.paymentProofLog : [])
    .flatMap((entry) => (Array.isArray(entry.urls) ? entry.urls : []))
    .filter(Boolean);

  const allProofUrls = Array.from(new Set([...(proofUrls || []), ...proofLogUrls]));
  const hasProof = allProofUrls.length > 0;

  return (
    <div
      className={`p-6 rounded-[2rem] border-2 transition-all shadow-xl ${
        hasProof ? "bg-white border-emerald-100 shadow-emerald-50" : "bg-slate-50 border-dashed border-slate-200 shadow-none"
      }`}
    >
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
          <div className="grid grid-cols-2 gap-3">
            {allProofUrls.map((proofUrl, index) => (
              <div
                key={`${proofUrl}-${index}`}
                className="relative group cursor-pointer overflow-hidden rounded-2xl border border-slate-100"
              >
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
              {allProofUrls.length} proof image{allProofUrls.length === 1 ? "" : "s"} uploaded by client.
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
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
            Client has not uploaded <br /> proof yet
          </p>
        </div>
      )}
    </div>
  );
}
