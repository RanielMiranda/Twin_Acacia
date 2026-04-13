"use client";

import React from "react";
import { useFilters } from "@/components/useclient/ContextFilter";

export default function FilterPanel({ className = "" }) {
  const {
    priceRange,
    selectedTags,
    setSelectedTags,
    applyFilters,
    clearFilters,
    hasActiveFilters,
    loading,
  } = useFilters();

  const [tagSearch, setTagSearch] = React.useState("");
  const [draftPriceRange, setDraftPriceRange] = React.useState(priceRange);

  React.useEffect(() => {
    setTagSearch((selectedTags || []).join(", "));
  }, [selectedTags]);

  React.useEffect(() => {
    setDraftPriceRange(priceRange);
  }, [priceRange]);

  const applyFiltersClick = () => {
    const commaTerms = tagSearch
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    const nextTags = Array.from(new Set(commaTerms));
    const safeMin = Math.min(Number(draftPriceRange?.min || 0), Number(draftPriceRange?.max || 0));
    const safeMax = Math.max(Number(draftPriceRange?.min || 0), Number(draftPriceRange?.max || 0));
    const nextPriceRange = { min: safeMin, max: safeMax };
    setSelectedTags(nextTags);
    applyFilters({ selectedTags: nextTags, priceRange: nextPriceRange });
  };

  return (
    <div className={`h-fit w-full rounded-[2rem] border border-slate-200/80 bg-white/90 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur lg:sticky lg:top-24 lg:w-80 ${className}`}>
      <div className="mb-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-blue-600">Search Filter</p>

      </div>

      <div className="mb-6">
        <p className="mb-2 text-sm font-semibold text-slate-900">Target Price Range</p>
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-semibold text-slate-500">
            <span>Min: PHP {Number(draftPriceRange?.min || 0).toLocaleString()}</span>
            <span>Max: PHP {Number(draftPriceRange?.max || 0).toLocaleString()}</span>
          </div>

          <input
            type="range"
            min="1000"
            max="50000"
            step="500"
            value={draftPriceRange?.min || 10000}
            onChange={(e) =>
              setDraftPriceRange((prev) => {
                const nextMin = Number(e.target.value);
                return {
                  ...prev,
                  min: Math.min(nextMin, Number(prev?.max || nextMin)),
                };
              })
            }
            className="w-full"
          />
          <input
            type="range"
            min="1000"
            max="50000"
            step="500"
            value={draftPriceRange?.max || 30000}
            onChange={(e) =>
              setDraftPriceRange((prev) => {
                const nextMax = Number(e.target.value);
                return {
                  ...prev,
                  max: Math.max(nextMax, Number(prev?.min || nextMax)),
                };
              })
            }
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
          className="mb-3 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white"
        />
        <p className="text-[11px] text-slate-400">
          Separate multiple terms with commas.
        </p>
      </div>

      <div className="mt-6 border-t border-slate-100 pt-4">
        <button
          onClick={applyFiltersClick}
          disabled={loading}
          className="w-full rounded-2xl bg-blue-600 py-3 text-xs font-bold uppercase tracking-[0.24em] text-white transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? "Applying filters..." : "Search"}
        </button>
        <button
          onClick={() => {
            clearFilters();
            setDraftPriceRange({ min: 10000, max: 30000 });
            setTagSearch("");
          }}
          disabled={!hasActiveFilters}
          className="mt-3 w-full rounded-2xl border border-slate-200 py-3 text-xs font-bold uppercase tracking-[0.24em] text-slate-600 hover:bg-slate-50 disabled:opacity-50"
        >
          Turn off filter
        </button>
      </div>
    </div>
  );
}
