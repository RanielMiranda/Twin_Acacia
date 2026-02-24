"use client";

import { useRef, useState } from "react";
import { Plus, X, DollarSign, MapPin, Phone, Mail, Facebook, Camera, Image as ImageIcon, GripVertical, Check, ExternalLink } from "lucide-react";
import { useResort } from "@/components/useclient/ContextEditor";

// --- DND Kit Imports ---
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, horizontalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// --- Sub-component for Draggable & Inline Editable Tags ---
function SortableTag({ tag, index, onRemove, onRename }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: tag });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1 border border-blue-100 shadow-sm group"
    >
      <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-blue-300 hover:text-blue-500">
        <GripVertical size={14} />
      </button>

      <input
        value={tag}
        onChange={(e) => onRename(index, e.target.value)}
        className="bg-transparent border-none focus:ring-0 p-0 w-20 focus:bg-white rounded px-1 transition-colors"
      />

      <button onClick={() => onRemove(index)} className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-400 hover:text-red-500">
        <X size={14} />
      </button>
    </div>
  );
}

export default function ProfileEditor() {
  const { resort, updateResort, safeSrc } = useResort();
  const fileInputRef = useRef(null);
  
  const [isAdding, setIsAdding] = useState(false);
  const [newTagValue, setNewTagValue] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  if (!resort) return null;

  // Helper to ensure Facebook links are valid URLs
  const formatFacebookLink = (val) => {
    let link = val.trim();
    if (link && !/^https?:\/\//i.test(link)) {
      link = 'https://' + link;
    }
    return link;
  };

  const handleTagAction = (action, index, newValue) => {
    const tags = [...(resort.tags || [])];
    if (action === "add") {
      if (newValue && !tags.includes(newValue)) {
        tags.push(newValue);
        setIsAdding(false);
        setNewTagValue("");
      }
    } else if (action === "rename") {
      tags[index] = newValue;
    } else if (action === "remove") {
      tags.splice(index, 1);
    }
    updateResort("tags", tags);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = resort.tags.indexOf(active.id);
      const newIndex = resort.tags.indexOf(over.id);
      updateResort("tags", arrayMove(resort.tags, oldIndex, newIndex));
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Profile Image */}
        <div className="relative group shrink-0">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-slate-200 border-4 border-white shadow-md flex items-center justify-center">
            {resort.profileImage ? (
              <img src={safeSrc(resort.profileImage)} className="w-full h-full object-cover" alt="Profile" />
            ) : (
              <ImageIcon size={32} className="text-slate-400" />
            )}
          </div>
          <button className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center text-white text-[10px] font-bold" onClick={() => fileInputRef.current?.click()}>
            <Camera size={20} className="mb-1" /> CHANGE
          </button>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => updateResort("profileImage", e.target.files[0])} />
        </div>

        {/* Info & Inputs */}
        <div className="flex-1 w-full space-y-4">
          <input 
            className="text-4xl font-black w-full bg-transparent border-none focus:ring-0 p-0 hover:bg-slate-50 rounded transition" 
            value={resort.name || ""} 
            onChange={(e) => updateResort("name", e.target.value)} 
            placeholder="Resort Name" 
          />
          
          <div className="flex flex-col gap-2 text-gray-800">
             {[
                { icon: MapPin, field: "location", placeholder: "Location" },
                { icon: DollarSign, field: "price", placeholder: "Average Price (e.g. 15000)", type: "number" },
                { icon: Facebook, field: "contactMedia", placeholder: "Facebook Page Link" }, 
                { icon: Mail, field: "contactEmail", placeholder: "Email" }, 
                { icon: Phone, field: "contactPhone", placeholder: "Phone" }
             ].map(item => (
                <div key={item.field} className="flex items-center gap-2 group/input relative">
                  <item.icon size={16} className={resort[item.field] ? "text-blue-600" : "text-slate-400"} />
                  <div className="flex-1 relative">
                    <input 
                      type={item.type || "text"}
                      className="bg-transparent border-none p-1 focus:ring-0 hover:bg-slate-50 rounded w-full pr-8" 
                      value={resort[item.field] || ""} 
                      onChange={(e) => updateResort(item.field, item.type === "number" ? Number(e.target.value) : e.target.value)}
                      onBlur={(e) => {
                        if(item.field === "contactMedia") {
                           updateResort(item.field, formatFacebookLink(e.target.value));
                        }
                      }}
                      placeholder={item.placeholder} 
                    />
                    
                    {/* Facebook Test Link Button */}
                    {item.field === "contactMedia" && resort[item.field] && (
                      <a 
                        href={resort[item.field]} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover/input:opacity-100 transition p-1 hover:bg-blue-100 rounded text-blue-600"
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                </div>
             ))}
          </div>
        </div>
      </div>

      {/* Tags Section */}
      <div className="mt-8">
        <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-2">tags — order draggable</p>
        <div className="flex flex-wrap gap-2 items-center">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={resort.tags || []} strategy={horizontalListSortingStrategy}>
              {resort.tags?.map((tag, i) => (
                <SortableTag 
                  key={tag} 
                  tag={tag} 
                  index={i} 
                  onRemove={(idx) => handleTagAction("remove", idx)} 
                  onRename={(idx, val) => handleTagAction("rename", idx, val)}
                />
              ))}
            </SortableContext>
          </DndContext>

          {isAdding ? (
            <div className="flex items-center gap-1 bg-white border border-blue-400 rounded-md px-2 py-1">
              <input
                autoFocus
                className="text-xs font-semibold outline-none w-20"
                value={newTagValue}
                onChange={(e) => setNewTagValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleTagAction("add", null, newTagValue)}
                onBlur={() => !newTagValue && setIsAdding(false)}
                placeholder="Tag name..."
              />
              <button onClick={() => handleTagAction("add", null, newTagValue)}>
                <Check size={14} className="text-green-500" />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsAdding(true)} 
              className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <Plus size={12} /> Add Tag
            </button>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="mt-8">
        <textarea
          className="w-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-6 text-slate-600 outline-none focus:border-blue-400 focus:bg-white transition"
          rows={5}
          value={resort.description?.summary || ""}
          onChange={(e) => updateResort("description", { ...resort.description, summary: e.target.value })}
          placeholder="Resort description..."
        />
      </div>
    </div>
  );
}