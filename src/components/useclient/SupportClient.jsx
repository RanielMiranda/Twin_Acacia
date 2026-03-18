"use client";

import React, { createContext, useCallback, useContext, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { generateIdempotencyKey } from "@/lib/idempotency";

const SupportContext = createContext(null);

const MESSAGE_COLUMNS = ["id", "booking_id", "sender_role", "sender_name", "visibility", "message", "created_at"].join(", ");
const ISSUE_COLUMNS = ["id", "booking_id", "guest_name", "guest_email", "subject", "message", "status", "created_at"].join(", ");

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
    const [{ data: messageRows, error: messageError }, { data: issueRows, error: issueError }] = await Promise.all([
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
    ]);

    if (messageError && !isMissingSupportTableError(messageError)) throw messageError;
    if (issueError && !isMissingSupportTableError(issueError)) throw issueError;

    return {
      messages: messageRows || [],
      issues: (issueRows || []).sort(
        (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      ),
      missingTables: !!(messageError || issueError),
    };
  }, []);

  const listResortConcerns = useCallback(async (resortId) => {
    const { data, error } = await supabase
      .from("ticket_issues")
      .select(ISSUE_COLUMNS)
      .eq("resort_id", resortId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []).sort(
      (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    );
  }, []);

  const updateConcernStatus = useCallback(async (issueId, status) => {
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
