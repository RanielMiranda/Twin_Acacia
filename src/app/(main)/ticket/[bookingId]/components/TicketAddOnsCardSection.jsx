"use client";

import React, { useMemo, useState } from "react";
import { Briefcase } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { buildServiceSnapshot, getServiceKey } from "@/lib/utils";

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
        const key = getServiceKey(item);
        if (!key) return null;
        return buildServiceSnapshot(key, availableServices);
      })
      .filter(Boolean);
  }, [initialServices, availableServices]);

  const [services, setServices] = useState(initialServiceSnapshots);

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
        <h3 className="text-sm font-black text-sky-700 uppercase tracking-[0.2em] flex items-center gap-2">
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
              <button
                key={`${service?.name || "service"}-${index}`}
                type="button"
                onClick={() => toggleService(service)}
                disabled={!canEdit || isSubmitting}
                className={`w-full text-left rounded-2xl border px-4 py-4 transition-all disabled:opacity-60 ${
                  selected
                    ? "border-sky-200 bg-sky-50 ring-1 ring-sky-100"
                    : "border-slate-100 bg-slate-50 hover:border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-black text-slate-800">{service?.name || "Service"}</p>
                    {service?.description ? (
                      <p className="mt-1 text-sm text-slate-500">{service.description}</p>
                    ) : null}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-sky-700">PHP {Number(service?.cost || service?.price || 0).toLocaleString()}</p>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      {selected ? "Selected" : "Tap to add"}
                    </p>
                  </div>
                </div>
              </button>
            );
          })
        ) : (
          <p className="text-sm text-slate-400">This resort has no configured extra services yet.</p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          type="button"
          className="rounded-2xl bg-sky-700 hover:bg-sky-800"
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
