"use client";

import { User, Settings, MessageSquare } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getSupabaseSrcSet, getTransformedSupabaseImageUrl } from "@/lib/utils";

export default function AccountCard({ account, resort, onEditProfile, onContactAdmin }) {
  const profileImg = account?.profile_image || null;
  const profileTitle = account?.full_name || "Owner Account";
  const profileSubtitle = resort?.name ? `${resort.name} Profile` : "No resort linked yet";

  return (
    <div className="space-y-6">
      <Card className="p-6 rounded-2xl shadow-md bg-white">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Account</h3>
        <div className="flex items-center gap-3 mt-4">
          {/* Replaced Icon with Profile Image */}
          <div className="h-12 w-12 rounded-full overflow-hidden border border-slate-200">
            {profileImg ? (
              <img
                src={getTransformedSupabaseImageUrl(profileImg, { width: 128, quality: 80, format: "webp" })}
                srcSet={getSupabaseSrcSet(profileImg, [64, 96, 128], 80)}
                sizes="48px"
                alt="Owner"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-100 text-blue-600 font-black">
                {profileTitle?.charAt(0) || "O"}
              </div>
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">{profileTitle}</p>
            <p className="text-xs text-slate-500">{profileSubtitle}</p>
          </div>
        </div>
        
        <Button variant="outline" onClick={onEditProfile} className="w-full mt-4 rounded-xl h-11 flex items-center justify-center">
          <Settings size={18} className="mr-2" /> Edit Profile
        </Button>
        <Button
          variant="outline"
          onClick={onContactAdmin}
          className="w-full mt-2 h-11 text-slate-800 font-medium flex items-center justify-center hover:bg-slate-50"
        >
          <MessageSquare size={18} className="mr-2" />
          Contact Support
        </Button>
      </Card>
    </div>
  );
}
