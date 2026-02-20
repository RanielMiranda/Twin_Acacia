import React from "react";

export default function InquiryForm({ formData, handleChange }) {
  return (
    <div className="space-y-4">
      <h3 className="font-bold text-slate-800 uppercase text-xs tracking-widest border-b pb-1">
        Section 1: Guest Details
      </h3>

      <div className="grid grid-cols-1 gap-3">
        <input
          name="guestName"
          placeholder="Guest Full Name"
          className="w-full border rounded p-2 text-sm"
          value={formData.guestName}
          onChange={handleChange}
          required
        />
        
        <div className="grid grid-cols-2 gap-3">
          <input
            name="email"
            type="email"
            placeholder="Email Address"
            className="w-full border rounded p-2 text-sm"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            name="contactNumber"
            placeholder="Contact Number"
            className="w-full border rounded p-2 text-sm"
            value={formData.contactNumber}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <input
            name="area"
            placeholder="Area (e.g. Manila, Cavite)"
            className="w-full border rounded p-2 text-sm"
            value={formData.area}
            onChange={handleChange}
          />
          <div className="flex items-center border rounded px-2 bg-gray-50">
            <span className="text-[10px] font-bold text-gray-400 uppercase mr-2">Pax:</span>
            <input
              name="pax"
              type="number"
              className="w-full bg-transparent p-2 text-sm outline-none"
              value={formData.pax}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Check-In</label>
            <input
              name="checkInDate"
              type="date"
              className="w-full border rounded p-2 text-sm"
              value={formData.checkInDate}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Check-Out</label>
            <input
              name="checkOutDate"
              type="date"
              className="w-full border rounded p-2 text-sm"
              value={formData.checkOutDate}
              onChange={handleChange}
            />
          </div>
        </div>

        <textarea
          name="message"
          placeholder="Special requests or additional services..."
          className="w-full border rounded p-2 text-sm h-20"
          value={formData.message}
          onChange={handleChange}
        />
      </div>
    </div>
  );
}