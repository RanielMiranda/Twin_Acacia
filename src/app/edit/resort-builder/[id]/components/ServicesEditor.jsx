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
    pricingType: service.pricingType === "hourly" ? "hourly" : "flat",
    cost: Number(service.cost || 0),
    hourlyRate: Number(service.hourlyRate || 0),
  }));

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

  const isHourly = service.pricingType === "hourly";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="grid grid-cols-12 items-center border-t border-slate-100 bg-white px-6 py-4 transition group hover:bg-blue-50/40"
    >
      <div
        {...listeners}
        className="col-span-1 cursor-grab select-none text-slate-400 active:cursor-grabbing"
      >
        ::
      </div>

      <div className="col-span-2">
        <input
          className="w-full border-none bg-transparent p-0 font-semibold focus:ring-0 focus:text-blue-600"
          value={service.name}
          onChange={(e) => updateServiceLocal(index, "name", e.target.value)}
          onBlur={commitService}
        />
      </div>

      <div className="col-span-6">
        <input
          className="w-full border-none bg-transparent p-0 text-sm text-slate-500 focus:ring-0"
          value={service.description}
          onChange={(e) => updateServiceLocal(index, "description", e.target.value)}
          onBlur={commitService}
          placeholder="Description..."
        />
      </div>

      <div className="col-span-3 flex flex-col items-end gap-1 text-right font-bold text-blue-600">
        <div className="flex items-center justify-end gap-2">
          <span className="mr-1 text-xs font-bold text-slate-400">PHP</span>
          <input
            type="number"
            className="w-20 border-none bg-transparent p-0 text-right focus:ring-0"
            value={isHourly ? service.hourlyRate : service.cost}
            onChange={(e) =>
              updateServiceLocal(
                index,
                isHourly ? "hourlyRate" : "cost",
                parseInt(e.target.value, 10) || 0
              )
            }
            onBlur={commitService}
          />
          <select
            className="w-[92px] rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-600"
            value={service.pricingType}
            onChange={(e) => updateServiceLocal(index, "pricingType", e.target.value)}
            onBlur={commitService}
          >
            <option value="flat">Flat</option>
            <option value="hourly">Hourly</option>
          </select>
        </div>
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
          {isHourly ? "Per hour" : "Flat rate"}
        </span>
      </div>

      <div className="col-span-1 flex justify-end">
        <button
          onClick={() => removeService(index)}
          className="text-slate-300 opacity-0 transition group-hover:opacity-100 hover:text-red-500"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

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
        pricingType: "flat",
        cost: 0,
        hourlyRate: 0,
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

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = services.findIndex((s) => s.id === active.id);
    const newIndex = services.findIndex((s) => s.id === over.id);

    const reordered = arrayMove(services, oldIndex, newIndex);
    setLocalServices(reordered);
    updateResort("extraServices", reordered);
  };

  return (
    <div id="extra-services" className="mx-auto mt-10 max-w-6xl px-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Extra Services</h2>
        <Button
          onClick={addService}
          className="flex items-center justify-center rounded-full bg-blue-600 text-white hover:scale-105 hover:bg-blue-700"
        >
          <Plus size={16} className="mr-2" />
          Add Service
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="grid grid-cols-12 bg-slate-50 px-6 py-4 text-sm font-semibold text-slate-600">
          <div className="col-span-1"></div>
          <div className="col-span-2">Service</div>
          <div className="col-span-5">Description</div>
          <div className="col-span-3 text-right">Pricing</div>
          <div className="col-span-1"></div>
        </div>

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

        <div className="border-t border-slate-100 px-6 py-3">
          <button
            onClick={addService}
            className="text-sm font-semibold text-blue-600 transition hover:scale-105 hover:text-blue-700"
          >
            + Add another service
          </button>
        </div>

        <div ref={servicesEndRef} />
      </div>
    </div>
  );
}
