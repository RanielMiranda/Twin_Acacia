"use client";

import React, { useMemo, useState } from "react";
import { Inbox, CheckCircle2, AlertCircle, Mail, User, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBookings } from "@/components/useclient/BookingsClient";
import { useResort } from "@/components/useclient/ContextEditor";

const TABS = [
  { id: "inbox", label: "Inquiry Inbox", icon: Inbox },
  { id: "confirmed", label: "Confirmed Stays", icon: CheckCircle2 },
  { id: "overdue", label: "Pending Checkout", icon: AlertCircle },
];

export default function RentalManager({ onOpenForm, onOpenDetails }) {
  const [activeTab, setActiveTab] = useState("inbox");
  const { bookings } = useBookings();
  const { resort } = useResort();

  const rows = useMemo(() => {
    const source = (bookings || []).map((booking) => {
      const form = booking.bookingForm || {};
      const roomId = booking.roomIds?.[0];
      const roomName = resort?.rooms?.find((room) => room.id === roomId)?.name || form.roomName || "Room";
      return {
        bookingId: booking.id,
        guestName: form.guestName || "Guest",
        room: roomName,
        email: form.email || "No email",
        status: (form.status || booking.status || "Inquiry").toLowerCase(),
        checkInDate: booking.startDate || form.checkInDate || "",
        checkInTime: booking.checkInTime || form.checkInTime || "--",
        checkOutDate: booking.endDate || form.checkOutDate || "",
        checkOutTime: booking.checkOutTime || form.checkOutTime || "--",
      };
    });

    if (source.length) return source;

    return [
      {
        bookingId: null,
        guestName: "User 1",
        room: "Room A",
        email: "user1@example.com",
        status: "inquiry",
        checkInDate: "2026-03-10",
        checkInTime: "14:00",
        checkOutDate: "2026-03-12",
        checkOutTime: "11:00",
      },
    ];
  }, [bookings, resort?.rooms]);

  const grouped = useMemo(() => ({
    inbox: rows.filter((row) => row.status.includes("inquiry") || row.status.includes("pending")),
    confirmed: rows.filter((row) => row.status.includes("confirm")),
    overdue: rows.filter((row) => row.status.includes("checkout") || row.status.includes("overdue")),
  }), [rows]);

  return (
    <div className="rounded-3xl overflow-hidden border border-slate-200 shadow-sm bg-white">
      <div className="flex border-b border-slate-100 bg-slate-50/50">
        {TABS.map((tab) => {
          const count = grouped[tab.id].length;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 text-sm font-semibold transition-all ${
                isActive ? "bg-white text-blue-600 border-b-2 border-blue-600" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
              {count > 0 && (
                <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] ${isActive ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500"}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="p-4 min-h-[300px]">
        {grouped[activeTab].length === 0 ? (
          <div className="py-20 text-center text-slate-400">No records found.</div>
        ) : (
          <div className="space-y-2">
            {grouped[activeTab].map((item) => (
              <div
                key={`${item.bookingId || item.email}-${item.checkInDate}`}
                className="grid grid-cols-1 md:grid-cols-12 items-center gap-4 p-4 rounded-xl border border-slate-100 hover:bg-slate-50/50 transition-colors"
              >
                <div className="md:col-span-3 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                    <User size={18} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-slate-900 truncate">{item.guestName} / {item.room}</div>
                    <div className="text-xs text-blue-600 font-medium">{item.status}</div>
                  </div>
                </div>

                <div className="md:col-span-4 text-xs text-slate-600">
                  {item.checkInDate || "-"} ({toWeekday(item.checkInDate)}) {item.checkInTime || "--"} | {item.checkOutDate || "-"} ({toWeekday(item.checkOutDate)}) {item.checkOutTime || "--"}
                </div>

                <div className="md:col-span-3 flex items-center gap-2">
                  <Mail size={14} className="text-slate-300 shrink-0" />
                  <span className="text-xs text-slate-600 truncate">{item.email}</span>
                </div>

                <div className="md:col-span-2 flex items-center justify-end gap-2">
                  <Button variant="ghost" className="h-8 text-xs" onClick={() => onOpenDetails(item, item.bookingId)}>
                    Details
                  </Button>
                  <Button className="flex items-center justify-center h-8 text-xs bg-blue-600 hover:bg-blue-700" onClick={() => onOpenForm(item, item.bookingId)}>
                    <FileText size={14} className="mr-1" />
                    Form
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function toWeekday(dateValue) {
  if (!dateValue) return "-";
  const parsed = new Date(dateValue);
  return Number.isNaN(parsed.getTime()) ? "-" : parsed.toLocaleDateString("en-US", { weekday: "short" });
}
