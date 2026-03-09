"use client";

import React, { useState } from "react";
import { Briefcase } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function TicketAddOnsCardSection({
  initialServices = [],
  availableServices = [],
  onSubmit,
  isSubmitting = false,
  canEdit = true,
}) {
  const [services, setServices] = useState(initialServices);

  const toggleService = (service) => {
    setServices((prev) => {
      const current = prev || [];
      const exists = current.some((entry) => entry?.name === service?.name);
      if (exists) {
        return current.filter((entry) => entry?.name !== service?.name);
      }
      return [
        ...current,
        {
          name: service?.name || "",
          description: service?.description || "",
          cost: Number(service?.cost || 0),
        },
      ];
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
            const selected = (services || []).some((entry) => entry?.name === service?.name);
            return (
              <button
                key={`${service?.name || "service"}-${index}`}
                type="button"
                onClick={() => toggleService(service)}
                disabled={!canEdit || isSubmitting}
                className={`w-full text-left rounded-2xl border px-4 py-4 transition-all disabled:opacity-60 ${
                  selected
                    ? "border-blue-300 bg-blue-50 ring-1 ring-blue-100"
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
                    <p className="text-sm font-black text-blue-600">PHP {Number(service?.cost || 0).toLocaleString()}</p>
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
          className="rounded-2xl bg-slate-900 hover:bg-black"
          onClick={() => onSubmit(services)}
          disabled={!canEdit || isSubmitting || availableServices.length === 0}
        >
          {isSubmitting ? "Saving..." : "Send Add-on Request"}
        </Button>
      </div>
    </Card>
  );
}
