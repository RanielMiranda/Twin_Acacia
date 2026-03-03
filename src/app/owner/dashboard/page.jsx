"use client";

import React, { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react"; 

import VisibilityCard from "./components/VisibilityCard";
import ResortCard from "./components/ResortCard";
import InboxCard from "./components/InboxCard";
import BookingsCard from "./components/BookingsCard";
import Toast from "@/components/ui/toast/Toast";
import { useToast } from "@/components/ui/toast/ToastProvider";
import AccountCard from "./components/AccountCard";
import MessageAdminModal from "./components/MessageAdminModal";
import { supabase } from "@/lib/supabase";

export default function Page() {
  const [resortStatus, setResortStatus] = useState("Draft");
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [adminMessages, setAdminMessages] = useState([]);
  const router = useRouter();
  const { toast } = useToast();
  const OWNER_RESORT_ID = 1;

  const handleRequestPublish = () => {
    setResortStatus("Pending Approval");
    toast({
      message: `Kasbah Villa publication request sent!`,
      color: "blue",
      icon: CheckCircle,
    });
  };

  const loadOwnerAdminMessages = useCallback(async () => {
    const { data, error } = await supabase
      .from("owner_admin_messages")
      .select("id, sender_role, subject, message, created_at, status")
      .eq("resort_id", OWNER_RESORT_ID)
      .order("created_at", { ascending: false })
      .limit(30);

    if (error) {
      console.error("Failed to load owner-admin messages:", error.message);
      return;
    }

    const rows = (data || []).map((row) => ({
      id: row.id,
      type: row.sender_role === "admin" ? "admin_notice" : "owner_message",
      text: row.subject ? `${row.subject} - ${row.message}` : row.message,
      date: new Date(row.created_at).toLocaleString(),
      unread: row.sender_role === "admin" && row.status !== "resolved",
    }));
    setAdminMessages(rows);
  }, [OWNER_RESORT_ID]);

  const handleOpenAdminModal = async () => {
    await loadOwnerAdminMessages();
    setIsAdminModalOpen(true);
  };

  const handleSendAdminMessage = async (data) => {
    const payload = {
      resort_id: OWNER_RESORT_ID,
      sender_role: "owner",
      sender_name: "Owner",
      subject: data.subject || "Owner Support Request",
      message: data.message,
      status: "pending",
    };
    const { error } = await supabase.from("owner_admin_messages").insert(payload);
    if (error) {
      toast({
        message: `Failed to send message: ${error.message}`,
        color: "red",
      });
      return;
    }

    toast({
      message: "Message sent to Admin",
      color: "blue",
      icon: CheckCircle,
    });
    loadOwnerAdminMessages();
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Owner Dashboard</h1>
          <p className="text-slate-500 mt-1">Manage your resort listing and communications.</p>
        </div>

        {/* THE FLUID GRID 
            - We use 3 columns.
            - We don't use wrapper divs for columns. 
            - Instead, we let cards span rows and columns freely.
        */}
        <div className="grid grid-cols-1 lg:grid-cols-3 grid-flow-row-dense gap-6 items-start">
          
          {/* 1. Visibility Card: Top Left (Occupies 2 columns width) */}
          <div className="lg:col-span-2">
            <VisibilityCard 
              status={resortStatus} 
              onRequestPublish={handleRequestPublish} 
            />
          </div>

          {/* 2. Bookings Card: Top Right (Height 3)
              This pushes things down in its own column without affecting the left side */}
          <div className="lg:col-span-1">
            <BookingsCard onBookings={() => router.push("/edit/bookings/1")} />
          </div>

          {/* 3. Resort Card: "The Spacer" 
              Because we are using 'items-start' and no row-wrappers, 
              this card moves up to immediately touch the Visibility card.
          */}
          <div className="lg:col-span-2 lg:-mt-10 transition-all">
            <ResortCard 
              onEdit={() => router.push("/edit/resort-builder/1")}
              onPreview={() => router.push("/resort/Kasbah-Villa")}
            />
          </div>

          {/* 4. Sidebar Items: These stack naturally under Bookings */}
          <div className="lg:col-span-1 space-y-6">
          <AccountCard 
            onEditProfile={() => router.push("/edit/accounts/1")}
            onContactAdmin={handleOpenAdminModal}
          />
           <InboxCard messages={adminMessages} />
          </div>

        </div>
      </div>
      <MessageAdminModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onSendMessage={handleSendAdminMessage}
      />      
      <Toast />
    </div>
  );
}
