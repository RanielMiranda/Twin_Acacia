"use client";

import React from "react";
import { MapPin, Globe, Edit2, Trash2, Calendar, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function ResortCard({ resort, onDelete }) {
  const router = useRouter();

  const handleViewBookings = () => {
    router.push(`/admin/bookings/${resort.id}`);
  };

  const handleEdit = () => {
    router.push(`/admin/resort-builder/${resort.id}`);
  };
  
  const handleViewResort = (resortName) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    router.push(`/resort/${encodeURIComponent(resortName)}`);
  };


  return (
    <Card className="p-4 bg-white border-none shadow-sm hover:shadow-md transition-shadow group rounded-2xl">
      <div className="flex flex-col md:flex-row gap-4 md:items-center">
        {/* Image */}
        <div className="h-20 w-20 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
          <img 
            src={resort.profileImage || (resort.gallery && resort.gallery[0]) || "https://via.placeholder.com/150"} 
            alt={resort.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-slate-900 truncate">{resort.name}</h2>
          <div className="flex flex-wrap items-center gap-4 mt-1 text-sm text-slate-500">
            <span className="flex items-center gap-1">
              <MapPin size={14} /> {resort.location || "No location set"}
            </span>
            <span className="flex items-center gap-1">
              <Globe size={14} /> {resort.rooms?.length || 0} Room Types
            </span>
            <span className="font-semibold text-blue-600">
              ₱{resort.price?.toLocaleString() || 0} / night
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col md:flex-row gap-2 md:ml-auto w-full md:w-auto mt-4 md:mt-0">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleViewResort(resort.name)}
            className="rounded-lg border-slate-200 hover:bg-emerald-50 hover:text-blue-600 hover:border-blue-200 flex justify-center items-center"
          >
            <ExternalLink size={16} className="mr-2" />
            View Resort
          </Button>

          <Button 
            variant="outline" 
            size="sm"
            onClick={handleViewBookings}
            className="rounded-lg border-slate-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 flex justify-center items-center"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Bookings
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleEdit}
            className="rounded-lg border-slate-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 flex items-center justify-center"
          >
            <Edit2 className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onDelete(resort.name)}
            className="rounded-lg border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

      </div>
    </Card>
  );
}
