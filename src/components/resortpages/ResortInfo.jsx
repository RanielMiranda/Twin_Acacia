import FacilitiesGallery from "./FacilitiesGallery";
import ServicesTable from "./ServicesTable";
import { MapPin } from "lucide-react";

export default function ResortInfo({ resort, onFacilityOpen }) {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">{resort.name}</h1>
      <div className="flex items-center gap-1 my-1 text-gray-800">
        <MapPin size={16} />
        <span> {resort.location} </span>
      </div>
      <p className="mt-2">{resort.description.summary}</p>

      {/* TAGS */}
      <div className="flex flex-wrap gap-2 mt-4">
        {resort.tags?.map((tag, i) => (
          <span
            key={i}
            className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* FACILITIES */}
      <FacilitiesGallery facilities={resort.facilities} onOpen={onFacilityOpen} />

      {/* SERVICES TABLE */}
      <ServicesTable services={resort.extraServices} />
    </div>
  );
}
