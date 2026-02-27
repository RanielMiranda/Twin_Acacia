"use client";

import { X } from "lucide-react";
import { useToast } from "./ToastProvider";
import { useEffect, useState } from "react";

function SingleToast({ data, remove }) {
  const { id, message, color, icon: Icon, duration } = data;
  const [visible, setVisible] = useState(false);
  const [progressKey, setProgressKey] = useState(0);

  useEffect(() => {
    setVisible(true);
    setProgressKey((prev) => prev + 1);

    const timer = setTimeout(() => {
      setVisible(false); // start exit animation

      setTimeout(() => {
        remove(id); // remove after animation
      }, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, remove]);

  const colors = {
    green: "bg-green-500",
    red: "bg-red-500",
    blue: "bg-blue-500",
    amber: "bg-amber-500"
  };

  return (
    <div
      className={`
        transition-all duration-300
        ${visible
          ? "translate-y-0 opacity-100"
          : "-translate-y-6 opacity-0"
        }
      `}
    >
      <div className="bg-white shadow-xl rounded-2xl overflow-hidden min-w-[320px]">
        <div className="p-4 flex items-center gap-3">

          {Icon && <Icon size={22} />}

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

        <div className="h-1 bg-slate-200">
          <div
            key={progressKey}
            className={`h-full ${colors[color] || colors.green} animate-[toastBar_4s_linear_forwards]`}
          />
        </div>
      </div>
    </div>
  );
}

export default function ToastContainer() {
  const { toasts, remove } = useToast();

  return (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3">
      {toasts.map((toast) => (
        <SingleToast key={toast.id} data={toast} remove={remove} />
      ))}

      <style jsx>{`
        @keyframes toastBar {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}