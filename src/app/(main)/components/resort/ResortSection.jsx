"use client";

import { useEffect, useMemo, useState } from "react";
import { useFilters } from "@/components/useclient/ContextFilter";
import FilterPanel from "./FilterPanel";
import ResortResults from "./ResortResults";

export default function ResortSection() {
  const { filteredResorts, priceRange, selectedTags, guests, hasActiveFilters } = useFilters();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const filterSummary = useMemo(() => {
    const totalGuests = Number(guests.adults || 0) + Number(guests.children || 0);
    const tagLabel = selectedTags.length > 0 ? `${selectedTags.length} tags` : "all tags";
    return `PHP ${Number(priceRange?.min || 0).toLocaleString()}-${Number(priceRange?.max || 0).toLocaleString()} - ${totalGuests} pax - ${tagLabel}`;
  }, [guests.adults, guests.children, priceRange?.max, priceRange?.min, selectedTags.length]);

  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    document.body.style.overflow = mobileFiltersOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileFiltersOpen]);

  return (
    <section id="resorts" className="mx-auto w-full max-w-7xl px-4 py-10 md:py-14">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-sky-700">Featured resorts</p>
          <h2 className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">Shortlist-worthy stays, presented like a live marketplace.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
            The homepage now focuses on a tighter set of 4 to 6 resorts so the experience feels curated, premium, and ready for launch.
          </p>
        </div>
        <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 shadow-sm">
          Limited to the best matches
        </div>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <FilterPanel className="hidden lg:block" />
        <ResortResults resorts={filteredResorts} />
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileFiltersOpen(true)}
          className="flex w-full items-center justify-between rounded-t-[1.6rem] bg-sky-600 px-5 py-4 text-left text-white shadow-[0_-12px_40px_rgba(2,132,199,0.28)]"
        >
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-sky-100">Refine results</p>
            <p className="mt-1 text-sm font-semibold">{filterSummary}</p>
          </div>
          <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
            {hasActiveFilters ? "Active" : "Open"}
          </span>
        </button>
      </div>

      {mobileFiltersOpen ? (
        <div className="fixed inset-0 z-[120] bg-slate-950/35 backdrop-blur-[2px] lg:hidden">
          <div className="absolute inset-0" onClick={() => setMobileFiltersOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 h-[82vh] rounded-t-[2rem] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-sky-700">Refine results</p>
                <p className="mt-1 text-sm text-slate-500">{filterSummary}</p>
              </div>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-600"
              >
                Close
              </button>
            </div>
            <div className="h-[calc(82vh-78px)] overflow-y-auto px-5 py-5">
              <FilterPanel />
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
