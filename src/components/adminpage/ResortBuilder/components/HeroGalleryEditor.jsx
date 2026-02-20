import { Camera, Trash2, Edit3 } from "lucide-react";
import { useResort } from "@/components/useclient/ContextEditor";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function HeroGalleryEditor() {
  const { resort, updateResort, safeSrc } = useResort();
  const [localGallery, setLocalGallery] = useState(resort.gallery || []);

  // Sync if context changes externally
  useEffect(() => setLocalGallery(resort.gallery || []), [resort.gallery]);

  const addImage = () => {
    const url = prompt("Enter Image URL:");
    if (!url) return;
    const updated = [...localGallery, url];
    setLocalGallery(updated);
    updateResort("gallery", updated);
  };

  const removeImage = (index) => {
    if (localGallery.length <= 1) {
      alert("You must have at least one hero image.");
      return;
    }
    if (window.confirm("Remove this image?")) {
      const updated = localGallery.filter((_, i) => i !== index);
      setLocalGallery(updated);
      updateResort("gallery", updated);
    }
  };

  const updateImageLocal = (index) => {
    const url = prompt("Update Image URL:", localGallery[index]);
    if (!url) return;
    const updated = [...localGallery];
    updated[index] = url;
    setLocalGallery(updated);
    updateResort("gallery", updated);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 pt-8 relative text-black">
      {/* Add Button */}
      <div className="absolute right-4 sm:right-8 z-20 mt-2">
        <Button onClick={addImage} className="backdrop-blur-sm flex items-center justify-center">
          <Camera size={16} className="mr-2 text-white" /> Add Photo
        </Button>
      </div>

      {/* Main Hero Grid */}
      <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[60vh] sm:h-[50vh] md:h-[60vh] rounded-2xl overflow-hidden bg-slate-100 border-2 border-dashed border-transparent hover:border-blue-400 transition-colors">
        {localGallery.slice(0, 5).map((img, idx) => (
          <div key={idx} className={`relative group ${idx === 0 ? "col-span-2 row-span-2" : ""} bg-slate-200`}>
            {safeSrc(img) && <img src={safeSrc(img)} alt="" className="w-full h-full object-cover" />}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
              <button onClick={() => updateImageLocal(idx)} className="p-2 bg-white rounded-full hover:bg-blue-50 text-black">
                <Edit3 size={16} />
              </button>
              <button onClick={() => removeImage(idx)} className="p-2 bg-white rounded-full hover:bg-red-50 text-red-500">
                <Trash2 size={16} />
              </button>
            </div>
            {idx === 4 && localGallery.length > 5 && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-semibold pointer-events-none">
                +{localGallery.length - 5} more
              </div>
            )}
          </div>
        ))}
        {localGallery.length === 0 && (
          <div className="col-span-4 row-span-2 flex items-center justify-center text-slate-400">
            No images added. Click "Add Photo" to start.
          </div>
        )}
      </div>

      {/* Full Gallery List */}
      {localGallery.length > 5 && (
        <div className="mt-6 overflow-x-auto flex gap-2 py-2">
          {localGallery.map((img, idx) => (
            <div key={idx} className="relative flex-shrink-0 w-32 h-[15vh] rounded-lg overflow-hidden bg-slate-200">
              <img src={safeSrc(img)} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 flex items-center justify-center gap-1 transition">
                <button onClick={() => updateImageLocal(idx)} className="p-1 bg-white rounded-full hover:bg-blue-50 text-black">
                  <Edit3 size={14} />
                </button>
                <button onClick={() => removeImage(idx)} className="p-1 bg-white rounded-full hover:bg-red-50 text-red-500">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
