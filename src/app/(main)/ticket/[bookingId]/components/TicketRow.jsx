"use client";

import React from "react";

const STATUS_COLORS = {
  Confirmed: "bg-emerald-50 text-emerald-700 border-emerald-100",
  "Pending Payment": "bg-amber-50 text-amber-700 border-amber-100",
  Inquiry: "bg-[var(--theme-primary-50)] text-[var(--theme-primary-700)] border-[var(--theme-primary-100)]",
};

export function TicketRow({ label, value, subValue, isStatus }) {
  const statusClass = isStatus ? (STATUS_COLORS[value] || "bg-slate-50 text-slate-700 border-slate-100") : "";

  return (
    <div className="space-y-1">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-0.5">{label}</p>
      <div
        className={`rounded-xl px-3 py-2 ${
          isStatus ? `border ${statusClass} text-xs font-black uppercase tracking-wider text-center` : "bg-white"
        }`}
      >
        <p className={`font-bold text-slate-900 ${isStatus ? "text-inherit" : "text-sm"}`}>{value || "—"}</p>
        {subValue && <p className="text-[10px] font-bold text-slate-400 leading-none mt-0.5">{subValue}</p>}
      </div>
    </div>
  );
}
