import { useResort } from "@/components/useclient/ContextEditor";
import { getSupabaseSrcSet, getTransformedSupabaseImageUrl } from "@/lib/utils";

export default function HeroSection({ onOpen }) {
  const { resort } = useResort();
  const gallery = Array.isArray(resort?.gallery) ? resort.gallery : [];

  if (!resort || gallery.length === 0) {
    return <div className="mx-auto mt-6 h-[360px] max-w-7xl rounded-[2rem] bg-gray-200 animate-pulse md:h-[420px]" />;
  }

  const mainImage = gallery[0];
  const rightImages = [gallery[1] || mainImage, gallery[2] || mainImage, gallery[3] || mainImage, gallery[4] || mainImage];
  const extraCount = gallery.length > 5 ? gallery.length - 5 : 0;

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#f8fbff_0%,#eef4f8_100%)] px-4 pb-4 pt-8 md:pb-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-sky-700">Resort overview</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">{resort.name}</h1>
          </div>
        </div>

        <div className="flex h-[420px] gap-3 overflow-hidden rounded-[2rem] border border-white/70 bg-white/60 p-3 shadow-[0_28px_80px_rgba(15,23,42,0.12)] md:h-[520px]">
          <button
            onClick={() => onOpen(0)}
            className="group relative h-full w-3/4 overflow-hidden rounded-l-[1.5rem] rounded-r-none text-left"
          >
            <img
              src={getTransformedSupabaseImageUrl(mainImage, { width: 1200, quality: 80, format: "webp" })}
              srcSet={getSupabaseSrcSet(mainImage)}
              sizes="(max-width: 768px) 100vw, 75vw"
              alt=""
              className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.04)_0%,rgba(15,23,42,0.1)_45%,rgba(15,23,42,0.55)_100%)]" />
            <div className="absolute inset-x-5 bottom-5 text-white">
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-sky-200">Featured view</p>
              <p className="mt-2 text-xl font-semibold md:text-2xl">Resort Highlights</p>
            </div>
          </button>

          <div className="grid h-full w-1/4 grid-cols-2 grid-rows-2 gap-3">
            {rightImages.map((img, idx) => {
              const imageIndex = idx + 1;
              const cornerClass =
                idx === 0
                  ? "rounded-tl-none rounded-tr-[1.5rem] rounded-bl-none rounded-br-none"
                  : idx === 1
                    ? "rounded-none"
                    : idx === 2
                      ? "rounded-none"
                      : "rounded-tl-none rounded-tr-none rounded-bl-none rounded-br-[1.5rem]";

              return (
                <button
                  key={imageIndex}
                  onClick={() => onOpen(imageIndex)}
                  className={`group relative overflow-hidden ${cornerClass}`}
                >
                  <img
                    src={getTransformedSupabaseImageUrl(img, { width: 640, quality: 80, format: "webp" })}
                    srcSet={getSupabaseSrcSet(img, [320, 480, 640], 80)}
                    sizes="(max-width: 768px) 50vw, 25vw"
                    alt=""
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                  {idx === 3 && extraCount > 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-lg font-semibold text-white">
                      +{extraCount}
                    </div>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

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
