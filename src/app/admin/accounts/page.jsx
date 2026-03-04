"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Users, UserPlus, Search, ShieldCheck, ShieldAlert, ShieldX, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAccounts } from "@/components/useclient/AccountsClient";

import AccountCard from "./components/AccountCard";
import InviteOwnerModal from "./components/InviteOwnerModal";
import MessageOwnerModal from "./components/MessageOwnerModal";

import Toast from "@/components/ui/toast/Toast";
import { useToast } from "@/components/ui/toast/ToastProvider";

export default function Page() {
  const router = useRouter();
  const { toast } = useToast();
  const { accounts, refreshAccounts, loading, updateAccount, deleteAccount } = useAccounts();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  useEffect(() => {
    refreshAccounts();
  }, [refreshAccounts]);

  const mappedAccounts = useMemo(
    () =>
      (accounts || []).map((entry) => ({
        id: String(entry.id),
        name: entry.full_name || "Unknown",
        email: entry.email || "-",
        phone: entry.phone || "-",
        password: entry.password || "",
        resortName: entry.resorts?.name || "Unassigned Resort",
        role: entry.role || "owner",
        status: (entry.status || "pending").replace(/^./, (s) => s.toUpperCase()),
        profileImage: null,
      })),
    [accounts]
  );

  const filteredAccounts = mappedAccounts.filter((acc) => {
    const query = searchTerm.toLowerCase();
    const matchesSearch =
      acc.name.toLowerCase().includes(query) ||
      acc.resortName.toLowerCase().includes(query) ||
      acc.email.toLowerCase().includes(query);
    const matchesFilter = filterStatus === "All" || acc.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const pendingCount = mappedAccounts.filter((acc) => acc.status === "Pending").length;

  const handleOpenMessageModal = (account) => {
    setSelectedAccount(account);
    setIsMessageModalOpen(true);
  };

  const handleSendMessage = (_, data) => {
    console.info("Owner message payload:", data);
    toast({ message: "Message payload logged in console.", color: "blue", icon: CheckCircle2 });
  };

  const handleApprove = async (id) => {
    await updateAccount(id, { status: "active" });
    toast({ message: "Account approved.", color: "green", icon: CheckCircle2 });
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const next = currentStatus === "Active" ? "suspended" : "active";
    await updateAccount(id, { status: next });
    toast({
      message: next === "active" ? "Account restored." : "Account suspended.",
      color: next === "active" ? "green" : "red",
      icon: next === "active" ? ShieldCheck : ShieldX,
    });
  };

  const handleDeleteAccount = async (id) => {
    const confirmed = window.confirm("Delete this account?");
    if (!confirmed) return;
    await deleteAccount(id);
    toast({ message: "Account deleted.", color: "red", icon: ShieldAlert });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 pt-20 my-20">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3 tracking-tight">
              <Users className="text-blue-600" /> Account Management
            </h1>
            <p className="text-slate-500 mt-1 font-medium">
              Name, resort, role, email, number, password, and actions.
            </p>
          </div>
          <Button
            onClick={() => setIsInviteModalOpen(true)}
            className="bg-blue-600 flex items-center justify-center hover:scale-105 hover:bg-blue-700 text-white rounded-2xl h-12 shadow-lg shadow-blue-100 px-6 font-bold"
          >
            <UserPlus className="mr-2 h-5 w-5" /> Add Account
          </Button>

          <InviteOwnerModal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: "Total Accounts", value: mappedAccounts.length, icon: Users, color: "bg-blue-50 text-blue-600" },
            { label: "Pending Approval", value: pendingCount, icon: ShieldAlert, color: "bg-amber-50 text-amber-600" },
            { label: "Active Accounts", value: mappedAccounts.filter((a) => a.status === "Active").length, icon: ShieldCheck, color: "bg-green-50 text-green-600" },
          ].map((stat, i) => (
            <Card key={i} className="p-6 bg-white border-none shadow-sm flex items-center gap-4 rounded-3xl">
              <div className={`p-4 rounded-2xl ${stat.color}`}><stat.icon size={24} /></div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
            </Card>
          ))}
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search accounts..."
              className="w-full pl-12 pr-4 py-3.5 bg-white border-none rounded-2xl focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex p-1.5 bg-white shadow-md rounded-2xl gap-1">
            {["All", "Active", "Pending", "Suspended"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`relative px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-tighter transition-all ${
                  filterStatus === status ? "bg-slate-200 text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {status}
                {status === "Pending" && pendingCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-4.5 h-4.5 px-1 flex items-center justify-center text-[10px] font-bold text-white bg-red-500 rounded-full">
                    {pendingCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {loading ? (
            <div className="text-center py-24 bg-white rounded-[40px] shadow-inner border-2 border-dashed border-slate-100">
              <p className="text-slate-400 font-medium">Loading accounts...</p>
            </div>
          ) : filteredAccounts.length > 0 ? (
            filteredAccounts.map((account) => (
              <AccountCard
                key={account.id}
                account={account}
                onToggleStatus={() => handleToggleStatus(account.id, account.status)}
                onApprove={() => handleApprove(account.id)}
                onViewResort={(resortName) => router.push(`/resort/${encodeURIComponent(resortName)}`)}
                onDeleteAccount={() => handleDeleteAccount(account.id)}
                onMessageOwner={() => handleOpenMessageModal(account)}
              />
            ))
          ) : (
            <div className="text-center py-24 bg-white rounded-[40px] shadow-inner border-2 border-dashed border-slate-100">
              <h3 className="text-xl font-bold text-slate-900 uppercase tracking-tight">No accounts found</h3>
              <p className="text-slate-400 mt-1 font-medium">Try a different search term.</p>
            </div>
          )}
        </div>
      </div>

      <MessageOwnerModal
        isOpen={isMessageModalOpen}
        onClose={() => setIsMessageModalOpen(false)}
        account={selectedAccount}
        onSendMessage={handleSendMessage}
      />
      <Toast />
    </div>
  );
}

