import React, { useEffect, useState } from "react";

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
  const [baseMonth] = useState(startOfMonth(todayUTC));

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
                    if (endDate && !isSameDay(startDate, endDate)) {
                      onChange(endDate, endDate);
                    } else {
                      onChange(null, null);
                    }
                    return;
                  }

                  if (isEnd) {
                    onChange(startDate, startDate);
                    return;
                  }

                  if (!startDate || (startDate && endDate && activeDropdown === "start")) {
                    onChange(date, date);
                  } else if (activeDropdown === "end" && date < startDate) {
                    onChange(date, startDate);
                  } else {
                    onChange(startDate, date);
                  }
                }}
                className={`
                  flex h-10 items-center justify-center px-3 text-sm
                  ${isPast ? "cursor-not-allowed text-gray-300" : "hover:-translate-y-[1px] hover:rounded-md hover:bg-blue-100"}
                  ${isStart || isEnd ? "bg-blue-600 font-semibold text-white hover:bg-blue-500" : ""}
                  ${isStart ? "rounded-bl-md rounded-tl-md" : ""}
                  ${isEnd ? "rounded-br-md rounded-tr-md" : ""}
                  ${inRange ? "bg-blue-100" : ""}
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
      <div className="fixed inset-0 z-[999] bg-black/20 backdrop-blur-[1px]" onClick={onClose} />

      <div
        className={`z-[1000] flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-2xl ${
          mobileCentered
            ? "fixed left-1/2 top-1/2 w-[min(92vw,360px)] -translate-x-1/2 -translate-y-1/2"
            : "absolute left-0 top-full mt-2 w-[min(92vw,460px)]"
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between px-1">
          <h3 className="font-bold text-gray-800">
            {activeDropdown === "start" ? "Check-in" : "Check-out"}
          </h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            x
          </button>
        </div>

        <div className={`flex ${monthCount > 1 ? "gap-6" : "justify-center"}`}>
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
