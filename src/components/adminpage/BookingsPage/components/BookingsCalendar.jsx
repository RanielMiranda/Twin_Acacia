import React, { useState } from "react";
import { Calendar as CalendarIcon, Pen, Trash2, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { useResort } from "@/components/useclient/ContextEditor";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const GROUP_COLORS = ["bg-blue-600", "bg-emerald-600", "bg-amber-500", "bg-rose-500", "bg-violet-600", "bg-cyan-500"];

export default function BookingCalendar() {
  const { resort, updateResort } = useResort();
  // Changed to an array to support multiple room selection
  const [selectedRoomIds, setSelectedRoomIds] = useState([resort.rooms?.[0]?.id]);
  const [activeRangeId, setActiveRangeId] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  const bookings = resort.bookings || [];

  const toggleRoomSelection = (id) => {
    setSelectedRoomIds(prev => 
      prev.includes(id) ? prev.filter(rid => rid !== id) : [...prev, id]
    );
    setActiveRangeId(null); // Deselect active booking when changing room filters
  };

  const addBookingGroup = () => {
    if (selectedRoomIds.length === 0) return alert("Select at least one room first");
    
    const newId = Date.now();
    const newBooking = {
      id: newId,
      roomIds: [...selectedRoomIds], // Storing as an array
      startDate: null,
      endDate: null,
      colorClass: GROUP_COLORS[bookings.length % GROUP_COLORS.length]
    };
    updateResort("bookings", [...bookings, newBooking]);
    setActiveRangeId(newId);
  };

  const handleDateClick = (dateString) => {
    if (!activeRangeId) {
      // Check if clicked date belongs to any booking containing ANY of the selected rooms
      const existing = bookings.find(b => 
        b.roomIds.some(rid => selectedRoomIds.includes(rid)) && 
        (b.startDate === dateString || b.endDate === dateString || (dateString > b.startDate && dateString < b.endDate))
      );
      if (existing) setActiveRangeId(existing.id);
      return;
    }

    const updatedBookings = bookings.map(b => {
      if (b.id !== activeRangeId) return b;
      if (!b.startDate || (b.startDate && b.endDate)) {
        return { ...b, startDate: dateString, endDate: null, roomIds: [...selectedRoomIds] };
      } else {
        return dateString < b.startDate 
          ? { ...b, startDate: dateString, endDate: b.startDate }
          : { ...b, endDate: dateString };
      }
    });

    updateResort("bookings", updatedBookings);
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
          {['S','M','T','W','T','F','S'].map(d => <div key={d} className="text-center text-[10px] font-bold text-slate-400">{d}</div>)}
          {Array.from({ length: firstDay }).map((_, i) => <div key={i} />)}
          {Array.from({ length: days }).map((_, i) => {
            const day = i + 1;
            const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            
            // Logic: Highlighting if ANY of the selected rooms are in this booking
            const booking = bookings.find(b => 
              b.roomIds.some(rid => selectedRoomIds.includes(rid)) && 
              (b.startDate === dStr || b.endDate === dStr || (dStr > b.startDate && dStr < b.endDate))
            );

            const isActive = booking?.id === activeRangeId;

            return (
              <button
                key={day}
                onClick={() => handleDateClick(dStr)}
                className={`h-9 w-full rounded-lg text-sm transition-all relative
                  ${booking ? `${booking.colorClass} text-white` : "hover:bg-slate-100 text-slate-600"}
                  ${isActive ? "ring-2 ring-offset-2 ring-slate-400 scale-90" : ""}
                  ${booking?.startDate === dStr ? "rounded-r-none" : ""}
                  ${booking?.endDate === dStr ? "rounded-l-none" : ""}
                  ${booking && booking.startDate !== dStr && booking.endDate !== dStr ? "rounded-none opacity-80" : ""}
                `}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Card className="max-w-4xl mx-auto p-6 bg-white shadow-xl rounded-3xl mt-8">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <CalendarIcon size={20} className="text-blue-600" /> Multi-Room Booking
          </h2>
          <Button onClick={addBookingGroup} size="sm" className="bg-blue-600 rounded-xl gap-2 flex items-center justify-center">
            <Pen size={16} /> New Range
          </Button>
        </div>

        {/* Room Multi-Selector Pills */}
        <div className="flex flex-wrap gap-2 p-2 bg-slate-50 rounded-2xl border border-slate-100">
          {resort.rooms?.map(r => (
            <button
              key={r.id}
              onClick={() => toggleRoomSelection(r.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border
                ${selectedRoomIds.includes(r.id) 
                  ? "bg-white border-blue-200 text-blue-600 shadow-sm" 
                  : "bg-transparent border-transparent text-slate-400 hover:text-slate-600"}
              `}
            >
              {selectedRoomIds.includes(r.id) && <Check size={12} />}
              {r.name}
            </button>
          ))}
        </div>

        <div className="flex flex-col md:flex-row gap-8 bg-slate-50 p-6 rounded-2xl border border-slate-100 relative">
          <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth()-1))} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 hover:bg-white rounded-full z-10"><ChevronLeft size={18}/></button>
          {renderMonth(0)}
          {renderMonth(1)}
          <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth()+1))} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-white rounded-full z-10"><ChevronRight size={18}/></button>
        </div>

        {/* List of bookings matching the CURRENT room selection */}
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Ranges for these rooms</p>
          <div className="flex flex-wrap gap-3">
            {bookings
              .filter(b => b.roomIds.some(rid => selectedRoomIds.includes(rid)))
              .map(b => (
                <div 
                  key={b.id} 
                  onClick={() => setActiveRangeId(b.id)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer border transition-all ${activeRangeId === b.id ? 'border-slate-400 bg-white shadow-sm' : 'border-transparent bg-slate-50 opacity-60'}`}
                >
                  <div className={`w-3 h-3 rounded-full ${b.colorClass}`} />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase">{b.roomIds.length} Rooms</span>
                    <span className="text-xs font-bold text-slate-700">{b.startDate || "..."} — {b.endDate || "..."}</span>
                  </div>
                  <Trash2 size={14} className="ml-2 text-slate-400 hover:text-red-500" onClick={(e) => {
                    e.stopPropagation();
                    updateResort("bookings", bookings.filter(book => book.id !== b.id));
                  }} />
                </div>
              ))}
          </div>
        </div>
      </div>
    </Card>
  );
}