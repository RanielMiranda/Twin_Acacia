"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, LayoutDashboard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast/useToast";

import ResortCard from "./components/ResortCard";
import SearchBar from "./components/SearchBar"; // Import
import ActionsRequiredTab from "./components/ActionsRequiredTab"; // Import

import { useResort } from "@/components/useclient/ContextEditor";
import { supabase } from "@/lib/supabase";
import resortInitialData from "@/components/adminpage/ResortBuilder/data/ResortInitialData";

export default function Dashboard() {
  const [resorts, setResorts] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("resorts");
  const [activeActionTab, setActiveActionTab] = useState("resort");

  const [messages, setMessages] = useState({
    resort: [],
    account: [],
    support: [],
  });

  const router = useRouter();
  const { resetResort } = useResort();

  useEffect(() => {
    fetchResorts();
    fetchMessages();
  }, []);

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
      console.error("Error:", err.message);
    } finally {
      setFetching(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const { data: resortMsgs } = await supabase.from("resort_messages").select("*").eq("status", "pending");
      const { data: accountMsgs } = await supabase.from("account_messages").select("*").eq("status", "pending");
      const { data: supportMsgs } = await supabase.from("support_messages").select("*").eq("status", "pending");

      setMessages({
        resort: resortMsgs || [],
        account: accountMsgs || [],
        support: supportMsgs || [],
      });
    } catch (err) {
      console.error(err.message);
    }
  };

  const handleResolve = async (id) => {
    try {
      await supabase.from(activeActionTab + "_messages").delete().eq("id", id);
      fetchMessages();
    } catch (err) {
      alert("Failed to resolve message: " + err.message);
    }
  };

  const filteredResorts = resorts.filter(
    (r) =>
      r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleVisibility = async (id, currentValue) => {
    // 1. Browser confirmation popup
    const action = currentValue ? "hide" : "show";
    const confirmed = window.confirm(`Are you sure you want to ${action} this resort?`);

    // Guard clause: stop if user clicks 'Cancel'
    if (!confirmed) return;

    try {
      console.log(`Attempting to toggle visibility for ID: ${id}...`);

      const { error } = await supabase
        .from("resorts")
        .update({ visible: !currentValue })
        .eq("id", id);

      if (error) throw error;

      // Update local state so the card re-renders immediately
      setResorts(prev =>
        prev.map(r => (r.id === id ? { ...r, visible: !currentValue } : r))
      );
      
      console.log("Visibility updated successfully.");

    } catch (err) {
      console.error("Supabase Update Error:", err.message);
      alert("Failed to toggle visibility: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto pt-10">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <LayoutDashboard className="text-blue-600" />
              Resort Management
            </h1>
            <p className="text-slate-500 mt-1">Manage live properties and admin actions.</p>
          </div>
          <Button onClick={() => { resetResort(resortInitialData); router.push("/edit/resort-builder"); }} className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 h-12 shadow-lg shadow-blue-200 transition-all hover:scale-105">
            <Plus className="mr-2 h-5 w-5" />
            Add New Resort
          </Button>
        </header>

        {/* Main Tabs */}
        <div className="mb-6 flex space-x-8 border-b border-slate-200 w-full">
          {["resorts", "actions"].map((tab) => {
            const isActive = activeTab === tab;

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative pb-4 text-sm font-bold uppercase tracking-wider transition-all ${
                  isActive
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {tab === "resorts" ? "Resorts" : "Actions Required"}

                {/* 🔴 Notification Badge (design only) */}
                {tab === "actions" && (
                  <span className="absolute -top-1 -right-5 flex items-center justify-center text-[10px] font-bold text-white bg-red-600 rounded-full h-5 min-w-[20px] px-1">
                    3
                  </span>
                )}
              </button>
            );
          })}
          <div className = "flex-1 pb-4">
            <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />  
          </div>          
        </div>

        {activeTab === "resorts" ? (
          <div className="grid grid-cols-1 gap-4">
            {fetching ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <Loader2 className="animate-spin mb-2" />
                <p>Loading resorts...</p>
              </div>
            ) : filteredResorts.length > 0 ? (
              filteredResorts.map((resort) => (
                <ResortCard key={resort.id} resort={resort} onDelete={fetchResorts} onToggleVisibility={handleToggleVisibility} />
              ))
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl shadow-sm border-2 border-dashed border-slate-200">
                <p className="text-slate-400">No resorts found.</p>
              </div>
            )}
          </div>
        ) : (
          <ActionsRequiredTab 
            activeActionTab={activeActionTab}
            setActiveActionTab={setActiveActionTab}
            messages={messages}
            onResolve={handleResolve}
          />
        )}
      </div>
    </div>
  );
}