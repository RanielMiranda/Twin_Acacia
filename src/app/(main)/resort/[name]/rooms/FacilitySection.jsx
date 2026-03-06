import React, { useRef } from "react";

export default function FacilitySection({ facilities, onOpen, summary = "" }) {
  const safeFacilities = Array.isArray(facilities) ? facilities : [];
  const maxVisible = 10;
  const visibleFacilities = safeFacilities.slice(0, maxVisible);
  const hasMore = safeFacilities.length > maxVisible;

  const scrollRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);

  const openModal = (idx) => onOpen?.(idx);

  const onMouseDown = (e) => {
    isDragging.current = true;
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeftStart.current = scrollRef.current.scrollLeft;
    scrollRef.current.style.cursor = "grabbing";
  };

  const onMouseMove = (e) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = x - startX.current;
    scrollRef.current.scrollLeft = scrollLeftStart.current - walk;
  };

  const onMouseUpOrLeave = () => {
    isDragging.current = false;
    if (scrollRef.current) scrollRef.current.style.cursor = "grab";
  };

  return (
    <div id="facilities" className="max-w-6xl mx-auto px-4">
      <h2 className="text-2xl font-semibold mb-4">Facilities</h2>
      {summary ? (
        <div className="mb-5 w-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-5 text-slate-600">
          {summary}
        </div>
      ) : null}

      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto snap-x snap-mandatory py-2 pb-4 cursor-grab"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUpOrLeave}
        onMouseLeave={onMouseUpOrLeave}
      >
        {visibleFacilities.map((facility, idx) => {
          const isLast = idx === maxVisible - 1 && hasMore;
          return (
            <div key={`${facility?.name || "facility"}-${idx}`} className="flex-shrink-0 w-48 snap-start group relative">
              <button
                onClick={() => openModal(idx)}
                className="w-full aspect-square rounded-2xl overflow-hidden bg-gray-100 relative shadow-sm border border-slate-200 block text-left"
              >
                <img
                  src={facility?.image || ""}
                  alt={facility?.name || "Facility"}
                  className={`w-full h-full object-cover transition-transform group-hover:scale-105 ${isLast ? "brightness-50" : ""}`}
                />
                {isLast && hasMore && (
                  <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm">
                    View More
                  </div>
                )}
              </button>
              <p className="mt-3 text-sm font-semibold text-slate-900 truncate">{facility?.name || "Facility"}</p>
              <p className="mt-1 text-xs text-slate-500 line-clamp-2">{facility?.description || "No description provided."}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
