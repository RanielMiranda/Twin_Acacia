"use client";

import React, { useState, useEffect } from "react";
import { useResort } from "@/components/useclient/ContextEditor";

import HeroSection from "./rooms/HeroSection";
import ProfileSection from "./rooms/ProfileSection";
import RoomsSection from "./rooms/RoomsSection";
import ShortcutBar from "./rooms/ShortcutBar";
import FacilitySection from "./rooms/FacilitySection";
import ServicesSection from "./rooms/ServicesSection";

import GalleryModal from "./components/GalleryModal";
import FacilityGalleryModal from "./components/FacilityGalleryModal";

import ContactOwnerModal from "./components/ContactOwnerModal";
import RoomFilterPanel from "./rooms/filters/RoomFilterPanel";

import { useToast } from "@/components/ui/toast/ToastProvider";
import Toast from "@/components/ui/toast/Toast"
import PersistentToast from "@/components/ui/toast/PersistentToast";
import { supabase } from "@/lib/supabase";

export default function ResortDetailPage({ name }) {
  const { resort, setResort, loadResort, loading } = useResort();

  const [facilityIndex, setFacilityIndex] = useState(0);
  const [facilityOpen, setFacilityOpen] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [roomGalleryOpen, setRoomGalleryOpen] = useState(false);
  const [roomActiveIndex, setRoomActiveIndex] = useState(0);
  const [roomImages, setRoomImages] = useState([]);
  const [contactOpen, setContactOpen] = useState(false);
  const [price, setPrice] = useState(5000);

  const { toast, persistentToast } = useToast();
  useEffect(() => {
    if (!name) return;
        const decodedName = decodeURIComponent(name);
    if (!resort || resort.name !== decodedName) {
      loadResort(decodedName, false);
    }
  }, [name, loadResort, resort]);

  if (loading && !resort) {
    return (
      <div className="mt-10 p-20 text-center text-gray-500">
        Fetching Resort Details...
      </div>
    );
  }

  if (!resort) {
    return (
      <div className="mt-10 p-10 text-center text-gray-500">
        Resort not found
      </div>
    );
  }

  const handleOpenFacility = (index) => {
    setFacilityIndex(index);
    setFacilityOpen(true);
  };

const handleSubmitInquiry = async (submittedData) => {
    const payload = { 
      ...submittedData, 
      resortName: resort.name,
      location: resort.location 
    };

    try {
      const selectedServices = (resort.extraServices || []).filter((service) =>
        submittedData.selectedServices?.includes(service.name)
      );

      const bookingId = Date.now().toString();
      const adultCount = Number(submittedData.adultCount || 0);
      const childrenCount = Number(submittedData.childrenCount || 0);
      const pax = Number(submittedData.guestCount || submittedData.pax || adultCount + childrenCount || 0);
      const bookingForm = {
        guestName: submittedData.guestName || "",
        email: submittedData.email || "",
        phoneNumber: submittedData.contactNumber || "",
        address: submittedData.area || "",
        adultCount,
        childrenCount,
        pax,
        guestCount: pax,
        roomCount: Number(submittedData.roomCount || 1),
        sleepingGuests: Number(submittedData.sleepingGuests || 0),
        checkInDate: submittedData.checkInDate || "",
        checkOutDate: submittedData.checkOutDate || "",
        checkInTime: submittedData.checkInTime || "14:00",
        checkOutTime: submittedData.checkOutTime || "11:00",
        status: "Inquiry",
        paymentMethod: "Pending",
        downpayment: 0,
        totalAmount: Number(resort.price || 0),
        resortServices: selectedServices,
        notes: submittedData.message || "",
      };

      const { error } = await supabase.from("bookings").upsert({
        id: bookingId,
        resort_id: Number(resort.id),
        room_ids: resort.rooms?.[0]?.id ? [resort.rooms[0].id] : [],
        start_date: submittedData.checkInDate || null,
        end_date: submittedData.checkOutDate || null,
        check_in_time: submittedData.checkInTime || "14:00",
        check_out_time: submittedData.checkOutTime || "11:00",
        status: "Inquiry",
        booking_form: bookingForm,
      });

      if (error) throw error;
      await supabase.from("ticket_messages").insert({
        booking_id: bookingId,
        resort_id: Number(resort.id),
        sender_role: "client",
        sender_name: submittedData.guestName || "Client",
        message:
          submittedData.message?.trim() ||
          "Inquiry sent. Can we confirm rates, inclusions, and availability?",
      });
      const inquiryMessage =
        "Inquiry has been sent. Please wait for your inquiry approval link via email, where prices can be discussed.";
      persistentToast({
        message: inquiryMessage,
        color: "blue",
      });
    } catch (err) {
      toast({
        message: `Failed to send inquiry: ${err.message}`,
        color: "red",
      });
    }

    setContactOpen(false);
  };

  return (
    <div className="bg-white min-h-screen mt-10">
      <HeroSection
        onOpen={(index) => {
          setActiveIndex(index);
          setGalleryOpen(true);
        }}
      />

      <ShortcutBar />

      <ProfileSection/>

      <FacilitySection 
        facilities={resort.facilities} 
        summary={resort.description?.facilitiesSummary || ""}
        onOpen={handleOpenFacility} 
      />

      <ServicesSection services={resort.extraServices} />      

      <div className="max-w-6xl mx-auto px-4 mb-6 flex flex-col md:flex-row items-center justify-between">
        <h2 className="text-2xl font-semibold mb-4 md:mb-0">Available Rooms</h2>
      </div>
      <div className="flex flex-col lg:flex-row gap-8 px-4 lg:px-0 max-w-6xl mx-auto pb-10">
        <div className="lg:w-80 w-full lg:sticky lg:top-24">
          <RoomFilterPanel price={price} setPrice={setPrice} />
        </div>

        <div className="flex-1 w-full">
          <RoomsSection
            price={price}
            onOpenRoomGallery={(images, index = 0) => {
              setRoomImages(images);
              setRoomActiveIndex(index);
              setRoomGalleryOpen(true);
            }}
          />
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
          onSubmitInquiry={handleSubmitInquiry}
        />
      )}
      <div className="fixed bottom-5 right-5 z-40 w-[280px] bg-white border border-slate-200 shadow-2xl rounded-2xl p-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Want to inquire?</p>
        <p className="text-sm font-semibold text-slate-800 mb-3">Message the owner here</p>
        <button
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition font-bold text-sm"
          onClick={() => setContactOpen(true)}
        >
          Contact Owner
        </button>
      </div>
    <Toast/>
    <PersistentToast />
    </div>
  );
}
