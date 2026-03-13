import React from "react";
import { Briefcase, CheckCircle } from "lucide-react";
import { SectionLabel } from "../BookingEditorAtoms";

export default function AddOnsCardSection({
  draft,
  isEditing = false,
  setField,
  availableServices = [],
}) {
  const services = Array.isArray(draft.resortServices) ? draft.resortServices : [];

  const toggleService = (service) => {
    if (!setField) return;
    const exists = services.some((entry) => entry?.name === service?.name);
    const serviceCost = Number(service?.cost || 0);
    const nextServices = exists
      ? services.filter((entry) => entry?.name !== service?.name)
      : [
          ...services,
          {
            name: service?.name || "",
            description: service?.description || "",
            cost: Number(service?.cost || 0),
          },
        ];
    const currentTotal = Number(draft.totalAmount || 0);
    const nextTotal = exists
      ? Math.max(0, currentTotal - serviceCost)
      : currentTotal + serviceCost;
    setField("resortServices", nextServices);
    if (serviceCost > 0) {
      setField("totalAmount", nextTotal);
    }
  };

  return (
    <div className="space-y-4">
      <SectionLabel icon={<Briefcase size={14} />} label="Add-ons" />
      {isEditing ? (
        <div className="space-y-3">
          {availableServices.length > 0 ? (
            availableServices.map((service, index) => {
              const selected = services.some((entry) => entry?.name === service?.name);
              return (
                <button
                  key={`${service?.name || "service"}-${index}`}
                  type="button"
                  onClick={() => toggleService(service)}
                  className={`w-full text-left rounded-xl border px-4 py-4 transition-all ${
                    selected
                      ? "border-blue-300 bg-blue-50 ring-1 ring-blue-100"
                      : "border-slate-100 bg-white hover:border-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-black text-slate-800">{service?.name || "Service"}</p>
                      {service?.description ? (
                        <p className="mt-1 text-xs text-slate-500">{service.description}</p>
                      ) : null}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-blue-600">PHP {Number(service?.cost || 0).toLocaleString()}</p>
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        {selected ? "Selected" : "Tap to add"}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="text-xs text-slate-400">This resort has no configured extra services yet.</div>
          )}
        </div>
      ) : (
        <div className="flex flex-wrap gap-3">
          {services.length > 0 ? (
            services.map((service, index) => (
              <div key={index} className="bg-white px-4 py-3 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-md"><CheckCircle size={14} /></div>
                <span className="text-xs font-bold text-slate-700">{service.name} (PHP {service.cost})</span>
              </div>
            ))
          ) : (
            <div className="text-xs text-slate-400">No add-ons selected.</div>
          )}
        </div>
      )}
    </div>
  );
}
