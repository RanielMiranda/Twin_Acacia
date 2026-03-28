"use client";

import React from "react";
import { MessageSquare, Phone, Mail, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { buildSupportConversationItems, getSupportConversationLabel, isResolvedConversationItem } from "@/lib/supportConversation";

const TicketSupportDeskCardSection = React.memo(function TicketSupportDeskCardSection({
  resort,
  loadingMessages,
  messages,
  issues = [],
  onRefreshMessages,
  isConcernOnlyMode,
  chatMessage,
  setChatMessage,
  onSendMessage,
  isSendingMessage,
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
          <MessageSquare size={18} className="text-sky-700" /> Support Desk
        </h3>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={onRefreshMessages}
            className="p-2 bg-slate-50 rounded-full flex items-center justify-center gap-2 text-slate-400 hover:text-sky-700 transition-colors"
            aria-label="Refresh support messages"
          >
            <RefreshCw size={16} className={loadingMessages ? "animate-spin" : ""} />
            <p className = "text-xs">Refresh</p>
          </button>
          <a
            href={`tel:${resort?.contactPhone}`}
            className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-sky-700 transition-colors"
          >
            <Phone size={16} />
          </a>
          <a
            href={`mailto:${resort?.contactEmail}`}
            className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-sky-700 transition-colors"
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
                      : "bg-sky-50 text-sky-700 ml-8"
                    : "bg-white text-slate-700 mr-8 border border-slate-100"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="font-black uppercase tracking-wider text-[9px]">{getSupportConversationLabel(msg)}</p>
                  {msg.createdAt ? (
                    <span className="text-[9px] text-slate-400">
                      {new Date(msg.createdAt).toLocaleString()}
                    </span>
                  ) : null}
                </div>
                <p>{msg.body}</p>
              </div>
            ))
          )}
        </div>

        {!isConcernOnlyMode ? (
          <div className="flex gap-2">
            <input
              className="flex-1 rounded-2xl border-slate-100 bg-slate-50 px-4 py-3 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-sky-100"
              placeholder="Send a message to owner"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
            />
            <Button className="rounded-2xl h-12" onClick={onSendMessage} disabled={isSendingMessage}>
              {isSendingMessage ? "Sending..." : "Send"}
            </Button>
          </div>
        ) : null}
      </div>
    </Card>
  );
});

export { TicketSupportDeskCardSection };
