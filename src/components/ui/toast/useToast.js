"use client";
import { useState } from "react";

let listeners = [];

export function toast(message, color = "green") {
  listeners.forEach((listener) =>
    listener({ message, color })
  );
}

export function useToast() {
  const [toastData, setToastData] = useState(null);

  listeners.push(setToastData);

  const close = () => setToastData(null);

  return { toastData, close };
}