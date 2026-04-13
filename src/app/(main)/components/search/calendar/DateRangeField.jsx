import React, { useEffect, useRef } from "react";
import { Calendar, X } from "lucide-react";
import RangeCalendar from "./RangeCalendar";


export default function DateRangeField({
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  activeDropdown,
  setActiveDropdown,
  formatFullDate,
  formatWeekday,
  blockedRanges = [],
  inline = false,
  autoAdvance = true,
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!inline) return undefined;
    const handleClick = (event) => {
      if (!activeDropdown) return;
      if (containerRef.current && containerRef.current.contains(event.target)) return;
      setActiveDropdown(null);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [activeDropdown, inline, setActiveDropdown]);

  return (
      <div ref={containerRef} className="relative flex items-center gap-2 border-gray-200 border rounded-xl px-3 py-2 flex-1">
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
          <>
            {!inline ? (
              <div
                className="fixed inset-0 z-[9998] bg-black/25"
                onClick={() => setActiveDropdown(null)}
              />
            ) : null}

            <div
              className={`${
                inline
                  ? "absolute left-0 top-full mt-3 z-50 w-[420px]"
                  : "fixed left-1/2 top-1/2 z-[9999] w-[min(92vw,520px)] -translate-x-1/2 -translate-y-1/2"
              }`}
            >
              <div className="relative rounded-[32px] bg-white shadow-2xl animate-in fade-in zoom-in duration-200">
                <button
                  type="button"
                  className="absolute right-3 top-3 z-20 rounded-full border border-slate-200 bg-white p-2 text-slate-500 shadow-sm transition hover:bg-slate-50"
                  onClick={() => setActiveDropdown(null)}
                  aria-label="Close calendar"
                >
                  <X size={18} />
                </button>
                <div className="p-4">
                  <RangeCalendar
                    startDate={startDate}
                    endDate={endDate}
                    activeDropdown={activeDropdown}
                    blockedRanges={blockedRanges}
                    onChange={(s, e) => {
                      setStartDate(s);
                      setEndDate(e);

                      if (autoAdvance && activeDropdown === "start" && s) {
                        setActiveDropdown("end");
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
  );
}
