"use client";

import { createContext, useContext, useState } from "react";

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const enqueue = ({ message, color = "green", icon = null, duration = 4000, persistent = false }) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    setToasts((prev) => [...prev, { id, message, color, icon, duration, persistent }]);
  };

  const toast = (payload) => enqueue({ ...payload, persistent: false });
  const persistentToast = (payload) => enqueue({ ...payload, persistent: true, duration: null });

  const remove = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast, persistentToast, toasts, remove }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
