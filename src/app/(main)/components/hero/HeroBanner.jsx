"use client";

import React, { useEffect, useState } from "react";
import { ArrowRight, CalendarRange, ShieldCheck, Sparkles } from "lucide-react";
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
      const { data, error } = await supabase.from("resorts").select("gallery");

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
    <section className="relative overflow-hidden px-4 pb-16 pt-14 md:pb-20 md:pt-16">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-12%] top-20 h-64 w-64 rounded-full bg-cyan-300/20 blur-3xl" />
        <div className="absolute right-[-8%] top-0 h-80 w-80 rounded-full bg-sky-400/20 blur-3xl" />
        <div className="absolute bottom-[-8rem] left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-amber-200/20 blur-3xl" />
      </div>

      <div className="relative mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
        <div className="pt-4 md:pt-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-blue-600 shadow-sm backdrop-blur">
            <Sparkles size={14} />
            Resort stays made simple
          </div>
          <h1 className="mt-6 max-w-2xl text-5xl font-semibold leading-[1.02] tracking-tight text-slate-950 md:text-6xl">
            Find the right resort for your next stay near Calamba Laguna.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 md:text-lg">
            Explore resort listings with cleaner presentation, clearer availability cues, and a faster path to inquiry.
          </p>

          <div className="mt-8 max-w-4xl">
            <SearchBar />
          </div>

          <div className="mt-8 grid max-w-xl gap-3 sm:grid-cols-3">
            <div className="rounded-[1.4rem] border border-white/80 bg-white/80 px-4 py-4 shadow-sm backdrop-blur">
              <CalendarRange className="mb-3 text-blue-600" size={18} />
              <p className="text-sm font-semibold text-slate-900">Date-based search</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">Keep the fast booking journey front and center.</p>
            </div>
            <div className="rounded-[1.4rem] border border-white/80 bg-white/80 px-4 py-4 shadow-sm backdrop-blur">
              <ShieldCheck className="mb-3 text-blue-600" size={18} />
              <p className="text-sm font-semibold text-slate-900">Trusted listings</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">Premium presentation with practical booking details.</p>
            </div>
            <div className="rounded-[1.4rem] border border-white/80 bg-white/80 px-4 py-4 shadow-sm backdrop-blur">
              <ArrowRight className="mb-3 text-blue-600" size={18} />
              <p className="text-sm font-semibold text-slate-900">Clear next step</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">Compare, shortlist, and contact owners with confidence.</p>
            </div>
          </div>
        </div>

        <div className="relative min-h-[420px] md:min-h-[560px]">
          <div className="absolute inset-0 overflow-hidden rounded-[2rem] border border-white/60 bg-slate-500 shadow-[0_28px_80px_rgba(15,23,42,0.22)]">
            {activeImage ? (
              <div className="absolute inset-0">
                <img
                  key={`next-${upcomingImage}`}
                  src={nextSrc}
                  srcSet={nextSrcSet}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  loading="lazy"
                  fetchPriority="auto"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover"
                  alt="Featured resort view"
                />
                <img
                  key={`active-${activeImage}`}
                  src={activeSrc}
                  srcSet={activeSrcSet}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1600ms] ease-in-out ${isFading ? "opacity-0" : "opacity-100"}`}
                  alt="Featured resort view"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.12)_0%,rgba(15,23,42,0.18)_34%,rgba(15,23,42,0.65)_100%)]" />
              </div>
            ) : (
              <div className="absolute inset-0 bg-slate-500" />
            )}
          </div>

          <div className="absolute inset-x-5 bottom-5 rounded-[1.7rem] border border-white/15 bg-slate-950/65 p-5 text-white shadow-2xl backdrop-blur-md">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-sky-200">Featured collection</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">Browse resort spaces with clear photos and practical booking details</h2>
              </div>
              <div className="hidden rounded-full border border-white/15 px-3 py-1 text-xs font-semibold text-slate-100 md:block">
                {heroIndex + 1}/{heroImages.length}
              </div>
            </div>
            <div className="mt-5 flex gap-2">
              {heroImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setHeroIndex(index)}
                  aria-label={`Show hero image ${index + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 ${heroIndex === index ? "w-10 bg-white" : "w-4 bg-white/45 hover:bg-white/70"}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
