"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import TooltipInfo from "./TooltipInfo";

export default function CapacityWarningCard({ show }) {
  if (!show) return null;
  return (
    <Card className="p-4 rounded-2xl border-rose-200 bg-rose-50">
      <div className="flex items-center gap-2 text-rose-700 font-bold">
        <AlertTriangle size={16} />
        <span>Capacity Warning</span>
        <TooltipInfo text={"Triggered when database or storage usage crosses the warning threshold.\nCalculation: based on the 80% warning threshold."} />
      </div>
      <p className="text-sm text-rose-700 mt-1">
        One or more resources are nearing limits. Paid tier might be needed soon to avoid upload or data issues.
      </p>
    </Card>
  );
}
