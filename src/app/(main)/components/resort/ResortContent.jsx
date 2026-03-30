import React from "react";
import { CardContent } from "@/components/ui/card";
import { MapPin, Mail, Phone } from "lucide-react";
import { useResort } from "@/components/useclient/ContextEditor"; // Import the context hook
import { getSupabaseSrcSet, getTransformedSupabaseImageUrl } from "@/lib/utils";

export default function ResortContent({ resort, prioritize = false }) {
  const { safeSrc } = useResort(); // Extract safeSrc helper
  const tags = resort.tags || [];

  return (
    <CardContent className="p-5 pt-1 sm:p-6 sm:pt-2">
      <div className="flex items-center gap-3">
        {resort.profileImage && (
          <img
            src={getTransformedSupabaseImageUrl(safeSrc(resort.profileImage), { width: 96, quality: 80, format: "webp" })} // FIX: Wrap with safeSrc
            srcSet={getSupabaseSrcSet(safeSrc(resort.profileImage), [64, 96, 128], 80)}
            sizes="40px"
            loading={prioritize ? "eager" : "lazy"}
            decoding="async"
            fetchPriority={prioritize ? "high" : "low"}
            alt={resort.name}
            className="w-10 h-10 rounded-full object-cover ring-1 ring-gray-200"
          />
        )}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-blue-600">Resort highlight</p>
          <div className="text-xl font-semibold tracking-tight text-slate-950">{resort.name}</div>
        </div>
      </div>

      <div className="mt-3 space-y-2 text-sm text-slate-500">
        <div className="flex items-center gap-2">
          <MapPin size={16} />
          <span>{resort.location}</span>
        </div>
        <div className="flex items-center gap-2">
          <Mail size={16} />
          <span>{resort.contactEmail}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone size={16} />
          <span>{ resort.contactPhone}</span>
        </div>
      </div>

      {/* Tags Section */}
      <div className="mt-4 flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600"
          >
            {tag}
          </span>
        ))}
      </div>
    </CardContent>
  );
}
