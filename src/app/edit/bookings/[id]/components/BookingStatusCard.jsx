import React from "react";
import { ArrowRightLeft, Mail, Phone, User } from "lucide-react";

export default function BookingStatusCard({
  statusLabel,
  statusIcon: StatusIcon,
  statusBadgeClassName = "",
  roomLabel,
  badges = [],
  inquirerType = "client",
  guestName,
  clientName,
  agentName,
  contactEmail,
  contactPhone,
  clientEmail,
  clientPhone,
  showClientContact = false,
  checkInDateLabel,
  checkOutDateLabel,
  checkInTimeLabel,
  checkOutTimeLabel,
  paxTotal = 0,
  adultCount = 0,
  childrenCount = 0,
  sleepingGuests = 0,
  containerClassName = "",
  actionSlot,
}) {
  const isAgent = inquirerType === "agent";
  const timeRangeLabel = checkInTimeLabel && checkOutTimeLabel
    ? `${checkInTimeLabel} : ${checkOutTimeLabel}`
    : "";
  const paxLabel = `Pax ${paxTotal} - Adults ${adultCount} - Children ${childrenCount} - Sleeping ${sleepingGuests}`;

  return (
    <div className={`p-3 rounded-2xl border ${containerClassName}`}>
      <div className="flex flex-col lg:flex-row lg:items-stretch gap-3">
        <div className="min-w-0 lg:flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-tight inline-flex items-center gap-1 ${statusBadgeClassName}`}
            >
              {StatusIcon ? <StatusIcon size={10} /> : null}
              {statusLabel}
            </span>
            {roomLabel ? (
              <span className="text-[10px] font-black px-2 py-0.5 bg-white/80 rounded-md text-slate-600 uppercase tracking-tight">
                {roomLabel}
              </span>
            ) : null}
            {checkInDateLabel && checkOutDateLabel ? (
              <span className="text-[10px] font-black px-2 py-0.5 bg-white/80 rounded-md text-slate-600 uppercase tracking-tight inline-flex items-center gap-1">
                {checkInDateLabel}
                <ArrowRightLeft size={10} />
                {checkOutDateLabel}
              </span>
            ) : null}
            {timeRangeLabel ? (
              <span className="text-[10px] font-black px-2 py-0.5 bg-white/80 rounded-md text-slate-600 uppercase tracking-tight">
                {timeRangeLabel}
              </span>
            ) : null}
            {badges.map((badge, index) => (
              <React.Fragment key={index}>{badge}</React.Fragment>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${
                isAgent ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
              }`}
            >
              {isAgent ? "Agent" : "Client"}
            </span>
            <span className="text-sm font-black text-slate-900">{guestName}</span>
            {isAgent && agentName ? (
              <span className="text-[11px] text-slate-600">Agent: {agentName}</span>
            ) : null}
          </div>

          <div className="text-[11px] text-slate-500 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                {isAgent ? "Agent Contacts" : "Contact"}
              </span>
              <span className="inline-flex items-center gap-1">
                <Mail size={12} />
                {contactEmail || "No email"}
              </span>
              <span className="inline-flex items-center gap-1">
                <Phone size={12} />
                {contactPhone || "No phone"}
              </span>
            </div>
            {isAgent && showClientContact ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1">
                  <User size={12} />
                  Client Name: {clientName || guestName}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Mail size={12} />
                  {clientEmail || "No email"}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Phone size={12} />
                  {clientPhone || "No phone"}
                </span>
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <span className="text-[10px] text-slate-600 bg-white/80 px-2 py-1 rounded-full">
            {paxLabel}
          </span>
        </div>

        <div className="flex items-center justify-end flex-wrap gap-2 lg:w-56 lg:border-l lg:border-white/60 lg:pl-4">
          {actionSlot}
        </div>
      </div>
    </div>
  );
}
