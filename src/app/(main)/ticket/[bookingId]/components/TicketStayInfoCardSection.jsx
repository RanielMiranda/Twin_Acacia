"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { TicketRow } from "./TicketRow";

/**
 * Stay information card. Also used as the only content for Print Entry Pass and Download Ticket.
 * Pass stayRows (from buildStayInfoRows) for consistency with print/download.
 */
export function TicketStayInfoCardSection({
  id = "ticket-stay-card",
  form,
  booking,
  resort,
  approvedByName,
  assignedRoomNames,
  entryCode,
}) {
  return (
    <Card
      id={id}
      className="p-8 md:p-10 border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.04)] rounded-[2.5rem] relative overflow-hidden"
    >
      <h2 className="text-sm font-black text-[var(--theme-primary-600)] uppercase tracking-[0.2em] mb-6 border-b border-slate-50 pb-4">
        Stay Information
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <TicketRow label="Guest Name" value={form?.guestName} />
        <TicketRow label="Status" value={booking?.status || "Inquiry"} isStatus />
        <TicketRow label="Pax" value={form?.guestCount ?? 0} />
        <TicketRow label="Adults" value={form?.adultCount ?? 0} />
        <TicketRow label="Children" value={form?.childrenCount ?? 0} />
        <TicketRow label="Sleeping" value={form?.sleepingGuests ?? 0} />
        <TicketRow label="Approved By" value={approvedByName} />
        <TicketRow
          label="Assigned Rooms"
          value={assignedRoomNames?.length > 0 ? assignedRoomNames.join(", ") : "Pending assignment"}
        />
        <TicketRow
          label="Check-In"
          value={booking?.start_date || form?.checkInDate}
          subValue={booking?.check_in_time || form?.checkInTime}
        />
        <TicketRow
          label="Check-Out"
          value={booking?.end_date || form?.checkOutDate}
          subValue={booking?.check_out_time || form?.checkOutTime}
        />
        <TicketRow label="Location" value={resort?.location} />
        <TicketRow label="Entry Code" value={entryCode} />
      </div>
    </Card>
  );
}

/**
 * Builds the same rows shown in the stay card, for use in print/download HTML (stay info only).
 */
export function buildStayInfoRows({ form, booking, resort, approvedByName, assignedRoomNames, entryCode }) {
  return [
    ["Resort", resort?.name || "—"],
    ["Guest Name", form?.guestName || "—"],
    ["Status", booking?.status || "Inquiry"],
    ["Approved By", approvedByName || "—"],
    ["Pax", String(form?.guestCount ?? 0)],
    ["Adults", String(form?.adultCount ?? 0)],
    ["Children", String(form?.childrenCount ?? 0)],
    ["Sleeping", String(form?.sleepingGuests ?? 0)],
    ["Assigned Rooms", assignedRoomNames?.length > 0 ? assignedRoomNames.join(", ") : "Pending assignment"],
    [
      "Check-In",
      `${booking?.start_date || form?.checkInDate || "—"} ${booking?.check_in_time || form?.checkInTime || ""}`.trim(),
    ],
    [
      "Check-Out",
      `${booking?.end_date || form?.checkOutDate || "—"} ${booking?.check_out_time || form?.checkOutTime || ""}`.trim(),
    ],
    ["Location", resort?.location || "—"],
    ["Entry Code", entryCode || "—"],
  ];
}
