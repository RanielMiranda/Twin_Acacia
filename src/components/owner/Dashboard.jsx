// app/owner/dashboard/page.jsx
"use client";

import React, { useState } from "react";
import { LayoutDashboard, Eye, Edit3, MessageSquare, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function OwnerDashboard() {
  const [resortStatus, setResortStatus] = useState("Pending Approval"); // State: Draft, Pending, Published

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 pt-24">
      <div className="max-w-5xl mx-auto">
        
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900">Welcome back, Seaside Owner!</h1>
          <p className="text-slate-500 font-medium">Manage your listing and track your property performance.</p>
        </div>

        {/* Visibility Alert Section */}
        <Card className="p-6 mb-8 bg-blue-600 text-white border-none rounded-[32px] shadow-xl shadow-blue-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
              <AlertCircle size={28} />
            </div>
            <div>
              <h3 className="font-bold text-xl">Visibility Status: {resortStatus}</h3>
              <p className="text-blue-100 text-sm">Your resort is currently hidden from the public directory.</p>
            </div>
          </div>
          <Button 
            disabled={resortStatus === "Pending Approval"}
            className="bg-white text-blue-600 hover:bg-blue-50 h-12 px-8 rounded-2xl font-black transition-all"
          >
            {resortStatus === "Pending Approval" ? "Approval in Progress..." : "Request to Publish"}
          </Button>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Resort Card Preview */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xs font-black uppercase text-slate-400 tracking-widest ml-1">Your Property</h2>
            <Card className="overflow-hidden border-none shadow-sm rounded-[32px] group">
              <div className="h-64 relative overflow-hidden">
                <img src="https://images.unsplash.com/photo-1540541338287-41700207dee6" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Resort" />
                <div className="absolute top-4 left-4 px-4 py-2 bg-white/90 backdrop-blur-md rounded-xl font-bold text-xs">Seaside Serenity Resort</div>
              </div>
              <div className="p-8 bg-white flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Seaside Serenity</h3>
                  <p className="text-slate-500 font-medium">Updated 2 days ago</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" className="rounded-2xl h-12 w-12 p-0 bg-slate-50 text-slate-600 hover:text-blue-600"><Edit3 size={20}/></Button>
                  <Button variant="ghost" className="rounded-2xl h-12 w-12 p-0 bg-slate-50 text-slate-600 hover:text-blue-600"><Eye size={20}/></Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Quick Stats/Actions */}
          <div className="space-y-6">
            <h2 className="text-xs font-black uppercase text-slate-400 tracking-widest ml-1">Performance</h2>
            <Card className="p-6 border-none shadow-sm rounded-[32px] bg-white text-center">
               <div className="text-4xl font-black text-slate-900 mb-1">0</div>
               <p className="text-slate-500 font-bold text-xs uppercase tracking-tighter">Total Bookings</p>
               <hr className="my-6 border-slate-50" />
               <Button className="w-full bg-slate-900 text-white rounded-2xl h-12 font-bold mb-3">View Detailed Analytics</Button>
               <Button variant="ghost" className="w-full text-slate-500 h-12 font-bold"><MessageSquare size={18} className="mr-2"/> Support Chat</Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}