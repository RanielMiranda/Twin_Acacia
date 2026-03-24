"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useResort } from "@/components/useclient/ContextEditor";
import { useBookings } from "@/components/useclient/BookingsClient";
import { useBookingConsoleData } from "./useBookingConsoleData";
import { useSupport } from "@/components/useclient/SupportClient";
import { normalizeBookingSubmission } from "@/components/booking/payloadData/buildBookingPayload";
import {Button} from "@/components/ui/button";
import {
  Calendar as CalendarIcon, 
  ClipboardList, 
  LayoutDashboard,
  ChevronRight,
  MessageCircleWarning,
  Archive,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Plus,
} from "lucide-react";

// Components
import BookingCalendar from "./components/BookingsCalendar";
import RentalManager from "./components/RentalManager";
import LiveConcernsPanel from "./components/LiveConcernsPanel";
import AuditArchivePanel from "./components/AuditArchivePanel";
import BookingSummaryCards from "./components/BookingSummaryCards";
import Toast from "@/components/ui/toast/Toast"
import { useToast } from "@/components/ui/toast/ToastProvider";
import ManualBookingModal from "./components/ManualBookingModal";
export default function BookingManagementPage() {
  const { id } = useParams();
  const router = useRouter();
  const { resort, loadResort, setResort, loading } = useResort();
  const { bookings, refreshBookings, updateBookingById, deleteBookingById, createBooking } = useBookings();
  const { listResortConcerns, updateConcernStatus } = useSupport();
  const { toast } = useToast();
  const [isAddBookingOpen, setIsAddBookingOpen] = useState(false);
  const [addingBooking, setAddingBooking] = useState(false);
  const [activeTab, setActiveTab] = useState("workflow"); // workflow | calendar | concerns | audits
  const [archiveSearch, setArchiveSearch] = useState("");
  const [archiveSearchInput, setArchiveSearchInput] = useState("");
  const [archiveMonthFilter, setArchiveMonthFilter] = useState("");

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

  const {
    concerns,
    loadingConcerns,
    audits,
    loadingAudits,
    archivedBookings,
    loadingArchivedBookings,
    archivedHasMore,
    workflowCounts,
    declinedBookings,
    checkedOutBookings,
    auditArchiveCount,
    openConcernCount,
    unresolvedIssueBookingIds,
    loadConcerns,
    handleResolveConcern,
    handleReopenConcern,
    handleReopenDeclined,
    handleReopenCancelled,
    handleReopenCheckedOut,
    handleResolveDeclined,
    handleResolveCancelled,
    handleResolveCheckedOut,
    handleDeleteArchivedBooking,
    refreshAuditArchive,
    loadArchivedBookings,
  } = useBookingConsoleData({
    resortId,
    bookings,
    refreshBookings,
    updateBookingById,
    deleteBookingById,
    listResortConcerns,
    updateConcernStatus,
    toast,
    enableAudits: activeTab === "audits",
    enableArchive: activeTab === "audits" || activeTab === "calendar",
    archiveAutoLoad: activeTab === "audits",
  });

  const handleRefreshWorkflow = async () => {
    try {
      await refreshBookings();
      toast?.({ message: "Workflow refreshed.", color: "green", icon: CheckCircle2 });
    } catch (err) {
      toast?.({ message: `Refresh failed: ${err.message}`, color: "red", icon: XCircle });
    }
  };

  const handleRefreshCalendar = async () => {
    try {
      await refreshBookings();
      await loadArchivedBookings({ append: false, search: archiveSearch });
      toast?.({ message: "Calendar refreshed.", color: "green", icon: CheckCircle2 });
    } catch (err) {
      toast?.({ message: `Refresh failed: ${err.message}`, color: "red", icon: XCircle });
    }
  };

  const handleArchiveSearch = async () => {
    const next = archiveSearchInput;
    setArchiveSearch(next);
    await loadArchivedBookings({ append: false, search: next });
  };

  const handleArchiveJumpMonth = async (monthValue) => {
    if (!monthValue) return;
    const [year, month] = monthValue.split("-").map((val) => Number(val));
    if (!year || !month) return;
    setArchiveMonthFilter(monthValue);
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0);
    const startStr = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")}`;
    const endStr = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, "0")}-${String(end.getDate()).padStart(2, "0")}`;
    await loadArchivedBookings({ append: false, search: archiveSearch, rangeStart: startStr, rangeEnd: endStr });
  };

  const handleArchiveClearMonth = async () => {
    setArchiveMonthFilter("");
    await loadArchivedBookings({ append: false, search: archiveSearch });
  };

  useEffect(() => {
    if (activeTab === "audits") return;
    if (!archiveMonthFilter && !archiveSearchInput && !archiveSearch) return;
    setArchiveMonthFilter("");
    setArchiveSearchInput("");
    setArchiveSearch("");
  }, [activeTab, archiveMonthFilter, archiveSearch, archiveSearchInput]);

  const handleRefreshConcerns = async () => {
    try {
      await loadConcerns();
      toast?.({ message: "Feed refreshed.", color: "green", icon: CheckCircle2 });
    } catch (err) {
      toast?.({ message: `Refresh failed: ${err.message}`, color: "red", icon: XCircle });
    }
  };

  const handleRefreshArchive = async () => {
    try {
      await refreshAuditArchive();
      toast?.({ message: "Archive refreshed.", color: "green", icon: CheckCircle2 });
    } catch (err) {
      toast?.({ message: `Refresh failed: ${err.message}`, color: "red", icon: XCircle });
    }
  };

  const TabBadge = ({ count, tone = "blue" }) =>
    count > 0 ? (
      <span
        className={`ml-1 inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-black leading-none ${
          tone === "rose"
            ? "bg-rose-100 text-rose-700"
            : tone === "indigo"
              ? "bg-indigo-100 text-indigo-700"
              : "bg-blue-100 text-blue-700"
        }`}
      >
        {count}
      </span>
    ) : null;

  const openDetails = (targetBookingId) => {
    router.push(`/edit/bookings/${id}/booking-details/${targetBookingId}`);
  };

  const handleCreateBooking = async (payload) => {
    if (!payload?.guestName?.trim()) {
      toast?.({ message: "Guest name is required.", color: "red", icon: XCircle });
      return;
    }
    if (!payload.checkInDate) {
      toast?.({ message: "Check-in date is required.", color: "red", icon: XCircle });
      return;
    }

    setAddingBooking(true);
    try {
      const { bookingModel, bookingForm } = normalizeBookingSubmission({
        resort: currentResort,
        submittedData: payload,
      });

      const created = await createBooking({
        ...bookingModel,
        bookingForm: {
          ...bookingForm,
          selectedRoomIds: payload.selectedRoomIds || [],
        },
      });

      setIsAddBookingOpen(false);
      toast?.({ message: "Manual booking added.", color: "green", icon: CheckCircle2 });
      if (created?.id) {
        openDetails(created.id);
      }
      return true;
    } catch (error) {
      toast?.({ message: `Unable to add booking: ${error.message}`, color: "red", icon: XCircle });
      return false;
    } finally {
      setAddingBooking(false);
    }
  };

  if (!currentResort && loading) return <div className="p-20 text-center">Loading Management Console...</div>;
  if (!currentResort) return <div className="p-20 text-center">Unable to load resort profile. Showing booking data by resort ID.</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Area */}
      <div className="max-w-400 mx-auto pt-12 px-4 md:px-8">
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
          <div className="flex items-center gap-3">
            <Button
              type="button"
              onClick={() => setIsAddBookingOpen(true)}
              className="rounded-full px-2 text-md"
            >
              <Plus size={16} className="mr-2" /> Add Booking
            </Button>
          </div>
        </header>

        <BookingSummaryCards
          workflowCounts={workflowCounts}
          openConcernCount={openConcernCount}
          auditArchiveCount={auditArchiveCount}
          onOpenConcerns={() => setActiveTab("concerns")}
          onOpenAudits={() => setActiveTab("audits")}
        />

        <div className="flex items-center gap-4 md:gap-8 border-b border-slate-200 mb-8 overflow-x-auto whitespace-nowrap">
          <button
            onClick={() => setActiveTab("workflow")}
            className={`shrink-0 flex items-center gap-2 pb-4 text-sm font-bold uppercase tracking-widest transition-all relative ${
              activeTab === "workflow" ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <ClipboardList size={18} />
            Guest Workflow
            <TabBadge count={workflowCounts.inquiry} tone="blue" />
            {activeTab === "workflow" && <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-t-full" />}
          </button>

          <button
            onClick={() => setActiveTab("calendar")}
            className={`shrink-0 flex items-center gap-2 pb-4 text-sm font-bold uppercase tracking-widest transition-all relative ${
              activeTab === "calendar" ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <CalendarIcon size={18} />
            Bookings Calendar
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
            <TabBadge count={openConcernCount} tone="rose" />
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
            <TabBadge count={auditArchiveCount} tone="indigo" />
            {activeTab === "audits" && <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-600 rounded-t-full" />}
          </button>
        </div>

        <main className="pb-20">
          {activeTab === "workflow" ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-end mb-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex items-center justify-center rounded-full px-3 text-xs font-black"
                  onClick={handleRefreshWorkflow}
                >
                  <RefreshCw size={14} className="mr-2" />
                  Refresh Workflow
                </Button>
              </div>
              <RentalManager onOpenDetails={(item, bookingId) => openDetails(bookingId)} />
            </div>
          ) : activeTab === "calendar" ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-end mb-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex items-center justify-center rounded-full px-3 text-xs font-black"
                  onClick={handleRefreshCalendar}
                >
                  <RefreshCw size={14} className="mr-2" />
                  Refresh Calendar
                </Button>
              </div>
              <BookingCalendar
                fullWidth
                archivedBookings={archivedBookings}
                archivedLoading={loadingArchivedBookings}
                onLoadArchived={loadArchivedBookings}
              />
            </div>
          ) : activeTab === "concerns" ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <LiveConcernsPanel
                concerns={concerns}
                loading={loadingConcerns}
                onRefresh={handleRefreshConcerns}
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
                checkedOutBookings={checkedOutBookings}
                archivedBookings={archivedBookings}
                loading={loadingAudits || loadingArchivedBookings}
                onRefresh={handleRefreshArchive}
                onOpenBooking={(bookingTargetId) => openDetails(bookingTargetId)}
                onReopenDeclined={handleReopenDeclined}
                onReopenCancelled={handleReopenCancelled}
                onReopenCheckedOut={handleReopenCheckedOut}
                onResolveDeclined={handleResolveDeclined}
                onResolveCancelled={handleResolveCancelled}
                onResolveCheckedOut={handleResolveCheckedOut}
                onDeleteArchived={handleDeleteArchivedBooking}
                unresolvedIssueBookingIds={unresolvedIssueBookingIds}
                searchValue={archiveSearchInput}
                onSearchChange={(value) => setArchiveSearchInput(value)}
                onSearchSubmit={handleArchiveSearch}
                onJumpMonth={handleArchiveJumpMonth}
                onClearMonth={handleArchiveClearMonth}
                monthFilter={archiveMonthFilter}
                hasMoreArchived={archivedHasMore}
                onLoadMoreArchived={() => loadArchivedBookings({ append: true, search: archiveSearch })}
              />
            </div>
          )}
        </main>
      </div>
      <Toast/>
      <ManualBookingModal
        isOpen={isAddBookingOpen}
        onClose={() => setIsAddBookingOpen(false)}
        onSubmit={handleCreateBooking}
        resort={currentResort}
        isSubmitting={addingBooking}
      />
    </div>
  );
}
