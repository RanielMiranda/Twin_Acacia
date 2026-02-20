import FacilitiesGallery from "../Gallery/FacilitiesGallery";
import ServicesTable from "./ServicesTable";
import { MapPin, Mail, Phone, Facebook, DollarSign } from "lucide-react";
import { useResort } from "../../useclient/ContextEditor"; //

export default function ResortInfo({ onFacilityOpen }) {
  const { resort } = useResort(); // Pull data from context

  if (!resort) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Profile Image using context data */}
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
                        {resort.contactMedia && (
              <div className="flex items-center gap-2">
                <Facebook size={16} />
                <a
                  href={resort.contactMedia}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline font-medium"
                >
                  Visit our Facebook Page
                </a>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Mail size={16} />
              <span>{resort.contactEmail}</span>
            </div>

            <div className="flex items-center gap-2">
              <Phone size={16} />
              <span>{resort.contactPhone}</span>
            </div>

            {resort.price && (
              <div className="flex items-center gap-2 font-semibold text-blue-600">
                <DollarSign size={16} />
                ₱{resort.price?.toLocaleString()}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-6 text-slate-600 leading-relaxed whitespace-pre-line">
          {resort.description?.summary}
        </div>
      </div>

      {/* Facilities and Services */}
      <div className="mt-10">
        <FacilitiesGallery facilities={resort.facilities} onOpen={onFacilityOpen} />
      </div>

      <div className="mt-10">
        <ServicesTable services={resort.extraServices} />
      </div>
    </div>
  );
}