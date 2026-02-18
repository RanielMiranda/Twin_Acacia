import React, { useState } from "react";
import { Calendar, Tag } from "lucide-react";
import SideRangeCalendar from "./SideRangeCalendar";
import { useFilters } from "../../context/ContextFilter"; 

export default function RoomFilterPanel() {
  const { selectedTags, setSelectedTags } = useFilters();
  
  // Define the master list of tags available for rooms
  const availableTags = ["Wifi", "Bath", "Pool View", "Aircon", "Toilet", "Airconditioned"];

  const handleTagToggle = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // DATE RANGE STATE
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const formatFullDate = (date) =>
    date.toLocaleDateString("default", { month: "short", day: "numeric", year: "numeric" });
  const formatWeekday = (date) =>
    date.toLocaleDateString("default", { weekday: "short" });

  return (
    <div className="w-full lg:w-80 bg-white shadow rounded-2xl p-6 h-fit lg:sticky lg:top-24 flex flex-col gap-6">
      <h3 className="font-semibold text-lg border-b pb-2">Filters</h3>

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

      {/* AMENITIES TAGS */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
           <Tag size={16} className="text-blue-600" />
           <p className="font-medium text-sm text-gray-700">Amenities</p>
        </div>
        
        <div className="flex flex-col gap-2">
          {availableTags.map((tag) => (
            <label key={tag} className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="checkbox" 
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                checked={selectedTags.includes(tag)}
                onChange={() => handleTagToggle(tag)}
              />
              <span className={`text-sm transition-colors ${
                selectedTags.includes(tag) ? "text-blue-600 font-semibold" : "text-gray-600 group-hover:text-gray-900"
              }`}>
                {tag}
              </span>
            </label>
          ))}
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
    <div className="relative flex items-center gap-2 border rounded-xl px-3 py-2 flex-1 bg-gray-50">
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