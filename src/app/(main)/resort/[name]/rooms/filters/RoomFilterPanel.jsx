import React, { useState } from "react";
import { Calendar, Clock3, Tag, Users } from "lucide-react";
import SideRangeCalendar from "./SideRangeCalendar";
import { useFilters } from "@/components/useclient/ContextFilter"; 

export default function RoomFilterPanel() {
  const { 
    selectedTags, 
    setSelectedTags, 
    guests,
    setGuests,
    startDate, 
    setStartDate, 
    endDate, 
    setEndDate,
    checkInTime,
    setCheckInTime,
    checkOutTime,
    setCheckOutTime,
  } = useFilters();

  const [activeDropdown, setActiveDropdown] = useState(null);

  const formatFullDate = (date) =>
    date.toLocaleDateString("default", { month: "short", day: "numeric", year: "numeric" });
  const formatWeekday = (date) =>
    date.toLocaleDateString("default", { weekday: "short" });

  return (
    <div className="w-full lg:w-80 bg-white shadow-md rounded-2xl p-6 h-fit lg:sticky lg:top-24 flex flex-col gap-6">
      <h3 className="font-semibold text-lg pb-2">Filters</h3>

      {/* DATE RANGE */}
      <div className="flex flex-col gap-2">
        <p className="font-medium text-sm text-gray-700">Check Dates</p>
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
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Clock3 size={16} className="text-blue-600" />
          <p className="font-medium text-sm text-gray-700">Time Range</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <label className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">Time In</p>
            <input
              type="time"
              value={checkInTime || "14:00"}
              onChange={(e) => setCheckInTime(e.target.value)}
              className="w-full bg-transparent text-sm font-semibold outline-none"
            />
          </label>
          <label className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">Time Out</p>
            <input
              type="time"
              value={checkOutTime || "12:00"}
              onChange={(e) => setCheckOutTime(e.target.value)}
              className="w-full bg-transparent text-sm font-semibold outline-none"
            />
          </label>
        </div>
      </div>

      {/* AMENITIES TAGS */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
           <Users size={16} className="text-blue-600" />
           <p className="font-medium text-sm text-gray-700">Guest Group</p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs font-bold">
          <GuestCounter label="Adults" value={guests.adults} min={1} onChange={(value) => setGuests((prev) => ({ ...prev, adults: value }))} />
          <GuestCounter label="Children" value={guests.children} min={0} onChange={(value) => setGuests((prev) => ({ ...prev, children: value }))} />
          <GuestCounter label="Rooms" value={guests.rooms} min={1} onChange={(value) => setGuests((prev) => ({ ...prev, rooms: value }))} />
        </div>
      </div>

      {selectedTags.length > 0 && (
        <button 
          onClick={() => setSelectedTags([])}
          className="text-xs text-red-500 hover:text-red-700 font-medium underline underline-offset-4"
        >
          Reset Amenities
        </button>
      )}
    </div>
  );
}

function DateRangeField({
  startDate, endDate, setStartDate, setEndDate,
  activeDropdown, setActiveDropdown, formatFullDate, formatWeekday
}) {
  return (
    <div className="relative flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 flex-1">
      <Calendar size={16} className="text-gray-500" />
      <button className="flex-1 text-center outline-none" onClick={() => setActiveDropdown("start")}>
        <div className="text-sm font-semibold">{startDate ? formatFullDate(startDate) : "Check-in"}</div>
        <div className="text-[10px] uppercase text-gray-400">{startDate ? formatWeekday(startDate) : "Start"}</div>
      </button>
      <span className="w-px bg-gray-200 h-8" />
      <button className="flex-1 text-center outline-none" onClick={() => setActiveDropdown("end")}>
        <div className="text-sm font-semibold">{endDate ? formatFullDate(endDate) : "Check-out"}</div>
        <div className="text-[10px] uppercase text-gray-400">{endDate ? formatWeekday(endDate) : "End"}</div>
      </button>

      {(activeDropdown === "start" || activeDropdown === "end") && (
        <div className="absolute top-full left-0 mt-2 z-[1000]">
          <SideRangeCalendar
            startDate={startDate}
            endDate={endDate}
            activeDropdown={activeDropdown}
            onClose={() => setActiveDropdown(null)}
            onChange={(s, e) => {
              setStartDate(s);
              setEndDate(e);
              if (activeDropdown === "start" && s && !e) setActiveDropdown("end");
            }}
          />
        </div>
      )}
    </div>
  );
}

function GuestCounter({ label, value, min = 0, onChange }) {
  return (
    <div className="rounded-xl border border-slate-200 p-2 text-center">
      <p className="text-[10px] uppercase tracking-wider text-slate-400">{label}</p>
      <div className="mt-1 flex items-center justify-center gap-2">
        <button className="h-6 w-6 rounded-md bg-slate-100" onClick={() => onChange(Math.max(min, Number(value || 0) - 1))}>-</button>
        <span className="w-5 text-center">{value || 0}</span>
        <button className="h-6 w-6 rounded-md bg-slate-100" onClick={() => onChange(Number(value || 0) + 1)}>+</button>
      </div>
    </div>
  );
}
