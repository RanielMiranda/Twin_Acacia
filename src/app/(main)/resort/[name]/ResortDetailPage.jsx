"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { CheckCircle2, XCircle, X } from "lucide-react";
import { useResort } from "@/components/useclient/ContextEditor";
import { useFilters } from "@/components/useclient/ContextFilter";
import { useSupport } from "@/components/useclient/SupportClient";
import { useToast } from "@/components/ui/toast/ToastProvider";
import Toast from "@/components/ui/toast/Toast";
import PersistentToast from "@/components/ui/toast/PersistentToast";
import { buildRequestedRange, getUnavailableRoomIds } from "@/lib/availability";
import { normalizeBookingSubmission } from "@/components/booking/payloadData/buildBookingPayload";
import { supabase } from "@/lib/supabase";
import { generateTicketAccessToken, getTicketAccessExpiry } from "@/lib/ticketAccess";
import { buildServiceSnapshots } from "@/lib/utils";
import HeroSection from "./rooms/HeroSection";
import ProfileSection from "./rooms/ProfileSection";
import RoomsSection from "./rooms/RoomsSection";
import ShortcutBar from "./rooms/ShortcutBar";
import FacilitySection from "./rooms/FacilitySection";
import ServicesSection from "./rooms/ServicesSection";
import RoomFilterPanel from "./rooms/filters/RoomFilterPanel";
import SideRangeCalendar from "./rooms/filters/SideRangeCalendar";

const GalleryModal = dynamic(() => import("./components/GalleryModal"), { ssr: false });
const FacilityGalleryModal = dynamic(() => import("./components/FacilityGalleryModal"), { ssr: false });
const ContactOwnerModal = dynamic(() => import("./components/ContactOwnerModal"), { ssr: false });

const ResortDetailSkeleton = () => (
  <div className="min-h-screen animate-pulse bg-slate-100">
    <div className="h-90 bg-slate-200 md:h-105" />
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-[minmax(0,1fr)_360px] xl:gap-12">
        <div className="min-w-0 space-y-10">
          <div className="rounded-3xl border border-slate-200 p-6">
            <div className="mb-3 h-8 w-2/3 rounded-full bg-slate-200" />
            <div className="mb-6 h-4 w-1/3 rounded-full bg-slate-200" />
            <div className="h-20 w-full rounded-2xl bg-slate-200" />
          </div>
          <div className="rounded-3xl border border-slate-200 p-6">
            <div className="mb-4 h-5 w-1/4 rounded-full bg-slate-200" />
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              <div className="h-24 rounded-2xl bg-slate-200" />
              <div className="h-24 rounded-2xl bg-slate-200" />
              <div className="h-24 rounded-2xl bg-slate-200" />
            </div>
          </div>
          <div className="rounded-3xl border border-slate-200 p-6">
            <div className="mb-4 h-5 w-1/4 rounded-full bg-slate-200" />
            <div className="h-32 rounded-2xl bg-slate-200" />
          </div>
          <div className="rounded-3xl border border-slate-200 p-6">
            <div className="mb-6 h-6 w-1/3 rounded-full bg-slate-200" />
            <div className="space-y-4">
              <div className="h-28 rounded-2xl bg-slate-200" />
              <div className="h-28 rounded-2xl bg-slate-200" />
            </div>
          </div>
        </div>

        <aside className="hidden xl:block">
          <div className="space-y-6 rounded-[2rem] border border-slate-200 p-6">
            <div className="h-8 rounded-2xl bg-slate-200" />
            <div className="h-10 rounded-2xl bg-slate-200" />
            <div className="h-12 rounded-2xl bg-slate-200" />
          </div>
        </aside>
      </div>
    </div>
  </div>
);

