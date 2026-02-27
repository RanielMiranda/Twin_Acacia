"use client";

import { User, Settings, MessageSquare } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AccountCard({ onEditProfile }) {
  const profileImg = "https://cibirdplhynnpqctcjzj.supabase.co/storage/v1/object/public/resort-images/kasbah-villa---hot-spring-resort/profile.jpg";

  return (
    <div className="space-y-6">
      <Card className="p-6 rounded-2xl shadow-md bg-white">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Account</h3>
        <div className="flex items-center gap-3 mt-4">
          {/* Replaced Icon with Profile Image */}
          <div className="h-12 w-12 rounded-full overflow-hidden border border-slate-200">
            <img 
              src={profileImg} 
              alt="Owner" 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">Kasbah Villa - Hot Spring Resort Profile</p>
            <p className="text-xs text-slate-500">Update contact and payout details</p>
          </div>
        </div>
        
        <Button variant="outline" onClick={onEditProfile} className="w-full mt-4 rounded-xl h-11 flex items-center justify-center">
          <Settings size={18} className="mr-2" /> Edit Profile
        </Button>
        <Button variant="outline" className="w-full mt-2 h-11 text-slate-800 font-medium flex items-center justify-center hover:bg-slate-50">
          <MessageSquare size={18} className="mr-2" /> Contact Support
        </Button>
      </Card>
    </div>
  );
}