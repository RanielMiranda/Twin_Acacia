"use client";

import React from "react";

export default function TooltipInfo({ text }) {
  const lines = String(text || "").split("\n");
  return (
    <span className="relative inline-flex group">
      <span
        aria-hidden="true"
        className="h-5 w-5 rounded-full border border-slate-300 bg-white text-[11px] font-black text-slate-600 flex items-center justify-center shadow-sm group-hover:bg-slate-50"
      >
        ?
      </span>
      <span className="pointer-events-none absolute left-1/2 top-7 z-20 hidden w-72 -translate-x-1/2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] leading-4 text-slate-700 shadow-lg group-hover:block">
        <span className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-l border-t border-slate-200 bg-white" />
        {lines.map((line, idx) => (
          <span key={`${line}-${idx}`} className="block">
            {line}
          </span>
        ))}
      </span>
    </span>
  );
}
