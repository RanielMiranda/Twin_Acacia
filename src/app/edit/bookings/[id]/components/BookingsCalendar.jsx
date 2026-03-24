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
  const isInquiry = isInquiryStatus(booking);
  const isConfirmed = isConfirmedStatus(booking);
  const isPendingCheckout = normalizedStatus.includes("pending checkout");
  return (isInquiry || isConfirmed || isPendingCheckout) && !normalizedStatus.includes("declined");
}

function isConfirmedStatus(booking) {
  const normalized = getNormalizedStatus(booking);
  return normalized.includes("confirm") || normalized.includes("ongoing");
}

function isPastStatus(booking) {
  if (booking?.isArchived) return true;
  const normalized = getNormalizedStatus(booking);
  return normalized.includes("checked out") || normalized.includes("checked-out");
}

function isInquiryStatus(booking) {
  const normalized = getNormalizedStatus(booking);
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
  const [searchInput, setSearchInput] = useState("");
  const [monthInput, setMonthInput] = useState("");
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [modalDayLabel, setModalDayLabel] = useState("");
  const [modalBookings, setModalBookings] = useState([]);
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

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(pointer: coarse)");
    const update = () => setIsTouchDevice(!!media.matches);
    update();
    if (media.addEventListener) {
      media.addEventListener("change", update);
      return () => media.removeEventListener("change", update);
    }
    media.addListener(update);
    return () => media.removeListener(update);
  }, []);

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
      if (calendarMode === "past") {
        if (!isPastStatus(booking)) return false;
      } else if (!shouldShowOnCalendar(booking)) {
        return false;
      }
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
    const showStatus = !isPastStatus(booking);
    const lines = [
      `Guest: ${guestName}`,
      agentName ? `Agent: ${agentName}` : null,
      roomName ? `Room: ${roomName}` : null,
      roomCount ? `Rooms: ${roomCount}` : null,
      `Dates: ${startDate} \u2192 ${endDate}`,
      `Times: ${checkIn} \u2192 ${checkOut}`,
      showStatus ? `Status: ${statusLabel} (${typeLabel})` : null,
    ].filter(Boolean);
    return lines.join("\n");
  };

  const getDateTooltipCards = (dateBookings) => {
    if (!dateBookings?.length) return [];
    return dateBookings.slice(0, 2);
  };

  const HoverTooltip = ({ text, content, children, wrapperClassName = "" }) => {
    if (!text && !content) return children;
    const lines = text ? String(text).split("\n") : [];
    return (
      <div className={`relative group ${wrapperClassName}`}>
        {children}
        <div className="pointer-events-none absolute left-1/2 top-10 z-50 hidden -translate-x-1/2 px-3 py-2 text-[11px] leading-4 text-slate-700 group-hover:block">
          <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-l border-t border-slate-200 bg-white" />
          {content ? (
            content
          ) : (
            lines.map((line, idx) => (
              <div key={`${line}-${idx}`} className="block">
                {line}
              </div>
            ))
          )}
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

  const applySearch = () => {
    setSearch(searchInput);
    if (calendarMode === "past" && onLoadArchived) {
      const { startStr, endStr } = getRangeForView(currentDate);
      onLoadArchived({ append: false, search: searchInput, rangeStart: startStr, rangeEnd: endStr });
    }
  };

  const jumpToMonth = () => {
    if (!monthInput) return;
    const [year, month] = monthInput.split("-").map((val) => Number(val));
    if (!year || !month) return;
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const openDayModal = (dateString, dayBookings) => {
    if (!Array.isArray(dayBookings) || dayBookings.length === 0) return;
    setModalDayLabel(dateString);
    setModalBookings(dayBookings);
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
            const primaryColor = booking ? getBookingColor(booking) : "";
            const hasSplit = !!booking && !!secondaryBooking;
            const canOpenDetails = (target) => {
              if (!target) return false;
              if (calendarMode === "past") return false;
              if (target.isArchived) return false;
              return true;
            };

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
                      className={`absolute inset-0 rounded-[inherit] ${getBookingStartDate(booking) !== dateString && getBookingEndDate(booking) !== dateString ? "opacity-90" : ""}`}
                      style={{
                        backgroundImage: `linear-gradient(90deg, ${getBookingColorHex(booking)} 0%, ${getBookingColorHex(booking)} 50%, ${getBookingColorHex(secondaryBooking)} 50%, ${getBookingColorHex(secondaryBooking)} 100%)`,
                      }}
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
              <div key={day} className="w-full relative">
                <HoverTooltip
                  wrapperClassName="w-full"
                  content={
                    getDateTooltipCards(orderedBookings).length > 0 ? (
                      <div
                        className={`grid gap-2 ${
                          getDateTooltipCards(orderedBookings).length === 1
                            ? "grid-cols-1 min-w-[260px] max-w-[340px]"
                            : "grid-cols-1 sm:grid-cols-2 min-w-[260px] max-w-[420px]"
                        }`}
                      >
                        {getDateTooltipCards(orderedBookings).map((entry) => (
                          <div key={entry.id} className="rounded-md border border-slate-200 bg-white p-2">
                            {getBookingTooltip(entry)
                              .split("\n")
                              .map((line, idx) => (
                                <div key={`${entry.id}-line-${idx}`} className="block">
                                  {line}
                                </div>
                              ))}
                          </div>
                        ))}
                      </div>
                    ) : null
                  }
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (isTouchDevice) {
                        openDayModal(dateString, orderedBookings);
                        return;
                      }
                      if (canOpenDetails(booking)) openBookingDetails(booking.id);
                    }}
                    className={className}
                  >
                    {content}
                  </button>
                </HoverTooltip>
              </div>
            ) : (
              <HoverTooltip
                key={day}
                wrapperClassName="w-full"
                content={
                  getDateTooltipCards(dateBookings).length > 0 ? (
                    <div
                      className={`grid gap-2 ${
                        getDateTooltipCards(dateBookings).length === 1
                          ? "grid-cols-1 min-w-[260px] max-w-[340px]"
                          : "grid-cols-1 sm:grid-cols-2 min-w-[260px] max-w-[420px]"
                      }`}
                    >
                      {getDateTooltipCards(dateBookings).map((entry) => (
                        <div key={entry.id} className="rounded-md border border-slate-200 bg-white p-2">
                          {getBookingTooltip(entry)
                            .split("\n")
                            .map((line, idx) => (
                              <div key={`${entry.id}-line-${idx}`} className="block">
                                {line}
                              </div>
                            ))}
                        </div>
                      ))}
                    </div>
                  ) : null
                }
              >
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
        <div className="flex flex-wrap items-center gap-3 w-full">
          <div className="relative w-full">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search guest, agent, or date (YYYY-MM-DD)"
              className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs font-semibold text-slate-600"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            className="h-9 px-3 text-[11px] font-bold"
            onClick={applySearch}
          >
            Search
          </Button>
          <div className="flex items-center gap-2">
            <input
              type="month"
              value={monthInput}
              onChange={(e) => setMonthInput(e.target.value)}
              className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600"
            />
            <Button
              type="button"
              variant="outline"
              className="h-9 px-3 text-[11px] font-bold"
              onClick={jumpToMonth}
            >
              Go
            </Button>
          </div>
        </div>

        {/* THE CALENDAR GRID - Now much larger */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 xl:gap-12 bg-slate-50/50 p-4 sm:p-8 rounded-[2rem] border border-slate-100 relative z-20 overflow-visible">
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
        <div className="space-y-2 relative z-0">
          <p className="my-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Resort Booking Ranges</p>
          <div className="flex gap-3 overflow-x-auto pb-3 sm:pb-2 whitespace-nowrap">
            {(calendarMode === "past" ? [...filteredArchivedList, ...filteredBookingList] : filteredBookingList)
              .filter((booking) => (calendarMode === "past" ? isPastStatus(booking) : shouldShowOnCalendar(booking)))
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
                const roomLabel = calendarMode === "past" ? "Checked Out" : getStatusLabel(booking);

                const shouldDisableCard = calendarMode === "past" && booking?.isArchived;

                return (
                  <div
                    onClick={
                      shouldDisableCard
                        ? undefined
                        : () => openBookingDetails(booking.id)
                    }
                    className={`min-w-[220px] max-w-[260px] flex items-center gap-3 px-3 py-2 rounded-xl border border-transparent bg-slate-50 opacity-70 ${
                      shouldDisableCard ? "" : "cursor-pointer"
                    }`}
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
        {modalBookings.length > 0 ? (
          <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center">
            <div
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setModalBookings([])}
            />
            <div className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Bookings</p>
                  <h4 className="text-lg font-black text-slate-900">{modalDayLabel || "Selected Day"}</h4>
                </div>
                <button
                  type="button"
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs font-bold text-slate-500"
                  onClick={() => setModalBookings([])}
                >
                  Close
                </button>
              </div>
              <div className="space-y-3 max-h-[60vh] overflow-auto pr-1">
                {modalBookings.map((booking) => {
                  const isArchived = !!booking.isArchived;
                  const statusLabel = getStatusLabel(booking);
                  const guestName =
                    booking?.stayingGuestName ||
                    booking?.bookingForm?.stayingGuestName ||
                    booking?.guestName ||
                    booking?.bookingForm?.guestName ||
                    "Guest";
                  const canOpen = !isArchived && calendarMode !== "past";
                  return (
                    <div key={booking.id} className="rounded-2xl border border-slate-200 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[10px] font-black uppercase text-slate-400">{statusLabel}</p>
                          <p className="text-sm font-bold text-slate-900">{guestName}</p>
                          <p className="text-xs text-slate-500">
                            {getBookingStartDate(booking) || "..."} - {getBookingEndDate(booking) || "..."}
                          </p>
                        </div>
                        <button
                          type="button"
                          disabled={!canOpen}
                          onClick={() => {
                            if (canOpen) openBookingDetails(booking.id);
                            setModalBookings([]);
                          }}
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            canOpen
                              ? "bg-blue-600 text-white"
                              : "bg-slate-200 text-slate-500 cursor-not-allowed"
                          }`}
                        >
                          Open
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}
    </Card>
  );
}
