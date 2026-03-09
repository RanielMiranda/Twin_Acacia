"use client";

import React from "react";
import { Building2, Mail, Phone, ShieldCheck, UserCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ActionMenu from "./ActionMenu";

export default function AccountCard({ account, onToggleStatus, onApprove, onViewResort, onDeleteAccount, onMessageOwner }) {
  const isAdmin = (account.role || "").toLowerCase() === "admin";
  const statusColors = {
    Active: "bg-green-500",
    Pending: "bg-amber-500",
    Suspended: "bg-red-500",
  };

  return (
    <Card className="p-4 bg-white shadow-md hover:shadow-xl transition-all duration-300 rounded-3xl group relative">
      <div className="grid grid-cols-1 lg:grid-cols-[220px_180px_1fr_1fr_220px] gap-4 items-center">
        <div className="min-w-0 flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
            {account.profileImage ? (
              <img src={account.profileImage} alt={account.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-blue-600 font-black">
                {account.name?.charAt(0) || "A"}
              </div>
            )}
          </div>
          <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Name / Resort</p>
          <p className="font-bold text-slate-900 truncate">{account.name}</p>
          <p className="text-xs text-slate-500 truncate flex items-center gap-1"><Building2 size={12} />{account.resortName}</p>
          </div>
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Role</p>
          <div className="flex items-center gap-2">
            {isAdmin ? <ShieldCheck size={16} className="text-blue-600" /> : <UserCircle size={16} className="text-emerald-600" />}
            <span className={`text-xs font-black uppercase ${isAdmin ? "text-blue-600" : "text-emerald-600"}`}>
              {isAdmin ? "Admin" : "Owner"}
            </span>
            <span className={`inline-flex h-2.5 w-2.5 rounded-full ${statusColors[account.status] || "bg-slate-300"}`} />
          </div>
        </div>

        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Email</p>
          <p className="text-sm font-medium text-slate-700 truncate flex items-center gap-1"><Mail size={12} />{account.email}</p>
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Number</p>
          <p className="text-sm font-medium text-slate-700 flex items-center gap-1"><Phone size={12} />{account.phone || "-"}</p>
        </div>

        <div className="flex items-center justify-end gap-3">
          {account.status !== "Pending" ? (
            <Button
              onClick={onToggleStatus}
              className={`rounded-xl h-10 px-4 font-bold text-[10px] uppercase text-white ${
                account.status === "Active" ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
              }`}
            >
              {account.status === "Active" ? "Suspend" : "Restore"}
            </Button>
          ) : (
            <Button onClick={onApprove} className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl h-10 px-4 font-bold text-[10px] uppercase shadow-md">
              Approve
            </Button>
          )}

          <ActionMenu
            account={account}
            onViewResort={onViewResort}
            onDeleteAccount={onDeleteAccount}
            onMessageOwner={onMessageOwner}
          />
        </div>
      </div>
    </Card>
  );
}
