import React, { useEffect, useState } from "react";
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

export default function SideRangeCalendar({
  startDate,
  endDate,
  onChange,
  activeDropdown,
  onClose,
  monthCount = 2,
  mobileCentered = false,
}) {
  const today = new Date();
  const todayUTC = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  const [baseMonth, setBaseMonth] = useState(startOfMonth(todayUTC));

  useEffect(() => {
    const handleEsc = (event) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const renderMonth = (monthDate) => {
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
                  isPast ? "cursor-not-allowed text-gray-300" : "hover:bg-[var(--theme-primary-100)]",
                  inRange ? "rounded-md bg-[var(--theme-primary-100)] text-[var(--theme-primary-700)]" : "rounded-full",
                  isStart || isEnd ? "relative z-10 rounded-full bg-[var(--theme-primary-600)] font-semibold text-white hover:bg-[var(--theme-primary-600)]" : "",
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
