"use client";

import { CheckCircle2, X } from "lucide-react";
import { useToast } from "./useToast";
import { useEffect, useState } from "react";

export default function Toast() {
  const { toastData, close } = useToast();

  const [visible, setVisible] = useState(false);
  const [progressKey, setProgressKey] = useState(0);

  useEffect(() => {
    if (toastData) {
      setVisible(true);
      setProgressKey(prev => prev + 1);

      const timer = setTimeout(() => {
        setVisible(false); // start exit animation

        setTimeout(() => {
          close(); // remove toast after animation
        }, 300); // animation duration

      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [toastData]);

  if (!toastData) return null;

  const { message, color } = toastData;

  const colors = {
    green: "bg-green-500",
    red: "bg-red-500",
    blue: "bg-blue-500",
    amber: "bg-amber-500"
  };

  return (
    <div
      className={`
        fixed bottom-6 right-6 z-[200]
        transition-all duration-300
        ${visible
          ? "translate-y-0 opacity-100"
          : "-translate-y-6 opacity-0"
        }
      `}
    >
      
      <div className="bg-white shadow-xl rounded-2xl overflow-hidden min-w-[320px]">

        {/* Content */}
        <div className="p-4 flex items-center gap-3">

          <CheckCircle2 className="text-green-500" size={22} />

          <div className="text-sm font-medium text-slate-700">
            {message}
          </div>

          <button
            onClick={() => setVisible(false)}
            className="ml-auto text-slate-400 hover:text-slate-600"
          >
            <X size={18}/>
          </button>

        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-slate-200">
          <div
            key={progressKey}
            className={`h-full ${colors[color] || colors.green} animate-[toastBar_4s_linear_forwards]`}
          />
        </div>

      </div>

      <style jsx>{`
        @keyframes toastBar {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>

    </div>
  );
}