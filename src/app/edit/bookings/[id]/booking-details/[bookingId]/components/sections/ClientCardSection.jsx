import React from "react";
import { User, Mail, Phone, MapPin } from "lucide-react";
import { StatusBadge } from "../BookingEditorAtoms";

export default function ClientCardSection({ resortName, isEditing, draft, setField, status, statusPhases = [] }) {
  const inquirerType = (draft.inquirerType || "client").toString().toLowerCase();
  const agentName = draft.agentName || draft.guestName || "Agent";
  const contactDisplayName = inquirerType === "agent" ? agentName : (draft.guestName || "Client");

  return (
    <div className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
      <div className="flex items-start sm:items-center gap-4 sm:gap-6">
        <div className="h-16 w-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-100">
          <User size={28} />
        </div>
        <div>
          <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mb-1">Contact Details</p>
          <div className="mb-2">
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${
              inquirerType === "agent"
                ? "bg-amber-100 text-amber-700"
                : "bg-emerald-100 text-emerald-700"
            }`}>
              {inquirerType === "agent" ? "Agent" : "Client"}
            </span>
          </div>
          {isEditing ? (
            <input
              className="text-3xl font-black text-slate-900 tracking-tight border-b border-slate-200 outline-none"
              value={inquirerType === "agent" ? (draft.agentName || "") : (draft.guestName || "")}
              onChange={(e) => {
                const value = e.target.value;
                if (inquirerType === "agent") {
                  setField("agentName", value);
                } else {
                  setField("guestName", value);
                  setField("stayingGuestName", value);
                }
              }}
              placeholder={inquirerType === "agent" ? "Agent name" : "Client name"}
            />
          ) : (
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{contactDisplayName}</h1>
          )}
          <div className="mt-3 space-y-1">
            {isEditing ? (
              inquirerType === "agent" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <input
                    type="email"
                    className="text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-100"
                    value={draft.email || ""}
                    onChange={(e) => setField("email", e.target.value)}
                    placeholder="Agent email"
                  />
                  <input
                    type="text"
                    className="text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-100"
                    value={draft.phoneNumber || ""}
                    onChange={(e) => setField("phoneNumber", e.target.value)}
                    placeholder="Agent phone"
                  />
                  <input
                    type="text"
                    className="text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-100 md:col-span-2"
                    value={draft.address || ""}
                    onChange={(e) => setField("address", e.target.value)}
                    placeholder="Inquirer address"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <input
                    type="email"
                    className="text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-100"
                    value={draft.email || ""}
                    onChange={(e) => setField("email", e.target.value)}
                    placeholder="Email"
                  />
                  <input
                    type="text"
                    className="text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-100"
                    value={draft.phoneNumber || ""}
                    onChange={(e) => setField("phoneNumber", e.target.value)}
                    placeholder="Phone"
                  />
                  <input
                    type="text"
                    className="text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-100 md:col-span-2"
                    value={draft.address || ""}
                    onChange={(e) => setField("address", e.target.value)}
                    placeholder="Inquirer address"
                  />
                </div>
              )
            ) : (
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                {inquirerType === "agent" ? (
                  <>
                    <span className="inline-flex items-center gap-1">
                      <Mail size={12} />
                      {draft.email || "No email"}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Phone size={12} />
                      {draft.phoneNumber || "No phone"}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={12} />
                      {draft.address || "No inquirer address"}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="inline-flex items-center gap-1">
                      <Mail size={12} />
                      {draft.email || draft.stayingGuestEmail || "No email"}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Phone size={12} />
                      {draft.phoneNumber || draft.stayingGuestPhone || "No phone"}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={12} />
                      {draft.address || "No inquirer address"}
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="shrink-0">
        {isEditing ? (
          <div className="space-y-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</p>
            <select
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-100"
              value={status}
              onChange={(e) => setField("status", e.target.value)}
            >
              {statusPhases.map((phase) => (
                <option key={phase} value={phase}>{phase}</option>
              ))}
            </select>
          </div>
        ) : (
          <StatusBadge status={status} />
        )}
      </div>
    </div>
  );
}
