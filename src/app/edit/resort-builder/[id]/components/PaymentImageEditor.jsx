"use client";

import { useRef } from "react";
import { CreditCard, Image as ImageIcon, X } from "lucide-react";
import { useResort } from "@/components/useclient/ContextEditor";
import { getTransformedSupabaseImageUrl } from "@/lib/utils";

export default function PaymentImageEditor() {
  const { resort, updateResort, safeSrc } = useResort();
  const fileInputRef = useRef(null);

  if (!resort) return null;

  const paymentImageUrl = resort.payment_image_url;
  const isFile = paymentImageUrl instanceof File;
  const displayUrl = isFile ? safeSrc(paymentImageUrl) : paymentImageUrl;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) updateResort("payment_image_url", file);
    e.target.value = "";
  };

  const handleRemove = () => updateResort("payment_image_url", null);

  return (
    <section className="mx-auto max-w-4xl px-4 py-8 border-b border-slate-100">
      <div className="flex items-center gap-2 mb-4">
        <CreditCard size={20} className="text-emerald-600" />
        <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Payment reference image</h2>
      </div>
      <p className="text-xs text-slate-500 mb-4">
        Optional. Upload a GCash QR or payment reference image. It will appear in the booking editor so guests know where to send payment. Stored as WebP under <code className="bg-slate-100 px-1 rounded">[resortname]/payment</code>.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 items-start">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        {displayUrl ? (
          <div className="relative group">
            <img
              src={isFile ? displayUrl : getTransformedSupabaseImageUrl(displayUrl, { width: 320, quality: 85, format: "webp" })}
              alt="Payment reference"
              className="w-40 h-40 object-cover rounded-2xl border border-slate-200 shadow-sm"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500 text-white hover:bg-red-600 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Remove payment image"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <div
            role="button"
            tabIndex={0}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
            className="w-40 h-40 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-emerald-300 hover:bg-emerald-50/50 hover:text-emerald-600 transition-colors cursor-pointer"
          >
            <ImageIcon size={28} />
            <span className="text-xs font-bold uppercase tracking-wider">Upload</span>
          </div>
        )}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="text-xs font-bold text-slate-600 hover:text-slate-900 underline"
        >
          {displayUrl ? "Replace image" : "Choose image"}
        </button>
      </div>
    </section>
  );
}
