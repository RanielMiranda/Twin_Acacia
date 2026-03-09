import React, { useMemo, useState } from "react";
import { Calendar, Users } from "lucide-react";
import SideRangeCalendar from "./SideRangeCalendar";
import { useFilters } from "@/components/useclient/ContextFilter"; 

export default function RoomFilterPanel({
  embedded = false,
  mobileSheet = false,
  showTitle = true,
}) {
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
  const totalGuests = useMemo(
    () => Number(guests.adults || 0) + Number(guests.children || 0),
    [guests.adults, guests.children]
  );

  return (
    <div
      className={`w-full h-fit flex flex-col gap-6 ${
        embedded
          ? ""
          : "lg:w-80 bg-white shadow-md rounded-2xl p-6 lg:sticky lg:top-24"
      }`}
    >
      {showTitle ? <h3 className="text-lg font-semibold">Plan your stay</h3> : null}

      <div className="overflow-visible rounded-[1.6rem] border border-slate-300 shadow-sm">
        <DateRangeField
          startDate={startDate}
          endDate={endDate}
          setStartDate={setStartDate}
          setEndDate={setEndDate}
          activeDropdown={activeDropdown}
          setActiveDropdown={setActiveDropdown}
          formatFullDate={formatFullDate}
          formatWeekday={formatWeekday}
          mobileSheet={mobileSheet}
        />

        <div className="grid grid-cols-2 border-t border-slate-300">
          <label className="px-4 py-3">
            <p className="mb-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Time In</p>
            <input
              type="time"
              value={checkInTime || "14:00"}
              onChange={(e) => setCheckInTime(e.target.value)}
              className="w-full bg-transparent text-sm font-semibold outline-none"
            />
          </label>
          <label className="border-l border-slate-300 px-4 py-3">
            <p className="mb-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Time Out</p>
            <input
              type="time"
              value={checkOutTime || "12:00"}
              onChange={(e) => setCheckOutTime(e.target.value)}
              className="w-full bg-transparent text-sm font-semibold outline-none"
            />
          </label>
        </div>

        <div className="border-t border-slate-300 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Guests</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {totalGuests} guest{totalGuests === 1 ? "" : "s"}
              </p>
            </div>
            <div className="rounded-full bg-slate-100 p-2 text-slate-500">
              <Users size={16} />
            </div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-xs font-bold">
            <GuestCounter label="Adults" value={guests.adults} min={1} onChange={(value) => setGuests((prev) => ({ ...prev, adults: value }))} />
            <GuestCounter label="Children" value={guests.children} min={0} onChange={(value) => setGuests((prev) => ({ ...prev, children: value }))} />
            <GuestCounter label="Rooms" value={guests.rooms} min={1} onChange={(value) => setGuests((prev) => ({ ...prev, rooms: value }))} />
          </div>
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
  activeDropdown, setActiveDropdown, formatFullDate, formatWeekday, mobileSheet
}) {
  return (
    <div className="relative grid grid-cols-2">
      <button
        className="px-4 py-4 text-left outline-none"
        onClick={() => setActiveDropdown("start")}
      >
        <div className="mb-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
          <Calendar size={13} className="text-slate-400" />
          Check-In
        </div>
        <div className="text-base font-semibold text-slate-900">{startDate ? formatFullDate(startDate) : "Add date"}</div>
        <div className="mt-1 text-[11px] uppercase tracking-wide text-slate-400">{startDate ? formatWeekday(startDate) : "Start"}</div>
      </button>
      <button
        className="border-l border-slate-300 px-4 py-4 text-left outline-none"
        onClick={() => setActiveDropdown("end")}
      >
        <div className="mb-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
          <Calendar size={13} className="text-slate-400" />
          Check-Out
        </div>
        <div className="text-base font-semibold text-slate-900">{endDate ? formatFullDate(endDate) : "Add date"}</div>
        <div className="mt-1 text-[11px] uppercase tracking-wide text-slate-400">{endDate ? formatWeekday(endDate) : "End"}</div>
      </button>

      {(activeDropdown === "start" || activeDropdown === "end") && (
        <div className={mobileSheet ? "" : "absolute top-full left-0 mt-2 z-[1000]"}>
          <SideRangeCalendar
            startDate={startDate}
            endDate={endDate}
            activeDropdown={activeDropdown}
            onClose={() => setActiveDropdown(null)}
            monthCount={mobileSheet ? 1 : 2}
            mobileCentered={mobileSheet}
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
    <div className="rounded-xl border border-slate-200 px-2 py-2 text-center">
      <p className="text-[10px] uppercase tracking-wider text-slate-400">{label}</p>
      <div className="mt-1 flex items-center justify-center gap-2">
        <button className="h-6 w-6 rounded-full bg-slate-100" onClick={() => onChange(Math.max(min, Number(value || 0) - 1))}>-</button>
        <span className="w-5 text-center">{value || 0}</span>
        <button className="h-6 w-6 rounded-full bg-slate-100" onClick={() => onChange(Number(value || 0) + 1)}>+</button>
      </div>
    </div>
  );
}
