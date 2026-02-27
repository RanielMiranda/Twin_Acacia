import { AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function VisibilityCard({ status, onRequestPublish }) {
  const statusColor = {
    Draft: "bg-amber-100 text-amber-700",
    "Pending Approval": "bg-blue-100 text-blue-700",
    Published: "bg-emerald-100 text-emerald-700",
  };

  // Button is only clickable if it's currently in 'Draft' mode
  const isPending = status === "Pending Approval";

  return (
    <Card className="p-6 rounded-2xl shadow-md bg-white flex flex-col md:flex-row justify-between items-center gap-6">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-slate-100 rounded-xl">
          <AlertCircle size={24} className={`text-slate-600 ${isPending ? "animate-pulse" : ""}`} />
        </div>
        <div>
          <p className="text-sm text-slate-500 font-medium">Resort Visibility</p>
          <div className="flex items-center gap-3 mt-1">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor[status]}`}>
              {status}
            </span>
            {status !== "Published" && (
              <span className="text-xs text-slate-400">
                {isPending ? "Wait for our Admin's to review your submission" : "Your listing is not visible to guests yet."}
              </span>
            )}
          </div>
        </div>
      </div>
      <Button 
        disabled={isPending} 
        onClick={onRequestPublish}
        className="h-11 px-6 rounded-xl font-semibold transition-all active:scale-95"
      >
        {isPending ? "Approval in Progress" : "Request Publication"}
      </Button>
    </Card>
  );
}