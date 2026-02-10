import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { heroImages } from "../../data/constants";
import SearchBar from "../../search/SearchBar";


export default function HeroBanner() {
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroIndex((p) => (p + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-[800px] overflow-visible">
      <AnimatePresence>
        <motion.img
          key={heroIndex}
          src={heroImages[heroIndex]}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute w-full h-full object-cover"
        />
      </AnimatePresence>

      <div className="absolute inset-0 bg-black/40" />

      <div className="absolute inset-0 flex flex-col justify-center items-center px-4">
        <h1 className="text-5xl font-bold text-white mb-10 text-center">
          Find The Ideal Apartment 
        </h1>

        <SearchBar />

        {/* --- DOT INDICATOR --- */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {heroImages.map((_, index) => (
            <button
            key={index}
            onClick={() => setHeroIndex(index)} // jump to clicked image
            className={`
                w-3 h-3 rounded-full transition-all duration-300
                ${heroIndex === index ? "bg-white scale-100" : "bg-white/50 scale-75"}
                cursor-pointer
            `}
            />
        ))}
        </div>

      </div>
    </div>
  );
}
