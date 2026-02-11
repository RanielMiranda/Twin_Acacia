import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin } from "lucide-react";

export default function ResortCard({ resort }) {
  const gallery = resort.gallery || [];
  const mainImage = gallery[0];
  const topMini = gallery[1];
  const bottomMini = gallery[2];
  const extraCount = gallery.length > 3 ? gallery.length - 2 : 0;

  return (
    <Card className="overflow-hidden">
      {/* Gallery Container */}
      <div className="flex w-full h-60">
        {/* Main Image - 6/8 width */}
        <img
          src={mainImage}
          className="w-3/4 h-full object-cover"
          alt={resort.name}
        />

        {/* Mini Gallery - 2/8 width */}
        <div className="w-1/4 h-full flex flex-col">
          {/* Top mini image */}
          <img
            src={topMini}
            className="h-1/2 w-full object-cover rounded-tr-xl"
            alt={`${resort.name} 1`}
          />

          {/* Bottom mini image with overlay if extra images */}
          <div className="relative h-1/2 w-full rounded-br-xl overflow-hidden">
            <img
              src={bottomMini}
              className="h-full w-full object-cover"
              alt={`${resort.name} 2`}
            />

            {extraCount > 0 && (
              <div className="absolute inset-0 bg-gray-800/50 flex items-center justify-center">
                <span className="text-white text-lg font-semibold">
                  +{extraCount}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <CardContent className="p-4">
        <div className="font-semibold text-lg">{resort.name}</div>
          <div className="text-sm text-gray-500">
            <div className="flex items-center gap-1 my-1">
              <MapPin size={16} />
              <span> {resort.location} </span>
            </div>
          </div>

        <div className="flex flex-wrap gap-2 mt-3">
          {resort.tags?.map((tag, index) => (
            <span
              key={index}
              className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}