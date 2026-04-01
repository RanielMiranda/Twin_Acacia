import React, { useMemo, useState } from "react";
import { Calendar, ChevronDown, Users } from "lucide-react";
import SideRangeCalendar from "./SideRangeCalendar";
import { useFilters } from "@/components/useclient/ContextFilter"; 

export default function RoomFilterPanel({
  embedded = false,
  mobileSheet = false,
  showTitle = true,
  selectedRoomSummary = "",
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
          : "lg:w-80 bg-white shadow-md rounded-2xl p-6 lg:sticky lg:top-28"
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
              value={checkInTime || "12:00"}
              onChange={(e) => setCheckInTime(e.target.value)}
              className="w-full bg-transparent text-sm font-semibold outline-none"
            />
          </label>
          <label className="border-l border-slate-300 px-4 py-3">
            <p className="mb-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Time Out</p>
            <input
              type="time"
              value={checkOutTime || "17:00"}
              onChange={(e) => setCheckOutTime(e.target.value)}
              className="w-full bg-transparent text-sm font-semibold outline-none"
            />
          </label>
        </div>

        <div className="relative border-t border-slate-300 px-4 py-3">
          <button
            type="button"
            className="flex w-full items-center justify-between gap-3 text-left"
            onClick={() => setActiveDropdown((prev) => (prev === "guests" ? null : "guests"))}
          >
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Guests</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {totalGuests} guest{totalGuests === 1 ? "" : "s"}
                {Number(guests.children || 0) > 0
                  ? `, ${Number(guests.children || 0)} child${Number(guests.children || 0) > 1 ? "ren" : ""}`
                  : ""}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-slate-100 p-2 text-slate-500">
                <Users size={16} />
              </div>
              <ChevronDown
                size={16}
                className={`text-slate-400 transition-transform ${activeDropdown === "guests" ? "rotate-180" : ""}`}
              />
            </div>
          </button>

          {activeDropdown === "guests" ? (
            <div className="absolute left-3 right-3 top-full z-[1000] mt-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl">
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
              </div>
            </div>
          ) : null}
        </div>

        <div className="border-t border-slate-300 px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Selected Rooms</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            {selectedRoomSummary || "Selected room cards will be included in the inquiry"}
          </p>
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
        <div className={mobileSheet ? "" : "absolute right-full top-0 mr-4 z-[1000]"}>
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
              if (activeDropdown === "start" && s && !e) {
                setActiveDropdown("end");
              }
            }}
          />
        </div>
      )}
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
          className="h-8 w-8 rounded-full border border-slate-200 text-slate-600"
          onClick={() => onChange(Math.max(min, Number(value || 0) - 1))}
        >
          -
        </button>
        <span className="w-6 text-center text-sm font-semibold">{value || 0}</span>
        <button
          type="button"
          className="h-8 w-8 rounded-full border border-slate-200 text-slate-600"
          onClick={() => onChange(Number(value || 0) + 1)}
        >
          +
        </button>
      </div>
    </div>
  );
}
