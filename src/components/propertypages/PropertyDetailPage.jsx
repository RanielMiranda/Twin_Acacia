import React from "react";
import { useParams } from "react-router-dom";
import { properties } from "../data/properties";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Flag } from "lucide-react";
import { HashLink } from "react-router-hash-link";

export default function PropertyDetailPage() {
  const { name } = useParams();
  const property = properties.find((p) => p.name === decodeURIComponent(name));

  if (!property) {
    return (
      <div className="p-10 text-center text-gray-500">Property not found</div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen mt-10">

      {/* ================= HERO IMAGE ================= */}
      <div className="w-full max-w-6xl mx-auto px-4 pt-8">
        <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[380px] rounded-2xl overflow-hidden">
          {property.gallery?.slice(0, 4).map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`${property.name} ${idx}`}
              className={`object-cover ${idx === 0 ? "col-span-2 row-span-2" : ""}`}
            />
          ))}
          <div className="relative">
            <img src={property.gallery?.[0]} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="text-white font-semibold text-lg">View All Photos</span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= SHORTCUT BAR ================= */}
      <div className="sticky top-0 z-30 bg-white border-b mt-6">
        <div className="max-w-6xl mx-auto px-4 py-3 flex gap-6 text-sm font-medium text-gray-600">
          <button className="hover:text-blue-600">Overview</button>
          <HashLink smooth to="#units" className="hover:text-blue-600 transition">
            Buildings & Units
          </HashLink>
          <HashLink smooth to="#amenities" className="hover:text-blue-600 transition">
            Amenities
          </HashLink>
        </div>
      </div>

      {/* ================= PROPERTY INFO ================= */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold">{property.name}</h1>

        {/* Location with MapPin */}
        <div className="flex items-center gap-2 text-gray-600 mt-1">
          <MapPin className="w-4 h-4 text-gray-500" />
          <p>{property.location}</p>
        </div>

        <div className="mt-4 text-sm text-gray-700 space-y-1">
          <p><strong>Status:</strong> {property.status}</p>
          <p><strong>Property Code:</strong> {property.propertyCode}</p>
          <p><strong>Owner Company:</strong> {property.ownerCompany}</p>
          <p><strong>Lot Area:</strong> {property.lotArea}</p>
          <p><strong>TCT No.:</strong> {property.tctNo}</p>
        </div>
      </div>

      {/* ================= AMENITIES ================= */}
      <div id="amenities" className="max-w-6xl mx-auto px-4 pb-16">
        <h2 className="text-2xl font-semibold mb-6">Amenities</h2>
        <div className="flex flex-wrap gap-4">
          {property.amenities?.map((amenity, i) => (
            <div
              key={i}
              className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full text-gray-700"
            >
              <span>{amenity}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ================= BUILDINGS & UNITS ================= */}
      <div id="units" className="max-w-6xl mx-auto px-4 pb-16 space-y-12">
        <h2 className="text-2xl font-semibold mb-6">Buildings & Units</h2>

        {property.buildings?.map((building) => (
          <div key={building.name} className="space-y-4">
            {/* Building Header */}
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">
                {building.name} ({building.floors} Storeys • {building.buildingArea})
              </h3>
              <p className="text-gray-500 text-sm">{building.units.length} Units</p>
            </div>

            {/* Units grouped by type */}
            {["Office", "Retail", "Commercial"].map((type) => {
              const unitsOfType = building.units.filter(u => u.type === type);
              if (!unitsOfType.length) return null;

              return (
                <div key={type} className="mb-6">
                  <h4 className="font-medium text-lg mb-4">{type} Units</h4>
                  <div className="flex flex-col gap-6">
                    {unitsOfType.map(unit => (
                    <Card key={unit.id} className="overflow-hidden rounded-2xl flex flex-col md:flex-row shadow-md">

                      {/* ================= IMAGE MOSAIC ================= */}
                      <div className="md:w-1/2 h-[260px] grid grid-cols-2 grid-rows-2 gap-1">

                        {/* Image 1 — Large Left */}
                        <div className="col-span-1 row-span-2">
                          <img
                            src={unit.gallery?.[0]}
                            alt=""
                            className="w-full h-full object-cover rounded-tl-xl rounded-bl-xl"
                          />
                        </div>

                        {/* Image 2 — Top Right */}
                        {unit.gallery?.[1] && (
                          <div className="col-span-1 row-span-1">
                            <img
                              src={unit.gallery[1]}
                              alt=""
                              className="w-full h-full object-cover rounded-tr-xl"
                            />
                          </div>
                        )}

                        {/* Image 3 — Bottom Right with View More */}
                        {unit.gallery?.[2] && (
                          <div className="relative col-span-1 row-span-1">
                            <img
                              src={unit.gallery[2]}
                              alt=""
                              className="w-full h-full object-cover rounded-br-xl"
                            />

                            {unit.gallery.length >= 4 && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-br-xl">
                                <span className="text-white font-semibold ">
                                  +{unit.gallery.length - 2} more
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                      </div>

                      {/* ================= DATA + PRICING ================= */}
                      <div className="md:w-1/2 p-6 flex flex-col justify-between">

                        {/* Top Info */}
                        <div>
                          <p className="font-semibold text-lg mb-2">{unit.id}</p>

                          {/* Keypoints */}
                          <div className="flex flex-wrap gap-2 mb-3">
                            {unit.keypoints?.map((kp, i) => (
                              <span
                                key={i}
                                className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full"
                              >
                                {kp}
                              </span>
                            ))}
                          </div>

                          {/* Tags */}
                          <div className="flex flex-wrap gap-2">
                            {unit.tags?.map((tag, i) => (
                              <span
                                key={i}
                                className="text-xs bg-gray-100 px-3 py-1 rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>

                          {/* Details */}
                          <div className = "flex flex-wrap gap-2 mt-3">
                            {unit.details && (
                              <span className="text-md text-gray-500">
                                {unit.details}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Bottom Price + Button */}
                        <div className="flex items-end justify-between mt-6">
                          <div>
                            <p className="text-sm text-gray-500">Price per unit</p>
                            <p className="text-2xl font-bold text-blue-600">
                              ₱{unit.price.toLocaleString()}
                            </p>
                          </div>

                        <Button className="px-3 py-2 text-sm flex items-center gap-2">
                          <Flag className="w-4 h-4 text-white" />
                          View Details
                        </Button>
                        </div>

                      </div>

                    </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
