"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { BUCKET_NAME } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast/ToastProvider";
import Toast from "@/components/ui/toast/Toast";
import DatabaseRecordsCard from "./components/DatabaseRecordsCard";
import StorageUsageCard from "./components/StorageUsageCard";
import WebpageGuideCard from "./components/WebpageGuideCard";
import EmailUsageCard from "./components/EmailUsageCard";
import DailyEmailUsageCard from "./components/DailyEmailUsageCard";
import SemaphoreCard from "./components/SemaphoreCard";
import CapacityWarningCard from "./components/CapacityWarningCard";

const TABLES = [
  { name: "resorts", label: "Resorts" },
  { name: "bookings", label: "Bookings" },
  { name: "accounts", label: "Accounts" },
  { name: "ticket_messages", label: "Ticket Messages" },
  { name: "ticket_issues", label: "Ticket Issues" },
  { name: "owner_admin_messages", label: "Owner/Admin Messages" },
  { name: "booking_transactions", label: "Transactions" },
  { name: "email_delivery_logs", label: "Email Usage Logs" },
];

const ESTIMATED_DB_RECORD_LIMIT = 50000;
const ESTIMATED_STORAGE_LIMIT_BYTES = 1024 * 1024 * 1024; // 1GB
const DAILY_EMAIL_LIMIT = 100;
const MONTHLY_EMAIL_LIMIT = 3000;
function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = bytes;
  let idx = 0;
  while (value >= 1024 && idx < units.length - 1) {
    value /= 1024;
    idx += 1;
  }
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[idx]}`;
}

export default function AdminAnalyticsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tableCounts, setTableCounts] = useState([]);
  const [bucketBytes, setBucketBytes] = useState(0);
  const [lastCheckedAt, setLastCheckedAt] = useState(null);
  const [emailStats, setEmailStats] = useState({
    todaySent: 0,
    monthSent: 0,
    remainingToday: DAILY_EMAIL_LIMIT,
    remainingMonth: MONTHLY_EMAIL_LIMIT,
    daily: [],
    usageInstalled: true,
  });

  const computeBucketUsage = useCallback(async () => {
    let totalBytes = 0;
    const queue = [""];

    while (queue.length > 0) {
      const folder = queue.shift();
      let offset = 0;
      let hasMore = true;

      while (hasMore) {
        const { data, error } = await supabase.storage
          .from(BUCKET_NAME)
          .list(folder, { limit: 100, offset, sortBy: { column: "name", order: "asc" } });

        if (error) throw error;

        const rows = data || [];
        rows.forEach((item) => {
          const isFolder = !item?.metadata && !item?.id;
          if (isFolder) {
            const nextPath = folder ? `${folder}/${item.name}` : item.name;
            queue.push(nextPath);
            return;
          }
          totalBytes += Number(item?.metadata?.size || 0);
        });

        hasMore = rows.length === 100;
        offset += 100;
      }
    }

    return totalBytes;
  }, []);

  const loadAnalytics = useCallback(async () => {
    setRefreshing(true);
    try {
      const counts = await Promise.all(
        TABLES.map(async (table) => {
          const { count, error } = await supabase
            .from(table.name)
            .select("id", { head: true, count: "exact" });
          if (error) return { ...table, count: null, error: error.message };
          return { ...table, count: Number(count || 0), error: null };
        })
      );

      setTableCounts(counts);

      try {
        const bytes = await computeBucketUsage();
        setBucketBytes(bytes);
      } catch (err) {
        toast({
          message: `Storage usage check failed: ${err.message}`,
          color: "amber",
        });
      }

      try {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        monthStart.setHours(0, 0, 0, 0);
        const todayKey = now.toISOString().slice(0, 10);
        const { data, error } = await supabase
          .from("email_delivery_logs")
          .select("created_at")
          .gte("created_at", monthStart.toISOString())
          .order("created_at", { ascending: true });

        if (error) {
          const tableMissing =
            error.message?.includes("email_delivery_logs") &&
            (error.message?.includes("does not exist") || error.message?.includes("schema cache"));
          if (tableMissing) {
            setEmailStats({
              todaySent: 0,
              monthSent: 0,
              remainingToday: DAILY_EMAIL_LIMIT,
              remainingMonth: MONTHLY_EMAIL_LIMIT,
              daily: [],
              usageInstalled: false,
            });
          } else {
            throw error;
          }
        } else {
          const byDay = new Map();
          for (let offset = 0; offset < 7; offset += 1) {
            const date = new Date();
            date.setDate(date.getDate() - (6 - offset));
            const key = date.toISOString().slice(0, 10);
            byDay.set(key, { date: key, sent: 0 });
          }

          (data || []).forEach((row) => {
            const key = String(row.created_at || "").slice(0, 10);
            if (!byDay.has(key)) return;
            const entry = byDay.get(key);
            entry.sent += 1;
          });

          const daily = Array.from(byDay.values());
          const monthSent = Number(data?.length || 0);
          const todaySent = daily.find((entry) => entry.date === todayKey)?.sent || 0;
          const remainingToday = Math.max(0, DAILY_EMAIL_LIMIT - todaySent);
          const remainingMonth = Math.max(0, MONTHLY_EMAIL_LIMIT - monthSent);
          setEmailStats({
            todaySent,
            monthSent,
            remainingToday,
            remainingMonth,
            daily,
            usageInstalled: true,
          });
        }
      } catch (err) {
        toast({
          message: `Email usage check failed: ${err.message}`,
          color: "amber",
        });
      }

      setLastCheckedAt(new Date());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [computeBucketUsage, toast]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const totalRecords = useMemo(
    () => tableCounts.reduce((sum, row) => sum + Number(row.count || 0), 0),
    [tableCounts]
  );
  const dbUsagePct = Math.min(100, (totalRecords / ESTIMATED_DB_RECORD_LIMIT) * 100);
  const storageUsagePct = Math.min(100, (bucketBytes / ESTIMATED_STORAGE_LIMIT_BYTES) * 100);
  const isStorageNearFull = storageUsagePct >= 80;
  const isDbNearFull = dbUsagePct >= 80;
  const storageReadable = formatBytes(bucketBytes);
  const storageLimitReadable = formatBytes(ESTIMATED_STORAGE_LIMIT_BYTES);

  return (
    <div className="min-h-screen bg-slate-50 p-4 mt-10 md:p-8 pt-24">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Analytics & Capacity</h1>
            <p className="text-slate-500 mt-1">Simple health checks for database and image storage usage.</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={loadAnalytics} disabled={refreshing} className="h-11 rounded-xl flex items-center justify-center">
              <RefreshCw size={16} className={refreshing ? "animate-spin mr-2" : "mr-2"} />
              Refresh
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
        <SemaphoreCard />
        <WebpageGuideCard />
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">Supabase</h2>
          <a
            href="https://supabase.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-bold uppercase tracking-widest text-blue-600 hover:text-blue-700"
          >
            Open Supabase
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DatabaseRecordsCard
            totalRecords={totalRecords}
            estimatedLimit={ESTIMATED_DB_RECORD_LIMIT}
            usagePct={dbUsagePct}
            isNearFull={isDbNearFull}
          />
          <StorageUsageCard
            storageReadable={storageReadable}
            limitReadable={storageLimitReadable}
            usagePct={storageUsagePct}
            isNearFull={isStorageNearFull}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4">
          <EmailUsageCard emailStats={emailStats} />
          <DailyEmailUsageCard emailStats={emailStats} />
        </div>

        <CapacityWarningCard show={isStorageNearFull || isDbNearFull} />

        <p className="text-xs text-slate-500">
          {lastCheckedAt ? `Last checked: ${lastCheckedAt.toLocaleString()}` : "Not checked yet"}
        </p>
      </div>
      <Toast />
    </div>
  );
}

