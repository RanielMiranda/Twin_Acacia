"use client";
import TopBar from "@/components/ui/layouts/TopBar";
import Footer from "@/components/ui/layouts/Footer";

export default function MainLayout({ children }) {
  return (
    <>
      <TopBar />
      <main>{children}</main>
      <Footer />
    </>
  );
}