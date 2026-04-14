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
  const validGallery = localGallery.filter(Boolean);
  const galleryLength = validGallery.length;

  const renderGallery = () => {
    if (galleryLength === 0) {
      return (
        <div className="flex h-[420px] flex-col items-center justify-center gap-2 rounded-[2rem] border-2 border-dashed border-slate-200 bg-slate-50 text-slate-400 md:h-[520px]">
          <UploadCloud size={48} strokeWidth={1} />
          <p className="font-medium">Gallery is empty</p>
        </div>
      );
    }

    if (galleryLength === 1) {
      return (
        <div className="h-[420px] overflow-hidden rounded-[2rem] border border-white/70 bg-white/60 p-3 shadow-[0_28px_80px_rgba(15,23,42,0.12)] md:h-[520px]">
          <div className="group relative h-full w-full overflow-hidden rounded-[1.5rem] bg-slate-200">
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
        </div>
      );
    }

    if (galleryLength === 2) {
      return (
        <div className="h-[420px] gap-3 overflow-hidden rounded-[2rem] border border-white/70 bg-white/60 p-3 shadow-[0_28px_80px_rgba(15,23,42,0.12)] md:h-[520px] flex">
          <div className="group relative h-full w-1/2 overflow-hidden rounded-l-[1.5rem] bg-slate-200">
            <img src={safeSrc(validGallery[0])} alt="" className="h-full w-full object-cover transition duration-500" />
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
          <div className="group relative h-full w-1/2 overflow-hidden rounded-r-[1.5rem] bg-slate-200">
            <img src={safeSrc(validGallery[1])} alt="" className="h-full w-full object-cover transition duration-500" />
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition group-hover:opacity-100">
              <button
                onClick={() => {
                  setReplacingIdx(1);
                  replaceInputRef.current?.click();
                }}
                className="rounded-full bg-white p-2 text-slate-700 shadow-lg transition hover:scale-110"
              >
                <Edit3 size={18} />
              </button>
              <button onClick={() => removeImage(1)} className="rounded-full bg-white p-2 text-red-500 shadow-lg transition hover:scale-110">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (galleryLength === 3) {
      return (
        <div className="h-[420px] gap-3 overflow-hidden rounded-[2rem] border border-white/70 bg-white/60 p-3 shadow-[0_28px_80px_rgba(15,23,42,0.12)] md:h-[520px] flex">
          <div className="group relative h-full w-3/5 overflow-hidden rounded-l-[1.5rem] bg-slate-200">
            <img src={safeSrc(validGallery[0])} alt="" className="h-full w-full object-cover transition duration-500" />
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
          <div className="grid h-full w-2/5 grid-rows-2 gap-3">
            <div className="group relative overflow-hidden rounded-tr-[1.5rem] bg-slate-200">
              <img src={safeSrc(validGallery[1])} alt="" className="h-full w-full object-cover transition duration-500" />
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition group-hover:opacity-100">
                <button
                  onClick={() => {
                    setReplacingIdx(1);
                    replaceInputRef.current?.click();
                  }}
                  className="rounded-full bg-white p-2 text-slate-700 shadow-lg transition hover:scale-110"
                >
                  <Edit3 size={18} />
                </button>
                <button onClick={() => removeImage(1)} className="rounded-full bg-white p-2 text-red-500 shadow-lg transition hover:scale-110">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <div className="group relative overflow-hidden rounded-br-[1.5rem] bg-slate-200">
              <img src={safeSrc(validGallery[2])} alt="" className="h-full w-full object-cover transition duration-500" />
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition group-hover:opacity-100">
                <button
                  onClick={() => {
                    setReplacingIdx(2);
                    replaceInputRef.current?.click();
                  }}
                  className="rounded-full bg-white p-2 text-slate-700 shadow-lg transition hover:scale-110"
                >
                  <Edit3 size={18} />
                </button>
                <button onClick={() => removeImage(2)} className="rounded-full bg-white p-2 text-red-500 shadow-lg transition hover:scale-110">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (galleryLength === 4) {
      return (
        <div className="h-[420px] gap-3 overflow-hidden rounded-[2rem] border border-white/70 bg-white/60 p-3 shadow-[0_28px_80px_rgba(15,23,42,0.12)] md:h-[520px] flex">
          <div className="group relative h-full w-3/5 overflow-hidden rounded-l-[1.5rem] bg-slate-200">
            <img src={safeSrc(validGallery[0])} alt="" className="h-full w-full object-cover transition duration-500" />
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
          <div className="grid h-full w-2/5 grid-rows-2 gap-3">
            <div className="grid grid-cols-2 gap-3 h-full">
              <div className="group relative overflow-hidden bg-slate-200">
                <img src={safeSrc(validGallery[1])} alt="" className="h-full w-full object-cover transition duration-500" />
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition group-hover:opacity-100">
                  <button
                    onClick={() => {
                      setReplacingIdx(1);
                      replaceInputRef.current?.click();
                    }}
                    className="rounded-full bg-white p-2 text-slate-700 shadow-lg transition hover:scale-110"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button onClick={() => removeImage(1)} className="rounded-full bg-white p-2 text-red-500 shadow-lg transition hover:scale-110">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div className="group relative overflow-hidden rounded-tr-[1.5rem] bg-slate-200">
                <img src={safeSrc(validGallery[2])} alt="" className="h-full w-full object-cover transition duration-500" />
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition group-hover:opacity-100">
                  <button
                    onClick={() => {
                      setReplacingIdx(2);
                      replaceInputRef.current?.click();
                    }}
                    className="rounded-full bg-white p-2 text-slate-700 shadow-lg transition hover:scale-110"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button onClick={() => removeImage(2)} className="rounded-full bg-white p-2 text-red-500 shadow-lg transition hover:scale-110">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
            <div className="group relative overflow-hidden rounded-br-[1.5rem] bg-slate-200">
              <img src={safeSrc(validGallery[3])} alt="" className="h-full w-full object-cover transition duration-500" />
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition group-hover:opacity-100">
                <button
                  onClick={() => {
                    setReplacingIdx(3);
                    replaceInputRef.current?.click();
                  }}
                  className="rounded-full bg-white p-2 text-slate-700 shadow-lg transition hover:scale-110"
                >
                  <Edit3 size={18} />
                </button>
                <button onClick={() => removeImage(3)} className="rounded-full bg-white p-2 text-red-500 shadow-lg transition hover:scale-110">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    const extraCount = galleryLength > 5 ? galleryLength - 5 : 0;

    return (
      <div className="flex h-[420px] gap-3 overflow-hidden rounded-[2rem] border border-white/70 bg-white/60 p-3 shadow-[0_28px_80px_rgba(15,23,42,0.12)] md:h-[520px]">
        <div className="group relative h-full w-3/5 overflow-hidden rounded-l-[1.5rem] bg-slate-200">
          <img src={safeSrc(validGallery[0])} alt="" className="h-full w-full object-cover transition duration-500" />
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

        <div className="grid h-full w-2/5 grid-rows-2 gap-3">
          <div className="grid grid-cols-2 gap-3 h-full">
            <div className="group relative overflow-hidden bg-slate-200">
              {validGallery[1] ? (
                <>
                  <img src={safeSrc(validGallery[1])} alt="" className="h-full w-full object-cover transition duration-500" />
                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition group-hover:opacity-100">
                    <button
                      onClick={() => {
                        setReplacingIdx(1);
                        replaceInputRef.current?.click();
                      }}
                      className="rounded-full bg-white p-2 text-slate-700 shadow-lg transition hover:scale-110"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button onClick={() => removeImage(1)} className="rounded-full bg-white p-2 text-red-500 shadow-lg transition hover:scale-110">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400">
                  <UploadCloud size={24} />
                </div>
              )}
            </div>
            <div className="group relative overflow-hidden rounded-tr-[1.5rem] bg-slate-200">
              {validGallery[2] ? (
                <>
                  <img src={safeSrc(validGallery[2])} alt="" className="h-full w-full object-cover transition duration-500" />
                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition group-hover:opacity-100">
                    <button
                      onClick={() => {
                        setReplacingIdx(2);
                        replaceInputRef.current?.click();
                      }}
                      className="rounded-full bg-white p-2 text-slate-700 shadow-lg transition hover:scale-110"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button onClick={() => removeImage(2)} className="rounded-full bg-white p-2 text-red-500 shadow-lg transition hover:scale-110">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400">
                  <UploadCloud size={24} />
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 h-full">
            <div className="group relative overflow-hidden rounded-bl-none bg-slate-200">
              {validGallery[3] ? (
                <>
                  <img src={safeSrc(validGallery[3])} alt="" className="h-full w-full object-cover transition duration-500" />
                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition group-hover:opacity-100">
                    <button
                      onClick={() => {
                        setReplacingIdx(3);
                        replaceInputRef.current?.click();
                      }}
                      className="rounded-full bg-white p-2 text-slate-700 shadow-lg transition hover:scale-110"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button onClick={() => removeImage(3)} className="rounded-full bg-white p-2 text-red-500 shadow-lg transition hover:scale-110">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400">
                  <UploadCloud size={24} />
                </div>
              )}
            </div>
            <div className="group relative overflow-hidden rounded-br-[1.5rem] bg-slate-200">
              {validGallery[4] ? (
                <>
                  <img src={safeSrc(validGallery[4])} alt="" className="h-full w-full object-cover transition duration-500" />
                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition group-hover:opacity-100">
                    <button
                      onClick={() => {
                        setReplacingIdx(4);
                        replaceInputRef.current?.click();
                      }}
                      className="rounded-full bg-white p-2 text-slate-700 shadow-lg transition hover:scale-110"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button onClick={() => removeImage(4)} className="rounded-full bg-white p-2 text-red-500 shadow-lg transition hover:scale-110">
                      <Trash2 size={18} />
                    </button>
                  </div>
                  {extraCount > 0 ? (
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/50 text-lg font-semibold text-white">
                      +{extraCount}
                    </div>
                  ) : null}
                </>
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400">
                  <UploadCloud size={24} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

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
        <Button onClick={() => addInputRef.current?.click()} className="bg-blue-600 shadow-xl transition-all hover:-translate-y-0.5 hover:bg-blue-700 flex items-center justify-center">
          <Camera size={16} className="mr-2 text-white" />
          Add Photos
        </Button>
      </div>

      {renderGallery()}

      {galleryLength > 0 && (
        <div className="mt-4 flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {validGallery.map((img, idx) => (
            <div key={idx} className="relative w-24 h-16 shrink-0 rounded-lg overflow-hidden group/thumb border border-slate-200">
              <img src={safeSrc(img)} className="w-full h-full object-cover" alt="" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center gap-1 transition">
                <button
                  onClick={() => {
                    setReplacingIdx(idx);
                    replaceInputRef.current?.click();
                  }}
                  className="p-1 bg-white rounded-full text-slate-700"
                >
                  <Edit3 size={12} />
                </button>
                <button onClick={() => removeImage(idx)} className="p-1 bg-white rounded-full text-red-500">
                  <Trash2 size={12} />
                </button>
              </div>
              <span className="absolute bottom-1 right-1 text-[10px] font-bold text-white drop-shadow-md">{idx + 1}</span>
            </div>
          ))}
          <button
            onClick={() => addInputRef.current?.click()}
            className="w-24 h-16 shrink-0 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:border-blue-400 hover:text-blue-500 transition-colors"
          >
            <Camera size={20} />
          </button>
        </div>
      )}
    </div>
  );
}
