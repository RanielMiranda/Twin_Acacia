"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Printer,
  CheckCircle,
  Clock,
  ChevronLeft,
  User,
  Calendar,
  Mail,
  Briefcase,
  ReceiptText,
  Edit3,
  FileText,
  Image as ImageIcon,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Ticket,
  Database,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useResort } from "@/components/useclient/ContextEditor";
import { useBookings } from "@/components/useclient/BookingsClient";
import { resorts } from "@/components/data/resorts";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/toast/ToastProvider";
import Toast from "@/components/ui/toast/Toast";
import { generateConfirmationStub } from "@/lib/bookingFlow";
const STATUS_PHASES = [
  "Inquiry",
  "Pending Payment",
  "Confirmed",
  "Ongoing",
  "Pending Checkout",
  "Checked Out",
  "Cancelled",
  "Declined",
];

const PAYMENT_CHANNELS = ["Pending", "GCash", "Bank", "Cash"];
const TICKET_MESSAGE_COLUMNS = ["id", "booking_id", "sender_role", "sender_name", "message", "created_at"].join(", ");
const TICKET_ISSUE_COLUMNS = ["id", "booking_id", "subject", "message", "status", "created_at"].join(", ");
const isMissingSupportTableError = (error) =>
  !!error?.message &&
  (error.message.includes("Could not find the table") ||
    error.message.includes("does not exist") ||
    error.message.includes("schema cache"));

