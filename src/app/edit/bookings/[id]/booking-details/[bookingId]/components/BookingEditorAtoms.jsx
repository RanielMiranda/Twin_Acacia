"use client";

import React from "react";
import { CheckCircle, Clock } from "lucide-react";

export function SectionLabel({ icon, label }) {
  return (
    <div className="flex items-center gap-2 px-1">
      <div className="text-blue-600">{icon}</div>
      <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</span>
    </div>
  );
}

export function InfoItem({ label, value, editing = false, onChange, type = "text" }) {
  return (
    <div>
      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
      {editing ? (
        <input
          type={type}
          value={value || ""}
          onChange={(e) => onChange?.(e.target.value)}
          className="text-sm font-bold text-slate-900 border-b border-slate-200 outline-none w-full"
        />
      ) : (
        <p className="text-sm font-bold text-slate-900 truncate">{value || "-"}</p>
      )}
    </div>
  );
}

export function StatusBadge({ status }) {
  const normalized = (status || "").toLowerCase();
  const isConfirmed = normalized.includes("confirm");
  const isPending = normalized.includes("pending") || normalized.includes("inquiry");

  return (
    <div
      className={`flex items-center gap-3 px-6 py-3 rounded-2xl border-2 ${
        isConfirmed
          ? "bg-emerald-50 border-emerald-100 text-emerald-700"
          : isPending
            ? "bg-amber-50 border-amber-100 text-amber-700"
            : "bg-blue-50 border-blue-100 text-blue-700"
      }`}
    >
      {isConfirmed ? <CheckCircle size={20} /> : <Clock size={20} />}
      <div className="flex flex-col">
        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Status</span>
        <span className="text-sm font-black uppercase tracking-wider">{status}</span>
      </div>
    </div>
  );
}
