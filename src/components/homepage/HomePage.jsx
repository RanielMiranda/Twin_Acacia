import React from "react";
import HeroBanner from "./hero/HeroBanner";
import ResortSection from "./resort/ResortSection"
import { FilterProvider, useFilters } from "../context/FilterContext";

export default function homepage() {
  return (
    <>
      <FilterProvider>    
      <HeroBanner />

      {/* Resorts Section */}

        <div id="resorts">
          <ResortSection />
        </div>
      </FilterProvider>
    </>
  );
}
