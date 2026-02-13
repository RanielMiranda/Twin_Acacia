export default function HeroGallery({ resort, onOpen }) {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 pt-8">
      <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[40vh] rounded-2xl overflow-hidden">
        {resort.gallery?.slice(0, 5).map((img, idx) => (
          <div
            key={idx}
            onClick={() => onOpen(idx)}
            className={`cursor-pointer ${
              idx === 0 ? "col-span-2 row-span-2" : ""
            } relative`}
          >
            <img
              src={img}
              alt=""
              className="w-full h-full object-cover"
            />

            {idx === 4 && resort.gallery.length > 5 && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-semibold">
                +{resort.gallery.length - 5} more
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
