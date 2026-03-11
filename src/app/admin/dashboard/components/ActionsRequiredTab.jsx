"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Mail, ShieldCheck, KeyRound, Send, Trash2 } from "lucide-react";
import { tabs } from "./data/data";

export default function ActionsRequiredTab({
  activeActionTab,
  setActiveActionTab,
  messages,
  onResolve,
  archives,
  tabCounts = {},
  onSendMessage,
  onDeleteArchive,
}) {

  const [showArchives, setShowArchives] = useState(false);

  const displayMessages = showArchives
    ? archives?.[activeActionTab] || []
    : messages[activeActionTab] || [];

  return (
    <div className="space-y-6">

      {/* Pill Tabs */}
      <div className="flex p-1 bg-slate-200/50 rounded-xl w-fit gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveActionTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeActionTab === tab.id
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
            {tabCounts[tab.id] > 0 && (
              <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                {tabCounts[tab.id]}
              </span>
            )}
          </button>
        ))}

        {/* Toggle Archived */}
        <button
          onClick={() => setShowArchives(!showArchives)}
          className="ml-4 px-3 py-2 bg-slate-300 rounded-lg text-sm text-slate-700 hover:bg-slate-400 transition-all"
        >
          {showArchives ? "Hide Archives" : "Show Archives"}
        </button>
      </div>

      {/* Messages List */}
      <div className="grid gap-4">
        {displayMessages.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border-2 border-dashed border-slate-200">
            <Mail className="mx-auto h-12 w-12 text-slate-300 mb-3" />
            <p className="text-slate-400 font-medium">
              {showArchives ? "No archived messages" : "All caught up!"}
            </p>
          </div>
        ) : (
          displayMessages.map((msg) => (
            <div 
              key={msg.id} 
              className={`group rounded-2xl shadow-sm border p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all ${
                showArchives && msg.status === "resolved"
                  ? "bg-emerald-50/50 border-emerald-200"
                  : "bg-white border-slate-100 hover:border-blue-200"
              }`}
            >
              {/* Left: Icon & Main */}
              <div className="flex items-center gap-4 flex-1">
                <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                  {activeActionTab === "resort" ? <ShieldCheck size={24} /> : 
                   activeActionTab === "account" ? <KeyRound size={24} /> : <Mail size={24} />}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 flex items-center gap-2">
                    {msg.title}
                    {showArchives && msg.status === "resolved" ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                        Resolved
                      </span>
                    ) : null}
                  </h4>
                  <p className="text-sm text-slate-500">{msg.content}</p>
                </div>
              </div>

              {/* Middle: Who Requested */}
              <div className="flex items-center gap-3 px-4 md:border-l md:border-r border-slate-100 min-w-50">
                <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm overflow-hidden">
                  {msg.senderImage ? (
                    <img src={msg.senderImage} alt={msg.requestedBy || "Owner"} className="w-full h-full object-cover" />
                  ) : (
                    <span>{msg.requestedBy?.charAt(0) || "U"}</span>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-slate-700 leading-tight">
                    {msg.requestedBy || "Unknown User"}
                  </span>
                  <span className="text-[11px] text-slate-400 uppercase tracking-tighter font-bold">
                    {msg.requesterRole || "Owner"}
                  </span>
                </div>
              </div>

              {/* Right: Resolve */}
              {!showArchives && (
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    onClick={() => onSendMessage?.(msg)}
                    className={`h-10 px-4 rounded-xl flex items-center gap-2 text-slate-700 border-slate-200 hover:bg-slate-50 ${
                      msg?.resort_id ? "" : "opacity-60 cursor-not-allowed"
                    }`}
                    disabled={!msg?.resort_id}
                  >
                    <Send size={16} />
                    <span className="font-semibold">Send Message</span>
                  </Button>
                  <Button
                    onClick={() => onResolve(msg)}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white h-10 px-4 rounded-xl flex items-center gap-2 transition-all active:scale-95 shadow-sm shadow-emerald-100"
                  >
                    <CheckCircle2 size={18} />
                    <span className="font-semibold">{msg.actionLabel || "Resolve"}</span>
                  </Button>
                </div>
              )}
              {showArchives && (
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    onClick={() => onDeleteArchive?.(msg)}
                    className="rounded-xl flex items-center justify-center border-rose-200 text-rose-600 hover:bg-rose-50"
                    aria-label="Delete archived message"
                  >
                    <Trash2 size={18} />
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
