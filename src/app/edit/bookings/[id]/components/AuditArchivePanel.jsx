"use client";
"use client";

import React, { useMemo, useState } from "react";
import { Archive, RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import CheckedOutTabs from "./auditarchive/CheckedOutTabs.jsx";
import DeclinedTabs from "./auditarchive/DeclinedTabs.jsx";
import CancelledTabs from "./auditarchive/CancelledTabs.jsx";

export default function AuditArchivePanel({
  declinedBookings = [],
  checkedOutBookings = [],
  archivedBookings = [],
  loading = false,
  onRefresh,
  onOpenBooking,
  onReopenDeclined,
  onReopenCancelled,
  onResolveDeclined,
  onResolveCancelled,
  onReopenCheckedOut,
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
          Bookings in this list stay here for up to 7 days before auto-archiving. Use Resolve to archive now and strip extra data.
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
              <CheckedOutTabs
                mode="all"
                filteredArchived={filteredArchived}
                filteredCheckedOut={filteredCheckedOut}
                onOpenBooking={onOpenBooking}
                onReopenCheckedOut={onReopenCheckedOut}
                onResolveCheckedOut={onResolveCheckedOut}
                onDeleteArchived={onDeleteArchived}
                unresolvedIssueBookingIds={unresolvedIssueBookingIds}
              />
              <DeclinedTabs
                filteredDeclined={filteredDeclined}
                showHeading
                onOpenBooking={onOpenBooking}
                onReopenDeclined={onReopenDeclined}
                onResolveDeclined={onResolveDeclined}
              />
              <CancelledTabs
                filteredCancelled={filteredCancelled}
                showHeading
                onOpenBooking={onOpenBooking}
                onReopenCancelled={onReopenCancelled}
                onResolveCancelled={onResolveCancelled}
                unresolvedIssueBookingIds={unresolvedIssueBookingIds}
              />
            </div>
          ) : null}

          {activeTab === "history" ? (
            <CheckedOutTabs
              mode="history"
              filteredArchived={filteredArchived}
              filteredCheckedOut={filteredCheckedOut}
              onOpenBooking={onOpenBooking}
              onReopenCheckedOut={onReopenCheckedOut}
              onResolveCheckedOut={onResolveCheckedOut}
              onDeleteArchived={onDeleteArchived}
              unresolvedIssueBookingIds={unresolvedIssueBookingIds}
            />
          ) : null}

          {activeTab === "declined" ? (
            <DeclinedTabs
              filteredDeclined={filteredDeclined}
              onOpenBooking={onOpenBooking}
              onReopenDeclined={onReopenDeclined}
              onResolveDeclined={onResolveDeclined}
            />
          ) : null}

          {activeTab === "cancelled" ? (
            <CancelledTabs
              filteredCancelled={filteredCancelled}
              onOpenBooking={onOpenBooking}
              onReopenCancelled={onReopenCancelled}
              onResolveCancelled={onResolveCancelled}
              unresolvedIssueBookingIds={unresolvedIssueBookingIds}
            />
          ) : null}
        </div>
      )}
    </div>
  );
}
