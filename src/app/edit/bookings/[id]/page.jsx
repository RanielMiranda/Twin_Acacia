"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useResort } from "@/components/useclient/ContextEditor";
import { useBookings } from "@/components/useclient/BookingsClient";
import { useSupport } from "@/components/useclient/SupportClient";
import {
  Plus, 
  Calendar as CalendarIcon, 
  ClipboardList, 
  LayoutDashboard,
  ChevronRight,
  MessageCircleWarning,
  AlertTriangle,
  Clock4,
  Archive,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

// Components
import BookingCalendar from "./components/BookingsCalendar";
import RentalManager from "./components/RentalManager";
import LiveConcernsPanel from "./components/LiveConcernsPanel";
import AuditArchivePanel from "./components/AuditArchivePanel";

export default function BookingManagementPage() {
  const { id } = useParams();
  const router = useRouter();
  const { resort, loadResort, setResort, loading } = useResort();
  const { bookings, refreshBookings, updateBookingById, deleteBookingById } = useBookings();
  const { listResortConcerns, updateConcernStatus } = useSupport();
  const [concerns, setConcerns] = useState([]);
  const [loadingConcerns, setLoadingConcerns] = useState(false);
  const [audits, setAudits] = useState([]);
  const [loadingAudits, setLoadingAudits] = useState(false);
  
  const [activeTab, setActiveTab] = useState("workflow"); // workflow | calendar | concerns | audits

  useEffect(() => {
    if (id) loadResort(id, true);
  }, [id, loadResort]);

  useEffect(() => {
    if (!id || loading) return;
    if (resort?.id?.toString() === id?.toString()) return;
    const numericId = Number(id);
    if (!Number.isFinite(numericId)) return;
    setResort((prev) => {
      if (prev?.id?.toString() === id?.toString()) return prev;
      return {
        id: numericId,
        name: prev?.name || `Resort ${id}`,
        rooms: prev?.rooms || [],
        bookings: prev?.bookings || [],
      };
    });
  }, [id, loading, resort?.id, setResort]);

  const currentResort = resort?.id?.toString() === id?.toString() ? resort : null;
  const resortId = Number(currentResort?.id || 0);

  const workflowCounts = useMemo(() => {
    const source = bookings || [];
    const inquiry = source.filter((entry) => {
      const status = (entry.status || entry.bookingForm?.status || "").toLowerCase();
      return (status.includes("inquiry") || status.includes("pending payment")) && !status.includes("declined");
    }).length;
    const checkout = source.filter((entry) => {
      const status = (entry.status || entry.bookingForm?.status || "").toLowerCase();
      return status.includes("pending checkout");
    }).length;
    return { inquiry, checkout };
  }, [bookings]);

  const declinedBookings = useMemo(
    () =>
      (bookings || []).filter((entry) => {
        const status = (entry.status || entry.bookingForm?.status || "").toLowerCase();
        return status.includes("declined");
      }),
    [bookings]
  );

  const loadConcerns = async () => {
    if (!resortId) return;
    setLoadingConcerns(true);
    try {
      const rows = await listResortConcerns(resortId, { pruneResolvedOlderThanDays: 10 });
      setConcerns(rows);
    } catch (error) {
      console.error("Concerns load error:", error.message);
    } finally {
      setLoadingConcerns(false);
    }
  };

  const loadAudits = async () => {
    const bookingIds = (bookings || []).map((entry) => entry.id?.toString()).filter(Boolean);
    if (bookingIds.length === 0) {
      setAudits([]);
      return;
    }
    setLoadingAudits(true);
    try {
      const baseQuery = supabase
        .from("booking_status_audit")
        .eq("booking_id", bookingIds[0]);
      const { error: tableCheckError } = await baseQuery.select("id").limit(1);
      if (tableCheckError) {
        setAudits([]);
        return;
      }

      const withActorName = await supabase
        .from("booking_status_audit")
        .select("id, booking_id, changed_at, actor_role, actor_name, old_status, new_status")
        .in("booking_id", bookingIds)
        .order("changed_at", { ascending: false })
        .limit(300);
      if (!withActorName.error) {
        setAudits(withActorName.data || []);
        return;
      }

      const missingActorName =
        withActorName.error.message?.includes("actor_name") &&
        (withActorName.error.message?.includes("does not exist") ||
          withActorName.error.message?.includes("schema cache"));
      if (!missingActorName) {
        setAudits([]);
        return;
      }

      const fallback = await supabase
        .from("booking_status_audit")
        .select("id, booking_id, changed_at, actor_role, old_status, new_status")
        .in("booking_id", bookingIds)
        .order("changed_at", { ascending: false })
        .limit(300);
      setAudits(fallback.data || []);
    } finally {
      setLoadingAudits(false);
    }
  };

  useEffect(() => {
    if (!resortId) return;
    loadConcerns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resortId]);

  useEffect(() => {
    if (!resortId) return;
    refreshBookings();
    const interval = setInterval(() => {
      refreshBookings();
    }, 30000);
    const handleFocus = () => refreshBookings();
    window.addEventListener("focus", handleFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, [refreshBookings, resortId]);

  useEffect(() => {
    loadAudits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookings]);

  const handleResolveConcern = async (issueId) => {
    try {
      await updateConcernStatus(issueId, "resolved");
      setConcerns((prev) => prev.map((entry) => (entry.id === issueId ? { ...entry, status: "resolved" } : entry)));
    } catch (error) {
      console.error("Resolve concern error:", error.message);
    }
  };

  const handleReopenConcern = async (issueId) => {
    try {
      await updateConcernStatus(issueId, "open");
      setConcerns((prev) => prev.map((entry) => (entry.id === issueId ? { ...entry, status: "open" } : entry)));
    } catch (error) {
      console.error("Reopen concern error:", error.message);
    }
  };

  const handleReopenDeclined = async (bookingId) => {
    try {
      await updateBookingById(bookingId, (entry) => ({
        ...entry,
        status: "Inquiry",
        bookingForm: {
          ...(entry.bookingForm || {}),
          status: "Inquiry",
          reopenedAt: new Date().toISOString(),
        },
      }));
      await loadAudits();
    } catch (error) {
      console.error("Reopen declined inquiry error:", error.message);
    }
  };

  const handleDeleteDeclined = async (bookingId) => {
    const confirmed = window.confirm("Delete this declined inquiry?");
    if (!confirmed) return;
    try {
      await deleteBookingById(bookingId);
      await loadAudits();
    } catch (error) {
      console.error("Delete declined inquiry error:", error.message);
    }
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

  if (!currentResort && loading) return <div className="p-20 text-center">Loading Management Console...</div>;
  if (!currentResort) return <div className="p-20 text-center">Unable to load resort profile. Showing booking data by resort ID.</div>;

  return (
    <div className="mt-10 min-h-screen bg-slate-50">
      {/* Header Area */}
      <div className="max-w-[1600px] mx-auto pt-12 px-4 md:px-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 mb-8">
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

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button 
              onClick={() => openForm({ status: "Inquiry" })}
              className="w-full md:w-auto bg-blue-600 items-center justify-center hover:bg-blue-700 text-white rounded-2xl px-6 md:px-8 h-12 md:h-14 font-black shadow-lg shadow-blue-100 transition-all hover:scale-[1.02] md:hover:scale-105 flex gap-3"
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

        <div className="flex items-center gap-4 md:gap-8 border-b border-slate-200 mb-8 overflow-x-auto whitespace-nowrap">
          <button
            onClick={() => setActiveTab("workflow")}
            className={`shrink-0 flex items-center gap-2 pb-4 text-sm font-bold uppercase tracking-widest transition-all relative ${
              activeTab === "workflow" ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <ClipboardList size={18} />
            Guest Workflow
            {activeTab === "workflow" && <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-t-full" />}
          </button>

          <button
            onClick={() => setActiveTab("calendar")}
            className={`shrink-0 flex items-center gap-2 pb-4 text-sm font-bold uppercase tracking-widest transition-all relative ${
              activeTab === "calendar" ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <CalendarIcon size={18} />
            Availability Calendar
            {activeTab === "calendar" && <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-t-full" />}
          </button>

          <button
            onClick={() => setActiveTab("concerns")}
            className={`shrink-0 flex items-center gap-2 pb-4 text-sm font-bold uppercase tracking-widest transition-all relative ${
              activeTab === "concerns" ? "text-rose-600" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <MessageCircleWarning size={18} />
            Live Concerns
            {activeTab === "concerns" && <div className="absolute bottom-0 left-0 w-full h-1 bg-rose-600 rounded-t-full" />}
          </button>

          <button
            onClick={() => setActiveTab("audits")}
            className={`shrink-0 flex items-center gap-2 pb-4 text-sm font-bold uppercase tracking-widest transition-all relative ${
              activeTab === "audits" ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <Archive size={18} />
            Audit Archive
            {activeTab === "audits" && <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-600 rounded-t-full" />}
          </button>
        </div>

        <main className="pb-20">
          {activeTab === "workflow" ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <RentalManager onOpenDetails={(item, bookingId) => openDetails(bookingId)} />
            </div>
          ) : activeTab === "calendar" ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <BookingCalendar fullWidth />
            </div>
          ) : activeTab === "concerns" ? (
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
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <AuditArchivePanel
                audits={audits}
                declinedBookings={declinedBookings}
                loading={loadingAudits}
                onRefresh={loadAudits}
                onOpenBooking={(bookingTargetId) => openDetails(bookingTargetId)}
                onReopenDeclined={handleReopenDeclined}
                onDeleteDeclined={handleDeleteDeclined}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