export default function BookingDetailsPage() {
  const { id, bookingId } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { resort } = useResort();
  const { bookings, updateBookingById, deleteBookingById, refreshBookings, loadingBookings, lastFetchedAt } = useBookings();
  const [messages, setMessages] = useState([]);
  const [issues, setIssues] = useState([]);
  const [ownerReply, setOwnerReply] = useState("");

  const fallbackResort = useMemo(
    () => resorts.find((entry) => entry.id.toString() === id?.toString()),
    [id]
  );

  const currentResort = resort?.id?.toString() === id?.toString() ? resort : fallbackResort;
  const booking = (bookings || currentResort?.bookings || []).find(
    (entry) => entry.id.toString() === bookingId?.toString()
  );

  useEffect(() => {
    if (!booking?.id) return;
    loadSupportData(booking.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booking?.id]);

  const loadSupportData = async (activeBookingId) => {
    try {
      const [{ data: messageRows, error: messageError }, { data: issueRows, error: issueError }] = await Promise.all([
        supabase
          .from("ticket_messages")
          .select(TICKET_MESSAGE_COLUMNS)
          .eq("booking_id", activeBookingId)
          .order("created_at", { ascending: true }),
        supabase
          .from("ticket_issues")
          .select(TICKET_ISSUE_COLUMNS)
          .eq("booking_id", activeBookingId)
          .order("created_at", { ascending: false }),
      ]);

      if (messageError && !isMissingSupportTableError(messageError)) throw messageError;
      if (issueError && !isMissingSupportTableError(issueError)) throw issueError;
      setMessages(messageRows || []);
      setIssues(issueRows || []);
      if (messageError || issueError) {
        toast({
          message: "Support tables are not installed yet. Run phase3 + phase4 SQL.",
          color: "amber",
        });
      }
    } catch (err) {
      toast({ message: `Unable to load support data: ${err.message}`, color: "red" });
    }
  };

  if (!booking) {
    return (
      <div className="p-10 text-center">
        <p className="text-slate-500">Booking not found.</p>
        <Button className="mt-4" onClick={() => router.push(`/edit/bookings/${id}`)}>
          Back to Booking Page
        </Button>
      </div>
    );
  }

  const handleSendReply = async () => {
    if (!ownerReply.trim()) return;
    try {
      const payload = {
        booking_id: booking.id,
        resort_id: booking.resortId || booking.resort_id || Number(id),
        sender_role: "owner",
        sender_name: "Owner",
        message: ownerReply.trim(),
      };
      const { error } = await supabase.from("ticket_messages").insert(payload);
      if (error) throw error;
      setOwnerReply("");
      await loadSupportData(booking.id);
      toast({ message: "Reply sent to client.", color: "green" });
    } catch (err) {
      if (isMissingSupportTableError(err)) {
        toast({ message: "Messaging table missing. Run phase4_messaging.sql first.", color: "amber" });
        return;
      }
      toast({ message: `Reply failed: ${err.message}`, color: "red" });
    }
  };

  return (
    <BookingModernEditor
      key={booking.id}
      booking={booking}
      resortName={currentResort?.name}
      onBack={() => router.push(`/edit/bookings/${id}`)}
      onSave={(next) => updateBookingById(booking.id, next)}
      onDelete={() => {
        deleteBookingById(booking.id);
        router.push(`/edit/bookings/${id}`);
      }}
      onOpenForm={() => router.push(`/edit/bookings/${id}/booking-details/${booking.id}/form`)}
      onOpenTicket={() => router.push(`/ticket/${booking.id}`)}
      onPrint={() => window.print()}
      onRefresh={refreshBookings}
      loadingBookings={loadingBookings}
      lastFetchedAt={lastFetchedAt}
      messages={messages}
      issues={issues}
      ownerReply={ownerReply}
      setOwnerReply={setOwnerReply}
      onSendReply={handleSendReply}
    />
  );
}

function BookingModernEditor({
  booking,
  resortName,
  onBack,
  onSave,
  onDelete,
  onOpenForm,
  onOpenTicket,
  onPrint,
  onRefresh,
  loadingBookings,
  lastFetchedAt,
  messages,
  issues,
  ownerReply,
  setOwnerReply,
  onSendReply,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [renderedAt] = useState(() => Date.now());
  const inlineDraftKey = `booking_inline_draft:${booking.id}`;

  const [draft, setDraft] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(inlineDraftKey);
        if (raw) return JSON.parse(raw);
      } catch {
        // ignore invalid draft
      }
    }
    const form = booking.bookingForm || {};
    return {
      ...form,
      status: form.status || booking.status || "Inquiry",
      guestName: form.guestName || "Guest",
      email: form.email || "",
      phoneNumber: form.phoneNumber || "",
      roomCount: Number(form.roomCount || booking.roomIds?.length || 1),
      checkInDate: form.checkInDate || booking.startDate || "",
      checkOutDate: form.checkOutDate || booking.endDate || "",
      checkInTime: form.checkInTime || booking.checkInTime || "14:00",
      checkOutTime: form.checkOutTime || booking.checkOutTime || "11:00",
      paymentMethod: form.paymentMethod || "Pending",
      downpayment: Number(form.downpayment || 0),
      totalAmount: Number(form.totalAmount || 0),
      paymentDeadline: form.paymentDeadline || booking.paymentDeadline || null,
      paymentProofUrl: form.paymentProofUrl || null,
      confirmationStub: form.confirmationStub || null,
      resortServices: form.resortServices || [],
    };
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(inlineDraftKey, JSON.stringify(draft));
  }, [draft, inlineDraftKey]);

  const status = draft.status || "Inquiry";
  const hasProof = !!draft.paymentProofUrl;
  const balance = Math.max(0, Number(draft.totalAmount || 0) - Number(draft.downpayment || 0));
  const paymentDeadlineDate = draft.paymentDeadline ? new Date(draft.paymentDeadline) : null;
  const hasDeadline = paymentDeadlineDate && !Number.isNaN(paymentDeadlineDate.getTime());
  const isDeadlineExpired = hasDeadline && paymentDeadlineDate.getTime() < renderedAt;

  const setField = (field, value) => setDraft((prev) => ({ ...prev, [field]: value }));

  const persist = (nextDraft) => {
    const payload = {
      ...booking,
      status: nextDraft.status,
      startDate: nextDraft.checkInDate || booking.startDate,
      endDate: nextDraft.checkOutDate || booking.endDate,
      checkInTime: nextDraft.checkInTime || booking.checkInTime,
      checkOutTime: nextDraft.checkOutTime || booking.checkOutTime,
      paymentDeadline: nextDraft.paymentDeadline || null,
      bookingForm: {
        ...(booking.bookingForm || {}),
        ...nextDraft,
      },
    };

    onSave(payload);
  };

  const handleSaveInline = () => {
    persist(draft);
    if (typeof window !== "undefined") localStorage.removeItem(inlineDraftKey);
    setIsEditing(false);
  };

  const handleSetStatus = (nextStatus) => {
    const next = { ...draft, status: nextStatus };
    if (nextStatus === "Confirmed" && !next.confirmationStub?.code) {
      next.confirmationStub = generateConfirmationStub(booking.id, resortName, draft.guestName);
    }
    setDraft(next);
    persist(next);
  };

  const handleRequestPayment = () => {
    const deadline = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const next = {
      ...draft,
      status: "Pending Payment",
      paymentDeadline: deadline,
    };
    setDraft(next);
    persist(next);
  };

  const handleVerifyProof = () => {
    const next = {
      ...draft,
      paymentVerified: !isVerifying,
      paymentVerifiedAt: !isVerifying ? new Date().toISOString() : null,
    };
    setIsVerifying((prev) => !prev);
    setDraft(next);
    persist(next);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-32 mt-10 pt-10 px-4 md:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex justify-between items-center no-print">
          <button onClick={onBack} className="group flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-all font-bold text-xs uppercase tracking-widest">
            <ChevronLeft size={16} /> Back to Overview
          </button>

          <div className="flex gap-3 items-center justify-center">
            <Button variant="outline" onClick={onOpenForm} className="rounded-full flex items-center justify-center bg-white shadow-sm border-slate-200 hover:bg-slate-50 font-bold text-xs px-6">
              <FileText size={16} className="mr-2" /> View Form
            </Button>
            <Button variant="outline" onClick={onOpenTicket} className="rounded-full flex items-center justify-center bg-white shadow-sm border-slate-200 hover:bg-slate-50 font-bold text-xs px-6">
              <Ticket size={16} className="mr-2" /> Client Ticket
            </Button>
            <Button variant="outline" onClick={onPrint} className="rounded-full flex items-center justify-center bg-white shadow-sm border-slate-200 hover:bg-slate-50 font-bold text-xs px-6">
              <Printer size={16} className="mr-2" /> Export
            </Button>
            <Button variant="outline" onClick={onRefresh} className="rounded-full flex items-center justify-center bg-white shadow-sm border-slate-200 hover:bg-slate-50 font-bold text-xs px-6">
              <Database size={16} className="mr-2" /> {loadingBookings ? "Querying..." : "Query DB"}
            </Button>
          </div>
        </div>
        <p className="text-[10px] text-slate-400 uppercase tracking-wider">
          Booking sync: {lastFetchedAt ? new Date(lastFetchedAt).toLocaleString() : "Never"}
        </p>

        {status === "Pending Payment" && (
          <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3 text-amber-700">
              <AlertCircle size={18} />
              <p className="text-xs font-bold uppercase tracking-wider">
                Payment Deadline: {hasDeadline ? paymentDeadlineDate.toLocaleString() : "Not set"}
              </p>
            </div>
            <span className="text-[10px] font-black text-amber-500 bg-white px-3 py-1 rounded-full border border-amber-100">
              {isDeadlineExpired ? "EXPIRED" : "AUTO-CANCEL ACTIVE"}
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-6">
                <div className="h-16 w-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-100">
                  <User size={28} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mb-1">{resortName}</p>
                  {isEditing ? (
                    <input className="text-3xl font-black text-slate-900 tracking-tight border-b border-slate-200 outline-none" value={draft.guestName || ""} onChange={(e) => setField("guestName", e.target.value)} />
                  ) : (
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">{draft.guestName || "Guest"}</h1>
                  )}
                </div>
              </div>
              <StatusBadge status={status} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 space-y-4">
                <SectionLabel icon={<Mail size={14} />} label="Contact" />
                <InfoItem label="Email" value={draft.email} editing={isEditing} onChange={(val) => setField("email", val)} />
                <InfoItem label="Phone" value={draft.phoneNumber} editing={isEditing} onChange={(val) => setField("phoneNumber", val)} />
              </div>
              <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 space-y-4">
                <SectionLabel icon={<Calendar size={14} />} label="Stay" />
                <div className="grid grid-cols-2 gap-2">
                  <InfoItem label="Check-In" value={draft.checkInDate} editing={isEditing} type="date" onChange={(val) => setField("checkInDate", val)} />
                  <InfoItem label="Check-Out" value={draft.checkOutDate} editing={isEditing} type="date" onChange={(val) => setField("checkOutDate", val)} />
                  <InfoItem label="Time In" value={draft.checkInTime} editing={isEditing} type="time" onChange={(val) => setField("checkInTime", val)} />
                  <InfoItem label="Time Out" value={draft.checkOutTime} editing={isEditing} type="time" onChange={(val) => setField("checkOutTime", val)} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <SectionLabel icon={<Briefcase size={14} />} label="Add-ons" />
              <div className="flex flex-wrap gap-3">
                {(draft.resortServices || []).length > 0 ? (
                  draft.resortServices.map((service, index) => (
                    <div key={index} className="bg-white px-4 py-3 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
                      <div className="p-1.5 bg-blue-50 text-blue-600 rounded-md"><CheckCircle size={14} /></div>
                      <span className="text-xs font-bold text-slate-700">{service.name} (PHP {service.cost})</span>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-400">No add-ons selected.</div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className={`p-6 rounded-[2rem] border-2 transition-all shadow-xl ${
              hasProof ? "bg-white border-emerald-100 shadow-emerald-50" : "bg-slate-50 border-dashed border-slate-200 shadow-none"
            }`}>
              <div className="flex justify-between items-center mb-6">
                <SectionLabel icon={<ImageIcon size={14} />} label="Proof of Payment" />
                {hasProof ? (
                  <span className="bg-emerald-500 text-white text-[9px] font-black px-2 py-1 rounded-md animate-pulse">RECEIVED</span>
                ) : (
                  <span className="bg-slate-200 text-slate-500 text-[9px] font-black px-2 py-1 rounded-md">AWAITING</span>
                )}
              </div>

              {hasProof ? (
                <div className="space-y-4">
                  <div className="relative group cursor-pointer overflow-hidden rounded-2xl border border-slate-100">
                    <img src={draft.paymentProofUrl} alt="Payment Receipt" className="w-full h-40 object-cover group-hover:scale-105 transition-transform" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button variant="secondary" size="sm" className="rounded-full text-xs" onClick={() => window.open(draft.paymentProofUrl)}>
                        View Fullscreen <ExternalLink size={12} className="ml-2" />
                      </Button>
                    </div>
                  </div>
                  <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                    <p className="text-[10px] text-emerald-700 font-bold mb-1">Owner Verification</p>
                    <button onClick={handleVerifyProof} className="flex items-center gap-2 text-xs font-black text-emerald-600 uppercase tracking-tighter">
                      {isVerifying ? <CheckCircle size={14} /> : <ShieldCheck size={14} />}
                      {isVerifying ? "Transaction Verified" : "Mark as Verified"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center flex flex-col items-center">
                  <div className="p-4 bg-slate-100 rounded-full mb-3 text-slate-400"><ImageIcon size={24} /></div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">Client has not uploaded <br /> proof yet</p>
                </div>
              )}
            </div>

            <div className="bg-slate-900 text-white p-8 rounded-[2rem] shadow-2xl space-y-6 relative overflow-hidden">
              <div className="absolute -top-4 -right-4 p-4 opacity-5"><ReceiptText size={120} /></div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Due</p>
                {isEditing ? (
                  <input type="number" min="0" className="text-3xl font-black italic bg-transparent border-b border-white/20 outline-none w-full" value={draft.totalAmount || 0} onChange={(e) => setField("totalAmount", Number(e.target.value) || 0)} />
                ) : (
                  <p className="text-4xl font-black italic">PHP {Number(draft.totalAmount || 0).toLocaleString()}</p>
                )}
              </div>
              <div className="space-y-3 pt-4 border-t border-white/10 text-sm">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-400">Downpayment</span>
                  {isEditing ? (
                    <input type="number" min="0" className="bg-transparent border-b border-white/20 outline-none text-right font-bold" value={draft.downpayment || 0} onChange={(e) => setField("downpayment", Number(e.target.value) || 0)} />
                  ) : (
                    <span className="font-bold">PHP {Number(draft.downpayment || 0).toLocaleString()}</span>
                  )}
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-400">Channel</span>
                  {isEditing ? (
                    <select className="bg-slate-800 border border-white/10 rounded px-2 py-1 text-xs" value={draft.paymentMethod || "Pending"} onChange={(e) => setField("paymentMethod", e.target.value)}>
                      {PAYMENT_CHANNELS.map((channel) => (
                        <option key={channel} value={channel}>{channel}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="font-black text-blue-400 text-[10px] tracking-widest">{draft.paymentMethod || "Pending"}</span>
                  )}
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-400">Status</span>
                  {isEditing ? (
                    <select className="bg-slate-800 border border-white/10 rounded px-2 py-1 text-xs" value={status} onChange={(e) => setField("status", e.target.value)}>
                      {STATUS_PHASES.map((phase) => (
                        <option key={phase} value={phase}>{phase}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="font-black text-emerald-300 text-[10px] tracking-widest">{status}</span>
                  )}
                </div>
                <div className="bg-white/5 p-4 rounded-2xl mt-4">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Balance to Pay</p>
                  <p className="text-2xl font-black">PHP {balance.toLocaleString()}</p>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl mt-4">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Confirmation Stub</p>
                  <p className="text-sm font-black tracking-wider">
                    {draft.confirmationStub?.code || "Generated on confirmation"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-3">
            <SectionLabel icon={<AlertCircle size={14} />} label="Client Issues" />
            <div className="max-h-52 overflow-auto space-y-2">
              {issues.length === 0 ? (
                <p className="text-xs text-slate-400">No complaints filed.</p>
              ) : (
                issues.map((issue) => (
                  <div key={issue.id} className="p-3 rounded-xl bg-amber-50 border border-amber-100">
                    <p className="text-[10px] font-black uppercase text-amber-700">{issue.subject || "Issue"}</p>
                    <p className="text-xs text-slate-700 mt-1">{issue.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-3">
            <SectionLabel icon={<Mail size={14} />} label="Client Messaging" />
            <div className="max-h-44 overflow-auto space-y-2">
              {messages.length === 0 ? (
                <p className="text-xs text-slate-400">No thread messages yet.</p>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-2.5 rounded-xl text-xs ${
                      msg.sender_role === "owner"
                        ? "bg-blue-50 text-blue-700 ml-8"
                        : "bg-slate-50 text-slate-700 mr-8"
                    }`}
                  >
                    <p className="font-black uppercase text-[9px] mb-1">{msg.sender_role}</p>
                    <p>{msg.message}</p>
                  </div>
                ))
              )}
            </div>
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
        </div>
      </div>

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-white/90 backdrop-blur-xl p-3 rounded-2xl border border-slate-200 shadow-2xl no-print">
        <Button variant="ghost" className="rounded-full px-8 h-12 text-slate-400 hover:text-rose-600 font-bold" onClick={() => handleSetStatus("Declined")}>
          Decline
        </Button>
        {status === "Inquiry" ? (
          <Button className="rounded-full flex items-center justify-center px-10 h-12 font-bold shadow-lg transition-all flex gap-2 bg-amber-600 hover:bg-amber-700 text-white" onClick={handleRequestPayment}>
            <Clock size={18} />
            Request Payment
          </Button>
        ) : (
        <Button className="rounded-full flex items-center justify-center px-10 h-12 font-bold shadow-lg transition-all flex gap-2 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleSetStatus("Confirmed")}>
          <CheckCircle size={18} />
          {status === "Pending Payment" ? "Confirm Stay" : "Approve"}
        </Button>
        )}
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} className="items-center justify-center bg-slate-900 hover:bg-black text-white rounded-full px-10 h-12 font-bold shadow-lg flex gap-2">
            <Edit3 size={18} /> Edit Inline
          </Button>
        ) : (
          <>
            <Button onClick={handleSaveInline} className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-10 h-12 font-bold shadow-lg">Save Changes</Button>
            <Button variant="outline" onClick={() => {
              if (typeof window !== "undefined") localStorage.removeItem(inlineDraftKey);
              onDelete();
            }} className="rounded-full px-8 h-12 text-red-600 border-red-200">Delete</Button>
          </>
        )}
      </div>
      <Toast/>
    </div>
  );
}

