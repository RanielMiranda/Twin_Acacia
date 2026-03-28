"use client";

import React from "react";
import { useFilters } from "@/components/useclient/ContextFilter";

export default function FilterPanel({ className = "" }) {
  const {
    priceRange,
    setPriceRange,
    selectedTags,
    setSelectedTags,
    applyFilters,
    clearFilters,
    hasActiveFilters,
    loading,
  } = useFilters();

  const [tagSearch, setTagSearch] = React.useState("");

  React.useEffect(() => {
    setTagSearch((selectedTags || []).join(", "));
  }, [selectedTags]);

  const applyFiltersClick = () => {
    const commaTerms = tagSearch
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    const nextTags = Array.from(new Set(commaTerms));
    setSelectedTags(nextTags);
    applyFilters({ selectedTags: nextTags });
  };

  return (
    <div className={`h-fit w-full rounded-[2rem] border border-slate-200/80 bg-white/90 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur lg:sticky lg:top-24 lg:w-80 ${className}`}>
      <div className="mb-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-sky-700">Refine results</p>
        <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Find the right stay faster</h3>
      </div>

      <div className="mb-6">
        <p className="mb-2 text-sm font-semibold text-slate-900">Target Price Range</p>
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-semibold text-slate-500">
            <span>Min: PHP {Number(priceRange?.min || 0).toLocaleString()}</span>
            <span>Max: PHP {Number(priceRange?.max || 0).toLocaleString()}</span>
          </div>

          <input
            type="range"
            min="1000"
            max="50000"
            step="500"
            value={priceRange?.min || 10000}
            onChange={(e) => setPriceRange((prev) => ({ ...prev, min: Number(e.target.value) }))}
            className="w-full"
          />
          <input
            type="range"
            min="1000"
            max="50000"
            step="500"
            value={priceRange?.max || 30000}
            onChange={(e) => setPriceRange((prev) => ({ ...prev, max: Number(e.target.value) }))}
            className="w-full"
          />

          <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400">
            Resorts closer to your range appear higher.
          </p>
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-slate-900">Facilities / Tags</p>
        <input
          type="text"
          value={tagSearch}
          onChange={(e) => setTagSearch(e.target.value)}
          placeholder="kitchen, Free WIFI"
          className="mb-3 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-400 focus:bg-white"
        />
        <p className="text-[11px] text-slate-400">
          Separate multiple terms with commas.
        </p>
      </div>

      <div className="mt-6 border-t border-slate-100 pt-4">
        <button
          onClick={applyFiltersClick}
          disabled={loading}
          className="w-full rounded-2xl bg-sky-600 py-3 text-xs font-bold uppercase tracking-[0.24em] text-white transition hover:-translate-y-0.5 hover:bg-sky-700 disabled:opacity-60"
        >
          {loading ? "Applying filters..." : "Search"}
        </button>
        <button
          onClick={clearFilters}
          disabled={!hasActiveFilters}
          className="mt-3 w-full rounded-2xl border border-slate-200 py-3 text-xs font-bold uppercase tracking-[0.24em] text-slate-600 hover:bg-slate-50 disabled:opacity-50"
        >
          Turn off filter
        </button>
      </div>
    </div>
  );
}
