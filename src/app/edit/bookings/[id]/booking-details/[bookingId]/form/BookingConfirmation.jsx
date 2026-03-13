"use client";

import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";

export default function BookingConfirmation({
  data,
  resortName,
  resortProfileImage,
  resortPrice = 0,
}) {
  const formData = data || {};

  const selectedServices = Array.isArray(formData.resortServices)
    ? formData.resortServices
    : [];
  const serviceTotal = useMemo(
    () =>
      (selectedServices || []).reduce(
        (sum, entry) => sum + Number(entry?.cost || 0),
        0
      ),
    [selectedServices]
  );
  const resortRental = Number(resortPrice || 0);
  const computedTotal = resortRental + serviceTotal;
  const balanceDue = useMemo(
    () => Math.max(0, computedTotal - Number(formData.downpayment || 0)),
    [computedTotal, formData.downpayment]
  );

  const resortInitials = (resortName || "Resort")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  const assignedRooms = String(formData.roomName || "")
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean);
  const totalPax = Number(formData.guestCount || 0)
    || Number(formData.adultCount || 0) + Number(formData.childrenCount || 0);

  return (
    <div className="max-w-[210mm] min-h-[297mm] mx-auto mt-10 mb-28 bg-white shadow-2xl border border-slate-200 rounded-[18px] px-10 py-12 docx-sheet">
      <div className="flex flex-col items-center text-center border-b border-slate-200 pb-6 gap-3">
        {resortProfileImage ? (
          <img
            src={resortProfileImage}
            alt={`${resortName || "Resort"} logo`}
            className="h-16 w-16 rounded-full object-cover shadow-md border border-slate-200"
          />
        ) : (
          <div className="h-16 w-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-black shadow-md">
            {resortInitials || "R"}
          </div>
        )}
        <div className="space-y-1">
          <p className="text-sm text-slate-500">{resortName || "Resort"}</p>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
            Confirmation booking form
          </h1>
        </div>
      </div>
    
      <div className="space-y-8">
          <section className="space-y-3">
            <h2 className=" mt-5 text-xs font-black uppercase tracking-wider text-slate-500">Contact Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Contact Name">
                <div className="text-sm font-bold text-slate-700">{formData.guestName || formData.agentName || "-"}</div>
              </Field>
              <Field label="Email"><div className="text-sm font-bold text-slate-700">{formData.email || "-"}</div></Field>
              <Field label="Phone Number"><div className="text-sm font-bold text-slate-700">{formData.phoneNumber || "-"}</div></Field>
              <Field label="Address"><div className="text-sm font-bold text-slate-700">{formData.address || "-"}</div></Field>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-500">Stay Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Field label="Guest Name">
                <div className="text-sm font-bold text-slate-700">{formData.stayingGuestName || formData.guestName || "-"}</div>
              </Field>
              {String(formData.inquirerType || "").toLowerCase() === "agent" || formData.agentName ? (
                <Field label="Agent">
                  <div className="text-sm font-bold text-slate-700">{formData.agentName || "-"}</div>
                </Field>
              ) : null}
              <Field label="Adults"><div className="text-sm font-bold text-slate-700">{Number(formData.adultCount || 0)}</div></Field>
              <Field label="Children"><div className="text-sm font-bold text-slate-700">{Number(formData.childrenCount || 0)}</div></Field>
              <Field label="Guests"><div className="text-sm font-bold text-slate-700">{Number(formData.guestCount || 0)}</div></Field>
              <Field label="Sleeping Guests"><div className="text-sm font-bold text-slate-700">{Number(formData.sleepingGuests || 0)}</div></Field>
              <Field label="Total Pax">
                <div className="text-sm font-bold text-slate-700">
                  {Number(totalPax || 0)}
                </div>
              </Field>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-500">Booking Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Field label="Check-In Date">
                <div className="text-sm font-bold text-slate-700">{formatLongDate(formData.checkInDate)}</div>
              </Field>
              <Field label="Check-In Time">
                <div className="text-sm font-bold text-slate-700">{formData.checkInTime || "--:--"}</div>
              </Field>
              <Field label="Check-Out Date">
                <div className="text-sm font-bold text-slate-700">{formatLongDate(formData.checkOutDate)}</div>
              </Field>
              <Field label="Check-Out Time">
                <div className="text-sm font-bold text-slate-700">{formData.checkOutTime || "--:--"}</div>
              </Field>
              <Field label="Assigned Rooms">
                <div className="text-sm font-bold text-slate-700">
                  {formData.roomName || "-"}
                </div>
              </Field>
              <Field label="No. of Rooms">
                <div className="text-sm font-bold text-slate-700">
                  {assignedRooms.length}
                </div>
              </Field>
            </div>
          </section>
          <section className="space-y-3">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-500">Payment Summary</h2>
            <div className="space-y-4 text-sm text-slate-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Total Amount Due</p>
                  <div className="flex items-center justify-between">
                    <span>Resort rental</span>
                    <span className="font-bold">PHP {resortRental.toLocaleString()}</span>
                  </div>
                  {(selectedServices || []).length > 0 ? (
                    selectedServices.map((service, index) => (
                      <div key={`${service?.name || "service"}-${index}`} className="flex items-center justify-between">
                        <span>{service?.name || "Service"}</span>
                        <span className="font-bold">PHP {Number(service?.cost || 0).toLocaleString()}</span>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-between">
                      <span>Services</span>
                      <span className="font-bold">PHP 0</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between border-t border-slate-200 pt-2">
                    <span className="font-bold">Total due</span>
                    <span className="font-black">PHP {computedTotal.toLocaleString()}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Payment Details</p>
                  <div className="flex items-center justify-between">
                    <span>Downpayment</span>
                    <span className="font-bold">PHP {Number(formData.downpayment || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Payment channel</span>
                    <span className="font-bold">{formData.paymentMethod || "Pending"}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold">Total balance</span>
                <span className="font-black">PHP {balanceDue.toLocaleString()}</span>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-500">Notes</h2>
            <div className="text-sm text-slate-700 whitespace-pre-wrap">
              {formData.notes || "No notes provided."}
            </div>
          </section>

        </div>
      <div className="fixed bottom-4 left-4 right-4 md:left-1/2 md:right-auto bg-blue-600 hover:bg-blue-700 md:-translate-x-1/2 z-50 flex items-center justify-between gap-3 bg-white/95 backdrop-blur border border-slate-200 shadow-xl rounded-2xl px-4 py-3 print:hidden">
        <Button type="button" variant="" onClick={() => window.print()}>
          Download
        </Button>
      </div>
      <style jsx global>{`
        @media print {
          body {
            background: #fff !important;
          }
          .docx-sheet {
            margin: 0 !important;
            border: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            width: 210mm !important;
            min-height: 297mm !important;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
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

function formatLongDate(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
