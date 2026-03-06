"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Palmtree, CalendarDays, UserCircle, Menu, X, LogOut } from "lucide-react";
import { useAccounts } from "@/components/useclient/AccountsClient";

export default function OwnerTopBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { activeAccount, signOut } = useAccounts();
  const resortId = activeAccount?.resort_id ? Number(activeAccount.resort_id) : null;
  const accountId = activeAccount?.id ? Number(activeAccount.id) : null;

  const navLinks = [
    { name: "My Resort", href: resortId ? `/edit/resort-builder/${resortId}` : "/owner/dashboard", icon: Palmtree },
    { name: "Bookings", href: resortId ? `/edit/bookings/${resortId}` : "/owner/dashboard", icon: CalendarDays },
    { name: "Account", href: accountId ? `/edit/accounts/${accountId}` : "/owner/dashboard", icon: UserCircle },
  ];

  const closeMenu = () => setIsMenuOpen(false);
  const handleLogout = () => {
    signOut();
    router.replace("/");
    router.refresh();
  };

  return (
    <div className="w-full bg-white shadow-sm border-b border-slate-200 fixed top-0 left-0 z-[100]">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/owner/dashboard" className="text-2xl font-bold text-blue-600 hover:opacity-80 transition-opacity">
            Twin Acacia
          </Link>
          <span suppressHydrationWarning className="hidden md:flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
            {(activeAccount?.role || "owner").toUpperCase()} / {activeAccount?.full_name || "Owner"}
          </span>
        </div>

        <div className="hidden md:flex gap-2 font-medium items-center">
          {navLinks.map((link) => (
            <Link
              key={`${link.name}-${link.href}`}
              href={link.href}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                pathname === link.href ? "bg-blue-50 text-blue-600 shadow-sm" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <link.icon size={18} />
              <span>{link.name}</span>
            </Link>
          ))}

          <div className="w-[1px] h-6 bg-slate-200 mx-2" />
          <button onClick={handleLogout} className="text-slate-500 hover:text-blue-600 text-sm font-bold transition-colors flex items-center gap-2">
            <LogOut size={14} /> Logout
          </button>
        </div>

        <button className="md:hidden p-2 text-slate-600 hover:bg-slate-50 rounded-lg" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 p-4 absolute w-full shadow-2xl animate-in fade-in slide-in-from-top-2">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={`${link.name}-${link.href}`}
                href={link.href}
                onClick={closeMenu}
                className={`flex items-center gap-3 p-4 rounded-xl transition-colors ${
                  pathname === link.href ? "bg-blue-50 text-blue-600 font-bold" : "text-slate-600 active:bg-slate-50"
                }`}
              >
                <link.icon size={20} />
                {link.name}
              </Link>
            ))}

            <div className="h-[1px] bg-slate-100 my-2" />

            <button
              onClick={() => {
                closeMenu();
                handleLogout();
              }}
              className="flex items-center gap-3 p-4 text-slate-500"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
