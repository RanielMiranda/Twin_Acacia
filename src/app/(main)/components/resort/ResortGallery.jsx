import React from "react";
import { Card } from "@/components/ui/card";
import { getSupabaseSrcSet, getTransformedSupabaseImageUrl } from "@/lib/utils";

export default function ResortGallery({ resort, prioritize = false }) {
  const gallery = resort.gallery || [];
  const mainImage = gallery[0];
  const topMini = gallery[1];
  const bottomMini = gallery[2];
  const extraCount = gallery.length > 3 ? gallery.length - 3 : 0; // Fixed logic to -3 since we show 3 images

  // Reusable transition class
  const imageClasses = "h-full w-full object-cover transition-transform duration-700 group-hover:scale-110";

  return (
    <Card className="overflow-hidden border-none bg-transparent shadow-none">
      {/* Gallery Container */}
      <div className="flex w-full h-60 gap-1">
        
        {/* Main Image - 3/4 width */}
        <div className="group w-3/4 h-full overflow-hidden rounded-l-xl">
          <img
            src={getTransformedSupabaseImageUrl(mainImage, { width: 1024, quality: 80, format: "webp" })}
            srcSet={getSupabaseSrcSet(mainImage)}
            sizes="(max-width: 768px) 100vw, 75vw"
            loading={prioritize ? "eager" : "lazy"}
            decoding="async"
            fetchPriority={prioritize ? "high" : "low"}
            className={imageClasses}
            alt={resort.name}
          />
        </div>

        {/* Mini Gallery - 1/4 width */}
        <div className="w-1/4 h-full flex flex-col gap-1">
          
          {/* Top mini image */}
          <div className="group h-1/2 w-full overflow-hidden rounded-tr-xl">
            <img
              src={getTransformedSupabaseImageUrl(topMini, { width: 640, quality: 80, format: "webp" })}
              srcSet={getSupabaseSrcSet(topMini, [320, 480, 640], 80)}
              sizes="(max-width: 768px) 50vw, 25vw"
              loading={prioritize ? "eager" : "lazy"}
              decoding="async"
              fetchPriority={prioritize ? "high" : "low"}
              className={imageClasses}
              alt={`${resort.name} 1`}
            />
          </div>

          {/* Bottom mini image with overlay */}
          <div className="group relative h-1/2 w-full overflow-hidden rounded-br-xl">
            <img
              src={getTransformedSupabaseImageUrl(bottomMini, { width: 640, quality: 80, format: "webp" })}
              srcSet={getSupabaseSrcSet(bottomMini, [320, 480, 640], 80)}
              sizes="(max-width: 768px) 50vw, 25vw"
              loading={prioritize ? "eager" : "lazy"}
              decoding="async"
              fetchPriority={prioritize ? "high" : "low"}
              className={imageClasses}
              alt={`${resort.name} 2`}
            />

            {extraCount > 0 && (
              /* Pointer-events-none ensures the hover still hits the 'group' container below */
              <div className="pointer-events-none absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 group-hover:bg-black/20">
                <span className="text-white text-lg font-bold">
                  +{extraCount}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
