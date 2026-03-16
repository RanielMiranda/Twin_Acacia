  "use client";

  import React, { useMemo, useState } from "react";
  import { Inbox, CheckCircle2, AlertCircle, User, ChevronRight, ArrowUpRight } from "lucide-react";
  import { Button } from "@/components/ui/button";
  import { useBookings } from "@/components/useclient/BookingsClient";
  import { useResort } from "@/components/useclient/ContextEditor";

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
        const displayName =
          inquirerType === "agent"
            ? (form.agentName || form.guestName || "Agent")
            : (form.guestName || "Client");
        const guestEmail = form.stayingGuestEmail || form.guestEmail || form.email || "";
        const guestPhone = form.stayingGuestPhone || form.guestPhone || form.phoneNumber || "";
        const contactEmail = inquirerType === "agent" ? (form.email || "") : guestEmail;
        const contactPhone = inquirerType === "agent" ? (form.phoneNumber || "") : guestPhone;
        return {
          bookingId: booking.id,
          guestName: displayName,
          room: roomName,
          contactEmail,
          contactPhone,
          clientEmail: guestEmail,
          clientPhone: guestPhone,
          status: form.status || booking.status || "Inquiry",
          normalizedStatus: (form.status || booking.status || "Inquiry").toLowerCase(),
          checkInDate: booking.startDate || form.checkInDate || "",
          checkOutDate: booking.endDate || form.checkOutDate || "",
          inquirerType,
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
        {/* Tab Navigation */}
        <div className="flex p-2 bg-slate-50/50 border-b border-slate-50 overflow-x-auto gap-2">
          {TABS.map((tab) => {
            const count = grouped[tab.id].length;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`min-w-max flex-1 flex items-center justify-center gap-2 px-3 py-3 md:py-4 rounded-2xl text-[11px] md:text-xs font-black uppercase tracking-widest transition-all ${
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
              <div className="p-4 bg-slate-50 rounded-full text-slate-200"><Inbox size={40}/></div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Queue is empty</p>
            </div>
          ) : (
            grouped[activeTab].map((item) => (
              <div
                key={item.bookingId}
                className="group flex flex-col lg:flex-row lg:items-stretch gap-3 p-4 rounded-2xl border border-slate-200 bg-white/95 shadow-sm hover:shadow-md hover:border-slate-300 transition-all"
              >
                <div className="flex items-start gap-3 min-w-0 lg:flex-1">
                  <div className="h-11 w-11 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors shrink-0">
                    <User size={16} />
                  </div>
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-blue-600/10 text-blue-700 uppercase tracking-tight">
                        {item.status}
                      </span>
                      <span className="text-[10px] font-black px-2 py-0.5 bg-slate-100 rounded-md text-slate-600 uppercase tracking-tight">
                        {item.room}
                      </span>
                      <span className="text-[11px] font-black text-slate-500 uppercase inline-flex items-center gap-1">
                        {item.checkInDate} <ChevronRight size={10} /> {item.checkOutDate}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-black uppercase tracking-wider px-3 rounded-full ${
                          item.inquirerType === "agent"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}>
                          {item.inquirerType === "agent" ? "Agent" : "Client"}
                        </span>
                      </div>                      
                      <h3 className="text-sm font-black text-slate-900 truncate">{item.guestName}</h3>
                    </div>
                      <span className="text-[11px] text-slate-500 truncate">
                        Contact: {item.contactEmail || "No email"}{item.contactPhone ? ` | Phone: ${item.contactPhone}` : ""}
                      </span>                    
                  </div>
                </div>
                <div className="flex items-center justify-between lg:flex-col lg:justify-center lg:items-center lg:w-40 gap-3 lg:border-l lg:border-slate-100 lg:pl-4">
                  <Button
                    variant="ghost"
                    className="items-center justify-center rounded-xl font-bold text-xs h-9 hover:bg-slate-50 flex gap-2"
                    onClick={() => onOpenDetails(item, item.bookingId)}
                  >
                    Manage <ArrowUpRight size={14} />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }
