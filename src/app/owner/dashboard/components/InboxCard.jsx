import { MessageSquare, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function InboxCard({ messages = [] }) {
  return (
    <Card className="p-0 mb-10 rounded-2xl shadow-md bg-white border-none flex flex-col h-87.5">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
        <div className="flex items-center gap-2">
          <MessageSquare size={20} className="text-blue-600" />
          <h3 className="font-bold text-slate-800">Messages Inbox</h3>
        </div>
        <span className="text-xs font-medium text-slate-500 bg-white px-2 py-1 rounded-md border border-slate-200">
          {messages.length} Messages
        </span>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.length > 0 ? (
          messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`p-4 rounded-xl border transition-colors ${
                msg.type === "admin_notice"
                  ? "bg-blue-50/60 border-blue-200"
                  : msg.status === "resolved"
                    ? "bg-emerald-50/40 border-emerald-200"
                    : "bg-white border-slate-100"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`text-[10px] uppercase font-bold tracking-wider flex items-center gap-2 ${
                  msg.type === "admin_notice" ? "text-blue-700" : "text-slate-600"
                }`}>
                  {msg.type.replace("_", " ")}
                  {msg.status === "resolved" ? (
                    <span className="px-2 py-0.5 rounded-full text-[9px] bg-emerald-100 text-emerald-700 border border-emerald-200">
                      Resolved
                    </span>
                  ) : null}
                </span>
                <div className="flex items-center text-slate-400 text-[10px]">
                  <Clock size={12} className="mr-1" />
                  {msg.date}
                </div>
              </div>
              <p className="text-sm font-black text-slate-800 leading-snug">{msg.subject || "Subject"}</p>
              <p className="text-sm text-slate-700 leading-snug mt-1">{msg.message || "-"}</p>
            </div>
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
            <MessageSquare size={32} className="mb-2 opacity-20" />
            <p className="text-sm italic">Your inbox is empty</p>
          </div>
        )}
      </div>

      {/* Footer Action */}
    </Card>
  );
}
