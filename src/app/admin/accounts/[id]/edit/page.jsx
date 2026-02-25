"use client";
import React from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EditAccountPage() {
  const { id } = useParams();
  const router = useRouter();

  // In a real app, you would fetch the account data here using the ID
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <button 
        onClick={() => router.back()}
        className="flex items-center text-slate-500 hover:text-slate-900 mb-6 font-bold text-sm transition-colors"
      >
        <ArrowLeft size={18} className="mr-2" /> Back to Accounts
      </button>

      <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-50 bg-slate-50/50">
          <h1 className="text-2xl font-black text-slate-900">Edit Owner Profile</h1>
          <p className="text-slate-500">Updating account ID: #{id}</p>
        </div>

        <form className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-slate-400 ml-1">Full Name</label>
              <input className="w-full px-4 py-3 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Owner Name" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-slate-400 ml-1">Email Address</label>
              <input className="w-full px-4 py-3 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 outline-none" placeholder="email@example.com" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-slate-400 ml-1">Password</label>
              <input 
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 outline-none" 
                placeholder="Password" />
            </div>
            <div className="space-y-2">
              <label 
                className="text-xs font-black uppercase text-slate-400 ml-1">Contact Number</label>
              <input 
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 outline-none" 
                placeholder="+63 123 123 1231" />
            </div>
          </div>          
          
          {/* Add more fields for Resort Name, Phone, etc. */}

          <div className="flex justify-end pt-4">
            <Button className="bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-white px-8 h-12 rounded-2xl font-bold shadow-lg shadow-blue-100">
              <Save size={18} className="mr-2" /> Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}