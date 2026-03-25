"use client";

import { useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { BUCKET_NAME, convertImageFileToWebp, toSafeSegment, buildServiceSnapshots, computeBookingTotalAmount } from "@/lib/utils";
import { isMissingSupportTableError } from "./helpers";
import { useSupport } from "@/components/useclient/SupportClient";

export function useTicketActions({
  booking,
  resort,
  form,
  normalizedBookingId,
  viewerRole,
  paymentMethod,
  downpayment,
  paymentNote,
  proofFiles,
  fetchTicket,
  fetchMessages,
  setBooking,
  setProofFiles,
  setPaymentNote,
  issueSubject,
  setIssueSubject,
  issueMessage,
  setIssueMessage,
  chatMessage,
  setChatMessage,
  toast,
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingAddOns, setIsSavingAddOns] = useState(false);
  const [isSendingIssue, setIsSendingIssue] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const { sendTicketMessage, createTicketIssueSafe } = useSupport();
  const lastIssueSentAtRef = useRef(0);
  const lastMessageSentAtRef = useRef(0);
  const lastAddOnsSentAtRef = useRef(0);

  const hashString = (value) => {
    let hash = 0;
    for (let i = 0; i < value.length; i += 1) {
      hash = (hash << 5) - hash + value.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(36);
  };

  const buildMessageIdempotencyKey = (message, senderRole) => {
    const bucket = Math.floor(Date.now() / 5000);
    const base = `${normalizedBookingId}:${senderRole}:${message}`.toLowerCase().trim();
    return `ticket-msg:${bucket}:${hashString(base)}`;
  };

  const uploadProofs = async () => {
    if (!Array.isArray(proofFiles) || proofFiles.length === 0) return { urls: [], folder: null };
    const resortName = resort?.name || form?.resortName || `resort-${booking?.resort_id || "unknown"}`;
    const safeResort = toSafeSegment(resortName);
    const safeTicket = toSafeSegment(normalizedBookingId);
    const proofFolder = `resort-bookings/${safeResort}/${safeTicket}`;
    const uploadedUrls = [];

    for (const [index, proofFile] of proofFiles.entries()) {
      const normalizedFile = await convertImageFileToWebp(proofFile);
      const baseName = normalizedFile?.name ? normalizedFile.name.replace(/\.[^.]+$/, "") : `proof-${index + 1}`;
      const safeBase = String(baseName || `proof-${index + 1}`)
        .trim()
        .replace(/[^a-z0-9-_]/gi, "-")
        .toLowerCase();
      const uniqueSuffix = `${Date.now()}-${index + 1}`;
      const fileStem = safeBase ? `${safeBase}-${uniqueSuffix}` : `proof-${uniqueSuffix}`;
      const path = `${proofFolder}/${fileStem}.webp`;
      const { error } = await supabase.storage.from(BUCKET_NAME).upload(path, normalizedFile, {
        upsert: true,
        contentType: normalizedFile?.type || "image/webp",
      });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);
      if (urlData?.publicUrl) uploadedUrls.push(urlData.publicUrl);
    }
    return { urls: uploadedUrls, folder: proofFolder };
  };

  const handleSubmitDownpayment = async () => {
    if (!booking) return;
    if (booking.booking_form?.paymentPendingApproval) {
      toast({
        message: "Your previous payment submission is still waiting for owner approval.",
        color: "amber",
      });
      return;
    }
    if (!Array.isArray(proofFiles) || proofFiles.length === 0) {
      toast({ message: "Please attach at least one proof of payment image before submitting.", color: "red" });
      return;
    }
    setIsSubmitting(true);
    try {
      const existingProofUrls = Array.isArray(booking.booking_form?.paymentProofUrls)
        ? booking.booking_form.paymentProofUrls.filter(Boolean)
        : booking.booking_form?.paymentProofUrl
          ? [booking.booking_form.paymentProofUrl]
          : [];
      const { urls: uploadedProofUrls, folder: proofFolder } = await uploadProofs();
      const mergedProofUrls = Array.from(
        new Set([...(existingProofUrls || []), ...(uploadedProofUrls || [])].filter(Boolean))
      );
      const nextProofUrls = mergedProofUrls.length > 0 ? mergedProofUrls : existingProofUrls;
      const nextProofFolder = proofFolder || booking.booking_form?.paymentProofFolder || null;
      const existingProofLog = Array.isArray(booking.booking_form?.paymentProofLog)
        ? booking.booking_form.paymentProofLog
        : [];

      const proofLogEntry = {
        at: new Date().toISOString(),
        action: "submit_payment_proof",
        paymentMethod,
        amount: Number(downpayment || 0),
        folder: nextProofFolder,
        urls: uploadedProofUrls,
        note: paymentNote?.trim() || "",
      };

      const bookingForm = {
        ...(booking.booking_form || {}),
        pendingPaymentMethod: paymentMethod,
        pendingDownpayment: Number(downpayment || 0),
        pendingPaymentNote: paymentNote?.trim() || "",
        paymentPendingApproval: true,
        paymentVerified: false,
        paymentVerifiedAt: null,
        paymentProofFolder: nextProofFolder,
        paymentProofUrl: nextProofUrls[0] || null,
        paymentProofUrls: nextProofUrls,
        paymentProofLog: [...existingProofLog, proofLogEntry],
        paymentSubmittedAt: new Date().toISOString(),
      };

      const normalizedStatus = String(booking.status || "").toLowerCase();
      const nextStatus =
        normalizedStatus.includes("inquiry") || normalizedStatus === "approved inquiry"
          ? "Pending Payment"
          : booking.status;
      const adults = Number(bookingForm.adultCount || form.adultCount || 0);
      const children = Number(bookingForm.childrenCount || form.childrenCount || 0);
      const pax = Number(bookingForm.guestCount || bookingForm.pax || adults + children || 0);

      const { error } = await supabase
        .from("bookings")
        .update({
          booking_form: bookingForm,
          status: nextStatus,
          adult_count: adults,
          children_count: children,
          pax,
          sleeping_guests: Number(bookingForm.sleepingGuests || form.sleepingGuests || 0),
          room_count: Number(bookingForm.roomCount || form.roomCount || 1),
        })
        .eq("id", booking.id);

      if (error) throw error;

      setBooking((prev) => ({ ...prev, booking_form: bookingForm, status: nextStatus }));
      setProofFiles?.([]);
      setPaymentNote?.("");
      await fetchTicket();
      toast({
        message: "Payment proof submitted. Waiting for owner approval.",
        color: "green",
      });
    } catch (err) {
      toast({ message: `Payment submission failed: ${err.message}`, color: "red" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendIssue = async () => {
    if (isSendingIssue) return;
    if (!issueMessage.trim() || !booking) {
      if (!issueMessage.trim()) {
        toast({ message: "Issue message cannot be empty.", color: "red" });
      }
      return;
    }

    const now = Date.now();
    if (now - lastIssueSentAtRef.current < 5000) {
      toast({ message: "Please wait a few seconds before sending another issue.", color: "amber" });
      return;
    }

    setIsSendingIssue(true);
    try {
      lastIssueSentAtRef.current = now;
      const payload = {
        booking_id: booking.id,
        resort_id: booking.resort_id,
        guest_name: form.guestName || "Guest",
        guest_email: form.email || "",
        subject: issueSubject || "Ticket Issue",
        message: issueMessage,
        status: "open",
      };

      const result = await createTicketIssueSafe(payload);
      if (result?.skipped) {
        toast({ message: "Issue already sent. Please wait for a response.", color: "amber" });
        return;
      }

      setIssueSubject("");
      setIssueMessage("");
      toast({ message: "Issue sent to owner support.", color: "green" });
    } catch (err) {
      if (isMissingSupportTableError(err)) {
        toast({ message: "Issue table missing. Ask admin to run supabase/schema.sql.", color: "amber" });
        return;
      }
      toast({ message: `Issue send failed: ${err.message}`, color: "red" });
    } finally {
      setIsSendingIssue(false);
    }
  };

  const handleSendMessage = async () => {
    if (isSendingMessage) return;
    if (!chatMessage.trim() || !booking) return;
    const now = Date.now();
    if (now - lastMessageSentAtRef.current < 5000) {
      toast({ message: "Please wait a few seconds before sending another message.", color: "amber" });
      return;
    }
    setIsSendingMessage(true);
    try {
      lastMessageSentAtRef.current = now;
      const senderDisplayName =
        viewerRole === "agent"
          ? (form.agentName || form.guestName || "Agent")
          : (form.stayingGuestName || form.guestName || "Guest");
      const payload = {
        booking_id: booking.id,
        resort_id: booking.resort_id,
        sender_role: "client",
        sender_name: senderDisplayName,
        message: chatMessage.trim(),
        visibility: viewerRole === "agent" ? true : false,
        idempotency_key: buildMessageIdempotencyKey(chatMessage, "client"),
      };
      await sendTicketMessage(payload);
      setChatMessage("");
      await fetchMessages(booking.id);
      toast({ message: "Message sent to owner.", color: "green" });
    } catch (err) {
      if (isMissingSupportTableError(err)) {
        toast({ message: "Messaging table missing. Ask admin to run supabase/schema.sql.", color: "amber" });
        return;
      }
      toast({ message: `Message send failed: ${err.message}`, color: "red" });
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleSubmitAddOns = async (services) => {
    if (!booking) return;
    const now = Date.now();
    if (now - lastAddOnsSentAtRef.current < 5000) {
      toast({ message: "Please wait a few seconds before sending another add-on request.", color: "amber" });
      return;
    }
    const normalizedServiceKeys = (services || [])
      .map((service) => {
        if (service && typeof service === "object") return service.id || service.name || "";
        return service || "";
      })
      .map((serviceId) => String(serviceId || "").trim())
      .filter(Boolean);
    const serviceSnapshots = buildServiceSnapshots(
      normalizedServiceKeys,
      Array.isArray(resort?.extraServices) ? resort.extraServices : []
    );

    setIsSavingAddOns(true);
    try {
      lastAddOnsSentAtRef.current = now;
      const baseRate = Number(booking.booking_form?.totalAmount || 0) || Number(resort?.price || 0);
      const computedTotal = computeBookingTotalAmount({
        basePrice: baseRate,
        serviceSnapshots,
      });

      const bookingForm = {
        ...(booking.booking_form || {}),
        totalAmount: computedTotal,
        resortServices: serviceSnapshots,
        addOnsUpdatedAt: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("bookings")
        .update({
          booking_form: bookingForm,
          resort_service_ids: normalizedServiceKeys,
        })
        .eq("id", booking.id);

      if (error) throw error;

      try {
        await sendTicketMessage({
          booking_id: booking.id,
          resort_id: booking.resort_id,
          sender_role: "client",
          sender_name: form.guestName || "Client",
          visibility: viewerRole === "agent" ? true : false,
          message:
            serviceSnapshots.length > 0
              ? `Requested add-on update: ${serviceSnapshots
                  .map((service) => `${service.name} (PHP ${Number(service.cost || 0).toLocaleString()})`)
                  .join(", ")}`
              : "Requested add-on update: cleared requested add-ons.",
          idempotency_key: buildMessageIdempotencyKey(
            normalizedServiceKeys.length > 0
              ? normalizedServiceKeys.join("|")
              : "cleared",
            "client-addons"
          ),
        });
      } catch (messageError) {
        if (!isMissingSupportTableError(messageError)) {
          console.error("Failed to create add-on request message:", messageError);
        }
      }

      try {
        const guestName =
          booking.booking_form?.stayingGuestName ||
          booking.booking_form?.guestName ||
          form.guestName ||
          "Guest";
        const guestEmail =
          booking.booking_form?.stayingGuestEmail ||
          booking.booking_form?.email ||
          "";
        const subject =
          serviceSnapshots.length > 0
            ? `Service add-on: ${serviceSnapshots.map((service) => service.name).join(", ")}`
            : "Service add-on: cleared requested add-ons.";
        const message =
          serviceSnapshots.length > 0
            ? `Requested add-on update: ${serviceSnapshots
                .map((service) => `${service.name} (PHP ${Number(service.cost || 0).toLocaleString()})`)
                .join(", ")}`
            : "Requested add-on update: cleared requested add-ons.";

        await createTicketIssueSafe({
          booking_id: booking.id,
          resort_id: booking.resort_id,
          guest_name: guestName,
          guest_email: guestEmail,
          subject,
          message,
          status: "open",
        });
      } catch (issueError) {
        if (!isMissingSupportTableError(issueError)) {
          console.error("Failed to create add-on concern:", issueError);
        }
      }

      setBooking((prev) => ({
        ...prev,
        booking_form: bookingForm,
        resort_service_ids: normalizedServiceKeys,
      }));
      await fetchTicket();
      await fetchMessages(booking.id);
      toast({ message: "Add-on request sent to owner.", color: "green" });
    } catch (err) {
      toast({ message: `Add-on update failed: ${err.message}`, color: "red" });
    } finally {
      setIsSavingAddOns(false);
    }
  };

  return {
    isSubmitting,
    isSavingAddOns,
    isSendingIssue,
    isSendingMessage,
    handleSubmitDownpayment,
    handleSubmitAddOns,
    handleSendIssue,
    handleSendMessage,
  };
}
