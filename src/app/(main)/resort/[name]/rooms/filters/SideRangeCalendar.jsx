import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  addMonths,
  buildMonthDays,
  getNextRange,
  getUtcToday,
  isBetween,
  isSameDay,
  startOfMonth,
} from "@/lib/rangeCalendarUtils";

export default function SideRangeCalendar({
  startDate,
  endDate,
  onChange,
  activeDropdown,
  onClose,
  monthCount = 2,
  mobileCentered = false,
}) {
  const todayUTC = getUtcToday();
  const [baseMonth, setBaseMonth] = useState(startOfMonth(todayUTC));

  useEffect(() => {
    const handleEsc = (event) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const renderMonth = (monthDate) => {
    const { start, year, days } = buildMonthDays(monthDate);

    return (
      <div className="w-[200px]">
        <div className="mb-2 text-center font-semibold text-gray-800">
          {start.toLocaleString("default", { month: "long" })} {year}
        </div>

        <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[11px] font-bold uppercase text-gray-400">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
            <div key={day} className="flex h-8 items-center justify-center">{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 text-center">
          {days.map((date, index) => {
            if (!date) return <div key={index} className="h-10" />;

            const isStart = isSameDay(date, startDate);
            const isEnd = isSameDay(date, endDate);
            const inRange = isBetween(date, startDate, endDate);
            const isPast = date < todayUTC;

            return (
              <button
                key={index}
                disabled={isPast}
                onClick={() => {
                  if (isPast) return;

                  const next = getNextRange({
                    date,
                    startDate,
                    endDate,
                    activeDropdown,
                  });
                  onChange(next.start, next.end);
                }}
                className={[
                  "flex h-10 w-10 items-center justify-center text-sm transition-colors",
                  isPast ? "cursor-not-allowed text-gray-300" : "hover:bg-blue-100",
                  inRange ? "rounded-md bg-blue-100 text-blue-700" : "rounded-full",
                  isStart || isEnd ? "relative z-10 rounded-full bg-blue-600 font-semibold text-white hover:bg-blue-600" : "",
                ].join(" ")}
              >
                {date.getUTCDate()}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="fixed inset-0 z-[999] bg-black/20 backdrop-blur-[1px]" onClick={onClose} />

      <div
        className={`relative z-[1000] flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-2xl ${
          mobileCentered
            ? "fixed left-1/2 top-1/2 w-[min(92vw,360px)] -translate-x-1/2 -translate-y-1/2"
            : "absolute top-0 w-[min(92vw,460px)]"
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between px-1">
          <div className="w-10" />
          <h3 className="font-bold text-gray-800">
            {activeDropdown === "start" ? "Check-in" : "Check-out"}
          </h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            x
          </button>
        </div>

        <button
          type="button"
          onClick={() => setBaseMonth((prev) => addMonths(prev, -1))}
          className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-slate-200 bg-white p-2 text-slate-500 shadow-sm hover:bg-slate-50"
          aria-label="Previous month"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          type="button"
          onClick={() => setBaseMonth((prev) => addMonths(prev, 1))}
          className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-slate-200 bg-white p-2 text-slate-500 shadow-sm hover:bg-slate-50"
          aria-label="Next month"
        >
          <ChevronRight size={18} />
        </button>

        <div className={`flex ${monthCount > 1 ? "gap-6 px-10" : "justify-center px-10"}`}>
          {Array.from({ length: monthCount }).map((_, index) => (
            <React.Fragment key={index}>
              {renderMonth(addMonths(baseMonth, index))}
            </React.Fragment>
          ))}
        </div>
      </div>
    </>
  );
}
