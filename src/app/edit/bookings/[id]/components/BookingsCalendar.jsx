"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Calendar as CalendarIcon,
  Clock3,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import { useResort } from "@/components/useclient/ContextEditor";
import { useBookings } from "@/components/useclient/BookingsClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const GROUP_COLORS = ["bg-blue-600", "bg-orange-500", "bg-emerald-600", "bg-amber-500"];
const GROUP_COLOR_HEX = ["#2563eb", "#f97316", "#059669", "#f59e0b"];
const ARCHIVE_COLORS = ["bg-blue-800", "bg-orange-700", "bg-emerald-800", "bg-amber-800"];
const ARCHIVE_COLOR_HEX = ["#1e40af", "#c2410c", "#065f46", "#92400e"];

function getNormalizedStatus(booking) {
  return String(booking?.status || booking?.bookingForm?.status || "").toLowerCase();
}

function getStatusLabel(booking) {
  const normalized = getNormalizedStatus(booking);
  if (normalized.includes("ongoing")) return "Ongoing";
  if (normalized.includes("confirm")) return "Confirmed";
  if (normalized.includes("pending payment")) return "Pending Payment";
  if (normalized.includes("approved inquiry")) return "Approved Inquiry";
  if (normalized.includes("inquiry")) return "Inquiry";
  return booking?.status || booking?.bookingForm?.status || "Unknown";
}

function shouldShowOnCalendar(booking) {
  if (booking?.isArchived) return true;
  const normalizedStatus = getNormalizedStatus(booking);
  return !["pending checkout", "cancelled", "declined"].includes(normalizedStatus);
}

function isConfirmedStatus(booking) {
  const normalized = getNormalizedStatus(booking);
  return normalized.includes("confirm") || normalized.includes("ongoing");
}

function isPastStatus(booking) {
  if (booking?.isArchived) return true;
  const normalized = getNormalizedStatus(booking);
  return normalized.includes("checked out") || normalized.includes("checked-out") || normalized.includes("pending checkout");
}

function isInquiryStatus(booking) {
  const normalized = getNormalizedStatus(booking);
  if (normalized.includes("approved inquiry")) return false;
  return normalized.includes("inquiry") || normalized.includes("pending payment");
}

function getBookingStartDate(booking) {
  return booking?.startDate || booking?.bookingForm?.checkInDate || null;
}

function getBookingEndDate(booking) {
  return booking?.endDate || booking?.bookingForm?.checkOutDate || getBookingStartDate(booking);
}

