import { MapPin, Mail, Phone, Facebook } from "lucide-react";
import { useResort } from "@/components/useclient/ContextEditor";

export default function ProfileSection({ className = "max-w-6xl mx-auto px-4 py-10" }) {
  const { resort } = useResort();

  if (!resort) return null;

  return (
    <section id="overview" className={className}>
      <div className="rounded-[2rem] border border-slate-200/70 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)] md:p-8">
        <div className="flex flex-col items-start gap-8 md:flex-row">
          {resort.profileImage ? (
            <img
              src={resort.profileImage}
              alt={resort.name}
              className="h-32 w-32 rounded-[1.75rem] object-cover ring-4 ring-slate-100 shadow-lg"
            />
          ) : null}

          <div className="flex-1 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <p className="rounded-full bg-sky-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-sky-700">
                Resort profile
              </p>
              {resort.price ? (
                <div className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
                  Average rate: PHP {Number(resort.price || 0).toLocaleString()}
                </div>
              ) : null}
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-950">{resort.name}</h1>

            <div className="grid gap-3 text-gray-800 md:grid-cols-2">
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

              {resort.contactMedia ? (
                <div className="flex items-center gap-2">
                  <Facebook size={16} />
                  <a
                    href={resort.contactMedia}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-700 font-medium"
                  >
                    Visit our Facebook Page
                  </a>
                </div>
              ) : null}

              {Number(resort.description?.meta?.pricing?.forAsLowAs || 0) > 0 ? (
                <div className="text-sm font-semibold text-emerald-600">
                  For as low as PHP {Number(resort.description?.meta?.pricing?.forAsLowAs || 0).toLocaleString()}
                </div>
              ) : null}

              {resort.description?.meta?.pricing?.customOfferLabel ? (
                <div className="text-xs text-slate-500">
                  {resort.description?.meta?.pricing?.customOfferLabel}
                  {Number(resort.description?.meta?.pricing?.customOfferPrice || 0) > 0
                    ? `: PHP ${Number(resort.description?.meta?.pricing?.customOfferPrice || 0).toLocaleString()}`
                    : ""}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          {resort.tags?.map((tag, index) => (
            <span
              key={index}
              className="rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-[11px] font-bold uppercase text-sky-700 shadow-sm"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-8">
          <div className="w-full rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 text-slate-600 leading-relaxed whitespace-pre-line">
            {resort.description?.summary}
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <details className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
            <summary className="cursor-pointer list-none text-sm font-semibold text-slate-900">
              Rules and Regulations
            </summary>
            <div className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-600">
              {resort.rulesAndRegulations || "No rules and regulations added yet."}
            </div>
          </details>
          <details className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
            <summary className="cursor-pointer list-none text-sm font-semibold text-slate-900">
              Terms and Conditions
            </summary>
            <div className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-600">
              {resort.termsAndConditions || "No terms and conditions added yet."}
            </div>
          </details>
        </div>
      </div>
    </section>
  );
}
