"use client";

import React, { createContext, useCallback, useContext, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { generateIdempotencyKey } from "@/lib/idempotency";

const SupportContext = createContext(null);

const MESSAGE_COLUMNS = ["id", "booking_id", "sender_role", "sender_name", "visibility", "message", "created_at"].join(", ");
const ISSUE_COLUMNS = ["id", "booking_id", "guest_name", "guest_email", "subject", "message", "status", "created_at"].join(", ");
const ISSUE_ARCHIVE_COLUMNS = [
  "id",
  "source_issue_id",
  "booking_id",
  "resort_id",
  "guest_name",
  "guest_email",
  "subject",
  "message",
  "status",
  "created_at",
  "resolved_at",
  "archived_at",
].join(", ");

const isMissingSupportTableError = (error) =>
  !!error?.message &&
  (error.message.includes("Could not find the table") ||
    error.message.includes("does not exist") ||
    error.message.includes("schema cache"));

const ISSUE_DEDUP_WINDOW_MS = 10_000;
const recentIssueKeys = new Map();

const buildIssueDedupKey = (payload) => {
  const bookingId = String(payload?.booking_id || "");
  const guestEmail = String(payload?.guest_email || "").trim().toLowerCase();
  const subject = String(payload?.subject || "").trim().toLowerCase();
  const message = String(payload?.message || "").trim().toLowerCase();
  return `${bookingId}::${guestEmail}::${subject}::${message}`;
};

export function SupportProvider({ children }) {
  const loadBookingSupport = useCallback(async (bookingId) => {
    const [{ data: messageRows, error: messageError }, { data: issueRows, error: issueError }, { data: archivedIssueRows, error: archivedIssueError }] = await Promise.all([
      supabase
        .from("ticket_messages")
        .select(MESSAGE_COLUMNS)
        .eq("booking_id", bookingId)
        .order("created_at", { ascending: true }),
      supabase
        .from("ticket_issues")
        .select(ISSUE_COLUMNS)
        .eq("booking_id", bookingId)
        .order("created_at", { ascending: false }),
      supabase
        .from("ticket_issues_archive")
        .select(ISSUE_ARCHIVE_COLUMNS)
        .eq("booking_id", bookingId)
        .order("created_at", { ascending: false }),
    ]);

    if (messageError && !isMissingSupportTableError(messageError)) throw messageError;
    if (issueError && !isMissingSupportTableError(issueError)) throw issueError;
    if (archivedIssueError && !isMissingSupportTableError(archivedIssueError)) throw archivedIssueError;

    const archivedIssues = (archivedIssueRows || []).map((issue) => ({
      id: `arch:${issue.id}`,
      booking_id: issue.booking_id,
      guest_name: issue.guest_name,
      guest_email: issue.guest_email,
      subject: issue.subject,
      message: issue.message,
      status: issue.status || "resolved",
      created_at: issue.created_at,
      resolved_at: issue.resolved_at,
      archived_at: issue.archived_at,
      isArchived: true,
      source_issue_id: issue.source_issue_id,
    }));

    return {
      messages: messageRows || [],
      issues: [...(issueRows || []), ...archivedIssues].sort(
        (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      ),
      missingTables: !!(messageError || issueError || archivedIssueError),
    };
  }, []);

  const listResortConcerns = useCallback(async (resortId, options = {}) => {
    const pruneDays = Number(options.pruneResolvedOlderThanDays || 0);
    if (pruneDays > 0) {
      const cutoffIso = new Date(Date.now() - pruneDays * 24 * 60 * 60 * 1000).toISOString();
      await supabase
        .from("ticket_issues_archive")
        .delete()
        .eq("resort_id", resortId)
        .eq("status", "resolved")
        .lt("resolved_at", cutoffIso);
    }

    const [{ data, error }, { data: archivedData, error: archivedError }] = await Promise.all([
      supabase
        .from("ticket_issues")
        .select(ISSUE_COLUMNS)
        .eq("resort_id", resortId)
        .order("created_at", { ascending: false }),
      supabase
        .from("ticket_issues_archive")
        .select(ISSUE_ARCHIVE_COLUMNS)
        .eq("resort_id", resortId)
        .order("created_at", { ascending: false }),
    ]);
    if (error) throw error;
    if (archivedError && !isMissingSupportTableError(archivedError)) throw archivedError;

    const archivedMapped = (archivedData || []).map((issue) => ({
      id: `arch:${issue.id}`,
      booking_id: issue.booking_id,
      guest_name: issue.guest_name,
      guest_email: issue.guest_email,
      subject: issue.subject,
      message: issue.message,
      status: issue.status || "resolved",
      created_at: issue.created_at,
      resolved_at: issue.resolved_at,
      archived_at: issue.archived_at,
      isArchived: true,
      source_issue_id: issue.source_issue_id,
    }));

    return [...(data || []), ...archivedMapped].sort(
      (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    );
  }, []);

  const updateConcernStatus = useCallback(async (issueId, status) => {
    const isArchivedId = typeof issueId === "string" && issueId.startsWith("arch:");
    const archiveId = isArchivedId ? issueId.slice(5) : null;

    if (status === "resolved" && !isArchivedId) {
      const { data: issueRow, error: loadError } = await supabase
        .from("ticket_issues")
        .select("id, booking_id, resort_id, guest_name, guest_email, subject, message, status, created_at")
        .eq("id", issueId)
        .maybeSingle();
      if (loadError) throw loadError;
      if (!issueRow) return;

      const { error: archiveError } = await supabase.from("ticket_issues_archive").insert({
        source_issue_id: issueRow.id,
        booking_id: issueRow.booking_id,
        resort_id: issueRow.resort_id,
        guest_name: issueRow.guest_name,
        guest_email: issueRow.guest_email,
        subject: issueRow.subject,
        message: issueRow.message,
        status: "resolved",
        created_at: issueRow.created_at,
        resolved_at: new Date().toISOString(),
      });
      if (archiveError) throw archiveError;

      const { error: deleteError } = await supabase.from("ticket_issues").delete().eq("id", issueId);
      if (deleteError) throw deleteError;
      return;
    }

    if (status === "open" && isArchivedId) {
      const { data: archivedRow, error: loadArchivedError } = await supabase
        .from("ticket_issues_archive")
        .select(ISSUE_ARCHIVE_COLUMNS)
        .eq("id", archiveId)
        .maybeSingle();
      if (loadArchivedError) throw loadArchivedError;
      if (!archivedRow) return;

      const { error: restoreError } = await supabase.from("ticket_issues").insert({
        booking_id: archivedRow.booking_id,
        resort_id: archivedRow.resort_id,
        guest_name: archivedRow.guest_name,
        guest_email: archivedRow.guest_email,
        subject: archivedRow.subject,
        message: archivedRow.message,
        status: "open",
        created_at: archivedRow.created_at,
      });
      if (restoreError) throw restoreError;

      const { error: deleteArchiveError } = await supabase.from("ticket_issues_archive").delete().eq("id", archiveId);
      if (deleteArchiveError) throw deleteArchiveError;
      return;
    }

    if (isArchivedId) {
      const { error } = await supabase.from("ticket_issues_archive").update({ status }).eq("id", archiveId);
      if (error) throw error;
      return;
    }

    const { error } = await supabase.from("ticket_issues").update({ status }).eq("id", issueId);
    if (error) throw error;
  }, []);

  const listArchivedOwnerAdminMessages = useCallback(async () => {
    const { data, error } = await supabase
      .from("owner_admin_messages_archive")
      .select("id, source_message_id, resort_id, sender_name, sender_image, subject, message, status, created_at, resolved_at, archived_at")
      .order("archived_at", { ascending: false });
    if (error) throw error;
    return data || [];
  }, []);

  const archiveOwnerAdminMessage = useCallback(async (messageRow) => {
    if (!messageRow?.id) return;
    const resolvedAt = new Date().toISOString();

    const { error: insertError } = await supabase.from("owner_admin_messages_archive").insert({
      source_message_id: messageRow.id,
      resort_id: messageRow.resort_id || null,
      sender_name: messageRow.sender_name || null,
      sender_image: messageRow.sender_image || null,
      subject: messageRow.subject || null,
      message: messageRow.message || "",
      status: "resolved",
      created_at: messageRow.created_at || resolvedAt,
      resolved_at: resolvedAt,
    });
    if (insertError) throw insertError;

    const { error: deleteError } = await supabase.from("owner_admin_messages").delete().eq("id", messageRow.id);
    if (deleteError) throw deleteError;
  }, []);

  const sendTicketMessage = useCallback(async (payload) => {
    const idempotencyKey = payload?.idempotency_key || generateIdempotencyKey("ticket-msg");
    const rpcPayload = {
      p_booking_id: payload.booking_id,
      p_resort_id: payload.resort_id ?? null,
      p_sender_role: payload.sender_role,
      p_sender_name: payload.sender_name ?? null,
      p_message: payload.message,
      p_visibility: typeof payload.visibility === "boolean" ? payload.visibility : null,
      p_idempotency_key: idempotencyKey,
    };

    const { error: rpcError } = await supabase.rpc("send_ticket_message_safe", rpcPayload);
    if (!rpcError) return;

    const rpcMissing =
      rpcError.message?.includes("send_ticket_message_safe") &&
      (rpcError.message?.includes("does not exist") || rpcError.message?.includes("schema cache"));

    if (!rpcMissing) throw rpcError;

    const { error } = await supabase.from("ticket_messages").insert({
      ...payload,
      idempotency_key: idempotencyKey,
    });
    if (!error) return;

    const missingColumn =
      error.message?.includes("idempotency_key") &&
      (error.message?.includes("does not exist") || error.message?.includes("schema cache"));
    if (!missingColumn) throw error;

    const { error: plainInsertError } = await supabase.from("ticket_messages").insert(payload);
    if (plainInsertError) throw plainInsertError;
  }, []);

  const createTicketIssueSafe = useCallback(async (payload) => {
    const dedupKey = buildIssueDedupKey(payload);
    const now = Date.now();
    const lastSentAt = recentIssueKeys.get(dedupKey);
    if (lastSentAt && now - lastSentAt < ISSUE_DEDUP_WINDOW_MS) {
      return { skipped: true };
    }
    recentIssueKeys.set(dedupKey, now);

    try {
      const { error } = await supabase.from("ticket_issues").insert(payload);
      if (error) throw error;
      return { skipped: false };
    } catch (error) {
      recentIssueKeys.delete(dedupKey);
      throw error;
    }
  }, []);

  const value = useMemo(
    () => ({
      loadBookingSupport,
      listResortConcerns,
      updateConcernStatus,
      sendTicketMessage,
      createTicketIssueSafe,
      listArchivedOwnerAdminMessages,
      archiveOwnerAdminMessage,
      isMissingSupportTableError,
    }),
    [
      archiveOwnerAdminMessage,
      createTicketIssueSafe,
      listArchivedOwnerAdminMessages,
      listResortConcerns,
      loadBookingSupport,
      sendTicketMessage,
      updateConcernStatus,
    ]
  );

  return <SupportContext.Provider value={value}>{children}</SupportContext.Provider>;
}

export const useSupport = () => useContext(SupportContext);
