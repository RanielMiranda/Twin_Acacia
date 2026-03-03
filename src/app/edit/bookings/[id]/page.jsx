"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { resorts } from "@/components/data/resorts";
import { useResort } from "@/components/useclient/ContextEditor";
import { useBookings } from "@/components/useclient/BookingsClient";
import {
  Plus, 
  Calendar as CalendarIcon, 
  ClipboardList, 
  LayoutDashboard,
  ChevronRight,
  Database,
  MessageCircleWarning,
  AlertTriangle,
  Clock4,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

// Components
import BookingCalendar from "./components/BookingsCalendar";
import RentalManager from "./components/RentalManager";
import LiveConcernsPanel from "./components/LiveConcernsPanel";

export default function BookingManagementPage() {
  const { id } = useParams();
  const router = useRouter();
  const { resort, setResort, loadResort } = useResort();
  const { bookings, refreshBookings, loadingBookings, lastFetchedAt } = useBookings();
  const [concerns, setConcerns] = useState([]);
  const [loadingConcerns, setLoadingConcerns] = useState(false);
  
  const [activeTab, setActiveTab] = useState("workflow"); // workflow | calendar | concerns

  useEffect(() => {
    if (id) loadResort(id, true);
  }, [id, loadResort]);

  const fallbackResort = useMemo(
    () => resorts.find((r) => r.id.toString() === id?.toString()),
    [id]
  );

  useEffect(() => {
    if (!resort && fallbackResort) setResort(fallbackResort);
  }, [resort, fallbackResort, setResort]);

  const currentResort = resort?.id?.toString() === id?.toString() ? resort : fallbackResort;
  const resortId = Number(currentResort?.id || id || 0);

  const workflowCounts = useMemo(() => {
    const source = bookings || [];
    const inquiry = source.filter((entry) => {
      const status = (entry.status || entry.bookingForm?.status || "").toLowerCase();
      return status.includes("inquiry") || status.includes("pending payment");
    }).length;
    const checkout = source.filter((entry) => {
      const status = (entry.status || entry.bookingForm?.status || "").toLowerCase();
      return status.includes("pending checkout");
    }).length;
    return { inquiry, checkout };
  }, [bookings]);

  const loadConcerns = async () => {
    if (!resortId) return;
    setLoadingConcerns(true);
    try {
      const cutoffIso = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();
      await supabase
        .from("ticket_issues")
        .delete()
        .eq("resort_id", resortId)
        .eq("status", "resolved")
        .lt("created_at", cutoffIso);

      const { data, error } = await supabase
        .from("ticket_issues")
        .select("id, booking_id, guest_name, guest_email, subject, message, status, created_at")
        .eq("resort_id", resortId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setConcerns(data || []);
    } catch (error) {
      console.error("Concerns load error:", error.message);
    } finally {
      setLoadingConcerns(false);
    }
  };

  useEffect(() => {
    if (!resortId) return;
    loadConcerns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resortId]);

  const handleResolveConcern = async (issueId) => {
    const { error } = await supabase.from("ticket_issues").update({ status: "resolved" }).eq("id", issueId);
    if (error) {
      console.error("Resolve concern error:", error.message);
      return;
    }
    setConcerns((prev) => prev.map((entry) => (entry.id === issueId ? { ...entry, status: "resolved" } : entry)));
  };

  const handleReopenConcern = async (issueId) => {
    const { error } = await supabase.from("ticket_issues").update({ status: "open" }).eq("id", issueId);
    if (error) {
      console.error("Reopen concern error:", error.message);
      return;
    }
    setConcerns((prev) => prev.map((entry) => (entry.id === issueId ? { ...entry, status: "open" } : entry)));
  };

  const openForm = (guestData = {}, targetBookingId = null) => {
    if (targetBookingId) {
      router.push(`/edit/bookings/${id}/booking-details/${targetBookingId}/form`);
      return;
    }
    const payload = { ...guestData, resortName: currentResort?.name };
    const draftKey = `booking-form:${Date.now()}`;
    sessionStorage.setItem(draftKey, JSON.stringify(payload));
    router.push(`/edit/bookings/${id}/booking-details/new/form?draft=${encodeURIComponent(draftKey)}`);
  };

  const openDetails = (targetBookingId) => {
    router.push(`/edit/bookings/${id}/booking-details/${targetBookingId}`);
  };

  if (!currentResort) return <div className="p-20 text-center">Loading Management Console...</div>;

  return (
    <div className="mt-10 min-h-screen bg-slate-50">
      {/* Header Area */}
      <div className="max-w-[1600px] mx-auto pt-12 px-4 md:px-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl">
              <LayoutDashboard size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                Resort Manager <ChevronRight size={12}/> {currentResort.name}
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">
                Booking Console
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={async () => {
                await Promise.all([refreshBookings(), loadConcerns()]);
              }}
              variant="outline"
              className="items-center justify-center rounded-2xl px-6 h-14 font-black flex gap-2"
            >
              <Database size={18} />
              {loadingBookings ? "Reloading..." : "Refresh Tables"}
            </Button>
            <Button 
              onClick={() => openForm({ status: "Inquiry" })}
              className="bg-blue-600 items-center justify-center hover:bg-blue-700 text-white rounded-2xl px-8 h-14 font-black shadow-lg shadow-blue-100 transition-all hover:scale-105 flex gap-3"
            >
              <Plus size={20} /> Create New Entry
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <div className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
            <p className="text-[10px] uppercase tracking-widest font-black text-slate-400 mb-1">Priority Workflow</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900 flex items-center gap-2"><Clock4 size={16} className="text-blue-600" /> Pending Inquiries</p>
                <p className="text-2xl font-black text-blue-600">{workflowCounts.inquiry}</p>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 flex items-center gap-2"><AlertTriangle size={16} className="text-rose-600" /> Pending Checkout</p>
                <p className="text-2xl font-black text-rose-600">{workflowCounts.checkout}</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-rose-100 bg-white p-4 shadow-sm">
            <p className="text-[10px] uppercase tracking-widest font-black text-slate-400 mb-1">Live Concerns</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900 flex items-center gap-2"><MessageCircleWarning size={16} className="text-rose-600" /> Open Tickets</p>
                <p className="text-2xl font-black text-rose-600">
                  {concerns.filter((item) => item.status !== "resolved").length}
                </p>
              </div>
              <Button
                variant="outline"
                className="rounded-xl text-xs font-bold"
                onClick={() => setActiveTab("concerns")}
              >
                View Concerns
              </Button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-8 border-b border-slate-200 mb-8">
          <button
            onClick={() => setActiveTab("workflow")}
            className={`flex items-center gap-2 pb-4 text-sm font-bold uppercase tracking-widest transition-all relative ${
              activeTab === "workflow" ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <ClipboardList size={18} />
            Guest Workflow
            {activeTab === "workflow" && <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-t-full" />}
          </button>

          <button
            onClick={() => setActiveTab("calendar")}
            className={`flex items-center gap-2 pb-4 text-sm font-bold uppercase tracking-widest transition-all relative ${
              activeTab === "calendar" ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <CalendarIcon size={18} />
            Availability Calendar
            {activeTab === "calendar" && <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-t-full" />}
          </button>

          <button
            onClick={() => setActiveTab("concerns")}
            className={`flex items-center gap-2 pb-4 text-sm font-bold uppercase tracking-widest transition-all relative ${
              activeTab === "concerns" ? "text-rose-600" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <MessageCircleWarning size={18} />
            Live Concerns
            {activeTab === "concerns" && <div className="absolute bottom-0 left-0 w-full h-1 bg-rose-600 rounded-t-full" />}
          </button>
        </div>

        <main className="pb-20">
          {activeTab === "workflow" ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <RentalManager onOpenForm={openForm} onOpenDetails={(item, id) => openDetails(id)} />
            </div>
          ) : activeTab === "calendar" ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <BookingCalendar fullWidth />
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <LiveConcernsPanel
                concerns={concerns}
                loading={loadingConcerns}
                onRefresh={loadConcerns}
                onResolve={handleResolveConcern}
                onReopen={handleReopenConcern}
                onOpenBooking={(bookingTargetId) => openDetails(bookingTargetId)}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
