"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, LayoutDashboard, Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Toast from "@/components/ui/toast/Toast";
import { useToast } from "@/components/ui/toast/ToastProvider";

import ResortCard from "./components/ResortCard";
import SearchBar from "./components/SearchBar";
import ActionsRequiredTab from "./components/ActionsRequiredTab"; 

import { useResort } from "@/components/useclient/ContextEditor";
import { useSupport } from "@/components/useclient/SupportClient";
import { supabase } from "@/lib/supabase";
import resortInitialData from "@/app/edit/resort-builder/[id]/data/ResortInitialData";

const isMissingOwnerAdminTableError = (error) =>
  !!error?.message &&
  (error.message.includes("Could not find the table") ||
    error.message.includes("does not exist") ||
    error.message.includes("schema cache"));

const ADMIN_RESORT_COLUMNS = ["id", "name", "location", "visible", "profileImage", "gallery", "created_at"].join(", ");
const OWNER_ADMIN_COLUMNS = ["id", "resort_id", "sender_name", "sender_image", "subject", "message", "status", "created_at"].join(", ");

export default function Page() {
  const [resorts, setResorts] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("resorts");
  const [activeActionTab, setActiveActionTab] = useState("resort");
  const { toast } = useToast();
  const [messages, setMessages] = useState({ resort: [], account: [], support: [] });
  const { listArchivedOwnerAdminMessages, archiveOwnerAdminMessage, isMissingSupportTableError } = useSupport();
  
  const router = useRouter();
  const { resetResort, deleteResort } = useResort();

  const [archives, setArchives] = useState({
    resort: [],
    account: [],
    support: []
  });

  const fetchResorts = useCallback(async () => {
    setFetching(true);
    try {
      const { data, error } = await supabase
        .from("resorts")
        .select(ADMIN_RESORT_COLUMNS)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setResorts(data || []);
    } catch (err) {
      console.error("Error:", err.message);
    } finally {
      setFetching(false);
    }
  }, []);

  const fetchMessages = useCallback(async () => {
    try {
      const { data: ownerMsgs, error: ownerMsgError } = await supabase
        .from("owner_admin_messages")
        .select(OWNER_ADMIN_COLUMNS)
        .eq("sender_role", "owner")
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      if (ownerMsgError && !isMissingOwnerAdminTableError(ownerMsgError)) {
        throw ownerMsgError;
      }
      if (ownerMsgError && isMissingOwnerAdminTableError(ownerMsgError)) {
        toast({
          message: "Owner-admin support table is missing. Run supabase/schema.sql.",
          color: "amber",
        });
      }

      const normalized = (ownerMsgs || []).map((row) => ({
        id: row.id,
        resort_id: row.resort_id,
        title: (row.subject || "support").toString().replace(/^./, (c) => c.toUpperCase()),
        content: row.message,
        requestedBy: row.sender_name || `Resort #${row.resort_id || "Unknown"}`,
        senderImage: row.sender_image || null,
        status: row.status,
        category: ((row.subject || "support").toString().toLowerCase()),
        created_at: row.created_at,
      }));

      const resortMsgs = normalized.filter((msg) => msg.category === "resort");
      const accountMsgs = normalized.filter((msg) => msg.category === "account");
      const supportMsgs = normalized.filter((msg) => msg.category !== "resort" && msg.category !== "account");

      let archivedRows = [];
      try {
        archivedRows = await listArchivedOwnerAdminMessages();
      } catch (archiveError) {
        if (!isMissingSupportTableError(archiveError)) {
          throw archiveError;
        }
      }
      const normalizedArchived = (archivedRows || []).map((row) => ({
        id: `arch:${row.id}`,
        resort_id: row.resort_id,
        title: (row.subject || "support").toString().replace(/^./, (c) => c.toUpperCase()),
        content: row.message,
        requestedBy: row.sender_name || `Resort #${row.resort_id || "Unknown"}`,
        senderImage: row.sender_image || null,
        status: row.status || "resolved",
        category: ((row.subject || "support").toString().toLowerCase()),
        created_at: row.created_at,
        archived_at: row.archived_at,
      }));

      setMessages({
        resort: resortMsgs || [],
        account: accountMsgs || [],
        support: supportMsgs,
      });
      setArchives({
        resort: normalizedArchived.filter((msg) => msg.category === "resort"),
        account: normalizedArchived.filter((msg) => msg.category === "account"),
        support: normalizedArchived.filter((msg) => msg.category !== "resort" && msg.category !== "account"),
      });
    } catch (err) {
      console.error(err.message);
    }
  }, [isMissingSupportTableError, listArchivedOwnerAdminMessages, toast]);

  useEffect(() => {
    fetchResorts();
    fetchMessages();
  }, [fetchMessages, fetchResorts]);

  const handleResolve = async (id) => {
    const resolvedMsg = messages[activeActionTab].find(msg => msg.id === id);
    if (!resolvedMsg) return;

    const { data: sourceRow, error: loadError } = await supabase
      .from("owner_admin_messages")
      .select("id, resort_id, sender_name, sender_image, subject, message, status, created_at")
      .eq("id", id)
      .maybeSingle();
    if (loadError) {
      toast({
        message: `Failed to resolve request: ${loadError.message}`,
        color: "red",
      });
      return;
    }
    if (!sourceRow) return;

    try {
      await archiveOwnerAdminMessage(sourceRow);
    } catch (archiveError) {
      toast({
        message: `Failed to archive request: ${archiveError.message}`,
        color: "red",
      });
      return;
    }

    toast({
      message: "Request resolved and archived",
      color: "green",
      icon: CheckCircle2,
    });
    fetchMessages();
  };

  const filteredResorts = resorts.filter(
    (r) =>
      r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleVisibility = async (id, currentValue) => {
    const targetResort = resorts.find(r => r.id === id);
    const resortName = targetResort?.name || "Resort";
    const newVisibility = !currentValue;
    
    const action = currentValue ? "hide" : "show";
    const confirmed = window.confirm(`Are you sure you want to ${action} ${resortName}?`);

    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from("resorts")
        .update({ visible: newVisibility })
        .eq("id", id);

      if (error) throw error;

      toast({
        message: `${resortName} is now ${newVisibility ? "visible" : "hidden"}`,
        color: newVisibility ? "green" : "red",
        icon: newVisibility ? Eye : EyeOff,
      });

      setResorts(prev =>
        prev.map(r => (r.id === id ? { ...r, visible: newVisibility } : r))
      );

    } catch (err) {
      console.error("Supabase Update Error:", err.message);
      toast({
        message: "Failed to update visibility",
        color: "red",
        duration: 4000
      });
    }
  };

  const handleDeleteResort = async (resortId, resortName) => {
    const confirmed = window.confirm(
      `Delete ${resortName}? This will remove resort data, related bookings, and uploaded proof/images from storage.`
    );
    if (!confirmed) return;
    const result = await deleteResort(resortId);
    if (!result?.ok) {
      toast({
        message: `Failed to delete resort: ${result?.error || "Unknown error"}`,
        color: "red",
      });
      return;
    }
    toast({
      message: `${resortName} deleted successfully.`,
      color: "green",
      icon: CheckCircle2,
    });
    fetchResorts();
    fetchMessages();
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
                  <span className="absolute -top-1 -right-5 flex items-center justify-center text-[10px] font-bold text-white bg-red-600 rounded-full h-5 min-w-5 px-1">
                    {Object.values(messages).reduce((acc, arr) => acc + arr.length, 0)}
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
                <ResortCard key={resort.id} 
                resort={resort} 
                onDelete={handleDeleteResort} 
                onToggleVisibility={handleToggleVisibility} 
                />
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
            archives={archives} 
          />
        )}
      </div>
      <Toast/>
    </div>
  );
}
