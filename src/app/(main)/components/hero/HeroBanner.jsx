"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import SearchBar from "../search/SearchBar";
import { getSupabaseSrcSet, getTransformedSupabaseImageUrl } from "@/lib/utils";

const FALLBACK_HERO_IMAGE = "/resort-fallback.svg";

export default function HeroBanner() {
  const [heroImages, setHeroImages] = useState([FALLBACK_HERO_IMAGE]);
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    const fetchImages = async () => {
      const { data, error } = await supabase
        .from("resorts")
        .select("gallery");

      if (error) {
        console.error(error);
        return;
      }

      const images = (data || [])
        .flatMap((resort) => (resort.gallery || []).filter(Boolean).slice(0, 2))
        .filter(Boolean)
        .slice(0, 6);

      setHeroImages(images.length > 0 ? images : [FALLBACK_HERO_IMAGE]);
    };

    fetchImages();
  }, []);

  useEffect(() => {
    if (!heroImages.length || heroImages.length === 1) return;

    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 7000);

    return () => clearInterval(interval);
  }, [heroImages]);

  if (!heroImages.length) return null;

  const activeImage = heroImages[heroIndex] || FALLBACK_HERO_IMAGE;
  const heroSrc = getTransformedSupabaseImageUrl(activeImage, { width: 1280, quality: 72, format: "webp" });
  const heroSrcSet = getSupabaseSrcSet(activeImage, [640, 960, 1280], 72);

  return (
    <div className="relative h-[80vh] group">
      <div className="absolute inset-0 overflow-hidden">
        <img
          key={activeImage}
          src={heroSrc}
          srcSet={heroSrcSet}
          sizes="100vw"
          loading="eager"
          fetchPriority="high"
          decoding="async"
          className="
            absolute w-full h-full object-cover
            transition-transform duration-[5000ms] ease-out
            group-hover:scale-105
          "
          alt="Featured resort view"
        />
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Title */}
      <div className="absolute inset-0 flex flex-col justify-center items-center px-4">
        <h1 className="text-5xl font-bold text-white mb-10 text-center">
          Find Your Perfect Resort Getaway
        </h1>
      </div>

      {/* Search */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-full max-w-4xl px-4 z-20">
        <SearchBar />
      </div>

      {/* DOT INDICATOR */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 pb-2">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setHeroIndex(index)}
            className={`
              w-4 h-2 rounded-full transition-all duration-300 hover:scale-110
              ${
                heroIndex === index
                  ? "bg-white scale-110"
                  : "bg-white/50 scale-75"
              }
              cursor-pointer
            `}
          />
        ))}
      </div>
    </div>
  );
}
