"use client";

import React, { useState } from "react";
import { 
  Users, UserPlus, Search, MoreVertical, 
  ShieldCheck, ShieldAlert, Mail, Phone, 
  Building2, ExternalLink, Filter
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { resorts as resortsData } from "@/components/data/resorts";

export default function AccountManagement() {
  const router = useRouter();
  
  // Transform resort data into "Account" data for this view
  const [accounts, setAccounts] = useState(resortsData.map((resort, index) => ({
    id: String(index + 1),
    name: resort.ownerName || `Admin ${index + 1}`, // Fallback if ownerName isn't in data
    email: resort.contactEmail || "contact@resort.com",
    phone: resort.contactPhone || "+63 000 000 0000",
    resortName: resort.name,
    status: resort.status || (index % 3 === 0 ? "Active" : index % 3 === 1 ? "Pending" : "Suspended"),
    joinedDate: resort.joinedDate || "2024-01-01",
    profileImage: resort.profileImage,
    originalName: resort.name // Used for navigation
  })));

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const filteredAccounts = accounts.filter(acc => {
    const matchesSearch = acc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          acc.resortName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "All" || acc.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const toggleStatus = (id) => {
    setAccounts(accounts.map(acc => {
      if (acc.id === id) {
        const newStatus = acc.status === "Active" ? "Suspended" : "Active";
        return { ...acc, status: newStatus };
      }
      return acc;
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 pt-20 mt-10">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Users className="text-blue-600" />
              Account Management
            </h1>
            <p className="text-slate-500 mt-1">Manage resort owner credentials and platform access.</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 flex items-center shadow-lg shadow-blue-100 transition-transform hover:scale-105">
            <UserPlus className="mr-2 h-5 w-5" />
            Invite New Owner
          </Button>
        </div>

        {/* Unified Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: "Total Owners", value: accounts.length, icon: Users, color: "blue" },
            { label: "Pending Approval", value: accounts.filter(a => a.status === 'Pending').length, icon: ShieldAlert, color: "amber" },
            { label: "Active Accounts", value: accounts.filter(a => a.status === 'Active').length, icon: ShieldCheck, color: "green" }
          ].map((stat, i) => (
            <Card key={i} className="p-6 bg-white border-slate-200 shadow-sm flex items-center gap-4 rounded-2xl">
              <div className={`p-3 bg-${stat.color}-50 text-${stat.color}-600 rounded-2xl`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text"
              placeholder="Search by owner name or resort..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex p-1 bg-slate-100 rounded-xl gap-1">
            {["All", "Active", "Pending", "Suspended"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                  filterStatus === status 
                    ? "bg-white text-blue-600 shadow-sm" 
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Account List */}
        <div className="flex flex-col gap-4">
          {filteredAccounts.length > 0 ? (
            filteredAccounts.map((account) => (
              <Card key={account.id} className="p-6 bg-white border-slate-200 hover:shadow-lg transition-all duration-300 rounded-2xl group">
                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                  
                  {/* Left: Identity Section (Fixed Width for uniformity) */}
                  <div className="flex items-center gap-4 lg:w-1/4 shrink-0">
                    <div className="relative">
                      {account.profileImage ? (
                        <img 
                          src={account.profileImage} 
                          alt={account.name}
                          className="w-14 h-14 rounded-full object-cover ring-2 ring-slate-100"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xl ring-2 ring-blue-100">
                          {account.name.charAt(0)}
                        </div>
                      )}
                      <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${
                        account.status === 'Active' ? 'bg-green-500' :
                        account.status === 'Pending' ? 'bg-amber-500' : 'bg-red-500'
                      }`} />
                    </div>
                    <div className="overflow-hidden">
                      <h3 className="font-bold text-slate-900 truncate flex items-center gap-2">
                        {account.name}
                      </h3>
                      <p className="text-sm text-slate-500 flex items-center gap-1 truncate">
                        <Building2 size={14} className="shrink-0" /> {account.resortName}
                      </p>
                    </div>
                  </div>

                  {/* Center: Contact Info (Evenly spaced grid) */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 items-center">
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                        <Mail size={16} className="text-slate-400 group-hover:text-blue-500" />
                      </div>
                      <span className="truncate">{account.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                        <Phone size={16} className="text-slate-400 group-hover:text-blue-500" />
                      </div>
                      <span>{account.phone}</span>
                    </div>
                    <div className="hidden xl:flex items-center gap-3 text-sm text-slate-400 italic">
                      Joined {account.joinedDate}
                    </div>
                  </div>

                  {/* Right: Actions (Uniform alignment) */}
                  <div className="flex items-center gap-3 border-t lg:border-t-0 pt-4 lg:pt-0 shrink-0">
                    
                    {account.status !== "Pending" ? (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => toggleStatus(account.id)}
                        className={`rounded-xl h-10 px-4 font-semibold ${
                          account.status === 'Active' 
                            ? 'text-red-500 hover:bg-red-50 hover:text-red-600' 
                            : 'text-green-500 hover:bg-green-50 hover:text-green-600'
                        }`}
                      >
                        {account.status === 'Active' ? 'Suspend' : 'Restore'}
                      </Button>
                    ) : (
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white rounded-xl h-10 px-4">
                        Approve
                      </Button>
                    )}

                    <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
                      <MoreVertical size={20} />
                    </button>
                  </div>

                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200">
              <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users size={40} className="text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">No matching accounts</h3>
              <p className="text-slate-500 mt-2">Adjust your search terms or filters and try again.</p>
              <Button 
                variant="link" 
                className="mt-4 text-blue-600"
                onClick={() => {setSearchTerm(""); setFilterStatus("All");}}
              >
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}