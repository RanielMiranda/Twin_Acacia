"use client";

import React, { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { resorts } from "@/components/data/resorts";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useResort } from "@/components/useclient/ContextEditor";
import { useBookings } from "@/components/useclient/BookingsClient";

const DEFAULT_FORM = {
  status: "Inquiry",
  guestName: "",
  roomName: "",
  address: "",
  email: "",
  phoneNumber: "",
  checkInDate: "",
  checkInTime: "14:00",
  checkOutDate: "",
  checkOutTime: "11:00",
  guestCount: 0,
  roomCount: 1,
  totalAmount: 0,
  downpayment: 0,
  paymentMethod: "Pending",
  notes: "",
};

export default function BookingDetailsPage() {
  const { id, bookingId } = useParams();
  const router = useRouter();
  const { resort } = useResort();
  const { bookings, updateBookingById, deleteBookingById } = useBookings();
  const [isEditing, setIsEditing] = useState(false);

  const fallbackResort = useMemo(
    () => resorts.find((entry) => entry.id.toString() === id?.toString()),
    [id]
  );

  const currentResort = resort?.id?.toString() === id?.toString() ? resort : fallbackResort;
  const booking = (bookings || currentResort?.bookings || []).find((b) => b.id.toString() === bookingId?.toString());

  const [draft, setDraft] = useState(() => normalizeBooking(booking));

  if (!booking) {
    return (
      <div className="p-10 text-center">
        <p className="text-slate-500">Booking range not found.</p>
        <Button className="mt-4" onClick={() => router.push(`/edit/bookings/${id}`)}>
          Back to Booking Page
        </Button>
      </div>
    );
  }

  const status = draft.status || "Inquiry";
  const statusStyle = getStatusStyle(status);

  const handleFieldChange = (field, value) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  const persist = (nextData) => {
    updateBookingById(bookingId, (entry) => ({
      ...entry,
      startDate: nextData.checkInDate || entry.startDate,
      endDate: nextData.checkOutDate || entry.endDate,
      checkInTime: nextData.checkInTime || entry.checkInTime,
      checkOutTime: nextData.checkOutTime || entry.checkOutTime,
      bookingForm: nextData,
      status: nextData.status || entry.status,
    }));
  };

  const handleSave = () => {
    persist(draft);
    setIsEditing(false);
  };

  const updateStatus = (nextStatus) => {
    const next = { ...draft, status: nextStatus };
    setDraft(next);
    persist(next);
  };

  const handleDeleteBooking = () => {
    deleteBookingById(bookingId);
    router.push(`/edit/bookings/${id}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 mt-[9vh]">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">Booking Details</h1>
            <p className="text-sm text-blue-600 font-bold">{currentResort?.name}</p>
          </div>
          <div className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider ${statusStyle}`}>
            {status}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={() => router.push(`/edit/bookings/${id}`)}>
            Back
          </Button>
          <Button variant="outline" onClick={() => router.push(`/edit/bookings/${id}/booking-details/${bookingId}/form`)}>
            View Form
          </Button>

          {!isEditing ? (
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setIsEditing(true)}>
              Edit Inline
            </Button>
          ) : (
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleSave}>
              Save Changes
            </Button>
          )}

          <div className="w-px h-8 bg-slate-200 mx-2" />
          <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => updateStatus("Confirmed")}>
            Approve
          </Button>
          <Button className="bg-red-500 hover:bg-red-600 text-white" onClick={() => updateStatus("Declined")}>
            Decline
          </Button>
          <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={handleDeleteBooking}>
            Delete Booking
          </Button>
        </div>          


        <Card className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InlineField label="Guest Name" value={draft.guestName} editing={isEditing} onChange={(val) => handleFieldChange("guestName", val)} />
            <InlineField label="Room" value={draft.roomName || getRoomName(booking, currentResort)} editing={isEditing} onChange={(val) => handleFieldChange("roomName", val)} />
            <InlineField label="Email" value={draft.email} editing={isEditing} onChange={(val) => handleFieldChange("email", val)} />
            <InlineField label="Check-In Date" type="date" value={toDateValue(draft.checkInDate)} editing={isEditing} onChange={(val) => handleFieldChange("checkInDate", val)} />
            <InlineField label="Check-In Time" type="time" value={draft.checkInTime} editing={isEditing} onChange={(val) => handleFieldChange("checkInTime", val)} />
            <InlineField label="Check-Out Date" type="date" value={toDateValue(draft.checkOutDate)} editing={isEditing} onChange={(val) => handleFieldChange("checkOutDate", val)} />
            <InlineField label="Check-Out Time" type="time" value={draft.checkOutTime} editing={isEditing} onChange={(val) => handleFieldChange("checkOutTime", val)} />
            <InlineField label="Guests" type="number" value={String(draft.guestCount || 0)} editing={isEditing} onChange={(val) => handleFieldChange("guestCount", Number(val) || 0)} />
            <InlineField label="Rooms" type="number" value={String(draft.roomCount || 1)} editing={isEditing} onChange={(val) => handleFieldChange("roomCount", Number(val) || 1)} />
            <InlineField label="Total Amount" type="number" value={String(draft.totalAmount || 0)} editing={isEditing} onChange={(val) => handleFieldChange("totalAmount", Number(val) || 0)} />
            <InlineField label="Downpayment" type="number" value={String(draft.downpayment || 0)} editing={isEditing} onChange={(val) => handleFieldChange("downpayment", Number(val) || 0)} />
            <InlineField label="Payment Method" value={draft.paymentMethod || "Pending"} editing={isEditing} onChange={(val) => handleFieldChange("paymentMethod", val)} />
          </div>

          <InlineTextArea
            label="Notes"
            value={draft.notes || ""}
            editing={isEditing}
            onChange={(val) => handleFieldChange("notes", val)}
          />
        </Card>
      </div>
    </div>
  );
}

