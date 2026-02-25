import React from "react";
import { CardContent } from "@/components/ui/card";
import { MapPin, Mail, Phone } from "lucide-react";
import { useResort } from "@/components/useclient/ContextEditor"; // Import the context hook

export default function ResortContent({ resort }) {
  const { safeSrc } = useResort(); // Extract safeSrc helper
  const facilities = resort.facilities || [];

  return (
    <CardContent className="p-4">
      <div className="flex items-center gap-3">
        {resort.profileImage && (
          <img
            src={safeSrc(resort.profileImage)} // FIX: Wrap with safeSrc
            alt={resort.name}
            className="w-10 h-10 rounded-full object-cover ring-1 ring-gray-200"
          />
        )}
        <div className="font-semibold text-lg">{resort.name}</div>
      </div>

      <div className="text-sm text-gray-500 space-y-1 mt-2">
        <div className="flex items-center gap-1">
          <MapPin size={16} />
          <span>{resort.location}</span>
        </div>
        <div className="flex items-center gap-1">
          <Mail size={16} />
          <span>{resort.contactEmail}</span>
        </div>
        <div className="flex items-center gap-1">
          <Phone size={16} />
          <span>{ resort.contactPhone}</span>
        </div>
      </div>

      {/* Amenities Section */}
      <h1 className="pt-2 ml-[1vh]"> Amenities</h1>
      <div className="flex flex-wrap gap-2">
        {facilities.map((facility, index) => (
          <span
            key={index}
            className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full border border-gray-200"
          >
            {facility.name}
          </span>
        ))}
      </div>
    </CardContent>
  );
}