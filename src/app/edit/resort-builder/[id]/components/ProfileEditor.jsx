"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, X, DollarSign, MapPin, Phone, Mail, Facebook, Camera, Image as ImageIcon, GripVertical, Check } from "lucide-react";
import { useResort } from "@/components/useclient/ContextEditor";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, horizontalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function SortableTag({ tagValue, tagId, index, onRemove, onRename }) {
  const [localValue, setLocalValue] = useState(tagValue);

  useEffect(() => {
    setLocalValue(tagValue);
  }, [tagValue]);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: tagId,
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
      className="group flex items-center gap-1 rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-xs font-semibold text-blue-600 shadow-sm"
    >
      <button {...attributes} {...listeners} className="cursor-grab text-sky-300 hover:text-sky-500">
        <GripVertical size={14} />
      </button>

      <input
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={() => onRename(index, localValue)}
        onKeyDown={(e) => e.key === "Enter" && onRename(index, localValue)}
        className="w-20 rounded bg-transparent px-1 transition-colors focus:bg-white focus:ring-0"
      />

      <button onClick={() => onRemove(index)} className="opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-500">
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

  const displayTags = (resort.tags || []).map((text, idx) => ({
    id: `tag-${idx}-${text}`,
    text,
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
      tags[index] = newValue;
    } else if (action === "remove") {
      tags.splice(index, 1);
    }

    updateResort("tags", tags);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = displayTags.findIndex((t) => t.id === active.id);
      const newIndex = displayTags.findIndex((t) => t.id === over.id);
      updateResort("tags", arrayMove(resort.tags, oldIndex, newIndex));
    }
  };

  return (
    <div id="overview" className="mx-auto max-w-7xl px-4 py-8">
      <div className="rounded-[2rem] border border-slate-200/70 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)] md:p-8">
        <div className="flex flex-col items-start gap-8 md:flex-row">
          <div className="relative shrink-0 group">
            <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-[1.75rem] border-4 border-white bg-slate-200 shadow-md">
              {resort.profileImage ? (
                <img src={safeSrc(resort.profileImage)} className="h-full w-full object-cover" alt="Profile" />
              ) : (
                <ImageIcon size={32} className="text-slate-400" />
              )}
            </div>
            <button
              className="absolute inset-0 flex flex-col items-center justify-center rounded-[1.75rem] bg-black/50 text-[10px] font-bold text-white opacity-0 transition group-hover:opacity-100"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera size={20} className="mb-1" />
              CHANGE
            </button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={(e) => updateResort("profileImage", e.target.files[0])}
            />
          </div>

          <div className="w-full flex-1 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <p className="rounded-full bg-sky-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-blue-600">
                Resort profile
              </p>
              <div className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
                Average rate: ₱{Number(resort.price || 0).toLocaleString()}
              </div>
              <div className="rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700">
                Default downpayment: {Number(pricingMeta.downpaymentPercentage || 0)}%
              </div>
            </div>

            <input
              className="w-full rounded bg-transparent p-0 text-4xl font-semibold tracking-tight transition hover:bg-slate-50 focus:ring-0"
              value={resort.name || ""}
              onChange={(e) => updateResort("name", e.target.value)}
              placeholder="Resort Name"
            />

            <div className="grid gap-3 text-gray-800 md:grid-cols-2">
              {[
                { icon: MapPin, field: "location", placeholder: "Location" },
                { icon: Mail, field: "contactEmail", placeholder: "Email" },
                { icon: Phone, field: "contactPhone", placeholder: "Phone" },
                { icon: Facebook, field: "contactMedia", placeholder: "Facebook Link" },
                { icon: DollarSign, field: "price", placeholder: "Average Rate", type: "number" },
              ].map((item) => (
                <div key={item.field} className="relative flex items-center gap-2">
                  <item.icon size={16} className={resort[item.field] ? "" : "text-slate-400"} />
                  <input
                    type={item.type || "text"}
                    className="w-full rounded bg-transparent p-1 pr-8 hover:bg-slate-50 focus:ring-0"
                    value={resort[item.field] || ""}
                    onChange={(e) => updateResort(item.field, item.type === "number" ? Number(e.target.value) : e.target.value)}
                    placeholder={item.placeholder}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">Tags - order draggable</p>
          <div className="flex flex-wrap items-center gap-2">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={displayTags.map((t) => t.id)} strategy={horizontalListSortingStrategy}>
                {displayTags.map((tagObj, i) => (
                  <SortableTag
                    key={tagObj.id}
                    tagId={tagObj.id}
                    tagValue={tagObj.text}
                    index={i}
                    onRemove={(idx) => handleTagAction("remove", idx)}
                    onRename={(idx, val) => handleTagAction("rename", idx, val)}
                  />
                ))}
              </SortableContext>
            </DndContext>

            {isAdding ? (
              <div className="relative flex flex-wrap items-center gap-1 rounded-md border border-blue-400 bg-white px-2 py-1">
                <div className="relative inline-grid items-center">
                  <span className="invisible col-start-1 row-start-1 whitespace-pre px-1 text-xs font-semibold">
                    {newTagValue || "New tag..."}
                  </span>
                  <input
                    autoFocus
                    className="absolute inset-0 w-full bg-transparent px-1 text-xs font-semibold outline-none"
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
                className="flex items-center gap-1 rounded-md bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-200"
              >
                <Plus size={12} />
                Add Tag
              </button>
            )}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">Public Pricing Options</p>
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-500">
                For as low as (PHP)
                <input
                  type="number"
                  min="0"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                  value={Number(pricingMeta.forAsLowAs || 0)}
                  onChange={(e) => setPricingMeta("forAsLowAs", Number(e.target.value) || 0)}
                />
              </label>
              <label className="block text-xs font-semibold text-slate-500">
                Custom Offer Label
                <input
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                  value={pricingMeta.customOfferLabel || ""}
                  onChange={(e) => setPricingMeta("customOfferLabel", e.target.value)}
                  placeholder="Weekend Promo"
                />
              </label>
              <label className="block text-xs font-semibold text-slate-500">
                Custom Offer Price (PHP)
                <input
                  type="number"
                  min="0"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                  value={Number(pricingMeta.customOfferPrice || 0)}
                  onChange={(e) => setPricingMeta("customOfferPrice", Number(e.target.value) || 0)}
                />
              </label>
              <label className="block text-xs font-semibold text-slate-500">
                Default Downpayment Requirement (%)
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                  value={Number(pricingMeta.downpaymentPercentage || 0)}
                  onChange={(e) => setPricingMeta("downpaymentPercentage", Math.min(100, Math.max(0, Number(e.target.value) || 0)))}
                />
              </label>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <textarea
            className="w-full rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 text-slate-600 outline-none transition focus:border-blue-400 focus:bg-white"
            rows={5}
            value={resort.description?.summary || ""}
            onChange={(e) => updateResort("description", { ...resort.description, summary: e.target.value })}
            placeholder="Resort description..."
          />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Rules and Regulations</p>
            <textarea
              className="min-h-[180px] w-full rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 outline-none transition focus:border-blue-400 focus:bg-white"
              value={resort.rulesAndRegulations || ""}
              onChange={(e) => updateResort("rulesAndRegulations", e.target.value)}
              placeholder="List the resort rules and regulations..."
            />
          </div>
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Terms and Conditions</p>
            <textarea
              className="min-h-[180px] w-full rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 outline-none transition focus:border-blue-400 focus:bg-white"
              value={resort.termsAndConditions || ""}
              onChange={(e) => updateResort("termsAndConditions", e.target.value)}
              placeholder="Add terms and conditions here..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
