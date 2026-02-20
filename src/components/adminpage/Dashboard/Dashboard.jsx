"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

import { Plus, LayoutDashboard } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import ResortCard from "./components/ResortCard";
import ResortStats from "./components/ResortStats";
import { resorts as resortsData } from "@/components/data/resorts";

export default function Dashboard() {
  const [resorts, setResorts] = useState(resortsData);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  // Filter resorts based on search
  const filteredResorts = resorts.filter((r) =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddNew = () => {
    router.push("/admin/resort-builder");
  };

  const handleDelete = (name) => {
    if (window.confirm(`Are you sure you want to remove ${name}?`)) {
      setResorts(resorts.filter(r => r.name !== name));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto pt-10">

        {/* Header + Add New */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <LayoutDashboard className="text-blue-600" />
              Resort Management
            </h1>
            <p className="text-slate-500 mt-1">Manage, edit, and add new properties to your directory.</p>
          </div>

          <Button 
            onClick={handleAddNew}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 h-12 shadow-lg shadow-blue-200 transition-all hover:scale-105 flex items-center justify-center"
          >
            <Plus className="mr-2 h-5 w-5 " />
            Add New Resort
          </Button>
        </div>

        {/* Stats + Search */}
        <ResortStats 
          total={resorts.length} 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm} 
        />

        {/* Resort Cards */}
        <div className="grid grid-cols-1 gap-4 mt-4">
          {filteredResorts.length > 0 ? (
            filteredResorts.map((resort) => (
              <ResortCard 
                key={resort.name} 
                resort={resort} 
                onDelete={handleDelete} 
              />
            ))
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm border-2 border-dashed border-slate-200">
              <p className="text-slate-400">No resorts found matching your search.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
