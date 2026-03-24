"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import SearchBar from "../search/SearchBar";
import { getSupabaseSrcSet, getTransformedSupabaseImageUrl } from "@/lib/utils";

const FALLBACK_HERO_IMAGE = null;

export default function HeroBanner() {
  const [heroImages, setHeroImages] = useState([FALLBACK_HERO_IMAGE]);
  const [heroIndex, setHeroIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

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
      const upcoming = (heroIndex + 1) % heroImages.length;
      setNextIndex(upcoming);
      setIsFading(true);
    }, 7000);

    return () => clearInterval(interval);
  }, [heroImages, heroIndex]);

  useEffect(() => {
    if (!isFading) return undefined;
    const timeout = setTimeout(() => {
      setHeroIndex(nextIndex);
      setIsFading(false);
    }, 1200);
    return () => clearTimeout(timeout);
  }, [isFading, nextIndex]);

  if (!heroImages.length) return null;

  const activeImage = heroImages[heroIndex] || FALLBACK_HERO_IMAGE;
  const upcomingImage = heroImages[nextIndex] || FALLBACK_HERO_IMAGE;
  const activeSrc = activeImage
    ? getTransformedSupabaseImageUrl(activeImage, { width: 1280, quality: 72, format: "webp" })
    : null;
  const activeSrcSet = activeImage ? getSupabaseSrcSet(activeImage, [640, 960, 1280], 72) : null;
  const nextSrc = upcomingImage
    ? getTransformedSupabaseImageUrl(upcomingImage, { width: 1280, quality: 72, format: "webp" })
    : null;
  const nextSrcSet = upcomingImage ? getSupabaseSrcSet(upcomingImage, [640, 960, 1280], 72) : null;

  return (
    <div className="mt-10 relative h-140 md:h-115 group">
      <div className="absolute inset-0 overflow-hidden">
        {activeImage ? (
          <div className="absolute inset-0">
            <img
              key={`next-${upcomingImage}`}
              src={nextSrc}
              srcSet={nextSrcSet}
              sizes="100vw"
              loading="lazy"
              fetchPriority="auto"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover"
              alt="Featured resort view"
            />
            <img
              key={`active-${activeImage}`}
              src={activeSrc}
              srcSet={activeSrcSet}
              sizes="100vw"
              loading="eager"
              fetchPriority="high"
              decoding="async"
              className={`
                absolute inset-0 w-full h-full object-cover
                transition-opacity duration-[1600ms] ease-in-out
                ${isFading ? "opacity-0" : "opacity-100"}
              `}
              alt="Featured resort view"
            />
          </div>
        ) : (
          <div className="absolute inset-0 bg-slate-500" />
        )}
      </div>

      {/* Overlay */}
      {activeImage ? <div className="absolute inset-0 bg-black/40 pointer-events-none" /> : null}

      {/* Title */}
      <div className="absolute inset-0 flex flex-col justify-start md:justify-center items-center px-4 pt-16 md:pt-0">
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
