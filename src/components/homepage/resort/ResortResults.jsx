"use client"; // important since we're using hooks

import { useRouter } from "next/navigation";
import ResortGallery from "./ResortGallery";
import ResortContent from "./ResortContent";
import { Button } from "@/components/ui/button";

export default function ResortResults({ resorts }) {
  const router = useRouter(); // Next.js hook

  return (
    <div className="flex-1 flex flex-col gap-6 w-full">
      {resorts.map((resort) => (
        <div
          key={resort.name}
          className="flex flex-col sm:flex-row bg-white shadow rounded-2xl overflow-hidden"
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

          {/* RIGHT INFO PANEL */}
          <div className="w-full sm:w-72 flex flex-col">
            <div className="flex-1 p-4 sm:p-6">
              <p className="font-semibold mb-2">Available Rooms</p>
              <div className="flex flex-wrap gap-2">
                {resort.rooms.map((room) => (
                  <div key={room.id} className="relative group">
                    <div className="bg-blue-100 px-2 py-1 rounded-2xl text-sm">
                      {room.name}
                    </div>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-700 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition whitespace-nowrap z-50">
                      {room.guests} Guests • {room.beds} Beds
                      <br />₱ {room.price}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Tags
                </p>
                <div className="flex flex-wrap gap-1">
                  {resort.tags?.map((tag, index) => (
                    <span
                      key={index}
                      className="text-[2vh] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6 bg-white">
              <p className="text-sm font-medium text-gray-600 mb-1">
                Average pricing
              </p>
              <p className="text-2xl font-bold text-blue-600 mb-4">
                ₱{resort.price.toLocaleString()}
              </p>
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
      ))}
    </div>
  );
}
