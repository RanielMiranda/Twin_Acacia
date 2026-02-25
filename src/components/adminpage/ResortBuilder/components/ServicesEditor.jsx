import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef, useState, useEffect } from "react";
import { useResort } from "@/components/useclient/ContextEditor";

export default function ServicesEditor() {
  const { resort, updateResort } = useResort();
  const [localServices, setLocalServices] = useState(resort.extraServices || []);
  const servicesEndRef = useRef(null);

  useEffect(() => setLocalServices(resort.extraServices || []), [resort.extraServices]);

  const scrollToCenter = () => {
    servicesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
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
    if (window.confirm(`Remove "${serviceName}"?`)) {
      const updated = localServices.filter((_, i) => i !== index);
      setLocalServices(updated);
      updateResort("extraServices", updated);
    }
  };

  return (
    <div id="extra-services" className="max-w-6xl mx-auto mt-10 px-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Extra Services</h2>
        <Button onClick={addService} className="rounded-full hover:scale-105 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center">
          <Plus size={16} className="mr-2" /> Add Service
        </Button>
      </div>

      <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm">
        <div className="grid grid-cols-12 bg-slate-50 text-sm font-semibold text-slate-600 px-6 py-4">
          <div className="col-span-3">Service</div>
          <div className="col-span-6">Description</div>
          <div className="col-span-2 text-right">Price (₱)</div>
          <div className="col-span-1"></div>
        </div>

        {localServices.map((service, i) => (
          <div key={i} className="grid grid-cols-12 px-6 py-4 border-t border-slate-100 hover:bg-blue-50/40 transition group items-center">
            <div className="col-span-3">
              <input
                className="w-full font-semibold bg-transparent border-none p-0 focus:ring-0 focus:text-blue-600"
                value={service.name}
                onChange={(e) => updateServiceLocal(i, "name", e.target.value)}
                onBlur={commitService}
              />
            </div>
            <div className="col-span-6">
              <input
                className="w-full text-sm text-slate-500 bg-transparent border-none p-0 focus:ring-0"
                value={service.description}
                onChange={(e) => updateServiceLocal(i, "description", e.target.value)}
                onBlur={commitService}
                placeholder="Description..."
              />
            </div>
            <div className="col-span-2 text-right flex justify-end items-center font-bold text-blue-600">
              <span className="mr-1">₱</span>
              <input
                type="number"
                className="w-20 text-right bg-transparent border-none p-0 focus:ring-0"
                value={service.cost}
                onChange={(e) => updateServiceLocal(i, "cost", parseInt(e.target.value) || 0)}
                onBlur={commitService}
              />
            </div>
            <div className="col-span-1 flex justify-end">
              <button onClick={() => removeService(i)} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}

        <div className="border-t border-slate-100 px-6 py-3">
          <button onClick={addService} className="text-sm hover:scale-105 text-blue-600 font-semibold hover:text-blue-800 transition">
            + Add another service
          </button>
        </div>
        <div ref={servicesEndRef} />
      </div>
    </div>
  );
}