"use client";

import React, { useEffect, useState } from "react";
import {
  Printer,
  Download,
  ChevronLeft,
  FileText,
  AlertCircle,
  Ticket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Toast from "@/components/ui/toast/Toast";
import { generateConfirmationStub } from "@/lib/bookingFlow";
import { notifyCaretakerOnPaymentApproval } from "@/lib/caretakerNotifications";
import { generateTicketAccessToken, getTicketAccessExpiry } from "@/lib/ticketAccess";
import {
  buildDraftFromBooking,
  formatWeekdayLabel,
  formatTotalStayDays,
  overlapsByDateTime,
} from "./bookingEditorUtils";
import { PAYMENT_CHANNELS, PREVIOUS_STATUS, STATUS_PHASES } from "./bookingEditorConfig";
import BookingEditorActionBar from "./BookingEditorActionBar";
import {
  AddOnsCardSection,
  AssignRoomsCardSection,
  ClientCardSection,
  MessagesInboxCardSection,
  PaymentCardSection,
  ProofCardSection,
  StatusAuditCardSection,
  StayCardSection,
} from "./BookingEditorSections";
export default function BookingModernEditor({
  booking,
  resortName,
  onBack,
  onSave,
  onDelete,
  onOpenForm,
  onOpenTicket,
  messages,
  issues,
  ownerReply,
  setOwnerReply,
  onSendReply,
  onResolveIssue,
  conflicts = [],
  createSignedProofUrl,
  createBookingTransaction,
  resortRooms = [],
  allBookings = [],
  statusAudits = [],
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);
  const [renderedAt] = useState(() => Date.now());
  const inlineDraftKey = `booking_inline_draft:${booking.id}`;
  const [draft, setDraft] = useState(() => buildDraftFromBooking(booking));
  const [proofPreviewUrl, setProofPreviewUrl] = useState(() => buildDraftFromBooking(booking).paymentProofUrl || null);
  const [assignedRoomIds, setAssignedRoomIds] = useState(() => booking.roomIds || []);
  const [actorMeta, setActorMeta] = useState({ name: "Owner", role: "owner", id: "" });

  useEffect(() => {
    setAssignedRoomIds(booking.roomIds || []);
  }, [booking.id, booking.roomIds]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = sessionStorage.getItem("active_account_v1");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      setActorMeta({
        name: parsed?.full_name || parsed?.email || "Owner",
        role: parsed?.role || "owner",
        id: parsed?.id ? String(parsed.id) : "",
      });
    } catch {
      // keep default actor
    }
  }, []);

  useEffect(() => {
    const adults = Number(draft.adultCount || 0);
    const children = Number(draft.childrenCount || 0);
    const pax = adults + children;
    if (Number(draft.guestCount || 0) === pax) return;
    setDraft((prev) => ({ ...prev, guestCount: pax, pax }));
  }, [draft.adultCount, draft.childrenCount, draft.guestCount]);

  useEffect(() => {
    const base = buildDraftFromBooking(booking);
    if (typeof window === "undefined") {
      if (!isEditing) setDraft(base);
      return;
    }
    let next = base;
    try {
      const raw = localStorage.getItem(inlineDraftKey);
      if (raw) {
        const cached = JSON.parse(raw);
        next = {
          ...base,
          ...cached,
          status: base.status,
          paymentMethod: base.paymentMethod,
          downpayment: base.downpayment,
          pendingDownpayment: base.pendingDownpayment,
          pendingPaymentMethod: base.pendingPaymentMethod,
          paymentPendingApproval: base.paymentPendingApproval,
          paymentProofUrl: base.paymentProofUrl,
          paymentSubmittedAt: base.paymentSubmittedAt,
          paymentVerified: base.paymentVerified,
          paymentVerifiedAt: base.paymentVerifiedAt,
        };
      }
    } catch {
      next = base;
    }
    if (!isEditing) setDraft(next);
  }, [booking, inlineDraftKey, isEditing]);

  useEffect(() => {
    setProofPreviewUrl(draft.paymentProofUrl || null);
  }, [draft.paymentProofUrl]);

  const resolveSignedProofUrl = async () => {
    if (!draft.paymentProofUrl) return;
    try {
      const signed = await createSignedProofUrl?.(draft.paymentProofUrl, 60 * 60);
      if (signed) setProofPreviewUrl(signed);
    } catch {
      // Keep original URL when signing fails.
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const timer = setTimeout(() => {
      localStorage.setItem(inlineDraftKey, JSON.stringify(draft));
    }, 200);
    return () => clearTimeout(timer);
  }, [draft, inlineDraftKey]);

  const status = draft.status || "Inquiry";
  const totalStayDays = formatTotalStayDays(draft.checkInDate, draft.checkOutDate);
  const normalizedStatus = status.toLowerCase();
  const hasProof = !!draft.paymentProofUrl;
  const balance = Math.max(0, Number(draft.totalAmount || 0) - Number(draft.downpayment || 0));
  const paymentDeadlineDate = draft.paymentDeadline ? new Date(draft.paymentDeadline) : null;
  const hasDeadline = paymentDeadlineDate && !Number.isNaN(paymentDeadlineDate.getTime());
  const isDeadlineExpired = hasDeadline && paymentDeadlineDate.getTime() < renderedAt;
  const showDecisionActions = !normalizedStatus.includes("confirm");
  const bookingFormAudits = Array.isArray(draft.statusAudit) ? draft.statusAudit : [];
  const dbAudits = Array.isArray(statusAudits) ? statusAudits : [];
  const approvalAuditFromDb = dbAudits.find((entry) => {
    const next = String(entry?.new_status || "").toLowerCase();
    return next.includes("confirmed") || next.includes("approved inquiry");
  });
  const approvalAuditFromForm = [...bookingFormAudits].reverse().find((entry) => {
    const next = String(entry?.to || "").toLowerCase();
    return next.includes("confirmed") || next.includes("approved inquiry");
  });
  const approvedByName =
    approvalAuditFromForm?.actorName ||
    approvalAuditFromDb?.actor_name ||
    approvalAuditFromDb?.actor_role ||
    "Not approved yet";

  const setField = (field, value) => setDraft((prev) => ({ ...prev, [field]: value }));

  const persist = async (nextDraft) => {
    const selectedRoomNames = (resortRooms || [])
      .filter((room) => (assignedRoomIds || []).includes(room.id))
      .map((room) => room.name)
      .filter(Boolean);
    const previousStatus = booking.bookingForm?.status || booking.status || null;
    const nextStatus = nextDraft.status || previousStatus || "Inquiry";
    const currentAudit = Array.isArray(booking.bookingForm?.statusAudit)
      ? booking.bookingForm.statusAudit
      : Array.isArray(nextDraft.statusAudit)
        ? nextDraft.statusAudit
        : [];
    const statusAudit =
      previousStatus && nextStatus && previousStatus !== nextStatus
        ? [
            ...currentAudit,
            {
              from: previousStatus,
              to: nextStatus,
              at: new Date().toISOString(),
              actor: "owner-ui",
              actorRole: actorMeta.role || "owner",
              actorId: actorMeta.id || "",
              actorName: actorMeta.name || "Owner",
            },
          ]
        : currentAudit;

    const payload = {
      ...booking,
      roomIds: assignedRoomIds,
      status: nextStatus,
      startDate: nextDraft.checkInDate || booking.startDate,
      endDate: nextDraft.checkOutDate || booking.endDate,
      checkInTime: nextDraft.checkInTime || booking.checkInTime,
      checkOutTime: nextDraft.checkOutTime || booking.checkOutTime,
      paymentDeadline: nextDraft.paymentDeadline || null,
      bookingForm: {
        ...(booking.bookingForm || {}),
        ...nextDraft,
        roomCount: assignedRoomIds.length || nextDraft.roomCount || booking.roomIds?.length || 1,
        roomName: selectedRoomNames.length > 0 ? selectedRoomNames.join(", ") : nextDraft.roomName || "",
        assignedRoomIds,
        assignedRoomNames: selectedRoomNames,
        statusAudit,
        lastActionBy: actorMeta.name || "Owner",
      },
    };

    await Promise.resolve(onSave(payload));
  };

  const buildEntryPassRows = () => {
    const assigned = assignedRoomIds.length > 0
      ? (resortRooms || [])
          .filter((room) => assignedRoomIds.includes(room.id))
          .map((room) => room.name)
          .join(", ")
      : (draft.roomName || "Not assigned");
    return [
      ["Guest Name", draft.guestName || "Guest"],
      ["Status", status || "Inquiry"],
      ["Approved By", approvedByName],
      ["Pax", String(draft.guestCount || 0)],
      ["Assigned Rooms", assigned],
      ["Check-In", `${draft.checkInDate || "-"} ${draft.checkInTime || ""}`.trim()],
      ["Check-Out", `${draft.checkOutDate || "-"} ${draft.checkOutTime || ""}`.trim()],
      ["Total Days Stay", totalStayDays],
      ["Entry Code", draft.confirmationStub?.code || `TKT-${String(booking.id).slice(-6).toUpperCase()}`],
    ];
  };

  const openPrintableEntryPass = () => {
    const doc = window.open("", "_blank", "noopener,noreferrer,width=900,height=700");
    if (!doc) return;
    const rowsHtml = buildEntryPassRows()
      .map(
        ([label, value]) =>
          `<div class="row"><span class="label">${label}</span><span class="value">${value}</span></div>`
      )
      .join("");
    doc.document.write(`<!doctype html>
<html><head><meta charset="utf-8" /><title>Entry Pass ${booking.id}</title>
<style>
body { font-family: Arial, sans-serif; margin: 24px; color: #0f172a; }
.card { border: 1px solid #e2e8f0; border-radius: 24px; padding: 24px; max-width: 840px; margin: 0 auto; }
.grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.row { border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px 12px; display: flex; flex-direction: column; }
.label { font-size: 10px; letter-spacing: .08em; text-transform: uppercase; color: #64748b; font-weight: 700; }
.value { margin-top: 4px; font-size: 14px; font-weight: 700; color: #0f172a; }
@media print { body { margin: 0; } .card { border: none; } }
</style></head>
<body><div class="card"><div class="grid">${rowsHtml}</div></div><script>window.onload = () => window.print();</script></body></html>`);
    doc.document.close();
  };

  const downloadEntryPassHtml = () => {
    const rowsHtml = buildEntryPassRows()
      .map(
        ([label, value]) =>
          `<div class="row"><span class="label">${label}</span><span class="value">${value}</span></div>`
      )
      .join("");
    const html = `<!doctype html><html><head><meta charset="utf-8" />
<title>Entry Pass ${booking.id}</title>
<style>
body { font-family: Arial, sans-serif; margin: 24px; color: #0f172a; }
.card { border: 1px solid #e2e8f0; border-radius: 24px; padding: 24px; max-width: 840px; margin: 0 auto; }
.grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.row { border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px 12px; display: flex; flex-direction: column; }
.label { font-size: 10px; letter-spacing: .08em; text-transform: uppercase; color: #64748b; font-weight: 700; }
.value { margin-top: 4px; font-size: 14px; font-weight: 700; color: #0f172a; }
</style></head><body><div class="card"><div class="grid">${rowsHtml}</div></div></body></html>`;
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `entry-pass-${booking.id}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const isRoomConflicting = (roomId) => {
    const probe = {
      id: booking.id,
      roomIds: [roomId],
      startDate: draft.checkInDate || booking.startDate,
      endDate: draft.checkOutDate || booking.endDate || draft.checkInDate || booking.startDate,
      checkInTime: draft.checkInTime || booking.checkInTime,
      checkOutTime: draft.checkOutTime || booking.checkOutTime,
      bookingForm: {
        checkInTime: draft.checkInTime || booking.checkInTime,
        checkOutTime: draft.checkOutTime || booking.checkOutTime,
      },
    };
    return (allBookings || []).some((entry) => {
      if (entry.id?.toString() === booking.id?.toString()) return false;
      if (!(entry.roomIds || []).includes(roomId)) return false;
      return overlapsByDateTime(entry, probe);
    });
  };

  const toggleAssignedRoom = (roomId) => {
    setAssignedRoomIds((prev) =>
      prev.includes(roomId) ? prev.filter((id) => id !== roomId) : [...prev, roomId]
    );
  };

  const handleSaveInline = async () => {
    if (actionBusy) return;
    setActionBusy(true);
    try {
      await persist(draft);
      if (typeof window !== "undefined") localStorage.removeItem(inlineDraftKey);
      setIsEditing(false);
    } finally {
      setActionBusy(false);
    }
  };

  useEffect(() => {
    const current = JSON.stringify(booking.roomIds || []);
    const next = JSON.stringify(assignedRoomIds || []);
    if (current === next) return;
    Promise.resolve(
      persist({
        ...draft,
        roomCount: assignedRoomIds.length || draft.roomCount || 1,
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignedRoomIds]);

  const handleCancelInline = () => {
    const base = buildDraftFromBooking(booking);
    setDraft(base);
    setProofPreviewUrl(base.paymentProofUrl || null);
    if (typeof window !== "undefined") localStorage.removeItem(inlineDraftKey);
    setIsEditing(false);
  };

  const handleSetStatus = async (nextStatus) => {
    if (actionBusy) return;
    setActionBusy(true);
    try {
      const next = { ...draft, status: nextStatus };
      if (nextStatus === "Confirmed" && !next.confirmationStub?.code) {
        next.confirmationStub = generateConfirmationStub(booking.id, resortName, draft.guestName);
        if (next.paymentVerified) {
          next.paymentPendingApproval = false;
          next.pendingDownpayment = 0;
          next.pendingPaymentMethod = null;
        }
      }
      setDraft(next);
      await persist(next);
    } finally {
      setActionBusy(false);
    }
  };

  const handleRequestPayment = async () => {
    if (actionBusy) return;
    setActionBusy(true);
    try {
      const deadline = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const next = {
        ...draft,
        status: "Pending Payment",
        paymentDeadline: deadline,
      };
      setDraft(next);
      await persist(next);
    } finally {
      setActionBusy(false);
    }
  };

  const handleApproveInquiry = async () => {
    if (actionBusy) return;
    setActionBusy(true);
    try {
      const next = {
        ...draft,
        status: "Approved Inquiry",
        ticketAccessToken: draft.ticketAccessToken || generateTicketAccessToken(),
        ticketAccessExpiresAt: draft.ticketAccessExpiresAt || getTicketAccessExpiry(30),
      };
      setDraft(next);
      await persist(next);
    } finally {
      setActionBusy(false);
    }
  };

  const handleRevertStep = async () => {
    if (actionBusy) return;
    const previous = PREVIOUS_STATUS[draft.status];
    if (!previous) return;
    const confirmed = window.confirm(`Revert status from "${draft.status}" to "${previous}"?`);
    if (!confirmed) return;
    setActionBusy(true);
    try {
      const next = { ...draft, status: previous };
      setDraft(next);
      await persist(next);
    } finally {
      setActionBusy(false);
    }
  };

  const handleVerifyProof = async () => {
    if (draft.paymentVerified || actionBusy) return;
    setActionBusy(true);
    try {
      const approvedAmount = Number(draft.pendingDownpayment || 0);
      const nextDownpayment = Number(draft.downpayment || 0) + approvedAmount;
      const nextMethod = draft.pendingPaymentMethod || draft.paymentMethod;

      const next = {
        ...draft,
        paymentVerified: true,
        paymentVerifiedAt: new Date().toISOString(),
        downpayment: nextDownpayment,
        paymentMethod: nextMethod,
        pendingDownpayment: 0,
        pendingPaymentMethod: null,
        paymentPendingApproval: false,
      };
      setDraft(next);
      await persist(next);

      if (approvedAmount > 0) {
        const balanceAfter = Math.max(0, Number(next.totalAmount || 0) - Number(next.downpayment || 0));
        try {
          await createBookingTransaction?.({
          booking_id: booking.id,
          method: nextMethod || "Pending",
          amount: approvedAmount,
          balance_after: balanceAfter,
          note: "Downpayment approved by owner",
          });
        } catch (error) {
          console.error("Failed to log booking transaction:", error.message);
        }
        await notifyCaretakerOnPaymentApproval({
          bookingId: booking.id,
          resortId: booking.resortId || booking.resort_id || null,
          guestName: next.guestName,
          amount: approvedAmount,
          method: nextMethod,
        });
      }
    } finally {
      setActionBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-52 md:pb-32 pt-10 px-4 md:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center no-print">
          <button onClick={onBack} className="group flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-all font-bold text-xs uppercase tracking-widest">
            <ChevronLeft size={16} /> Back to Overview
          </button>

          <div className="flex flex-wrap gap-2 sm:gap-3 items-center justify-start sm:justify-center">
            <Button variant="outline" onClick={onOpenForm} className="rounded-full w-full sm:w-auto flex items-center justify-center bg-white shadow-sm border-slate-200 hover:bg-slate-50 font-bold text-xs px-4 sm:px-6">
              <FileText size={16} className="mr-2" /> View Form
            </Button>
            <Button variant="outline" onClick={onOpenTicket} className="rounded-full w-full sm:w-auto flex items-center justify-center bg-white shadow-sm border-slate-200 hover:bg-slate-50 font-bold text-xs px-4 sm:px-6">
              <Ticket size={16} className="mr-2" /> Client Ticket
            </Button>
            <Button variant="outline" onClick={openPrintableEntryPass} className="rounded-full w-full sm:w-auto flex items-center justify-center bg-white shadow-sm border-slate-200 hover:bg-slate-50 font-bold text-xs px-4 sm:px-6">
              <Printer size={16} className="mr-2" /> Print Entry Pass
            </Button>
            <Button variant="outline" onClick={downloadEntryPassHtml} className="rounded-full w-full sm:w-auto flex items-center justify-center bg-white shadow-sm border-slate-200 hover:bg-slate-50 font-bold text-xs px-4 sm:px-6">
              <Download size={16} className="mr-2" /> Download Entry Pass
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const confirmed = window.confirm("Delete this booking and all related form data?");
                if (!confirmed) return;
                if (typeof window !== "undefined") localStorage.removeItem(inlineDraftKey);
                onDelete();
              }}
              className="rounded-full w-full sm:w-auto flex items-center justify-center bg-white shadow-sm border-red-200 text-red-600 hover:bg-red-50 font-bold text-xs px-4 sm:px-6"
            >
              Delete Booking
            </Button>
          </div>
        </div>

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
            <div className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
              <div className="flex items-start sm:items-center gap-4 sm:gap-6">
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
                  <div className="mt-3 space-y-1">
                    {isEditing ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <input
                          type="email"
                          className="text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-100"
                          value={draft.email || ""}
                          onChange={(e) => setField("email", e.target.value)}
                          placeholder="Email"
                        />
                        <input
                          type="text"
                          className="text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-100"
                          value={draft.phoneNumber || ""}
                          onChange={(e) => setField("phoneNumber", e.target.value)}
                          placeholder="Phone"
                        />
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <Mail size={12} />
                          {draft.email || "No email"}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Phone size={12} />
                          {draft.phoneNumber || "No phone"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <StatusBadge status={status} />
            </div>

            <div>
              <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 space-y-4">
                <SectionLabel icon={<Calendar size={14} />} label="Stay" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <InfoItem label="Check-In" value={draft.checkInDate} editing={isEditing} type="date" onChange={(val) => setField("checkInDate", val)} />
                  <InfoItem label="Check-Out" value={draft.checkOutDate} editing={isEditing} type="date" onChange={(val) => setField("checkOutDate", val)} />
                  <InfoItem label="Check-In-Day" value={formatWeekdayLabel(draft.checkInDate)} editing={isEditing} type="date" onChange={(val) => setField("checkInDate", val)} />
                  <InfoItem label="Check-Out-Day" value={formatWeekdayLabel(draft.checkOutDate)} editing={isEditing} type="date" onChange={(val) => setField("checkOutDate", val)} />
                  <InfoItem label="Total Days Stay" value={totalStayDays} />
                  <InfoItem label="Approved By" value={approvedByName} />
                  <InfoItem label="Pax" value={draft.guestCount} editing={isEditing} type="number" onChange={(val) => setField("guestCount", Number(val) || 0)} />                  
                  <InfoItem label="Time In" value={draft.checkInTime} editing={isEditing} type="time" onChange={(val) => setField("checkInTime", val)} />
                  <InfoItem label="Time Out" value={draft.checkOutTime} editing={isEditing} type="time" onChange={(val) => setField("checkOutTime", val)} />
                  <InfoItem label="Adults" value={draft.adultCount || 0} editing={isEditing} type="number" onChange={(val) => setField("adultCount", Number(val) || 0)} />
                  <InfoItem label="Children" value={draft.childrenCount || 0} editing={isEditing} type="number" onChange={(val) => setField("childrenCount", Number(val) || 0)} />
                  <InfoItem label="Sleeping" value={draft.sleepingGuests || 0} editing={isEditing} type="number" onChange={(val) => setField("sleepingGuests", Number(val) || 0)} />
                  <InfoItem
                    label="Room"
                    value={
                      (assignedRoomIds.length > 0
                        ? (resortRooms || [])
                            .filter((room) => assignedRoomIds.includes(room.id))
                            .map((room) => room.name)
                            .join(", ")
                        : draft.roomName) || "Not assigned"
                    }
                  />
                </div>
                <div className={`rounded-xl px-3 py-2 border ${conflicts.length > 0 ? "border-rose-200 bg-rose-50" : "border-emerald-200 bg-emerald-50"}`}>
                  <p className="text-[10px] uppercase tracking-wider font-black text-slate-500">Availability Check</p>
                  <p className={`text-xs font-bold ${conflicts.length > 0 ? "text-rose-700" : "text-emerald-700"}`}>
                    {conflicts.length > 0
                      ? `${conflicts.length} conflicting booking(s) on shared room/date range.`
                      : "No detected schedule conflict for this range."}
                  </p>
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

            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 space-y-4">
              <SectionLabel icon={<Clock size={14} />} label="Status Audit" />
              {dbAudits.length === 0 && bookingFormAudits.length === 0 ? (
                <p className="text-xs text-slate-400">No audit entries yet.</p>
              ) : (
                <div className="space-y-2 max-h-72 overflow-auto pr-1">
                  {dbAudits.map((entry) => (
                    <div key={`db-${entry.id}`} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                      <p className="text-[10px] font-black uppercase text-slate-500">
                        {entry.old_status || "Unknown"} {"->"} {entry.new_status || "Unknown"}
                      </p>
                      <p className="text-xs font-semibold text-slate-700 mt-1">
                        {entry.actor_name || entry.actor_role || "system"}
                      </p>
                      <p className="text-[11px] text-slate-500">{new Date(entry.changed_at).toLocaleString()}</p>
                    </div>
                  ))}
                  {bookingFormAudits.map((entry, index) => (
                    <div key={`form-${index}`} className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-2">
                      <p className="text-[10px] font-black uppercase text-blue-600">
                        {entry.from || "Unknown"} {"->"} {entry.to || "Unknown"}
                      </p>
                      <p className="text-xs font-semibold text-blue-700 mt-1">
                        {entry.actorName || entry.actorRole || entry.actor || "owner"}
                      </p>
                      <p className="text-[11px] text-blue-500">{entry.at ? new Date(entry.at).toLocaleString() : "-"}</p>
                    </div>
                  ))}
                </div>
              )}
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
                    <img
                      src={proofPreviewUrl || draft.paymentProofUrl}
                      alt="Payment Receipt"
                      className="w-full h-40 object-cover group-hover:scale-105 transition-transform"
                      onError={resolveSignedProofUrl}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button variant="secondary" size="sm" className="rounded-full text-xs" onClick={() => window.open(proofPreviewUrl || draft.paymentProofUrl)}>
                        View Fullscreen <ExternalLink size={12} className="ml-2" />
                      </Button>
                    </div>
                  </div>
                  <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                    <p className="text-[10px] text-emerald-700 font-bold mb-1">Owner Verification</p>
                    {draft.paymentPendingApproval && Number(draft.pendingDownpayment || 0) > 0 ? (
                      <p className="text-[10px] text-emerald-700/80 mb-2">
                        Pending approval: PHP {Number(draft.pendingDownpayment || 0).toLocaleString()} ({draft.pendingPaymentMethod || "Pending"})
                      </p>
                    ) : null}
                    <button onClick={handleVerifyProof} className="flex items-center gap-2 text-xs font-black text-emerald-600 uppercase tracking-tighter">
                      {draft.paymentVerified ? <CheckCircle size={14} /> : <ShieldCheck size={14} />}
                      {draft.paymentVerified ? "Transaction Verified" : "Mark as Verified"}
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
                {draft.paymentPendingApproval && Number(draft.pendingDownpayment || 0) > 0 ? (
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-slate-400">Pending Approval</span>
                    <span className="font-bold text-amber-300">
                      PHP {Number(draft.pendingDownpayment || 0).toLocaleString()}
                    </span>
                  </div>
                ) : null}
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
            <SectionLabel icon={<Briefcase size={14} />} label="Assign Rooms" />
            <p className="text-xs text-slate-500">
              Select available rooms for this stay. Conflicting rooms are marked.
            </p>
            <div className="space-y-2 max-h-64 overflow-auto pr-1">
              {(resortRooms || []).map((room) => {
                const roomId = room.id;
                const selected = assignedRoomIds.includes(roomId);
                const conflict = isRoomConflicting(roomId);
                return (
                  <label
                    key={roomId}
                    className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2 cursor-pointer ${
                      selected ? "border-blue-300 bg-blue-50" : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleAssignedRoom(roomId)}
                      />
                      <div>
                        <p className="text-sm font-bold text-slate-800">{room.name || `Room ${roomId}`}</p>
                        <p className="text-[11px] text-slate-500">Sleeps {Number(room.guests || 0)} pax</p>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${
                        conflict ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {conflict ? "Conflict" : "Available"}
                    </span>
                  </label>
                );
              })}
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <p className="text-[10px] font-black uppercase text-slate-500">Assigned</p>
              <p className="text-xs text-slate-700 mt-1">
                {assignedRoomIds.length > 0
                  ? (resortRooms || [])
                      .filter((room) => assignedRoomIds.includes(room.id))
                      .map((room) => room.name)
                      .join(", ")
                  : "No room assigned yet."}
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
            <SectionLabel icon={<Mail size={14} />} label="Client Messaging" />
            {draft.notes ? (
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                <p className="text-[10px] font-black uppercase text-blue-700">Inquiry</p>
                <p className="text-xs text-slate-700 mt-1">{draft.notes}</p>
              </div>
            ) : null}
            {issues.length > 0 && (
              <div className="space-y-2">
                {issues.map((issue) => {
                  const resolved = String(issue.status || "").toLowerCase() === "resolved";
                  return (
                    <div
                      key={issue.id}
                      className={`p-3 rounded-xl border ${resolved ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-100"}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-[10px] font-black uppercase ${resolved ? "text-emerald-700" : "text-amber-700"}`}>
                          {issue.subject || "Concern"} {resolved ? "(Resolved)" : ""}
                        </p>
                        {!resolved ? (
                          <Button
                            variant="outline"
                            className="h-7 px-2 text-[10px] font-bold border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                            onClick={() => onResolveIssue?.(issue.id)}
                          >
                            Resolve
                          </Button>
                        ) : null}
                      </div>
                      <p className="text-xs text-slate-700 mt-1">{issue.message}</p>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="max-h-52 overflow-auto space-y-2">
              {messages.length === 0 ? (
                <p className="text-xs text-slate-400">No messages sent yet.</p>
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

      <BookingEditorActionBar
        showDecisionActions={showDecisionActions}
        status={status}
        draftStatus={draft.status}
        isEditing={isEditing}
        onDecline={() => handleSetStatus("Declined")}
        onBackOneStep={handleRevertStep}
        onApproveInquiry={handleApproveInquiry}
        onRequestPayment={handleRequestPayment}
        onConfirmStay={() => handleSetStatus("Confirmed")}
        onOpenEditInline={() => setIsEditing(true)}
        onSaveInline={handleSaveInline}
        onCancelInline={handleCancelInline}
        actionBusy={actionBusy}
      />
      <Toast/>
    </div>
  );
}
