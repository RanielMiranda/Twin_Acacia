import { useResort } from "@/components/useclient/ContextEditor";
import { getSupabaseSrcSet, getTransformedSupabaseImageUrl } from "@/lib/utils";

export default function HeroSection({ onOpen }) {
  const { resort } = useResort();
  const gallery = Array.isArray(resort?.gallery) ? resort.gallery : [];

  if (!resort || gallery.length === 0) return <div className="h-[360px] md:h-[420px] bg-gray-200 animate-pulse rounded-2xl" />;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 pt-8">
      <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[360px] md:h-[420px] rounded-2xl overflow-hidden">
        {gallery.slice(0, 5).map((img, idx) => (
          <div
            key={idx}
            onClick={() => onOpen(idx)}
            className={`cursor-pointer ${
              idx === 0 ? "col-span-2 row-span-2" : ""
            } relative`}
          >
            <img
              src={getTransformedSupabaseImageUrl(img, { width: 1200, quality: 80, format: "webp" })}
              srcSet={getSupabaseSrcSet(img)}
              sizes="(max-width: 768px) 100vw, 50vw"
              alt=""
              className="w-full h-full object-cover"
            />

            {idx === 4 && gallery.length > 5 && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-semibold">
                +{gallery.length - 5} more
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
