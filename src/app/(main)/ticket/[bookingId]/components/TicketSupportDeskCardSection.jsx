"use client";

import React from "react";
import { MessageSquare, Phone, Mail, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { buildSupportConversationItems, getSupportConversationLabel, isResolvedConversationItem } from "@/lib/supportConversation";

export function TicketSupportDeskCardSection({
  resort,
  loadingMessages,
  messages,
  issues = [],
  onRefreshMessages,
  isConcernOnlyMode,
  chatMessage,
  setChatMessage,
  onSendMessage,
  issueSubject,
  setIssueSubject,
  issueMessage,
  setIssueMessage,
  onSendIssue,
}) {
  const conversationItems = buildSupportConversationItems({
    messages,
    issues,
    newestFirst: true,
    issueFallbackSubject: "Issue Report",
  });

  return (
    <Card className="p-8 border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.04)] rounded-[2.5rem] space-y-6">
      <div className="flex justify-between items-start">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
          <MessageSquare size={18} className="text-[var(--theme-primary-600)]" /> Support Desk
        </h3>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={onRefreshMessages}
            className="p-2 bg-slate-50 rounded-full flex items-center justify-center gap-2 text-slate-400 hover:text-[var(--theme-primary-600)] transition-colors"
            aria-label="Refresh support messages"
          >
            <RefreshCw size={16} className={loadingMessages ? "animate-spin" : ""} />
            <p className = "text-xs">Refresh</p>
          </button>
          <a
            href={`tel:${resort?.contactPhone}`}
            className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-[var(--theme-primary-600)] transition-colors"
          >
            <Phone size={16} />
          </a>
          <a
            href={`mailto:${resort?.contactEmail}`}
            className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-[var(--theme-primary-600)] transition-colors"
          >
            <Mail size={16} />
          </a>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 max-h-56 overflow-auto space-y-2">
          {loadingMessages ? (
            <p className="text-xs text-slate-400">Loading conversation...</p>
          ) : conversationItems.length === 0 ? (
            <p className="text-xs text-slate-400">No messages yet.</p>
          ) : (
            conversationItems.map((msg) => (
              <div
                key={msg.id}
                className={`p-2.5 rounded-xl text-xs ${
                  msg.senderRole === "client"
                    ? msg.kind === "issue"
                      ? isResolvedConversationItem(msg)
                        ? "bg-emerald-50 text-emerald-700 ml-8 border border-emerald-200"
                        : "bg-amber-50 text-amber-700 ml-8 border border-amber-200"
                      : "bg-[var(--theme-primary-50)] text-[var(--theme-primary-700)] ml-8"
                    : "bg-white text-slate-700 mr-8 border border-slate-100"
                }`}
              >
                <p className="font-black uppercase tracking-wider text-[9px] mb-1">{getSupportConversationLabel(msg)}</p>
                <p>{msg.body}</p>
              </div>
            ))
          )}
        </div>

        {!isConcernOnlyMode ? (
          <div className="flex gap-2">
            <input
              className="flex-1 rounded-2xl border-slate-100 bg-slate-50 px-4 py-3 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[var(--theme-primary-100)]"
              placeholder="Send a message to owner"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
            />
            <Button className="rounded-2xl h-12 bg-[var(--theme-primary-600)] hover:bg-[var(--theme-primary-700)] text-white" onClick={onSendMessage}>
              Send
            </Button>
          </div>
        ) : (
          <div className="space-y-3 border-t border-slate-100 pt-4">
            <p className="text-xs font-black uppercase tracking-widest text-rose-600">Issue Report</p>
            <input
              className="w-full rounded-2xl border-slate-100 bg-slate-50 px-4 py-3 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[var(--theme-primary-100)]"
              placeholder="Subject of concern"
              value={issueSubject}
              onChange={(e) => setIssueSubject(e.target.value)}
            />
            <textarea
              className="w-full min-h-28 rounded-2xl border-slate-100 bg-slate-50 px-4 py-3 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[var(--theme-primary-100)]"
              placeholder="Please describe your concern or issues with your stay..."
              value={issueMessage}
              onChange={(e) => setIssueMessage(e.target.value)}
            />
            <Button
              className="rounded-full px-8 h-11 bg-slate-900 font-bold uppercase text-[10px] tracking-widest hover:bg-black transition-all"
              onClick={onSendIssue}
            >
              Send Issue Report
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
