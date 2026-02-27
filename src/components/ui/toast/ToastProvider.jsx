"use client";

import { createContext, useContext, useState } from "react";

const ToastContext = createContext();

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

    const toast = ({ message, color = "green", icon = null, duration = 4000 }) => {

    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    setToasts((prev) => [...prev, { id, message, color, icon, duration }]);
    };

  const remove = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast, toasts, remove }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}