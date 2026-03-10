import { MapPin, Mail, Phone, Facebook, DollarSign } from "lucide-react";
import { useResort } from "@/components/useclient/ContextEditor";

export default function ProfileSection({ className = "max-w-6xl mx-auto px-4 py-10" }) {
  const { resort } = useResort();

  if (!resort) return null;

  return (
    <section id="overview" className={className}>
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {resort.profileImage && (
          <img
            src={resort.profileImage}
            alt={resort.name}
            className="w-32 h-32 rounded-full object-cover ring-4 ring-slate-100 shadow-lg"
          />
        )}

        <div className="flex-1 space-y-4">
          <h1 className="text-4xl font-black text-slate-900">{resort.name}</h1>

          <div className="flex flex-col gap-2 text-gray-800">
            <div className="flex items-center gap-2">
              <MapPin size={16} />
              <span className="font-medium">{resort.location}</span>
            </div>

            <div className="flex items-center gap-2">
              <Mail size={16} />
              <span>{resort.contactEmail}</span>
            </div>

            <div className="flex items-center gap-2">
              <Phone size={16} />
              <span>{resort.contactPhone}</span>
            </div>
            
            {resort.contactMedia && (
              <div className="flex items-center gap-2">
                <Facebook size={16} />
                <a
                  href={resort.contactMedia}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 font-medium"
                >
                  Visit our Facebook Page
                </a>
              </div>
            )}

            {resort.price && (
              <div className="flex items-center gap-2 font-semibold text-blue-600">
                <DollarSign size={16} />
                PHP {Number(resort.price || 0).toLocaleString()}
              </div>
            )}
            {Number(resort.description?.meta?.pricing?.forAsLowAs || 0) > 0 && (
              <div className="text-sm font-semibold text-emerald-600">
                For as low as PHP {Number(resort.description?.meta?.pricing?.forAsLowAs || 0).toLocaleString()}
              </div>
            )}
            {resort.description?.meta?.pricing?.customOfferLabel && (
              <div className="text-xs text-slate-500">
                {resort.description?.meta?.pricing?.customOfferLabel}
                {Number(resort.description?.meta?.pricing?.customOfferPrice || 0) > 0
                  ? `: PHP ${Number(resort.description?.meta?.pricing?.customOfferPrice || 0).toLocaleString()}`
                  : ""}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 items-center mt-6">
        {resort.tags?.map((tag, index) => (
          <span
            key={index}
            className="px-3 py-1 text-[11px] font-bold uppercase text-blue-700 bg-blue-50 border border-blue-100 rounded-full shadow-sm"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-8">
        <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-6 text-slate-600 leading-relaxed whitespace-pre-line">
          {resort.description?.summary}
        </div>
      </div>
    </section>
  );
}