function InlineField({ label, value, editing, onChange, type = "text" }) {
  return (
    <div className="rounded-xl border border-slate-200 p-4 bg-white">
      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">{label}</p>
      {editing ? (
        <input
          type={type}
          value={value || ""}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
        />
      ) : (
        <p className="text-sm font-bold text-slate-800 break-words">{value || "-"}</p>
      )}
    </div>
  );
}

function InlineTextArea({ label, value, editing, onChange }) {
  return (
    <div className="rounded-xl border border-slate-200 p-4 bg-white">
      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">{label}</p>
      {editing ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full min-h-24 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
        />
      ) : (
        <p className="text-sm font-bold text-slate-800 whitespace-pre-wrap">{value || "-"}</p>
      )}
    </div>
  );
}

function getStatusStyle(status) {
  const current = (status || "").toLowerCase();
  if (current.includes("confirm")) return "bg-emerald-100 text-emerald-700";
  if (current.includes("pending") || current.includes("inquiry")) return "bg-amber-100 text-amber-700";
  if (current.includes("declin")) return "bg-red-100 text-red-700";
  return "bg-blue-100 text-blue-700";
}

function getRoomName(booking, resort) {
  if (!booking?.roomIds?.length) return "";
  const room = resort?.rooms?.find((entry) => entry.id === booking.roomIds[0]);
  return room?.name || "";
}

function toDateValue(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toISOString().slice(0, 10);
}

function normalizeBooking(booking) {
  const form = booking?.bookingForm || {};
  return {
    ...DEFAULT_FORM,
    ...form,
    checkInDate: form.checkInDate || booking?.startDate || "",
    checkOutDate: form.checkOutDate || booking?.endDate || "",
    checkInTime: form.checkInTime || booking?.checkInTime || "14:00",
    checkOutTime: form.checkOutTime || booking?.checkOutTime || "11:00",
  };
}
