"use client";
import "./globals.css";
import TopBar from "@/components/ui/layouts/TopBar";
import Footer from "@/components/ui/layouts/Footer";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <TopBar/>
            {children}
        <Footer />
      </body>
    </html>
  );
}

