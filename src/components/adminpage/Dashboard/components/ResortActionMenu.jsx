"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Eye, 
  EyeOff, 
  Trash2, 
  UserPlus, 
  Check, 
  X, 
  MoreVertical, 
  ExternalLink, 
  Settings2 
} from "lucide-react";
import { useRouter } from "next/navigation"

export default function ResortActionMenu({ resort, onDelete, onToggleVisibility }) {
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const dropdownRef = useRef(null);

  const [owners, setOwners] = useState([
    { id: 1, name: "Owner 1", assigned: true },
    { id: 2, name: "Owner 2", assigned: false },
    { id: 3, name: "Owner 3", assigned: false },
  ]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOwner = (id) => {
    setOwners(prev => prev.map(owner => 
      owner.id === id ? { ...owner, assigned: !owner.assigned } : owner
    ));
  };

  const handleViewResort = (resortName) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    router.push(`/resort/${encodeURIComponent(resortName)}`);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setShowDropdown(!showDropdown)}
        className={`p-2 rounded-full transition-all ${
          showDropdown ? "bg-slate-200 text-slate-900" : "hover:bg-slate-100 text-slate-400"
        }`}
      >
        <MoreVertical size={20} />
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
          
          {/* Section: Display & Visibility */}
          <div className="p-2 border-b border-slate-50">
            <p className="px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
              Visibility
            </p>
            <button 
              className="w-full flex items-center gap-3 p-3 text-left hover:bg-slate-50 rounded-xl font-bold text-slate-600 text-sm transition-colors"
              onClick={() => {
                onToggleVisibility(resort.id, resort.visible);
                setShowDropdown(false);
              }}
            >
              {resort.visible ? (
                <>
                  <EyeOff size={16} className="text-amber-500" /> 
                  <span>Hide from Public</span>
                </>
              ) : (
                <>
                  <Eye size={16} className="text-green-500" /> 
                  <span>Publish Resort</span>
                </>
              )}
            </button>

            <button 
              className="w-full flex items-center gap-3 p-3 text-left hover:bg-blue-50 rounded-xl font-bold text-blue-600 text-sm transition-colors"
              onClick={() => {
                handleViewResort(resort.name);
                setShowDropdown(false);
              }}
            >
              <ExternalLink size={16} /> 
              <span>View Live Page</span>
            </button>
          </div>

          {/* Section: Management */}
          <div className="p-2 border-b border-slate-50">
            <p className="px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
              Management
            </p>
            <button 
              className="w-full flex items-center gap-3 p-3 text-left hover:bg-slate-50 rounded-xl font-bold text-slate-600 text-sm transition-colors"
              onClick={() => { setShowModal(true); setShowDropdown(false); }}
            >
              <UserPlus size={16} /> Assign Owner
            </button>
          </div>
          
          {/* Section: Danger Zone */}
          <div className="p-2">
            <button 
              className="w-full flex items-center gap-3 p-3 text-left hover:bg-red-50 rounded-xl font-bold text-red-500 text-sm transition-colors"
              onClick={() => { onDelete(resort.id, resort.name); setShowDropdown(false); }}
            >
              <Trash2 size={16} /> Delete Resort
            </button>
          </div>
        </div>
      )}

      {/* Assign Owner Modal (Existing Logic kept, UI updated for consistency) */}
      {showModal && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-white w-full max-w-md rounded-[32px] p-8 shadow-2xl relative animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                    <Settings2 size={20} />
                </div>
                <h2 className="text-2xl font-black tracking-tight text-slate-900">Assign Owners</h2>
            </div>
            <p className="text-sm text-slate-500 mb-6 font-medium">Select managers for <span className="text-blue-600 font-bold">{resort.name}</span></p>
            
            <div className="space-y-2">
              {owners.map((owner) => (
                <div 
                  key={owner.id}
                  onClick={() => toggleOwner(owner.id)}
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer group ${
                    owner.assigned 
                    ? "border-blue-500 bg-blue-50/50" 
                    : "border-slate-50 hover:border-slate-200 bg-slate-50/30"
                  }`}
                >
                  <span className={`font-bold ${owner.assigned ? "text-blue-700" : "text-slate-600"}`}>
                    {owner.name}
                  </span>
                  <div className={`p-1 rounded-full ${owner.assigned ? "bg-blue-500 text-white" : "bg-slate-200 text-slate-400"}`}>
                    {owner.assigned ? <Check size={14} strokeWidth={4} /> : <X size={14} strokeWidth={4} />}
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={() => setShowModal(false)}
              className="w-full mt-8 bg-blue-500 text-white h-14 rounded-2xl font-black text-xs uppercase tracking-[2px] hover:bg-blue-600 transition-all active:scale-95 shadow-lg shadow-slate-200"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}