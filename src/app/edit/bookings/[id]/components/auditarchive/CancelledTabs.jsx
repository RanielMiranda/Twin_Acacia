"use client";

import React from "react";
import { ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import BookingStatusCard from "../BookingStatusCard";
import { getContactMeta, getPaxSummary, getDateTimeParts, formatDateMeta, formatTime12h } from "./utils";

export default function CancelledTabs({
  filteredCancelled,
  showHeading = false,
  onOpenBooking,
  onReopenCancelled,
  onResolveCancelled,
  unresolvedIssueBookingIds = new Set(),
}) {
  if (!filteredCancelled.length) return null;
  return (
    <div className="space-y-2">
      {showHeading ? (
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Cancelled</p>
      ) : null}
      {filteredCancelled.map((item) => {
        const inquirerType = (item.inquirerType || item.bookingForm?.inquirerType || "client").toString().toLowerCase();
        const roomLabel = item.bookingForm?.roomName || "Room";
        const clientName = item.bookingForm?.guestName || "Guest";
        const agentName = item.bookingForm?.agentName || "";
        const displayName = inquirerType === "agent" ? (agentName || "Agent") : clientName;
        const { contactEmail, contactPhone, clientEmail, clientPhone } = getContactMeta(item);
        const { checkInDate, checkOutDate, checkInTime, checkOutTime } = getDateTimeParts(item);
        const { adultCount, childrenCount, sleepingGuests, paxTotal } = getPaxSummary(item);
        const checkInMeta = formatDateMeta(checkInDate);
        const checkOutMeta = formatDateMeta(checkOutDate);
        const checkInLabel = formatTime12h(checkInTime);
        const checkOutLabel = formatTime12h(checkOutTime);
        const hasUnresolvedIssue = unresolvedIssueBookingIds.has(item.id?.toString());

        const issueBadge = hasUnresolvedIssue ? (
          <span className="text-[10px] font-black bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">
            Issue
          </span>
        ) : null;

        const actionSlot = (
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
                onClick={() => onReopenCancelled?.(item.id)}
              >
                Reopen
              </Button>
              <Button
                variant="outline"
                className={`h-8 px-3 text-xs font-bold border-rose-200 text-rose-700 hover:bg-rose-50 ${
                  hasUnresolvedIssue ? "opacity-60 cursor-not-allowed" : ""
                }`}
                onClick={() => onResolveCancelled?.(item.id)}
                disabled={hasUnresolvedIssue}
              >
                Resolve
              </Button>
            </div>
          </>
        );

        return (
          <BookingStatusCard
            key={`cancelled-${item.id}`}
            statusLabel="Cancelled"
            statusIcon={ArrowRightLeft}
            statusBadgeClassName="bg-rose-600 text-white"
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
            showClientContact={false}
            paxTotal={paxTotal}
            adultCount={adultCount}
            childrenCount={childrenCount}
            sleepingGuests={sleepingGuests}
            checkInDateLabel={checkInMeta.dateLabel}
            checkOutDateLabel={checkOutMeta.dateLabel}
            checkInTimeLabel={checkInLabel}
            checkOutTimeLabel={checkOutLabel}
            containerClassName="border-rose-200 bg-rose-50/60"
            actionSlot={actionSlot}
          />
        );
      })}
    </div>
  );
}
