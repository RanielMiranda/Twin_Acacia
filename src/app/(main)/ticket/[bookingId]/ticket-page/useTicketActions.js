"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { BUCKET_NAME } from "@/lib/utils";
import { isMissingSupportTableError, toSafeSegment } from "./helpers";

export function useTicketActions({
  booking,
  resort,
  form,
  normalizedBookingId,
  paymentMethod,
  downpayment,
  proofFiles,
  fetchTicket,
  fetchMessages,
  setBooking,
  setProofFiles,
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

  const uploadProofs = async () => {
    if (!Array.isArray(proofFiles) || proofFiles.length === 0) return [];
    const resortName = resort?.name || form?.resortName || `resort-${booking?.resort_id || "unknown"}`;
    const safeResort = toSafeSegment(resortName);
    const safeTicket = toSafeSegment(normalizedBookingId);
    const uploadedUrls = [];
    for (const [index, proofFile] of proofFiles.entries()) {
      const extension = ((proofFile.name?.split(".").pop() || "webp").replace(/[^a-z0-9]/gi, "").toLowerCase() || "webp");
      const path = `resort-bookings/${safeResort}/${safeTicket}/proof-${index + 1}.${extension}`;
      const { error } = await supabase.storage.from(BUCKET_NAME).upload(path, proofFile, {
        upsert: true,
        contentType: proofFile.type || "image/webp",
      });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);
      if (urlData?.publicUrl) uploadedUrls.push(urlData.publicUrl);
    }
    return uploadedUrls;
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
      const uploadedProofUrls = await uploadProofs();
      const nextProofUrls = uploadedProofUrls.length > 0 ? uploadedProofUrls : existingProofUrls;
      const bookingForm = {
        ...(booking.booking_form || {}),
        pendingPaymentMethod: paymentMethod,
        pendingDownpayment: Number(downpayment || 0),
        paymentPendingApproval: true,
        paymentVerified: false,
        paymentVerifiedAt: null,
        paymentProofUrl: nextProofUrls[0] || null,
        paymentProofUrls: nextProofUrls,
        paymentSubmittedAt: new Date().toISOString(),
      };

      const nextStatus =
        (booking.status || "").toLowerCase().includes("inquiry") || (booking.status || "").toLowerCase().includes("pending")
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

      const amount = Number(downpayment || 0);
      if (amount > 0) {
        const totalAmount = Number(form.totalAmount || 0);
        const existingPaid = Number(form.downpayment || 0);
        const balanceAfter = Math.max(0, totalAmount - existingPaid - amount);
        const { error: txError } = await supabase.from("booking_transactions").insert({
          booking_id: booking.id,
          method: paymentMethod || "Pending",
          amount,
          balance_after: balanceAfter,
          note: "Payment proof submitted by client (pending approval)",
        });
        if (txError) console.error("Failed to record booking_transactions:", txError);
      }

      setBooking((prev) => ({ ...prev, booking_form: bookingForm, status: nextStatus }));
      setProofFiles?.([]);
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
    if (!issueMessage.trim() || !booking) {
      if (!issueMessage.trim()) {
        toast({ message: "Issue message cannot be empty.", color: "red" });
      }
      return;
    }

    try {
      const payload = {
        booking_id: booking.id,
        resort_id: booking.resort_id,
        guest_name: form.guestName || "Guest",
        guest_email: form.email || "",
        subject: issueSubject || "Ticket Issue",
        message: issueMessage,
        status: "open",
      };

      const { error } = await supabase.from("ticket_issues").insert(payload);
      if (error) throw error;

      setIssueSubject("");
      setIssueMessage("");
      toast({ message: "Issue sent to owner support.", color: "green" });
    } catch (err) {
      if (isMissingSupportTableError(err)) {
        toast({ message: "Issue table missing. Ask admin to run supabase/schema.sql.", color: "amber" });
        return;
      }
      toast({ message: `Issue send failed: ${err.message}`, color: "red" });
    }
  };

  const handleSendMessage = async () => {
    if (!chatMessage.trim() || !booking) return;
    try {
      const payload = {
        booking_id: booking.id,
        resort_id: booking.resort_id,
        sender_role: "client",
        sender_name: form.guestName || "Client",
        message: chatMessage.trim(),
      };
      const { error } = await supabase.from("ticket_messages").insert(payload);
      if (error) throw error;
      setChatMessage("");
      await fetchMessages(booking.id);
      toast({ message: "Message sent to owner.", color: "green" });
    } catch (err) {
      if (isMissingSupportTableError(err)) {
        toast({ message: "Messaging table missing. Ask admin to run supabase/schema.sql.", color: "amber" });
        return;
      }
      toast({ message: `Message send failed: ${err.message}`, color: "red" });
    }
  };

  const handleSubmitAddOns = async (services) => {
    if (!booking) return;
    const normalizedServices = (services || [])
      .map((service) => ({
        name: String(service?.name || "").trim(),
        cost: Number(service?.cost || 0),
      }))
      .filter((service) => service.name);

    setIsSavingAddOns(true);
    try {
      const bookingForm = {
        ...(booking.booking_form || {}),
        resortServices: normalizedServices,
        addOnsUpdatedAt: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("bookings")
        .update({ booking_form: bookingForm })
        .eq("id", booking.id);

      if (error) throw error;

      try {
        await supabase.from("ticket_messages").insert({
          booking_id: booking.id,
          resort_id: booking.resort_id,
          sender_role: "client",
          sender_name: form.guestName || "Client",
          message:
            normalizedServices.length > 0
              ? `Requested add-on update: ${normalizedServices
                  .map((service) => `${service.name} (PHP ${Number(service.cost || 0).toLocaleString()})`)
                  .join(", ")}`
              : "Requested add-on update: cleared requested add-ons.",
        });
      } catch (messageError) {
        if (!isMissingSupportTableError(messageError)) {
          console.error("Failed to create add-on request message:", messageError);
        }
      }

      setBooking((prev) => ({ ...prev, booking_form: bookingForm }));
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
    handleSubmitDownpayment,
    handleSubmitAddOns,
    handleSendIssue,
    handleSendMessage,
  };
}
