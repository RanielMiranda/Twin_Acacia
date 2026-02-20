import React from "react";
import { MapPin } from "lucide-react";
import { Input } from "../../../ui/input";
import { areaSuggestions } from "../../../data/constants";

export default function DestinationField({
  destination,
  setDestination,
  activeDropdown,
  setActiveDropdown
}) {
  return (
    <div className="relative flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 flex-1">
      <MapPin size={16} />

      <Input
        placeholder="Select a destination"
        value={destination}
        onFocus={() => setActiveDropdown("destination")}
        onChange={(e) => setDestination(e.target.value)}
        className="border-0 text-sm"
      />

      {activeDropdown === "destination" && (
        <div className="absolute top-full left-0 right-0 bg-white shadow rounded-xl mt-2 z-[9999] p-2">
          {areaSuggestions.map((a) => (
            <div
              key={a}
              className="p-2 hover:bg-gray-100 cursor-pointer rounded-xl"
              onClick={() => {
                setDestination(a);
                setActiveDropdown(null);
              }}
            >
              {a}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
