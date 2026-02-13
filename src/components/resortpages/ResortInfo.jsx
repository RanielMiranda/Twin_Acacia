import FacilitiesGallery from "./Gallery/FacilitiesGallery";
import ServicesTable from "./ServicesTable";
import { MapPin, Mails, Phone } from "lucide-react";

export default function ResortInfo({ resort, onFacilityOpen }) {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
    <div className="flex items-center gap-4">
      {/* Circular Profile Image */}
      {resort.profileImage && (
        <img
          src={resort.profileImage}
          alt={resort.name}
          className="w-20 h-20 rounded-full object-cover ring-2 ring-blue-100 shadow-md"
        />
      )}

      {/* Resort Name */}
      <h1 className="text-3xl font-bold">{resort.name}</h1>
    </div>
      <div className="flex items-center gap-1 my-1 text-gray-800">
        <MapPin size={16} />
        <span className = "px-2"> {resort.location} </span>
      </div>
      <div className="flex items-center gap-1 my-1 text-gray-800">
        <Mails size={16} />
        <span className = "px-2"> {resort.contactEmail} </span>
      </div>
      <div className="flex items-center gap-1 my-1 text-gray-800">
        <Phone size={16} />
        <span className = "px-2"> {resort.contactPhone} </span>
      </div>            
      <p className="mt-2 whitespace-pre-line">{resort.description.summary}</p>

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
