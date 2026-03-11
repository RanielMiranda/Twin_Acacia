"use client";

import React from "react";
import { AlertTriangle, Clock3, MessageCircleWarning, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LiveConcernsPanel({
  concerns = [],
  loading = false,
  onRefresh,
  onResolve,
  onReopen,
  onOpenBooking,
}) {
  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-5 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <MessageCircleWarning size={16} className="text-rose-600" />
            Live Concerns Feed
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Resolved concerns are deleted immediately.
          </p>
        </div>
        <Button
          variant="outline"
          className="rounded-xl h-9 px-4 text-xs font-bold flex items-center justify-center"
          onClick={onRefresh}
        >
          <RefreshCw size={14} className="mr-2" />
          {loading ? "Refreshing..." : "Refresh Feed"}
        </Button>
      </div>

      {concerns.length === 0 ? (
        <div className="p-10 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <AlertTriangle className="mx-auto text-slate-300 mb-2" size={26} />
          <p className="text-sm font-semibold text-slate-500">No active concerns right now.</p>
        </div>
      ) : (
        <div className="space-y-2.5 max-h-[65vh] overflow-auto pr-1">
          {concerns.map((issue) => (
            <div
              key={issue.id}
              className={`p-3 rounded-xl border ${
                issue.status === "resolved"
                  ? "bg-slate-50 border-slate-200"
                  : "bg-rose-50/40 border-rose-100"
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                <div className="min-w-0 lg:flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-tight ${
                        issue.status === "resolved"
                          ? "bg-slate-200 text-slate-600"
                          : "bg-rose-600 text-white"
                      }`}
                    >
                      {issue.status}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">
                      {issue.subject || "Concern"}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {issue.guest_name || "Guest"}{issue.guest_email ? ` - ${issue.guest_email}` : ""}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock3 size={10} /> {new Date(issue.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 leading-snug break-words mt-1">{issue.message}</p>
                </div>
                <div className="flex items-center gap-2 lg:justify-end lg:shrink-0">
                  <Button
                    variant="ghost"
                    className="h-8 px-3 text-xs font-bold"
                    onClick={() => onOpenBooking?.(issue.booking_id)}
                  >
                    Open Booking
                  </Button>
                  {issue.status === "resolved" ? (
                    <Button
                      variant="outline"
                      className="h-8 px-3 text-xs font-bold"
                      onClick={() => onReopen?.(issue.id)}
                    >
                      Reopen
                    </Button>
                  ) : (
                    <Button
                      className="h-8 px-3 text-xs font-bold bg-blue-600 hover:bg-blue-700"
                      onClick={() => onResolve?.(issue.id)}
                    >
                      Resolve & Delete
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
