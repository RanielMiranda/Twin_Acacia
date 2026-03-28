"use client"; // important since we're using hooks

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ResortGallery from "./ResortGallery";
import ResortContent from "./ResortContent";
import { Button } from "@/components/ui/button";
import { useFilters } from "@/components/useclient/ContextFilter";
import { ArrowRight, CheckCircle2, TriangleAlert, Users } from "lucide-react";

export default function ResortResults({ resorts }) {
  const router = useRouter(); // Next.js hook
  const { availabilityByResort } = useFilters();
  const LazyCard = ({ children, minHeight = 360 }) => {
    const ref = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
      if (isVisible) return;
      if (!ref.current || typeof IntersectionObserver === "undefined") {
        setIsVisible(true);
        return;
      }
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsVisible(true);
              observer.disconnect();
            }
          });
        },
        { rootMargin: "200px" }
      );
      observer.observe(ref.current);
      return () => observer.disconnect();
    }, [isVisible]);

    return (
      <div ref={ref} style={{ minHeight }}>
        {isVisible ? children : <div className="h-full w-full rounded-2xl bg-slate-100" />}
      </div>
    );
  };
  const sortedResorts = React.useMemo(() => {
    const viable = [];
    const notViable = [];
    (resorts || []).forEach((resort) => {
      const availability = availabilityByResort?.[resort.id];
      const isViable = availability?.viable !== false;
      if (isViable) viable.push(resort);
      else notViable.push(resort);
    });
    return [...viable, ...notViable].slice(0, 6);
  }, [resorts, availabilityByResort]);

  return (
    <div className="flex-1 flex flex-col gap-6 w-full">

      {sortedResorts.map((resort, index) => {
        const availability = availabilityByResort?.[resort.id];
        const roomList =
          availability?.availableRoomIds instanceof Set
            ? (resort.rooms || []).filter((room) => availability.availableRoomIds.has(room?.id?.toString()))
            : (resort.rooms || []);
        const isViable = availability?.viable !== false;
        const totalResortPax = (resort.rooms || []).reduce((sum, room) => sum + Number(room?.guests || 0), 0);
        const requestedPax = Number(availability?.requestedPax || 0);
        const paxInsufficient = requestedPax > 0 && totalResortPax < requestedPax;
        const isUnavailable = !isViable || paxInsufficient;
        const prioritizeImages = index === 0;
        return (
        <LazyCard key={resort.name} minHeight={360}>
          <div
            className={`overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_80px_rgba(15,23,42,0.12)] ${!isViable ? "opacity-90" : ""}`}
          >
            <div className="flex flex-col xl:flex-row">
            <div className="flex-1 max-w-full border-b border-slate-100 xl:border-b-0 xl:border-r">
              <div
                className={`${isUnavailable ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}
                onClick={() => {
                  if (isUnavailable) return;
                  window.scrollTo({ top: 0, behavior: "smooth" });
                  router.push(`/resort/${encodeURIComponent(resort.name)}`);
                }}
              >
                <ResortGallery resort={resort} prioritize={prioritizeImages} />
              </div>
              <ResortContent resort={resort} prioritize={prioritizeImages} />
            </div>

            <div className="flex w-full flex-col xl:w-[330px]">
              <div className="flex-1 p-5 sm:p-6">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <p className="font-semibold text-slate-900">Available Rooms</p>
                {isUnavailable ? (
                  <span className="rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.22em] text-rose-700">
                    Unavailable
                  </span>
                ) : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  {roomList.map((room) => (
                    <div key={room.id} className="relative group">
                      <div className="rounded-full bg-sky-100 px-3 py-1.5 text-xs font-medium text-sky-800">
                        {room.name}
                      </div>
                      <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-3 py-2 text-xs text-white opacity-0 transition group-hover:opacity-100">
                        {room.guests} Guests - {room.beds} Beds
                        <br />PHP {room.price}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-[1.5rem] bg-slate-50 p-4">
                  <div className="mb-3 flex items-center gap-2 text-slate-900">
                    <Users size={16} />
                    <p className="text-sm font-semibold">Stay snapshot</p>
                  </div>
                  <p className="text-sm font-semibold text-slate-700">
                    Up to {totalResortPax} guests
                  </p>
                  {paxInsufficient ? (
                    <p className="mt-1 text-[11px] font-semibold text-rose-600">
                      Not enough capacity for your selected group size.
                    </p>
                  ) : (
                    <p className="mt-1 text-[11px] font-medium text-emerald-600">
                      Capacity looks aligned with your current search.
                    </p>
                  )}
                </div>

                <div className="mt-5">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                    Facilities
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {(resort.facilities || []).map((facility, index) => (
                      <span
                        key={index}
                        className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600"
                      >
                        {facility?.name || "Facility"}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 bg-slate-50/80 p-5 sm:p-6">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="mb-1 text-sm font-medium text-slate-500">Average pricing</p>
                    <p className="text-3xl font-semibold tracking-tight text-slate-950">PHP {Number(resort.price || 0).toLocaleString()}</p>
                  </div>
                  {isUnavailable ? (
                    <TriangleAlert className="text-rose-500" size={18} />
                  ) : (
                    <CheckCircle2 className="text-emerald-500" size={18} />
                  )}
                </div>
                {Number(resort.description?.meta?.pricing?.forAsLowAs || 0) > 0 && (
                  <p className="mb-1 text-xs font-semibold text-emerald-600">
                    For as low as PHP {Number(resort.description?.meta?.pricing?.forAsLowAs || 0).toLocaleString()}
                  </p>
                )}
                {resort.description?.meta?.pricing?.customOfferLabel && (
                  <p className="mb-4 text-xs text-slate-500">
                    {resort.description?.meta?.pricing?.customOfferLabel}
                    {Number(resort.description?.meta?.pricing?.customOfferPrice || 0) > 0
                      ? `: PHP ${Number(resort.description?.meta?.pricing?.customOfferPrice || 0).toLocaleString()}`
                      : ""}
                  </p>
                )}
                <Button
                  className="flex w-full items-center justify-center rounded-2xl bg-sky-600 text-base font-semibold text-white transition hover:-translate-y-1 hover:bg-sky-700"
                  onClick={() => {
                    if (isUnavailable) return;
                    window.scrollTo({ top: 0, behavior: "smooth" });
                    router.push(`/resort/${encodeURIComponent(resort.name)}`);
                  }}
                  disabled={isUnavailable}
                >
                  <ArrowRight size={16} className="mr-2" />
                  Check Availability
                </Button>
              </div>
            </div>
            </div>
          </div>
        </LazyCard>
        );
      })}
    </div>
  );
}
