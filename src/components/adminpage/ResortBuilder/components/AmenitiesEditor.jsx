import { Plus, Trash2, Image as ImageIcon } from "lucide-react";
import { useResort } from "@/components/useclient/ContextEditor";
import { useState, useEffect } from "react";

export default function AmenitiesEditor() {
  const { resort, updateResort, safeSrc } = useResort();
  const [localFacilities, setLocalFacilities] = useState(resort.facilities || []);

  // Sync with context if it changes externally
  useEffect(() => setLocalFacilities(resort.facilities || []), [resort.facilities]);

  const addAmenity = () => {
    setLocalFacilities([...localFacilities, { name: "New Amenity", image: "" }]);
  };

  const updateAmenityLocal = (index, field, value) => {
    const updated = [...localFacilities];
    updated[index] = { ...updated[index], [field]: value };
    setLocalFacilities(updated);
  };

  const commitAmenity = () => {
    updateResort("facilities", localFacilities);
  };

  const removeAmenity = (index) => {
    const amenityName = localFacilities[index].name;
    if (window.confirm(`Are you sure you want to remove ${amenityName}?`)) {
      const updated = localFacilities.filter((_, i) => i !== index);
      setLocalFacilities(updated);
      updateResort("facilities", updated);
    }
  };

  return (
    <div id="amenities" className="max-w-6xl mx-auto px-4 mt-8">
      <div className="flex items-center gap-4 mb-4">
        <h2 className="text-2xl font-semibold">Amenities</h2>
      </div>

      <div className="flex gap-4 overflow-x-auto py-4 cursor-grab pb-8">
        {localFacilities.map((facility, idx) => (
          <div key={idx} className="flex-shrink-0 w-24 group relative">
            <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 relative shadow-sm hover:shadow-md transition">
              {safeSrc(facility.image) && (
                <img
                  src={safeSrc(facility.image)}
                  alt={facility.name}
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex flex-row items-center justify-center gap-2">
                <button
                  onClick={() => {
                    const url = prompt("Image URL:", facility.image);
                    if (url !== null) {
                      updateAmenityLocal(idx, "image", url);
                      commitAmenity();
                    }
                  }}
                  className="p-1 bg-white rounded-full text-black hover:scale-110 transition"
                >
                  <ImageIcon size={12} />
                </button>
                <button
                  onClick={() => removeAmenity(idx)}
                  className="p-1 bg-white rounded-full text-red-500 hover:scale-110 transition"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
            <input
              className="mt-2 text-sm font-medium text-center w-full bg-transparent border-none p-0 focus:ring-0 focus:text-blue-600"
              value={facility.name}
              onChange={(e) => updateAmenityLocal(idx, "name", e.target.value)}
              onBlur={commitAmenity}
            />
          </div>
        ))}
        <button
          onClick={addAmenity}
          className="flex-shrink-0 w-24 aspect-square rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 hover:border-blue-400 hover:text-blue-500 transition hover:bg-blue-50"
        >
          <Plus size={24} />
          <span className="text-xs font-bold mt-1">Add</span>
        </button>
      </div>
    </div>
  );
}
