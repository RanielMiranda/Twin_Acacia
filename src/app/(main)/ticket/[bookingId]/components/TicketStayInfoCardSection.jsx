"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { TicketRow } from "./TicketRow";

const TicketStayInfoCardSection = React.memo(function TicketStayInfoCardSection({
  id = "ticket-stay-card",
  form,
  booking,
  resort,
  approvedByName,
  assignedRoomNames,
  viewerRole,
}) {
  const displayGuestName = form?.stayingGuestName || form?.guestName || "â€”";
  const inquirerType = (form?.inquirerType || "client").toString().toLowerCase();
  const agentName = form?.agentName || "â€”";
  const contactEmail = form?.email || form?.stayingGuestEmail || "â€”";
  const contactPhone = form?.phoneNumber || form?.stayingGuestPhone || "â€”";
  return (
    <Card
      id={id}
      className="p-8 md:p-10 border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.04)] rounded-[2.5rem] relative overflow-hidden"
    >
      <h2 className="text-sm font-black text-blue-600 uppercase tracking-[0.2em] mb-6 border-b border-slate-50 pb-4">
        Stay Information
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <TicketRow label="Guest Name" value={displayGuestName} />
        <TicketRow label="Status" value={booking?.status || "Inquiry"} isStatus />
        {inquirerType === "agent" ? (
          <TicketRow label="Agent Name" value={agentName} />
        ) : (
          <>
            <TicketRow label="Contact Email" value={contactEmail} />
            <TicketRow label="Contact Phone" value={contactPhone} />
          </>
        )}
        <TicketRow label="Approved By" value={approvedByName} />        
        <TicketRow label="Pax" value={form?.guestCount ?? 0} />
        <TicketRow label="Adults" value={form?.adultCount ?? 0} />
        <TicketRow label="Children" value={form?.childrenCount ?? 0} />
        <TicketRow label="Sleeping" value={form?.sleepingGuests ?? 0} />
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
      </div>
    </Card>
  );
});

export { TicketStayInfoCardSection };
