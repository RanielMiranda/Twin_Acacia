"use client";

import React from "react";
import { Download, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";

const TicketHeaderSection = React.memo(function TicketHeaderSection({ bookingId, canAccessEntryPass, onDownloadTicket, viewerRole }) {
  const portalLabel = viewerRole === "agent" ? "Agent Portal" : "Client Portal";
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 no-print">
      <div>
        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-100">
            <Ticket size={24} />
          </div>
          {portalLabel}
        </h1>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">
          Reference: <span className="text-blue-600 font-black">{bookingId}</span>
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          disabled={!canAccessEntryPass}
          variant="outline"
          className="rounded-full px-6 flex items-center justify-center border-slate-200 font-bold text-xs uppercase tracking-wider h-12 bg-white shadow-sm"
          onClick={onDownloadTicket}
        >
          <Download size={16} className="mr-2" /> Download Ticket
        </Button>
      </div>
    </div>
  );
});

export { TicketHeaderSection };
