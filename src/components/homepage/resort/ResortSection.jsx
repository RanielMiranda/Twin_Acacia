"use client";

import { useFilters } from "../../useclient/ContextFilter";
import FilterPanel from "./FilterPanel";
import ResortResults from "./ResortResults";

function ResortList() {
  const { filteredResorts } = useFilters();
  return <ResortResults resorts={filteredResorts} />;
}

export default function ResortSection() {
  return (
      <section id="resorts" className="w-full max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-8">Top Resorts</h2>
        <div className="flex flex-col lg:flex-row gap-8">
          <FilterPanel />
          <ResortList />
        </div>
      </section>
  );
}