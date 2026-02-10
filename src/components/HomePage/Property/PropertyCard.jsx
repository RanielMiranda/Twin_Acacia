// PropertyCard.jsx
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { HashLink } from "react-router-hash-link";

export default function PropertyCard({ property }) {
  return (
    <Card className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
      <img
        src={property.image}
        alt={property.name}
        className="w-full h-48 object-cover"
      />

      <CardContent className="p-4">
        <h3 className="font-semibold text-lg">{property.name}</h3>
        <p className="text-sm text-gray-500">{property.location}</p>

        <div className="flex flex-wrap gap-2 mt-2 text-sm">
          <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full">
            {property.status}
          </span>
          <span className="bg-gray-100 px-2 py-1 rounded-full">
            {property.lotArea}
          </span>
          <span className="bg-gray-100 px-2 py-1 rounded-full">
            {property.buildings.length} Buildings
          </span>
        </div>

        <HashLink
          smooth
          to={`/property/${encodeURIComponent(property.name)}`}
          className="mt-4 inline-block w-full text-center bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition"
        >
          View Details
        </HashLink>
      </CardContent>
    </Card>
  );
}
