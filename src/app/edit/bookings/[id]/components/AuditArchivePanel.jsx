"use client";

import React, { useMemo, useState } from "react";
import { Archive, RefreshCw, Clock3, ArrowRightLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AuditArchivePanel({
  declinedBookings = [],
  checkedOutBookings = [],
  archivedBookings = [],
  loading = false,
  onRefresh,
  onOpenBooking,
  onReopenDeclined,
  onReopenCancelled,
  onReopenCheckedOut,
  onDeleteDeclined,
  onResolveCheckedOut,
  onDeleteArchived,
  unresolvedIssueBookingIds = new Set(),
}) {
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");

  const normalizedSearch = search.trim().toLowerCase();
  const matchesSearch = (fields) => {
    if (!normalizedSearch) return true;
    return fields.some((value) =>
      String(value || "").toLowerCase().includes(normalizedSearch)
    );
  };
  const getContactMeta = (item) => {
    const form = item.bookingForm || {};
    const inquirerType = (item.inquirerType || form.inquirerType || "client").toString().toLowerCase();
    const guestEmail = form.stayingGuestEmail || form.guestEmail || form.email || "";
    const guestPhone = form.guestPhone || form.phoneNumber || "";
    const agentEmail = form.agentEmail || form.agentContactEmail || "";
    const agentPhone = form.agentPhone || form.agentContactPhone || "";
    return {
      inquirerType,
      guestEmail,
      guestPhone,
      agentEmail: inquirerType === "agent" ? agentEmail : "",
      agentPhone: inquirerType === "agent" ? agentPhone : "",
    };
  };
  const getPaxSummary = (item) => {
    const form = item.bookingForm || {};
    const adultCount = Number(item.adultCount ?? form.adultCount ?? 0);
    const childrenCount = Number(item.childrenCount ?? form.childrenCount ?? 0);
    const sleepingGuests = Number(item.sleepingGuests ?? form.sleepingGuests ?? 0);
    const paxTotal = adultCount + childrenCount;
    return { adultCount, childrenCount, sleepingGuests, paxTotal };
  };

  const cancelledBookings = useMemo(
    () =>
      (checkedOutBookings || []).filter((item) =>
        String(item.status || item.bookingForm?.status || "").toLowerCase().includes("cancel")
      ),
    [checkedOutBookings]
  );
  const checkedOutOnlyBookings = useMemo(
    () =>
      (checkedOutBookings || []).filter((item) => {
        const status = String(item.status || item.bookingForm?.status || "").toLowerCase();
        return (status.includes("checked out") || status.includes("checked-out")) && !status.includes("cancel");
      }),
    [checkedOutBookings]
  );

  const filteredArchived = useMemo(
    () =>
      (archivedBookings || []).filter((item) =>
        matchesSearch([
          item.bookingForm?.stayingGuestName,
          item.bookingForm?.guestName,
          item.bookingForm?.agentName,
          item.startDate,
          item.endDate,
        ])
      ),
    [archivedBookings, normalizedSearch]
  );

  const filteredDeclined = useMemo(
    () =>
      (declinedBookings || []).filter((item) =>
        matchesSearch([
          item.bookingForm?.stayingGuestName,
          item.bookingForm?.guestName,
          item.bookingForm?.agentName,
          item.startDate,
          item.endDate,
        ])
      ),
    [declinedBookings, normalizedSearch]
  );

  const filteredCancelled = useMemo(
    () =>
      (cancelledBookings || []).filter((item) =>
        matchesSearch([
          item.bookingForm?.stayingGuestName,
          item.bookingForm?.guestName,
          item.bookingForm?.agentName,
          item.startDate,
          item.endDate,
        ])
      ),
    [cancelledBookings, normalizedSearch]
  );
  const filteredCheckedOut = useMemo(
    () =>
      (checkedOutOnlyBookings || []).filter((item) =>
        matchesSearch([
          item.bookingForm?.stayingGuestName,
          item.bookingForm?.guestName,
          item.bookingForm?.agentName,
          item.startDate,
          item.endDate,
        ])
      ),
    [checkedOutOnlyBookings, normalizedSearch]
  );

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-5 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <Archive size={16} className="text-indigo-600" />
            Audit Archive
          </h3>
          <p className="text-xs text-slate-500 mt-1">History of completed and declined stays.</p>
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5">
        <div className="flex flex-wrap gap-2">
          {[
            { id: "all", label: "All" },
            { id: "history", label: "Checked Out" },
            { id: "declined", label: "Declined" },
            { id: "cancelled", label: "Cancelled" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest border ${
                activeTab === tab.id
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative w-full md:max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search guest, agent, or date"
            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs font-semibold text-slate-600"
          />
        </div>
      </div>
      {filteredCheckedOut.length > 0 ? (
        <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-700">
          Bookings stored here for up to 7 days can be archived forever. Use Resolve to archive and strip extra data.
        </div>
      ) : null}

      {filteredArchived.length === 0 &&
      filteredDeclined.length === 0 &&
      filteredCancelled.length === 0 &&
      filteredCheckedOut.length === 0 ? (
        <div className="p-10 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <Archive className="mx-auto text-slate-300 mb-2" size={26} />
          <p className="text-sm font-semibold text-slate-500">No audit entries yet.</p>
        </div>
      ) : (
        <div className="space-y-2.5 max-h-[65vh] overflow-auto pr-1">
          {activeTab === "all" ? (
            <div className="space-y-4">
              {filteredArchived.length > 0 ? (
                <div className="space-y-2.5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Archived Checked Out</p>
                  {filteredArchived.map((item) => {
                    const inquirerType = (item.inquirerType || item.bookingForm?.inquirerType || "client").toString().toLowerCase();
                    const roomLabel = item.bookingForm?.roomName || "Room";
                    const checkIn = item.startDate || item.bookingForm?.checkInDate || "-";
                    const checkOut = item.endDate || item.bookingForm?.checkOutDate || "-";
                    const guestName = item.bookingForm?.stayingGuestName || item.bookingForm?.guestName || "Guest";
                    const agentName = item.bookingForm?.agentName || "";
                    const { guestEmail, guestPhone, agentEmail, agentPhone } = getContactMeta(item);
                    const { adultCount, childrenCount, sleepingGuests, paxTotal } = getPaxSummary(item);

                    return (
                      <div key={`archive-all-${item.id}`} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70">
                        <div className="flex flex-col lg:flex-row lg:items-stretch gap-3">
                          <div className="min-w-0 lg:flex-1 space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-tight text-white inline-flex items-center gap-1 bg-slate-700">
                                <ArrowRightLeft size={10} />
                                Checked Out
                              </span>
                              <span className="text-[10px] font-black px-2 py-0.5 bg-white/80 rounded-md text-slate-600 uppercase tracking-tight">
                                {roomLabel}
                              </span>
                              <span className="text-[11px] font-black text-slate-600 uppercase inline-flex items-center gap-1">
                                {checkIn} <ArrowRightLeft size={10} /> {checkOut}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                              <span className="text-sm font-black text-slate-900">{guestName}</span>
                              {agentName ? (
                                <span className="text-[11px] text-slate-600">Agent: {agentName}</span>
                              ) : null}
                            </div>
                            <div className="text-[10px] text-slate-500 flex flex-wrap items-center gap-3">
                              <span>Guest: {guestEmail || "No email"}{guestPhone ? ` - ${guestPhone}` : ""}</span>
                              {agentEmail || agentPhone ? (
                                <span>Agent: {agentEmail || "No email"}{agentPhone ? ` - ${agentPhone}` : ""}</span>
                              ) : null}
                            </div>
                            <div className="text-[10px] text-slate-500 text-center">
                              Pax: {paxTotal} - Adults {adultCount} - Children {childrenCount} - Sleeping {sleepingGuests}
                            </div>
                            <div className="text-[10px] text-slate-500 flex items-center gap-1">
                              <Clock3 size={10} /> {item.archivedAt ? new Date(item.archivedAt).toLocaleString() : "-"}
                            </div>
                          </div>

                          <div className="flex items-center justify-between lg:flex-col lg:justify-center lg:items-center lg:w-56 gap-3 lg:border-l lg:border-white/60 lg:pl-4">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Type</span>
                              <span className={`text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${
                                inquirerType === "agent"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-emerald-100 text-emerald-700"
                              }`}>
                                {inquirerType === "agent" ? "Agent" : "Client"}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap lg:justify-end" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : null}

              {filteredCheckedOut.length > 0 ? (
                <div className="space-y-2.5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Checked Out (Bookings)</p>
                  {filteredCheckedOut.map((item) => {
                    const inquirerType = (item.inquirerType || item.bookingForm?.inquirerType || "client").toString().toLowerCase();
                    const roomLabel = item.bookingForm?.roomName || "Room";
                    const checkIn = item.startDate || item.bookingForm?.checkInDate || "-";
                    const checkOut = item.endDate || item.bookingForm?.checkOutDate || "-";
                    const guestName = item.bookingForm?.stayingGuestName || item.bookingForm?.guestName || "Guest";
                    const agentName = item.bookingForm?.agentName || "";
                    const { guestEmail, guestPhone, agentEmail, agentPhone } = getContactMeta(item);
                    const { adultCount, childrenCount, sleepingGuests, paxTotal } = getPaxSummary(item);
                    const hasUnresolvedIssue = unresolvedIssueBookingIds.has(item.id?.toString());

                    return (
                      <div key={`checkedout-${item.id}`} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70">
                        <div className="flex flex-col lg:flex-row lg:items-stretch gap-3">
                          <div className="min-w-0 lg:flex-1 space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-tight text-white inline-flex items-center gap-1 bg-slate-700">
                                <ArrowRightLeft size={10} />
                                Checked Out
                              </span>
                              <span className="text-[10px] font-black px-2 py-0.5 bg-white/80 rounded-md text-slate-600 uppercase tracking-tight">
                                {roomLabel}
                              </span>
                              <span className="text-[11px] font-black text-slate-600 uppercase inline-flex items-center gap-1">
                                {checkIn} <ArrowRightLeft size={10} /> {checkOut}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                              <span className="text-sm font-black text-slate-900">{guestName}</span>
                              {agentName ? (
                                <span className="text-[11px] text-slate-600">Agent: {agentName}</span>
                              ) : null}
                            </div>
                            <div className="text-[10px] text-slate-500 flex flex-wrap items-center gap-3">
                              <span>Guest: {guestEmail || "No email"}{guestPhone ? ` - ${guestPhone}` : ""}</span>
                              {agentEmail || agentPhone ? (
                                <span>Agent: {agentEmail || "No email"}{agentPhone ? ` - ${agentPhone}` : ""}</span>
                              ) : null}
                            </div>
                            <div className="text-[10px] text-slate-500 text-center">
                              Pax: {paxTotal} - Adults {adultCount} - Children {childrenCount} - Sleeping {sleepingGuests}
                            </div>
                            <div className="text-[10px] text-slate-500 flex items-center gap-1">
                              <Clock3 size={10} /> {item.updatedAt ? new Date(item.updatedAt).toLocaleString() : "-"}
                            </div>
                          </div>

                          <div className="flex items-center justify-between lg:flex-col lg:justify-center lg:items-center lg:w-56 gap-3 lg:border-l lg:border-white/60 lg:pl-4">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Type</span>
                              <span className={`text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${
                                inquirerType === "agent"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-emerald-100 text-emerald-700"
                              }`}>
                                {inquirerType === "agent" ? "Agent" : "Client"}
                              </span>
                            </div>
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
                              onClick={() => onReopenCancelled?.(item.id)}
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

              {filteredDeclined.length > 0 ? (
                <div className="space-y-2.5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Declined</p>
                  {filteredDeclined.map((item) => (
                    <div
                      key={`declined-all-${item.id}`}
                      className="p-4 rounded-2xl border border-rose-200 bg-rose-50/60"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-stretch gap-3">
                        <div className="min-w-0 lg:flex-1 space-y-2">
                          {(() => {
                            const { guestEmail, guestPhone, agentEmail, agentPhone } = getContactMeta(item);
                            const { adultCount, childrenCount, sleepingGuests, paxTotal } = getPaxSummary(item);
                            return (
                              <>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-tight bg-rose-600 text-white inline-flex items-center gap-1">
                              <ArrowRightLeft size={10} />
                              Declined Inquiry
                            </span>
                            <span className="text-[10px] font-black px-2 py-0.5 bg-white/80 rounded-md text-slate-600 uppercase tracking-tight">
                              {item.bookingForm?.roomName || "Room"}
                            </span>
                            <span className="text-[11px] font-black text-slate-600 uppercase inline-flex items-center gap-1">
                              {item.startDate || item.bookingForm?.checkInDate || "-"} <ArrowRightLeft size={10} /> {item.endDate || item.bookingForm?.checkOutDate || "-"}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="text-sm font-black text-slate-900">{item.bookingForm?.guestName || "Guest"}</span>
                            {item.bookingForm?.agentName ? (
                              <span className="text-[11px] text-slate-600">Agent: {item.bookingForm.agentName}</span>
                            ) : null}
                          </div>
                          <div className="text-[10px] text-slate-500 flex flex-wrap items-center gap-3">
                            <span>Guest: {guestEmail || "No email"}{guestPhone ? ` - ${guestPhone}` : ""}</span>
                            {agentEmail || agentPhone ? (
                              <span>Agent: {agentEmail || "No email"}{agentPhone ? ` - ${agentPhone}` : ""}</span>
                            ) : null}
                          </div>
                          <div className="text-[10px] text-slate-500 text-center">
                            Pax: {paxTotal} - Adults {adultCount} - Children {childrenCount} - Sleeping {sleepingGuests}
                          </div>
                          <div className="text-[10px] text-slate-500 flex items-center gap-1">
                            <Clock3 size={10} /> {item.updatedAt ? new Date(item.updatedAt).toLocaleString() : "-"}
                          </div>
                              </>
                            );
                          })()}
                        </div>

                        <div className="flex items-center justify-between lg:flex-col lg:justify-center lg:items-center lg:w-56 gap-3 lg:border-l lg:border-white/60 lg:pl-4">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Type</span>
                            <span className={`text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${
                              (item.inquirerType || item.bookingForm?.inquirerType || "client").toString().toLowerCase() === "agent"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-emerald-100 text-emerald-700"
                            }`}>
                              {(item.inquirerType || item.bookingForm?.inquirerType || "client").toString().toLowerCase() === "agent" ? "Agent" : "Client"}
                            </span>
                          </div>
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
                </div>
              ) : null}

              {filteredCancelled.length > 0 ? (
                <div className="space-y-2.5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Cancelled</p>
                  {filteredCancelled.map((item) => {
                    const inquirerType = (item.inquirerType || item.bookingForm?.inquirerType || "client").toString().toLowerCase();
                    const roomLabel = item.bookingForm?.roomName || "Room";
                    const checkIn = item.startDate || item.bookingForm?.checkInDate || "-";
                    const checkOut = item.endDate || item.bookingForm?.checkOutDate || "-";
                    const guestName = item.bookingForm?.guestName || "Guest";
                    const agentName = item.bookingForm?.agentName || "";
                    const { guestEmail, guestPhone, agentEmail, agentPhone } = getContactMeta(item);
                    const { adultCount, childrenCount, sleepingGuests, paxTotal } = getPaxSummary(item);
                    const hasUnresolvedIssue = unresolvedIssueBookingIds.has(item.id?.toString());

                    return (
                      <div key={`cancelled-all-${item.id}`} className="p-4 rounded-2xl border border-rose-200 bg-rose-50/60">
                        <div className="flex flex-col lg:flex-row lg:items-stretch gap-3">
                          <div className="min-w-0 lg:flex-1 space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-tight text-white inline-flex items-center gap-1 bg-rose-600">
                                <ArrowRightLeft size={10} />
                                Cancelled
                              </span>
                              <span className="text-[10px] font-black px-2 py-0.5 bg-white/80 rounded-md text-slate-600 uppercase tracking-tight">
                                {roomLabel}
                              </span>
                              <span className="text-[11px] font-black text-slate-600 uppercase inline-flex items-center gap-1">
                                {checkIn} <ArrowRightLeft size={10} /> {checkOut}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                              <span className="text-sm font-black text-slate-900">{guestName}</span>
                              {agentName ? (
                                <span className="text-[11px] text-slate-600">Agent: {agentName}</span>
                              ) : null}
                            </div>
                            <div className="text-[10px] text-slate-500 flex flex-wrap items-center gap-3">
                              <span>Guest: {guestEmail || "No email"}{guestPhone ? ` - ${guestPhone}` : ""}</span>
                              {agentEmail || agentPhone ? (
                                <span>Agent: {agentEmail || "No email"}{agentPhone ? ` - ${agentPhone}` : ""}</span>
                              ) : null}
                            </div>
                            <div className="text-[10px] text-slate-500 text-center">
                              Pax: {paxTotal} - Adults {adultCount} - Children {childrenCount} - Sleeping {sleepingGuests}
                            </div>
                            <div className="text-[10px] text-slate-500 flex items-center gap-1">
                              <Clock3 size={10} /> {item.updatedAt ? new Date(item.updatedAt).toLocaleString() : "-"}
                            </div>
                          </div>

                          <div className="flex items-center justify-between lg:flex-col lg:justify-center lg:items-center lg:w-56 gap-3 lg:border-l lg:border-white/60 lg:pl-4">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Type</span>
                              <span className={`text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${
                                inquirerType === "agent"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-emerald-100 text-emerald-700"
                              }`}>
                                {inquirerType === "agent" ? "Agent" : "Client"}
                              </span>
                            </div>
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
            </div>
          ) : null}

          {activeTab === "history" ? (
            <div className="space-y-4">
              {filteredCheckedOut.length > 0 ? (
                <div className="space-y-2.5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pending Checked Out (7-day window)</p>
                  {filteredCheckedOut.map((item) => {
                    const inquirerType = (item.inquirerType || item.bookingForm?.inquirerType || "client").toString().toLowerCase();
                    const roomLabel = item.bookingForm?.roomName || "Room";
                    const checkIn = item.startDate || item.bookingForm?.checkInDate || "-";
                    const checkOut = item.endDate || item.bookingForm?.checkOutDate || "-";
                    const guestName = item.bookingForm?.stayingGuestName || item.bookingForm?.guestName || "Guest";
                    const agentName = item.bookingForm?.agentName || "";
                    const { guestEmail, guestPhone, agentEmail, agentPhone } = getContactMeta(item);
                    const { adultCount, childrenCount, sleepingGuests, paxTotal } = getPaxSummary(item);
                    const hasUnresolvedIssue = unresolvedIssueBookingIds.has(item.id?.toString());

                    return (
                      <div key={`checkedout-history-${item.id}`} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70">
                        <div className="flex flex-col lg:flex-row lg:items-stretch gap-3">
                          <div className="min-w-0 lg:flex-1 space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-tight text-white inline-flex items-center gap-1 bg-slate-700">
                                <ArrowRightLeft size={10} />
                                Checked Out
                              </span>
                              <span className="text-[10px] font-black px-2 py-0.5 bg-white/80 rounded-md text-slate-600 uppercase tracking-tight">
                                {roomLabel}
                              </span>
                              <span className="text-[11px] font-black text-slate-600 uppercase inline-flex items-center gap-1">
                                {checkIn} <ArrowRightLeft size={10} /> {checkOut}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                              <span className="text-sm font-black text-slate-900">{guestName}</span>
                              {agentName ? (
                                <span className="text-[11px] text-slate-600">Agent: {agentName}</span>
                              ) : null}
                            </div>
                            <div className="text-[10px] text-slate-500 flex flex-wrap items-center gap-3">
                              <span>Guest: {guestEmail || "No email"}{guestPhone ? ` - ${guestPhone}` : ""}</span>
                              {agentEmail || agentPhone ? (
                                <span>Agent: {agentEmail || "No email"}{agentPhone ? ` - ${agentPhone}` : ""}</span>
                              ) : null}
                            </div>
                            <div className="text-[10px] text-slate-500 text-center">
                              Pax: {paxTotal} - Adults {adultCount} - Children {childrenCount} - Sleeping {sleepingGuests}
                            </div>
                            <div className="text-[10px] text-slate-500 flex items-center gap-1">
                              <Clock3 size={10} /> {item.updatedAt ? new Date(item.updatedAt).toLocaleString() : "-"}
                            </div>
                          </div>

                          <div className="flex items-center justify-between lg:flex-col lg:justify-center lg:items-center lg:w-56 gap-3 lg:border-l lg:border-white/60 lg:pl-4">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Type</span>
                              <span className={`text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${
                                inquirerType === "agent"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-emerald-100 text-emerald-700"
                              }`}>
                                {inquirerType === "agent" ? "Agent" : "Client"}
                              </span>
                            </div>
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
                <div className="space-y-2.5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Archived Checked Out</p>
                  {filteredArchived.map((item) => {
                    const inquirerType = (item.inquirerType || item.bookingForm?.inquirerType || "client").toString().toLowerCase();
                    const roomLabel = item.bookingForm?.roomName || "Room";
                    const checkIn = item.startDate || item.bookingForm?.checkInDate || "-";
                    const checkOut = item.endDate || item.bookingForm?.checkOutDate || "-";
                    const guestName = item.bookingForm?.stayingGuestName || item.bookingForm?.guestName || "Guest";
                    const agentName = item.bookingForm?.agentName || "";
                    const { guestEmail, guestPhone, agentEmail, agentPhone } = getContactMeta(item);
                    const { adultCount, childrenCount, sleepingGuests, paxTotal } = getPaxSummary(item);

                    return (
                      <div key={`archive-${item.id}`} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70">
                        <div className="flex flex-col lg:flex-row lg:items-stretch gap-3">
                          <div className="min-w-0 lg:flex-1 space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-tight text-white inline-flex items-center gap-1 bg-slate-700">
                                <ArrowRightLeft size={10} />
                                Checked Out
                              </span>
                              <span className="text-[10px] font-black px-2 py-0.5 bg-white/80 rounded-md text-slate-600 uppercase tracking-tight">
                                {roomLabel}
                              </span>
                              <span className="text-[11px] font-black text-slate-600 uppercase inline-flex items-center gap-1">
                                {checkIn} <ArrowRightLeft size={10} /> {checkOut}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                              <span className="text-sm font-black text-slate-900">{guestName}</span>
                              {agentName ? (
                                <span className="text-[11px] text-slate-600">Agent: {agentName}</span>
                              ) : null}
                            </div>
                            <div className="text-[10px] text-slate-500 flex flex-wrap items-center gap-3">
                              <span>Guest: {guestEmail || "No email"}{guestPhone ? ` - ${guestPhone}` : ""}</span>
                              {agentEmail || agentPhone ? (
                                <span>Agent: {agentEmail || "No email"}{agentPhone ? ` - ${agentPhone}` : ""}</span>
                              ) : null}
                            </div>
                            <div className="text-[10px] text-slate-500 text-center">
                              Pax: {paxTotal} - Adults {adultCount} - Children {childrenCount} - Sleeping {sleepingGuests}
                            </div>
                            <div className="text-[10px] text-slate-500 flex items-center gap-1">
                              <Clock3 size={10} /> {item.archivedAt ? new Date(item.archivedAt).toLocaleString() : "-"}
                            </div>
                          </div>

                          <div className="flex items-center justify-between lg:flex-col lg:justify-center lg:items-center lg:w-56 gap-3 lg:border-l lg:border-white/60 lg:pl-4">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Type</span>
                              <span className={`text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${
                                inquirerType === "agent"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-emerald-100 text-emerald-700"
                              }`}>
                                {inquirerType === "agent" ? "Agent" : "Client"}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap lg:justify-end" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>
          ) : null}

          {activeTab === "declined" && filteredDeclined.map((item) => (
            <div
              key={`declined-${item.id}`}
              className="p-4 rounded-2xl border border-rose-200 bg-rose-50/60"
            >
              <div className="flex flex-col lg:flex-row lg:items-stretch gap-3">
                <div className="min-w-0 lg:flex-1 space-y-2">
                  {(() => {
                    const { guestEmail, guestPhone, agentEmail, agentPhone } = getContactMeta(item);
                    const { adultCount, childrenCount, sleepingGuests, paxTotal } = getPaxSummary(item);
                    return (
                      <>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-tight bg-rose-600 text-white inline-flex items-center gap-1">
                      <ArrowRightLeft size={10} />
                      Declined Inquiry
                    </span>
                    <span className="text-[10px] font-black px-2 py-0.5 bg-white/80 rounded-md text-slate-600 uppercase tracking-tight">
                      {item.bookingForm?.roomName || "Room"}
                    </span>
                    <span className="text-[11px] font-black text-slate-600 uppercase inline-flex items-center gap-1">
                      {item.startDate || item.bookingForm?.checkInDate || "-"} <ArrowRightLeft size={10} /> {item.endDate || item.bookingForm?.checkOutDate || "-"}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-sm font-black text-slate-900">{item.bookingForm?.guestName || "Guest"}</span>
                    {item.bookingForm?.agentName ? (
                      <span className="text-[11px] text-slate-600">Agent: {item.bookingForm.agentName}</span>
                    ) : null}
                  </div>
                  <div className="text-[10px] text-slate-500 flex flex-wrap items-center gap-3">
                    <span>Guest: {guestEmail || "No email"}{guestPhone ? ` - ${guestPhone}` : ""}</span>
                    {agentEmail || agentPhone ? (
                      <span>Agent: {agentEmail || "No email"}{agentPhone ? ` - ${agentPhone}` : ""}</span>
                    ) : null}
                  </div>
                  <div className="text-[10px] text-slate-500 text-center">
                    Pax: {paxTotal} - Adults {adultCount} - Children {childrenCount} - Sleeping {sleepingGuests}
                  </div>
                  <div className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Clock3 size={10} /> {item.updatedAt ? new Date(item.updatedAt).toLocaleString() : "-"}
                  </div>
                      </>
                    );
                  })()}
                </div>

                <div className="flex items-center justify-between lg:flex-col lg:justify-center lg:items-center lg:w-56 gap-3 lg:border-l lg:border-white/60 lg:pl-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Type</span>
                    <span className={`text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${
                      (item.inquirerType || item.bookingForm?.inquirerType || "client").toString().toLowerCase() === "agent"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}>
                      {(item.inquirerType || item.bookingForm?.inquirerType || "client").toString().toLowerCase() === "agent" ? "Agent" : "Client"}
                    </span>
                  </div>
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
          {activeTab === "cancelled" && filteredCancelled.map((item) => {
            const inquirerType = (item.inquirerType || item.bookingForm?.inquirerType || "client").toString().toLowerCase();
            const roomLabel = item.bookingForm?.roomName || "Room";
            const checkIn = item.startDate || item.bookingForm?.checkInDate || "-";
            const checkOut = item.endDate || item.bookingForm?.checkOutDate || "-";
            const guestName = item.bookingForm?.guestName || "Guest";
            const agentName = item.bookingForm?.agentName || "";
            const { guestEmail, guestPhone, agentEmail, agentPhone } = getContactMeta(item);
            const { adultCount, childrenCount, sleepingGuests, paxTotal } = getPaxSummary(item);
            const hasUnresolvedIssue = unresolvedIssueBookingIds.has(item.id?.toString());

            return (
              <div key={`cancelled-${item.id}`} className="p-4 rounded-2xl border border-rose-200 bg-rose-50/60">
                <div className="flex flex-col lg:flex-row lg:items-stretch gap-3">
                  <div className="min-w-0 lg:flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-tight text-white inline-flex items-center gap-1 bg-rose-600">
                        <ArrowRightLeft size={10} />
                        Cancelled
                      </span>
                      <span className="text-[10px] font-black px-2 py-0.5 bg-white/80 rounded-md text-slate-600 uppercase tracking-tight">
                        {roomLabel}
                      </span>
                      <span className="text-[11px] font-black text-slate-600 uppercase inline-flex items-center gap-1">
                        {checkIn} <ArrowRightLeft size={10} /> {checkOut}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-sm font-black text-slate-900">{guestName}</span>
                      {agentName ? (
                        <span className="text-[11px] text-slate-600">Agent: {agentName}</span>
                      ) : null}
                    </div>
                    <div className="text-[10px] text-slate-500 flex flex-wrap items-center gap-3">
                      <span>Guest: {guestEmail || "No email"}{guestPhone ? ` - ${guestPhone}` : ""}</span>
                      {agentEmail || agentPhone ? (
                        <span>Agent: {agentEmail || "No email"}{agentPhone ? ` - ${agentPhone}` : ""}</span>
                      ) : null}
                    </div>
                    <div className="text-[10px] text-slate-500 text-center">
                      Pax: {paxTotal} - Adults {adultCount} - Children {childrenCount} - Sleeping {sleepingGuests}
                    </div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Clock3 size={10} /> {item.updatedAt ? new Date(item.updatedAt).toLocaleString() : "-"}
                    </div>
                  </div>

                  <div className="flex items-center justify-between lg:flex-col lg:justify-center lg:items-center lg:w-56 gap-3 lg:border-l lg:border-white/60 lg:pl-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Type</span>
                      <span className={`text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${
                        inquirerType === "agent"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}>
                        {inquirerType === "agent" ? "Agent" : "Client"}
                      </span>
                    </div>
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
                      onClick={() => onReopenCancelled?.(item.id)}
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
          {false && (
            <div
              key="audit-disabled"
              className="p-3 rounded-xl border border-indigo-100 bg-indigo-50/40"
            >
              <div className="text-xs text-slate-400">Status audit hidden.</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
