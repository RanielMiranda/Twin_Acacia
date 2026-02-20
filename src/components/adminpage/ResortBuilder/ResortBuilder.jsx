"use client";

import { useState } from "react";
import { Save, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useResort } from "@/components/useclient/ContextEditor";

import AmenitiesEditor from "./components/AmenitiesEditor";
import HeroGalleryEditor from "./components/HeroGalleryEditor";
import ProfileEditor from "./components/ProfileEditor";
import RoomsEditor from "./components/RoomsEditor";
import ServicesEditor from "./components/ServicesEditor";
import ShortcutBar from "@/components/resortpages/rooms/ShortcutBar";

export default function ResortBuilder() {
  const { resort } = useResort();
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    if (!resort) return;

    const jsonString = JSON.stringify(resort, null, 2);
    const cleanJs = jsonString.replace(/"([^"]+)":/g, "$1:");
    navigator.clipboard.writeText(cleanJs);

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-10">

      <HeroGalleryEditor />
      <ShortcutBar />
      <ProfileEditor />
      <AmenitiesEditor />
      <ServicesEditor />
      <RoomsEditor />

      <div className="fixed bottom-6 right-6 flex items-center justify-center">
        <Button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 shadow-lg rounded-full"
        >
          {isSaved ? <CheckCircle size={20} /> : <Save size={20} />}
          <span>{isSaved ? "Copied" : "Copy Resort"}</span>
        </Button>
      </div>
    </div>
  );
}