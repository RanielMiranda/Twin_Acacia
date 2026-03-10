"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { BOOKING_TICKET_COLUMNS, TICKET_MESSAGE_COLUMNS } from "./constants";
import { isMissingSupportTableError } from "./helpers";
import { isTicketTokenValid } from "@/lib/ticketAccess";

const TICKET_ISSUE_COLUMNS = ["id", "booking_id", "guest_name", "guest_email", "subject", "message", "status", "created_at"].join(", ");
const TICKET_ISSUE_ARCHIVE_COLUMNS = [
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

export function useTicketData({ normalizedBookingId, accessToken, toast }) {
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(null);
  const [resort, setResort] = useState(null);
  const [messages, setMessages] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const fetchMessages = useCallback(
    async (activeBookingId) => {
      if (!activeBookingId) return;
      setLoadingMessages(true);
      try {
        const [
          { data: messageRows, error: messageError },
          { data: issueRows, error: issueError },
          { data: archivedIssueRows, error: archivedIssueError },
        ] = await Promise.all([
          supabase
            .from("ticket_messages")
            .select(TICKET_MESSAGE_COLUMNS)
            .eq("booking_id", activeBookingId)
            .order("created_at", { ascending: true }),
          supabase
            .from("ticket_issues")
            .select(TICKET_ISSUE_COLUMNS)
            .eq("booking_id", activeBookingId)
            .order("created_at", { ascending: true }),
          supabase
            .from("ticket_issues_archive")
            .select(TICKET_ISSUE_ARCHIVE_COLUMNS)
            .eq("booking_id", activeBookingId)
            .order("created_at", { ascending: true }),
        ]);
        if (messageError) throw messageError;
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

        setMessages(messageRows || []);
        setIssues(
          [...(issueRows || []), ...archivedIssues].sort(
            (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
          )
        );
      } catch (err) {
        if (isMissingSupportTableError(err)) {
          setMessages([]);
          setIssues([]);
          return;
        }
        toast({ message: `Unable to load messages: ${err.message}`, color: "red" });
      } finally {
        setLoadingMessages(false);
      }
    },
    [toast],
  );

  const fetchTicket = useCallback(async () => {
    if (!normalizedBookingId) return;
    setLoading(true);
    try {
      const { data: bookingRows, error: bookingError } = await supabase
        .from("bookings")
        .select(BOOKING_TICKET_COLUMNS)
        .eq("id", normalizedBookingId)
        .order("created_at", { ascending: false })
        .limit(2);
      if (bookingError) throw bookingError;
      if (!bookingRows || bookingRows.length === 0) {
        throw new Error(`Ticket not found for ID: ${normalizedBookingId}`);
      }
      if (bookingRows.length > 1) {
        toast({
          message: "Duplicate ticket IDs found. Showing latest record.",
          color: "amber",
        });
      }

      const bookingData = bookingRows[0];
      const cookieRoleMatch = typeof document !== "undefined" ? document.cookie.match(/(?:^|;\s*)app_role=([^;]+)/) : null;
      const role = cookieRoleMatch ? decodeURIComponent(cookieRoleMatch[1] || "").toLowerCase() : "";
      const isStaff = role === "admin" || role === "owner";
      if (!isStaff && !isTicketTokenValid(bookingData?.booking_form || {}, accessToken)) {
        throw new Error("Ticket access token is missing, invalid, or expired.");
      }

      setBooking(bookingData);

      if (bookingData?.resort_id) {
        const { data: resortData, error: resortError } = await supabase
          .from("resorts")
          .select("id, name, location, contactEmail, contactPhone, contactMedia, rooms, extraServices, payment_image_url, bank_payment_image_url")
          .eq("id", bookingData.resort_id)
          .single();
        if (resortError) throw resortError;
        setResort(resortData);
      } else {
        setResort(null);
      }

      await fetchMessages(bookingData.id);
    } catch (err) {
      toast({ message: `Unable to load ticket: ${err.message}`, color: "red" });
    } finally {
      setLoading(false);
    }
  }, [accessToken, fetchMessages, normalizedBookingId, toast]);

  useEffect(() => {
    fetchTicket();
  }, [fetchTicket]);

  return {
    loading,
    booking,
    setBooking,
    resort,
    messages,
    issues,
    loadingMessages,
    fetchTicket,
    fetchMessages,
  };
}
