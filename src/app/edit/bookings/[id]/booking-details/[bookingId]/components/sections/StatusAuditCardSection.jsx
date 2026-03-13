import React from "react";
import { Clock, CheckCircle } from "lucide-react";
import { SectionLabel } from "../BookingEditorAtoms";

function getAuditActorLabel(entry) {
  if (entry?.actor_name) return entry.actor_name;
  if (entry?.actorName) return entry.actorName;
  return "Unknown";
}

export default function StatusAuditCardSection({ dbAudits, bookingFormAudits, transactions = [] }) {
  const mergedAudits = [
    ...(dbAudits || []).map((entry) => ({
      id: `db-${entry.id}`,
      type: "status",
      title: `${entry.old_status || "Unknown"} -> ${entry.new_status || "Unknown"}`,
      actor: getAuditActorLabel(entry),
      at: entry.changed_at,
    })),
    ...(bookingFormAudits || []).map((entry, index) => ({
      id: `form-${index}`,
      type: "form",
      title: `${entry.from || "Unknown"} -> ${entry.to || "Unknown"}`,
      actor: getAuditActorLabel(entry),
      at: entry.at,
    })),
    ...(transactions || []).map((entry) => ({
      id: `txn-${entry.id}`,
      type: "transaction",
      title: entry.note || "Payment",
      actor: entry.method ? `Method: ${entry.method}` : "Transaction",
      at: entry.created_at,
      amount: Number(entry.amount || 0),
      balance: Number(entry.balance_after || 0),
    })),
  ].sort((a, b) => new Date(b.at || 0).getTime() - new Date(a.at || 0).getTime());

  return (
    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 space-y-4">
      <SectionLabel icon={<Clock size={14} />} label="Status Audit" />
      {mergedAudits.length === 0 ? (
        <p className="text-xs text-slate-400">No audit entries yet.</p>
      ) : (
        <div className="space-y-2 max-h-72 overflow-auto pr-1">
          {mergedAudits.map((entry) => (
            <div
              key={entry.id}
              className={`rounded-xl border px-3 py-2 ${
                entry.type === "transaction"
                  ? "border-emerald-200 bg-emerald-50/60"
                  : entry.type === "form"
                    ? "border-blue-100 bg-blue-50"
                    : "border-slate-200 bg-slate-50"
              }`}
            >
              <p
                className={`text-[10px] font-black uppercase ${
                  entry.type === "transaction"
                    ? "text-emerald-700"
                    : entry.type === "form"
                      ? "text-blue-600"
                      : "text-slate-500"
                }`}
              >
                {entry.title}
              </p>
              <p
                className={`text-xs font-semibold mt-1 ${
                  entry.type === "transaction"
                    ? "text-emerald-700"
                    : entry.type === "form"
                      ? "text-blue-700"
                      : "text-slate-700"
                }`}
              >
                {entry.actor || "System"}
                {entry.type === "transaction" ? (
                  <span className="ml-2 text-[11px] font-bold text-emerald-700">
                    +PHP {Number(entry.amount || 0).toLocaleString()}
                    <span className="text-emerald-600"> - Balance: PHP {Number(entry.balance || 0).toLocaleString()}</span>
                  </span>
                ) : null}
              </p>
              <p
                className={`text-[11px] ${
                  entry.type === "transaction"
                    ? "text-emerald-600"
                    : entry.type === "form"
                      ? "text-blue-500"
                      : "text-slate-500"
                }`}
              >
                {entry.at ? new Date(entry.at).toLocaleString() : "-"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
