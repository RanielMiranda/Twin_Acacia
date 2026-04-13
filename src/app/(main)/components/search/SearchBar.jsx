import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import DateRangeField from "./calendar/DateRangeField";
import { useFilters } from "@/components/useclient/ContextFilter";

export default function SearchBar() {
  const {
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    guests,
    setGuests,
    applyFilters,
  } = useFilters();

  const [activeDropdown, setActiveDropdown] = useState(null);
  const containerRef = useRef(null);

  const totalGuests = useMemo(
    () => Number(guests.adults || 0) + Number(guests.children || 0),
    [guests.adults, guests.children]
  );

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
      className="relative z-20 flex flex-col gap-2 rounded-[1.75rem] border border-slate-200/70 bg-white p-3 shadow-[0_18px_50px_rgba(15,23,42,0.08)] sm:flex-row sm:flex-wrap lg:flex-nowrap"
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

      <div className="relative min-w-[260px] flex-1 rounded-[1.25rem] border border-slate-200">
        <button
          type="button"
          className="flex min-h-14 w-full items-center justify-between gap-3 px-4 text-left"
          onClick={() => setActiveDropdown((prev) => (prev === "guests" ? null : "guests"))}
        >
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-sky-50 p-2 text-blue-600">
              <Users size={16} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Guests and Rooms</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {totalGuests} guest{totalGuests === 1 ? "" : "s"} · {Number(guests.adults || 0)} adults
                {Number(guests.children || 0) > 0
                  ? ` · ${Number(guests.children || 0)} child${Number(guests.children || 0) > 1 ? "ren" : ""}`
                  : ""}
              </p>
            </div>
          </div>
          <ChevronDown
            size={16}
            className={`text-slate-400 transition-transform ${activeDropdown === "guests" ? "rotate-180" : ""}`}
          />
        </button>

        {activeDropdown === "guests" ? (
          <div className="absolute left-0 right-0 top-full z-[9999] mt-2 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-2xl">
            <div className="space-y-3">
              <GuestRow
                label="Adults"
                subtitle="Ages 13 or above"
                value={guests.adults}
                min={1}
                onChange={(value) => setGuests((prev) => ({ ...prev, adults: value }))}
              />
              <GuestRow
                label="Children"
                subtitle="Ages 12 or below"
                value={guests.children}
                min={0}
                onChange={(value) => setGuests((prev) => ({ ...prev, children: value }))}
              />
              <GuestRow
                label="Rooms"
                subtitle="Used for resort fit checks"
                value={guests.rooms}
                min={1}
                onChange={(value) => setGuests((prev) => ({ ...prev, rooms: value }))}
              />
            </div>
          </div>
        ) : null}
      </div>

      <Button
        className="min-h-14 rounded-[1.25rem] bg-blue-600 px-7 text-sm font-semibold text-white hover:-translate-y-0.5 hover:bg-blue-700"
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

function GuestRow({ label, subtitle, value, min = 0, onChange }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-sm font-semibold text-slate-900">{label}</p>
        {subtitle ? <p className="text-xs text-slate-500">{subtitle}</p> : null}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="h-9 w-9 rounded-full border border-slate-200 text-slate-600"
          onClick={() => onChange(Math.max(min, Number(value || 0) - 1))}
        >
          -
        </button>
        <span className="w-6 text-center text-sm font-semibold">{value || 0}</span>
        <button
          type="button"
          className="h-9 w-9 rounded-full border border-slate-200 text-slate-600"
          onClick={() => onChange(Number(value || 0) + 1)}
        >
          +
        </button>
      </div>
    </div>
  );
}
