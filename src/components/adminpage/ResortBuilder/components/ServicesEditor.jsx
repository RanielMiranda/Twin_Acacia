import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef, useState, useEffect } from "react";
import { useResort } from "@/components/useclient/ContextEditor";

export default function ServicesEditor() {
  const { resort, updateResort } = useResort();
  const [localServices, setLocalServices] = useState(resort.extraServices || []);
  const servicesEndRef = useRef(null);

  // Sync if context changes externally
  useEffect(() => setLocalServices(resort.extraServices || []), [resort.extraServices]);

  const scrollToCenter = () => {
    if (!servicesEndRef.current) return;

    const element = servicesEndRef.current;
    const rect = element.getBoundingClientRect();

    const elementTop = rect.top + window.scrollY;
    const elementHeight = rect.height;
    const viewportHeight = window.innerHeight;

    // Scroll so the element is centered vertically
    const scrollPosition =
      elementTop - viewportHeight / 2 + elementHeight / 2;

    window.scrollTo({
      top: scrollPosition,
      behavior: "smooth",
    });
  };

  const addService = () => {
    const updated = [...localServices, { name: "New Service", description: "", cost: 0 }];
    setLocalServices(updated);
    updateResort("extraServices", updated);
    setTimeout(scrollToCenter, 100);
  };

  const updateServiceLocal = (index, field, value) => {
    const updated = [...localServices];
    updated[index] = { ...updated[index], [field]: value };
    setLocalServices(updated);
  };

  const commitService = () => {
    updateResort("extraServices", localServices);
  };

  const removeService = (index) => {
    const serviceName = localServices[index]?.name;

    if (window.confirm(`Are you sure you want to remove "${serviceName}"?`)) {
      const updated = localServices.filter((_, i) => i !== index);
      setLocalServices(updated);
      updateResort("extraServices", updated);
    }
  };

  return (
    <div id="extra-services" className="max-w-5xl mx-auto mt-10 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Extra Services</h2>

        <Button
          onClick={addService}
          className="rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center"
        >
          <Plus size={16} className="mr-2" />
          Add Service
        </Button>
      </div>

      {/* Table Container */}
      <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm">
        {/* Column Header */}
        <div className="grid grid-cols-12 bg-slate-50 text-sm font-semibold text-slate-600 px-6 py-4">
          <div className="col-span-3">Service</div>
          <div className="col-span-6">Description</div>
          <div className="col-span-2 text-right">Price</div>
          <div className="col-span-1 text-right"> </div>
        </div>

        {/* Editable Rows */}
        {localServices.map((service, i) => (
          <div
            key={i}
            className="grid grid-cols-12 px-6 py-4 border-t border-slate-100 hover:bg-blue-50/40 transition group"
          >
            {/* Name */}
            <div className="col-span-3">
              <input
                className="w-full font-semibold bg-transparent border-none p-0 focus:ring-0 focus:text-blue-600"
                value={service.name}
                onChange={(e) => updateServiceLocal(i, "name", e.target.value)}
                onBlur={commitService}
              />
            </div>

            {/* Description */}
            <div className="col-span-6">
              <input
                className="w-full text-sm text-slate-500 bg-transparent border-none p-0 focus:ring-0 focus:text-slate-700"
                value={service.description}
                onChange={(e) => updateServiceLocal(i, "description", e.target.value)}
                onBlur={commitService}
              />
            </div>

            {/* Price */}
            <div className="col-span-2 text-right font-bold text-blue-600 flex justify-end">
              ₱
              <input
                type="number"
                className="w-24 text-right bg-transparent border-none p-0 focus:ring-0 font-bold text-blue-600"
                value={service.cost}
                onChange={(e) => updateServiceLocal(i, "cost", Number(e.target.value))}
                onBlur={commitService}
              />
            </div>

            {/* Delete */}
            <div className="col-span-1 flex justify-end">
              <button
                onClick={() => removeService(i)}
                className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}

        {/* Add Row Footer */}
        <div className="border-t border-slate-100 px-6 py-3">
          <button
            onClick={addService}
            className="text-sm text-blue-600 font-semibold hover:text-blue-800 transition"
          >
            + Add another service
          </button>
        </div>

        <div ref={servicesEndRef} />
      </div>
    </div>
  );
}
