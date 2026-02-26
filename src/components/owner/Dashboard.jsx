// app/owner/dashboard/page.jsx
"use client";

import React, { useState } from "react";
import {
  Eye,
  Edit3,
  MessageSquare,
  AlertCircle,
  User,
  Settings,
  CalendarDays,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function OwnerDashboard() {
  const [resortStatus, setResortStatus] = useState("Pending Approval");
  const router = useRouter();

  const handleEditResort = () => {
    router.push("/edit/resort-builder/1");
  }

  const handleEditProfile = () => {
    router.push("/edit/accounts/1")
  }

  const handlePreview = () => {
    router.push("/resort/Kasbah%20Villa%20-%20Hot%20Spring%20Resort")
  }

  const handleBookings = () => {
    router.push("/edit/bookings/1");
  }

  const statusColor = {
    Draft: "bg-amber-100 text-amber-700",
    "Pending Approval": "bg-blue-100 text-blue-700",
    Published: "bg-emerald-100 text-emerald-700",
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-slate-800">
            Owner Dashboard
          </h1>
          <p className="text-slate-500 mt-1">
            Manage your resort listing, bookings, and account settings.
          </p>
        </div>

        {/* Resort Visibility Status */}
        <Card className="p-6 mb-10 rounded-2xl shadow-md bg-white flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-100 rounded-xl">
              <AlertCircle size={24} className="text-slate-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">
                Resort Visibility
              </p>
              <div className="flex items-center gap-3 mt-1">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor[resortStatus]}`}
                >
                  {resortStatus}
                </span>
                {resortStatus !== "Published" && (
                  <span className="text-xs text-slate-400">
                    Your listing is not visible to guests yet.
                  </span>
                )}
              </div>
            </div>
          </div>

          <Button
            disabled={resortStatus === "Pending Approval"}
            className="h-11 px-6 rounded-xl font-semibold"
          >
            {resortStatus === "Pending Approval"
              ? "Approval in Progress"
              : "Request Publication"}
          </Button>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">

          {/* Resort Management Section */}
          <div className="lg:col-span-2 space-y-6">

            <Card className="overflow-hidden rounded-2xl shadow-md bg-white">
              <div className="h-56 relative overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1540541338287-41700207dee6"
                  className="w-full h-full object-cover"
                  alt="Resort"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-4 py-2 rounded-lg text-sm font-semibold">
                  Active Resort
                </div>
              </div>

              <div className="p-6 flex flex-col md:flex-row justify-between md:items-center gap-6">
                <div>
                  <h3 className="text-xl font-semibold text-slate-800">
                    Resort Name
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Last updated 2 days ago
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button 
                  variant="outline" 
                  onClick={handleEditResort}
                  className="rounded-xl flex items-center justify-center">
                    <Edit3 size={18} className="mr-2" />
                    Edit
                  </Button>
                  <Button 
                  variant="outline" 
                  onClick={handlePreview}
                  className="rounded-xl flex items-center justify-center">
                    <Eye size={18} className="mr-2" />
                    
                    Preview
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">

            {/* Booking Management */}
            <Card className="p-6 rounded-2xl shadow-md bg-white">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                Bookings
              </h3>

              <Button 
              onClick={handleBookings}
              className="w-full mt-4 rounded-xl h-11 font-semibold flex items-center justify-center">
                <CalendarDays size={18} className="mr-2" />
                Manage Bookings
              </Button>
            </Card>

            {/* Profile Section */}
            <Card className="p-6 rounded-2xl shadow-md bg-white">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                Account
              </h3>

              <div className="flex items-center gap-3 mt-4">
                <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center">
                  <User size={18} className="text-slate-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Owner Profile
                  </p>
                  <p className="text-xs text-slate-500">
                    Update your contact and payout details
                  </p>
                </div>
              </div>

              <Button 
              variant="outline" 
              onClick={handleEditProfile}
              className="w-full mt-4 rounded-xl h-11 flex items-center justify-center">
                <Settings size={18} className="mr-2" />
                Edit Profile
              </Button>

              <Button
                variant="outline"
                className="w-full mt-2 h-11 text-slate-800 font-medium flex items-center justify-center"
              >
                <MessageSquare size={18} className="mr-2" />
                Contact Support
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}