import React, { useState } from "react";
import { 
  Inbox, CheckCircle2, AlertCircle, 
  Mail, Calendar, FileText
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function RentalManager({ onOpenForm }) {
  const [activeTab, setActiveTab] = useState("inbox");

  // Updated Mock Data to include fields for the Form
  const mockData = {
    inbox: [
      { 
        id: 1, 
        guestName: "Owner 1", 
        room: "Room A", 
        dates: "Feb 20 - 22", 
        email: "ownerA@example.com",
        pax: "4 Adults",
        status: "Inquiry",
        checkInDate: "Feb 20, 2024",
        checkOutDate: "Feb 22, 2024",
      }
    ],
    confirmed: [
      { 
        id: 2, 
        guestName: "user 2", 
        room: "Room C", 
        dates: "Feb 18 - 25", 
        email: "user@gmail.com",
        pax: "2 Adults",
        status: "Confirmed",
        downpayment: "5,000",
        paymentMethod: "GCash",
        checkInDate: "Feb 18, 2024",
        checkOutDate: "Feb 25, 2024",
      }
    ],
    overdue: [
      { id: 3, 
        guestName: "Simoun Ibarra", 
        room: "Room B", 
        dates: "Feb 10 - 15", 
        email: "simoun@example.com" }
    ]
  };

  const tabs = [
    { id: "inbox", label: "Inquiry Inbox", icon: Inbox, count: mockData.inbox.length },
    { id: "confirmed", label: "Confirmed Stays", icon: CheckCircle2, count: mockData.confirmed.length },
    { id: "overdue", label: "Pending Checkout", icon: AlertCircle, count: mockData.overdue.length },
  ];

  return (
    <Card className="border-slate-200 shadow-xl rounded-3xl overflow-hidden bg-white">
      {/* Panel Header / Tabs */}
      <div className="flex border-b border-slate-100 bg-slate-50/50">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex-1 flex items-center justify-center gap-2 py-4 px-6 text-sm font-bold transition-all
              ${activeTab === tab.id 
                ? "bg-white text-blue-600 border-b-2 border-blue-600" 
                : "text-slate-400 hover:text-slate-600 hover:bg-slate-100/50"}
            `}
          >
            <tab.icon size={18} />
            {tab.label}
            {tab.count > 0 && (
              <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Panel Content */}
      <div className="p-6 min-h-[400px]">
        {mockData[activeTab].length > 0 ? (
          <div className="space-y-3">
            {mockData[activeTab].map((item) => (
              <div key={item.id} className="group flex flex-col md:flex-row items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-blue-100 hover:bg-blue-50/30 transition-all gap-4">
                
                {/* 1. Left: Guest & Room Info */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className={`p-3 rounded-xl shrink-0 ${activeTab === 'overdue' ? 'bg-rose-100 text-rose-600' : 'bg-blue-50 text-blue-600'}`}>
                    <Calendar size={20} />
                  </div>
                  <div className="truncate">
                    <h4 className="font-bold text-slate-900 truncate">{item.guestName}</h4>
                    <p className="text-xs text-slate-500 flex items-center gap-2">
                      <span className="font-semibold text-blue-600">{item.room}</span> 
                      <span className="text-slate-300">•</span>
                      {item.dates}
                    </p>
                  </div>
                </div>

                {/* 2. Center: Email Address */}
                <div className="flex-1 flex justify-center items-center">
                  <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-100 rounded-full group-hover:bg-white transition-colors border border-transparent group-hover:border-slate-200">
                    <Mail size={14} className="text-slate-400" />
                    <span className="text-sm font-medium text-slate-600 lowercase">{item.email}</span>
                  </div>
                </div>

                {/* 3. Right: Contextual Actions */}
                <div className="flex items-center gap-2 flex-1 justify-end">
                  {activeTab === "inbox" && (
                    <>
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 rounded-xl px-4 shadow-sm shadow-emerald-100">Approve</Button>
                      <Button size="sm" variant="ghost" className="text-slate-400 hover:text-rose-600 rounded-xl">Decline</Button>
                    </>
                  )}
                  {activeTab === "confirmed" && (
                    <Button size="sm" variant="outline" className="rounded-xl border-slate-200 text-slate-600 hover:bg-white">Send Reminder</Button>
                  )}
                  {activeTab === "overdue" && (
                    <Button size="sm" className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl px-4">Process Checkout</Button>
                  )}
                  
                  <div className="h-8 w-px bg-slate-200/60 mx-1 hidden md:block" />
                  
                  {/* CHANGED: This button now opens the confirmation form */}
                  <button 
                    onClick={() => onOpenForm(item)}
                    className="p-2 text-slate-300 hover:text-blue-600 transition-colors flex items-center gap-2 group/btn" 
                    title="View Confirmation Form"
                  >
                    <FileText size={18} />
                    <span className="text-[10px] font-bold uppercase opacity-0 group-hover/btn:opacity-100 transition-opacity">Form</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <div className="bg-slate-50 p-6 rounded-full mb-4">
               <Inbox size={48} className="opacity-20" />
            </div>
            <p className="font-medium">No {activeTab} records found.</p>
          </div>
        )}
      </div>
    </Card>
  );
}