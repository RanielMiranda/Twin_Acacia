import React, { useState } from "react";

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);    
}

function addMonths(date, count) {
  return new Date(date.getFullYear(), date.getMonth() + count, 1);
}

function isSameDay(a, b) {
  if (!a || !b) return false;
  return a.getFullYear() === b.getFullYear() &&
         a.getMonth() === b.getMonth() &&
         a.getDate() === b.getDate();
}

function isBetween(date, start, end) {
  if (!start || !end) return false;
  return date > start && date < end;
}

export default function RangeCalendar({ startDate, endDate, onChange, activeDropdown }) {
  const today = new Date();
  const [baseMonth] = useState(startOfMonth(today));

  function renderMonth(monthDate) {
    const start = startOfMonth(monthDate);
    const month = start.getMonth();
    const year = start.getFullYear();

    const days = [];
    const firstDay = start.getDay();

    for (let i = 0; i < firstDay; i++) days.push(null);

    let d = new Date(year, month, 1);
    while (d.getMonth() === month) {
      days.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }

    return (
      <div className="w-[200px]">
        <div className="font-semibold mb-2 text-center">
          {start.toLocaleString("default", { month: "long" })} {year}
        </div>
        <div className="grid grid-cols-7 gap-1 text-sm text-center font-medium mb-2">
          {["Su","Mo","Tu","We","Th","Fr","Sa"].map((d) => (
            <div key={d} className="h-8 flex items-center justify-center">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {days.map((date, i) => {
            if (!date) return <div key={i} className="h-10" />;
            const isStart = isSameDay(date, startDate);
            const isEnd = isSameDay(date, endDate);
            const inRange = isBetween(date, startDate, endDate);

            return (
              <button
                key={i}
                onClick={() => {
                  if (!startDate || (startDate && endDate)) {
                    onChange(date, null); // Start new range
                  } else if (activeDropdown === "end" && date < startDate) {
                    onChange(date, startDate); // swap if end < start
                  } else {
                    onChange(startDate, date);
                  }
                }}
                className={`
                  h-10 flex items-center justify-center rounded-lg text-sm
                  ${isStart || isEnd ? "bg-blue-600 text-white font-semibold" : ""}
                  ${inRange ? "bg-blue-100" : ""}
                  hover:bg-blue-50
                `}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-xl rounded-2xl flex p-4 gap-4">
      {renderMonth(baseMonth)}
      {renderMonth(addMonths(baseMonth, 1))}
    </div>
  );
}
