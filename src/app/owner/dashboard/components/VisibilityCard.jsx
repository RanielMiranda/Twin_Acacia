import { AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function VisibilityCard({ status, onRequestPublish, submitting = false }) {
  const statusColor = {
    Hidden: "bg-amber-100 text-amber-700",
    Visible: "bg-emerald-100 text-emerald-700",
  };

  const isBusy = submitting;
  const isCurrentlyVisible = status === "Visible";

  return (
    <Card className="p-6 rounded-2xl shadow-md bg-white flex flex-col md:flex-row justify-between items-center gap-6">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-slate-100 rounded-xl">
          <AlertCircle size={24} className={`text-slate-600 ${isBusy ? "animate-pulse" : ""}`} />
        </div>
        <div>
          <p className="text-sm text-slate-500 font-medium">Resort Visibility</p>
          <div className="flex items-center gap-3 mt-1">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor[status] || "bg-slate-100 text-slate-700"}`}>
              {status}
            </span>
            <span className="text-xs text-slate-400">
              {isCurrentlyVisible
                ? "Guests can currently discover this resort."
                : "Hidden mode is useful during maintenance or temporary closure."}
            </span>
          </div>
        </div>
      </div>
      <Button 
        disabled={isBusy} 
        onClick={onRequestPublish}
        className="h-11 px-6 rounded-xl font-semibold transition-all active:scale-95"
      >
        {isBusy ? "Saving..." : isCurrentlyVisible ? "Hide from Guests" : "Show to Guests"}
      </Button>
    </Card>
  );
}
