"use client";

import { useRef } from "react";
import { CreditCard, Image as ImageIcon, X } from "lucide-react";
import { useResort } from "@/components/useclient/ContextEditor";
import { getTransformedSupabaseImageUrl } from "@/lib/utils";

export default function PaymentImageEditor() {
  const { resort, updateResort, safeSrc } = useResort();
  const gcashInputRef = useRef(null);
  const bankInputRef = useRef(null);

  if (!resort) return null;

  const gcashImageUrl = resort.payment_image_url;
  const bankImageUrl = resort.bank_payment_image_url;
  const gcashIsFile = gcashImageUrl instanceof File;
  const bankIsFile = bankImageUrl instanceof File;
  const gcashDisplayUrl = gcashIsFile ? safeSrc(gcashImageUrl) : gcashImageUrl;
  const bankDisplayUrl = bankIsFile ? safeSrc(bankImageUrl) : bankImageUrl;

  const handleGcashChange = (e) => {
    const file = e.target.files?.[0];
    if (file) updateResort("payment_image_url", file);
    e.target.value = "";
  };

  const handleBankChange = (e) => {
    const file = e.target.files?.[0];
    if (file) updateResort("bank_payment_image_url", file);
    e.target.value = "";
  };

  const handleRemoveGcash = () => updateResort("payment_image_url", null);
  const handleRemoveBank = () => updateResort("bank_payment_image_url", null);

  return (
    <section className="mx-auto max-w-4xl px-4 py-8 border-b border-slate-100">
      <div className="flex items-center gap-2 mb-4">
        <CreditCard size={20} className="text-emerald-600" />
        <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Payment reference image</h2>
      </div>
      <p className="text-xs text-slate-500 mb-4">
        Optional. Upload GCash and/or bank reference images so clients know where to send their payment.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-3">
          <p className="text-xs font-black uppercase tracking-widest text-slate-500">GCash Reference</p>
          <input
            ref={gcashInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleGcashChange}
          />
          {gcashDisplayUrl ? (
            <div className="relative group w-fit">
              <img
                src={gcashIsFile ? gcashDisplayUrl : getTransformedSupabaseImageUrl(gcashDisplayUrl, { width: 320, quality: 85, format: "webp" })}
                alt="GCash reference"
                className="w-40 h-40 object-cover rounded-2xl border border-slate-200 shadow-sm"
              />
              <button
                type="button"
                onClick={handleRemoveGcash}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500 text-white hover:bg-red-600 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remove GCash image"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <div
              role="button"
              tabIndex={0}
              onClick={() => gcashInputRef.current?.click()}
              onKeyDown={(e) => e.key === "Enter" && gcashInputRef.current?.click()}
              className="w-40 h-40 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-emerald-300 hover:bg-emerald-50/50 hover:text-emerald-600 transition-colors cursor-pointer"
            >
              <ImageIcon size={28} />
              <span className="text-xs font-bold uppercase tracking-wider">Upload</span>
            </div>
          )}
          <button
            type="button"
            onClick={() => gcashInputRef.current?.click()}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 underline"
          >
            {gcashDisplayUrl ? "Replace image" : "Choose image"}
          </button>
        </div>
        <div className="flex flex-col gap-3">
          <p className="text-xs font-black uppercase tracking-widest text-slate-500">Bank Reference</p>
          <input
            ref={bankInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleBankChange}
          />
          {bankDisplayUrl ? (
            <div className="relative group w-fit">
              <img
                src={bankIsFile ? bankDisplayUrl : getTransformedSupabaseImageUrl(bankDisplayUrl, { width: 320, quality: 85, format: "webp" })}
                alt="Bank reference"
                className="w-40 h-40 object-cover rounded-2xl border border-slate-200 shadow-sm"
              />
              <button
                type="button"
                onClick={handleRemoveBank}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500 text-white hover:bg-red-600 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remove bank image"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <div
              role="button"
              tabIndex={0}
              onClick={() => bankInputRef.current?.click()}
              onKeyDown={(e) => e.key === "Enter" && bankInputRef.current?.click()}
              className="w-40 h-40 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-emerald-300 hover:bg-emerald-50/50 hover:text-emerald-600 transition-colors cursor-pointer"
            >
              <ImageIcon size={28} />
              <span className="text-xs font-bold uppercase tracking-wider">Upload</span>
            </div>
          )}
          <button
            type="button"
            onClick={() => bankInputRef.current?.click()}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 underline"
          >
            {bankDisplayUrl ? "Replace image" : "Choose image"}
          </button>
        </div>
      </div>
    </section>
  );
}
