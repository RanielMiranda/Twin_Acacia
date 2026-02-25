"use client";

import React, { useState } from "react";
import { Users, UserPlus, Search, ShieldCheck, ShieldAlert } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { resorts as resortsData } from "@/components/data/resorts";
import AccountCard from "./components/AccountCard";
import InviteOwnerModal from "./components/InviteOwnerModal";

export default function AccountManagement() {
  const router = useRouter();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const [accounts, setAccounts] = useState(resortsData.map((resort, index) => ({
    id: String(index + 1),
    name: resort.ownerName || `Admin ${index + 1}`,
    email: resort.contactEmail || "contact@resort.com",
    phone: resort.contactPhone || "+63 000 000 0000",
    resortName: resort.name,
    status: resort.status || (index % 3 === 0 ? "Active" : index % 3 === 1 ? "Pending" : "Suspended"),
    profileImage: resort.profileImage
  })));

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const handleViewResort = (resortName) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    router.push(`/resort/${encodeURIComponent(resortName)}`);
  };

  const toggleStatus = (id) => {
    setAccounts(accounts.map(acc => {
      if (acc.id === id) {
        return { ...acc, status: acc.status === "Active" ? "Suspended" : "Active" };
      }
      return acc;
    }));
  };

  const handleApprove = (id) => {
    setAccounts(prev => prev.map(acc => 
      acc.id === id ? { ...acc, status: 'Active' } : acc
    ));
    toast.success("Account approved successfully");
  };

  const filteredAccounts = accounts.filter(acc => {
    const matchesSearch = acc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          acc.resortName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "All" || acc.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 pt-20 my-20">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3 tracking-tight">
              <Users className="text-blue-600" /> Account Management
            </h1>
            <p className="text-slate-500 mt-1 font-medium">Manage resort owner credentials and platform access.</p>
          </div>
          <Button 
            onClick={() => setIsInviteModalOpen(true)}
            className="bg-blue-600 flex items-center justify-center hover:scale-105 hover:bg-blue-700 text-white rounded-2xl h-12 shadow-lg shadow-blue-100 px-6 font-bold">
            <UserPlus className="mr-2 h-5 w-5" /> Invite Owner
          </Button>

          {/* Add the Modal component at the bottom of the JSX */}
          <InviteOwnerModal 
            isOpen={isInviteModalOpen} 
            onClose={() => setIsInviteModalOpen(false)} 
          />
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: "Total Owners", value: accounts.length, icon: Users, color: "bg-blue-50 text-blue-600" },
            { label: "Pending Approval", value: accounts.filter(a => a.status === 'Pending').length, icon: ShieldAlert, color: "bg-amber-50 text-amber-600" },
            { label: "Active Accounts", value: accounts.filter(a => a.status === 'Active').length, icon: ShieldCheck, color: "bg-green-50 text-green-600" }
          ].map((stat, i) => (
            <Card key={i} className="p-6 bg-white border-none shadow-sm flex items-center gap-4 rounded-3xl">
              <div className={`p-4 rounded-2xl ${stat.color}`}><stat.icon size={24} /></div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{stat.label}</p>
                <p className="text-2xl font-black text-slate-900">{stat.value}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" placeholder="Search owners..."
              className="w-full pl-12 pr-4 py-3.5 bg-white border-none rounded-2xl focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm font-medium"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex p-1.5 bg-slate-200/50 rounded-2xl gap-1">
            {["All", "Active", "Pending", "Suspended"].map((status) => (
              <button
                key={status} onClick={() => setFilterStatus(status)}
                className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-tighter transition-all ${
                  filterStatus === status ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="flex flex-col gap-4">
          {filteredAccounts.length > 0 ? (
            filteredAccounts.map((account) => (
              <AccountCard 
                key={account.id} 
                account={account} 
                onToggleStatus={toggleStatus} 
                onApprove={handleApprove} // Add this
                onViewResort={handleViewResort} 
              />
            ))
          ) : (
            <div className="text-center py-24 bg-white rounded-[40px] shadow-inner border-2 border-dashed border-slate-100">
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">No accounts found</h3>
              <p className="text-slate-400 mt-1 font-medium">Try a different search term.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}