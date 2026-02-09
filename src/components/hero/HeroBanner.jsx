import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { heroImages } from "../data/constants";
import SearchBar from "../search/SearchBar";


export default function HeroBanner() {
    const [heroIndex, setHeroIndex] = useState(0);


    useEffect(() => {
    const interval = setInterval(() => {
        setHeroIndex((p) => (p + 1) % heroImages.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);


    return (
    <div className="relative h-[600px] overflow-visible">
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
            Find Your Perfect Resort Getaway
            </h1>


        <SearchBar />
        </div>
    </div>
    );
}