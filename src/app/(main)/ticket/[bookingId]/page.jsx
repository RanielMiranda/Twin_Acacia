"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
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

export default function ClientTicketPage() {
  const { bookingId } = useParams();
  const { toast } = useToast();

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
        .select("*")
        .eq("booking_id", activeBookingId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      toast({ message: `Unable to load messages: ${err.message}`, color: "red" });
    } finally {
      setLoadingMessages(false);
    }
  }, [toast]);

  const fetchTicket = useCallback(async () => {
    setLoading(true);
    try {
      const { data: bookingData, error: bookingError } = await supabase
        .from("bookings")
        .select("*")
        .eq("id", bookingId)
        .single();
      if (bookingError) throw bookingError;

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
  }, [bookingId, fetchMessages, toast]);

  useEffect(() => {
    if (!bookingId) return;
    fetchTicket();
  }, [bookingId, fetchTicket]);

  const uploadProof = async () => {
    if (!proofFile) return null;
    const fileName = `${Date.now()}-${proofFile.name.replace(/\s+/g, "-")}`;
    const path = `payments/${bookingId}/${fileName}`;
    const { error } = await supabase.storage.from(BUCKET_NAME).upload(path, proofFile);
    if (error) throw error;
    const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);
    return urlData.publicUrl;
  };

  const handleSubmitDownpayment = async () => {
    if (!booking) return;
    setIsSubmitting(true);
    try {
      const proofUrl = await uploadProof();
      const bookingForm = {
        ...(booking.booking_form || {}),
        paymentMethod,
        downpayment: Number(downpayment || 0),
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

      const balanceAfter = Math.max(
        0,
        Number(bookingForm.totalAmount || 0) - Number(bookingForm.downpayment || 0)
      );

      await supabase.from("booking_transactions").insert({
        booking_id: booking.id,
        method: paymentMethod,
        amount: Number(downpayment || 0),
        balance_after: balanceAfter,
        note: "Downpayment submitted by client ticket page",
      });

      setBooking((prev) => ({ ...prev, booking_form: bookingForm, status: nextStatus }));

      toast({
        message: "Downpayment submitted. Please wait for owner validation.",
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
      toast({ message: `Message send failed: ${err.message}`, color: "red" });
    }
  };

  if (loading) return <div className="p-10 text-center text-slate-500 animate-pulse">Loading ticket...</div>;
  if (!booking) return <div className="p-10 text-center text-slate-500">Ticket not found.</div>;

  const totalAmount = Number(form.totalAmount || 0);
  const paid = Number(form.downpayment || 0);
  const balance = Math.max(0, totalAmount - paid);

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
          onClick={() => window.print()}
        >
          <Printer size={16} className="mr-2" /> Print Entry Pass
        </Button>
      </div>

      {/* Main Ticket Card */}
      <Card className="p-8 md:p-10 border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.04)] rounded-[2.5rem] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[5rem] -z-10" />
        <h2 className="text-sm font-black text-blue-600 uppercase tracking-[0.2em] mb-6 border-b border-slate-50 pb-4">Stay Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <TicketRow label="Resort" value={resort?.name} />
          <TicketRow label="Guest Name" value={form.guestName} />
          <TicketRow label="Status" value={booking.status || "Inquiry"} isStatus />
          <TicketRow label="Check-In" value={booking.start_date || form.checkInDate} subValue={booking.check_in_time || form.checkInTime} />
          <TicketRow label="Check-Out" value={booking.end_date || form.checkOutDate} subValue={booking.check_out_time || form.checkOutTime} />
          <TicketRow label="Location" value={resort?.location} />
          <TicketRow label="Entry Code" value={`TKT-${String(booking.id).slice(-6).toUpperCase()}`} />
        </div>
      </Card>

      {/* Payment Section */}
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
              disabled={isSubmitting}
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

      {/* Support Section */}
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

          <input
            className="w-full rounded-2xl border-slate-100 bg-slate-50 px-4 py-3 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-100"
            placeholder="Subject of concern"
            value={issueSubject}
            onChange={(e) => setIssueSubject(e.target.value)}
          />
          <textarea
            className="w-full min-h-32 rounded-2xl border-slate-100 bg-slate-50 px-4 py-3 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-100"
            placeholder="Please describe your concern or any issues with your stay..."
            value={issueMessage}
            onChange={(e) => setIssueMessage(e.target.value)}
          />
          <Button 
            className="rounded-full px-10 h-12 bg-slate-900 font-bold uppercase text-[10px] tracking-widest hover:bg-black transition-all"
            onClick={handleSendIssue}
          >
            Send Issue Report
          </Button>
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
