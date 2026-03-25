import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button"

import DateRangeField from "./calendar/DateRangeField";
import GuestField from "./guest/GuestField";

import { useFilters } from "@/components/useclient/ContextFilter";
export default function SearchBar() {
  const { 
    setGuests, 
    startDate, 
    setStartDate, 
    endDate, 
    setEndDate,
    applyFilters,
  } = useFilters();

  const [activeDropdown, setActiveDropdown] = useState(null);
  const [guestType, setGuestType] = useState("Solo Traveler");

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

  function handleGuestTypeChange(type) {
    setGuestType(type);

    if (type === "Solo Traveler") {
      setGuests({ adults: 1, children: 0, rooms: 1 });
    } else if (type === "Couple") {
      setGuests({ adults: 2, children: 0, rooms: 1 });
    }
  }

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

      <GuestField
        guestType={guestType}
        setGuestType={setGuestType}
        activeDropdown={activeDropdown}
        setActiveDropdown={setActiveDropdown}
        handleGuestTypeChange={handleGuestTypeChange}
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
