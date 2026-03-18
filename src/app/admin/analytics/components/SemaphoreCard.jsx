"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import TooltipInfo from "./TooltipInfo";

export default function SemaphoreCard() {
  return (
    <Card className="p-6 rounded-2xl border bg-white border-slate-100">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-slate-900">Semaphore SMS</h2>
            <TooltipInfo text={"Data source: Semaphore API (messages, account balance).\nCalculation: not connected yet."} />
          </div>
          <p className="text-sm text-slate-500">No live data connected yet.</p>
        </div>
      </div>
      <p className="text-xs text-slate-500">
        Worth tracking: delivery success rate, failed messages, remaining credits, and sender name status.
      </p>
    </Card>
  );
}
