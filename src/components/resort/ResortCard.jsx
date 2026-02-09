import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";


export default function ResortCard({ resort }) {
    return (
    <Card className="rounded-2xl overflow-hidden shadow-md">
    <img src={resort.image} className="h-48 w-full object-cover" />


    <CardContent className="p-4">
    <div className="font-semibold text-lg">{resort.name}</div>
    <div className="text-sm text-gray-500">{resort.location}</div>


    <div className="flex items-center gap-2 mt-4 text-gray-600 text-sm">
        <Star size={16} className="text-yellow-500" />
        {resort.rating} Rating
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

    <div className="mt-4 flex flex-col gap-2">
        <a href={`tel:${resort.contactPhone}`} className="text-blue-600">
            {resort.contactPhone}
        </a>
        <a href={`mailto:${resort.contactEmail}`} className="text-blue-600">
            {resort.contactEmail}
        </a>
    </div>
    </CardContent>
    </Card>
);
}