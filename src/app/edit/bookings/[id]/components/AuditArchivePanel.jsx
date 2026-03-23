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
  searchValue = "",
  onSearchChange,
  onSearchSubmit,
  onJumpMonth,
  onClearMonth,
  monthFilter = "",
  hasMoreArchived = false,
  onLoadMoreArchived,
}) {
  const [activeTab, setActiveTab] = useState("declined");
  const [monthInput, setMonthInput] = useState("");
  const matchesMonthFilter = React.useCallback(
    (dateValue) => {
      if (!monthFilter) return true;
      if (!dateValue) return false;
      const normalized = String(dateValue).slice(0, 7);
      return normalized === monthFilter;
    },
    [monthFilter]
  );

  const normalizedSearch = useMemo(() => searchValue.trim().toLowerCase(), [searchValue]);
  const matchesSearch = React.useCallback(
    (fields) => {
      if (!normalizedSearch) return true;
      return fields.some((value) =>
        String(value || "").toLowerCase().includes(normalizedSearch)
      );
    },
    [normalizedSearch]
  );

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
        matchesMonthFilter(item.startDate || item.bookingForm?.checkInDate || item.bookingForm?.checkOutDate)
      ),
    [archivedBookings, matchesMonthFilter]
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
      ).filter((item) =>
        matchesMonthFilter(item.startDate || item.endDate || item.bookingForm?.checkInDate || item.bookingForm?.checkOutDate)
      ),
    [declinedBookings, matchesSearch, matchesMonthFilter]
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
      ).filter((item) =>
        matchesMonthFilter(item.startDate || item.endDate || item.bookingForm?.checkInDate || item.bookingForm?.checkOutDate)
      ),
    [cancelledBookings, matchesSearch, matchesMonthFilter]
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
      ).filter((item) =>
        matchesMonthFilter(item.startDate || item.endDate || item.bookingForm?.checkInDate || item.bookingForm?.checkOutDate)
      ),
    [checkedOutOnlyBookings, matchesSearch, matchesMonthFilter]
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
            { id: "declined", label: "Declined" },
            { id: "cancelled", label: "Cancelled" },
            { id: "history", label: "Checked Out" },
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
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="Search guest or agent"
              className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs font-semibold text-slate-600"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            className="h-9 px-3 text-xs font-bold"
            onClick={() => onSearchSubmit?.()}
          >
            Search
          </Button>
          <div className="flex items-center gap-2">
            <input
              type="month"
              value={monthInput}
              onChange={(e) => setMonthInput(e.target.value)}
              className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600"
            />
            <Button
              type="button"
              variant="outline"
              className="h-9 px-3 text-xs font-bold"
              onClick={() => {
                if (monthInput) onJumpMonth?.(monthInput);
              }}
            >
              Go
            </Button>
            {monthFilter ? (
              <Button
                type="button"
                variant="ghost"
                className="h-9 px-3 text-xs font-bold"
                onClick={() => {
                  setMonthInput("");
                  onClearMonth?.();
                }}
              >
                All Months
              </Button>
            ) : null}
          </div>
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
              showHeading
              onOpenBooking={onOpenBooking}
              onReopenDeclined={onReopenDeclined}
              onResolveDeclined={onResolveDeclined}
            />
          ) : null}

          {activeTab === "cancelled" ? (
            <CancelledTabs
              filteredCancelled={filteredCancelled}
              showHeading
              onOpenBooking={onOpenBooking}
              onReopenCancelled={onReopenCancelled}
              onResolveCancelled={onResolveCancelled}
              unresolvedIssueBookingIds={unresolvedIssueBookingIds}
            />
          ) : null}
        </div>
      )}
      {activeTab === "history" && hasMoreArchived ? (
        <div className="mt-4">
          <Button
            type="button"
            variant="outline"
            className="w-full rounded-xl h-10 text-xs font-bold"
            onClick={onLoadMoreArchived}
            disabled={loading}
          >
            {loading ? "Loading..." : "Load more"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
