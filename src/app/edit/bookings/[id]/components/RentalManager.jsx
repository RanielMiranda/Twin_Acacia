"use client";

import React, { useMemo, useState } from "react";
import { Inbox, CheckCircle2, AlertCircle, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBookings } from "@/components/useclient/BookingsClient";
import { useResort } from "@/components/useclient/ContextEditor";
import BookingStatusCard from "./BookingStatusCard";
import { formatDateMeta, formatTime12h, getContactMeta } from "./auditarchive/utils";

const TABS = [
  { id: "inquiry", label: "Inquiries", icon: Inbox, color: "text-blue-600", bg: "bg-blue-50" },
  { id: "confirmed", label: "Confirmed Stays", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
  { id: "checkout", label: "Pending Checkout", icon: AlertCircle, color: "text-rose-600", bg: "bg-rose-50" },
];

export default function RentalManager({ onOpenDetails }) {
  const [activeTab, setActiveTab] = useState("inquiry");
  const { bookings } = useBookings();
  const { resort } = useResort();

  const rows = useMemo(() => {
    return (bookings || []).map((booking) => {
      const form = booking.bookingForm || {};
      const roomId = booking.roomIds?.[0];
      const roomName = resort?.rooms?.find((r) => r.id === roomId)?.name || form.roomName || "Room";
      const inquirerType = (booking.inquirerType || form.inquirerType || "client").toString().toLowerCase();
      const clientName = form.stayingGuestName || form.guestName || "Guest";
      const agentName = form.agentName || "";
      const displayName = inquirerType === "agent" ? (agentName || "Agent") : clientName;
      const { contactEmail, contactPhone, clientEmail, clientPhone } = getContactMeta(booking);
      const checkInTime = booking.checkInTime || form.checkInTime || "12:00";
      const checkOutTime = booking.checkOutTime || form.checkOutTime || "17:00";
      const adultCount = Number(booking.adultCount ?? form.adultCount ?? 0);
      const childrenCount = Number(booking.childrenCount ?? form.childrenCount ?? 0);
      const sleepingGuests = Number(booking.sleepingGuests ?? form.sleepingGuests ?? 0);
      const paxTotal = adultCount + childrenCount;
      return {
        bookingId: booking.id,
        guestName: displayName,
        clientName,
        agentName,
        room: roomName,
        contactEmail,
        contactPhone,
        clientEmail,
        clientPhone,
        status: form.status || booking.status || "Inquiry",
        normalizedStatus: (form.status || booking.status || "Inquiry").toLowerCase(),
        checkInDate: booking.startDate || form.checkInDate || "",
        checkOutDate: booking.endDate || form.checkOutDate || "",
        checkInTime,
        checkOutTime,
        inquirerType,
        paxTotal,
        adultCount,
        childrenCount,
        sleepingGuests,
      };
    });
  }, [bookings, resort?.rooms]);

  const grouped = useMemo(() => ({
    inquiry: rows.filter((r) => {
      if (r.normalizedStatus.includes("declined")) return false;
      return r.normalizedStatus.includes("inquiry") || r.normalizedStatus.includes("pending payment");
    }),
    confirmed: rows.filter((r) => r.normalizedStatus.includes("confirm") || r.normalizedStatus.includes("ongoing")),
    checkout: rows.filter((r) => r.normalizedStatus.includes("pending checkout")),
  }), [rows]);

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
      <div className="flex p-2 bg-slate-50/50 border-b border-slate-50 overflow-x-auto gap-2">
        {TABS.map((tab) => {
          const count = grouped[tab.id].length;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`min-w-max flex-1 flex items-center justify-center gap-2 px-3 py-3 md:py-4 rounded-2xl text-[11px] md:text-xs font-black uppercase tracking-widest transition-all focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 ${
                isActive ? "bg-white text-slate-900 shadow-sm border border-slate-100" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <tab.icon size={16} className={isActive ? tab.color : ""} />
              {tab.label}
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] ${
                  isActive
                    ? `${tab.bg} ${tab.color}`
                    : tab.id === "confirmed"
                      ? "bg-slate-200 text-slate-500"
                      : "bg-red-600 text-white"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="p-6 space-y-3">
        {grouped[activeTab].length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center gap-4">
            <div className="p-4 bg-slate-50 rounded-full text-slate-200"><Inbox size={40} /></div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Queue is empty</p>
          </div>
        ) : (
          grouped[activeTab].map((item) => {
            const checkInMeta = formatDateMeta(item.checkInDate);
            const checkOutMeta = formatDateMeta(item.checkOutDate);
            const checkInLabel = formatTime12h(item.checkInTime);
            const checkOutLabel = formatTime12h(item.checkOutTime);
            const actionSlot = (
              <Button
                variant="ghost"
                className="items-center justify-center rounded-xl font-bold text-xs h-9 hover:bg-slate-50 flex gap-2"
                onClick={() => onOpenDetails(item, item.bookingId)}
              >
                Manage <ArrowUpRight size={14} />
              </Button>
            );

            return (
              <BookingStatusCard
                key={item.bookingId}
                statusLabel={item.status}
                statusBadgeClassName="bg-blue-600/10 text-blue-700"
                roomLabel={item.room}
                inquirerType={item.inquirerType}
                guestName={item.guestName}
                clientName={item.clientName}
                agentName={item.agentName}
                contactEmail={item.contactEmail}
                contactPhone={item.contactPhone}
                clientEmail={item.clientEmail}
                clientPhone={item.clientPhone}
                showClientContact={false}
                paxTotal={item.paxTotal}
                adultCount={item.adultCount}
                childrenCount={item.childrenCount}
                sleepingGuests={item.sleepingGuests}
                checkInDateLabel={checkInMeta.dateLabel}
                checkOutDateLabel={checkOutMeta.dateLabel}
                checkInTimeLabel={checkInLabel}
                checkOutTimeLabel={checkOutLabel}
                containerClassName="border-slate-200 bg-slate-50/60 shadow-sm hover:shadow-md hover:border-slate-300 transition-all"
                actionSlot={actionSlot}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
