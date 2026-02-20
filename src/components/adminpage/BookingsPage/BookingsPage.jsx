"use client";
import React, { useState } from "react";
import BookingCalendar from "./components/BookingsCalendar";
import RentalManager from "./components/RentalManager";
import BookingConfirmation from "./components/BookingConfirmation";

export default function BookingsPage() {
  const [view, setView] = useState("manager"); // "manager" or "form"
  const [selectedBookingData, setSelectedBookingData] = useState(null);

  const openForm = (data) => {
    setSelectedBookingData(data);
    setView("form");
  };

  if (view === "form") {
    return (
      <div className="p-4 md:p-8">
        <BookingConfirmation onBack={() => setView("manager")} data={selectedBookingData} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-10 mt-[10vh]">
      <div className="flex justify-between items-center px-4">
        <h1 className="text-2xl font-black text-slate-800">Booking Management</h1>
        {/* Simple list-style button to access the form directly */}
        <button 
          onClick={() => openForm()} 
          className="text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-xl transition-all"
        >
          View Blank Confirmation Form
        </button>
      </div>

      <section>
        <BookingCalendar />
      </section>

      <section>
        {/* You can pass the openForm trigger to RentalManager if you want to click a guest and see their form */}
        <RentalManager onViewForm={openForm} />
      </section>
    </div>
  );
}