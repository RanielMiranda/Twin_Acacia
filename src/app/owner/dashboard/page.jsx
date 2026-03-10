"use client";

import React, { useCallback, useState, useEffect } from "react";
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
import { useAccounts } from "@/components/useclient/AccountsClient";

const isMissingOwnerAdminTableError = (error) =>
  !!error?.message &&
  (error.message.includes("Could not find the table") ||
    error.message.includes("does not exist") ||
    error.message.includes("schema cache"));

export default function Page() {
  const [resortStatus, setResortStatus] = useState("Hidden");
  const [submittingPublish, setSubmittingPublish] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [adminMessages, setAdminMessages] = useState([]);
  const [bookingsAlertCount, setBookingsAlertCount] = useState(0);
  const [resortData, setResortData] = useState(null);
  const router = useRouter();
  const { toast } = useToast();
  const { activeAccount } = useAccounts();
  const OWNER_RESORT_ID = activeAccount?.resort_id ? Number(activeAccount.resort_id) : null;
  const ACCOUNT_ID = activeAccount?.id ? Number(activeAccount.id) : null;

  const loadDashboardStatus = useCallback(async () => {
    if (!OWNER_RESORT_ID) {
      setResortStatus("Hidden");
      return;
    }
    const { data: resortRow, error: resortError } = await supabase
      .from("resorts")
      .select("id, name, visible")
      .eq("id", OWNER_RESORT_ID)
      .maybeSingle();
    if (resortError) {
      console.error("Failed to load owner resort status:", resortError.message);
      return;
    }
    setResortStatus(resortRow?.visible ? "Visible" : "Hidden");
  }, [OWNER_RESORT_ID]);

  const loadResortData = useCallback(async () => {
    if (!OWNER_RESORT_ID) {
      setResortData(null);
      return;
    }
    const { data, error } = await supabase
      .from("resorts")
      .select("id, name, location, profileImage, gallery, created_at, visible")
      .eq("id", OWNER_RESORT_ID)
      .maybeSingle();
    if (error) {
      console.error("Failed to load owner resort profile:", error.message);
      return;
    }
    setResortData(data || null);
  }, [OWNER_RESORT_ID, toast]);

  const loadBookingsAlertCount = useCallback(async () => {
    if (!OWNER_RESORT_ID) {
      setBookingsAlertCount(0);
      return;
    }
    let total = 0;
    const { count: inquiryCount, error: inquiryErr } = await supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("resort_id", OWNER_RESORT_ID)
      .in("status", ["Inquiry", "Approved Inquiry", "Pending Payment", "Pending"]);

    if (!inquiryErr) total += Number(inquiryCount || 0);

    const { count: openIssueCount, error: issueErr } = await supabase
      .from("ticket_issues")
      .select("id", { count: "exact", head: true })
      .eq("resort_id", OWNER_RESORT_ID)
      .eq("status", "open");

    if (!issueErr) total += Number(openIssueCount || 0);
    setBookingsAlertCount(total);
  }, [OWNER_RESORT_ID]);

  const handleToggleVisibility = useCallback(async () => {
    if (!OWNER_RESORT_ID) {
      toast({ message: "No resort linked to this account yet.", color: "amber" });
      return;
    }
    setSubmittingPublish(true);
    try {
      const nextVisible = resortStatus !== "Visible";
      const { error: visibilityError } = await supabase
        .from("resorts")
        .update({ visible: nextVisible })
        .eq("id", OWNER_RESORT_ID)
      if (visibilityError) throw visibilityError;

      setResortStatus(nextVisible ? "Visible" : "Hidden");
      toast({
        message: nextVisible ? "Resort is now visible to guests." : "Resort is now hidden from guests.",
        color: "blue",
        icon: CheckCircle,
      });
    } catch (error) {
      toast({
        message: `Failed to send publication request: ${error.message}`,
        color: "red",
      });
    } finally {
      setSubmittingPublish(false);
    }
  }, [OWNER_RESORT_ID, resortStatus, toast]);

  const loadOwnerAdminMessages = useCallback(async () => {
    if (!OWNER_RESORT_ID) {
      setAdminMessages([]);
      return;
    }
    const { data, error } = await supabase
      .from("owner_admin_messages")
      .select("id, sender_role, subject, message, created_at, status")
      .eq("resort_id", OWNER_RESORT_ID)
      .order("created_at", { ascending: false })
      .limit(30);

    if (error) {
      if (isMissingOwnerAdminTableError(error)) {
        setAdminMessages([]);
        toast({
          message: "Owner-admin support table is not installed yet. Run supabase/schema.sql.",
          color: "amber",
        });
        return;
      }
      console.error("Failed to load owner-admin messages:", error.message);
      return;
    }

    const rows = (data || []).map((row) => ({
      id: row.id,
      type: row.sender_role === "admin" ? "admin_notice" : "owner_message",
      senderRole: row.sender_role,
      status: row.status || "pending",
      subject: (row.subject || (row.sender_role === "admin" ? "Admin Notice" : "Owner Message"))
        .toString()
        .replace(/^./, (c) => c.toUpperCase()),
      message: row.message || "",
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
    const normalizedSubject = ["resort", "account", "support"].includes(String(data.subject || "").toLowerCase())
      ? String(data.subject).toLowerCase()
      : "support";
    const payload = {
      resort_id: OWNER_RESORT_ID,
      sender_role: "owner",
      sender_name: activeAccount?.full_name || "Owner",
      sender_image: activeAccount?.profile_image || null,
      subject: normalizedSubject,
      message: data.message,
      status: "pending",
    };
    const { error } = await supabase.from("owner_admin_messages").insert(payload);
    if (error) {
      if (isMissingOwnerAdminTableError(error)) {
        toast({
          message: "Owner-admin support table is missing. Run supabase/schema.sql.",
          color: "amber",
        });
        return;
      }
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

  useEffect(() => {
    loadDashboardStatus();
    loadResortData();
    loadBookingsAlertCount();
    loadOwnerAdminMessages();
  }, [loadBookingsAlertCount, loadDashboardStatus, loadOwnerAdminMessages, loadResortData]);

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
              submitting={submittingPublish}
              onRequestPublish={handleToggleVisibility} 
            />
          </div>

          {/* 2. Bookings Card: Top Right (Height 3)
              This pushes things down in its own column without affecting the left side */}
          <div className="lg:col-span-1">
            <BookingsCard
              alertCount={bookingsAlertCount}
              onBookings={() => {
                if (!OWNER_RESORT_ID) {
                  toast({ message: "No resort linked to this account yet.", color: "amber" });
                  return;
                }
                router.push(`/edit/bookings/${OWNER_RESORT_ID}`);
              }}
            />
          </div>

          {/* 3. Resort Card: "The Spacer" 
              Because we are using 'items-start' and no row-wrappers, 
              this card moves up to immediately touch the Visibility card.
          */}
          <div className="lg:col-span-2 lg:-mt-10 transition-all">
            <ResortCard 
              resort={resortData}
              ownerImage={activeAccount?.profile_image || null}
              onEdit={() => {
                if (!OWNER_RESORT_ID) {
                  toast({ message: "No resort linked to this account yet.", color: "amber" });
                  return;
                }
                router.push(`/edit/resort-builder/${OWNER_RESORT_ID}`);
              }}
              onPreview={() => {
                if (!resortData?.name) return;
                router.push(`/resort/${encodeURIComponent(resortData.name)}`);
              }}
            />
          </div>

          {/* 4. Sidebar Items: These stack naturally under Bookings */}
          <div className="lg:col-span-1 space-y-6">
          <AccountCard 
            account={activeAccount}
            resort={resortData}
            onEditProfile={() => {
              if (!ACCOUNT_ID) {
                toast({ message: "No active account found.", color: "amber" });
                return;
              }
              router.push(`/edit/accounts/${ACCOUNT_ID}`);
            }}
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
