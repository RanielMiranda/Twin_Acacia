import React from "react";
import { MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useFilters } from "@/components/useclient/ContextFilter";

export default function DestinationField({
  destination,
  setDestination,
  activeDropdown,
  setActiveDropdown
}) {
  const { allResorts } = useFilters();

  const locationSuggestions = Array.from(
    new Set(
      (allResorts || [])
        .map((resort) => resort?.location)
        .filter(Boolean)
    )
  );
  const suggestions = Array.from(new Set([ ...locationSuggestions]));
  const normalizedQuery = destination?.trim().toLowerCase();
  const visibleSuggestions = normalizedQuery
    ? suggestions.filter((item) => item.toLowerCase().includes(normalizedQuery))
    : suggestions;

  return (
    <div className="relative z-[160] flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 flex-1">
      <MapPin size={16} />

      <Input
        placeholder="Select a destination"
        value={destination}
        onFocus={() => setActiveDropdown("destination")}
        onChange={(e) => setDestination(e.target.value)}
        className="border-0 text-sm"
      />

      {activeDropdown === "destination" && (
        <div className="absolute top-full left-0 right-0 bg-white shadow rounded-xl mt-2 z-[300] p-2">
          {visibleSuggestions.length === 0 && (
            <div className="p-2 text-xs text-slate-400">No matching destinations.</div>
          )}
          {visibleSuggestions.map((a) => (
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
