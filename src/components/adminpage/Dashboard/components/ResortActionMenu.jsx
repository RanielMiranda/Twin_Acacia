"use client";

import React, { useState, useRef, useEffect } from "react";
import { Eye, EyeOff, Trash2, UserPlus, Check, X, MoreVertical } from "lucide-react";

export default function ResortActionMenu({ resort, onDelete, onToggleVisibility }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const dropdownRef = useRef(null);

  // Fake owners state
  const [owners, setOwners] = useState([
    { id: 1, name: "John Doe", assigned: true },
    { id: 2, name: "Sarah Smith", assigned: false },
    { id: 3, name: "Mike Ross", assigned: false },
  ]);

  // Close dropdown when clicking outside
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

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown Trigger */}
      <button 
        onClick={() => setShowDropdown(!showDropdown)}
        className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
      >
        <MoreVertical size={20} />
      </button>

      {/* Custom Dropdown Menu */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 p-2 animate-in fade-in zoom-in duration-200">
        <button 
          className="w-full flex items-center gap-2 p-3 text-left hover:bg-blue-50 rounded-xl font-bold text-slate-600 text-sm"
          onClick={() => {
            onToggleVisibility(resort.id, resort.visible); // pass current value
            setShowDropdown(false); // close dropdown
          }}
        >
          {resort.visible ? (
            <>
              <EyeOff size={16} /> Make Invisible
            </>
          ) : (
            <>
              <Eye size={16} /> Make Visible
            </>
          )}
        </button>

          <button 
            className="w-full flex items-center gap-2 p-3 text-left hover:bg-blue-50 rounded-xl font-bold text-blue-600 text-sm"
            onClick={() => { setShowModal(true); setShowDropdown(false); }}
          >
            <UserPlus size={16} /> Assign Owner
          </button>
          
          <button 
            className="w-full flex items-center gap-2 p-3 text-left hover:bg-red-50 rounded-xl font-bold text-red-500 text-sm"
            onClick={() => { onDelete(resort.id, resort.name); setShowDropdown(false); }}
          >
            <Trash2 size={16} /> Delete Resort
          </button>
        </div>
      )}

      {/* Custom Modal (Overlay) */}
      {showModal && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
          onClick={() => setShowModal(false)} // Close when clicking backdrop
        >
          <div 
            className="bg-white w-full max-w-md rounded-[32px] p-8 shadow-2xl relative animate-in slide-in-from-bottom-4 duration-300"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
          >
            {/* Close Button */}
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full text-slate-400"
            >
              <X size={20} />
            </button>

            <h2 className="text-2xl font-black tracking-tight text-slate-900">Assign Owners</h2>
            <p className="text-sm text-slate-500 mb-6">Select managers for {resort.name}</p>
            
            <div className="space-y-3">
              {owners.map((owner) => (
                <div 
                  key={owner.id}
                  onClick={() => toggleOwner(owner.id)}
                  className="flex items-center justify-between p-4 rounded-2xl border-2 border-slate-50 hover:border-blue-100 hover:bg-blue-50/30 cursor-pointer transition-all group"
                >
                  <span className="font-bold text-slate-700">{owner.name}</span>
                  {owner.assigned ? (
                    <div className="flex items-center gap-2 text-green-600 font-black text-[10px] uppercase">
                      <Check size={16} strokeWidth={3} />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-slate-200 group-hover:text-slate-300">
                      <X size={16} strokeWidth={3} />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button 
              onClick={() => setShowModal(false)}
              className="w-full mt-8 bg-slate-900 text-white h-12 rounded-2xl font-black text-xs uppercase tracking-[2px] hover:bg-slate-800 transition-transform active:scale-95"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}