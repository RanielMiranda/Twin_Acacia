import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

export default function ResortCard({ resort }) {
  return (
    <Card className="overflow-hidden shadow-md">
      {/* Gallery Container */}
      <div className="flex w-full h-48">
        {/* Main Image - 6/8 width */}
        <img
          src={resort.image}
          className="w-3/4 h-full object-cover"
          alt={resort.name}
        />

        {/* Mini Gallery - 2/8 width */}
        <div className="w-1/4 h-full flex flex-col">
          {/* Top mini image */}
          <img
            src={resort.image}
            className="h-1/2 w-full object-cover rounded-tr-xl"
            alt={`${resort.name} 1`}
          />

          {/* Bottom mini image with overlay */}
          <div className="relative h-1/2 w-full rounded-br-xl overflow-hidden">
            <img
              src={resort.image}
              className="h-full w-full object-cover"
              alt={`${resort.name} 2`}
            />
            <div className="absolute inset-0 bg-gray-800/50 flex items-center justify-center">
                <span className="text-white text-lg font-semibold">+8</span>
            </div>
        </div>
        </div>
      </div>

      {/* Content */}
      <CardContent className="p-4">
        <div className="font-semibold text-lg">{resort.name}</div>
        <div className="text-sm text-gray-500">{resort.location}</div>

        <div className="flex items-center gap-3 mt-3 text-gray-600 text-sm">
          <Star size={16} className="text-yellow-500" />
          <span>{resort.rating}</span>
          <span>({resort.reviews} reviews)</span>
        </div>

        <div className="flex flex-wrap gap-2 -3">
          {resort.tags?.map((tag, index) => (
            <span
              key={index}
              className="text-xs bg-gray-100 mt-3 text-gray-700 px-3 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
