"use client";

import { 
  Plus, Trash2, Image as ImageIcon, 
  Users, BedDouble, Camera, X, Upload, Edit3, GripVertical
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState, useRef, useEffect } from "react";
import { useResort } from "@/components/useclient/ContextEditor";

// --- DND Kit Imports ---
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, horizontalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// --- Helper Components for "Update on Blur" ---
const BlurInput = ({ value, onChange, ...props }) => {
  const [localVal, setLocalVal] = useState(value);
  useEffect(() => setLocalVal(value), [value]);

  return (
    <input
      {...props}
      value={localVal}
      onChange={(e) => setLocalVal(e.target.value)}
      onBlur={() => onChange(localVal)}
      onKeyDown={(e) => e.key === "Enter" && e.target.blur()}
    />
  );
};

const BlurTextArea = ({ value, onChange, ...props }) => {
  const [localVal, setLocalVal] = useState(value);
  useEffect(() => setLocalVal(value), [value]);

  return (
    <textarea
      {...props}
      value={localVal}
      onChange={(e) => setLocalVal(e.target.value)}
      onBlur={() => onChange(localVal)}
    />
  );
};

// --- Sortable Tag Component ---
function SortableRoomTag({ id, tag, onRemove, onUpdate }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const [localVal, setLocalVal] = useState(tag);
  useEffect(() => setLocalVal(tag), [tag]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 hover:bg-blue-50 hover:text-blue-700 transition-all border border-transparent ${isDragging ? "shadow-md ring-2 ring-blue-400 opacity-50" : ""}`}
    >
      <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-blue-600">
        <GripVertical size={12} />
      </button>
      <input 
        className="bg-transparent border-none p-0 focus:ring-0 text-xs font-medium w-auto max-w-[100px]"
        value={localVal}
        placeholder="Tag..."
        onChange={(e) => setLocalVal(e.target.value)}
        onBlur={() => onUpdate(localVal)}
        onKeyDown={(e) => e.key === "Enter" && e.target.blur()}
      />
      <X size={12} className="cursor-pointer text-slate-400 hover:text-red-500" onClick={onRemove} />
    </div>
  );
}

export default function RoomsEditor() {
  const { resort, updateResort, safeSrc } = useResort();
  const rooms = resort?.rooms || []; // Derive entirely from Context
  const [activeRoomId, setActiveRoomId] = useState(null);
  
  const fileInputRef = useRef(null);
  const replaceInputRef = useRef(null);
  const [replacingIdx, setReplacingIdx] = useState(null);
  const roomsEndRef = useRef(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const scrollToLatestRoom = () => {
    roomsEndRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const addRoom = () => {
    const newRoom = { 
        id: Date.now(), 
        name: "New Room", 
        guests: 6, 
        beds: "3 Queen Sized Bed", 
        details: "", 
        gallery: [], 
        tags: ["Air Conditioning", "Toilet", "Bath", "Blanket"] 
    };
    updateResort("rooms", [...rooms, newRoom]);
    setTimeout(scrollToLatestRoom, 100);
  };

  const handleRoomUpdate = (id, updates) => {
    const updatedRooms = rooms.map(r => r.id === id ? { ...r, ...updates } : r);
    updateResort("rooms", updatedRooms);
  };

  const handleTagDragEnd = (event, roomId) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const room = rooms.find(r => r.id === roomId);
      const oldIndex = room.tags.indexOf(active.data.current?.tag || room.tags[parseInt(active.id.split('-').pop())]);
      const newIndex = room.tags.indexOf(over.data.current?.tag || room.tags[parseInt(over.id.split('-').pop())]);
      handleRoomUpdate(roomId, { tags: arrayMove(room.tags, oldIndex, newIndex) });
    }
  };

  const handleUpload = (e, roomId) => {
    const files = Array.from(e.target.files);
    const room = rooms.find(r => r.id === roomId);
    handleRoomUpdate(roomId, { gallery: [...(room.gallery || []), ...files] });
    e.target.value = "";
  };

  const handleReplaceImage = (e) => {
    const file = e.target.files[0];
    if (!file || replacingIdx === null || !activeRoomId) return;
    const room = rooms.find(r => r.id === activeRoomId);
    const updatedGallery = [...room.gallery];
    updatedGallery[replacingIdx] = file;
    handleRoomUpdate(activeRoomId, { gallery: updatedGallery });
    setReplacingIdx(null);
    e.target.value = "";
  };

  return (
    <div id="rooms" className="max-w-6xl mx-auto px-4 mt-8 pb-32">
      <input type="file" multiple accept="image/*" ref={fileInputRef} className="hidden" onChange={(e) => handleUpload(e, activeRoomId)} />
      <input type="file" accept="image/*" ref={replaceInputRef} className="hidden" onChange={handleReplaceImage} />

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-slate-800">Available Rooms</h2>
        <Button onClick={addRoom} className="rounded-full hover:scale-105 bg-blue-600 hover:bg-blue-700 text-white shadow-lg flex items-center justify-center">
          <Plus size={16} className="mr-2"/> Add Room
        </Button>
      </div>

      <div className="flex flex-col gap-6">
        {rooms.map(room => (
          <Card key={room.id} className="rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-sm border border-slate-100 bg-white">
            
            {/* DYNAMIC IMAGE MOSAIC */}
            <div className="md:w-1/2 h-[280px] relative group p-1">
              {/* Case 1: Only 1 Image */}
              {room.gallery?.length === 1 && (
                <div className="w-full h-full relative group/item overflow-hidden rounded-2xl bg-slate-100">
                  <img src={safeSrc(room.gallery[0])} className="object-cover w-full h-full" alt="" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/item:opacity-100 transition flex items-center justify-center gap-2">
                    <button onClick={() => { setActiveRoomId(room.id); setReplacingIdx(0); replaceInputRef.current.click(); }} className="p-2 bg-white rounded-full text-slate-700 hover:scale-110 transition">
                      <Edit3 size={16} />
                    </button>
                    <button onClick={() => handleRoomUpdate(room.id, { gallery: [] })} className="p-2 bg-white rounded-full text-red-500 hover:scale-110 transition">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* Case 2: Exactly 2 Images */}
              {room.gallery?.length === 2 && (
                <div className="grid grid-cols-2 gap-1 h-full">
                  {room.gallery.map((img, idx) => (
                    <div key={idx} className={`relative group/item overflow-hidden bg-slate-100 ${idx === 0 ? "rounded-l-2xl" : "rounded-r-2xl"}`}>
                      <img src={safeSrc(img)} className="object-cover w-full h-full" alt="" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/item:opacity-100 transition flex items-center justify-center gap-2">
                        <button onClick={() => { setActiveRoomId(room.id); setReplacingIdx(idx); replaceInputRef.current.click(); }} className="p-2 bg-white rounded-full text-slate-700 hover:scale-110 transition">
                          <Edit3 size={16} />
                        </button>
                        <button onClick={() => handleRoomUpdate(room.id, { gallery: room.gallery.filter((_, i) => i !== idx) })} className="p-2 bg-white rounded-full text-red-500 hover:scale-110 transition">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Case 3: 3 or More Images (Current Mosaic) */}
              {(room.gallery?.length >= 3 || !room.gallery?.length) && (
                <div className="grid grid-cols-2 grid-rows-2 gap-1 h-full">
                  {[0, 1, 2].map((idx) => (
                    <div 
                      key={idx} 
                      className={`relative group/item overflow-hidden bg-slate-100
                        ${idx === 0 ? "col-span-1 row-span-2 rounded-tl-2xl rounded-bl-2xl" : "col-span-1"}
                        ${idx === 1 ? "rounded-tr-2xl" : ""}
                        ${idx === 2 ? "rounded-br-2xl" : ""}
                      `}
                    >
                      {room.gallery?.[idx] ? (
                        <>
                          <img src={safeSrc(room.gallery[idx])} className="object-cover w-full h-full" alt="" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/item:opacity-100 transition flex items-center justify-center gap-2">
                             <button onClick={() => { setActiveRoomId(room.id); setReplacingIdx(idx); replaceInputRef.current.click(); }} className="p-2 bg-white rounded-full text-slate-700 hover:scale-110 transition">
                                <Edit3 size={16} />
                             </button>
                             <button onClick={() => handleRoomUpdate(room.id, { gallery: room.gallery.filter((_, i) => i !== idx) })} className="p-2 bg-white rounded-full text-red-500 hover:scale-110 transition">
                                <Trash2 size={16} />
                             </button>
                          </div>
                        </>
                      ) : (
                        idx === 0 && (
                          <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-2">
                            <ImageIcon size={40} strokeWidth={1}/>
                            <button onClick={() => { setActiveRoomId(room.id); fileInputRef.current.click(); }} className="text-xs font-bold text-blue-500 underline">Add Photos</button>
                          </div>
                        )
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* ROOM INFO */}
            <div className="md:w-1/2 p-6 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <BlurInput 
                  className="text-xl font-semibold w-full bg-transparent border-none p-0 focus:ring-0" 
                  value={room.name} 
                  onChange={(val) => handleRoomUpdate(room.id, { name: val })} 
                  placeholder="Room Name" 
                />
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => { setActiveRoomId(room.id); fileInputRef.current.click(); }}
                    className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                    title="Add Images"
                  >
                    <Camera size={18}/>
                  </button>
                  <button 
                    onClick={() => { if(confirm(`Remove ${room.name}?`)) updateResort("rooms", rooms.filter(r => r.id !== room.id)) }} 
                    className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18}/>
                  </button>
                </div>
              </div>

              {/* STATS */}
              <div className="flex gap-2 text-sm mb-4">
                <span className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-2xl border border-blue-100">
                  <Users size={14} className="text-blue-600"/> 
                  <BlurInput 
                    type="number" 
                    className="bg-transparent border-none p-0 w-8 text-center focus:ring-0 font-semibold text-blue-700" 
                    value={room.guests} 
                    onChange={(val) => handleRoomUpdate(room.id, { guests: parseInt(val) || 0 })} 
                  />
                </span>
                <span className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-2xl border border-blue-100 flex-1">
                  <BedDouble size={14} className="text-blue-600 shrink-0"/> 
                  <BlurInput 
                    className="bg-transparent border-none p-0 w-full focus:ring-0 font-semibold text-blue-700" 
                    value={room.beds} 
                    onChange={(val) => handleRoomUpdate(room.id, { beds: val })} 
                    placeholder="Beds description" 
                  />
                </span>
              </div>
              
              {/* DRAGGABLE TAGS */}
              <div className="mb-4">
                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-2">Room Amenities — Drag to Reorder</p>
                <div className="flex flex-wrap gap-2 items-center">
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleTagDragEnd(e, room.id)}>
                    <SortableContext items={(room.tags || []).map((_, i) => `tag-${room.id}-${i}`)} strategy={horizontalListSortingStrategy}>
                      {room.tags?.map((tag, i) => (
                        <SortableRoomTag 
                          key={`tag-${room.id}-${i}`}
                          id={`tag-${room.id}-${i}`}
                          tag={tag}
                          onUpdate={(val) => {
                            const newTags = [...room.tags];
                            newTags[i] = val;
                            handleRoomUpdate(room.id, { tags: newTags });
                          }}
                          onRemove={() => handleRoomUpdate(room.id, { tags: room.tags.filter((_, idx) => idx !== i) })}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                  <button onClick={() => handleRoomUpdate(room.id, { tags: [...(room.tags || []), ""] })} 
                    className="border border-dashed border-slate-300 text-slate-400 px-3 py-1 rounded-full text-xs hover:text-blue-600 hover:border-blue-400 transition-all flex items-center gap-1">
                    <Plus size={12} /> Add
                  </button>
                </div>
              </div>

              <BlurTextArea 
                className="text-slate-500 text-sm w-full bg-transparent border-none p-0 focus:ring-0 resize-none mb-4"
                value={room.details} 
                onChange={(val) => handleRoomUpdate(room.id, { details: val })} 
                placeholder="Describe room features..." 
                rows={2} 
              />

              {/* THUMBNAIL STRIP */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {room.gallery?.map((img, i) => (
                  <div key={i} className="relative w-16 h-12 shrink-0 rounded-lg overflow-hidden group/thumb border border-slate-200">
                    <img src={safeSrc(img)} className="w-full h-full object-cover" alt="" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center gap-1 transition">
                      <button onClick={() => { setActiveRoomId(room.id); setReplacingIdx(i); replaceInputRef.current.click(); }} className="p-1 bg-white rounded-full text-slate-700">
                        <Edit3 size={10} />
                      </button>
                      <button onClick={() => handleRoomUpdate(room.id, { gallery: room.gallery.filter((_, idx) => idx !== i) })} className="p-1 bg-white rounded-full text-red-500">
                        <X size={10} />
                      </button>
                    </div>
                  </div>
                ))}
                <button onClick={() => { setActiveRoomId(room.id); fileInputRef.current.click(); }}
                  className="w-16 h-12 shrink-0 border border-dashed border-slate-200 rounded-lg flex items-center justify-center text-slate-300 hover:text-blue-500 transition-all">
                  <Upload size={14}/>
                </button>
              </div>
            </div>
          </Card>
        ))}
        <div ref={roomsEndRef} className="h-1" />
      </div>
    </div>
  );
}