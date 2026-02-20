"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Menu, X, ArrowLeft } from "lucide-react";

export default function AdminTopBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const isAdminDashboard = pathname === "/admin/dashboard";
  const isResortBuilder = pathname === "/admin/resortbuilder";
  const isAccountManager = pathname === "/admin/accounts";

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <div className="w-full bg-white shadow-sm border-b border-slate-200 fixed top-0 left-0 z-[100]">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        
        <div className="flex items-center gap-6">
          <Link
            href="/admin/dashboard"
            className="text-2xl font-bold text-blue-600 cursor-pointer flex items-center gap-2"
          >
            🍃 Twin Acacia
          </Link>
          
          <div className="hidden md:block h-6 w-[1px] bg-slate-200" />
          
          <span className="hidden md:flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-1 rounded">
            Admin Portal
          </span>
        </div>

        <div className="hidden md:flex gap-2 font-medium items-center">
          <Link
            href="/admin/dashboard"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isAdminDashboard ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-50 hover:text-blue-600"
            }`}
          >
            <LayoutDashboard size={18} />
            Dashboard
          </Link>

          <Link
            href="/admin/accounts"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isAccountManager ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-50 hover:text-blue-600"
            }`}
          >
            <Users size={18} />
            Accounts
          </Link>
          
          <div className="w-[1px] h-6 bg-slate-200 mx-2" />
          
          <Link 
            href="/"
            className="text-slate-500 hover:text-blue-600 flex items-center gap-1 transition-colors px-2"
          >
            Back to Site
          </Link>
        </div>

        <button
          className="md:hidden p-2 text-slate-600"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 p-4 absolute w-full shadow-xl animate-in fade-in slide-in-from-top-2">
          <div className="flex flex-col gap-2">
            <Link
              href="/admin/dashboard"
              onClick={closeMenu}
              className={`flex items-center gap-3 p-3 rounded-xl ${
                isAdminDashboard ? "bg-blue-50 text-blue-600 font-bold" : "text-slate-600"
              }`}
            >
              <LayoutDashboard size={20} />
              Dashboard
            </Link>
            <Link
              href="/admin/accounts"
              onClick={closeMenu}
              className={`flex items-center gap-3 p-3 rounded-xl ${
                isAccountManager ? "bg-blue-50 text-blue-600 font-bold" : "text-slate-600"
              }`}
            >
              <Users size={20} />
              Accounts
            </Link>
            <div className="h-[1px] bg-slate-100 my-2" />
            <Link
              href="/"
              onClick={closeMenu}
              className="flex items-center gap-3 p-3 text-slate-500"
            >
              <ArrowLeft size={20} />
              Back to Homepage
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}