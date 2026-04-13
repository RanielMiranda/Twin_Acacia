import { ChevronDown } from "lucide-react";

export function AccordionCard({ title, open, onToggle, children }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm transition-shadow duration-300 hover:shadow-md">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 text-left"
      >
        <span className="text-sm font-semibold text-slate-900">{title}</span>
        <ChevronDown
          size={18}
          className={`shrink-0 text-slate-400 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className={`grid transition-[grid-template-rows,opacity,margin] duration-300 ease-out ${
          open ? "mt-3 grid-rows-[1fr] opacity-100" : "mt-0 grid-rows-[0fr] opacity-70"
        }`}
      >
        <div className="overflow-hidden">
          <div className="whitespace-pre-line text-sm leading-6 text-slate-600">{children}</div>
        </div>
      </div>
    </div>
  );
}
