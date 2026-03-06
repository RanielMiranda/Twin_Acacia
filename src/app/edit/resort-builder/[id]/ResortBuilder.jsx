"use client";

import { useState, useEffect } from "react";
import { Save, CheckCircle, Loader2, ClipboardList, Copy } from "lucide-react";
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
      
      <div className="fixed bottom-6 right-6 z-[100] w-[320px] rounded-2xl border border-slate-200 bg-white/95 backdrop-blur shadow-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <ClipboardList size={16} className="text-slate-500" />
          <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Clipboard</p>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {["•", "—", "→", "★", "✓"].map((symbol) => (
            <button
              key={symbol}
              onClick={() => navigator.clipboard.writeText(symbol)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              <Copy size={12} />
              <span>{symbol}</span>
            </button>
          ))}
        </div>
        <Button
          onClick={handleSave}
          disabled={loading}
          className="w-full flex items-center justify-center hover:scale-[1.01] gap-2 px-6 py-2 shadow-lg rounded-xl transition-all active:scale-[0.99]"
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
