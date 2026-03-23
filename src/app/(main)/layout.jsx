"use client";

import TopBar from "./layout/TopBar";
import Footer from "./layout/Footer";
import { Analytics } from "@vercel/analytics/react";

export default function MainLayout({ children }) {
  return (
    <>
      <TopBar />
      <main className="mt-10">{children}</main>
      <Footer />
      <Analytics />
    </>
  );
}
