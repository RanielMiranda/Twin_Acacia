"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import TooltipInfo from "./TooltipInfo";

export default function DatabaseRecordsCard({ totalRecords, estimatedLimit, usagePct, isNearFull }) {
  return (
    <Card className="p-6 rounded-2xl border bg-white border-slate-100">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <h2 className="font-bold text-slate-900">Database Records</h2>
          <TooltipInfo text={"Data source: Supabase table counts (head count) for key tables.\nCalculation: sum of row counts to estimate total records."} />
        </div>
      </div>
      <p className="text-3xl font-black text-slate-900">{totalRecords.toLocaleString()}</p>
      <p className="mt-1 text-xs text-slate-500">
        {totalRecords.toLocaleString()} records of an estimated {estimatedLimit.toLocaleString()} record range.
      </p>
      <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${isNearFull ? "bg-rose-500" : "bg-emerald-500"}`}
          style={{ width: `${usagePct}%` }}
        />
      </div>
      <p className={`mt-3 text-xs ${isNearFull ? "text-rose-600" : "text-slate-500"}`}>
        {isNearFull
          ? "Database record count is near the estimated limit. Consider cleanup or plan upgrade."
          : "Database record count is within safe limits. No action needed."}
      </p>
    </Card>
  );
}
