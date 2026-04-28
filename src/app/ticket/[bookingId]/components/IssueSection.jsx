"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const IssueSection = React.memo(function IssueSection({
  issueSubject,
  setIssueSubject,
  issueMessage,
  setIssueMessage,
  onSendIssue,
  isSendingIssue,
}) {
  return (
    <Card className="p-8 bg-white border-rose-100 shadow-[0_20px_50px_rgba(0,0,0,0.04)] rounded-[2.5rem] space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
          <AlertTriangle size={18} />
        </div>
        <div>
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em]">Issue Message</h3>
          <p className="text-xs text-slate-400 font-semibold">Send a concern directly to the resort team.</p>
        </div>
      </div>
      <div className="space-y-3">
        <input
          className="w-full rounded-2xl border border-rose-100 bg-rose-50/40 px-4 py-3 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-rose-100"
          placeholder="Subject of concern"
          value={issueSubject}
          onChange={(e) => setIssueSubject(e.target.value)}
        />
        <textarea
          className="w-full min-h-28 rounded-2xl border border-rose-100 bg-rose-50/40 px-4 py-3 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-rose-100"
          placeholder="Describe the issue or request assistance..."
          value={issueMessage}
          onChange={(e) => setIssueMessage(e.target.value)}
        />
        <div className="flex items-center justify-between gap-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-rose-500">Issue messages are monitored by the resort.</p>
          <Button
            className="rounded-full px-8 h-11 bg-rose-600 font-bold uppercase text-[10px] tracking-widest hover:bg-rose-700 transition-all"
            onClick={onSendIssue}
            disabled={isSendingIssue}
          >
            {isSendingIssue ? "Sending..." : "Send Issue"}
          </Button>
        </div>
      </div>
    </Card>
  );
});

export { IssueSection };
