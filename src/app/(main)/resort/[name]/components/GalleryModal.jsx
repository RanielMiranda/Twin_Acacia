import { X, ChevronLeft, ChevronRight } from "lucide-react";

export default function GalleryModal({
  images,
  activeIndex,
  setActiveIndex,
  onClose,
  names = null, // optional array of names
}) {
return (
    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center" onClick={onClose}>
      <button
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        className="absolute top-6 right-6 text-white text-3xl cursor-pointer rounded-full bg-black hover:bg-gray-600 transition p-3"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="relative w-full h-[70vh] flex items-center justify-center">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setActiveIndex((i) => (i - 1 + images.length) % images.length);
          }}
          className="absolute left-5 p-3 rounded-full bg-black hover:bg-gray-600 transition cursor-pointer"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>

        <img src={images[activeIndex]} className="max-h-full max-w-full object-contain" alt="Gallery View" />

        <button
          onClick={(e) => {
            e.stopPropagation();
            setActiveIndex((i) => (i + 1) % images.length);
          }}
          className="absolute right-5 p-3 rounded-full bg-black hover:bg-gray-600 transition cursor-pointer"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Thumbnails */}
      <div className="mt-2 flex gap-2 overflow-x-auto">
        {images.map((img, i) => (
          <img
            key={i}
            src={img}
            onClick={(e) => {
              e.stopPropagation();
              setActiveIndex(i);
            }}
            className={`h-16 w-24 object-cover rounded cursor-pointer ${
              i === activeIndex ? "ring-2 ring-[var(--theme-primary-500)]" : "opacity-50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
