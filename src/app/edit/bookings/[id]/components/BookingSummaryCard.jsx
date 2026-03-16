"use client";

import React from "react";

const formatDateMeta = (value) => {
  if (!value) return { dateLabel: "-" };
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return { dateLabel: value };
  return {
    dateLabel: date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
  };
};

const formatTime12h = (timeValue) => {
  if (!timeValue) return "--:--";
  const [rawHours, rawMinutes] = String(timeValue).split(":");
  const hours = Number(rawHours);
  if (!Number.isFinite(hours)) return timeValue;
  const minutes = rawMinutes ?? "00";
  const suffix = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  return `${hour12}:${minutes} ${suffix}`;
};

const toneStyles = {
  slate: {
    card: "border-slate-200 bg-slate-50/70",
    badge: "bg-slate-700 text-white",
  },
  rose: {
    card: "border-rose-200 bg-rose-50/60",
    badge: "bg-rose-600 text-white",
  },
  blue: {
    card: "border-slate-200 bg-slate-50/60",
    badge: "bg-blue-600/10 text-blue-700",
  },
};

export default function BookingSummaryCard({
  statusLabel,
  roomLabel,
  inquirerType = "client",
  guestName,
  agentName,
  contactEmail,
  contactPhone,
  clientEmail,
  clientPhone,
  paxTotal,
  adultCount,
  childrenCount,
  sleepingGuests,
  checkInDate,
  checkOutDate,
  checkInTime,
  checkOutTime,
  showIssue = false,
  actions = null,
  tone = "slate",
  statusBadgeClassName = "",
}) {
  const styles = toneStyles[tone] || toneStyles.slate;
  const checkInMeta = formatDateMeta(checkInDate);
  const checkOutMeta = formatDateMeta(checkOutDate);
  const checkInLabel = formatTime12h(checkInTime);
  const checkOutLabel = formatTime12h(checkOutTime);
  const showClientLine = inquirerType === "agent" && (clientEmail || clientPhone);

  return (
    <div className={`p-3 rounded-2xl border ${styles.card}`}>
      <div className="flex flex-col lg:flex-row lg:items-stretch gap-3">
        <div className="min-w-0 lg:flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-tight inline-flex items-center gap-1 ${styles.badge} ${statusBadgeClassName}`.trim()}>
              {statusLabel}
            </span>
            {roomLabel ? (
              <span className="text-[10px] font-black px-2 py-0.5 bg-white/80 rounded-md text-slate-600 uppercase tracking-tight">
                {roomLabel}
              </span>
            ) : null}
            {showIssue ? (
              <span className="text-[10px] font-black bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">
                Issue
              </span>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${
                inquirerType === "agent"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-emerald-100 text-emerald-700"
              }`}
            >
              {inquirerType === "agent" ? "Agent" : "Client"}
            </span>
            <span className="text-sm font-black text-slate-900">{guestName || "Guest"}</span>
            {agentName ? (
              <span className="text-[11px] text-slate-600">Agent: {agentName}</span>
            ) : null}
          </div>

          <div className="text-[11px] text-slate-500">
            Contact: {contactEmail || "No email"}{contactPhone ? ` - ${contactPhone}` : ""}
            {showClientLine ? (
              <span> | Client: {clientEmail || "No email"}{clientPhone ? ` - ${clientPhone}` : ""}</span>
            ) : null}
          </div>
        </div>

        <div className="lg:flex-1 flex flex-col justify-center">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] text-slate-600 bg-white/80 px-2 py-1 rounded-full">
              Pax {paxTotal} - Adults {adultCount} - Children {childrenCount} - Sleeping {sleepingGuests}
            </span>
            <div className="rounded-md bg-white/60 px-2.5 py-2 min-w-[140px]">
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-500">Check-In</p>
              <p className="text-[11px] font-semibold text-slate-700">{checkInMeta.dateLabel}</p>
              <p className="text-[10px] uppercase tracking-wide text-slate-500">{checkInLabel}</p>
            </div>
            <div className="rounded-md bg-white/60 px-2.5 py-2 min-w-[140px]">
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-500">Check-Out</p>
              <p className="text-[11px] font-semibold text-slate-700">{checkOutMeta.dateLabel}</p>
              <p className="text-[10px] uppercase tracking-wide text-slate-500">{checkOutLabel}</p>
            </div>
          </div>
        </div>

        {actions ? (
          <div className="flex items-center justify-between lg:flex-col lg:justify-center lg:items-center lg:w-56 gap-2 lg:border-l lg:border-white/60 lg:pl-4">
            {actions}
          </div>
        ) : null}
      </div>
    </div>
  );
}