function SectionLabel({ icon, label }) {
  return (
    <div className="flex items-center gap-2 px-1">
      <div className="text-blue-600">{icon}</div>
      <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</span>
    </div>
  );
}

function InfoItem({ label, value, editing = false, onChange, type = "text" }) {
  return (
    <div>
      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
      {editing ? (
        <input type={type} value={value || ""} onChange={(e) => onChange?.(e.target.value)} className="text-sm font-bold text-slate-900 border-b border-slate-200 outline-none w-full" />
      ) : (
        <p className="text-sm font-bold text-slate-900 truncate">{value || "-"}</p>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const normalized = (status || "").toLowerCase();
  const isConfirmed = normalized.includes("confirm");
  const isPending = normalized.includes("pending") || normalized.includes("inquiry");

  return (
    <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl border-2 ${
      isConfirmed
        ? "bg-emerald-50 border-emerald-100 text-emerald-700"
        : isPending
          ? "bg-amber-50 border-amber-100 text-amber-700"
          : "bg-blue-50 border-blue-100 text-blue-700"
    }`}>
      {isConfirmed ? <CheckCircle size={20} /> : <Clock size={20} />}
      <div className="flex flex-col">
        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Status</span>
        <span className="text-sm font-black uppercase tracking-wider">{status}</span>
      </div>
      <Toast />
    </div>
  );
}