export default function BookingCalendar({
  archivedBookings = [],
  archivedLoading = false,
  onLoadArchived,
}) {
  const { resort } = useResort();
  const { bookings } = useBookings();
  const router = useRouter();
  const params = useParams();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarMode, setCalendarMode] = useState("all"); // all | confirmed | inquiry | past
  const [search, setSearch] = useState("");
  const calendarToggleModes = [
    { id: "all", label: "All Bookings" },
    { id: "confirmed", label: "Confirmed / Ongoing" },
    { id: "inquiry", label: "Inquiry Status" },
  ];
  const toggleModeIndex = Math.max(
    0,
    calendarToggleModes.findIndex((mode) => mode.id === calendarMode)
  );
  const toggleCalendarMode = () => {
    const nextIndex = (toggleModeIndex + 1) % calendarToggleModes.length;
    setCalendarMode(calendarToggleModes[nextIndex].id);
  };

  const bookingList = useMemo(() => bookings || resort?.bookings || [], [bookings, resort?.bookings]);
  const archivedList = useMemo(() => archivedBookings || [], [archivedBookings]);
  const normalizedSearch = useMemo(() => search.trim().toLowerCase(), [search]);
  const matchesSearch = React.useCallback(
    (booking) => {
      if (!normalizedSearch) return true;
      const form = booking?.bookingForm || {};
      const fields = [
        booking?.stayingGuestName || form.stayingGuestName,
        booking?.guestName || form.guestName,
        booking?.agentName || form.agentName,
        booking?.roomName || form.roomName,
        booking?.startDate,
        booking?.endDate,
        booking?.status || form.status,
      ];
      return fields.some((value) => String(value || "").toLowerCase().includes(normalizedSearch));
    },
    [normalizedSearch]
  );
  const filteredBookingList = useMemo(
    () => bookingList.filter(matchesSearch),
    [bookingList, matchesSearch]
  );
  const filteredArchivedList = useMemo(
    () => archivedList.filter(matchesSearch),
    [archivedList, matchesSearch]
  );

  const getRangeForView = (baseDate) => {
    const start = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
    const end = new Date(baseDate.getFullYear(), baseDate.getMonth() + 2, 0);
    const startStr = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")}`;
    const endStr = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, "0")}-${String(end.getDate()).padStart(2, "0")}`;
    return { startStr, endStr };
  };

  useEffect(() => {
    if (!onLoadArchived) return;
    if (calendarMode !== "past") return;
    const { startStr, endStr } = getRangeForView(currentDate);
    onLoadArchived({ append: false, search, rangeStart: startStr, rangeEnd: endStr });
  }, [calendarMode, currentDate, onLoadArchived, search]);

  const getBookingColor = (booking) => {
    if (booking?.isArchived) {
      const index = filteredArchivedList.findIndex((entry) => entry.id?.toString() === booking.id?.toString());
      if (index < 0) return ARCHIVE_COLORS[0];
      return ARCHIVE_COLORS[index % ARCHIVE_COLORS.length];
    }
    const index = bookingList.findIndex((entry) => entry.id?.toString() === booking.id?.toString());
    if (index < 0) return GROUP_COLORS[0];
    return GROUP_COLORS[index % GROUP_COLORS.length];
  };
  const getBookingColorHex = (booking) => {
    if (booking?.isArchived) {
      const index = filteredArchivedList.findIndex((entry) => entry.id?.toString() === booking.id?.toString());
      if (index < 0) return ARCHIVE_COLOR_HEX[0];
      return ARCHIVE_COLOR_HEX[index % ARCHIVE_COLOR_HEX.length];
    }
    const index = bookingList.findIndex((entry) => entry.id?.toString() === booking.id?.toString());
    if (index < 0) return GROUP_COLOR_HEX[0];
    return GROUP_COLOR_HEX[index % GROUP_COLOR_HEX.length];
  };

  const getDateBookings = (dateString) => {
    const sourceList =
      calendarMode === "past"
        ? [
            ...filteredArchivedList,
            ...filteredBookingList.filter((booking) => isPastStatus(booking)),
          ]
        : filteredBookingList;
    return sourceList.filter((booking) => {
      if (!shouldShowOnCalendar(booking)) return false;
      if (calendarMode === "confirmed" && !isConfirmedStatus(booking)) return false;
      if (calendarMode === "inquiry" && !isInquiryStatus(booking)) return false;
      if (calendarMode === "past" && !isPastStatus(booking)) return false;
      const startDate = getBookingStartDate(booking);
      const endDate = getBookingEndDate(booking);
      if (!startDate) return false;
      if (!endDate) return startDate === dateString;
      return (
        startDate === dateString ||
        endDate === dateString ||
        (dateString > startDate && dateString < endDate)
      );
    });
  };

  const getBookingTooltip = (booking) => {
    const form = booking?.bookingForm || {};
    const checkIn = booking?.checkInTime || form.checkInTime || "--:--";
    const checkOut = booking?.checkOutTime || form.checkOutTime || "--:--";
    const guestName = booking?.stayingGuestName || form.stayingGuestName || booking?.guestName || form.guestName || "Guest";
    const agentName = booking?.agentName || form.agentName || "";
    const roomName = booking?.roomName || form.roomName || "";
    const roomCount = Number(form.roomCount || booking?.roomCount || 0);
    const inquirerType = String(booking?.inquirerType || form.inquirerType || "client").toLowerCase();
    const typeLabel = inquirerType === "agent" ? "Agent" : "Client";
    const startDate = getBookingStartDate(booking) || "--";
    const endDate = getBookingEndDate(booking) || startDate;
    const statusLabel = getStatusLabel(booking);
    const lines = [
      `Guest: ${guestName}`,
      agentName ? `Agent: ${agentName}` : null,
      roomName ? `Room: ${roomName}` : null,
      roomCount ? `Rooms: ${roomCount}` : null,
      `Dates: ${startDate} \u2192 ${endDate}`,
      `Times: ${checkIn} \u2192 ${checkOut}`,
      `Status: ${statusLabel} (${typeLabel})`,
    ].filter(Boolean);
    return lines.join("\n");
  };

  const getDateTooltip = (dateBookings) => {
    if (!dateBookings?.length) return "";
    return dateBookings
      .slice(0, 2)
      .map((booking) => `${getBookingTooltip(booking)}`)
      .join("\n\n");
  };

  const HoverTooltip = ({ text, children, wrapperClassName = "" }) => {
    if (!text) return children;
    const lines = String(text).split("\n");
    return (
      <div className={`relative group ${wrapperClassName}`}>
        {children}
        <div className="pointer-events-none absolute left-1/2 top-10 z-20 hidden w-72 -translate-x-1/2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] leading-4 text-slate-700 shadow-lg group-hover:block">
          <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-l border-t border-slate-200 bg-white" />
          {lines.map((line, idx) => (
            <div key={`${line}-${idx}`} className="block">
              {line}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const openBookingDetails = (bookingId) => {
    if (!bookingId) return;
    const resortId = Array.isArray(params?.id) ? params.id[0] : params?.id;
    if (!resortId) return;
    router.push(`/edit/bookings/${resortId}/booking-details/${bookingId}`);
  };

  const renderMonth = (monthOffset) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + monthOffset, 1);
    const month = date.getMonth();
    const year = date.getFullYear();
    const days = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    return (
      <div className="flex-1 min-w-[280px]">
        <h4 className="text-center font-bold text-slate-700 mb-4">{monthNames[month]} {year}</h4>
        <div className="grid grid-cols-7 gap-1">
          {["S", "M", "T", "W", "T", "F", "S"].map((dayName, index) => (
            <div key={`${dayName}-${index}`} className="text-center text-[10px] font-bold text-slate-400">{dayName}</div>
          ))}
          {Array.from({ length: firstDay }).map((_, index) => <div key={`empty-${index}`} />)}

          {Array.from({ length: days }).map((_, index) => {
            const day = index + 1;
            const dateString = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const dateBookings = getDateBookings(dateString);
            const orderedBookings = [...dateBookings].sort((a, b) => {
              const startA = getBookingStartDate(a) || "";
              const startB = getBookingStartDate(b) || "";
              if (startA !== startB) return startA.localeCompare(startB);
              return String(a.id || "").localeCompare(String(b.id || ""));
            });
            const booking = orderedBookings[0] || null;
            const secondaryBooking = orderedBookings[1] || null;
            const hasSplit = !!booking && !!secondaryBooking;
            const primaryColor = booking ? getBookingColor(booking) : "";
            const splitGradientStyle = hasSplit
              ? {
                  backgroundImage: `linear-gradient(90deg, ${getBookingColorHex(booking)} 0%, ${getBookingColorHex(booking)} 50%, ${getBookingColorHex(secondaryBooking)} 50%, ${getBookingColorHex(secondaryBooking)} 100%)`,
                }
              : undefined;

            const className = `h-9 w-full rounded-lg text-sm transition-all relative flex items-center justify-center
              ${booking ? "text-white cursor-pointer" : "hover:bg-slate-100 text-slate-600"} 
              ${getBookingStartDate(booking) === dateString ? "rounded-r-none" : ""} 
              ${getBookingEndDate(booking) === dateString ? "rounded-l-none" : ""} 
              ${booking && getBookingStartDate(booking) !== dateString && getBookingEndDate(booking) !== dateString ? "rounded-none opacity-80" : ""}
            `;

            const content = (
              <>
                {booking ? (
                  hasSplit ? (
                    <span
                      style={splitGradientStyle}
                      className={`absolute inset-0 rounded-[inherit] ${getBookingStartDate(booking) !== dateString && getBookingEndDate(booking) !== dateString ? "opacity-90" : ""}`}
                    />
                  ) : (
                    <span
                      className={`absolute inset-0 rounded-[inherit] ${primaryColor} ${getBookingStartDate(booking) !== dateString && getBookingEndDate(booking) !== dateString ? "opacity-90" : ""}`}
                    />
                  )
                ) : null}
                <span className="relative z-10">{day}</span>
              </>
            );

            return booking ? (
              <HoverTooltip key={day} text={getDateTooltip(dateBookings)} wrapperClassName="w-full">
                <button
                  type="button"
                  onClick={() => openBookingDetails(booking.id)}
                  className={className}
                >
                  {content}
                </button>
              </HoverTooltip>
            ) : (
              <HoverTooltip key={day} text={getDateTooltip(dateBookings)} wrapperClassName="w-full">
                <div className={className}>
                  {content}
                </div>
              </HoverTooltip>
            );
          })}
        </div>
      </div>
    );
  };

  if (!resort) {
    return (
      <Card className="max-w-4xl mx-auto p-6 bg-white shadow-xl rounded-3xl mt-8">
        <p className="text-sm text-slate-500">Loading booking calendar...</p>
      </Card>
    );
  }

  return (
    <Card className="w-full p-4 sm:p-8 bg-white shadow-2xl rounded-3xl sm:rounded-[2.5rem] border-none">
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6">
          <div>
            <h2 className="text-2xl font-black text-blue-600 flex items-center gap-3 uppercase tracking-tight">
              <CalendarIcon size={28} className="text-blue-600" />
              Bookings Calendar
            </h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Current and archived booking activity</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-9 px-3 text-[11px] font-bold"
              onClick={toggleCalendarMode}
            >
              {calendarToggleModes[toggleModeIndex]?.label || "All Bookings"}
            </Button>
            <Button
              type="button"
              variant={calendarMode === "past" ? "default" : "outline"}
              className="h-9 px-3 text-[11px] font-bold"
              onClick={() => setCalendarMode((prev) => (prev === "past" ? "all" : "past"))}
            >
              Past Bookings
            </Button>
          </div>
        
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full max-w-md">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search guest, agent, or date"
              className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs font-semibold text-slate-600"
            />
          </div>
        </div>

        {/* THE CALENDAR GRID - Now much larger */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 xl:gap-12 bg-slate-50/50 p-4 sm:p-8 rounded-[2rem] border border-slate-100 relative">
          <button
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
            className="absolute left-2 top-2 md:-left-4 md:top-1/2 md:-translate-y-1/2 h-10 w-10 md:h-12 md:w-12 flex items-center justify-center bg-white shadow-xl rounded-full hover:scale-110 transition-all z-20 border border-slate-100"
          >
            <ChevronLeft size={20} />
          </button>
          
          <div className="scale-100 md:scale-105 origin-top mt-12 md:mt-0">
            {renderMonth(0)}
          </div>
          <div className="scale-100 md:scale-105 origin-top">
            {renderMonth(1)}
          </div>
          
          <button
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
            className="absolute right-2 top-2 md:-right-4 md:top-1/2 md:-translate-y-1/2 h-10 w-10 md:h-12 md:w-12 flex items-center justify-center bg-white shadow-xl rounded-full hover:scale-110 transition-all z-20 border border-slate-100"
          >
            <ChevronRight size={20} />
          </button>
        </div>
        
        {/* Active Ranges Summary at bottom of calendar */}
        {/* ... (keep your existing active ranges list) */}
      </div>
        <div className="space-y-2">
          <p className="my-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Resort Booking Ranges</p>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {(calendarMode === "past" ? [...filteredArchivedList, ...filteredBookingList] : filteredBookingList)
              .filter((booking) => shouldShowOnCalendar(booking))
              .filter((booking) => {
                if (calendarMode === "confirmed") return isConfirmedStatus(booking);
                if (calendarMode === "inquiry") return isInquiryStatus(booking);
                if (calendarMode === "past") return isPastStatus(booking);
                return true;
              })
              .map((booking) => {
                const checkIn = booking?.checkInTime || booking?.bookingForm?.checkInTime || "--:--";
                const checkOut = booking?.checkOutTime || booking?.bookingForm?.checkOutTime || "--:--";
                const guestName =
                  booking?.stayingGuestName ||
                  booking?.bookingForm?.stayingGuestName ||
                  booking?.guestName ||
                  booking?.bookingForm?.guestName ||
                  "Guest";
                const roomLabel = getStatusLabel(booking);

                return (
                    <div
                      onClick={() => openBookingDetails(booking.id)}
                      className="min-w-[220px] max-w-[260px] flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer border border-transparent bg-slate-50 opacity-70"
                    >
                      <div className={`w-3 h-3 rounded-full ${getBookingColor(booking)}`} />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 uppercase">{roomLabel}</span>
                        <span className="text-xs font-black text-slate-800">{guestName}</span>
                        <span className="text-xs font-bold text-slate-700">{getBookingStartDate(booking) || "..."} - {getBookingEndDate(booking) || "..."}</span>
                        <span className="text-[10px] text-slate-500 flex items-center gap-1"><Clock3 size={10} /> {checkIn} to {checkOut}</span>
                      </div>
                    </div>
                );
              })}
          </div>
          {calendarMode === "past" && archivedLoading ? (
            <div className="mt-4 text-xs text-slate-500">Loading archived bookings...</div>
          ) : null}
        </div>

    </Card>
  );
}
