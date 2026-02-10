import React from "react";
import { useParams } from "react-router-dom";
import { resorts } from "../data/resorts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Users, BedDouble, Utensils  } from "lucide-react";
import StarFill from "../ui/StarFill";
import { HashLink } from "react-router-hash-link";

export default function ResortDetailPage() {
  const { name } = useParams();
  const resort = resorts.find(r => r.name === name);
  const rooms = resort?.rooms || [];
  const facilities = resort?.facilities || [];

  if (!resort) {
    return (
      <div className="p-10 text-center text-gray-500">
        Resort not found
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen mt-10">

      {/* ================= HERO IMAGE ================= */}
      <div className="w-full max-w-6xl mx-auto px-4 pt-8">
        <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[380px] rounded-2xl overflow-hidden">
          <img src={resort.image} className="col-span-2 row-span-2 w-full h-full object-cover" />
          <img src={resort.image} className="w-full h-full object-cover" />
          <img src={resort.image} className="w-full h-full object-cover" />
          <img src={resort.image} className="w-full h-full object-cover" />
          <div className="relative">
            <img src={resort.image} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="text-white font-semibold text-lg">View All Photos</span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= SHORTCUT BAR ================= */}
      <div className="sticky top-0 z-30 bg-white border-b mt-6">
        <div className="max-w-6xl mx-auto px-4 py-3 flex gap-6 text-sm font-medium text-gray-600">
          <button className="hover:text-blue-600">Overview</button>
            <HashLink smooth to="#rooms" className="hover:text-blue-600 transition">Rooms</HashLink>
            <HashLink smooth to="#facilities" className="hover:text-blue-600 transition">Facilities</HashLink>
        </div>
      </div>

      {/* ================= RESORT INFO ================= */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold">{resort.name}</h1>
        <p className="text-2xl">{resort.details}</p>

        <div className="flex items-center gap-4 text-gray-600 mt-3">
          <div className="flex items-center gap-2">
            <StarFill rating={4.5} size={16} />
            <span className="text-sm text-gray-600">4.5</span>
            <span className="text-sm text-gray-500">(200 reviews)</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin size={16} />
            <span>{resort.location}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {resort.tags?.map((tag, i) => (
            <span key={i} className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full">{tag}</span>
          ))}
        </div>
      </div>
      {/* ================= FACILITIES ================= */}
      <div id="facilities" className="max-w-6xl mx-auto px-4 pb-16">
        <h2 className="text-2xl font-semibold mb-6">Facilities</h2>
        <div className="flex flex-wrap gap-4">
          {facilities.map((facility, i) => (
            <div
              key={i}
              className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full text-gray-700"
            >
              <span>{facility}</span>
            </div>
          ))}
        </div>
      </div>
      {/* ================= ROOMS ================= */}
      <div id="rooms" className="max-w-6xl mx-auto px-4 pb-16">
        <h2 className="text-2xl font-semibold mb-6">Available Rooms</h2>
        <div className="flex flex-col gap-6">
          {rooms.map(room => (
            <Card key={room.id} className="p-0 overflow-hidden rounded-2xl border-1">
              <div className="flex">
                <img src={resort.image} className="w-72 h-56 object-cover rounded-2xl" />
                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{room.name}</h3>
                    <div className="flex gap-6 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-2">
                        <Users size={16} /> {room.guests} Guests
                      </div>
                      <div className="flex items-center gap-2">
                        <BedDouble size={16} /> {room.beds}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {room.tags.map((tag, i) => (
                        <span key={i} className="text-xs bg-gray-100 px-3 py-1 rounded-full">{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between items-end mt-6">
                    <div>
                      <p className="text-sm text-gray-500">Price per night</p>
                      <p className="text-2xl font-bold text-blue-600">₱{room.price.toLocaleString()}</p>
                    </div>
                    <Button className="text-lg px-8 py-3">Book Now</Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

    </div>
  );
}
