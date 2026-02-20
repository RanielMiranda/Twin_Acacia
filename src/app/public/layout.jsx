"use client"; // needed for client-side components

import TopBar from "@/components/ui/layouts/TopBar";
import Footer from "@/components/ui/layouts/Footer";

export default function PublicLayout({ children }) {
  return (
    <div>
        <TopBar />
            {children}
        <Footer />
    </div>
  );
}
