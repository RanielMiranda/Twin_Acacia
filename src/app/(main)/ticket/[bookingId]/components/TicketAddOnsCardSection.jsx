"use client";

import React, { useMemo, useState } from "react";
import { Briefcase } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  buildServiceSnapshot,
  computeServiceCost,
  computeScheduleSlotHours,
  formatServiceScheduleLabel,
  hasServiceScheduleData,
  getServiceBaseRate,
  getServiceKey,
  normalizeServiceScheduleSlots,
  normalizeServicePricingType,
} from "@/lib/utils";

const TicketAddOnsCardSection = React.memo(function TicketAddOnsCardSection({
  initialServices = [],
  availableServices = [],
  onSubmit,
  isSubmitting = false,
  canEdit = true,
}) {
  const normalizeServiceKey = (service) => getServiceKey(service);

  const initialServiceSnapshots = useMemo(() => {
    const keys = Array.isArray(initialServices) ? initialServices : [];
    return keys
      .map((item) => {
        if (!getServiceKey(item)) return null;
        return buildServiceSnapshot(item, availableServices);
      })
      .filter(Boolean);
  }, [initialServices, availableServices]);

  const [services, setServices] = useState(initialServiceSnapshots);

  const updateService = (serviceKey, updates) => {
    setServices((prev) =>
      (prev || []).map((entry) =>
        normalizeServiceKey(entry) === serviceKey
          ? buildServiceSnapshot({ ...entry, ...updates }, availableServices)
          : entry
      )
    );
  };

  const addServiceSlot = (serviceKey) => {
    const current = (services || []).find((entry) => normalizeServiceKey(entry) === serviceKey);
    if (!current) return;
    const nextSlots = [
      ...normalizeServiceScheduleSlots(current),
      { id: `slot-${Date.now()}`, date: "", startTime: "", endTime: "" },
    ];
    updateService(serviceKey, { scheduleSlots: nextSlots });
  };

  const updateServiceSlot = (serviceKey, slotId, field, value) => {
    const current = (services || []).find((entry) => normalizeServiceKey(entry) === serviceKey);
    if (!current) return;
    const nextSlots = normalizeServiceScheduleSlots(current).map((slot) =>
      slot.id === slotId ? { ...slot, [field]: value } : slot
    );
    updateService(serviceKey, { scheduleSlots: nextSlots });
  };

  const removeServiceSlot = (serviceKey, slotId) => {
    const current = (services || []).find((entry) => normalizeServiceKey(entry) === serviceKey);
    if (!current) return;
    const nextSlots = normalizeServiceScheduleSlots(current).filter((slot) => slot.id !== slotId);
    updateService(serviceKey, { scheduleSlots: nextSlots });
  };

  const removeSelectedService = (service) => {
    setServices((prev) =>
      (prev || []).filter((entry) => normalizeServiceKey(entry) !== normalizeServiceKey(service))
    );
  };

  const canToggleSelectedService = (service) => {
    const current = (services || []).find((entry) => normalizeServiceKey(entry) === normalizeServiceKey(service));
    if (!current) return true;
    if (normalizeServicePricingType(current) !== "hourly") return true;
    return !hasServiceScheduleData(current);
  };

  const toggleService = (service) => {
    const serviceKey = normalizeServiceKey(service);
    if (!serviceKey) return;

    setServices((prev) => {
      const current = prev || [];
      const exists = current.some((entry) => normalizeServiceKey(entry) === serviceKey);
      if (exists) {
        return current.filter((entry) => normalizeServiceKey(entry) !== serviceKey);
      }
      return [...current, buildServiceSnapshot(serviceKey, availableServices)];
    });
  };

  return (
    <Card className="p-6 md:p-8 border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.04)] rounded-[2.5rem] space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2">
          <Briefcase size={18} /> Add-ons
        </h3>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          Request changes
        </span>
      </div>

      <p className="text-sm text-slate-500">
        Add or update requested services here. The owner can review the request from Booking Details.
      </p>

      <div className="space-y-3">
        {availableServices.length > 0 ? (
          availableServices.map((service, index) => {
            const selected = (services || []).some((entry) => normalizeServiceKey(entry) === normalizeServiceKey(service));
            return (
              <div
                key={`${service?.name || "service"}-${index}`}
                onClick={() => {
                  if (!canEdit || isSubmitting) return;
                  if (selected && !canToggleSelectedService(service)) return;
                  toggleService(service);
                }}
                onKeyDown={(e) => {
                  if (!canEdit || isSubmitting) return;
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    if (selected && !canToggleSelectedService(service)) return;
                    toggleService(service);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-disabled={!canEdit || isSubmitting}
                className={`w-full text-left rounded-2xl border px-4 py-4 transition-all ${
                  !canEdit || isSubmitting ? "opacity-60" : ""
                } ${
                  selected
                    ? "border-blue-200 bg-blue-50 ring-1 ring-blue-100"
                    : "border-slate-100 bg-slate-50 hover:border-slate-200"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-black text-slate-800">{service?.name || "Service"}</p>
                      {service?.description ? (
                        <p className="mt-1 text-sm text-slate-500">{service.description}</p>
                      ) : null}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-black text-blue-600">
                        PHP {Number(getServiceBaseRate(service) || 0).toLocaleString()}
                        {normalizeServicePricingType(service) === "hourly" ? "/hr" : ""}
                      </p>
                      {selected ? (
                        <p className="mt-1 text-xs font-bold text-slate-500">
                          Total: PHP {Number(
                            computeServiceCost(
                              (services || []).find((entry) => normalizeServiceKey(entry) === normalizeServiceKey(service)) || service
                            )
                          ).toLocaleString()}
                        </p>
                      ) : null}
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
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
                      {normalizeServiceScheduleSlots(
                        (services || []).find((entry) => normalizeServiceKey(entry) === normalizeServiceKey(service)) || service
                      ).map((slot, slotIndex) => (
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
                                  const currentEntry =
                                    (services || []).find((entry) => normalizeServiceKey(entry) === normalizeServiceKey(service)) || service;
                                  if (normalizeServiceScheduleSlots(currentEntry).length === 1) {
                                    removeSelectedService(service);
                                    return;
                                  }
                                  removeServiceSlot(normalizeServiceKey(service), slot.id);
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
                              onChange={(e) =>
                                updateServiceSlot(normalizeServiceKey(service), slot.id, "date", e.target.value)
                              }
                              className="w-full rounded-xl border border-blue-100 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                              type="time"
                              step="3600"
                              value={slot.startTime || ""}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) =>
                                updateServiceSlot(normalizeServiceKey(service), slot.id, "startTime", e.target.value)
                              }
                              className="w-full rounded-xl border border-blue-100 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                              type="time"
                              step="3600"
                              value={slot.endTime || ""}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) =>
                                updateServiceSlot(normalizeServiceKey(service), slot.id, "endTime", e.target.value)
                              }
                              className="w-full rounded-xl border border-blue-100 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div className="mt-3 text-right">
                            <p className="text-[10px] font-bold text-slate-400">
                              {formatServiceScheduleLabel({ scheduleSlots: [slot] }) || "Date not set, Time not set (0h)"}
                            </p>
                            <p className="mt-1 text-[10px] font-black uppercase tracking-wider text-emerald-600">
                              Total Cost PHP {Number((computeScheduleSlotHours(slot) * Number(
                                ((services || []).find((entry) => normalizeServiceKey(entry) === normalizeServiceKey(service)) || service)?.hourlyRate || 0
                              )) || 0).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          addServiceSlot(normalizeServiceKey(service));
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
          <p className="text-sm text-slate-400">This resort has no configured extra services yet.</p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          type="button"
          className="rounded-2xl bg-blue-600 hover:bg-blue-700"
          onClick={() => onSubmit(services)}
          disabled={!canEdit || isSubmitting || availableServices.length === 0}
        >
          {isSubmitting ? "Saving..." : "Send Add-on Request"}
        </Button>
      </div>
    </Card>
  );
});

export { TicketAddOnsCardSection };
