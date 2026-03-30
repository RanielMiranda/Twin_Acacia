import { useResort } from "@/components/useclient/ContextEditor";
import { getSupabaseSrcSet, getTransformedSupabaseImageUrl } from "@/lib/utils";

export default function HeroSection({ onOpen }) {
  const { resort } = useResort();
  const primaryGallery = Array.isArray(resort?.gallery) ? resort.gallery.filter(Boolean) : [];
  const gallery = primaryGallery.length > 0 ? primaryGallery : [resort?.profileImage].filter(Boolean);

  if (!resort || gallery.length === 0) {
    return (
      <div className="mx-auto mt-6 aspect-[16/9] max-w-7xl rounded-[2rem] bg-gray-200 animate-pulse" />
    );
  }

  const mainImage = gallery[0];
  const middleColumnImages = [gallery[1] || mainImage, gallery[2] || mainImage];
  const rightColumnImages = [gallery[3] || mainImage, gallery[4] || mainImage];
  const extraCount = gallery.length > 5 ? gallery.length - 5 : 0;

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#f8fbff_0%,#eef4f8_100%)] px-4 pb-4 pt-8 md:pb-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-blue-600">
              Resort overview
            </p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">
              {resort.name}
            </h1>
          </div>
        </div>

        {/* 🔥 Main Gallery */}
        <div className="grid aspect-[16/9] gap-3 overflow-hidden rounded-[2rem] border border-white/70 bg-white/60 p-3 shadow-[0_28px_80px_rgba(15,23,42,0.12)] lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
          
          {/* Main Image */}
          <button
            onClick={() => onOpen(0)}
            className="group relative overflow-hidden rounded-[1.5rem] text-left lg:rounded-r-none"
          >
            <img
              src={getTransformedSupabaseImageUrl(mainImage, {
                width: 1200,
                quality: 80,
                format: "webp",
              })}
              srcSet={getSupabaseSrcSet(mainImage)}
              sizes="(max-width: 1024px) 100vw, 50vw"
              alt=""
              className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.04)_0%,rgba(15,23,42,0.1)_45%,rgba(15,23,42,0.55)_100%)]" />
            <div className="absolute inset-x-5 bottom-5 text-white">
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-sky-200">
                Featured view
              </p>
              <p className="mt-2 text-xl font-semibold md:text-2xl">
                Resort Highlights
              </p>
            </div>
          </button>

          {/* Middle Column */}
          <div className="grid gap-3">
            {middleColumnImages.map((img, idx) => {
              const imageIndex = idx + 1;
              const cornerClass =
                idx === 0
                  ? "rounded-[1.5rem] lg:rounded-l-none lg:rounded-br-none"
                  : "rounded-[1.5rem] lg:rounded-l-none lg:rounded-tr-none";

              return (
                <button
                  key={imageIndex}
                  onClick={() => onOpen(imageIndex)}
                  className={`group relative overflow-hidden ${cornerClass}`}
                >
                  <img
                    src={getTransformedSupabaseImageUrl(img, {
                      width: 640,
                      quality: 80,
                      format: "webp",
                    })}
                    srcSet={getSupabaseSrcSet(img, [320, 480, 640], 80)}
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    alt=""
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                </button>
              );
            })}
          </div>

          {/* Right Column */}
          <div className="grid gap-3">
            {rightColumnImages.map((img, idx) => {
              const imageIndex = idx + 3;
              const cornerClass =
                idx === 0
                  ? "rounded-[1.5rem] lg:rounded-l-none lg:rounded-bl-none"
                  : "rounded-[1.5rem] lg:rounded-l-none lg:rounded-tl-none";

              return (
                <button
                  key={imageIndex}
                  onClick={() => onOpen(imageIndex)}
                  className={`group relative overflow-hidden ${cornerClass}`}
                >
                  <img
                    src={getTransformedSupabaseImageUrl(img, {
                      width: 640,
                      quality: 80,
                      format: "webp",
                    })}
                    srcSet={getSupabaseSrcSet(img, [320, 480, 640], 80)}
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    alt=""
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />

                  {idx === 1 && extraCount > 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-lg font-semibold text-white">
                      +{extraCount}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Button */}
        <div className="mt-2 flex justify-end">
          <button
            onClick={() => onOpen(0)}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-950"
          >
            Open full gallery
          </button>
        </div>
      </div>
    </section>
  );
}