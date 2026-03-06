"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const DEFAULT_FORM = {
  status: "Inquiry",
  guestName: "",
  address: "",
  email: "",
  phoneNumber: "",
  adultCount: 0,
  childrenCount: 0,
  guestCount: 0,
  roomCount: 1,
  sleepingGuests: 0,
  baseRate: 0,
  checkInDate: "",
  checkInTime: "14:00",
  checkOutDate: "",
  checkOutTime: "11:00",
  bookingAgent: "Direct",
  turnoverAuthorizedPerson: "",
  paymentMethod: "Pending",
  bookingMode: "full_day",
  paymentDeadline: "",
  confirmationStub: null,
  downpayment: 0,
  totalAmount: 0,
  notes: "",
};

const STATUS_PHASES = [
  "Inquiry",
  "Approved Inquiry",
  "Pending Payment",
  "Confirmed",
  "Ongoing",
  "Pending Checkout",
  "Checked Out",
  "Cancelled",
  "Declined",
];

export default function BookingConfirmation({
  data,
  resortName,
  readOnly = false,
  title = "Booking Form",
  onSave,
  onCancel,
  onDelete,
  storageKey,
}) {
  const [formData, setFormData] = useState(() => {
    if (typeof window !== "undefined" && storageKey) {
      try {
        const raw = localStorage.getItem(storageKey);
        if (raw) return { ...DEFAULT_FORM, ...(data || {}), ...JSON.parse(raw) };
      } catch {
        // ignore draft parse errors
      }
    }
    return { ...DEFAULT_FORM, ...(data || {}) };
  });

  const balanceDue = useMemo(
    () => Math.max(0, Number(formData.totalAmount || 0) - Number(formData.downpayment || 0)),
    [formData.totalAmount, formData.downpayment]
  );

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNumberChange = (field, value) => {
    const parsed = Number(value);
    handleChange(field, Number.isNaN(parsed) ? 0 : parsed);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (readOnly || !onSave) return;

    const sameDay =
      formData.checkInDate &&
      formData.checkOutDate &&
      formData.checkInDate === formData.checkOutDate;
    if (sameDay && formData.checkInTime && formData.checkOutTime && formData.checkOutTime <= formData.checkInTime) {
      alert("For same-day bookings, check-out time must be later than check-in time.");
      return;
    }

    if (storageKey && typeof window !== "undefined") {
      localStorage.removeItem(storageKey);
    }
    onSave(formData);
  };

  useEffect(() => {
    if (!storageKey || typeof window === "undefined") return;
    localStorage.setItem(storageKey, JSON.stringify(formData));
  }, [formData, storageKey]);

  useEffect(() => {
    const pax = Number(formData.adultCount || 0) + Number(formData.childrenCount || 0);
    if (Number(formData.guestCount || 0) === pax) return;
    setFormData((prev) => ({ ...prev, guestCount: pax, pax }));
  }, [formData.adultCount, formData.childrenCount, formData.guestCount]);

  const inputClass =
    "w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="max-w-5xl mx-auto space-y-6 mt-[8vh]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{title}</h1>
          <p className="text-sm text-slate-500">{resortName || "Resort"}</p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wider text-slate-400">Status</p>
          <p className="font-bold text-blue-600">{formData.status || "Inquiry"}</p>
        </div>
      </div>
    
      <div className="mt-5 flex items-center justify-end gap-3">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Back
          </Button>
        )}
        {!readOnly && (
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
            Save Booking Form
          </Button>
        )}
        {!readOnly && onDelete && (
          <Button type="button" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => {
            const confirmed = window.confirm("Delete this booking form?");
            if (!confirmed) return;
            if (storageKey && typeof window !== "undefined") localStorage.removeItem(storageKey);
            onDelete();
          }}>
            Delete Form
          </Button>
        )}
      </div>


      <form onSubmit={handleSubmit}>
        <Card className="p-6 md:p-8 space-y-8">
          <section className="space-y-3">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-500">Guest Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Guest Name"><input disabled={readOnly} className={inputClass} value={formData.guestName} onChange={(e) => handleChange("guestName", e.target.value)} /></Field>
              <Field label="Email"><input disabled={readOnly} className={inputClass} type="email" value={formData.email} onChange={(e) => handleChange("email", e.target.value)} /></Field>
              <Field label="Phone Number"><input disabled={readOnly} className={inputClass} value={formData.phoneNumber} onChange={(e) => handleChange("phoneNumber", e.target.value)} /></Field>
              <Field label="Address"><input disabled={readOnly} className={inputClass} value={formData.address} onChange={(e) => handleChange("address", e.target.value)} /></Field>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-500">Stay Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Field label="Check-In Date"><input disabled={readOnly} className={inputClass} type="date" value={toDateValue(formData.checkInDate)} onChange={(e) => handleChange("checkInDate", e.target.value)} /></Field>
              <Field label="Check-In Time"><input disabled={readOnly} className={inputClass} type="time" value={formData.checkInTime || ""} onChange={(e) => handleChange("checkInTime", e.target.value)} /></Field>
              <Field label="Check-Out Date"><input disabled={readOnly} className={inputClass} type="date" value={toDateValue(formData.checkOutDate)} onChange={(e) => handleChange("checkOutDate", e.target.value)} /></Field>
              <Field label="Check-Out Time"><input disabled={readOnly} className={inputClass} type="time" value={formData.checkOutTime || ""} onChange={(e) => handleChange("checkOutTime", e.target.value)} /></Field>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-500">Booking + Payment</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Field label="Adults"><input disabled={readOnly} className={inputClass} type="number" min="0" value={formData.adultCount} onChange={(e) => handleNumberChange("adultCount", e.target.value)} /></Field>
              <Field label="Children"><input disabled={readOnly} className={inputClass} type="number" min="0" value={formData.childrenCount} onChange={(e) => handleNumberChange("childrenCount", e.target.value)} /></Field>
              <Field label="Guests"><input disabled={readOnly} className={inputClass} type="number" min="0" value={formData.guestCount} onChange={(e) => handleNumberChange("guestCount", e.target.value)} /></Field>
              <Field label="Sleeping Guests"><input disabled={readOnly} className={inputClass} type="number" min="0" value={formData.sleepingGuests} onChange={(e) => handleNumberChange("sleepingGuests", e.target.value)} /></Field>
              <Field label="Rooms"><input disabled={readOnly} className={inputClass} type="number" min="1" value={formData.roomCount} onChange={(e) => handleNumberChange("roomCount", e.target.value)} /></Field>
              <Field label="Base Rate"><input disabled={readOnly} className={inputClass} type="number" min="0" value={formData.baseRate} onChange={(e) => handleNumberChange("baseRate", e.target.value)} /></Field>
              <Field label="Booking Mode">
                <select disabled={readOnly} className={inputClass} value={formData.bookingMode || "full_day"} onChange={(e) => handleChange("bookingMode", e.target.value)}>
                  <option value="full_day">Full Day</option>
                  <option value="half_day">Half Day</option>
                  <option value="hourly">Hourly</option>
                </select>
              </Field>
              <Field label="Payment Method">
                <select disabled={readOnly} className={inputClass} value={formData.paymentMethod || "Pending"} onChange={(e) => handleChange("paymentMethod", e.target.value)}>
                  <option value="Pending">Pending</option>
                  <option value="GCash">GCash</option>
                  <option value="Bank">Bank</option>
                  <option value="Cash">Cash</option>
                </select>
              </Field>
              <Field label="Total Amount"><input disabled={readOnly} className={inputClass} type="number" min="0" value={formData.totalAmount} onChange={(e) => handleNumberChange("totalAmount", e.target.value)} /></Field>
              <Field label="Downpayment"><input disabled={readOnly} className={inputClass} type="number" min="0" value={formData.downpayment} onChange={(e) => handleNumberChange("downpayment", e.target.value)} /></Field>
              <Field label="Status">
                <select disabled={readOnly} className={inputClass} value={formData.status || "Inquiry"} onChange={(e) => handleChange("status", e.target.value)}>
                  {STATUS_PHASES.map((phase) => (
                    <option key={phase} value={phase}>{phase}</option>
                  ))}
                </select>
              </Field>
              <Field label="Payment Deadline">
                <input
                  disabled={readOnly}
                  className={inputClass}
                  type="datetime-local"
                  value={toDateTimeLocalValue(formData.paymentDeadline)}
                  onChange={(e) => handleChange("paymentDeadline", e.target.value ? new Date(e.target.value).toISOString() : "")}
                />
              </Field>
              <Field label="Confirmation Stub">
                <input
                  disabled
                  className={`${inputClass} bg-slate-50`}
                  value={formData.confirmationStub?.code || "Auto-generated on confirmation"}
                />
              </Field>
              <Field label="Balance Due"><input disabled className={`${inputClass} bg-slate-50`} value={balanceDue} /></Field>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-500">Notes</h2>
            <textarea
              disabled={readOnly}
              className={`${inputClass} min-h-24`}
              value={formData.notes || ""}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Special requests, payment remarks, or internal notes"
            />
          </section>
        </Card>
      </form>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="space-y-1 block">
      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</span>
      {children}
    </label>
  );
}

function toDateValue(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toISOString().slice(0, 10);
}

function toDateTimeLocalValue(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}
