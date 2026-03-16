"use client";

import React from "react";
import { Clock3, ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getContactMeta, getPaxSummary, getDateTimeParts } from "./utils";

export default function CheckedOutTabs({
  mode,
  filteredArchived,
  filteredCheckedOut,
  onOpenBooking,
  onReopenCheckedOut,
  onResolveCheckedOut,
  unresolvedIssueBookingIds = new Set(),
}) {
  const pendingLabel = mode === "history"
    ? "Pending Checked Out (7-day window)"
    : "Checked Out (Bookings)";

  return (
    <div className="space-y-3">
      {filteredCheckedOut.length > 0 ? (
        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{pendingLabel}</p>
          {filteredCheckedOut.map((item) => {
            const inquirerType = (item.inquirerType || item.bookingForm?.inquirerType || "client").toString().toLowerCase();
            const roomLabel = item.bookingForm?.roomName || "Room";
            const guestName = item.bookingForm?.stayingGuestName || item.bookingForm?.guestName || "Guest";
            const agentName = item.bookingForm?.agentName || "";
            const { contactEmail, contactPhone, clientEmail, clientPhone } = getContactMeta(item);
            const { adultCount, childrenCount, sleepingGuests, paxTotal } = getPaxSummary(item);
            const { checkInDate, checkOutDate, checkInTime, checkOutTime } = getDateTimeParts(item);
            const hasUnresolvedIssue = unresolvedIssueBookingIds.has(item.id?.toString());

            return (
              <div key={`checkedout-${item.id}`} className="p-3 rounded-2xl border border-slate-200 bg-slate-50/70">
                <div className="flex flex-col lg:flex-row lg:items-stretch gap-2">
                  <div className="min-w-0 lg:flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-tight text-white inline-flex items-center gap-1 bg-slate-700">
                        <ArrowRightLeft size={10} />
                        Checked Out
                      </span>
                      <span className="text-[10px] font-black px-2 py-0.5 bg-white/80 rounded-md text-slate-600 uppercase tracking-tight">
                        {roomLabel}
                      </span>
                      <span className="text-[11px] font-black text-slate-600 uppercase inline-flex items-center gap-2">
                        {checkInDate} <ArrowRightLeft size={10} /> {checkOutDate}
                        <span className="inline-flex items-center gap-1 text-[10px] text-slate-500">
                          <Clock3 size={10} /> {checkInTime} - {checkOutTime}
                        </span>
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={`text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${
                        inquirerType === "agent"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}>
                        {inquirerType === "agent" ? "Agent" : "Client"}
                      </span>
                      <span className="text-sm font-black text-slate-900">{guestName}</span>
                      {agentName ? (
                        <span className="text-[11px] text-slate-600">Agent: {agentName}</span>
                      ) : null}
                      <span className="text-[10px] text-slate-600 bg-white/80 border border-slate-200 px-2 py-0.5 rounded-full">
                        Pax {paxTotal} - Adults {adultCount} - Children {childrenCount} - Sleeping {sleepingGuests}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 flex flex-wrap items-center gap-3">
                      <span>Contact: {contactEmail || "No email"}{contactPhone ? ` - ${contactPhone}` : ""}</span>
                      {inquirerType === "agent" ? (
                        <span>Client: {clientEmail || "No email"}{clientPhone ? ` - ${clientPhone}` : ""}</span>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex items-center justify-between lg:flex-col lg:justify-center lg:items-center lg:w-56 gap-2 lg:border-l lg:border-white/60 lg:pl-4">
                    {hasUnresolvedIssue ? (
                      <div className="text-[10px] font-black uppercase tracking-widest text-rose-600">
                        Unresolved issue
                      </div>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap lg:justify-end">
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
                      onClick={() => onReopenCheckedOut?.(item.id)}
                      disabled={hasUnresolvedIssue}
                    >
                      Reopen
                    </Button>
                    <Button
                      variant="outline"
                      className={`h-8 px-3 text-xs font-bold border-rose-200 text-rose-700 hover:bg-rose-50 ${
                        hasUnresolvedIssue ? "opacity-60 cursor-not-allowed" : ""
                      }`}
                      onClick={() => onResolveCheckedOut?.(item.id)}
                      disabled={hasUnresolvedIssue}
                    >
                      Resolve
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {filteredArchived.length > 0 ? (
        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Archived Checked Out</p>
          {filteredArchived.map((item) => {
            const inquirerType = (item.inquirerType || item.bookingForm?.inquirerType || "client").toString().toLowerCase();
            const roomLabel = item.bookingForm?.roomName || "Room";
            const guestName = item.bookingForm?.stayingGuestName || item.bookingForm?.guestName || "Guest";
            const agentName = item.bookingForm?.agentName || "";
            const { contactEmail, contactPhone, clientEmail, clientPhone } = getContactMeta(item);
            const { adultCount, childrenCount, sleepingGuests, paxTotal } = getPaxSummary(item);
            const { checkInDate, checkOutDate, checkInTime, checkOutTime } = getDateTimeParts(item);

            return (
              <div key={`archive-${item.id}`} className="p-3 rounded-2xl border border-slate-200 bg-slate-50/70">
                <div className="flex flex-col lg:flex-row lg:items-stretch gap-2">
                  <div className="min-w-0 lg:flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-tight text-white inline-flex items-center gap-1 bg-slate-700">
                        <ArrowRightLeft size={10} />
                        Checked Out
                      </span>
                      <span className="text-[10px] font-black px-2 py-0.5 bg-white/80 rounded-md text-slate-600 uppercase tracking-tight">
                        {roomLabel}
                      </span>
                      <span className="text-[11px] font-black text-slate-600 uppercase inline-flex items-center gap-2">
                        {checkInDate} <ArrowRightLeft size={10} /> {checkOutDate}
                        <span className="inline-flex items-center gap-1 text-[10px] text-slate-500">
                          <Clock3 size={10} /> {checkInTime} - {checkOutTime}
                        </span>
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={`text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${
                        inquirerType === "agent"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}>
                        {inquirerType === "agent" ? "Agent" : "Client"}
                      </span>
                      <span className="text-sm font-black text-slate-900">{guestName}</span>
                      {agentName ? (
                        <span className="text-[11px] text-slate-600">Agent: {agentName}</span>
                      ) : null}
                      <span className="text-[10px] text-slate-600 bg-white/80 border border-slate-200 px-2 py-0.5 rounded-full">
                        Pax {paxTotal} - Adults {adultCount} - Children {childrenCount} - Sleeping {sleepingGuests}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 flex flex-wrap items-center gap-3">
                      <span>Contact: {contactEmail || "No email"}{contactPhone ? ` - ${contactPhone}` : ""}</span>
                      {inquirerType === "agent" ? (
                        <span>Client: {clientEmail || "No email"}{clientPhone ? ` - ${clientPhone}` : ""}</span>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex items-center justify-between lg:flex-col lg:justify-center lg:items-center lg:w-56 gap-2 lg:border-l lg:border-white/60 lg:pl-4">
                    <div className="flex items-center gap-2" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
