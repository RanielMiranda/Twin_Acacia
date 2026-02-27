import React from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Inbox, Mail, ShieldCheck, User, KeyRound } from "lucide-react";

export default function ActionsRequiredTab({ 
  activeActionTab, 
  setActiveActionTab, 
  messages, 
  onResolve, 
  resorts = []
}) {
  const tabs = [
    { id: "resort", label: "Resorts", icon: ShieldCheck },
    { id: "account", label: "Accounts", icon: User },
    { id: "support", label: "Support", icon: Mail },
  ];

  // Enhanced fake data with user info
  const fakeData = {
    resort: [{ 
      id: "fake-1", 
      title: "Visibility Request", 
      content: "Enable visibility for Resort 1 - Kasbah Villa", 
      requestedBy: "LuxVille Resort",
      isFake: true 
    }],
    account: [{ 
      id: "fake-2", 
      title: "Password Reset", 
      content: "Manual override requested for administrative access.", 
      requestedBy: "Kasbah Villa Admin",
      isFake: true 
    }],
    support: [{ 
      id: "fake-3", 
      title: "Booking Issue", 
      content: "Customer reported a double charge on reservation #1", 
      requestedBy: "Celeste Resort",
      isFake: true 
    }]
  };

  const displayMessages = [...(messages[activeActionTab] || []), ...fakeData[activeActionTab]];

  return (
    <div className="space-y-6">
      {/* Pill Tabs */}
      <div className="flex p-1 bg-slate-200/50 rounded-xl w-fit">
        {tabs.map((tab) => (
          <button
            KeyRound  ={tab.id}
            onClick={() => setActiveActionTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeActionTab === tab.id
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Messages List */}
      <div className="grid gap-4">
        {displayMessages.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border-2 border-dashed border-slate-200">
            <Inbox className="mx-auto h-12 w-12 text-slate-300 mb-3" />
            <p className="text-slate-400 font-medium">All caught up!</p>
          </div>
        ) : (
          displayMessages.map((msg) => (
            <div 
              KeyRound  ={msg.id} 
              className="group bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-blue-200 transition-all"
            >
              {/* Left: Icon & Main Goal */}
              <div className="flex items-center gap-4 flex-1">
                <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                  {activeActionTab === "resort" ? <ShieldCheck size={24} /> : 
                   activeActionTab === "account" ? <KeyRound   size={24} /> : <Mail size={24} />}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 flex items-center gap-2">
                    {msg.title || msg.subject}
                    {msg.isFake && <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">System</span>}
                  </h4>
                  <p className="text-sm text-slate-500 line-clamp-1">{msg.content || msg.message}</p>
                </div>
              </div>

              {/* Middle: Who Requested (The "Account Card" style) */}
              <div className="flex items-center gap-3 px-4 md:border-l md:border-r border-slate-100 min-w-[200px]">
                <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm">
                  {msg.requestedBy?.charAt(0) || "U"}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-slate-700 leading-tight">
                    {msg.requestedBy || "Unknown User"}
                  </span>
                  <span className="text-[11px] text-slate-400 uppercase tracking-tighter font-bold">
                    {msg.userRole || "Owner"}
                  </span>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  onClick={() => !msg.isFake && onResolve(msg.id)
                    
                  }
                  className="bg-emerald-500 hover:bg-emerald-600 text-white h-10 px-4 rounded-xl flex items-center gap-2 transition-all active:scale-95 shadow-sm shadow-emerald-100"
                >
                  <CheckCircle2 size={18} />
                  <span className="font-semibold">Resolve</span>
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}