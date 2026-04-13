"use client";
import "./globals.css";
import { ResortDataProvider } from "@/components/useclient/ResortDataClient";
import { ResortProvider } from "@/components/useclient/ContextEditor";
import { BookingsProvider } from "@/components/useclient/BookingsClient";
import { SupportProvider } from "@/components/useclient/SupportClient";
import { AccountsProvider } from "@/components/useclient/AccountsClient";
import { ToastProvider } from "@/components/ui/toast/ToastProvider";

export const metadata = {
  verification: {
    google: "HkXf6t9_jc0ayRXuLVQWGumEq05K6yjHwLMNX-MoCKk",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ResortDataProvider>
          <ResortProvider>
            <BookingsProvider>
              <SupportProvider>
                <AccountsProvider>
                  <ToastProvider>{children}</ToastProvider>
                </AccountsProvider>
              </SupportProvider>
            </BookingsProvider>
          </ResortProvider>
        </ResortDataProvider>
      </body>
    </html>
  );
}
