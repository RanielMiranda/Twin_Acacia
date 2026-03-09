import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

function startOfMonth(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function addMonths(date, count) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + count, 1));
}

function isSameDay(a, b) {
  if (!a || !b) return false;
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

function isBetween(date, start, end) {
  if (!start || !end) return false;
  return date > start && date < end;
}

export default function RangeCalendar({ startDate, endDate, onChange, activeDropdown }) {
  const today = new Date();
  const todayUTC = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  const [baseMonth, setBaseMonth] = useState(startOfMonth(todayUTC));

  function renderMonth(monthDate) {
    const start = startOfMonth(monthDate);
    const month = start.getUTCMonth();
    const year = start.getUTCFullYear();

    const days = [];
    const firstDay = start.getUTCDay();

    for (let i = 0; i < firstDay; i += 1) days.push(null);

    const cursor = new Date(Date.UTC(year, month, 1));
    while (cursor.getUTCMonth() === month) {
      days.push(new Date(cursor));
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

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

            return (
              <button
                key={index}
                onClick={() => {
                  if (isPast) return;

                  if (isStart && isEnd) {
                    onChange(null, null);
                    return;
                  }

                  if (isStart) {
                    if (endDate) {
                      onChange(endDate, null);
                    } else {
                      onChange(null, null);
                    }
                    return;
                  }

                  if (isEnd) {
                    onChange(startDate, null);
                    return;
                  }

                  if (!startDate || (startDate && endDate)) {
                    onChange(date, null);
                  } else if (activeDropdown === "end" && date < startDate) {
                    onChange(date, startDate);
                  } else {
                    onChange(startDate, date);
                  }
                }}
                className={[
                  "flex h-10 w-10 items-center justify-center text-sm transition-colors",
                  isPast ? "cursor-not-allowed text-gray-300" : "hover:bg-blue-100",
                  inRange ? "rounded-md bg-blue-100 text-blue-700" : "rounded-full",
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
