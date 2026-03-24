"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useResort } from "@/components/useclient/ContextEditor";

import HeroSection from "./rooms/HeroSection";
import ProfileSection from "./rooms/ProfileSection";
import RoomsSection from "./rooms/RoomsSection";
import ShortcutBar from "./rooms/ShortcutBar";
import FacilitySection from "./rooms/FacilitySection";
import ServicesSection from "./rooms/ServicesSection";

const GalleryModal = dynamic(() => import("./components/GalleryModal"), { ssr: false });
const FacilityGalleryModal = dynamic(() => import("./components/FacilityGalleryModal"), { ssr: false });
const ContactOwnerModal = dynamic(() => import("./components/ContactOwnerModal"), { ssr: false });
import RoomFilterPanel from "./rooms/filters/RoomFilterPanel";
import { useFilters } from "@/components/useclient/ContextFilter";
import { buildRequestedRange, getUnavailableRoomIds } from "@/lib/availability";

import { useToast } from "@/components/ui/toast/ToastProvider";
import Toast from "@/components/ui/toast/Toast"
import PersistentToast from "@/components/ui/toast/PersistentToast";
import { CheckCircle2, XCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useSupport } from "@/components/useclient/SupportClient";
import { generateTicketAccessToken, getTicketAccessExpiry } from "@/lib/ticketAccess";
import { normalizeBookingSubmission } from "@/components/booking/payloadData/buildBookingPayload";
import { buildServiceSnapshots } from "@/lib/utils";

