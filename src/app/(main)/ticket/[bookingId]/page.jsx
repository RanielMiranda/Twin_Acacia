"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { 
  Printer, Mail, Phone, MessageSquare, 
  CreditCard, Upload, Ticket, ShieldCheck, 
  Loader2, CheckCircle2
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { BUCKET_NAME } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast/ToastProvider";
import Toast from "@/components/ui/toast/Toast";
import { isTicketTokenValid } from "@/lib/ticketAccess";

const BOOKING_TICKET_COLUMNS = [
  "id",
  "resort_id",
  "start_date",
  "end_date",
  "check_in_time",
  "check_out_time",
  "status",
  "booking_form",
].join(", ");
const TICKET_MESSAGE_COLUMNS = ["id", "booking_id", "sender_role", "sender_name", "message", "created_at"].join(", ");
const isMissingSupportTableError = (error) =>
  !!error?.message &&
  (error.message.includes("Could not find the table") ||
    error.message.includes("does not exist") ||
    error.message.includes("schema cache"));

const toSafeSegment = (value) =>
  String(value || "unknown")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_\s]/g, "")
    .replace(/\s+/g, "-");

export default function ClientTicketPage() {
  const { bookingId } = useParams();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const normalizedBookingId = Array.isArray(bookingId) ? bookingId[0] : bookingId;
  const accessToken = searchParams.get("token") || "";

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [booking, setBooking] = useState(null);
  const [resort, setResort] = useState(null);

  const [issueSubject, setIssueSubject] = useState("");
  const [issueMessage, setIssueMessage] = useState("");
  const [chatMessage, setChatMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState("GCash");
  const [downpayment, setDownpayment] = useState(0);
  const [proofFile, setProofFile] = useState(null);

  const form = useMemo(() => booking?.booking_form || {}, [booking?.booking_form]);

  useEffect(() => {
    if (!form) return;
    setPaymentMethod(form.paymentMethod === "Bank" ? "Bank" : "GCash");
    setDownpayment(Number(form.downpayment || 0));
  }, [form]);

  const fetchMessages = useCallback(async (activeBookingId) => {
    setLoadingMessages(true);
    try {
      const { data, error } = await supabase
        .from("ticket_messages")
        .select(TICKET_MESSAGE_COLUMNS)
        .eq("booking_id", activeBookingId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      if (isMissingSupportTableError(err)) {
        setMessages([]);
        return;
      }
      toast({ message: `Unable to load messages: ${err.message}`, color: "red" });
    } finally {
      setLoadingMessages(false);
    }
  }, [toast]);

  const fetchTicket = useCallback(async () => {
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
      const cookieRoleMatch = typeof document !== "undefined"
        ? document.cookie.match(/(?:^|;\s*)app_role=([^;]+)/)
        : null;
      const role = cookieRoleMatch ? decodeURIComponent(cookieRoleMatch[1] || "").toLowerCase() : "";
      const isStaff = role === "admin" || role === "owner";
      if (!isStaff && !isTicketTokenValid(bookingData?.booking_form || {}, accessToken)) {
        throw new Error("Ticket access token is missing, invalid, or expired.");
      }

      setBooking(bookingData);

      if (bookingData?.resort_id) {
        const { data: resortData, error: resortError } = await supabase
          .from("resorts")
          .select("id, name, location, contactEmail, contactPhone, contactMedia")
          .eq("id", bookingData.resort_id)
          .single();
        if (resortError) throw resortError;
        setResort(resortData);
      }

      await fetchMessages(bookingData.id);
    } catch (err) {
      toast({ message: `Unable to load ticket: ${err.message}`, color: "red" });
    } finally {
      setLoading(false);
    }
  }, [accessToken, fetchMessages, normalizedBookingId, toast]);

  useEffect(() => {
    if (!normalizedBookingId) return;
    fetchTicket();
  }, [fetchTicket, normalizedBookingId]);

  const uploadProof = async () => {
    if (!proofFile) return null;
    const resortName = resort?.name || form?.resortName || `resort-${booking?.resort_id || "unknown"}`;
    const safeResort = toSafeSegment(resortName);
    const safeTicket = toSafeSegment(normalizedBookingId);
    const path = `resort-bookings/${safeResort}/${safeTicket}/proof.webp`;
    const { error } = await supabase.storage.from(BUCKET_NAME).upload(path, proofFile, {
      upsert: true,
      contentType: proofFile.type || "image/webp",
    });
    if (error) throw error;
    const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);
    return urlData.publicUrl;
  };

  const handleSubmitDownpayment = async () => {
    if (!booking) return;
    if (!proofFile) {
      toast({ message: "Please attach proof of payment image before submitting.", color: "red" });
      return;
    }
    setIsSubmitting(true);
    try {
      const proofUrl = await uploadProof();
      const bookingForm = {
        ...(booking.booking_form || {}),
        pendingPaymentMethod: paymentMethod,
        pendingDownpayment: Number(downpayment || 0),
        paymentPendingApproval: true,
        paymentVerified: false,
        paymentVerifiedAt: null,
        paymentProofUrl: proofUrl || booking.booking_form?.paymentProofUrl || null,
        paymentSubmittedAt: new Date().toISOString(),
      };

      const nextStatus =
        (booking.status || "").toLowerCase().includes("inquiry") || (booking.status || "").toLowerCase().includes("pending")
          ? "Pending Payment"
          : booking.status;

      const { error } = await supabase
        .from("bookings")
        .update({ booking_form: bookingForm, status: nextStatus })
        .eq("id", booking.id);

      if (error) throw error;

      setBooking((prev) => ({ ...prev, booking_form: bookingForm, status: nextStatus }));
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
    if (!issueMessage.trim()) {
      toast({ message: "Issue message cannot be empty.", color: "red" });
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
        toast({ message: "Issue table missing. Ask admin to run phase3 SQL.", color: "amber" });
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
        toast({ message: "Messaging table missing. Ask admin to run phase4 SQL.", color: "amber" });
        return;
      }
      toast({ message: `Message send failed: ${err.message}`, color: "red" });
    }
  };

  const openPrintableEntryPass = () => {
    if (!booking) return;
    const doc = window.open("", "_blank", "noopener,noreferrer,width=900,height=700");
    if (!doc) return;
    const rows = [
      ["Resort", resort?.name || "-"],
      ["Guest Name", form.guestName || "-"],
      ["Status", booking.status || "Inquiry"],
      ["Pax", String(form.guestCount || 0)],
      ["Adults", String(form.adultCount || 0)],
      ["Children", String(form.childrenCount || 0)],
      ["Sleeping", String(form.sleepingGuests || 0)],
      ["Rooms", String(form.roomCount || 0)],
      ["Check-In", `${booking.start_date || form.checkInDate || "-"} ${booking.check_in_time || form.checkInTime || ""}`.trim()],
      ["Check-Out", `${booking.end_date || form.checkOutDate || "-"} ${booking.check_out_time || form.checkOutTime || ""}`.trim()],
      ["Location", resort?.location || "-"],
      ["Entry Code", form.confirmationStub?.code || `TKT-${String(booking.id).slice(-6).toUpperCase()}`],
    ];
    const rowsHtml = rows
      .map(([label, value]) => `<div class="row"><span class="label">${label}</span><span class="value">${value}</span></div>`)
      .join("");

    doc.document.write(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Entry Pass ${booking.id}</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 24px; color: #0f172a; }
      .card { border: 1px solid #e2e8f0; border-radius: 24px; padding: 24px; max-width: 840px; margin: 0 auto; }
      .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
      .row { border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px 12px; display: flex; flex-direction: column; }
      .label { font-size: 10px; letter-spacing: .08em; text-transform: uppercase; color: #64748b; font-weight: 700; }
      .value { margin-top: 4px; font-size: 14px; font-weight: 700; color: #0f172a; }
      @media print { body { margin: 0; } .card { border: none; } }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="grid">${rowsHtml}</div>
    </div>
    <script>window.onload = () => window.print();</script>
  </body>
</html>`);
    doc.document.close();
  };

  const downloadTicketImage = async () => {
    const card = document.getElementById("ticket-stay-card");
    if (!card) return;
    const width = Math.max(card.offsetWidth, 900);
    const height = card.offsetHeight;
    const data = card.outerHTML;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <foreignObject width="100%" height="100%">${data.replace(/#/g, "%23").replace(/\n/g, " ")}</foreignObject>
    </svg>`;
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `ticket-${booking?.id || "entry"}.png`;
      link.click();
    };
    img.src = url;
  };

  if (loading && !booking) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-8 mt-16 pb-20 animate-pulse">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="h-8 w-56 rounded bg-slate-200" />
            <div className="h-3 w-44 rounded bg-slate-100" />
          </div>
          <div className="h-12 w-40 rounded-full bg-slate-100" />
        </div>

        <Card className="p-8 md:p-10 border-slate-100 rounded-[2.5rem]">
          <div className="h-3 w-40 rounded bg-slate-200 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <div className="h-2 w-20 rounded bg-slate-100" />
                <div className="h-8 w-full rounded bg-slate-100" />
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-8 md:p-10 border-slate-100 rounded-[2.5rem]">
          <div className="h-3 w-52 rounded bg-slate-200 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8 space-y-4">
              <div className="h-12 w-full rounded-2xl bg-slate-100" />
              <div className="h-12 w-full rounded-2xl bg-slate-100" />
              <div className="h-28 w-full rounded-2xl bg-slate-100" />
            </div>
            <div className="lg:col-span-4 h-52 rounded-[2rem] bg-slate-900/90" />
          </div>
        </Card>

        <Card className="p-8 border-slate-100 rounded-[2.5rem]">
          <div className="h-3 w-40 rounded bg-slate-200 mb-4" />
          <div className="h-40 w-full rounded-2xl bg-slate-100 mb-4" />
          <div className="h-12 w-full rounded-2xl bg-slate-100" />
        </Card>
      </div>
    );
  }
  if (!booking) return <div className="p-10 text-center text-slate-500">Ticket not found.</div>;

  const totalAmount = Number(form.totalAmount || 0);
  const paid = Number(form.downpayment || 0);
  const balance = Math.max(0, totalAmount - paid);
  const entryCode = form.confirmationStub?.code || `TKT-${String(booking.id).slice(-6).toUpperCase()}`;
  const status = String(booking.status || "").toLowerCase();
  const isConcernOnlyMode =
    status.includes("confirm") ||
    status.includes("ongoing") ||
    status.includes("pending checkout") ||
    status.includes("checked out");

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8 mt-16 pb-20">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 no-print">
        <div>
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-100">
              <Ticket size={24} />
            </div>
            Guest Portal
          </h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">
            Reference: <span className="text-blue-600 font-black">{booking.id}</span>
          </p>
        </div>
        <Button 
          variant="outline"
          className="rounded-full px-6 flex items-center justify-center border-slate-200 font-bold text-xs uppercase tracking-wider h-12 bg-white shadow-sm"
          onClick={openPrintableEntryPass}
        >
          <Printer size={16} className="mr-2" /> Print Entry Pass
        </Button>
        <Button
          variant="outline"
          className="rounded-full px-6 flex items-center justify-center border-slate-200 font-bold text-xs uppercase tracking-wider h-12 bg-white shadow-sm"
          onClick={downloadTicketImage}
        >
          Download Ticket
        </Button>
      </div>

      {/* Main Ticket Card */}
      <Card id="ticket-stay-card" className="p-8 md:p-10 border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.04)] rounded-[2.5rem] relative overflow-hidden">
        <h2 className="text-sm font-black text-blue-600 uppercase tracking-[0.2em] mb-6 border-b border-slate-50 pb-4">Stay Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <TicketRow label="Resort" value={resort?.name} />
          <TicketRow label="Guest Name" value={form.guestName} />
          <TicketRow label="Status" value={booking.status || "Inquiry"} isStatus />
          <TicketRow label="Pax" value={form.guestCount || 0} />
          <TicketRow label="Adults" value={form.adultCount || 0} />
          <TicketRow label="Children" value={form.childrenCount || 0} />
          <TicketRow label="Sleeping" value={form.sleepingGuests || 0} />
          <TicketRow label="Rooms" value={form.roomCount || 0} />
          <TicketRow label="Check-In" value={booking.start_date || form.checkInDate} subValue={booking.check_in_time || form.checkInTime} />
          <TicketRow label="Check-Out" value={booking.end_date || form.checkOutDate} subValue={booking.check_out_time || form.checkOutTime} />
          <TicketRow label="Location" value={resort?.location} />
          <TicketRow label="Entry Code" value={entryCode} />
        </div>
      </Card>

      {/* Payment Section */}
      {status.includes("pending payment") ? (
      <Card className="p-8 md:p-10 border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.04)] rounded-[2.5rem]">
        <h3 className="text-sm font-black text-emerald-600 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
          <CreditCard size={18} /> Payment & Verification
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <label className="space-y-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Payment Method</span>
                <select 
                  className="w-full rounded-2xl border-slate-100 bg-slate-50 px-4 py-3 font-bold text-slate-700 focus:ring-2 focus:ring-blue-100 outline-none transition-all" 
                  value={paymentMethod} 
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="GCash">GCash</option>
                  <option value="Bank">Bank Transfer</option>
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Deposit Amount (PHP)</span>
                <input 
                  className="w-full rounded-2xl border-slate-100 bg-slate-50 px-4 py-3 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-100" 
                  type="number" 
                  value={downpayment} 
                  onChange={(e) => setDownpayment(Number(e.target.value))} 
                />
              </label>
            </div>

            <label className="block space-y-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Upload Screenshot / Receipt</span>
              <div className="relative group border-2 border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50/50 hover:bg-white hover:border-blue-400 transition-all cursor-pointer">
                <input 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  type="file" 
                  onChange={(e) => setProofFile(e.target.files?.[0] || null)} 
                />
                <div className="flex flex-col items-center justify-center gap-2 text-slate-400 group-hover:text-blue-500">
                  {proofFile ? <CheckCircle2 size={24} className="text-emerald-500" /> : <Upload size={24} />}
                  <p className="text-xs font-bold uppercase tracking-tighter">
                    {proofFile ? proofFile.name : "Tap to browse or drop files here"}
                  </p>
                </div>
              </div>
            </label>
          </div>

          <div className="lg:col-span-4 bg-slate-900 rounded-[2rem] p-8 text-white flex flex-col justify-between">
            <div className="space-y-4">
               <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Contract Price</p>
                  <p className="text-3xl font-black italic">₱{totalAmount.toLocaleString()}</p>
               </div>
               <div className="h-px bg-white/10 w-full" />
               <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Already Paid</span>
                    <span className="font-bold">₱{paid.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-lg font-black text-blue-400 pt-2">
                    <span>Balance</span>
                    <span>₱{balance.toLocaleString()}</span>
                  </div>
               </div>
            </div>

            <Button 
              disabled={isSubmitting || !proofFile}
              className="w-full mt-8 bg-emerald-500 hover:bg-emerald-600 h-14 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-900/20 transition-all active:scale-95 flex items-center justify-center gap-2" 
              onClick={handleSubmitDownpayment}
            >
              {isSubmitting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <ShieldCheck size={18} /> 
              )}
              {isSubmitting ? "Processing..." : "Submit Payment"}
            </Button>
          </div>
        </div>
      </Card>
      ) : null}

      {/* Messaging + Issues Section */}
      <Card className="p-8 border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.04)] rounded-[2.5rem] space-y-6">
        <div className="flex justify-between items-start">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
            <MessageSquare size={18} className="text-blue-600" /> Support Desk
          </h3>
          <div className="flex gap-4">
             <a href={`tel:${resort?.contactPhone}`} className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-blue-600 transition-colors"><Phone size={16}/></a>
             <a href={`mailto:${resort?.contactEmail}`} className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-blue-600 transition-colors"><Mail size={16}/></a>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 max-h-56 overflow-auto space-y-2">
            {loadingMessages ? (
              <p className="text-xs text-slate-400">Loading conversation...</p>
            ) : messages.length === 0 ? (
              <p className="text-xs text-slate-400">No messages yet.</p>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-2.5 rounded-xl text-xs ${
                    msg.sender_role === "client"
                      ? "bg-blue-50 text-blue-700 ml-8"
                      : "bg-white text-slate-700 mr-8 border border-slate-100"
                  }`}
                >
                  <p className="font-black uppercase tracking-wider text-[9px] mb-1">
                    {msg.sender_role} {msg.sender_name ? `- ${msg.sender_name}` : ""}
                  </p>
                  <p>{msg.message}</p>
                </div>
              ))
            )}
          </div>

          {!isConcernOnlyMode ? (
            <div className="flex gap-2">
              <input
                className="flex-1 rounded-2xl border-slate-100 bg-slate-50 px-4 py-3 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-100"
                placeholder="Send a message to owner"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
              />
              <Button className="rounded-2xl h-12" onClick={handleSendMessage}>
                Send
              </Button>
            </div>
          ) : (
            <div className="space-y-3 border-t border-slate-100 pt-4">
              <p className="text-xs font-black uppercase tracking-widest text-rose-600">Issue Report</p>
              <input
                className="w-full rounded-2xl border-slate-100 bg-slate-50 px-4 py-3 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-100"
                placeholder="Subject of concern"
                value={issueSubject}
                onChange={(e) => setIssueSubject(e.target.value)}
              />
              <textarea
                className="w-full min-h-28 rounded-2xl border-slate-100 bg-slate-50 px-4 py-3 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-100"
                placeholder="Please describe your concern or issues with your stay..."
                value={issueMessage}
                onChange={(e) => setIssueMessage(e.target.value)}
              />
              <Button
                className="rounded-full px-8 h-11 bg-slate-900 font-bold uppercase text-[10px] tracking-widest hover:bg-black transition-all"
                onClick={handleSendIssue}
              >
                Send Issue Report
              </Button>
            </div>
          )}

        </div>
      </Card>

      <Toast />
    </div>
  );
}

function TicketRow({ label, value, subValue, isStatus }) {
  const statusColors = {
    "Confirmed": "bg-emerald-50 text-emerald-700 border-emerald-100",
    "Pending Payment": "bg-amber-50 text-amber-700 border-amber-100",
    "Inquiry": "bg-blue-50 text-blue-700 border-blue-100",
  };

  const statusClass = isStatus ? (statusColors[value] || "bg-slate-50 text-slate-700 border-slate-100") : "";

  return (
    <div className="space-y-1">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-0.5">{label}</p>
      <div className={`rounded-xl px-3 py-2 ${isStatus ? `border ${statusClass} text-xs font-black uppercase tracking-wider text-center` : "bg-white"}`}>
        <p className={`font-bold text-slate-900 ${isStatus ? "text-inherit" : "text-sm"}`}>{value || "—"}</p>
        {subValue && <p className="text-[10px] font-bold text-slate-400 leading-none mt-0.5">{subValue}</p>}
      </div>
    </div>
  );
}


