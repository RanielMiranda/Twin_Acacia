import React, { useState } from "react";
import { Calendar } from "lucide-react";
import SideRangeCalendar from "./SideRangeCalendar";

export default function RoomFilterPanel({ price, setPrice }) {
// DATE RANGE STATE
const [startDate, setStartDate] = useState(null);
const [endDate, setEndDate] = useState(null);
const [activeDropdown, setActiveDropdown] = useState(null);

// FORMAT HELPERS
const formatFullDate = (date) =>
date.toLocaleDateString("default", { month: "short", day: "numeric", year: "numeric" });
const formatWeekday = (date) =>
date.toLocaleDateString("default", { weekday: "short" });

return (
<div className="w-full lg:w-80 bg-white shadow rounded-2xl p-6 h-fit lg:sticky lg:top-24 flex flex-col gap-6">
<h3 className="font-semibold text-lg mb-2">Filters</h3>

  {/* DATE RANGE */}
  <div className="flex flex-col gap-2">
    <p className="font-medium text-sm mb-1">Dates</p>
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

  {/* PRICE RANGE */}
  <div className="flex flex-col gap-2">
    <p className="font-medium text-sm mb-1">Price / night</p>
    <input
      type="range"
      min="1000"
      max="10000"
      value={price}
      onChange={(e) => setPrice(Number(e.target.value))}
      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
    />
    <div className="flex items-center border rounded-lg px-2">
      <span className="text-gray-500 text-sm">₱</span>
      <input
        type="number"
        value={price}
        onChange={(e) => {
          const val = Math.max(0, Number(e.target.value));
          setPrice(val);
        }}
        className="w-full px-2 py-1 text-sm outline-none"
      />
    </div>
  </div>

  {/* OPTIONAL TAGS */}
  <div className="flex flex-col gap-2 text-sm">
    <p className="font-medium mb-1">Tags</p>
    <label className="flex items-center gap-2 cursor-pointer">
      <input type="checkbox" className="rounded text-blue-600" /> Wifi
    </label>
    <label className="flex items-center gap-2 cursor-pointer">
      <input type="checkbox" className="rounded text-blue-600" /> Kitchen
    </label>
  </div>
</div>


);
}

// --------------------------
// DATE RANGE FIELD COMPONENT
// --------------------------
function DateRangeField({
startDate,
endDate,
setStartDate,
setEndDate,
activeDropdown,
setActiveDropdown,
formatFullDate,
formatWeekday
}) {
return (
<div className="relative flex items-center gap-2 border rounded-xl px-3 py-2 flex-1">
<Calendar size={16} className="text-gray-800" />

  {/* START DATE */}
  <button
    className="flex-1 text-center whitespace-nowrap outline-none"
    onClick={() => setActiveDropdown("start")}
  >
    <div className={`text-sm font-medium ${!startDate ? 'text-gray-800' : ''}`}>
      {startDate ? formatFullDate(startDate) : "Check-in"}
    </div>
    <div className="text-[10px] uppercase text-gray-400">
      {startDate ? formatWeekday(startDate) : "Start"}
    </div>
  </button>

  <span className="w-px bg-gray-200 h-8" />

  {/* END DATE */}
  <button
    className="flex-1 text-center whitespace-nowrap outline-none"
    onClick={() => setActiveDropdown("end")}
  >
    <div className={`text-sm font-medium ${!endDate ? 'text-gray-800' : ''}`}>
      {endDate ? formatFullDate(endDate) : "Check-out"}
    </div>
    <div className="text-[10px] uppercase text-gray-400">
      {endDate ? formatWeekday(endDate) : "End"}
    </div>    
  </button>

  {/* POPUP CALENDAR */}
  {(activeDropdown === "start" || activeDropdown === "end") && (
    <div className="absolute top-0 left-0 mt-[7vh] flex items-center justify-center lg:block z-[1000]">
      <SideRangeCalendar
        startDate={startDate}
        endDate={endDate}
        activeDropdown={activeDropdown}
        onClose={() => setActiveDropdown(null)}
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