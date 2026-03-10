"use client";

const toTime = (value) => new Date(value || 0).getTime();

export function buildSupportConversationItems({
  messages = [],
  issues = [],
  newestFirst = true,
  issueFallbackSubject = "Concern",
}) {
  const mapped = [
    ...(messages || []).map((msg) => ({
      id: `msg:${msg.id}`,
      kind: "message",
      createdAt: msg.created_at,
      senderRole: msg.sender_role,
      senderName: msg.sender_name,
      body: msg.message,
    })),
    ...(issues || []).map((issue) => ({
      id: `issue:${issue.id}`,
      kind: "issue",
      createdAt: issue.created_at,
      senderRole: "client",
      senderName: issue.guest_name || "Guest",
      body: issue.message,
      subject: issue.subject || issueFallbackSubject,
      status: issue.status || "open",
      issueId: issue.issueId || issue.id,
      isArchived: !!issue.isArchived,
    })),
  ];

  return mapped.sort((a, b) => (
    newestFirst ? toTime(b.createdAt) - toTime(a.createdAt) : toTime(a.createdAt) - toTime(b.createdAt)
  ));
}

export function isResolvedConversationItem(item) {
  return String(item?.status || "").toLowerCase() === "resolved";
}

export function getSupportConversationLabel(item) {
  if (item?.kind === "issue") {
    return `${item.subject || "Concern"}${isResolvedConversationItem(item) ? " (Resolved)" : ""}`;
  }
  if (item?.senderName) return item.senderName;
  return item?.senderRole || "message";
}
