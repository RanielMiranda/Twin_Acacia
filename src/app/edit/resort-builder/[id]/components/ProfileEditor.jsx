"use client";

import { useRef, useState, useEffect } from "react";
import { Plus, X, DollarSign, MapPin, Phone, Mail, Facebook, Camera, Image as ImageIcon, GripVertical, Check, ExternalLink } from "lucide-react";
import { useResort } from "@/components/useclient/ContextEditor";

// --- DND Kit Imports ---
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, horizontalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// --- Sub-component for Draggable & Inline Editable Tags ---
function SortableTag({ tagValue, tagId, index, onRemove, onRename }) {
  // Use a local state so typing doesn't trigger a global re-render (which kicks you out)
  const [localValue, setLocalValue] = useState(tagValue);

  // If the global value changes (e.g., from a 'save' or 'reset'), update local
  useEffect(() => {
    setLocalValue(tagValue);
  }, [tagValue]);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
    id: tagId 
  });

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
      {/* Handle for Dragging */}
      <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-blue-300 hover:text-blue-500">
        <GripVertical size={14} />
      </button>

      <input
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)} // Fast local updates
        onBlur={() => onRename(index, localValue)}    // Sync to context when user clicks away
        onKeyDown={(e) => e.key === "Enter" && onRename(index, localValue)}
        className="bg-transparent border-none focus:ring-0 p-0 w-20 focus:bg-white rounded px-1 transition-colors"
      />

      <button 
        onClick={() => onRemove(index)} 
        className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-400 hover:text-red-500"
      >
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
  const pricingMeta = resort.description?.meta?.pricing || {};
  const themeMeta = resort.description?.theme || {};

  const setDescriptionMeta = (nextPartial) => {
    updateResort("description", {
      ...(resort.description || {}),
      ...nextPartial,
    });
  };

  const setPricingMeta = (field, value) => {
    setDescriptionMeta({
      meta: {
        ...(resort.description?.meta || {}),
        pricing: {
          ...(pricingMeta || {}),
          [field]: value,
        },
      },
    });
  };

  const setThemeMeta = (field, value) => {
    setDescriptionMeta({
      theme: {
        ...(themeMeta || {}),
        [field]: value,
      },
    });
  };

  // IMPORTANT: Since your context uses simple strings, we map them to IDs for DND-Kit
  // but we keep the actual value from the context.
  const displayTags = (resort.tags || []).map((text, idx) => ({
    id: `tag-${idx}-${text}`, // Unique stable-ish ID for DND
    text: text
  }));

  const handleTagAction = (action, index, newValue) => {
    const tags = [...(resort.tags || [])];
    
    if (action === "add") {
      if (newValue.trim()) {
        tags.push(newValue.trim());
        setIsAdding(false);
        setNewTagValue("");
      }
    } else if (action === "rename") {
      tags[index] = newValue; // Update the string in the array
    } else if (action === "remove") {
      tags.splice(index, 1);
    }
    
    updateResort("tags", tags);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = displayTags.findIndex(t => t.id === active.id);
      const newIndex = displayTags.findIndex(t => t.id === over.id);
      const newTagsArray = arrayMove(resort.tags, oldIndex, newIndex);
      updateResort("tags", newTagsArray);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* ... (Hero/Profile Image Section remains the same) ... */}
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="relative group shrink-0">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-slate-200 border-4 border-white shadow-md flex items-center justify-center">
            {resort.profileImage ? (
              <img src={safeSrc(resort.profileImage)} className="w-full h-full object-cover" alt="Profile" />
            ) : (
              <ImageIcon size={32} className="text-slate-400" />
            )}
          </div>
          <button 
            className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center text-white text-[10px] font-bold" 
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera size={20} className="mb-1" /> CHANGE
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={(e) => updateResort("profileImage", e.target.files[0])} 
          />
        </div>

        <div className="flex-1 w-full space-y-4">
          <input 
            className="text-4xl font-black w-full bg-transparent border-none focus:ring-0 p-0 hover:bg-slate-50 rounded transition" 
            value={resort.name || ""} 
            onChange={(e) => updateResort("name", e.target.value)} 
            placeholder="Resort Name" 
          />
          {/* ... (Other Info Inputs) ... */}
          <div className="flex flex-col gap-2 text-gray-800">
             {[
                { icon: MapPin, field: "location", placeholder: "Location" },
                { icon: Mail, field: "contactEmail", placeholder: "Email" }, 
                { icon: Phone, field: "contactPhone", placeholder: "Phone" },

                { icon: Facebook, field: "contactMedia", placeholder: "Facebook Link" },                
                { icon: DollarSign, field: "price", placeholder: "Average Price", type: "number" },
                 
             ].map(item => (
                <div key={item.field} className="flex items-center gap-2 group/input relative">
                  <item.icon size={16} className={resort[item.field] ? "" : "text-slate-400"} />
                  <input 
                    type={item.type || "text"}
                    className="bg-transparent border-none p-1 focus:ring-0 hover:bg-slate-50 rounded w-full pr-8" 
                    value={resort[item.field] || ""} 
                    onChange={(e) => updateResort(item.field, item.type === "number" ? Number(e.target.value) : e.target.value)}
                    placeholder={item.placeholder} 
                  />
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
            <SortableContext items={displayTags.map(t => t.id)} strategy={horizontalListSortingStrategy}>
              {displayTags.map((tagObj, i) => (
                <SortableTag 
                  key={tagObj.id} 
                  tagId={tagObj.id}
                  tagValue={tagObj.text} // This is the string from your resort data
                  index={i} 
                  onRemove={(idx) => handleTagAction("remove", idx)} 
                  onRename={(idx, val) => handleTagAction("rename", idx, val)}
                />
              ))}
            </SortableContext>
          </DndContext>

          {isAdding ? (
            <div className="flex flex-wrap items-center gap-1 bg-white border border-blue-400 rounded-md px-2 py-1 relative">
              <div className="relative inline-grid items-center">
                {/* This invisible span forces the container to the correct width */}
                <span className="invisible whitespace-pre text-xs font-semibold px-1 col-start-1 row-start-1">
                  {newTagValue || "New tag..."}
                </span>
                
                <input
                  autoFocus
                  className="text-xs font-semibold outline-none bg-transparent absolute inset-0 w-full px-1"
                  value={newTagValue}
                  onChange={(e) => setNewTagValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleTagAction("add", null, newTagValue)}
                  onBlur={() => !newTagValue && setIsAdding(false)}
                  placeholder="New tag..."
                />
              </div>
              
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

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
          <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2">Public Pricing Options</p>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 block">
              For as low as (PHP)
              <input
                type="number"
                min="0"
                className="mt-1 w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm"
                value={Number(pricingMeta.forAsLowAs || 0)}
                onChange={(e) => setPricingMeta("forAsLowAs", Number(e.target.value) || 0)}
              />
            </label>
            <label className="text-xs font-semibold text-slate-500 block">
              Custom Offer Label
              <input
                className="mt-1 w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm"
                value={pricingMeta.customOfferLabel || ""}
                onChange={(e) => setPricingMeta("customOfferLabel", e.target.value)}
                placeholder="Weekend Promo"
              />
            </label>
            <label className="text-xs font-semibold text-slate-500 block">
              Custom Offer Price (PHP)
              <input
                type="number"
                min="0"
                className="mt-1 w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm"
                value={Number(pricingMeta.customOfferPrice || 0)}
                onChange={(e) => setPricingMeta("customOfferPrice", Number(e.target.value) || 0)}
              />
            </label>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
          <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2">Edit Theme (Preparation)</p>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 block">
              Theme Name
              <input
                className="mt-1 w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm"
                value={themeMeta.name || ""}
                onChange={(e) => setThemeMeta("name", e.target.value)}
                placeholder="Coastal Blue"
              />
            </label>
            <label className="text-xs font-semibold text-slate-500 block">
              Primary Hex Color
              <input
                type="color"
                className="mt-1 w-full h-10 bg-white border border-slate-200 rounded-xl px-1 py-1"
                value={themeMeta.primaryColor || "#2563eb"}
                onChange={(e) => setThemeMeta("primaryColor", e.target.value)}
              />
            </label>
          </div>
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
