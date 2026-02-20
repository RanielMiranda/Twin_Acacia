"use client";

import React, { useState, useEffect } from "react";
import { resorts } from "../data/resorts";
import { useResort } from "../useclient/ContextEditor";

import HeroGallery from "./Gallery/HeroGallery";
import ResortInfo from "./rooms/ResortInfo";
import RoomsSection from "./rooms/RoomsSection";
import ShortcutBar from "./rooms/ShortcutBar";

import GalleryModal from "./components/GalleryModal";
import FacilityModal from "./components/FacilityModal";
import ContactOwnerModal from "./components/ContactOwnerModal";
import RoomFilterPanel from "./rooms/RoomFilterPanel";

export default function ResortDetailPage({ name }) {
  const { resort, setResort } = useResort();

  const [facilityIndex, setFacilityIndex] = useState(0);
  const [facilityOpen, setFacilityOpen] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [roomGalleryOpen, setRoomGalleryOpen] = useState(false);
  const [roomActiveIndex, setRoomActiveIndex] = useState(0);
  const [roomImages, setRoomImages] = useState([]);
  const [contactOpen, setContactOpen] = useState(false);
  const [price, setPrice] = useState(5000);

  useEffect(() => {
    if (!name) return;

    const found = resorts.find(
      (r) => r.name === decodeURIComponent(name)
    );

    if (found) {
      setResort(found);
    }
  }, [name, setResort]);

  if (!resort) {
    return (
      <div className="p-10 text-center text-gray-500">
        Resort not found
      </div>
    );
  }
  
  return (
    <div className="bg-white min-h-screen mt-10">
      <HeroGallery
        onOpen={(index) => {
          setActiveIndex(index);
          setGalleryOpen(true);
        }}
      />

      <ShortcutBar />

      <ResortInfo
        onFacilityOpen={(index) => {
          setFacilityIndex(index);
          setFacilityOpen(true);
        }}
      />

      <div className="max-w-6xl mx-auto px-4 mb-6 flex flex-col md:flex-row items-center justify-between">
        <h2 className="text-2xl font-semibold mb-4 md:mb-0">Available Rooms</h2>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-2xl hover:bg-blue-700 transition hover:scale-105"
          onClick={() => setContactOpen(true)}
        >
          Contact Owner
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 px-4 lg:px-0 max-w-7xl mx-auto pb-10">
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

      {/* Modals remain mostly the same but reference 'resort' from context */}
      {galleryOpen && (
        <GalleryModal
          images={resort.gallery}
          activeIndex={activeIndex}
          setActiveIndex={setActiveIndex}
          onClose={() => setGalleryOpen(false)}
        />
      )}

      {facilityOpen && (
        <FacilityModal
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
      />
    )}
    </div>
  );
}