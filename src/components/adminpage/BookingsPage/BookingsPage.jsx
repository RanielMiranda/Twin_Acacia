"use client";
import React from "react";
import BookingCalendar from "./components/BookingsCalendar";
import RentalManager from "./components/RentalManager";

export default function BookingsPage() {
  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-10 mt-5">
      {/* Top Section: Visual Context */}
      <section>
        <BookingCalendar />
      </section>

      {/* Bottom Section: Action Center */}
      <section>
        <RentalManager />
      </section>
    </div>
  );
}