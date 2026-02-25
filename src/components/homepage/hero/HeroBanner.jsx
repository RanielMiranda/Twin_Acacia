"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import SearchBar from "../search/SearchBar";
import { useResort } from "@/components/useclient/ContextEditor";

export default function HeroBanner() {
  const [heroImages, setHeroImages] = useState([]);
  const [heroIndex, setHeroIndex] = useState(0);
  const { safeSrc } = useResort();

  // Fetch showcase images
  useEffect(() => {
    const fetchImages = async () => {
      const { data, error } = await supabase
        .from("resorts")
        .select("gallery");

      if (error) {
        console.error(error);
        return;
      }

      const images = data.flatMap((resort) =>
        (resort.gallery || []).slice(0, 2)
      );

      setHeroImages(images);
    };

    fetchImages();
  }, []);

  // Auto rotation
  useEffect(() => {
    if (!heroImages.length) return;

    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [heroImages]);

  if (!heroImages.length) return null;

  const nextIndex = (heroIndex + 1) % heroImages.length;

  return (
    <div className="relative h-[80vh] overflow-visible">

      {/* BACKGROUND (next image always loaded underneath) */}
      <img
        src={safeSrc(heroImages[nextIndex])}
        className="absolute w-full h-full object-cover"
        alt=""
      />

      {/* FOREGROUND (current image fades out) */}
      <motion.img
        key={heroIndex}
        src={safeSrc(heroImages[nextIndex])}
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 2, ease: [0.4, 0, 0.2, 1] }}
        className="absolute w-full h-full object-cover"
        alt=""
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Title */}
      <div className="absolute inset-0 flex flex-col justify-center items-center px-4">
        <h1 className="text-5xl font-bold text-white mb-10 text-center">
          Find Your Perfect Resort Getaway
        </h1>
      </div>

      {/* Search */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-full max-w-4xl px-4">
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