"use client";

import TopBar from "./layout/TopBar";
import Footer from "./layout/Footer";
import { Analytics } from "@vercel/analytics/react";
import { usePathname } from "next/navigation";

export default function MainLayout({ children }) {
  const pathname = usePathname();
  const isResortDetail = pathname?.startsWith("/resort/");

  return (
    <>
      <TopBar />
      <main className={isResortDetail ? "mt-16" : "mt-10"}>{children}</main>
      <Footer />
      <Analytics />
    </>
  );
}
