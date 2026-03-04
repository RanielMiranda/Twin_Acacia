"use client";

import { useState, useEffect } from "react";
import { Save, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useResort } from "@/components/useclient/ContextEditor"; // Import only the hook

import FacilityEditor from "./components/facility/FacilityEditor";
import HeroGalleryEditor from "./components/HeroGalleryEditor";
import ProfileEditor from "./components/ProfileEditor";
import RoomsEditor from "./components/RoomsEditor";
import ServicesEditor from "./components/ServicesEditor";
import ShortcutBar from "./components/ShortcutBar";

import resortInitialData from "./data/ResortInitialData";

export default function ResortBuilder({ resortId }) {
  // saveResort must be destructured from useResort()
  const { resort, setResort, loadResort, saveResort, loading, setDraftScope } = useResort();
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (resortId) {
      const sameResortLoaded = resort?.id?.toString() === resortId.toString();
      if (!sameResortLoaded) {
        setDraftScope(`id:${resortId}`);
        loadResort(resortId);
      }
      return;
    }

    if (!resort) {
      setDraftScope("new");
      setResort(resortInitialData);
    }
  }, [resortId, resort?.id, resort, loadResort, setDraftScope, setResort]);
  
  if (loading && !resort) return <div className="mt-10 p-20 text-center">Fetching Resort Data...</div>;
  if (!resort) return <div className="mt-10 p-20 text-center">No resort found.</div>;

  const handleSave = async () => {
    if (!resort) return;

    // Trigger the Supabase upload and save logic
    const success = await saveResort(); 

    if (success) {
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-white pb-20 pt-10">
      <HeroGalleryEditor />
      <ShortcutBar />
      <ProfileEditor />
      <FacilityEditor />
      <ServicesEditor />
      <RoomsEditor />
      
      <div className="fixed bottom-6 right-6 z-100 flex items-center justify-center">
        <Button
          onClick={handleSave}
          disabled={loading} // Disable button while uploading images
          className="flex items-center hover:scale-105 gap-2 px-6 py-2 shadow-lg rounded-full transition-all active:scale-95"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              <span>Saving...</span>
            </>
          ) : isSaved ? (
            <>
              <CheckCircle size={20} className="text-white" />
              <span>Changes Saved</span>
            </>
          ) : (
            <>
              <Save size={20} />
              <span>Save Changes</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
