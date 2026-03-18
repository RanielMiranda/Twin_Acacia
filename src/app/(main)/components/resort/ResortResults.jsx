"use client"; // important since we're using hooks

import React from "react";
import { useRouter } from "next/navigation";
import ResortGallery from "./ResortGallery";
import ResortContent from "./ResortContent";
import { Button } from "@/components/ui/button";
import { useFilters } from "@/components/useclient/ContextFilter";

export default function ResortResults({ resorts }) {
  const router = useRouter(); // Next.js hook
  const { availabilityByResort } = useFilters();
  const sortedResorts = React.useMemo(() => {
    const viable = [];
    const notViable = [];
    (resorts || []).forEach((resort) => {
      const availability = availabilityByResort?.[resort.id];
      const isViable = availability?.viable !== false;
      if (isViable) viable.push(resort);
      else notViable.push(resort);
    });
    return [...viable, ...notViable];
  }, [resorts, availabilityByResort]);

  return (
    <div className="flex-1 flex flex-col gap-6 w-full">
      {sortedResorts.map((resort) => {
        const availability = availabilityByResort?.[resort.id];
        const roomList =
          availability?.availableRoomIds instanceof Set
            ? (resort.rooms || []).filter((room) => availability.availableRoomIds.has(room?.id?.toString()))
            : (resort.rooms || []);
        const isViable = availability?.viable !== false;
        return (
        <div
          key={resort.name}
          className={`flex flex-col sm:flex-row bg-white shadow rounded-2xl overflow-hidden ${!isViable ? "opacity-90" : ""}`}
        >
          <div className="flex-1 max-w-full">
            <div
              className="cursor-pointer"
              onClick={() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
                router.push(`/resort/${encodeURIComponent(resort.name)}`);
              }}
            >
              <ResortGallery resort={resort} />
            </div>
            <ResortContent resort={resort} />
          </div>

          <div className="w-full sm:w-72 flex flex-col">
            <div className="flex-1 p-4 sm:p-6">
              <div className="flex items-center justify-between gap-2 mb-2">
                <p className="font-semibold">Available Rooms</p>
                {!isViable ? (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 border border-rose-200 rounded-full px-2 py-0.5">
                    Unavailable
                  </span>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2">
                {roomList.map((room) => (
                  <div key={room.id} className="relative group">
                    <div className="bg-blue-100 px-2 py-1 rounded-2xl text-xs">
                      {room.name}
                    </div>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-700 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition whitespace-nowrap z-50">
                      {room.guests} Guests - {room.beds} Beds
                      <br />PHP {room.price}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Facilities
                </p>
                <div className="flex flex-wrap gap-1">
                  {(resort.facilities || []).map((facility, index) => (
                    <span
                      key={index}
                      className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md"
                    >
                      {facility?.name || "Facility"}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6 bg-white">
              <p className="text-sm font-medium text-gray-600 mb-1">Average pricing</p>
              <p className="text-2xl font-bold text-blue-600 mb-3">PHP {Number(resort.price || 0).toLocaleString()}</p>
              {Number(resort.description?.meta?.pricing?.forAsLowAs || 0) > 0 && (
                <p className="text-xs font-semibold text-emerald-600 mb-1">
                  For as low as PHP {Number(resort.description?.meta?.pricing?.forAsLowAs || 0).toLocaleString()}
                </p>
              )}
              {resort.description?.meta?.pricing?.customOfferLabel && (
                <p className="text-xs text-slate-500 mb-4">
                  {resort.description?.meta?.pricing?.customOfferLabel}
                  {Number(resort.description?.meta?.pricing?.customOfferPrice || 0) > 0
                    ? `: PHP ${Number(resort.description?.meta?.pricing?.customOfferPrice || 0).toLocaleString()}`
                    : ""}
                </p>
              )}
              <Button
                className="w-full rounded-xl text-lg hover:scale-105 transition"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                  router.push(`/resort/${encodeURIComponent(resort.name)}`);
                }}
              >
                Check Availability
              </Button>
            </div>
          </div>
        </div>
        );
      })}
    </div>
  );
}
