import { CalendarDays, User, Settings, MessageSquare } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SidePanel({ onBookings, onEditProfile }) {
  return (
    <div className="space-y-6">
      {/* Booking Management */}
      <Card className="p-6 rounded-2xl shadow-md bg-white">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Bookings</h3>
        <div className="relative mt-4">
          <Button 
            onClick={onBookings}
            className="w-full rounded-xl h-11 font-semibold flex items-center justify-center"
          >
            <CalendarDays size={18} className="mr-2" />
            Manage Bookings
          </Button>
          
          {/* Red Marker Notification */}
          <span className="absolute -top-2 -right-2 h-6 w-6 bg-red-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white shadow-sm">
            1
          </span>
        </div>
      </Card>

      {/* Profile Section */}
      <Card className="p-6 rounded-2xl shadow-md bg-white">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Account</h3>
        <div className="flex items-center gap-3 mt-4">
          <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center">
            <User size={18} className="text-slate-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">Owner Profile</p>
            <p className="text-xs text-slate-500">Update contact and payout details</p>
          </div>
        </div>
        <Button variant="outline" onClick={onEditProfile} className="w-full mt-4 rounded-xl h-11 flex items-center justify-center">
          <Settings size={18} className="mr-2" /> Edit Profile
        </Button>
        <Button variant="outline" className="w-full mt-2 h-11 text-slate-800 font-medium flex items-center justify-center">
          <MessageSquare size={18} className="mr-2" /> Contact Support
        </Button>
      </Card>
    </div>
  );
}