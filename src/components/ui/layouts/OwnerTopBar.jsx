"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Palmtree, 
  CalendarDays, 
  UserCircle,
  Menu, 
  X, 
  Home 
} from "lucide-react";

export default function OwnerTopBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // Navigation restricted to Owner-specific routes
  const navLinks = [
    { name: "My Resort", href: "/edit/resort-builder/1", icon: Palmtree },
    { name: "Bookings", href: "/edit/bookings/1", icon: CalendarDays },
    { name: "Account", href: "/edit/accounts/1", icon: UserCircle },
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  const closeMenu = () => setIsMenuOpen(false);

  // Skeleton for SSR
  if (!mounted) {
    return (
      <div className="w-full bg-white shadow-sm border-b border-slate-200 fixed top-0 left-0 z-[100] h-[65px]">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center">
          <span className="text-2xl font-bold text-blue-600">🍃 Twin Acacia</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white shadow-sm border-b border-slate-200 fixed top-0 left-0 z-[100]">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        
        {/* Logo & Portal Tag */}
        <div className="flex items-center gap-4">
          <Link 
            href="/owner/dashboard" 
            className="text-2xl font-bold text-blue-600 flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            🍃 Twin Acacia
          </Link>
          <span className="hidden sm:flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
            Dashboard
          </span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex gap-1 font-medium items-center">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                pathname === link.href 
                  ? "bg-slate-900 text-white shadow-md" 
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <link.icon size={18} />
              <span className="text-sm">{link.name}</span>
            </Link>
          ))}
          
          <div className="w-[1px] h-6 bg-slate-200 mx-3" />
          
          <Link 
            href="/" 
            className="flex items-center gap-2 text-slate-500 hover:text-blue-600 text-sm font-bold transition-colors px-2"
          >
            <Home size={16} />
            View Site
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden p-2 text-slate-600 hover:bg-slate-50 rounded-lg" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 p-4 absolute w-full shadow-2xl animate-in fade-in slide-in-from-top-2">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className={`flex items-center gap-3 p-4 rounded-xl transition-colors ${
                  pathname === link.href 
                    ? "bg-blue-50 text-blue-600 font-bold" 
                    : "text-slate-600 active:bg-slate-50"
                }`}
              >
                <link.icon size={20} />
                {link.name}
              </Link>
            ))}
            
            <div className="h-[1px] bg-slate-100 my-2" />
            
            <Link
              href="/"
              onClick={closeMenu}
              className="flex items-center gap-3 p-4 text-slate-500"
            >
              <Home size={20} />
              Return to Homepage
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}