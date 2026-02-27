"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, CheckCircle } from "lucide-react"; // Icons for toast
import VisibilityCard from "./components/VisibilityCard";
import ResortCard from "./components/ResortCard";
import SidePanel from "./components/SidePanel";
import Toast from "@/components/ui/toast/Toast";
import { useToast } from "@/components/ui/toast/ToastProvider";

export default function OwnerDashboard() {
  // Start with 'Draft' so the button is clickable
  const [resortStatus, setResortStatus] = useState("Draft");
  const router = useRouter();
  const { toast } = useToast();

  const resortName = "Kasbah Villa";

  const handleRequestPublish = () => {
    // 1. Update status to disable the card
    setResortStatus("Pending Approval");

    // 2. Trigger the Toast
    toast({
      message: `${resortName} publication request sent!`,
      color: "blue",
      icon: CheckCircle,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-slate-800">Owner Dashboard</h1>
          <p className="text-slate-500 mt-1">Manage your resort listing, bookings, and account settings.</p>
        </div>

        <VisibilityCard 
          status={resortStatus} 
          onRequestPublish={handleRequestPublish} 
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          <div className="lg:col-span-2">
            <ResortCard 
              onEdit={() => router.push("/edit/resort-builder/1")}
              onPreview={() => router.push("/resort/Kasbah%20Villa%20-%20Hot%20Spring%20Resort")}
            />
          </div>

          <SidePanel 
            onBookings={() => router.push("/edit/bookings/1")}
            onEditProfile={() => router.push("/edit/accounts/1")}
          />
        </div>
      </div>
      <Toast />
    </div>
  );
}