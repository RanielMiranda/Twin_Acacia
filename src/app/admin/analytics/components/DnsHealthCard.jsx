"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import TooltipInfo from "./TooltipInfo";

export default function DnsHealthCard() {
  return (
    <Card className="p-6 rounded-2xl border bg-white border-slate-100">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-slate-900">DNS Health</h2>
            <TooltipInfo text={"Data source: Domain registrar (Namecheap).\nCalculation: check DNS records, SSL expiry, and renewal status."} />
          </div>
          <p className="text-sm text-slate-500">Namecheap domain status and DNS settings.</p>
        </div>
      </div>
      <p className="text-xs text-slate-500">
        Worth tracking: renewal date, SSL expiry, and DNS records pointing to Vercel.
      </p>
    </Card>
  );
}
