"use client";
import "./globals.css";
import { ResortProvider } from "@/components/useclient/ContextEditor";
import { FilterProvider } from "@/components/useclient/ContextFilter";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ResortProvider>
          <FilterProvider>
            {children}
          </FilterProvider>
        </ResortProvider>
      </body>
    </html>
  );
}
