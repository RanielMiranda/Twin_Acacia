import React from "react";
import { useResort } from "../../useclient/ContextEditor";

export default function FacilityModal({ activeIndex, onClose }) {
  const { resort } = useResort();
  const facility = resort?.facilities?.[activeIndex];

  if (!facility) return null;

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center" onClick={onClose}>
      <button className="absolute top-6 right-6 text-white text-3xl" onClick={onClose}>✕</button>
      <div className="max-w-5xl w-full px-4" onClick={(e) => e.stopPropagation()}>
        <img src={facility.image} alt={facility.name} className="w-full max-h-[70vh] object-contain rounded-lg" />
        <p className="text-white text-center mt-4 text-lg font-semibold">{facility.name}</p>
      </div>
    </div>
  );
}