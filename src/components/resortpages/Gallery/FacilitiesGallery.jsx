import React, { useState } from "react";
import GalleryModal from "./GalleryModal";

export default function FacilitiesGallery({ facilities }) {
  const maxVisible = 10;
  const visibleFacilities = facilities.slice(0, maxVisible);
  const hasMore = facilities.length > maxVisible;

  const [modalOpen, setModalOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const openModal = (idx) => {
    setActiveIndex(idx);
    setModalOpen(true);
  };

  return (
    <div id="amenities" className="mt-8">
      <h2 className="text-2xl font-semibold mb-4">Amenities</h2>

      {/* Horizontal Gallery */}
      <div className="flex gap-4 overflow-x-auto py-2">
        {visibleFacilities.map((facility, idx) => {
          const isLast = idx === maxVisible - 1 && hasMore;
          return (
            <div
              key={idx}
              className="flex-shrink-0 w-24 cursor-pointer group relative"
              onClick={() => openModal(idx)}
            >
              <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 relative">
                <img
                  src={facility.image}
                  alt={facility.name}
                  className={`w-full h-full object-cover transition-transform group-hover:scale-105 ${
                    isLast ? "brightness-50" : ""
                  }`}
                />
                {isLast && hasMore && (
                  <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm">
                    View More
                  </div>
                )}
              </div>
              <p className="mt-2 text-sm font-medium text-center">{facility.name}</p>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {modalOpen && (
        <GalleryModal
          images={facilities.map((f) => f.image)}
          names={facilities.map((f) => f.name)}
          activeIndex={activeIndex}
          setActiveIndex={setActiveIndex}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
