"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, LayoutDashboard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

import ResortCard from "./components/ResortCard";
import ResortStats from "./components/ResortStats";

import { useResort } from "@/components/useclient/ContextEditor";
import { supabase } from "@/lib/supabase"; // Import your supabase client
import resortInitialData from "@/components/adminpage/ResortBuilder/data/ResortInitialData";

export default function Dashboard() {
  const [resorts, setResorts] = useState([]);
  const [fetching, setFetching] = useState(true); // Track initial load
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
  const { resetResort } = useResort();

  // Fetch data from Database on mount
  useEffect(() => {
    const fetchResorts = async () => {
      setFetching(true);
      try {
        const { data, error } = await supabase
          .from("resorts")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setResorts(data || []);
      } catch (err) {
        console.error("Error fetching resorts:", err.message);
      } finally {
        setFetching(false);
      }
    };

    fetchResorts();
  }, []);

  const filteredResorts = resorts.filter((r) =>
    r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddNew = () => {
    resetResort(resortInitialData);
    router.push("/admin/resort-builder");
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to remove ${name}?`)) {
      try {
        const { error } = await supabase.from("resorts").delete().eq("id", id);
        if (error) throw error;
        setResorts(resorts.filter((r) => r.id !== id));
      } catch (err) {
        alert("Failed to delete: " + err.message);
      }
    }
  };

  const handleToggleVisibility = async (id, currentValue) => {
    try {
      const { error } = await supabase
        .from("resorts")
        .update({ visible: !currentValue })
        .eq("id", id);
      if (error) throw error;

      // Update local state so the card re-renders immediately
      setResorts(prev =>
        prev.map(r => (r.id === id ? { ...r, visible: !currentValue } : r))
      );
    } catch (err) {
      alert("Failed to toggle visibility: " + err.message);
    }
  };
  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto pt-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <LayoutDashboard className="text-blue-600" />
              Resort Management
            </h1>
            <p className="text-slate-500 mt-1">Manage live properties from your database.</p>
          </div>

          <Button 
            onClick={handleAddNew}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 h-12 shadow-lg shadow-blue-200 transition-all hover:scale-105 flex items-center justify-center"
          >
            <Plus className="mr-2 h-5 w-5 " />
            Add New Resort
          </Button>
        </div>

        <ResortStats 
          total={resorts.length} 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm} 
        />

        {/* Resort Cards Grid */}
        <div className="grid grid-cols-1 gap-4 mt-4">
          {fetching ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Loader2 className="animate-spin mb-2" />
              <p>Loading resorts...</p>
            </div>
          ) : filteredResorts.length > 0 ? (
            filteredResorts.map((resort) => (
              <ResortCard
                key={resort.id}
                resort={resort}
                onDelete={() => handleDelete(resort.id, resort.name)}
                onToggleVisibility={handleToggleVisibility}
              />
            ))
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm border-2 border-dashed border-slate-200">
              <p className="text-slate-400">No resorts found in the database.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}