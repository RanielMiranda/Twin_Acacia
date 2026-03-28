import React from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export default function FacilityGalleryModal({
  facilities = [],
  activeIndex = 0,
  setActiveIndex,
  onClose,
}) {
  const safeFacilities = Array.isArray(facilities) ? facilities : [];
  if (!safeFacilities.length) return null;

  const currentIndex = Math.min(Math.max(activeIndex, 0), safeFacilities.length - 1);
  const facility = safeFacilities[currentIndex];

  const goPrev = () => setActiveIndex?.((currentIndex - 1 + safeFacilities.length) % safeFacilities.length);
  const goNext = () => setActiveIndex?.((currentIndex + 1) % safeFacilities.length);

  return (
    <div className="fixed inset-0 z-[140] bg-slate-900/85 backdrop-blur-sm p-4 md:p-8" onClick={onClose}>
      <button
        className="absolute top-5 right-5 h-10 w-10 rounded-full bg-white/90 text-slate-700 flex items-center justify-center shadow-lg"
        onClick={onClose}
      >
        <X size={20} />
      </button>

      <div
        className="mx-auto h-full max-w-7xl grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-4 items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative rounded-2xl overflow-hidden bg-black/40 border border-white/10 h-[52vh] md:h-[72vh]">
          {facility?.image ? (
            <img src={facility.image} alt={facility?.name || "Facility"} className="w-full h-full object-contain" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/70">No image</div>
          )}

          <button
            onClick={goPrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 text-slate-700 flex items-center justify-center shadow"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={goNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 text-slate-700 flex items-center justify-center shadow"
          >
            <ChevronRight size={20} />
          </button>

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 max-w-[90%] overflow-x-auto">
            {safeFacilities.map((item, idx) => (
              <button
                key={`${item?.name || "facility"}-${idx}`}
                onClick={() => setActiveIndex?.(idx)}
                className={`h-12 w-12 rounded-lg overflow-hidden border-2 shrink-0 ${
                  idx === currentIndex ? "border-blue-400" : "border-white/40"
                }`}
              >
                {item?.image ? (
                  <img src={item.image} alt={item?.name || "Facility"} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-white/20" />
                )}
              </button>
            ))}
          </div>
        </div>

        <aside className="bg-white rounded-2xl p-6 md:p-8 shadow-2xl border border-slate-100 h-[60vh] md:h-[80vh] overflow-auto">
          <p className="text-[11px] uppercase tracking-[0.2em] font-black text-sky-700">Facility</p>
          <h3 className="mt-2 text-2xl font-black text-slate-900">{facility?.name || "Unnamed Facility"}</h3>
          <ul className="mt-4 text-sm text-slate-600 leading-relaxed list-disc pl-5 space-y-2">
            {(facility?.description
              ? String(facility.description)
                  .split(/\r?\n/)
                  .map((line) => line.replace(/^\s*[•\-*]\s*/, "").trim())
                  .filter(Boolean)
              : ["No description provided."]
            ).map((line, idx) => (
              <li key={`${facility?.name || "facility"}-desc-${idx}`}>{line}</li>
            ))}
          </ul>
          <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50 p-4 text-xs text-slate-500">
            {currentIndex + 1} of {safeFacilities.length}
          </div>
        </aside>
      </div>
    </div>
  );
}
