import React from "react";
import { Briefcase, CheckCircle } from "lucide-react";
import { SectionLabel } from "../BookingEditorAtoms";
import {
  buildServiceSnapshot,
  computeBookingTotalAmount,
  computeServiceCost,
  computeScheduleSlotHours,
  formatServiceScheduleLabel,
  hasServiceScheduleData,
  getServiceBaseRate,
  getServiceKey,
  normalizeServiceScheduleSlots,
  normalizeServicePricingType,
} from "@/lib/utils";

export default function AddOnsCardSection({
  draft,
  isEditing = false,
  setField,
  availableServices = [],
}) {
  const selectedServices = Array.isArray(draft.resortServices)
    ? draft.resortServices.map((entry) => buildServiceSnapshot(entry, availableServices)).filter(Boolean)
    : [];

  const toggleService = (service) => {
    if (!setField) return;
    const key = getServiceKey(service);
    const exists = selectedServices.some((entry) => getServiceKey(entry) === key);
    const nextServices = exists
      ? selectedServices.filter((entry) => getServiceKey(entry) !== key)
      : [...selectedServices, buildServiceSnapshot(service, availableServices)];
    const nextTotal = computeBookingTotalAmount({
      basePrice: Number(draft.baseAmount || 0),
      serviceSnapshots: nextServices,
    });
    setField("resortServices", nextServices);
    setField("totalAmount", nextTotal);
  };

  const updateService = (serviceKey, updates) => {
    if (!setField) return;
    const nextServices = selectedServices.map((entry) =>
      getServiceKey(entry) === serviceKey
        ? buildServiceSnapshot({ ...entry, ...updates }, availableServices)
        : entry
    );
    const nextTotal = computeBookingTotalAmount({
      basePrice: Number(draft.baseAmount || 0),
      serviceSnapshots: nextServices,
    });
    setField("resortServices", nextServices);
    setField("totalAmount", nextTotal);
  };

  const addServiceSlot = (serviceKey) => {
    const target = selectedServices.find((entry) => getServiceKey(entry) === serviceKey);
    if (!target) return;
    const nextSlots = [
      ...normalizeServiceScheduleSlots(target),
      { id: `slot-${Date.now()}`, date: draft.checkInDate || "", startTime: "", endTime: "" },
    ];
    updateService(serviceKey, { scheduleSlots: nextSlots });
  };

  const updateServiceSlot = (serviceKey, slotId, field, value) => {
    const target = selectedServices.find((entry) => getServiceKey(entry) === serviceKey);
    if (!target) return;
    const nextSlots = normalizeServiceScheduleSlots(target).map((slot) =>
      slot.id === slotId ? { ...slot, [field]: value } : slot
    );
    updateService(serviceKey, { scheduleSlots: nextSlots });
  };

  const removeServiceSlot = (serviceKey, slotId) => {
    const target = selectedServices.find((entry) => getServiceKey(entry) === serviceKey);
    if (!target) return;
    const nextSlots = normalizeServiceScheduleSlots(target).filter((slot) => slot.id !== slotId);
    updateService(serviceKey, { scheduleSlots: nextSlots });
  };

  const removeSelectedService = (service) => {
    if (!setField) return;
    const nextServices = selectedServices.filter((entry) => getServiceKey(entry) !== getServiceKey(service));
    const nextTotal = computeBookingTotalAmount({
      basePrice: Number(draft.baseAmount || 0),
      serviceSnapshots: nextServices,
    });
    setField("resortServices", nextServices);
    setField("totalAmount", nextTotal);
  };

  const canToggleSelectedService = (service) => {
    const current = selectedServices.find((entry) => getServiceKey(entry) === getServiceKey(service));
    if (!current) return true;
    if (normalizeServicePricingType(current) !== "hourly") return true;
    return !hasServiceScheduleData(current);
  };

  return (
    <div className="space-y-4">
      <SectionLabel icon={<Briefcase size={14} />} label="Add-ons" />
      {isEditing ? (
        <div className="space-y-3">
          {availableServices.length > 0 ? (
            availableServices.map((service, index) => {
              const selectedEntry = selectedServices.find((entry) => getServiceKey(entry) === getServiceKey(service));
              const selected = !!selectedEntry;
              return (
                <div
                  key={`${service?.name || "service"}-${index}`}
                  onClick={() => {
                    if (selected && !canToggleSelectedService(service)) return;
                    toggleService(service);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      if (selected && !canToggleSelectedService(service)) return;
                      toggleService(service);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  className={`w-full text-left rounded-xl border px-4 py-4 transition-all ${
                    selected
                      ? "border-blue-300 bg-blue-50 ring-1 ring-blue-100"
                      : "border-slate-100 bg-white hover:border-slate-200"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-sm font-black text-slate-800">{service?.name || "Service"}</p>
                        {service?.description ? (
                          <p className="mt-1 text-xs text-slate-500">{service.description}</p>
                        ) : null}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-black text-blue-600">
                          PHP {Number(getServiceBaseRate(service) || 0).toLocaleString()}
                          {normalizeServicePricingType(service) === "hourly" ? "/hr" : ""}
                        </p>
                        {selectedEntry ? (
                          <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                            Total PHP {Number(computeServiceCost(selectedEntry) || 0).toLocaleString()}
                          </p>
                        ) : null}
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                          {selected
                            ? (normalizeServicePricingType(service) === "hourly" && !canToggleSelectedService(service)
                                ? "Selected"
                                : "Tap to remove")
                            : "Tap to add"}
                        </p>
                      </div>
                    </div>
                    {selected && normalizeServicePricingType(service) === "hourly" ? (
                      <div className="space-y-3">
                        {normalizeServiceScheduleSlots(selectedEntry).map((slot, slotIndex) => (
                          <div key={slot.id} className="rounded-2xl border border-blue-100 bg-white px-4 py-4">
                            <div className="grid grid-cols-1 gap-2 md:grid-cols-3 md:items-center">
                              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                Schedule {slotIndex + 1}
                              </p>
                              <p className="text-xs font-bold text-slate-500 md:text-center">
                                {computeScheduleSlotHours(slot).toLocaleString()} hours
                              </p>
                              <div className="md:text-right">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (normalizeServiceScheduleSlots(selectedEntry).length === 1) {
                                      removeSelectedService(service);
                                      return;
                                    }
                                    removeServiceSlot(getServiceKey(service), slot.id);
                                  }}
                                  className="text-xs font-bold text-rose-600 hover:text-rose-700"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
                              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Date</p>
                              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Start</p>
                              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">End</p>
                            </div>
                            <div className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-3">
                              <input
                                type="date"
                                value={slot.date || ""}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => updateServiceSlot(getServiceKey(service), slot.id, "date", e.target.value)}
                                className="w-full rounded-xl border border-blue-100 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              <input
                                type="time"
                                step="3600"
                                value={slot.startTime || ""}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => updateServiceSlot(getServiceKey(service), slot.id, "startTime", e.target.value)}
                                className="w-full rounded-xl border border-blue-100 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              <input
                                type="time"
                                step="3600"
                                value={slot.endTime || ""}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => updateServiceSlot(getServiceKey(service), slot.id, "endTime", e.target.value)}
                                className="w-full rounded-xl border border-blue-100 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                              <div className="mt-3 text-right">
                                <p className="text-[10px] font-bold text-slate-400">
                                  {formatServiceScheduleLabel({ scheduleSlots: [slot] }) || "Date not set, Time not set (0h)"}
                                </p>
                                <p className="mt-1 text-[10px] font-black uppercase tracking-wider text-emerald-600">
                                  Total Cost PHP {Number((computeScheduleSlotHours(slot) * Number(selectedEntry?.hourlyRate || 0)) || 0).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          ))}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            addServiceSlot(getServiceKey(service));
                          }}
                          className="text-xs font-black uppercase tracking-wider text-blue-600 hover:text-blue-700"
                        >
                          + Add another day
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-xs text-slate-400">This resort has no configured extra services yet.</div>
          )}
        </div>
      ) : (
        <div className="flex flex-wrap gap-3">
          {selectedServices.length > 0 ? (
            selectedServices.map((service, index) => (
              <div key={index} className="bg-white px-4 py-3 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-md"><CheckCircle size={14} /></div>
                <span className="text-xs font-bold text-slate-700">
                  {service.name} (PHP {Number(computeServiceCost(service) || 0).toLocaleString()})
                </span>
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
