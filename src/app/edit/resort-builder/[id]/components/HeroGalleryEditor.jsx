"use client";

import { Camera, Edit3, Trash2, UploadCloud } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useResort } from "@/components/useclient/ContextEditor";

export default function HeroGalleryEditor() {
  const { resort, updateResort, safeSrc } = useResort();
  const localGallery = resort.gallery || [];
  const addInputRef = useRef(null);
  const replaceInputRef = useRef(null);
  const [replacingIdx, setReplacingIdx] = useState(null);

  const handleMultipleUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    updateResort("gallery", [...localGallery, ...files]);
    e.target.value = "";
  };

  const handleReplaceImage = (e) => {
    const file = e.target.files[0];
    if (!file || replacingIdx === null) return;
    const updated = [...localGallery];
    updated[replacingIdx] = file;
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
      updateResort("gallery", localGallery.filter((_, i) => i !== index));
    }
  };

  const mainImage = localGallery[0];
  const rightImages = [localGallery[1] || mainImage, localGallery[2] || mainImage, localGallery[3] || mainImage, localGallery[4] || mainImage];
  const extraCount = localGallery.length > 5 ? localGallery.length - 5 : 0;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pt-8 text-black">
      <input type="file" ref={addInputRef} className="hidden" accept="image/*" multiple onChange={handleMultipleUpload} />
      <input type="file" ref={replaceInputRef} className="hidden" accept="image/*" onChange={handleReplaceImage} />

      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-blue-600">Resort overview</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">
            {resort.name || "Resort name"}
          </h1>
        </div>
        <Button onClick={() => addInputRef.current?.click()} className="bg-blue-600 shadow-xl transition-all hover:-translate-y-0.5 hover:bg-blue-700">
          <Camera size={16} className="mr-2 text-white" />
          Add Photos
        </Button>
      </div>

      {localGallery.length > 0 ? (
        <div className="flex h-[420px] gap-3 overflow-hidden rounded-[2rem] border border-white/70 bg-white/60 p-3 shadow-[0_28px_80px_rgba(15,23,42,0.12)] md:h-[520px]">
          <div className="group relative h-full w-3/4 overflow-hidden rounded-l-[1.5rem] rounded-r-none bg-slate-200">
            <img src={safeSrc(mainImage)} alt="" className="h-full w-full object-cover transition duration-500" />
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition group-hover:opacity-100">
              <button
                onClick={() => {
                  setReplacingIdx(0);
                  replaceInputRef.current?.click();
                }}
                className="rounded-full bg-white p-2 text-slate-700 shadow-lg transition hover:scale-110"
              >
                <Edit3 size={18} />
              </button>
              <button onClick={() => removeImage(0)} className="rounded-full bg-white p-2 text-red-500 shadow-lg transition hover:scale-110">
                <Trash2 size={18} />
              </button>
            </div>
          </div>

          <div className="grid h-full w-1/4 grid-cols-2 grid-rows-2 gap-3">
            {rightImages.map((img, idx) => {
              const imageIndex = idx + 1;
              const shapeClass =
                idx === 0
                  ? "rounded-tl-none rounded-tr-[1.5rem] rounded-bl-none rounded-br-none"
                  : idx === 1
                    ? "rounded-none"
                    : idx === 2
                      ? "rounded-none"
                      : "rounded-tl-none rounded-tr-none rounded-bl-none rounded-br-[1.5rem]";

              return (
                <div key={imageIndex} className={`group relative overflow-hidden bg-slate-200 ${shapeClass}`}>
                  <img src={safeSrc(img)} alt="" className="h-full w-full object-cover transition duration-500" />
                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition group-hover:opacity-100">
                    <button
                      onClick={() => {
                        setReplacingIdx(imageIndex);
                        replaceInputRef.current?.click();
                      }}
                      className="rounded-full bg-white p-2 text-slate-700 shadow-lg transition hover:scale-110"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button onClick={() => removeImage(imageIndex)} className="rounded-full bg-white p-2 text-red-500 shadow-lg transition hover:scale-110">
                      <Trash2 size={18} />
                    </button>
                  </div>
                  {idx === 3 && extraCount > 0 ? (
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/50 text-lg font-semibold text-white">
                      +{extraCount}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex h-[420px] flex-col items-center justify-center gap-2 rounded-[2rem] border-2 border-dashed border-slate-200 bg-slate-50 text-slate-400 md:h-[520px]">
          <UploadCloud size={48} strokeWidth={1} />
          <p className="font-medium">Gallery is empty</p>
        </div>
      )}

      <div className="mt-2 flex justify-end">
        <button
          onClick={() => addInputRef.current?.click()}
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-950"
        >
          Open full gallery
        </button>
      </div>
    </div>
  );
}
