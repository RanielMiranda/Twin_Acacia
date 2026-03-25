import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button"

import DateRangeField from "./calendar/DateRangeField";

import { useFilters } from "@/components/useclient/ContextFilter";
export default function SearchBar() {
  const {
    startDate, 
    setStartDate, 
    endDate, 
    setEndDate,
    applyFilters,
  } = useFilters();

  const [activeDropdown, setActiveDropdown] = useState(null);

  const containerRef = useRef(null);

  function formatFullDate(date) {
    if (!date) return "";
    return date.toLocaleString("default", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  function formatWeekday(date) {
    if (!date) return "";
    return date.toLocaleString("default", { weekday: "long" });
  }

  // Guest selector removed from homepage search.

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative z-20 flex flex-col sm:flex-row sm:flex-wrap lg:flex-nowrap gap-2 bg-white rounded-xl p-[1vh]"
    >
      <DateRangeField
        startDate={startDate}
        endDate={endDate}
        setStartDate={setStartDate}
        setEndDate={setEndDate}
        activeDropdown={activeDropdown}
        setActiveDropdown={setActiveDropdown}
        formatFullDate={formatFullDate}
        formatWeekday={formatWeekday}
      />

      <Button
        className="rounded-xl px-6 text-sm "
        onClick={() => {
          applyFilters();
          const results = document.getElementById("resorts");
          if (results) results.scrollIntoView({ behavior: "smooth", block: "start" });
        }}
      >
        Search
      </Button>
    </div>
  );
}
