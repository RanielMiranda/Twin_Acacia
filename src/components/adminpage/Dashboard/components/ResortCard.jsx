"use client";

import React from "react";
import { MapPin, Edit2, Calendar, Eye, EyeOff } from "lucide-react";
import ResortActionMenu from "./ResortActionMenu";
import { useRouter } from "next/navigation";

export default function ResortCard({ resort, onDelete, onToggleVisibility }) {
  const router = useRouter();

  return (
    <div className="p-4 bg-white border-none shadow-md hover:shadow-xl transition-all duration-300 rounded-3xl group relative mb-4 font-sans">
      <div className="flex flex-col lg:flex-row lg:items-center gap-6">
        
        {/* 1. Identity Section */}
        <div className="flex items-center gap-4 lg:w-[280px] shrink-0">
          <div className="h-14 w-14 rounded-2xl overflow-hidden bg-slate-100 border-2 border-white shadow-sm shrink-0">
            <img 
              src={resort.profileImage || (resort.gallery && resort.gallery[0]) || "https://via.placeholder.com/150"} 
              alt={resort.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-slate-900 truncate tracking-tight text-lg ">
              {resort.name}
            </h3>
          </div>
        </div>

        {/* 2. Address Section (Now in the middle) */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-slate-500">
            <MapPin size={16} className="shrink-0 text-slate-400" />
            <span className="text-sm font-semibold truncate leading-none">
              {resort.location || "No location set"}
            </span>
          </div>
        </div>

        {/* 3. Actions Bar*/}
        {/* Visibility */}
        <div className="min-w-0 flex items-center">
          {resort.visible ? (
            <Eye size={16} className="text-slate-500" />
          ) : (
            <EyeOff size={16} className="text-slate-500" />
          )}
        </div>        

        <div className="w-[2px] h-6 bg-slate-100 mx-1" />
                  
        <div className="flex items-center justify-end gap-2 border-t lg:border-t-0 pt-4 lg:pt-0 shrink-0">
          {/* Edit Button */}
          <button 
            onClick={() => router.push(`/edit/resort-builder/${resort.id}`)}
            className="hover:scale-105 flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl h-10 px-4 font-bold text-[10px] uppercase tracking-widest transition-all"
          >
            <Edit2 size={14} /> Edit
          </button>

          {/* Bookings Button */}
          <button 
            onClick={() => router.push(`/edit/bookings/${resort.id}`)}
            className="hover:scale-105 flex items-center gap-2 bg-blue-600 hover:bg-blue-800 text-white rounded-xl h-10 px-4 font-bold text-[10px] uppercase tracking-widest shadow-md transition-all"
          >
            <Calendar size={14} /> Bookings
          </button>

          <div className="w-[2px] h-6 bg-slate-100 mx-1" />

          {/* Triple Dot Menu (Assign & Delete) */}
          <ResortActionMenu resort={resort} onDelete={onDelete} onToggleVisibility={onToggleVisibility} />
        </div>
      </div>
    </div>
  );
}