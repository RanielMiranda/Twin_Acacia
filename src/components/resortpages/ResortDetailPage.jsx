import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { resorts } from "../data/resorts";

import HeroGallery from "./Gallery/HeroGallery";
import ShortcutBar from "./rooms/ShortcutBar";
import ResortInfo from "./rooms/ResortInfo";
import RoomsSection from "./rooms/RoomsSection";
import GalleryModal from "./components/GalleryModal";
import FacilityModal from "./components/FacilityModal";

import ContactModal from "../ui/modals/ContactModal";
import InquiryForm from "./components/InquiryForm";
import RoomContactModal from "./components/RoomContactModal";

export default function ResortDetailPage() {
  const { name } = useParams();
  const resort = resorts.find((r) => r.name === decodeURIComponent(name));

  const [facilityIndex, setFacilityIndex] = useState(0);
  const [facilityOpen, setFacilityOpen] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [roomGalleryOpen, setRoomGalleryOpen] = useState(false);
  const [roomActiveIndex, setRoomActiveIndex] = useState(0);
  const [roomImages, setRoomImages] = useState([]);
  const [contactOpen, setContactOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  if (!resort) {
    return (
      <div className="p-10 text-center text-gray-500">
        Resort not found
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen mt-10">
      <HeroGallery
        resort={resort}
        onOpen={(index) => {
          setActiveIndex(index);
          setGalleryOpen(true);
        }}
      />

    <ShortcutBar />

    <ResortInfo
      resort={resort}
      onFacilityOpen={(index) => {
        setFacilityIndex(index);
        setFacilityOpen(true);
      }}
    />

    <RoomsSection
      resort={resort}
      onOpenRoomGallery={(images, index = 0) => {
        setRoomImages(images);
        setRoomActiveIndex(index);
        setRoomGalleryOpen(true);
      }}
      onViewRoomDetails={(room) => {
        setSelectedRoom(room);
        setContactOpen(true);
      }}
    />

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

    {contactOpen && selectedRoom && (
      <RoomContactModal
        isOpen={contactOpen}
        onClose={() => setContactOpen(false)}
        resort={resort}
        room={selectedRoom}
      />
    )}

  </div>
  );
}
