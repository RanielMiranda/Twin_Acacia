"use client";

import React from "react";
import { Download, Ticket, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

const HeaderSection = React.memo(function HeaderSection({
  bookingId,
  referenceNumber,
  resortName,
  canAccessEntryPass,
  onDownloadTicket,
  onOpenForm,
  viewerRole
}) {
  const ticketLabel = viewerRole === "agent" ? "Agent Ticket" : "Client Ticket";
  const headerTitle = resortName ? `${ticketLabel} | ${resortName}` : ticketLabel;

  const scrollTo = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      {/* Header row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 no-print">
        <div>
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-100">
              <Ticket size={24} />
            </div>
            {headerTitle}
          </h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">
            Reference: <span className="text-blue-600 font-black">{referenceNumber || bookingId}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={onOpenForm}
            className="rounded-full px-6 flex items-center justify-center border-slate-200 font-bold text-xs uppercase tracking-wider h-12 bg-white shadow-sm"
          >
            <FileText size={16} className="mr-2" /> View Form
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

      {/* Sub-navigation integrated into header */}
      <nav className="mt-4 -mx-2 border-y border-slate-200/70 bg-white/50 rounded-xl">
        <div className="flex max-w-5xl gap-3 overflow-x-auto px-3 py-2.5 text-sm font-medium text-slate-600">
          {[
            { id: "stay", label: "Stay Details" },
            { id: "contact", label: "Contact" },
            ...(viewerRole !== "agent" ? [{ id: "extraservices", label: "Extra Services" }] : []),
            { id: "payment", label: "Payment" },
            { id: "issue", label: "Issue" },
          ].map((link) => (
            <button
              key={link.id}
              onClick={() => scrollTo(link.id)}
              className="whitespace-nowrap rounded-full border border-transparent px-3 py-1.5 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-950 transition-all"
            >
              {link.label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
});

export { HeaderSection };
