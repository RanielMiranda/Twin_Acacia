import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Save, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useResort } from "@/components/context/ContextEditor";

import AmenitiesEditor from "./components/AmenitiesEditor";
import HeroGalleryEditor from "./components/HeroGalleryEditor";
import ProfileEditor from "./components/ProfileEditor";
import RoomsEditor from "./components/RoomsEditor";
import ServicesEditor from "./components/ServicesEditor";

export default function ResortBuilder() {
  const { resort, setResort } = useResort();
  const location = useLocation();

  const [isSaved, setIsSaved] = useState(false);

  // 🔥 Proper Edit Initialization
  useEffect(() => {
    if (location.state?.resort) {
      setResort(location.state.resort);
    }
  }, [location.state, setResort]);

  const handleSave = () => {
    const jsonString = JSON.stringify(resort, null, 2);
    const cleanJs = jsonString.replace(/"([^"]+)":/g, "$1:");
    navigator.clipboard.writeText(cleanJs);

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-10">

      <HeroGalleryEditor />
      <ProfileEditor />
      <AmenitiesEditor />
      <ServicesEditor />
      <RoomsEditor />

      <div className="fixed bottom-6 right-6">
        <Button onClick={handleSave}>
          {isSaved ? <CheckCircle size={20} /> : <Save size={20} />}
        </Button>
      </div>
    </div>
  );
}
