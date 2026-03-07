"use client";

import React from "react";
import { Archive, RefreshCw, Clock3, User2, ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

function toActionLabel(row) {
  const from = row?.old_status || "Unknown";
  const to = row?.new_status || "Unknown";
  return `${from} -> ${to}`;
}

export default function AuditArchivePanel({
  audits = [],
  loading = false,
  onRefresh,
  onOpenBooking,
}) {
  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-5 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <Archive size={16} className="text-indigo-600" />
            Audit Archive
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Recent booking status/payment changes for this resort.
          </p>
        </div>
        <Button
          variant="outline"
          className="rounded-xl h-9 px-4 text-xs font-bold flex items-center justify-center"
          onClick={onRefresh}
        >
          <RefreshCw size={14} className="mr-2" />
          {loading ? "Refreshing..." : "Refresh Archive"}
        </Button>
      </div>

      {audits.length === 0 ? (
        <div className="p-10 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <Archive className="mx-auto text-slate-300 mb-2" size={26} />
          <p className="text-sm font-semibold text-slate-500">No audit entries yet.</p>
        </div>
      ) : (
        <div className="space-y-2.5 max-h-[65vh] overflow-auto pr-1">
          {audits.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-xl border border-indigo-100 bg-indigo-50/40"
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-tight bg-indigo-600 text-white inline-flex items-center gap-1">
                      <ArrowRightLeft size={10} />
                      Action
                    </span>
                    <span className="text-[10px] font-bold text-slate-600 uppercase">
                      {toActionLabel(item)}
                    </span>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Clock3 size={10} /> {new Date(item.changed_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 leading-snug break-words">
                    Ticket: <span className="font-black text-slate-900">#{item.booking_id}</span>
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1.5 inline-flex items-center gap-1">
                    <User2 size={11} />
                    {item.actor_name || item.actor_role || "system"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    className="h-8 px-3 text-xs font-bold"
                    onClick={() => onOpenBooking?.(item.booking_id)}
                  >
                    Open Booking
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

