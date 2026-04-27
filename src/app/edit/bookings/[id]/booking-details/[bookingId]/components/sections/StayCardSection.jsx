import React, { useState } from "react";
import { User, Mail, Phone, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InfoItem, SectionLabel } from "../BookingEditorAtoms";
import DateRangeField from "@/app/(main)/components/search/calendar/DateRangeField";

export default function StayCardSection({
  isEditing,
  draft,
  setField,
  totalStayDays,
  approvedByName,
  assignedRoomIds,
  resortRooms,
  conflicts,
  formatWeekdayLabel,
  onOpenConflict,
  onOpenCalendar,
  isStayRangeInvalid = false,
  blockedRanges = [],
}) {
  const hasConflicts = conflicts.length > 0;
  const inquirerType = (draft.inquirerType || "client").toString().toLowerCase();
  const guestDisplayName = draft.stayingGuestName || draft.guestName || "Guest";
  const contactEmail = draft.email || "No email";
  const contactPhone = draft.phoneNumber || "No phone";
  const guestEmail = draft.stayingGuestEmail || "No email";
  const guestPhone = draft.stayingGuestPhone || "No phone";
  const parseUtcDate = (value) => (value ? new Date(`${value}T00:00:00Z`) : null);
  const rangeStart = parseUtcDate(draft.checkInDate);
  const rangeEnd = parseUtcDate(draft.checkOutDate);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const formatFullDate = (date) =>
    date
      ? date.toLocaleDateString("default", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "";
  const formatWeekday = (date) =>
    date ? date.toLocaleDateString("default", { weekday: "short" }) : "";
  const formatLongDate = (value) => {
    if (!value) return "";
    const parsed = new Date(`${value}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime12h = (timeValue) => {
    if (!timeValue) return "";
    const [rawHours, rawMinutes] = String(timeValue).split(":");
    const hours = Number(rawHours);
    if (!Number.isFinite(hours)) return timeValue;
    const minutes = rawMinutes ?? "00";
    const suffix = hours >= 12 ? "pm" : "am";
    const hour12 = hours % 12 || 12;
    return `${hour12}:${minutes} ${suffix}`;
  };

  const toIsoDate = (date) => (date ? date.toISOString().slice(0, 10) : "");
  const setCheckInDate = (date) => {
    if (!date) {
      setField("checkInDate", "");
      setField("checkOutDate", "");
      return;
    }
    const start = rangeStart;
    const end = rangeEnd;
    if (!start && end && date > end) {
      setField("checkInDate", toIsoDate(date));
      setField("checkOutDate", toIsoDate(date));
      return;
    }
    if (start && end && date > end) {
      setField("checkInDate", toIsoDate(date));
      setField("checkOutDate", toIsoDate(date));
      return;
    }
    if (start && end) {
      setField("checkInDate", toIsoDate(date));
      setField("checkOutDate", toIsoDate(end));
      return;
    }
    if (!start || date <= start) {
      const nextStart = date;
      const nextEnd = start && start >= date ? start : end;
      setField("checkInDate", toIsoDate(nextStart));
      setField("checkOutDate", toIsoDate(nextEnd || nextStart));
      return;
    }
    setField("checkInDate", toIsoDate(start));
    setField("checkOutDate", toIsoDate(date));
  };
  const setCheckOutDate = (date) => {
    if (!date) {
      setField("checkOutDate", "");
      return;
    }
    const start = rangeStart;
    const end = rangeEnd;
    if (!start) {
      setField("checkInDate", toIsoDate(date));
      setField("checkOutDate", "");
      return;
    }
    const nextStart = date < start ? date : start;
    const nextEnd = date < start ? start : date;
    if (start && end) {
      if (date < start) {
        setField("checkInDate", toIsoDate(date));
        setField("checkOutDate", toIsoDate(start));
      } else {
        setField("checkInDate", toIsoDate(start));
        setField("checkOutDate", toIsoDate(date));
      }
      return;
    }
    setField("checkInDate", toIsoDate(nextStart));
    setField("checkOutDate", toIsoDate(nextEnd));
  };

  return (
    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 space-y-4">
      <SectionLabel icon={<Calendar size={14} />} label="Stay" />
      {inquirerType === "agent" ? (
        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 text-slate-500 flex items-center justify-center">
              <User size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                Guest Name
              </p>
              {isEditing ? (
                <>
                  <input
                    className="text-lg font-black text-slate-900 tracking-tight border-b border-slate-200 outline-none bg-transparent"
                    value={draft.stayingGuestName || ""}
                    onChange={(e) => setField("stayingGuestName", e.target.value)}
                    placeholder="Guest name"
                  />
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="email"
                      className="text-xs font-medium rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-100"
                      value={draft.stayingGuestEmail || ""}
                      onChange={(e) => setField("stayingGuestEmail", e.target.value)}
                      placeholder="Guest email"
                    />
                    <input
                      type="text"
                      className="text-xs font-medium rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-100"
                      value={draft.stayingGuestPhone || ""}
                      onChange={(e) => setField("stayingGuestPhone", e.target.value)}
                      placeholder="Guest phone"
                    />
                  </div>
                </>
              ) : (
                <>
                  <p className="text-lg font-black text-slate-900 truncate">{guestDisplayName}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <Mail size={12} />
                      {guestEmail}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Phone size={12} />
                      {guestPhone}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}
      <div className={`rounded-xl px-3 py-2 border ${conflicts.length > 0 ? "border-rose-200 bg-rose-50" : "border-emerald-200 bg-emerald-50"}`}>
        <p className="text-[10px] uppercase tracking-wider font-black text-slate-500">Availability Check</p>
        <p className={`text-xs font-bold ${conflicts.length > 0 ? "text-rose-700" : "text-emerald-700"}`}>
          {conflicts.length > 0
            ? `${conflicts.length} conflicting booking(s) on shared room/date range.`
            : "No detected schedule conflict for this range."}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {hasConflicts && onOpenConflict ? (
            <Button
              type="button"
              variant="outline"
              className="flex items-center justify-center h-7 px-2 text-[10px] font-bold border-rose-200 text-rose-700 hover:bg-rose-50"
              onClick={onOpenConflict}
            >
              Open Conflict
            </Button>
          ) : null}
          {onOpenCalendar ? (
            <Button
              type="button"
              variant="outline"
              className="flex items-center justify-center h-7 px-2 text-[10px] font-bold"
              onClick={onOpenCalendar}
            >
              View Availability Calendar
            </Button>
          ) : null}
        </div>
      </div>
      {isEditing ? (
        <div className="mt-3">
          <DateRangeField
            startDate={rangeStart}
            endDate={rangeEnd}
            setStartDate={setCheckInDate}
            setEndDate={setCheckOutDate}
            activeDropdown={activeDropdown}
            setActiveDropdown={setActiveDropdown}
            formatFullDate={formatFullDate}
            formatWeekday={formatWeekday}
            blockedRanges={blockedRanges}
            inline
            autoAdvance={false}
          />
        </div>
      ) : null}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {!isEditing ? (
          <>
            <InfoItem label="Check-In Date" value={formatLongDate(draft.checkInDate)} />
            <InfoItem label="Check-Out Date" value={formatLongDate(draft.checkOutDate)} />
            <InfoItem label="Check-In Day" value={formatWeekdayLabel(draft.checkInDate)} />
            <InfoItem label="Check-Out Day" value={formatWeekdayLabel(draft.checkOutDate)} />
          </>
        ) : null}
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
        <InfoItem label="Time In" value={isEditing ? draft.checkInTime : formatTime12h(draft.checkInTime)} editing={isEditing} type="time" onChange={(val) => setField("checkInTime", val)} />
        <InfoItem label="Time Out" value={isEditing ? draft.checkOutTime : formatTime12h(draft.checkOutTime)} editing={isEditing} type="time" onChange={(val) => setField("checkOutTime", val)} />
        <InfoItem label="Adults" value={draft.adultCount || 0} editing={isEditing} type="number" onChange={(val) => setField("adultCount", Number(val) || 0)} />
        <InfoItem label="Children" value={draft.childrenCount || 0} editing={isEditing} type="number" onChange={(val) => setField("childrenCount", Number(val) || 0)} />
        <InfoItem label="Approved By" value={approvedByName} />
      </div>
      {isStayRangeInvalid ? (
        <p className="text-[11px] font-bold text-rose-600">
          Check-out must be the same day or after check-in.
        </p>
      ) : null}
    </div>
  );
}
