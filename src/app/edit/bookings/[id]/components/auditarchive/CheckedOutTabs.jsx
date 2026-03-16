"use client";

import React from "react";
import { ArrowRightLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import BookingStatusCard from "../BookingStatusCard";
import {
  getContactMeta,
  getPaxSummary,
  getDateTimeParts,
  formatDateMeta,
  formatTime12h,
} from "./utils";

export default function CheckedOutTabs({
  mode,
  filteredArchived,
  filteredCheckedOut,
  onOpenBooking,
  onReopenCheckedOut,
  onResolveCheckedOut,
  onDeleteArchived,
  unresolvedIssueBookingIds = new Set(),
}) {
  const pendingLabel =
    mode === "history"
      ? "Pending Checked Out (7-day window)"
      : "Checked Out (Bookings)";

  const renderCard = (item, isArchived = false) => {
    const inquirerType = (
      item.inquirerType ||
      item.bookingForm?.inquirerType ||
      "client"
    )
      .toString()
      .toLowerCase();

    const roomLabel = item.bookingForm?.roomName || "Room";
    const clientName =
      item.bookingForm?.stayingGuestName ||
      item.bookingForm?.guestName ||
      "Guest";
    const agentName = item.bookingForm?.agentName || "";
    const displayName = inquirerType === "agent" ? (agentName || "Agent") : clientName;

    const { contactEmail, contactPhone, clientEmail, clientPhone } =
      getContactMeta(item);

    const { adultCount, childrenCount, sleepingGuests, paxTotal } =
      getPaxSummary(item);

    const { checkInDate, checkOutDate, checkInTime, checkOutTime } =
      getDateTimeParts(item);

    const checkInMeta = formatDateMeta(checkInDate);
    const checkOutMeta = formatDateMeta(checkOutDate);
    const checkInLabel = formatTime12h(checkInTime);
    const checkOutLabel = formatTime12h(checkOutTime);

    const hasUnresolvedIssue = unresolvedIssueBookingIds.has(
      item.id?.toString()
    );

    const issueBadge = hasUnresolvedIssue ? (
      <span className="text-[10px] font-black bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">
        Issue
      </span>
    ) : null;

    const actionSlot = !isArchived ? (
      <>
        {hasUnresolvedIssue ? (
          <div className="text-[10px] font-black uppercase tracking-widest text-rose-600">
            Unresolved issue
          </div>
        ) : null}
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
      </>
    ) : (
      <div className="flex items-center gap-2 flex-wrap justify-end w-full">
        <Button
          variant="outline"
          className="h-8 px-3 text-xs font-bold border-rose-200 text-rose-700 hover:bg-rose-50"
          onClick={() => onDeleteArchived?.(item.id)}
        >
          <Trash2 size={12} className="mr-1" />
          Remove
        </Button>
      </div>
    );

    return (
      <BookingStatusCard
        key={item.id}
        statusLabel="Checked Out"
        statusIcon={ArrowRightLeft}
        statusBadgeClassName="bg-slate-700 text-white"
        roomLabel={roomLabel}
        badges={issueBadge ? [issueBadge] : []}
        inquirerType={inquirerType}
        guestName={displayName}
        clientName={clientName}
        agentName={agentName}
        contactEmail={contactEmail}
        contactPhone={contactPhone}
        clientEmail={clientEmail}
        clientPhone={clientPhone}
        showClientContact={isArchived}
        paxTotal={paxTotal}
        adultCount={adultCount}
        childrenCount={childrenCount}
        sleepingGuests={sleepingGuests}
        checkInDateLabel={checkInMeta.dateLabel}
        checkOutDateLabel={checkOutMeta.dateLabel}
        checkInTimeLabel={checkInLabel}
        checkOutTimeLabel={checkOutLabel}
        containerClassName="border-slate-200 bg-slate-50/70"
        actionSlot={actionSlot}
      />
    );
  };

  return (
    <div className="space-y-3">
      {filteredCheckedOut.length > 0 ? (
        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            {pendingLabel}
          </p>
          {filteredCheckedOut.map((item) => renderCard(item))}
        </div>
      ) : null}

      {filteredArchived.length > 0 ? (
        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Archived Checked Out
          </p>
          {filteredArchived.map((item) => renderCard(item, true))}
        </div>
      ) : null}
    </div>
  );
}
