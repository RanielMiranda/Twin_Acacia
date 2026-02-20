import React from "react";
import { Calendar } from "lucide-react";
import RangeCalendar from "./RangeCalendar";


export default function DateRangeField({
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

      <div className="relative flex items-center gap-2 border-gray-200 border rounded-xl px-3 py-2 flex-1">
        <Calendar size={16} />

        {/* START DATE */}
        <button
          className="flex-1 text-center whitespace-nowrap"
          onClick={() => setActiveDropdown("start")}
        >
          <div className="text-sm font-medium ">
            {startDate ? formatFullDate(startDate) : "Check-in date"}
          </div>
          <div className="text-xs text-gray-400">
            {startDate ? formatWeekday(startDate) : "Start"}
          </div>
        </button>

        <span className="w-px bg-gray-200 h-8" />

        {/* END DATE */}
        <button
          className="flex-1 text-center whitespace-nowrap"
          onClick={() => setActiveDropdown("end")}
        >
          <div className="text-sm font-medium">
            {endDate ? formatFullDate(endDate) : "Check-out date"}
          </div>
          <div className="text-xs text-gray-400">
            {endDate ? formatWeekday(endDate) : "End"}
          </div>
        </button>

        {(activeDropdown === "start" || activeDropdown === "end") && (
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 translate-y-1/10 mt-0 z-[9999] w-[420px] shadow-2xl">
            <RangeCalendar
              startDate={startDate}
              endDate={endDate}
              activeDropdown={activeDropdown}
              onChange={(s, e) => {
                setStartDate(s);
                setEndDate(e);

                if (activeDropdown === "start" && s)
                  setActiveDropdown("end");
              }}
            />
          </div>
        )}
      </div>
  );
}
