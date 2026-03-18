"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import TooltipInfo from "./TooltipInfo";

export default function DailyEmailUsageCard({ emailStats }) {
  return (
    <Card className="p-6 rounded-2xl border bg-white border-slate-100">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-slate-900">Daily Email Usage</h2>
            <TooltipInfo text={"Data source: email_delivery_logs table.\nCalculation: aggregated per day for the last 7 days."} />
          </div>
          <p className="text-sm text-slate-500">Send attempts over the last 7 days.</p>
        </div>
      </div>
      {!emailStats.usageInstalled ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
          Run `supabase/schema.sql` to enable this panel.
        </div>
      ) : (
        <div className="space-y-3">
          {emailStats.daily.map((entry) => {
            const maxCount = Math.max(...emailStats.daily.map((row) => row.sent), 1);
            const sentWidth = Math.max(8, Math.round((entry.sent / maxCount) * 100));
            return (
              <div key={entry.date} className="grid grid-cols-[92px_1fr_auto] items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {new Date(`${entry.date}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </span>
                <div className="h-3 rounded-full bg-slate-100 overflow-hidden flex">
                  <div
                    className="h-full bg-emerald-500"
                    style={{ width: `${sentWidth}%` }}
                    title={`Sent: ${entry.sent}`}
                  />
                </div>
                <span className="text-sm font-bold text-slate-900">
                  {entry.sent}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
