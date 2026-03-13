import React, { useMemo, useState } from "react";
import { Mail, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildSupportConversationItems, getSupportConversationLabel, isResolvedConversationItem } from "@/lib/supportConversation";
import { SectionLabel } from "../BookingEditorAtoms";

export default function MessagesInboxCardSection({
  issues,
  onResolveIssue,
  messages,
  onRefreshMessages,
  refreshingMessages = false,
  ownerReply,
  setOwnerReply,
  onSendReply,
  inquirerType,
  ownerReplyTarget,
  setOwnerReplyTarget,
}) {
  const [activeFilter, setActiveFilter] = useState("all");
  const hasAgent = String(inquirerType || "").toLowerCase() === "agent"
    || (messages || []).some((msg) => msg?.visibility === true);

  const normalizeVisibility = (value) => {
    if (value === true || value === false) return value;
    if (value === 1 || value === "1" || value === "true") return true;
    if (value === 0 || value === "0" || value === "false") return false;
    return null;
  };

  const filteredMessages = useMemo(() => {
    const role = activeFilter;
    return (messages || []).filter((msg) => {
      const visibility = normalizeVisibility(msg.visibility);
      if (role === "all") return true;
      if (role === "agent") return visibility === true;
      if (role === "client") return visibility === false || visibility === null;
      return true;
    });
  }, [activeFilter, messages]);

  const filteredIssues = useMemo(() => {
    if (activeFilter === "agent") return [];
    return issues || [];
  }, [activeFilter, issues]);

  const earliestClientMessageId = (messages || [])
    .filter((msg) => msg?.sender_role === "client" && msg?.id)
    .sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime())
    .map((msg) => `msg:${msg.id}`)[0];
  const conversationItems = buildSupportConversationItems({
    messages: filteredMessages,
    issues: filteredIssues.map((issue) => ({
      ...issue,
      issueId: issue.id,
    })),
    newestFirst: true,
    issueFallbackSubject: "Concern",
  });

  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
      <div className="flex items-center justify-between gap-3">
        <SectionLabel icon={<Mail size={14} />} label="Client Messaging" />
        <Button
          type="button"
          variant="outline"
          className="h-8 px-3 text-[11px] font-bold flex items-center justify-center"
          onClick={onRefreshMessages}
        >
          <RefreshCw size={12} className={`mr-2 ${refreshingMessages ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: "all", label: "All" },
          ...(hasAgent ? [{ id: "agent", label: "Agent" }] : []),
          { id: "client", label: "Client" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveFilter(tab.id)}
            className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest border ${
              activeFilter === tab.id
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="max-h-52 overflow-auto space-y-2">
        {conversationItems.length === 0 ? (
          <p className="text-xs text-slate-400">No messages sent yet.</p>
        ) : (
          conversationItems.map((item) => {
            const isOwner = item.senderRole === "owner";
            const isIssue = item.kind === "issue";
            const resolved = isResolvedConversationItem(item);
            const isInitialInquiryNote =
              item.kind === "message" &&
              item.senderRole === "client" &&
              item.id === earliestClientMessageId;
            const visibility = normalizeVisibility(item.visibility);
            const ownerTargetLabel =
              isOwner && item.kind === "message"
                ? visibility === true
                  ? "To Agent"
                  : visibility === false
                    ? "To Client"
                    : "To All"
                : "";
            return (
              <div
                key={item.id}
                className={`p-2.5 rounded-xl text-xs ${
                  isOwner
                    ? "bg-blue-50 text-blue-700 ml-8"
                    : isIssue
                      ? resolved
                        ? "bg-emerald-50 text-emerald-700 mr-8 border border-emerald-200"
                        : "bg-amber-50 text-amber-700 mr-8 border border-amber-200"
                      : "bg-slate-50 text-slate-700 mr-8"
                }`}
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <p className="font-black uppercase text-[9px]">
                    {isInitialInquiryNote ? "Initial Inquiry Note" : getSupportConversationLabel(item)}
                  </p>
                  {ownerTargetLabel ? (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-black uppercase text-slate-500">
                      {ownerTargetLabel}
                    </span>
                  ) : null}
                  {isIssue && !resolved ? (
                    <Button
                      type="button"
                      variant="outline"
                      className="flex items-center justify-center h-6 px-2 text-[10px] font-bold border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                      onClick={() => onResolveIssue?.(item.issueId)}
                    >
                      Resolve
                    </Button>
                  ) : null}
                </div>
                <p>{item.body}</p>
                {item.createdAt ? (
                  <p className="mt-1 text-[10px] text-slate-400">
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                ) : null}
              </div>
            );
          })
        )}
      </div>
      {hasAgent ? (
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: "all", label: "All" },
            { id: "client", label: "Client" },
            { id: "agent", label: "Agent" },
          ].map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setOwnerReplyTarget?.(option.id)}
              className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest border ${
                ownerReplyTarget === option.id
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
              }`}
            >
              Reply to {option.label}
            </button>
          ))}
        </div>
      ) : null}
      <div className="flex gap-2">
        <input
          className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm"
          placeholder="Reply to client"
          value={ownerReply}
          onChange={(e) => setOwnerReply(e.target.value)}
        />
        <Button onClick={onSendReply}>Send</Button>
      </div>
    </div>
  );
}
