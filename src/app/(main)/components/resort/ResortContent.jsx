import React from "react";
import { CardContent } from "@/components/ui/card";
import { MapPin, Mail, Phone } from "lucide-react";
import { useResort } from "@/components/useclient/ContextEditor"; // Import the context hook
import { getSupabaseSrcSet, getTransformedSupabaseImageUrl } from "@/lib/utils";

export default function ResortContent({ resort }) {
  const { safeSrc } = useResort(); // Extract safeSrc helper
  const tags = resort.tags || [];

  return (
    <CardContent className="p-4">
      <div className="flex items-center gap-3">
        {resort.profileImage && (
          <img
            src={getTransformedSupabaseImageUrl(safeSrc(resort.profileImage), { width: 96, quality: 80, format: "webp" })} // FIX: Wrap with safeSrc
            srcSet={getSupabaseSrcSet(safeSrc(resort.profileImage), [64, 96, 128], 80)}
            sizes="40px"
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

      {/* Tags Section */}
      <div className="mt-1 flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full border border-gray-200"
          >
            {tag}
          </span>
        ))}
      </div>
    </CardContent>
  );
}
