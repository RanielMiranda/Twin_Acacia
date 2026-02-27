"use client";
import React, { useState } from "react";
import { X, Send, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MessageOwnerModal({ isOpen, onClose, account, onSendMessage }) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  if (!isOpen || !account) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSendMessage(account.id, { subject, message });
    setSubject("");
    setMessage("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Send Message</h2>
              <div className="flex items-center gap-2 mt-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full w-fit">
                <User size={14} />
                <span className="text-xs font-bold uppercase">{account.name} — {account.resortName}</span>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <X size={20} className="text-slate-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5 ml-1">Subject</label>
              <input
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Account Verification / Listing Update..."
                className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-medium transition-all"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5 ml-1">Message</label>
              <textarea
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your message here..."
                className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-medium transition-all resize-none"
              />
            </div>

            <div className="pt-2 flex gap-3">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={onClose}
                className="flex-1 rounded-2xl h-12 font-bold text-slate-500 hover:bg-slate-100"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-12 shadow-lg shadow-blue-100 font-bold flex items-center justify-center gap-2"
              >
                <Send size={18} /> Send Message
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}