const ResortDetailSkeleton = () => (
  <div className="bg-white min-h-screen animate-pulse">
    <div className="h-90 md:h-105 bg-slate-200" />
    <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-8 xl:gap-12 items-start">
        <div className="min-w-0 space-y-10">
          <div className="rounded-3xl border border-slate-200 p-6">
            <div className="h-8 w-2/3 bg-slate-200 rounded-full mb-3" />
            <div className="h-4 w-1/3 bg-slate-200 rounded-full mb-6" />
            <div className="h-20 w-full bg-slate-200 rounded-2xl" />
          </div>
          <div className="rounded-3xl border border-slate-200 p-6">
            <div className="h-5 w-1/4 bg-slate-200 rounded-full mb-4" />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="h-24 bg-slate-200 rounded-2xl" />
              <div className="h-24 bg-slate-200 rounded-2xl" />
              <div className="h-24 bg-slate-200 rounded-2xl" />
            </div>
          </div>
          <div className="rounded-3xl border border-slate-200 p-6">
            <div className="h-5 w-1/4 bg-slate-200 rounded-full mb-4" />
            <div className="h-32 bg-slate-200 rounded-2xl" />
          </div>
          <div className="rounded-3xl border border-slate-200 p-6">
            <div className="h-6 w-1/3 bg-slate-200 rounded-full mb-6" />
            <div className="space-y-4">
              <div className="h-28 bg-slate-200 rounded-2xl" />
              <div className="h-28 bg-slate-200 rounded-2xl" />
            </div>
          </div>
        </div>

        <aside className="hidden xl:block">
          <div className="rounded-4xl border border-slate-200 p-6 space-y-6">
            <div className="h-8 bg-slate-200 rounded-2xl" />
            <div className="h-10 bg-slate-200 rounded-2xl" />
            <div className="h-12 bg-slate-200 rounded-2xl" />
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
  const [unavailableRoomIds, setUnavailableRoomIds] = useState([]);
  const [selectedRoomIds, setSelectedRoomIds] = useState([]);
  const { startDate, endDate, checkInTime, checkOutTime } = useFilters();

  const { toast, persistentToast } = useToast();
  const { sendTicketMessage, isMissingSupportTableError } = useSupport();
  useEffect(() => {
    if (!name) return;
    const decodedName = decodeURIComponent(name);
    setHasRequestedResort(true);
    if (!resort || resort.name !== decodedName) {
      loadResort(decodedName, false);
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
      if (!cancelled) setUnavailableRoomIds(Array.from(blockedSet));
    };
    loadRoomAvailability();
    return () => {
      cancelled = true;
    };
  }, [resort?.id, startDate, endDate, checkInTime, checkOutTime]);

  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    document.body.style.overflow = mobileFiltersOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileFiltersOpen]);

  if (!resort && (loading || !hasRequestedResort)) {
    return <ResortDetailSkeleton />;
  }

  if (!resort) {
    return (
      <div className="relative">
        <ResortDetailSkeleton />
        <div className="absolute inset-0 z-50 flex items-start justify-center px-6 pt-10 md:pt-16">
          <div className="rounded-3xl border border-slate-200 bg-white/90 backdrop-blur px-8 py-6 text-center shadow-lg max-w-md w-full">
            <p className="text-sm font-semibold text-slate-700">Resort not found.</p>
            <p className="text-xs text-slate-500 mt-1">Try refreshing or check the resort link.</p>
          </div>
        </div>
      </div>
    );
  }

  const handleOpenFacility = (index) => {
    setFacilityIndex(index);
    setFacilityOpen(true);
  };

  const selectedRooms = (resort.rooms || []).filter((room) =>
    selectedRoomIds.includes(room.id)
  );
  const selectedRoomSummary = selectedRooms.length > 0
    ? selectedRooms.map((room) => room.name).filter(Boolean).join(", ")
    : "";
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
      const selectedServiceSnapshots = buildServiceSnapshots(selectedServiceKeys, resort.extraServices);
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
      const inquiryMessage =
        "Your inquiry has been sent. Please wait for a response via email.";
      persistentToast({
        message: inquiryMessage,
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
    <div className="bg-white min-h-screen">
      <HeroSection
        onOpen={(index) => {
          setActiveIndex(index);
          setGalleryOpen(true);
        }}
      />

      <ShortcutBar />
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-8 xl:gap-12 items-start">
          <div className="min-w-0 space-y-10">
            <ProfileSection className="px-0 py-0" />

            <FacilitySection
              facilities={resort.facilities}
              onOpen={handleOpenFacility}
              className="px-0"
            />

            <ServicesSection services={resort.extraServices} className="px-0 my-0" />

            <section className="px-0">
              <div className="border-b border-slate-200 pb-5 mb-6">
                <p className="mt-10 text-[11px] font-black uppercase tracking-[0.24em] text-slate-400 mb-2">
                  Available Accommodations
                </p>
                <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
                  Choose the rooms that fit this stay
                </h2>
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

          <aside className="hidden xl:sticky xl:top-24 xl:self-start xl:block">
            <div className="overflow-visible rounded-4xl bg-white shadow-xl border-t border-slate-100">

              <div className="p-6">
                <RoomFilterPanel embedded selectedRoomSummary={selectedRoomSummary} />
              </div>

              <div className="border-t border-slate-100 px-6 py-5 space-y-4 bg-slate-50/80 rounded-b-4xl">
                {hasAvailabilityConflict ? (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-bold text-rose-700">
                    Resort is unavailable for the selected dates.
                  </div>
                ) : null}
                <button
                  className={`w-full rounded-2xl px-4 py-3.5 text-sm font-bold text-white transition ${
                    hasAvailabilityConflict ? "bg-slate-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
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

      {galleryOpen && (
        <GalleryModal
          images={resort.gallery}
          activeIndex={activeIndex}
          setActiveIndex={setActiveIndex}
          onClose={() => setGalleryOpen(false)}
        />
      )}

      {facilityOpen && (
        <FacilityGalleryModal
          facilities={resort.facilities}
          activeIndex={facilityIndex}
          setActiveIndex={setFacilityIndex}
          onClose={() => setFacilityOpen(false)}
        />
      )}

      {roomGalleryOpen && (
        <GalleryModal
          images={roomImages}
          activeIndex={roomActiveIndex}
          setActiveIndex={setRoomActiveIndex}
          onClose={() => setRoomGalleryOpen(false)}
        />
      )}

      {contactOpen && (
        <ContactOwnerModal
          isOpen={contactOpen}
          onClose={() => setContactOpen(false)}
          resort={resort}
          unavailableRoomIds={roomBlockingIds}
          initialSelectedRoomIds={selectedRoomIds}
          onSubmitInquiry={handleSubmitInquiry}
        />
      )}
      <div className="xl:hidden fixed inset-x-0 bottom-4 z-40 px-4">
        <button
          className="mx-auto flex w-full max-w-sm items-center justify-center rounded-2xl bg-blue-600 px-4 py-3.5 text-sm font-bold text-white shadow-2xl"
          onClick={() => setMobileFiltersOpen(true)}
        >
          Filters
          {selectedRoomIds.length > 0 ? ` • ${selectedRoomIds.length} selected` : ""}
        </button>
      </div>
      {mobileFiltersOpen ? (
        <div className="xl:hidden fixed inset-0 z-[120] bg-black/45 backdrop-blur-[2px]">
          <div
            className="absolute inset-0"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 mx-auto h-[75vh] max-w-xl rounded-t-4xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                  Filters
                </p>
                <h3 className="text-lg font-semibold text-slate-900">Plan this stay</h3>
              </div>
              <button
                className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-600"
                onClick={() => setMobileFiltersOpen(false)}
              >
                Close
              </button>
            </div>
            <div className="h-[calc(75vh-73px)] overflow-y-auto px-5 py-5">
              <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
                <RoomFilterPanel
                  embedded
                  mobileSheet
                  showTitle={false}
                  selectedRoomSummary={selectedRoomSummary}
                />
                <button
                  className={`mt-4 w-full rounded-2xl px-4 py-3.5 text-sm font-bold text-white ${
                    hasAvailabilityConflict ? "bg-slate-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
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
    <Toast/>
    <PersistentToast />
    </div>
  );
}
