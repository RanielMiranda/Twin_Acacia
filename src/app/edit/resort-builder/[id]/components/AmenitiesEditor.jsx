"use client";

import { Plus, Trash2, Camera, GripVertical } from "lucide-react";
import { useResort } from "@/components/useclient/ContextEditor";
import { useRef } from "react";

import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, horizontalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function SortableAmenity({
  id,
  facility,
  onRemove,
  onReplace,
  onNameChange,
  onDescriptionChange,
  safeSrc,
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={`flex-shrink-0 w-48 snap-start group relative ${isDragging ? "opacity-50" : ""}`}>
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute -top-2 -left-2 z-10 p-1 bg-white rounded-full shadow-sm border border-slate-100 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-blue-500"
      >
        <GripVertical size={12} />
      </div>

      <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 relative shadow-sm border border-slate-200">
        {facility.image ? (
          <img src={safeSrc(facility.image)} className="w-full h-full object-cover" alt="" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <Camera size={20} />
          </div>
        )}

        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
          <button onClick={onReplace} className="p-1 bg-white rounded-full text-black">
            <Camera size={12} />
          </button>
          <button onClick={onRemove} className="p-1 bg-white rounded-full text-red-500">
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      <input
        className="mt-3 text-sm font-semibold w-full bg-white border border-slate-200 px-3 py-2 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
        value={facility.name}
        onChange={(e) => onNameChange(e.target.value)}
        placeholder="Facility name"
      />
      <textarea
        className="mt-2 text-xs w-full bg-white border border-slate-200 px-3 py-2 rounded-xl min-h-20 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
        value={facility.description || ""}
        onChange={(e) => onDescriptionChange(e.target.value)}
        placeholder="Facility details shown in the right panel."
      />
    </div>
  );
}

export default function AmenitiesEditor() {
  const { resort, updateResort, safeSrc } = useResort();
  const fileInputRefs = useRef({});
  const bulkInputRef = useRef(null);

  const facilities = resort?.facilities || [];
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = facilities.findIndex((_, i) => `amenity-${i}` === active.id);
    const newIndex = facilities.findIndex((_, i) => `amenity-${i}` === over.id);

    updateResort("facilities", arrayMove(facilities, oldIndex, newIndex));
  };

  const updateAmenity = (index, field, value) => {
    const updated = [...facilities];
    updated[index] = { ...updated[index], [field]: value };
    updateResort("facilities", updated);
  };

  const removeAmenity = (index) => {
    if (window.confirm(`Remove ${facilities[index].name}?`)) {
      updateResort("facilities", facilities.filter((_, i) => i !== index));
    }
  };

  const handleImageReplace = (index, e) => {
    const file = e.target.files[0];
    if (file) updateAmenity(index, "image", file);
    e.target.value = "";
  };

  const handleBulkUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const newAmenities = files.map((file) => ({
      name: "New Facility",
      description: "",
      image: file,
    }));

    updateResort("facilities", [...facilities, ...newAmenities]);
    e.target.value = "";
  };

  return (
    <div id="facilities" className="max-w-6xl mx-auto px-4 mt-8">

      {/* Header with Add Button */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Facilities</h2>

        <button
          onClick={() => bulkInputRef.current?.click()}
          className="flex items-center hover:scale-105 gap-2 px-4 py-3 rounded-lg bg-blue-600 text-white text-md font-medium hover:bg-blue-700 transition"
        >
          <Plus size={16} />
          Add Facilities
        </button>
      </div>

      <input
        type="file"
        multiple
        className="hidden"
        ref={bulkInputRef}
        onChange={handleBulkUpload}
        accept="image/*"
      />

      {/* Scroll Container */}
      <div className="relative">

        <div className="flex gap-6 overflow-x-auto snap-x snap-mandatory py-4 pb-6 scrollbar-hide scroll-smooth">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext
              items={facilities.map((_, i) => `amenity-${i}`)}
              strategy={horizontalListSortingStrategy}
            >
              {facilities.map((facility, idx) => (
                <SortableAmenity
                  key={`amenity-${idx}`}
                  id={`amenity-${idx}`}
                  facility={facility}
                  safeSrc={safeSrc}
                  onRemove={() => removeAmenity(idx)}
                  onReplace={() => fileInputRefs.current[idx]?.click()}
                  onNameChange={(val) => updateAmenity(idx, "name", val)}
                  onDescriptionChange={(val) => updateAmenity(idx, "description", val)}
                />
              ))}
            </SortableContext>
          </DndContext>

          {/* Hidden file inputs */}
          {facilities.map((_, idx) => (
            <input
              key={`file-input-${idx}`}
              type="file"
              className="hidden"
              ref={(el) => (fileInputRefs.current[idx] = el)}
              onChange={(e) => handleImageReplace(idx, e)}
              accept="image/*"
            />
          ))}
        <button onClick={() => bulkInputRef.current?.click()} className="flex-shrink-0 w-48 aspect-square rounded-2xl border-2 border-dashed border-slate-300 flex-col items-center justify-center text-slate-400 hover:border-blue-400 hover:text-blue-500 transition hover:bg-blue-50">
          <Plus size={24} />
          <span className="text-xs font-bold mt-1">Add</span>
        </button>          
        </div>
      </div>
    </div>
  );
}
