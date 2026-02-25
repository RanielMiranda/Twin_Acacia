"use client";
import React, { useState } from "react";
import { useParams } from "next/navigation"; // To get the resort ID
import { resorts } from "@/components/data/resorts"; // Your data source
import BookingCalendar from "./components/BookingsCalendar";
import RentalManager from "./components/RentalManager";
import BookingConfirmation from "./components/BookingConfirmation";

export default function BookingsPage() {
  const { id } = useParams(); // Get the ID from /admin/bookings/[id]
  const [view, setView] = useState("manager");
  const [selectedBookingData, setSelectedBookingData] = useState(null);

  const currentResort = resorts.find((r) => r.id.toString() === id.toString());

  const openForm = (guestData) => {
    setSelectedBookingData({
      ...guestData,
      location: currentResort?.location,
      rates: currentResort?.price,
      resortServices: currentResort?.extraServices,
      resortName: currentResort?.name
    });
    setView("form");
  };

  if (!currentResort) return <div className="p-20 text-center">Resort not found.</div>;

  if (view === "form") {
    return (
      <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
        <BookingConfirmation 
          onBack={() => setView("manager")} 
          data={selectedBookingData} 
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-10 mt-[10vh]">
      <div className="flex justify-between items-center px-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
            Booking Management
          </h1>
          <p className="text-blue-600 font-bold text-sm">{currentResort.name}</p>
        </div>
        
        <button 
          onClick={() => openForm({ status: "Inquiry" })} 
          className="text-xs font-bold bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-4 py-2 rounded-xl transition-all shadow-sm"
        >
          View Blank Confirmation Form
        </button>
      </div>

      <section>
        <BookingCalendar />
      </section>

      <section>
        {/* Pass the openForm function to RentalManager */}
        <RentalManager onOpenForm={openForm} />
      </section>
    </div>
  );
}