"use client";
import "./globals.css";
import { ResortProvider } from "@/components/useclient/ContextEditor";
import { FilterProvider } from "@/components/useclient/ContextFilter";
import { ToastProvider } from "@/components/ui/toast/ToastProvider";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ResortProvider>
        <FilterProvider>
        <ToastProvider>            
            {children}
        </ToastProvider>            
        </FilterProvider>
        </ResortProvider>
      </body>
    </html>
  );
}
