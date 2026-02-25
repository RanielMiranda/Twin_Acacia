import React, { useState } from "react";

function startOfMonth(date) {
  // Return the first day of the month in UTC
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

  const [baseMonth] = useState(startOfMonth(todayUTC));

  function renderMonth(monthDate) {
    const start = startOfMonth(monthDate);
    const month = start.getUTCMonth();
    const year = start.getUTCFullYear();

    const days = [];
    const firstDay = start.getUTCDay();

    for (let i = 0; i < firstDay; i++) days.push(null);

    let d = new Date(Date.UTC(year, month, 1));
    while (d.getUTCMonth() === month) {
      days.push(new Date(d));
      d.setUTCDate(d.getUTCDate() + 1);
    }

    return (
      <div className="w-[200px]">
        {/* Month Header */}
        <div className="font-semibold mb-2 text-center">
          {start.toLocaleString("default", { month: "long" })} {year}
        </div>

        {/* Weekdays */}
        <div className="grid grid-cols-7 gap-1 text-sm text-center font-medium mb-2">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
            <div key={d} className="h-8 flex items-center justify-center">{d}</div>
          ))}
        </div>

        {/* Dates */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {days.map((date, i) => {
            if (!date) return <div key={i} className="h-10" />;

            const isStart = isSameDay(date, startDate);
            const isEnd = isSameDay(date, endDate);
            const inRange = isBetween(date, startDate, endDate);

            const isPast = date < todayUTC;

            return (
              <button
                key={i}
                onClick={() => {
                  if (isPast) return;

                  // ===== SAME DAY selected as both start & end =====
                  if (isStart && isEnd) {
                    onChange(null, null);
                    return;
                  }

                  // ===== CLICKING START =====
                  if (isStart) {
                    if (endDate) {
                      // Shift range forward (end becomes new start)
                      onChange(endDate, null);
                    } else {
                      // Only start existed → clear
                      onChange(null, null);
                    }
                    return;
                  }

                  // ===== CLICKING END =====
                  if (isEnd) {
                    onChange(startDate, null);
                    return;
                  }

                  // ===== NORMAL SELECTION FLOW =====
                  if (!startDate || (startDate && endDate)) {
                    onChange(date, null);
                  } else if (activeDropdown === "end" && date < startDate) {
                    onChange(date, startDate);
                  } else {
                    onChange(startDate, date);
                  }
                }}
                className={`
                  h-10 flex items-center justify-center text-sm px-3
                  ${isPast ? "text-gray-300 cursor-not-allowed" : "hover:bg-blue-100 hover:rounded-md hover:scale-110"}
                  ${isStart || isEnd ? "bg-blue-600 text-white font-semibold hover:bg-blue-300" : ""}
                  ${isStart ? "rounded-bl-md rounded-tl-md" : ""}
                  ${isEnd ? "rounded-tr-md rounded-br-md" : ""}
                  ${inRange ? "bg-blue-100" : ""}
                `}
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
    <div className="bg-white shadow-xl rounded-bl-2xl rounded-br-2xl flex p-4 gap-4">
      {renderMonth(baseMonth)}
      {renderMonth(addMonths(baseMonth, 1))}
    </div>
  );
}
