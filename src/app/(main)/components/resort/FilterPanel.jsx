"use client";

import React from "react";
import { useFilters } from "@/components/useclient/ContextFilter";

export default function FilterPanel() {
  const {
    priceRange,
    setPriceRange,
    setSelectedTags,
    fetchResorts,
    loading,
  } = useFilters();

  const [tagSearch, setTagSearch] = React.useState("");

  const applyFilters = () => {
    const commaTerms = tagSearch
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    if (commaTerms.length > 0) {
      setSelectedTags(Array.from(new Set(commaTerms)));
    }
    fetchResorts();
  };

  return (
    <div className="w-full lg:w-80 bg-white shadow rounded-2xl p-6 h-fit lg:sticky lg:top-24">
      <h3 className="font-semibold text-lg mb-4">Filters</h3>

      <div className="mb-6">
        <p className="font-medium mb-2">Target Price Range</p>
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-slate-500 font-semibold">
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

          <p className="text-[10px] text-slate-400 uppercase tracking-wider">
            Resorts closer to your range appear higher.
          </p>
        </div>
      </div>

      <div>
        <p className="font-medium mb-2">Facilities / Tags</p>
        <input
          type="text"
          value={tagSearch}
          onChange={(e) => setTagSearch(e.target.value)}
          placeholder="kitchen, Free WIFI"
          className="w-full mb-3 rounded-lg border border-slate-200 px-3 py-2 text-xs"
        />
        <p className="text-[11px] text-slate-400">
          Separate multiple terms with commas.
        </p>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100">
        <button
          onClick={applyFilters}
          disabled={loading}
          className="w-full rounded-xl hover:scale-105 transition bg-blue-600 text-white text-xs font-bold uppercase tracking-wider py-3 hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? "Applying filters..." : "Search"}
        </button>
      </div>
    </div>
  );
}
