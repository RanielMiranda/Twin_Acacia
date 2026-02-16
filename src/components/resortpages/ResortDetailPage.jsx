import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { resorts } from "../data/resorts";

import HeroGallery from "./Gallery/HeroGallery";
import ResortInfo from "./rooms/ResortInfo";
import RoomsSection from "./rooms/RoomsSection";
import ShortcutBar from "./rooms/ShortcutBar";

import GalleryModal from "./components/GalleryModal";
import FacilityModal from "./components/FacilityModal";
import RoomContactModal from "./components/RoomContactModal";

import RoomFilterPanel from "./components/RoomFilterPanel";

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

  const [price, setPrice] = useState(5000);

  if (!resort) {
    return (
      <div className="p-10 text-center text-gray-500">
        Resort not found
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen mt-10">
      {/* Hero Gallery */}
      <HeroGallery
        resort={resort}
        onOpen={(index) => {
          setActiveIndex(index);
          setGalleryOpen(true);
        }}
      />

      {/* Shortcut / quick actions */}
      <ShortcutBar />

      {/* Resort Info */}
      <ResortInfo
        resort={resort}
        onFacilityOpen={(index) => {
          setFacilityIndex(index);
          setFacilityOpen(true);
        }}
      />

      {/* Available Rooms Heading + Contact Owner */}
      <div className="max-w-6xl mx-auto px-4 mb-6 flex flex-col md:flex-row items-center justify-between">
        <h2 className="text-2xl font-semibold mb-4 md:mb-0">Available Rooms</h2>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          onClick={() => {
            setSelectedRoom(null); // no room preselected
            setContactOpen(true);  // open modal
          }}
        >
          Contact Owner
        </button>
      </div>

      {/* Rooms + Filter Panel */}
      <div className="flex flex-col lg:flex-row gap-8 px-4 lg:px-0 max-w-7xl mx-auto">
        <div className="lg:w-80 w-full lg:sticky lg:top-24">
          <RoomFilterPanel price={price} setPrice={setPrice} />
        </div>

        {/* Rooms Section */}
        <div className="flex-1 w-full">
          <RoomsSection
            resort={resort}
            price={price} // pass price to filter rooms if needed
            onOpenRoomGallery={(images, index = 0) => {
              setRoomImages(images);
              setRoomActiveIndex(index);
              setRoomGalleryOpen(true);
            }}
          />
        </div>
      </div>

      {/* Modals */}
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
        <RoomContactModal
          isOpen={contactOpen}
          onClose={() => setContactOpen(false)}
          resort={resort}
          room={resort || resort.price} // default to first room if none selected
        />
      )}
    </div>
  );
}
