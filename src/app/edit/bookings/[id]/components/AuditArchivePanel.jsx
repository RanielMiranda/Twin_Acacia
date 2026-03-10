"use client";

import React from "react";
import { Archive, RefreshCw, Clock3, User2, ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

function toActionLabel(row) {
  const from = row?.old_status || "Unknown";
  const to = row?.new_status || "Unknown";
  return `${from} -> ${to}`;
}

function getActorName(row) {
  return row?.actor_name || "system";
}

export default function AuditArchivePanel({
  audits = [],
  declinedBookings = [],
  checkedOutBookings = [],
  loading = false,
  onRefresh,
  onOpenBooking,
  onOpenTicket,
  onReopenDeclined,
  onDeleteDeclined,
  onClearAudit,
}) {
  const visibleAudits = audits || [];

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
      {hasUnresolvedConcerns ? (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-700 font-semibold">
          Resolve actions are disabled until all live concerns are cleared.
          {unresolvedConcernCount > 0 ? ` (${unresolvedConcernCount} open)` : ""}
        </div>
      ) : null}

      {visibleAudits.length === 0 && declinedBookings.length === 0 && checkedOutBookings.length === 0 ? (
        <div className="p-10 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <Archive className="mx-auto text-slate-300 mb-2" size={26} />
          <p className="text-sm font-semibold text-slate-500">No audit entries yet.</p>
        </div>
      ) : (
        <div className="space-y-2.5 max-h-[65vh] overflow-auto pr-1">
          {checkedOutBookings.map((item) => (
            <div
              key={`checkedout-${item.id}`}
              className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/60"
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-tight bg-emerald-600 text-white inline-flex items-center gap-1">
                      <ArrowRightLeft size={10} />
                      Checked Out
                    </span>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Clock3 size={10} /> {item.updatedAt ? new Date(item.updatedAt).toLocaleString() : "-"}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 leading-snug break-words">
                    Ticket: <span className="font-black text-slate-900">#{item.id}</span>
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1.5 inline-flex items-center gap-1">
                    <User2 size={11} />
                    {item.bookingForm?.guestName || "Guest"}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    className="h-8 px-3 text-xs font-bold"
                    onClick={() => onOpenBooking?.(item.id)}
                  >
                    Open Booking
                  </Button>
                  <Button
                    variant="outline"
                    className={`h-8 px-3 text-xs font-bold border-emerald-200 text-emerald-700 hover:bg-emerald-50 ${
                      hasUnresolvedConcerns ? "opacity-60 cursor-not-allowed" : ""
                    }`}
                    onClick={() => onResolveCheckedOut?.(item.id)}
                    disabled={hasUnresolvedConcerns}
                  >
                    Resolve
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {declinedBookings.map((item) => (
            <div
              key={`declined-${item.id}`}
              className="p-3 rounded-xl border border-rose-200 bg-rose-50/60"
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-tight bg-rose-600 text-white inline-flex items-center gap-1">
                      <ArrowRightLeft size={10} />
                      Declined Inquiry
                    </span>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Clock3 size={10} /> {item.updatedAt ? new Date(item.updatedAt).toLocaleString() : "-"}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 leading-snug break-words">
                    Ticket: <span className="font-black text-slate-900">#{item.id}</span>
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1.5 inline-flex items-center gap-1">
                    <User2 size={11} />
                    {item.bookingForm?.guestName || "Guest"}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    className="h-8 px-3 text-xs font-bold"
                    onClick={() => onOpenBooking?.(item.id)}
                  >
                    Open Booking
                  </Button>
                  <Button
                    variant="outline"
                    className="h-8 px-3 text-xs font-bold border-blue-200 text-blue-700 hover:bg-blue-50"
                    onClick={() => onReopenDeclined?.(item.id)}
                  >
                    Reopen
                  </Button>
                  <Button
                    variant="outline"
                    className="h-8 px-3 text-xs font-bold border-rose-200 text-rose-700 hover:bg-rose-50"
                    onClick={() => onDeleteDeclined?.(item.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {visibleAudits.map((item) => (
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
                    {getActorName(item)}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    variant="ghost"
                    className="h-8 px-3 text-xs font-bold"
                    onClick={() => onOpenBooking?.(item.booking_id)}
                  >
                    Open Booking
                  </Button>
                  <Button
                    variant="outline"
                    className="h-8 px-3 text-xs font-bold"
                    onClick={() => onOpenTicket?.(item.booking_id)}
                  >
                    Open Ticket
                  </Button>
                  <Button
                    variant="outline"
                    className="h-8 px-3 text-xs font-bold border-rose-200 text-rose-700 hover:bg-rose-50"
                    onClick={() => onClearAudit?.(item.booking_id)}
                  >
                    Clear record
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
