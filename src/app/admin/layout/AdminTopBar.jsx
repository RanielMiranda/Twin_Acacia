"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, Menu, X, ArrowLeft, Activity, ExternalLink, LogOut } from "lucide-react";
import { useAccounts } from "@/components/useclient/AccountsClient";

export default function AdminTopBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { activeAccount, signOut } = useAccounts();

  const navLinks = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Accounts", href: "/admin/accounts", icon: Users },
    { name: "Analytics", href: "/admin/analytics", icon: Activity },
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
          <Link href="/admin/dashboard" className="text-2xl font-bold text-blue-600 hover:opacity-80 transition-opacity">
            Twin Acacia
          </Link>
          <span suppressHydrationWarning className="hidden md:flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-100">
            {(activeAccount?.role || "admin").toUpperCase()} / {activeAccount?.full_name || "Admin"}
          </span>
        </div>

        <div className="hidden md:flex gap-2 font-medium items-center">
          {navLinks.map((link) =>
            link.external ? (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-50 transition-all"
              >
                <link.icon size={18} />
                {link.name}
              </a>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  pathname === link.href ? "bg-blue-50 text-blue-600 shadow-sm" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <link.icon size={18} />
                {link.name}
              </Link>
            )
          )}

          <div className="w-[1px] h-6 bg-slate-200 mx-2" />

          <button onClick={handleLogout} className="text-slate-500 hover:text-blue-600 text-sm font-bold transition-colors flex items-center gap-2">
            <LogOut size={14} /> Logout
          </button>
        </div>

        <button
          className="md:hidden p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle Menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 p-4 absolute w-full shadow-2xl animate-in fade-in slide-in-from-top-2">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) =>
              link.external ? (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={closeMenu}
                  className="flex items-center gap-3 p-4 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  <link.icon size={20} />
                  {link.name}
                </a>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  className={`flex items-center gap-3 p-4 rounded-xl transition-colors ${
                    pathname === link.href ? "bg-blue-50 text-blue-600 font-bold shadow-sm" : "text-slate-600 active:bg-slate-50"
                  }`}
                >
                  <link.icon size={20} />
                  {link.name}
                </Link>
              )
            )}

            <div className="h-[1px] bg-slate-100 my-2" />

            <button
              onClick={() => {
                closeMenu();
                handleLogout();
              }}
              className="flex items-center gap-3 p-4 text-slate-500 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft size={20} />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