export default function ResortDetailPage({ name }) {
  const { resort, loadResort, loading } = useResort();
  const [hasRequestedResort, setHasRequestedResort] = useState(false);
  const [facilityIndex, setFacilityIndex] = useState(0);
  const [facilityOpen, setFacilityOpen] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [roomGalleryOpen, setRoomGalleryOpen] = useState(false);
  const [roomActiveIndex, setRoomActiveIndex] = useState(0);
  const [roomImages, setRoomImages] = useState([]);
  const [contactOpen, setContactOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [unavailableRoomIds, setUnavailableRoomIds] = useState([]);
  const [selectedRoomIds, setSelectedRoomIds] = useState([]);
  const { startDate, setStartDate, endDate, setEndDate, checkInTime, setCheckInTime, checkOutTime, setCheckOutTime } = useFilters();
  const { toast, persistentToast } = useToast();
  const { sendTicketMessage, isMissingSupportTableError } = useSupport();

  useEffect(() => {
    if (!name) return;
    const decodedName = decodeURIComponent(name);
    setHasRequestedResort(true);
    if (!resort || resort.name !== decodedName) {
      loadResort(decodedName, false, false);
    }
  }, [name, loadResort, resort]);

  useEffect(() => {
    let cancelled = false;

    const loadRoomAvailability = async () => {
      if (!resort?.id) {
        setUnavailableRoomIds([]);
        return;
      }

      const requestedRange = buildRequestedRange({ startDate, endDate, checkInTime, checkOutTime });
      if (!requestedRange) {
        setUnavailableRoomIds([]);
        return;
      }

      const { data, error } = await supabase
        .from("bookings")
        .select("room_ids, start_date, end_date, check_in_time, check_out_time, status")
        .eq("resort_id", Number(resort.id));

      if (error) {
        console.error("Failed to load room availability:", error.message);
        if (!cancelled) setUnavailableRoomIds([]);
        return;
      }

      const blockedSet = getUnavailableRoomIds(
        data || [],
        requestedRange,
        (resort?.rooms || []).map((room) => room?.id)
      );

      if (!cancelled) {
        setUnavailableRoomIds(Array.from(blockedSet));
      }
    };

    loadRoomAvailability();

    return () => {
      cancelled = true;
    };
  }, [resort?.id, resort?.rooms, startDate, endDate, checkInTime, checkOutTime]);

  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    document.body.style.overflow = mobileFiltersOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileFiltersOpen]);

  useEffect(() => {
    if ((activeDropdown === "start" || activeDropdown === "end") && mobileFiltersOpen) {
      setMobileFiltersOpen(false);
    }
  }, [activeDropdown, mobileFiltersOpen]);

  if (!resort && (loading || !hasRequestedResort)) {
    return <ResortDetailSkeleton />;
  }

  if (!resort) {
    return (
      <div className="relative">
        <ResortDetailSkeleton />
        <div className="absolute inset-0 z-50 flex items-start justify-center px-6 pt-10 md:pt-16">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white/90 px-8 py-6 text-center shadow-lg backdrop-blur">
            <p className="text-sm font-semibold text-slate-700">Resort not found.</p>
            <p className="mt-1 text-xs text-slate-500">Try refreshing or check the resort link.</p>
          </div>
        </div>
      </div>
    );
  }

  const handleOpenFacility = (index) => {
    setFacilityIndex(index);
    setFacilityOpen(true);
  };

  const selectedRooms = (resort.rooms || []).filter((room) => selectedRoomIds.includes(room.id));
  const selectedRoomSummary =
    selectedRooms.length > 0 ? selectedRooms.map((room) => room.name).filter(Boolean).join(", ") : "";
  const hasAvailabilityConflict = unavailableRoomIds.length > 0;
  const roomBlockingIds = unavailableRoomIds;

  const handleSubmitInquiry = async (submittedData) => {
    let succeeded = false;

    try {
      const selectedServiceKeys = Array.isArray(submittedData.selectedServices)
        ? submittedData.selectedServices
            .map((item) => (item && typeof item === "object" ? item.id || item.name : item))
            .filter(Boolean)
        : [];

      buildServiceSnapshots(selectedServiceKeys, resort.extraServices);

      const bookingId = Date.now().toString();
      const ticketAccessToken = generateTicketAccessToken();
      const ticketAccessExpiresAt = getTicketAccessExpiry(30);
      const agentTicketAccessToken = submittedData.inquirerType === "agent" ? generateTicketAccessToken() : "";
      const agentTicketAccessExpiresAt = submittedData.inquirerType === "agent" ? getTicketAccessExpiry(30) : "";

      const { bookingRow, bookingForm } = normalizeBookingSubmission({
        resort,
        submittedData,
      });

      const bookingFormWithTokens = {
        ...bookingForm,
        ticketAccessToken,
        ticketAccessExpiresAt,
        agentTicketAccessToken,
        agentTicketAccessExpiresAt,
      };

      const { error } = await supabase.from("bookings").upsert({
        ...bookingRow,
        id: bookingId,
        booking_form: bookingFormWithTokens,
      });

      if (error) throw error;

      if (submittedData.message) {
        try {
          const senderRole = submittedData.inquirerType === "agent" ? "agent" : "client";
          const senderName =
            submittedData.inquirerType === "agent"
              ? submittedData.agentName || submittedData.guestName || "Agent"
              : submittedData.guestName || "Client";

          await sendTicketMessage({
            booking_id: bookingId,
            resort_id: Number(resort.id),
            sender_role: senderRole,
            sender_name: senderName,
            visibility: submittedData.inquirerType === "agent",
            message: submittedData.message,
          });
        } catch (messageError) {
          if (!isMissingSupportTableError(messageError)) {
            console.error("Failed to save inquiry message:", messageError?.message || messageError);
          }
        }
      }

      if (typeof window !== "undefined") {
        const ticketUrl = `${window.location.origin}/ticket/${bookingId}?token=${ticketAccessToken}`;
        console.info("Client ticket link (for testing until email is enabled):", ticketUrl);
      }

      persistentToast({
        message: "Your inquiry has been sent. Please wait for a response via email.",
        color: "blue",
        icon: CheckCircle2,
      });
      succeeded = true;
    } catch (err) {
      toast({
        message: `Failed to send inquiry: ${err.message}`,
        color: "red",
        icon: XCircle,
      });
    }

    if (succeeded) {
      setContactOpen(false);
    }

    return succeeded;
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#f4f8fb_26%,#ffffff_100%)]">
      <HeroSection
        onOpen={(index) => {
          setActiveIndex(index);
          setGalleryOpen(true);
        }}
      />
      <ShortcutBar />

      {(activeDropdown === "start" || activeDropdown === "end") && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setActiveDropdown(null)}
          />
          <div className="absolute inset-0 z-10 flex items-center justify-center p-4">
            <SideRangeCalendar
              startDate={startDate}
              endDate={endDate}
              activeDropdown={activeDropdown}
              onClose={() => setActiveDropdown(null)}
              monthCount={mobileFiltersOpen ? 1 : 2}
              mobileCentered={mobileFiltersOpen}
              onChange={(s, e) => {
                setStartDate(s);
                setEndDate(e);
                if (activeDropdown === "start" && s && !e) {
                  setActiveDropdown("end");
                }
              }}
            />
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6 lg:py-10">
        <div className="mb-8 grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="rounded-[2rem] border border-white/80 bg-white/75 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur md:p-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-blue-600">Plan this stay</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Check the details provided by the resort.</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500"> 
                Review the resort information, facilities, and rooms to ensure it meets your needs before contacting the owner.
              </p>
          </div>
        </div>

        <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-[minmax(0,1fr)_360px] xl:gap-12">
          <div className="min-w-0 space-y-10">
            <ProfileSection className="px-0 py-0" />

            <FacilitySection facilities={resort.facilities} onOpen={handleOpenFacility} className="px-0" />

            <ServicesSection services={resort.extraServices} className="my-0 px-0" />

            <section className="px-0">
              <div className="mb-6 border-b border-slate-200 pb-5">
                <p className="mb-2 mt-10 text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">
                  Available Accommodations
                </p>
                <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
                  Choose the rooms that fit this stay
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Click on the rooms below to select them based on your needs.
                </p>                
              </div>

              <RoomsSection
                className="px-0 pb-10"
                unavailableRoomIds={roomBlockingIds}
                selectedRoomIds={selectedRoomIds}
                onToggleRoomSelection={(roomId) =>
                  setSelectedRoomIds((prev) =>
                    prev.includes(roomId) ? prev.filter((id) => id !== roomId) : [...prev, roomId]
                  )
                }
                onOpenRoomGallery={(images, index = 0) => {
                  setRoomImages(images);
                  setRoomActiveIndex(index);
                  setRoomGalleryOpen(true);
                }}
              />
            </section>
          </div>

          <aside className="hidden xl:sticky xl:top-36 xl:self-start xl:block">
            <div className="overflow-visible rounded-[2rem] border border-slate-200/80 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.10)]">
              <div className="p-6">
                <RoomFilterPanel
              embedded
              selectedRoomSummary={selectedRoomSummary}
              activeDropdown={activeDropdown}
              setActiveDropdown={setActiveDropdown}
            />
              </div>

              <div className="space-y-4 rounded-b-[2rem] border-t border-slate-100 bg-slate-50/80 px-6 py-5">
                {hasAvailabilityConflict ? (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-bold text-rose-700">
                    Resort is unavailable for the selected dates.
                  </div>
                ) : null}
                <button
                  className={`w-full rounded-2xl px-4 py-3.5 text-sm font-bold text-white transition ${
                    hasAvailabilityConflict ? "cursor-not-allowed bg-slate-300" : "bg-blue-600 hover:bg-blue-700"
                  }`}
                  onClick={() => {
                    if (hasAvailabilityConflict) return;
                    setContactOpen(true);
                  }}
                  disabled={hasAvailabilityConflict}
                >
                  Contact Owner
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {galleryOpen ? (
        <GalleryModal
          images={resort.gallery}
          activeIndex={activeIndex}
          setActiveIndex={setActiveIndex}
          onClose={() => setGalleryOpen(false)}
        />
      ) : null}

      {facilityOpen ? (
        <FacilityGalleryModal
          facilities={resort.facilities}
          activeIndex={facilityIndex}
          setActiveIndex={setFacilityIndex}
          onClose={() => setFacilityOpen(false)}
        />
      ) : null}

      {roomGalleryOpen ? (
        <GalleryModal
          images={roomImages}
          activeIndex={roomActiveIndex}
          setActiveIndex={setRoomActiveIndex}
          onClose={() => setRoomGalleryOpen(false)}
        />
      ) : null}

      {contactOpen ? (
        <ContactOwnerModal
          isOpen={contactOpen}
          onClose={() => setContactOpen(false)}
          resort={resort}
          unavailableRoomIds={roomBlockingIds}
          initialSelectedRoomIds={selectedRoomIds}
          onSubmitInquiry={handleSubmitInquiry}
        />
      ) : null}

      <div className="fixed inset-x-0 bottom-0 z-40 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileFiltersOpen(true)}
          className="flex w-full items-center justify-between rounded-t-[1.6rem] bg-blue-600 px-5 py-4 text-left text-white shadow-[0_-12px_40px_rgba(37,99,235,0.28)]"
        >
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-sky-100">Filter and contact</p>
            <p className="mt-1 text-sm font-semibold">
              {selectedRoomIds.length > 0 ? `${selectedRoomIds.length} selected` : "Open"}
            </p>
          </div>
          <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">Open</span>
        </button>
      </div>

      {mobileFiltersOpen ? (
        <div className="fixed inset-0 z-[120] bg-black/45 backdrop-blur-[2px] xl:hidden">
          <div className="absolute inset-0" onClick={() => setMobileFiltersOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 mx-auto h-[75vh] max-w-xl rounded-t-4xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-blue-600">Filters</p>
                <h3 className="text-lg font-semibold text-slate-900">Plan this stay</h3>
              </div>
              <button
                type="button"
                className="rounded-full border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 transition"
                onClick={() => setMobileFiltersOpen(false)}
                aria-label="Close filters"
              >
                <X size={18} />
              </button>
            </div>
            <div className="h-[calc(75vh-73px)] overflow-y-auto px-5 py-5">
              <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
                <RoomFilterPanel
                  embedded
                  mobileSheet
                  showTitle={false}
                  selectedRoomSummary={selectedRoomSummary}
                  activeDropdown={activeDropdown}
                  setActiveDropdown={setActiveDropdown}
                />
                <button
                  className={`mt-4 w-full rounded-2xl px-4 py-3.5 text-sm font-bold text-white ${
                    hasAvailabilityConflict ? "cursor-not-allowed bg-slate-300" : "bg-blue-600 hover:bg-blue-700"
                  }`}
                  onClick={() => {
                    if (hasAvailabilityConflict) return;
                    setMobileFiltersOpen(false);
                    setContactOpen(true);
                  }}
                  disabled={hasAvailabilityConflict}
                >
                  Contact Owner
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <Toast />
      <PersistentToast />
    </div>
  );
}
