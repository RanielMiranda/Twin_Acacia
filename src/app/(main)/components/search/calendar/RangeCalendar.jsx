import React, { useState } from "react";
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

export default function RangeCalendar({
  startDate,
  endDate,
  onChange,
  activeDropdown,
  blockedRanges = [],
}) {
  const todayUTC = getUtcToday();
  const [baseMonth, setBaseMonth] = useState(startOfMonth(todayUTC));

  function renderMonth(monthDate) {
    const { start, year, days } = buildMonthDays(monthDate);

    return (
      <div className="w-[200px]">
        <div className="mb-2 text-center font-semibold">
          {start.toLocaleString("default", { month: "long" })} {year}
        </div>

        <div className="mb-2 grid grid-cols-7 gap-1 text-center text-sm font-medium">
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
            const isBlocked = (blockedRanges || []).some((range) => {
              if (!range?.start || !range?.end) return false;
              return date >= range.start && date <= range.end;
            });

            return (
              <button
                key={index}
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
                  isBlocked && !inRange && !isStart && !isEnd ? "rounded-md bg-rose-100 text-rose-700" : "",
                  isStart || isEnd ? "relative z-10 rounded-full bg-blue-600 font-semibold text-white hover:bg-blue-600" : "",
                ].join(" ")}
                disabled={isPast}
              >
                {date.getUTCDate()}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-bl-2xl rounded-br-2xl bg-white p-4 shadow-xl">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setBaseMonth((prev) => addMonths(prev, -1))}
          className="rounded-full border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50"
          aria-label="Previous month"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          type="button"
          onClick={() => setBaseMonth((prev) => addMonths(prev, 1))}
          className="rounded-full border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50"
          aria-label="Next month"
        >
          <ChevronRight size={16} />
        </button>
      </div>
      <div className="flex gap-4">
        {renderMonth(baseMonth)}
        {renderMonth(addMonths(baseMonth, 1))}
      </div>
    </div>
  );
}
