import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";
import { useResort } from "@/components/useclient/ContextEditor";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

const withServiceIds = (services = []) =>
  services.map((service, index) => ({
    ...service,
    id: service.id || `service-${index}`,
  }));

/* ---------------- SORTABLE ROW ---------------- */

function SortableRow({
  service,
  index,
  updateServiceLocal,
  commitService,
  removeService,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: service.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="grid grid-cols-12 px-6 py-4 border-t border-slate-100 hover:bg-blue-50/40 transition group items-center bg-white"
    >
      {/* Drag Handle */}
      <div
        {...listeners}
        className="col-span-1 cursor-grab active:cursor-grabbing text-slate-400 select-none"
      >
        ☰
      </div>

      {/* Service Name */}
      <div className="col-span-2">
        <input
          className="w-full font-semibold bg-transparent border-none p-0 focus:ring-0 focus:text-sky-700"
          value={service.name}
          onChange={(e) =>
            updateServiceLocal(index, "name", e.target.value)
          }
          onBlur={commitService}
        />
      </div>

      {/* Description */}
      <div className="col-span-6">
        <input
          className="w-full text-sm text-slate-500 bg-transparent border-none p-0 focus:ring-0"
          value={service.description}
          onChange={(e) =>
            updateServiceLocal(index, "description", e.target.value)
          }
          onBlur={commitService}
          placeholder="Description..."
        />
      </div>

      {/* Price */}
      <div className="col-span-2 text-right flex justify-end items-center font-bold text-sky-700">
        <span className="mr-1">₱</span>
        <input
          type="number"
          className="w-20 text-right bg-transparent border-none p-0 focus:ring-0"
          value={service.cost}
          onChange={(e) =>
            updateServiceLocal(
              index,
              "cost",
              parseInt(e.target.value) || 0
            )
          }
          onBlur={commitService}
        />
      </div>

      {/* Delete Button */}
      <div className="col-span-1 flex justify-end">
        <button
          onClick={() => removeService(index)}
          className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

/* ---------------- MAIN COMPONENT ---------------- */

export default function ServicesEditor() {
  const { resort, updateResort } = useResort();
  const [localServices, setLocalServices] = useState(null);
  const services = localServices ?? withServiceIds(resort.extraServices || []);
  const servicesEndRef = useRef(null);

  const scrollToCenter = () => {
    servicesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  const addService = () => {
    const updated = [
      ...services,
      {
        id: crypto.randomUUID(),
        name: "New Service",
        description: "",
        cost: 0,
      },
    ];
    setLocalServices(updated);
    updateResort("extraServices", updated);
    setTimeout(scrollToCenter, 100);
  };

  const updateServiceLocal = (index, field, value) => {
    const updated = [...services];
    updated[index] = { ...updated[index], [field]: value };
    setLocalServices(updated);
  };

  const commitService = () => {
    updateResort("extraServices", services);
  };

  const removeService = (index) => {
    const serviceName = services[index]?.name;
    if (window.confirm(`Remove "${serviceName}"?`)) {
      const updated = services.filter((_, i) => i !== index);
      setLocalServices(updated);
      updateResort("extraServices", updated);
    }
  };

  /* DND Setup */
  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = services.findIndex(
      (s) => s.id === active.id
    );
    const newIndex = services.findIndex(
      (s) => s.id === over.id
    );

    const reordered = arrayMove(services, oldIndex, newIndex);
    setLocalServices(reordered);
    updateResort("extraServices", reordered);
  };

  return (
    <div id="extra-services" className="max-w-6xl mx-auto mt-10 px-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Extra Services</h2>
        <Button
          onClick={addService}
          className="rounded-full hover:scale-105 bg-sky-700 hover:bg-sky-800 text-white flex items-center justify-center"
        >
          <Plus size={16} className="mr-2" />
          Add Service
        </Button>
      </div>

      <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm">
        {/* Header */}
        <div className="grid grid-cols-12 bg-slate-50 text-sm font-semibold text-slate-600 px-6 py-4">
          <div className="col-span-1"></div>
          <div className="col-span-2">Service</div>
          <div className="col-span-6">Description</div>
          <div className="col-span-2 text-right">Price (₱)</div>
          <div className="col-span-1"></div>
        </div>

        {/* Draggable List */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={services.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            {services.map((service, index) => (
              <SortableRow
                key={service.id}
                service={service}
                index={index}
                updateServiceLocal={updateServiceLocal}
                commitService={commitService}
                removeService={removeService}
              />
            ))}
          </SortableContext>
        </DndContext>

        {/* Add Another */}
        <div className="border-t border-slate-100 px-6 py-3">
          <button
            onClick={addService}
            className="text-sm hover:scale-105 text-sky-700 font-semibold hover:text-sky-800 transition"
          >
            + Add another service
          </button>
        </div>

        <div ref={servicesEndRef} />
      </div>
    </div>
  );
}
