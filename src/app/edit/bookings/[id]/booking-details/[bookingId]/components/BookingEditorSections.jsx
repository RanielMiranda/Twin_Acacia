"use client";

import React from "react";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  Image as ImageIcon,
  ExternalLink,
  ShieldCheck,
  CheckCircle,
  Clock,
  ReceiptText,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildSupportConversationItems, getSupportConversationLabel, isResolvedConversationItem } from "@/lib/supportConversation";
import { InfoItem, SectionLabel, StatusBadge } from "./BookingEditorAtoms";

function getAuditActorLabel(entry) {
  if (entry?.actor_name) return entry.actor_name;
  if (entry?.actorRole) return entry.actorRole;
  return entry?.actor || "system";
}

export function ClientCardSection({ resortName, isEditing, draft, setField, status }) {
  return (
    <div className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
      <div className="flex items-start sm:items-center gap-4 sm:gap-6">
        <div className="h-16 w-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-100">
          <User size={28} />
        </div>
        <div>
          <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mb-1">{resortName}</p>
          {isEditing ? (
            <input
              className="text-3xl font-black text-slate-900 tracking-tight border-b border-slate-200 outline-none"
              value={draft.guestName || ""}
              onChange={(e) => setField("guestName", e.target.value)}
            />
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
  );
}

export function StayCardSection({
  isEditing,
  draft,
  setField,
  totalStayDays,
  approvedByName,
  assignedRoomIds,
  resortRooms,
  conflicts,
  formatWeekdayLabel,
}) {
  return (
    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 space-y-4">
      <SectionLabel icon={<Calendar size={14} />} label="Stay" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <InfoItem label="Check-In" value={draft.checkInDate} editing={isEditing} type="date" onChange={(val) => setField("checkInDate", val)} />
        <InfoItem label="Check-Out" value={draft.checkOutDate} editing={isEditing} type="date" onChange={(val) => setField("checkOutDate", val)} />
        <InfoItem label="Check-In-Day" value={formatWeekdayLabel(draft.checkInDate)} editing={isEditing} type="date" onChange={(val) => setField("checkInDate", val)} />
        <InfoItem label="Check-Out-Day" value={formatWeekdayLabel(draft.checkOutDate)} editing={isEditing} type="date" onChange={(val) => setField("checkOutDate", val)} />
        <InfoItem label="Total Days Stay" value={totalStayDays} />  
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
        <InfoItem label="Pax" value={draft.guestCount} editing={isEditing} type="number" onChange={(val) => setField("guestCount", Number(val) || 0)} />
        <InfoItem label="Sleeping" value={draft.sleepingGuests || 0} editing={isEditing} type="number" onChange={(val) => setField("sleepingGuests", Number(val) || 0)} />
        <InfoItem label="Time In" value={draft.checkInTime} editing={isEditing} type="time" onChange={(val) => setField("checkInTime", val)} />
        <InfoItem label="Time Out" value={draft.checkOutTime} editing={isEditing} type="time" onChange={(val) => setField("checkOutTime", val)} />
        <InfoItem label="Adults" value={draft.adultCount || 0} editing={isEditing} type="number" onChange={(val) => setField("adultCount", Number(val) || 0)} />
        <InfoItem label="Children" value={draft.childrenCount || 0} editing={isEditing} type="number" onChange={(val) => setField("childrenCount", Number(val) || 0)} />
        <InfoItem label="Approved By" value={approvedByName} />        
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
  );
}

export function AddOnsCardSection({ draft }) {
  return (
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
  );
}

export function StatusAuditCardSection({ dbAudits, bookingFormAudits }) {
  return (
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
                {getAuditActorLabel(entry)}
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
                {getAuditActorLabel(entry)}
              </p>
              <p className="text-[11px] text-blue-500">{entry.at ? new Date(entry.at).toLocaleString() : "-"}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ProofCardSection({
  hasProof,
  proofPreviewUrl,
  draft,
  resolveSignedProofUrl,
  handleVerifyProof,
  resortPaymentImageUrl,
}) {
  const hasResortPaymentImage = !!resortPaymentImageUrl && typeof resortPaymentImageUrl === "string";
  return (
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

      {hasResortPaymentImage && (
        <div className="mb-6 p-3 rounded-xl border border-blue-100 bg-blue-50/50">
          <p className="text-[10px] font-black text-blue-700 uppercase tracking-wider mb-2">Payment reference (GCash / Bank)</p>
          <a
            href={resortPaymentImageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block relative group overflow-hidden rounded-xl border border-slate-100 max-w-[200px]"
          >
            <img
              src={getTransformedSupabaseImageUrl(resortPaymentImageUrl, { width: 400, quality: 85, format: "webp" })}
              alt="Payment reference"
              className="w-full h-28 object-cover group-hover:scale-105 transition-transform"
            />
            <span className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
              <ExternalLink size={16} className="text-white" />
            </span>
          </a>
        </div>
      )}

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
  );
}

export function PaymentCardSection({ isEditing, draft, setField, balance, statusPhases, paymentChannels, status }) {
  return (
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
        {status !== "Confirmed" && draft.paymentPendingApproval && Number(draft.pendingDownpayment || 0) > 0 ? (
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
              {paymentChannels.map((channel) => (
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
              {statusPhases.map((phase) => (
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
  );
}

export function AssignRoomsCardSection({
  resortRooms,
  assignedRoomIds,
  toggleAssignedRoom,
  isRoomConflicting,
}) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
      <SectionLabel icon={<Briefcase size={14} />} label="Assign Rooms" />
      <p className="text-xs text-slate-500">Select available rooms for this stay. Conflicting rooms are marked.</p>
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
                <input type="checkbox" checked={selected} onChange={() => toggleAssignedRoom(roomId)} />
                <div>
                  <p className="text-sm font-bold text-slate-800">{room.name || `Room ${roomId}`}</p>
                  <p className="text-[11px] text-slate-500">Sleeps {Number(room.guests || 0)} pax</p>
                </div>
              </div>
              <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${
                conflict ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"
              }`}>
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
            ? (resortRooms || []).filter((room) => assignedRoomIds.includes(room.id)).map((room) => room.name).join(", ")
            : "No room assigned yet."}
        </p>
      </div>
    </div>
  );
}

export function MessagesInboxCardSection({
  issues,
  onResolveIssue,
  messages,
  onRefreshMessages,
  refreshingMessages = false,
  ownerReply,
  setOwnerReply,
  onSendReply,
}) {
  const conversationItems = buildSupportConversationItems({
    messages,
    issues: (issues || []).map((issue) => ({
      ...issue,
      issueId: issue.id,
    })),
    newestFirst: true,
    issueFallbackSubject: "Concern",
  });

  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
      <div className="flex items-center justify-between gap-3">
        <SectionLabel icon={<Mail size={14} />} label="Client Messaging" />
        <Button
          type="button"
          variant="outline"
          className="h-8 px-3 text-[11px] font-bold flex items-center justify-center"
          onClick={onRefreshMessages}
        >
          <RefreshCw size={12} className={`mr-2 ${refreshingMessages ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>
      <div className="max-h-52 overflow-auto space-y-2">
        {conversationItems.length === 0 ? (
          <p className="text-xs text-slate-400">No messages sent yet.</p>
        ) : (
          conversationItems.map((item) => {
            const isOwner = item.senderRole === "owner";
            const isIssue = item.kind === "issue";
            const resolved = isResolvedConversationItem(item);
            return (
              <div
                key={item.id}
                className={`p-2.5 rounded-xl text-xs ${
                  isOwner
                    ? "bg-blue-50 text-blue-700 ml-8"
                    : isIssue
                      ? resolved
                        ? "bg-emerald-50 text-emerald-700 mr-8 border border-emerald-200"
                        : "bg-amber-50 text-amber-700 mr-8 border border-amber-200"
                      : "bg-slate-50 text-slate-700 mr-8"
                }`}
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <p className="font-black uppercase text-[9px]">{getSupportConversationLabel(item)}</p>
                  {isIssue && !resolved ? (
                    <Button
                      type="button"
                      variant="outline"
                      className="h-6 px-2 text-[10px] font-bold border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                      onClick={() => onResolveIssue?.(item.issueId)}
                    >
                      Resolve
                    </Button>
                  ) : null}
                </div>
                <p>{item.body}</p>
              </div>
            );
          })
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
  );
}
