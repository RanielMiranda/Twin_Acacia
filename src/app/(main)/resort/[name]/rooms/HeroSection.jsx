import { useResort } from "@/components/useclient/ContextEditor";
import { getSupabaseSrcSet, getTransformedSupabaseImageUrl } from "@/lib/utils";

export default function HeroSection({ onOpen }) {
  const { resort } = useResort();
  const primaryGallery = Array.isArray(resort?.gallery) ? resort.gallery.filter(Boolean) : [];
  const gallery = primaryGallery.length > 0 ? primaryGallery : [resort?.profileImage].filter(Boolean);

  if (!resort || gallery.length === 0) {
    return (
      <div className="mx-auto mt-6 aspect-video max-w-7xl rounded-4xl bg-gray-200 animate-pulse" />
    );
  }

  const mainImage = gallery[0];
  const galleryLength = gallery.length;

  const renderGallery = () => {
    if (galleryLength === 0) {
      return (
        <div className="mx-auto mt-6 aspect-video max-w-7xl rounded-4xl bg-gray-200 animate-pulse" />
      );
    }

    if (galleryLength === 1) {
      return (
        <div className="overflow-hidden rounded-4xl border border-white/70 bg-white/60 p-3 shadow-[0_28px_80px_rgba(15,23,42,0.12)] lg:aspect-16/8">
          <button
            onClick={() => onOpen(0)}
            className="group relative overflow-hidden rounded-3xl w-full h-full"
          >
            <img
              src={getTransformedSupabaseImageUrl(mainImage, {
                width: 1200,
                quality: 80,
                format: "webp",
              })}
              srcSet={getSupabaseSrcSet(mainImage)}
              sizes="100vw"
              alt=""
              className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
            />
          </button>
        </div>
      );
    }

    if (galleryLength === 2) {
      return (
        <div className="overflow-hidden rounded-4xl border border-white/70 bg-white/60 p-3 shadow-[0_28px_80px_rgba(15,23,42,0.12)] lg:aspect-16/8 flex gap-3">
          <button
            onClick={() => onOpen(0)}
            className="group relative overflow-hidden rounded-l-3xl w-1/2 h-full"
          >
            <img
              src={getTransformedSupabaseImageUrl(gallery[0], {
                width: 1200,
                quality: 80,
                format: "webp",
              })}
              srcSet={getSupabaseSrcSet(gallery[0])}
              sizes="50vw"
              alt=""
              className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
            />
          </button>
          <button
            onClick={() => onOpen(1)}
            className="group relative overflow-hidden rounded-r-3xl w-1/2 h-full"
          >
            <img
              src={getTransformedSupabaseImageUrl(gallery[1], {
                width: 1200,
                quality: 80,
                format: "webp",
              })}
              srcSet={getSupabaseSrcSet(gallery[1])}
              sizes="50vw"
              alt=""
              className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
            />
          </button>
        </div>
      );
    }

    if (galleryLength === 3) {
      return (
        <div className="overflow-hidden rounded-4xl border border-white/70 bg-white/60 p-3 shadow-[0_28px_80px_rgba(15,23,42,0.12)] lg:aspect-16/8 flex gap-3">
          <button
            onClick={() => onOpen(0)}
            className="group relative overflow-hidden rounded-l-3xl w-3/5 h-full"
          >
            <img
              src={getTransformedSupabaseImageUrl(gallery[0], {
                width: 1200,
                quality: 80,
                format: "webp",
              })}
              srcSet={getSupabaseSrcSet(gallery[0])}
              sizes="60vw"
              alt=""
              className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
            />
          </button>
          <div className="grid w-2/5 grid-rows-2 gap-3 h-full">
            <button
              onClick={() => onOpen(1)}
              className="group relative overflow-hidden rounded-tr-3xl h-full"
            >
              <img
                src={getTransformedSupabaseImageUrl(gallery[1], {
                  width: 640,
                  quality: 80,
                  format: "webp",
                })}
                srcSet={getSupabaseSrcSet(gallery[1], [320, 480, 640], 80)}
                sizes="20vw"
                alt=""
                className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
              />
            </button>
            <button
              onClick={() => onOpen(2)}
              className="group relative overflow-hidden rounded-br-3xl h-full"
            >
              <img
                src={getTransformedSupabaseImageUrl(gallery[2], {
                  width: 640,
                  quality: 80,
                  format: "webp",
                })}
                srcSet={getSupabaseSrcSet(gallery[2], [320, 480, 640], 80)}
                sizes="20vw"
                alt=""
                className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
              />
            </button>
          </div>
        </div>
      );
    }

    if (galleryLength === 4) {
      return (
        <div className="overflow-hidden rounded-4xl border border-white/70 bg-white/60 p-3 shadow-[0_28px_80px_rgba(15,23,42,0.12)] lg:aspect-16/8 flex gap-3">
          <button
            onClick={() => onOpen(0)}
            className="group relative overflow-hidden rounded-l-3xl w-3/5 h-full"
          >
            <img
              src={getTransformedSupabaseImageUrl(gallery[0], {
                width: 1200,
                quality: 80,
                format: "webp",
              })}
              srcSet={getSupabaseSrcSet(gallery[0])}
              sizes="60vw"
              alt=""
              className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
            />
          </button>
          <div className="grid w-2/5 grid-rows-2 gap-3 h-full">
            <div className="grid grid-cols-2 gap-3 h-full">
              <button
                onClick={() => onOpen(1)}
                className="group relative overflow-hidden h-full"
              >
                <img
                  src={getTransformedSupabaseImageUrl(gallery[1], {
                    width: 640,
                    quality: 80,
                    format: "webp",
                  })}
                  srcSet={getSupabaseSrcSet(gallery[1], [320, 480, 640], 80)}
                  sizes="20vw"
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
              </button>
              <button
                onClick={() => onOpen(2)}
                className="group relative overflow-hidden rounded-tr-3xl h-full"
              >
                <img
                  src={getTransformedSupabaseImageUrl(gallery[2], {
                    width: 640,
                    quality: 80,
                    format: "webp",
                  })}
                  srcSet={getSupabaseSrcSet(gallery[2], [320, 480, 640], 80)}
                  sizes="20vw"
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
              </button>
            </div>
            <button
              onClick={() => onOpen(3)}
              className="group relative overflow-hidden rounded-br-3xl h-full"
            >
              <img
                src={getTransformedSupabaseImageUrl(gallery[3], {
                  width: 640,
                  quality: 80,
                  format: "webp",
                })}
                srcSet={getSupabaseSrcSet(gallery[3], [320, 480, 640], 80)}
                sizes="20vw"
                alt=""
                className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
              />
            </button>
          </div>
        </div>
      );
    }

    const extraCount = galleryLength > 5 ? galleryLength - 5 : 0;

    return (
      <div className="overflow-hidden rounded-4xl border border-white/70 bg-white/60 p-3 shadow-[0_28px_80px_rgba(15,23,42,0.12)] lg:aspect-16/8">
        <div className="grid gap-3 lg:hidden">
          <button
            onClick={() => onOpen(0)}
            className="group relative overflow-hidden rounded-3xl aspect-video"
          >
            <img
              src={getTransformedSupabaseImageUrl(mainImage, {
                width: 1200,
                quality: 80,
                format: "webp",
              })}
              srcSet={getSupabaseSrcSet(mainImage)}
              sizes="100vw"
              alt=""
              className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
            />
          </button>

          {gallery.slice(1, 5).map((img, idx) => (
            <button
              key={idx + 1}
              onClick={() => onOpen(idx + 1)}
              className="group relative overflow-hidden rounded-3xl aspect-video"
            >
              <img
                src={getTransformedSupabaseImageUrl(img, {
                  width: 640,
                  quality: 80,
                  format: "webp",
                })}
                srcSet={getSupabaseSrcSet(img, [320, 480, 640], 80)}
                sizes="50vw"
                alt=""
                className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
              />
              {idx === 3 && extraCount > 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-lg font-semibold text-white">
                  +{extraCount}
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="hidden lg:grid h-full gap-3 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <button
            onClick={() => onOpen(0)}
            className="group relative overflow-hidden rounded-l-3xl h-full"
          >
            <img
              src={getTransformedSupabaseImageUrl(mainImage, {
                width: 1200,
                quality: 80,
                format: "webp",
              })}
              srcSet={getSupabaseSrcSet(mainImage)}
              sizes="60vw"
              alt=""
              className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.04)_0%,rgba(15,23,42,0.1)_45%,rgba(15,23,42,0.55)_100%)]" />
            <div className="absolute left-5 bottom-5 text-left text-white">
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-sky-200">
                Featured view
              </p>
              <p className="mt-2 text-xl font-semibold md:text-2xl">
                Resort Highlights
              </p>
            </div>
          </button>

          <div className="grid grid-rows-2 gap-3 h-full">
            <div className="grid grid-cols-2 gap-3 h-full">
              <button
                onClick={() => onOpen(1)}
                className="group relative overflow-hidden h-full"
              >
                <img
                  src={getTransformedSupabaseImageUrl(gallery[1], {
                    width: 640,
                    quality: 80,
                    format: "webp",
                  })}
                  srcSet={getSupabaseSrcSet(gallery[1], [320, 480, 640], 80)}
                  sizes="20vw"
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
              </button>
              <button
                onClick={() => onOpen(2)}
                className="group relative overflow-hidden rounded-tr-3xl h-full"
              >
                <img
                  src={getTransformedSupabaseImageUrl(gallery[2], {
                    width: 640,
                    quality: 80,
                    format: "webp",
                  })}
                  srcSet={getSupabaseSrcSet(gallery[2], [320, 480, 640], 80)}
                  sizes="20vw"
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 h-full">
              <button
                onClick={() => onOpen(3)}
                className="group relative overflow-hidden h-full"
              >
                <img
                  src={getTransformedSupabaseImageUrl(gallery[3], {
                    width: 640,
                    quality: 80,
                    format: "webp",
                  })}
                  srcSet={getSupabaseSrcSet(gallery[3], [320, 480, 640], 80)}
                  sizes="20vw"
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
              </button>
              <button
                onClick={() => onOpen(4)}
                className="group relative overflow-hidden rounded-br-3xl h-full"
              >
                <img
                  src={getTransformedSupabaseImageUrl(gallery[4], {
                    width: 640,
                    quality: 80,
                    format: "webp",
                  })}
                  srcSet={getSupabaseSrcSet(gallery[4], [320, 480, 640], 80)}
                  sizes="20vw"
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
                {extraCount > 0 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-lg font-semibold text-white">
                    +{extraCount}
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#f8fbff_0%,#eef4f8_100%)] px-4 pb-4 pt-8 lg:pt-6 md:pb-10 lg:pb-8">
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
        {renderGallery()}
      </div>
    </section>
  );
}