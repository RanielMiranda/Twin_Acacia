"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Database, HardDrive, AlertTriangle, RefreshCw, ExternalLink, Mail } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { BUCKET_NAME } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast/ToastProvider";
import Toast from "@/components/ui/toast/Toast";

const TABLES = [
  { name: "resorts", label: "Resorts" },
  { name: "bookings", label: "Bookings" },
  { name: "accounts", label: "Accounts" },
  { name: "ticket_messages", label: "Ticket Messages" },
  { name: "ticket_issues", label: "Ticket Issues" },
  { name: "owner_admin_messages", label: "Owner/Admin Messages" },
  { name: "booking_transactions", label: "Transactions" },
  { name: "email_delivery_logs", label: "Email Logs" },
];

const ESTIMATED_DB_RECORD_LIMIT = 50000;
const ESTIMATED_STORAGE_LIMIT_BYTES = 1024 * 1024 * 1024; // 1GB

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
    todayFailed: 0,
    sevenDaySent: 0,
    daily: [],
    trackingInstalled: true,
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
        const since = new Date();
        since.setDate(since.getDate() - 6);
        since.setHours(0, 0, 0, 0);
        const todayKey = new Date().toISOString().slice(0, 10);
        const { data, error } = await supabase
          .from("email_delivery_logs")
          .select("created_at, status")
          .gte("created_at", since.toISOString())
          .order("created_at", { ascending: true });

        if (error) {
          const tableMissing =
            error.message?.includes("email_delivery_logs") &&
            (error.message?.includes("does not exist") || error.message?.includes("schema cache"));
          if (tableMissing) {
            setEmailStats({
              todaySent: 0,
              todayFailed: 0,
              sevenDaySent: 0,
              daily: [],
              trackingInstalled: false,
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
            byDay.set(key, { date: key, sent: 0, failed: 0 });
          }

          (data || []).forEach((row) => {
            const key = String(row.created_at || "").slice(0, 10);
            if (!byDay.has(key)) return;
            const entry = byDay.get(key);
            const status = String(row.status || "").toLowerCase();
            if (status === "failed") {
              entry.failed += 1;
            } else if (status === "sent") {
              entry.sent += 1;
            }
          });

          const daily = Array.from(byDay.values());
          setEmailStats({
            todaySent: daily.find((entry) => entry.date === todayKey)?.sent || 0,
            todayFailed: daily.find((entry) => entry.date === todayKey)?.failed || 0,
            sevenDaySent: daily.reduce((sum, entry) => sum + entry.sent, 0),
            daily,
            trackingInstalled: true,
          });
        }
      } catch (err) {
        toast({
          message: `Email tracking check failed: ${err.message}`,
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
  const dbUsagePct = Math.min(100, Math.round((totalRecords / ESTIMATED_DB_RECORD_LIMIT) * 100));
  const storageUsagePct = Math.min(100, Math.round((bucketBytes / ESTIMATED_STORAGE_LIMIT_BYTES) * 100));
  const isStorageNearFull = storageUsagePct >= 80;
  const isDbNearFull = dbUsagePct >= 80;

  return (
    <div className="min-h-screen bg-slate-50 p-4 mt-10 md:p-8 pt-24">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Analytics & Capacity</h1>
            <p className="text-slate-500 mt-1">Simple health checks for database and image storage usage.</p>
          </div>
          <div className="flex gap-2">
            <a
              href="https://vercel.com/raniels-projects-2ea24826/agoda-style-website/analytics"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 h-11 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
            >
              <ExternalLink size={16} />
              Webpage Traffic Analytics
            </a>
            <Button onClick={loadAnalytics} disabled={refreshing} className="h-11 rounded-xl flex items-center justify-center">
              <RefreshCw size={16} className={refreshing ? "animate-spin mr-2" : "mr-2"} />
              Refresh
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-6 rounded-2xl border bg-white border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <Database size={20} />
              </div>
              <h2 className="font-bold text-slate-900">Database Load (Estimate)</h2>
            </div>
            <p className="text-3xl font-black text-slate-900">{totalRecords.toLocaleString()} records</p>
            <p className="text-xs uppercase tracking-wider text-slate-500 mt-1">{dbUsagePct}% of estimated safe threshold</p>
            <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full ${isDbNearFull ? "bg-rose-500" : "bg-emerald-500"}`} style={{ width: `${dbUsagePct}%` }} />
            </div>
            <p className={`mt-4 text-sm font-semibold ${isDbNearFull ? "text-rose-600" : "text-slate-600"}`}>
              {isDbNearFull
                ? "Database contains too many records. Paid tier might be needed soon."
                : "Database load is healthy right now."}
            </p>
          </Card>

          <Card className="p-6 rounded-2xl border bg-white border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <HardDrive size={20} />
              </div>
              <h2 className="font-bold text-slate-900">Image Storage (Bucket)</h2>
            </div>
            <p className="text-3xl font-black text-slate-900">{formatBytes(bucketBytes)}</p>
            <p className="text-xs uppercase tracking-wider text-slate-500 mt-1">{storageUsagePct}% of 1GB estimate</p>
            <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full ${isStorageNearFull ? "bg-rose-500" : "bg-emerald-500"}`} style={{ width: `${storageUsagePct}%` }} />
            </div>
            <p className={`mt-4 text-sm font-semibold ${isStorageNearFull ? "text-rose-600" : "text-slate-600"}`}>
              {isStorageNearFull
                ? "Image file storage almost full. Paid tier might be needed soon."
                : "Image storage has enough room."}
            </p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4">
          <Card className="p-6 rounded-2xl border bg-white border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                <Mail size={20} />
              </div>
              <h2 className="font-bold text-slate-900">Email Delivery</h2>
            </div>
            <p className="text-3xl font-black text-slate-900">{emailStats.todaySent.toLocaleString()}</p>
            <p className="text-xs uppercase tracking-wider text-slate-500 mt-1">Emails sent today</p>
            <div className="mt-5 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Last 7 days</span>
                <span className="font-bold text-slate-900">{emailStats.sevenDaySent.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Failed today</span>
                <span className={`font-bold ${emailStats.todayFailed > 0 ? "text-rose-600" : "text-slate-900"}`}>
                  {emailStats.todayFailed.toLocaleString()}
                </span>
              </div>
            </div>
            <p className="mt-4 text-sm font-semibold text-slate-600">
              {emailStats.trackingInstalled
                ? "Counts come from real email delivery log entries."
                : "Email tracking table is not installed yet."}
            </p>
          </Card>

          <Card className="p-6 rounded-2xl border bg-white border-slate-100">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="font-bold text-slate-900">Daily Email Counter</h2>
                <p className="text-sm text-slate-500">Sent and failed emails over the last 7 days.</p>
              </div>
            </div>
            {!emailStats.trackingInstalled ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
                Run `supabase/schema.sql` to enable this panel.
              </div>
            ) : (
              <div className="space-y-3">
                {emailStats.daily.map((entry) => {
                  const total = entry.sent + entry.failed;
                  const sentWidth = total > 0 ? Math.max(8, Math.round((entry.sent / total) * 100)) : 0;
                  const failedWidth = total > 0 ? Math.max(0, 100 - sentWidth) : 0;
                  return (
                    <div key={entry.date} className="grid grid-cols-[92px_1fr_auto] items-center gap-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        {new Date(`${entry.date}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </span>
                      <div className="h-3 rounded-full bg-slate-100 overflow-hidden flex">
                        <div
                          className="h-full bg-emerald-500"
                          style={{ width: `${sentWidth}%` }}
                          title={`Sent: ${entry.sent}`}
                        />
                        <div
                          className="h-full bg-rose-400"
                          style={{ width: `${failedWidth}%` }}
                          title={`Failed: ${entry.failed}`}
                        />
                      </div>
                      <span className="text-sm font-bold text-slate-900">
                        {entry.sent}
                        <span className="text-slate-400"> / </span>
                        <span className={entry.failed > 0 ? "text-rose-600" : "text-slate-400"}>{entry.failed}</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {(isStorageNearFull || isDbNearFull) && (
          <Card className="p-4 rounded-2xl border-rose-200 bg-rose-50">
            <div className="flex items-center gap-2 text-rose-700 font-bold">
              <AlertTriangle size={16} />
              Capacity Warning
            </div>
            <p className="text-sm text-rose-700 mt-1">
              One or more resources are nearing limits. Paid tier might be needed soon to avoid upload or data issues.
            </p>
          </Card>
        )}

        <p className="text-xs text-slate-500">
          {lastCheckedAt ? `Last checked: ${lastCheckedAt.toLocaleString()}` : "Not checked yet"}
        </p>
      </div>
      <Toast />
    </div>
  );
}
