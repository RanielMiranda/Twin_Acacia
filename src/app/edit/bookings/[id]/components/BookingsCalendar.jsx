"use client";

import React, { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Calendar as CalendarIcon,
  Clock3,
  Pen,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Check,
  Edit2,
} from "lucide-react";
import { useResort } from "@/components/useclient/ContextEditor";
import { useBookings } from "@/components/useclient/BookingsClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const GROUP_COLORS = ["bg-blue-600", "bg-orange-500", "bg-emerald-600", "bg-amber-500"];
const HALF_BG_CLASSES = [
  "from-blue-600 to-orange-500",
  "from-orange-500 to-emerald-600",
  "from-emerald-600 to-amber-500",
  "from-amber-500 to-blue-600",
];

export default function BookingCalendar() {
  const { resort } = useResort();
  const { bookings, createBooking, updateBookingById, deleteBookingById } = useBookings();
  const router = useRouter();
  const params = useParams();

  const [selectedRoomIds, setSelectedRoomIds] = useState([]);
  const [activeRangeId, setActiveRangeId] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isRangeMode, setIsRangeMode] = useState(false);

  const rooms = resort?.rooms || [];
  const bookingList = useMemo(() => bookings || resort?.bookings || [], [bookings, resort?.bookings]);
  const getBookingColor = (booking) => {
    const index = bookingList.findIndex((entry) => entry.id?.toString() === booking.id?.toString());
    if (index < 0) return GROUP_COLORS[0];
    return GROUP_COLORS[index % GROUP_COLORS.length];
  };
  const selectedRooms = selectedRoomIds.length > 0 ? selectedRoomIds : rooms[0]?.id ? [rooms[0].id] : [];

  const toggleRoomSelection = (id) => {
    setSelectedRoomIds((prev) => (prev.includes(id) ? prev.filter((rid) => rid !== id) : [...prev, id]));
    setActiveRangeId(null);
  };

  const getDateBookings = (dateString) =>
    bookingList.filter((booking) => {
      const roomMatch = booking.roomIds?.some((rid) => selectedRooms.includes(rid));
      if (!roomMatch || !booking.startDate) return false;
      if (!booking.endDate) return booking.startDate === dateString;
      return (
        booking.startDate === dateString ||
        booking.endDate === dateString ||
        (dateString > booking.startDate && dateString < booking.endDate)
      );
    });

  const addBookingGroup = () => {
    if (selectedRooms.length === 0) {
      alert("Select at least one room first");
      return;
    }

    const newId = Date.now().toString();
    createBooking({
      id: newId,
      roomIds: [...selectedRooms],
      startDate: null,
      endDate: null,
      checkInTime: "14:00",
      checkOutTime: "11:00",
      bookingForm: {
        status: "Inquiry",
        roomCount: selectedRooms.length,
        checkInTime: "14:00",
        checkOutTime: "11:00",
      },
    });
    setActiveRangeId(newId);
  };

  const handleToggleRangeMode = () => {
    if (!isRangeMode) addBookingGroup();
    setIsRangeMode((prev) => !prev);
  };

  const navigateToDetails = (bookingId) => router.push(`/edit/bookings/${params.id}/booking-details/${bookingId}`);
  const navigateToForm = (bookingId) => router.push(`/edit/bookings/${params.id}/booking-details/${bookingId}`);

  const handleDateClick = (dateString) => {
    const clickedBookings = getDateBookings(dateString);
    const clickedBooking = clickedBookings[0] || null;

    if (!isRangeMode) {
      if (clickedBooking) navigateToDetails(clickedBooking.id);
      return;
    }

    if (!activeRangeId) {
      if (clickedBooking) setActiveRangeId(clickedBooking.id.toString());
      return;
    }

    const current = bookingList.find((entry) => entry.id.toString() === activeRangeId.toString());
    if (!current) return;

    if (!current.startDate || (current.startDate && current.endDate)) {
      updateBookingById(activeRangeId, {
        ...current,
        startDate: dateString,
        endDate: null,
        roomIds: [...selectedRooms],
        bookingForm: {
          ...(current.bookingForm || {}),
          checkInDate: dateString,
          checkOutDate: "",
        },
      });
      return;
    }

    const nextStart = dateString < current.startDate ? dateString : current.startDate;
    const nextEnd = dateString < current.startDate ? current.startDate : dateString;

    updateBookingById(activeRangeId, {
      ...current,
      startDate: nextStart,
      endDate: nextEnd,
      bookingForm: {
        ...(current.bookingForm || {}),
        checkInDate: nextStart,
        checkOutDate: nextEnd,
      },
    });
  };

  const getBookingTooltip = (booking) => {
    const checkIn = booking?.checkInTime || booking?.bookingForm?.checkInTime || "--:--";
    const checkOut = booking?.checkOutTime || booking?.bookingForm?.checkOutTime || "--:--";
    return `${checkIn} - ${checkOut}`;
  };

  const getDateTooltip = (dateBookings) => {
    if (!dateBookings?.length) return "";
    return dateBookings
      .slice(0, 2)
      .map((booking, index) => `Range ${index + 1}: ${getBookingTooltip(booking)}`)
      .join(" | ");
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
            const booking = dateBookings[0] || null;
            const secondaryBooking = dateBookings[1] || null;
            const hasSplit = !!booking && !!secondaryBooking;
            const isActive =
              !!activeRangeId &&
              dateBookings.some((entry) => entry.id?.toString() === activeRangeId?.toString());
            const primaryColor = booking ? getBookingColor(booking) : "";
            const splitGradient = hasSplit
              ? HALF_BG_CLASSES[
                  bookingList.findIndex((entry) => entry.id?.toString() === booking.id?.toString()) % HALF_BG_CLASSES.length
                ]
              : "";


            return (
              <button
                key={day}
                onClick={() => handleDateClick(dateString)}
                title={!isRangeMode ? getDateTooltip(dateBookings) : ""}
                className={`h-9 w-full rounded-lg text-sm transition-all relative 
                  ${booking ? "text-white" : "hover:bg-slate-100 text-slate-600"} 
                  ${isActive ? "ring-2 ring-offset-2 ring-slate-400 scale-90 z-10" : ""} 
                  ${booking?.startDate === dateString ? "rounded-r-none" : ""} 
                  ${booking?.endDate === dateString ? "rounded-l-none" : ""} 
                  ${booking && booking.startDate !== dateString && booking.endDate !== dateString ? "rounded-none opacity-80" : ""}
                `}
              >
                {booking ? (
                  hasSplit ? (
                    <span
                      className={`absolute inset-0 rounded-[inherit] bg-gradient-to-r ${splitGradient} ${booking?.startDate !== dateString && booking?.endDate !== dateString ? "opacity-90" : ""}`}
                    />
                  ) : (
                    <span
                      className={`absolute inset-0 rounded-[inherit] ${primaryColor} ${booking?.startDate !== dateString && booking?.endDate !== dateString ? "opacity-90" : ""}`}
                    />
                  )
                ) : null}
                <span className="relative z-10">{day}</span>
              </button>
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
    <Card className="w-full p-8 bg-white shadow-2xl rounded-[2.5rem] border-none">
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h2 className="text-2xl font-black text-blue-600 flex items-center gap-3 uppercase tracking-tight">
              <CalendarIcon size={28} className="text-blue-600" /> 
              Resort Schedule
            </h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Select dates to manage room availability</p>
          </div>
          
          <div className="flex items-center gap-3">
             <Button
                onClick={handleToggleRangeMode}
                className={`flex items-center justify-center ${isRangeMode ? "bg-emerald-600 shadow-emerald-100" : " shadow-slate-200"} rounded-2xl h-12 px-6 font-bold gap-2 shadow-lg transition-all`}
              >
                <Pen size={16} />
                {isRangeMode ? "Range Mode: Active" : "Enable Range Selection"}
              </Button>
          </div>
        </div>

        {/* Room Filter Bar */}
        <div className="p-2 bg-slate-50 rounded-2xl border border-slate-100 flex flex-wrap gap-2">
            {rooms.map((room) => (
               <button
                  key={room.id}
                  onClick={() => toggleRoomSelection(room.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                    selectedRooms.includes(room.id)
                      ? "bg-white text-blue-600 shadow-md ring-1 ring-blue-100"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
               >
                 {room.name}
               </button>
            ))}
        </div>

        {/* THE CALENDAR GRID - Now much larger */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100 relative">
          <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))} className="absolute -left-4 top-1/2 -translate-y-1/2 h-12 w-12 flex items-center justify-center bg-white shadow-xl rounded-full hover:scale-110 transition-all z-20 border border-slate-100"><ChevronLeft size={24} /></button>
          
          <div className="scale-105 origin-top">
            {renderMonth(0)}
          </div>
          <div className="scale-105 origin-top">
            {renderMonth(1)}
          </div>
          
          <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))} className="absolute -right-4 top-1/2 -translate-y-1/2 h-12 w-12 flex items-center justify-center bg-white shadow-xl rounded-full hover:scale-110 transition-all z-20 border border-slate-100"><ChevronRight size={24} /></button>
        </div>
        
        {/* Active Ranges Summary at bottom of calendar */}
        {/* ... (keep your existing active ranges list) */}
      </div>
              <div className="space-y-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Ranges for these rooms</p>
          <div className="flex flex-wrap gap-3">
            {bookingList
              .filter((booking) => booking.roomIds?.some((rid) => selectedRooms.includes(rid)))
              .map((booking) => {
                const checkIn = booking?.checkInTime || booking?.bookingForm?.checkInTime || "--:--";
                const checkOut = booking?.checkOutTime || booking?.bookingForm?.checkOutTime || "--:--";
                const guestName = booking?.bookingForm?.guestName || "Guest";
                const roomNames = (booking.roomIds || [])
                  .map((rid) => rooms.find((room) => room.id === rid)?.name)
                  .filter(Boolean);
                const roomLabel = roomNames.length > 0 ? roomNames.join(", ") : `${booking.roomIds?.length || 0} Rooms`;

                return (
                  <div
                    key={booking.id}
                    title={!isRangeMode ? getBookingTooltip(booking) : ""}
                    onClick={() => (isRangeMode ? setActiveRangeId(booking.id.toString()) : navigateToDetails(booking.id))}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer border transition-all ${
                      activeRangeId?.toString() === booking.id?.toString() ? "border-slate-400 bg-white shadow-sm" : "border-transparent bg-slate-50 opacity-70"
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full ${getBookingColor(booking)}`} />
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-400 uppercase">{roomLabel}</span>
                      <span className="text-xs font-black text-slate-800">{guestName}</span>
                      <span className="text-xs font-bold text-slate-700">{booking.startDate || "..."} - {booking.endDate || "..."}</span>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1"><Clock3 size={10} /> {checkIn} to {checkOut}</span>
                    </div>
                    <button onClick={(event) => { event.stopPropagation(); navigateToForm(booking.id); }} className="ml-1 text-slate-400 hover:text-blue-600" title="Edit booking form"><Edit2 size={14} /></button>
                    <button onClick={(event) => {
                      event.stopPropagation();
                      const confirmed = window.confirm("Delete this booking range?");
                      if (!confirmed) return;
                      deleteBookingById(booking.id);
                    }} className="text-slate-400 hover:text-red-500" title="Delete booking range"><Trash2 size={14} /></button>
                  </div>
                );
              })}
          </div>
        </div>

    </Card>
  );
}
