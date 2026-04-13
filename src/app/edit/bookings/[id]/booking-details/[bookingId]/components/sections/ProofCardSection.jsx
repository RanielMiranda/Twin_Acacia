import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Image as ImageIcon, ExternalLink, CheckCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionLabel } from "../BookingEditorAtoms";
import { supabase } from "@/lib/supabase";
import { BUCKET_NAME, getPublicUrl, getStorageFolderFromPublicUrl } from "@/lib/utils";

export default function ProofCardSection({
  proofPreviewUrls,
  draft,
  resolveSignedProofUrl,
  resortPaymentImageUrl,
  resortBankPaymentImageUrl,
  gcashAccountName,
  gcashAccountNumber,
  bankName,
  bankAccountName,
  bankAccountNumber,
}) {
  const [folderProofUrls, setFolderProofUrls] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const proofFolder = useMemo(() => {
    if (draft?.paymentProofFolder) return draft.paymentProofFolder;
    const urlCandidate =
      (Array.isArray(proofPreviewUrls) && proofPreviewUrls.length > 0 && proofPreviewUrls[0]) ||
      (Array.isArray(draft.paymentProofLog) && draft.paymentProofLog.length > 0
        ? draft.paymentProofLog.flatMap((entry) => (Array.isArray(entry?.urls) ? entry.urls : [])).filter(Boolean)[0]
        : null);
    return getStorageFolderFromPublicUrl(urlCandidate);
  }, [draft?.paymentProofFolder, draft?.paymentProofLog, proofPreviewUrls]);

  const refreshFolderProofs = useCallback(async () => {
    if (!proofFolder) return;
    let cancelled = false;
    setIsRefreshing(true);
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
    } finally {
      if (!cancelled) setIsRefreshing(false);
    }
    return () => {
      cancelled = true;
    };
  }, [proofFolder]);

  useEffect(() => {
    if (!proofFolder) return;
    refreshFolderProofs();
  }, [proofFolder, refreshFolderProofs]);

  const proofUrls =
    folderProofUrls.length > 0
      ? folderProofUrls
      : Array.isArray(proofPreviewUrls) && proofPreviewUrls.length > 0
      ? proofPreviewUrls
      : (Array.isArray(draft.paymentProofLog) ? draft.paymentProofLog : [])
          .flatMap((entry) => (Array.isArray(entry?.urls) ? entry.urls : []))
          .filter(Boolean);

  const proofLogItems = (Array.isArray(draft.paymentProofLog) ? draft.paymentProofLog : [])
    .flatMap((entry) =>
      Array.isArray(entry?.urls)
        ? entry.urls
            .filter(Boolean)
            .map((url) => ({ url, note: entry?.note ? String(entry.note).trim() : "" }))
        : []
    );

  const proofNoteByUrl = proofLogItems.reduce((acc, item) => {
    if (!acc[item.url] && item.note) acc[item.url] = item.note;
    return acc;
  }, {});

  const orderedUrls = [];
  const seen = new Set();
  const pushUrl = (url) => {
    if (!url || seen.has(url)) return;
    seen.add(url);
    orderedUrls.push(url);
  };
  (proofUrls || []).forEach(pushUrl);
  proofLogItems.forEach((item) => pushUrl(item.url));

  const pendingNote = draft.pendingPaymentNote && String(draft.pendingPaymentNote).trim();
  const proofItems = orderedUrls.map((url) => ({
    url,
    note: proofNoteByUrl[url] || (pendingNote && (proofUrls || []).includes(url) ? pendingNote : ""),
  }));
  const hasProof = proofItems.length > 0;
  const proofNotes = (Array.isArray(draft.paymentProofLog) ? draft.paymentProofLog : [])
    .map((entry) => (entry?.note ? String(entry.note).trim() : ""))
    .filter(Boolean);
  const latestProofNote = (draft.pendingPaymentNote && String(draft.pendingPaymentNote).trim()) || proofNotes[proofNotes.length - 1] || "";

  return (
    <div
      className={`p-6 rounded-[2rem] border-2 transition-all shadow-xl ${
        hasProof ? "bg-white border-emerald-100 shadow-emerald-50" : "bg-slate-50 border-dashed border-slate-200 shadow-none"
      }`}
    >
      <div className="flex justify-between items-center mb-6">
        <SectionLabel icon={<ImageIcon size={14} />} label="Proof of Payment" />
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 px-2 rounded-full text-[10px] flex items-center justify-center"
            onClick={refreshFolderProofs}
            disabled={isRefreshing}
          >
            <RefreshCw size={12} className={isRefreshing ? "animate-spin mr-1" : "mr-1"} />
            {isRefreshing ? "Refreshing" : "Refresh"}
          </Button>
          {hasProof ? (
            <span className="bg-emerald-500 text-white text-[9px] font-black px-2 py-1 rounded-md animate-pulse">RECEIVED</span>
          ) : (
            <span className="bg-slate-200 text-slate-500 text-[9px] font-black px-2 py-1 rounded-md">AWAITING</span>
          )}
        </div>
      </div>

      {hasProof ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {proofItems.map((proof, index) => (
              <div key={`${proof.url}-${index}`} className="space-y-2">
                <div className="relative group cursor-pointer overflow-hidden rounded-2xl border border-slate-100">
                  <img
                    src={proof.url}
                    alt={`Payment receipt ${index + 1}`}
                    className="w-full h-40 object-cover group-hover:scale-105 transition-transform"
                    onError={resolveSignedProofUrl}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button variant="secondary" size="sm" className="rounded-full text-xs" onClick={() => window.open(proof.url)}>
                      View Fullscreen <ExternalLink size={12} className="ml-2" />
                    </Button>
                  </div>
                </div>
                {proof.note ? (
                  <div className="text-[10px] text-slate-600 font-semibold">
                    {proof.note}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
          <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
            <p className="text-[10px] text-emerald-700 font-bold mb-1">Owner Verification</p>
            <p className="text-[10px] text-emerald-700/80 mb-2">
              {proofItems.length} proof image{proofItems.length === 1 ? "" : "s"} uploaded by client.
            </p>
            {draft.paymentPendingApproval && Number(draft.pendingDownpayment || 0) > 0 ? (
              <p className="text-[10px] text-emerald-700/80 mb-2">
                Pending approval: PHP {Number(draft.pendingDownpayment || 0).toLocaleString()} ({draft.pendingPaymentMethod || "Pending"})
              </p>
            ) : null}
            {latestProofNote ? (
              <div className="mt-2 rounded-lg border border-emerald-100 bg-white/70 px-3 py-2">
                <p className="text-[9px] font-bold text-emerald-700 uppercase tracking-widest mb-1">Client Note</p>
                <p className="text-[10px] text-emerald-700/90">{latestProofNote}</p>
              </div>
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
