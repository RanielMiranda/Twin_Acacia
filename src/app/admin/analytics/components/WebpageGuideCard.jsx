"use client";

import React from "react";
import { ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import TooltipInfo from "./TooltipInfo";

export default function WebpageGuideCard() {
  return (
    <Card className="p-6 rounded-2xl border bg-white border-slate-100">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-slate-900">Webpage Analytics Guide</h2>
            <TooltipInfo text={"Data source: Vercel Analytics dashboard.\nCalculation: reporting based on Vercel traffic metrics."} />
          </div>
          <p className="text-sm text-slate-500">What to check in the Vercel analytics link.</p>
        </div>
        <a
          href="https://vercel.com/raniels-projects-2ea24826/agoda-style-website/analytics"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-600 hover:text-slate-800"
        >
          <ExternalLink size={14} />
          Open Vercel
        </a>
      </div>
      <div className="space-y-2 text-sm text-slate-600">
        <p><span className="font-bold text-slate-900">Visitors:</span> Are people reaching the home page?</p>
        <p><span className="font-bold text-slate-900">Top pages:</span> Do resort pages get views?</p>
        <p><span className="font-bold text-slate-900">Bounce rate:</span> High bounce means the landing page needs work.</p>
        <p><span className="font-bold text-slate-900">Conversion path:</span> Do visitors reach booking or inquiry?</p>
      </div>
      <p className="mt-3 text-xs text-slate-500">
        If traffic is low, focus on marketing. If traffic is high but inquiries are low, improve the home page and resort pages.
      </p>
    </Card>
  );
}
