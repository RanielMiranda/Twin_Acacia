"use client";

import { Camera, Trash2, Edit3, UploadCloud, Loader2 } from "lucide-react";
import { useResort } from "@/components/useclient/ContextEditor";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

export default function HeroGalleryEditor() {
  const { resort, updateResort, uploadImage, safeSrc } = useResort();
  const [localGallery, setLocalGallery] = useState(resort.gallery || []);
  const [isUploading, setIsUploading] = useState(false);
  
  const addInputRef = useRef(null);
  const replaceInputRef = useRef(null);
  const [replacingIdx, setReplacingIdx] = useState(null);

  useEffect(() => setLocalGallery(resort.gallery || []), [resort.gallery]);

  const handleMultipleUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // DON'T call uploadImage here. 
    // Just add the File objects to the state.
    const updated = [...localGallery, ...files];
    setLocalGallery(updated);
    updateResort("gallery", updated);
    
    e.target.value = ""; 
  };

  const handleReplaceImage = (e) => {
    const file = e.target.files[0];
    if (!file || replacingIdx === null) return;

    const updated = [...localGallery];
    updated[replacingIdx] = file; // Store File object
    setLocalGallery(updated);
    updateResort("gallery", updated);
    
    setReplacingIdx(null);
    e.target.value = "";
  };

  const removeImage = (index) => {
    if (localGallery.length <= 1) {
      alert("Minimum 1 image required.");
      return;
    }
    if (confirm("Remove this photo?")) {
      const updated = localGallery.filter((_, i) => i !== index);
      setLocalGallery(updated);
      updateResort("gallery", updated);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 pt-8 relative text-black">
      {/* 🔹 Added 'multiple' attribute to this input */}
      <input 
        type="file" 
        ref={addInputRef} 
        className="hidden" 
        accept="image/*" 
        multiple 
        onChange={handleMultipleUpload} 
      />
      
      <input 
        type="file" 
        ref={replaceInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleReplaceImage} 
      />

      <div className="absolute right-4 sm:right-8 z-20 mt-2 flex items-center gap-2">
        {isUploading && (
          <div className="flex items-center gap-2 bg-white/90 px-3 py-1.5 rounded-full shadow-sm border border-blue-100">
            <Loader2 size={14} className="animate-spin text-blue-600" />
            <span className="text-xs font-bold text-blue-600">Uploading...</span>
          </div>
        )}
        <Button 
          disabled={isUploading}
          onClick={() => addInputRef.current?.click()} 
          className="bg-blue-600 hover:bg-blue-700 shadow-xl transition-all hover:scale-105 flex items-center justify-center active:scale-95"
        >
          <Camera size={16} className="mr-2 text-white" /> Add Photos
        </Button>
      </div>

      <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[50vh] md:h-[60vh] rounded-3xl overflow-hidden bg-slate-100 border-2 border-dashed border-slate-200">
        {localGallery.slice(0, 5).map((img, idx) => (
          <div key={idx} className={`relative group ${idx === 0 ? "col-span-2 row-span-2" : ""} bg-slate-200`}>
            {safeSrc(img) && <img src={safeSrc(img)} alt="" className="w-full h-full object-cover transition duration-500" />}
            
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
              <button 
                onClick={() => {
                  setReplacingIdx(idx);
                  replaceInputRef.current?.click();
                }} 
                className="p-2 bg-white rounded-full hover:bg-blue-50 text-slate-700 shadow-lg transition transform hover:scale-110"
              >
                <Edit3 size={18} />
              </button>
              <button 
                onClick={() => removeImage(idx)} 
                className="p-2 bg-white rounded-full hover:bg-red-50 text-red-500 shadow-lg transition transform hover:scale-110"
              >
                <Trash2 size={18} />
              </button>
            </div>

            {idx === 4 && localGallery.length > 5 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xl font-bold pointer-events-none">
                +{localGallery.length - 5}
              </div>
            )}
          </div>
        ))}

        {localGallery.length === 0 && (
          <div className="col-span-4 row-span-2 flex flex-col items-center justify-center text-slate-400 gap-2">
            <UploadCloud size={48} strokeWidth={1} />
            <p className="font-medium">Gallery is empty</p>
          </div>
        )}
      </div>

      {localGallery.length > 5 && (
        <div className="mt-6 flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
          {localGallery.map((img, idx) => (
            <div key={idx} className="relative flex-shrink-0 w-40 h-28 rounded-2xl overflow-hidden bg-slate-200 shadow-sm border-2 border-white group">
              <img src={safeSrc(img)} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition">
                <button 
                  onClick={() => {
                    setReplacingIdx(idx);
                    replaceInputRef.current?.click();
                  }} 
                  className="p-1.5 bg-white rounded-full text-slate-700"
                >
                  <Edit3 size={14} />
                </button>
                <button 
                  onClick={() => removeImage(idx)} 
                  className="p-1.5 bg-white rounded-full text-red-500"
                >
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