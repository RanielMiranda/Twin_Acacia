// components/admin/account/ActionMenu.jsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import { MoreVertical, Edit3, KeyRound, Mail, Eye, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ActionMenu({ account, onViewResort }) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuLeft, setMenuLeft] = useState(true);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target) &&
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Adjust menu alignment on desktop when opened
  useEffect(() => {
    if (isOpen && buttonRef.current && window.innerWidth >= 768) { // md breakpoint
      const rect = buttonRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      // if button is on right half of screen, open menu to the left
      setMenuLeft(rect.left + 224 > viewportWidth); // 224 = approx menu width md:w-56
    }
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-lg transition-all ${
          isOpen
            ? "bg-slate-200 text-slate-900"
            : "text-slate-300 hover:text-slate-600 hover:bg-slate-100"
        }`}
      >
        <MoreVertical size={20} />
      </button>

      {isOpen && (
        <>
          {/* Mobile backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/30 md:hidden"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown menu */}
            <div
              className={`
                fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl p-4 
                animate-in slide-in-from-bottom duration-200
                md:absolute md:top-full md:bottom-auto md:mt-2 md:w-56 md:rounded-xl md:p-0
                ${menuLeft 
                  ? "md:right-0 md:left-auto" // Anchor right edge to button (menu expands left)
                  : "md:left-0 md:right-auto" // Anchor left edge to button (menu expands right)
                }
              `}
            >
            {/* Mobile drag handle */}
            <div className="md:hidden w-10 h-1 bg-slate-300 rounded-full mx-auto mb-4" />
            
            <div className="p-2 md:border-b md:border-slate-100">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">
                Owner Actions
              </p>
            </div>

            <div className="p-1">
              <button 
    onClick={() => router.push(`/admin/accounts/${account.id}/edit`)}
    className="w-full flex items-center gap-3 px-3 py-3 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors text-left font-bold"
  >
                <Edit3 size={16} /> Edit Profile
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-3 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors text-left font-bold">
                <KeyRound size={16} /> Reset Password
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-3 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors text-left font-bold">
                <Mail size={16} /> Send Message
              </button>
            </div>

            <div className="p-2 md:border-t md:border-slate-100">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">
                Platform
              </p>
            </div>

            <div className="p-1">
              <button
                onClick={() => {
                  onViewResort(account.resortName);
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-3 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-left font-bold"
              >
                <Eye size={16} /> View Resort Page
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-3 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors text-left font-bold">
                <Trash2 size={16} /> Delete Account
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}