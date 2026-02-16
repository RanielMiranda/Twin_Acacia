import React, { useState, useEffect } from "react";

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

export default function SideRangeCalendar({ startDate, endDate, onChange, activeDropdown, onClose }) {
  const today = new Date();
  const todayUTC = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  const [baseMonth] = useState(startOfMonth(todayUTC));

  // ESC key listener to close the panel
  useEffect(() => {
    const handleEsc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const renderMonth = (monthDate) => {
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
        <div className="font-semibold mb-2 text-center text-gray-800">
          {start.toLocaleString("default", { month: "long" })} {year}
        </div>

        {/* Weekdays */}
        <div className="grid grid-cols-7 gap-1 text-[11px] text-center font-bold text-gray-400 uppercase mb-2">
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
                disabled={isPast}
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
                      onChange(endDate, null);
                    } else {
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
                  h-10 flex items-center justify-center rounded-lg text-sm transition-colors
                  ${isPast ? "text-gray-200 cursor-not-allowed" : "hover:bg-blue-100 text-gray-700"}
                  ${isStart || isEnd ? "bg-blue-600 text-white font-semibold hover:bg-blue-700" : ""}
                  ${inRange ? "bg-blue-100 text-blue-800" : ""}
                `}
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
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-[1px] z-[999]"
        onClick={onClose}
      />

      <div
        className="absolute top-0 left-full ml-4 z-[1000] bg-white shadow-2xl rounded-2xl flex flex-col p-4 gap-4 border border-gray-100 min-w-max"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center px-1">
          <h3 className="font-bold text-gray-800">
            {activeDropdown === "start" ? "Check-in" : "Check-out"}
          </h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            ✕
          </button>
        </div>

        <div className="flex gap-6">
          {renderMonth(baseMonth)}
          {renderMonth(addMonths(baseMonth, 1))}
        </div>

      </div>
    </>
  );
}