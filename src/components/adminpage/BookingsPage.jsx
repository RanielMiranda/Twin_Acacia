import React, { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Plus, Trash2, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { useResort } from "@/components/context/ContextEditor";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Helper to generate unique colors for different booking groups
const GROUP_COLORS = [
  "bg-blue-600", "bg-emerald-600", "bg-amber-500", 
  "bg-rose-500", "bg-violet-600", "bg-cyan-500"
];

export default function BookingsPage() {
  const { resort, updateResort } = useResort();
  const [selectedRoomId, setSelectedRoomId] = useState(resort.rooms?.[0]?.id || null);
  const [activeRangeId, setActiveRangeId] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Ensure bookings structure exists: [{ id, roomId, startDate, endDate, colorClass }]
  const bookings = resort.bookings || [];

  const addBookingGroup = () => {
    const newId = Date.now();
    const newBooking = {
      id: newId,
      roomId: selectedRoomId,
      startDate: null,
      endDate: null,
      colorClass: GROUP_COLORS[bookings.length % GROUP_COLORS.length]
    };
    const updated = [...bookings, newBooking];
    updateResort("bookings", updated);
    setActiveRangeId(newId);
  };

  const handleDateClick = (dateString) => {
    if (!activeRangeId) {
      // If no active range, check if user clicked an existing one to select it
      const existing = bookings.find(b => 
        b.roomId === selectedRoomId && 
        (b.startDate === dateString || b.endDate === dateString || (dateString > b.startDate && dateString < b.endDate))
      );
      if (existing) setActiveRangeId(existing.id);
      return;
    }

    const updatedBookings = bookings.map(b => {
      if (b.id !== activeRangeId) return b;
      
      // Basic Range Logic
      if (!b.startDate || (b.startDate && b.endDate)) {
        return { ...b, startDate: dateString, endDate: null };
      } else {
        // Ensure chronological order
        return dateString < b.startDate 
          ? { ...b, startDate: dateString, endDate: b.startDate }
          : { ...b, endDate: dateString };
      }
    });

    updateResort("bookings", updatedBookings);
  };

  const deleteBooking = (id) => {
    const updated = bookings.filter(b => b.id !== id);
    updateResort("bookings", updated);
    setActiveRangeId(null);
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
            
            // Find which booking this day belongs to
            const booking = bookings.find(b => 
              b.roomId === selectedRoomId && 
              (b.startDate === dStr || b.endDate === dStr || (dStr > b.startDate && dStr < b.endDate))
            );

            const isStart = booking?.startDate === dStr;
            const isEnd = booking?.endDate === dStr;
            const isActive = booking?.id === activeRangeId;

            return (
              <button
                key={day}
                onClick={() => handleDateClick(dStr)}
                className={`
                  h-9 w-full rounded-lg text-sm transition-all relative
                  ${booking ? `${booking.colorClass} text-white` : "hover:bg-slate-100 text-slate-600"}
                  ${isActive ? "ring-2 ring-offset-2 ring-slate-400 scale-90" : ""}
                  ${isStart ? "rounded-r-none" : ""}
                  ${isEnd ? "rounded-l-none" : ""}
                  ${booking && !isStart && !isEnd ? "rounded-none opacity-80" : ""}
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
    <Card className="max-w-4xl mx-auto p-6 bg-white shadow-xl rounded-3xl mt-8 pt-12">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <CalendarIcon size={20} className="text-blue-600" />
            Booking Manager
          </h2>
        </div>
        
        <div className="flex items-center gap-2">
          <select 
            className="text-sm border-none bg-slate-100 rounded-xl px-3 py-2 font-semibold"
            onChange={(e) => {setSelectedRoomId(Number(e.target.value)); setActiveRangeId(null);}}
          >
            {resort.rooms?.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
          
          <Button onClick={addBookingGroup} size="sm" className="bg-blue-600 rounded-xl gap-2 flex items-center justify-center">
            <Plus size={16} /> New Range
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 bg-slate-50 p-6 rounded-2xl border border-slate-100">
        <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth()-1))} className="p-2 hover:bg-white rounded-full"><ChevronLeft size={18}/></button>
        {renderMonth(0)}
        {renderMonth(1)}
        <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth()+1))} className="p-2 hover:bg-white rounded-full"><ChevronRight size={18}/></button>
      </div>

      {/* Booking List Footer */}
      <div className="mt-6 space-y-2">
        <p className="text-[10px] font-bold text-slate-400 uppercase">Active Bookings</p>
        <div className="flex flex-wrap gap-3">
          {bookings.filter(b => b.roomId === selectedRoomId).map(b => (
            <div 
              key={b.id} 
              onClick={() => setActiveRangeId(b.id)}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer border transition-all ${activeRangeId === b.id ? 'border-slate-400 bg-white shadow-sm' : 'border-transparent bg-slate-50 opacity-60'}`}
            >
              <div className={`w-3 h-3 rounded-full ${b.colorClass}`} />
              <span className="text-xs font-bold text-slate-700">
                {b.startDate || "Select Start"} — {b.endDate || "End"}
              </span>
              <Trash2 size={14} className="text-slate-400 hover:text-red-500" onClick={(e) => {e.stopPropagation(); deleteBooking(b.id);}} />
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}