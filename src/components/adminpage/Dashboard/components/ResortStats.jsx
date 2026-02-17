import React from "react";
import { Card } from "@/components/ui/card";
import { Search } from "lucide-react";

export default function ResortStats({ total, searchTerm, setSearchTerm }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card className="p-4 bg-white border-none shadow-sm flex flex-col justify-center rounded-2xl">
        <span className="text-slate-500 text-sm">Total Resorts</span>
        <span className="text-2xl font-bold">{total}</span>
      </Card>

      <div className="md:col-span-3 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
        <input 
          type="text"
          placeholder="Search by name or location..."
          className="w-full h-full min-h-[56px] pl-12 pr-4 rounded-xl border-none shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    </div>
  );
}
