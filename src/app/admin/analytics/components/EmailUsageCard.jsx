"use client";

import React from "react";
import { Mail } from "lucide-react";
import { Card } from "@/components/ui/card";
import TooltipInfo from "./TooltipInfo";

export default function EmailUsageCard({ emailStats }) {
  return (
    <Card className="p-6 rounded-2xl border bg-white border-slate-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
          <Mail size={20} />
        </div>
        <div className="flex items-center gap-2">
          <h2 className="font-bold text-slate-900">Email Usage</h2>
          <TooltipInfo text={"Data source: email_delivery_logs table.\nCalculation: count of send attempts per day/month."} />
        </div>
      </div>
      <p className="text-3xl font-black text-slate-900">{emailStats.todaySent.toLocaleString()}</p>
      <p className="text-xs uppercase tracking-wider text-slate-500 mt-1">Emails sent today</p>
      <div className="mt-5 space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-slate-500">This month</span>
          <span className="font-bold text-slate-900">{emailStats.monthSent.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Remaining today</span>
          <span className={`font-bold ${emailStats.remainingToday === 0 ? "text-rose-600" : "text-slate-900"}`}>
            {emailStats.remainingToday.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Remaining this month</span>
          <span className={`font-bold ${emailStats.remainingMonth === 0 ? "text-rose-600" : "text-slate-900"}`}>
            {emailStats.remainingMonth.toLocaleString()}
          </span>
        </div>
      </div>
      <p className={`mt-4 text-sm font-semibold ${emailStats.remainingToday === 0 || emailStats.remainingMonth === 0 ? "text-rose-600" : "text-slate-600"}`}>
        {emailStats.usageInstalled
          ? emailStats.remainingToday === 0 || emailStats.remainingMonth === 0
            ? "Email limit reached. Consider upgrading."
            : "Counts are based on email send attempts."
          : "Email usage table is not installed yet."}
      </p>
    </Card>
  );
}
