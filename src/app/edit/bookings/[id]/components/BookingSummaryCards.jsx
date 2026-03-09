"use client";

import React from "react";
import { AlertTriangle, Archive, Clock4, MessageCircleWarning } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BookingSummaryCards({
  workflowCounts,
  openConcernCount = 0,
  auditArchiveCount = 0,
  onOpenConcerns,
  onOpenAudits,
}) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
      <div className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
        <p className="text-[10px] uppercase tracking-widest font-black text-slate-400 mb-1">Priority Workflow</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock4 size={16} className="text-blue-600" />
              Pending Inquiries
            </p>
            <p className="text-2xl font-black text-blue-600">{workflowCounts.inquiry}</p>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle size={16} className="text-rose-600" />
              Pending Checkout
            </p>
            <p className="text-2xl font-black text-rose-600">{workflowCounts.checkout}</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-rose-100 bg-white p-4 shadow-sm">
        <p className="text-[10px] uppercase tracking-widest font-black text-slate-400 mb-1">Live Concerns</p>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <MessageCircleWarning size={16} className="text-rose-600" />
              Open Tickets
            </p>
            <p className="text-2xl font-black text-rose-600">{openConcernCount}</p>
          </div>
          <Button
            variant="outline"
            className="rounded-xl text-xs font-bold"
            onClick={onOpenConcerns}
          >
            View Concerns
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-indigo-100 bg-white p-4 shadow-sm">
        <p className="text-[10px] uppercase tracking-widest font-black text-slate-400 mb-1">Audit Archive</p>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Archive size={16} className="text-indigo-600" />
              Archived Activity
            </p>
            <p className="text-2xl font-black text-indigo-600">{auditArchiveCount}</p>
          </div>
          <Button
            variant="outline"
            className="rounded-xl text-xs font-bold"
            onClick={onOpenAudits}
          >
            View Archive
          </Button>
        </div>
      </div>
    </div>
  );
}
