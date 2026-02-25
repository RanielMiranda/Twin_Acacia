// AccountCard.jsx updates
import React from "react";
import { Building2, Mail, Phone, Lock, Clock } from "lucide-react"; // Added Clock icon
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ActionMenu from "./ActionMenu";

export default function AccountCard({ account, onToggleStatus, onApprove, onViewResort }) {
  const statusColors = {
    Active: "bg-green-500",
    Pending: "bg-amber-500",
    Suspended: "bg-red-500",
  };

  return (
    <Card className="p-4 bg-white border-none hover:shadow-xl transition-all duration-300 rounded-3xl group relative">
      <div className="flex flex-col lg:flex-row lg:items-center gap-6">
        
        {/* 1. Identity Section */}
        <div className="flex items-center gap-4 lg:w-[280px] shrink-0">
          <div className="relative shrink-0">
            <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 border-2 border-white shadow-sm">
              {account.profileImage ? (
                <img src={account.profileImage} className="w-full h-full object-cover" alt="profile" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-blue-600 font-black text-xl">
                  {account.name.charAt(0)}
                </div>
              )}
            </div>
            <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${statusColors[account.status]}`} />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-slate-900 truncate tracking-tight">{account.name}</h3>
            <p className="text-[10px] text-slate-400 flex items-center gap-1 font-bold uppercase tracking-tighter">
              <Building2 size={12} /> {account.resortName}
            </p>
          </div>
        </div>

        {/* 2. Contact Info & Status Indicator */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-8">
          <div className="flex items-center gap-3 min-w-0">
            <Mail size={16} className="text-slate-300 shrink-0" />
            <span className="text-sm font-medium text-slate-600 truncate">{account.email}</span>
          </div>
          
          <div className="flex items-center gap-3 min-w-0">
            <Phone size={16} className="text-slate-300 shrink-0" />
            <span className="text-sm font-medium text-slate-600 truncate">{account.phone}</span>
          </div>

          <div className="flex items-center gap-3 min-w-0">
            {/* Conditional Status Display for Pending or Password Placeholder */}
            {account.status === "Pending" ? (
              <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-600 rounded-lg border border-amber-100 shrink-0">
                <Clock size={14} className="animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-wider">Pending</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="p-1 rounded shrink-0">
                  <Lock size={16} className="text-slate-300 shrink-0" />
                </div>
                <span className="text-sm font-medium text-slate-600 truncate">••••••••</span>
              </div>
            )}
          </div>
        </div>

        {/* 3. Quick Actions */}
        <div className="flex items-center justify-end gap-3 border-t lg:border-t-0 pt-4 lg:pt-0 lg:w-[220px] shrink-0">
          {account.status !== "Pending" ? (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onToggleStatus(account.id)}
              className={`rounded-xl h-10 px-4 font-black text-[10px] uppercase tracking-widest ${
                account.status === 'Active' ? 'text-red-400 hover:text-red-500' : 'text-green-500 hover:text-green-600'
              }`}
            >
              {account.status === 'Active' ? 'Suspend' : 'Restore'}
            </Button>
          ) : (
            <Button 
              onClick={() => onApprove(account.id)} // Add this click handler
              className="bg-green-500 hover:bg-green-600 text-white rounded-xl h-10 px-4 font-bold text-[10px] uppercase tracking-widest shadow-md shadow-green-100">
              Approve
            </Button>
          )}
          <ActionMenu account={account} onViewResort={onViewResort} />
        </div>
      </div>
    </Card>
  );
}