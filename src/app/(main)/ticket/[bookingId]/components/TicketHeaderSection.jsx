"use client";

import React from "react";
import { Printer, Download, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TicketHeaderSection({ bookingId, canAccessEntryPass, onPrintEntryPass, onDownloadTicket }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 no-print">
      <div>
        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
          <div className="p-2 bg-[var(--theme-primary-600)] rounded-2xl text-white shadow-lg shadow-[rgb(var(--theme-primary-100-rgb)/0.9)]">
            <Ticket size={24} />
          </div>
          Guest Portal
        </h1>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">
          Reference: <span className="text-[var(--theme-primary-600)] font-black">{bookingId}</span>
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          disabled={!canAccessEntryPass}
          variant="outline"
          className="rounded-full px-6 flex items-center justify-center border-slate-200 font-bold text-xs uppercase tracking-wider h-12 bg-white shadow-sm"
          onClick={onPrintEntryPass}
        >
          <Printer size={16} className="mr-2" /> Print Entry Pass
        </Button>
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
}
