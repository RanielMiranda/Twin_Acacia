import { MessageSquare, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function InboxCard({ messages = [] }) {
  return (
    <Card className="p-0 mb-10 rounded-2xl shadow-md bg-white border-none flex flex-col h-[350px]">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
        <div className="flex items-center gap-2">
          <MessageSquare size={20} className="text-blue-600" />
          <h3 className="font-bold text-slate-800">Admin Correspondence</h3>
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
                msg.unread ? "bg-blue-50/30 border-blue-100" : "bg-white border-slate-100"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`text-[10px] uppercase font-bold tracking-wider ${
                  msg.type === 'action_required' ? "text-amber-600" : "text-blue-600"
                }`}>
                  {msg.type.replace('_', ' ')}
                </span>
                <div className="flex items-center text-slate-400 text-[10px]">
                  <Clock size={12} className="mr-1" />
                  {msg.date}
                </div>
              </div>
              <p className="text-sm text-slate-700 leading-snug">
                {msg.text}
              </p>
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
      <div className="p-3 border-t border-slate-100 text-center">
        <Button variant="ghost" className="text-xs text-blue-600 hover:bg-blue-50 w-full rounded-lg">
          View All History
        </Button>
      </div>
    </Card>
  );
}