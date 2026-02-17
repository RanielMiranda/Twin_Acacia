import React, { useState } from "react";
import { Save, Image, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "react-router-dom";


import AmenitiesEditor from "./components/AmenitiesEditor";
import HeroGalleryEditor from "./components/HeroGalleryEditor";
import ProfileEditor from "./components/ProfileEditor";
import RoomsEditor from "./components/RoomsEditor";
import ServicesEditor from "./components/ServicesEditor";

import ResortInitialData from "./data/ResortInitialData";


// Floating Action Button for Exporting
const FloatingAdminControls = ({ isSaved, onSave }) => (
  <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 items-end animate-in slide-in-from-bottom-4">
    <div className="bg-slate-900/90 text-white p-3 rounded-lg shadow-xl mb-2 text-xs backdrop-blur-md border border-slate-700">
      <p className="font-bold text-blue-400">Admin Mode Active</p>
      <p className="opacity-80">Edits preview live.</p>
    </div>
    <Button 
      onClick={onSave}
      className={`${isSaved ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} transition-all flex gap-3 rounded-full px-8 py-8 shadow-2xl text-white border-4 border-white/10`}
    >
      {isSaved ? <CheckCircle size={28} /> : <Save size={28} />}
      <span className="font-bold text-lg tracking-tight">{isSaved ? "Copied!" : "Export JS"}</span>
    </Button>
  </div>
);

// --- MAIN APP COMPONENT ---

export default function ResortBuilder() {
  const location = useLocation();

  const initialResort =
    location.state?.resort || ResortInitialData;

  const [resort, setResort] = useState(initialResort);


  const [isSaved, setIsSaved] = useState(false);

  // General Update Handler
  const updateResort = (field, value) => {
    setResort(prev => ({ ...prev, [field]: value }));
    setIsSaved(false);
  };

  const handleSave = () => {
    const jsonString = JSON.stringify(resort, null, 2);
    // Remove quotes from keys for cleaner JS
    const cleanJs = jsonString.replace(/"([^"]+)":/g, '$1:');
    const output = `${cleanJs}`;
    
    navigator.clipboard.writeText(output);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans text-slate-900 pt-10">
      
      {/* COMPONENTS */}
      <HeroGalleryEditor 
          gallery={resort.gallery} 
          onUpdate={(newGallery) => updateResort("gallery", newGallery)} 
      />
      
      <ProfileEditor 
          resort={resort} 
          onUpdate={updateResort} 
      />

      <AmenitiesEditor 
          facilities={resort.facilities} 
          onUpdate={(newFacilities) => updateResort("facilities", newFacilities)} 
      />

      <ServicesEditor 
          services={resort.extraServices} 
          onUpdate={(newServices) => updateResort("extraServices", newServices)} 
      />

      <RoomsEditor 
          rooms={resort.rooms} 
          onUpdate={(newRooms) => updateResort("rooms", newRooms)} 
      />

      {/* Floating Controls (Replaces Header) */}
      <FloatingAdminControls isSaved={isSaved} onSave={handleSave} />

    </div>
  );
}