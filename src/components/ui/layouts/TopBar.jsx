"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import ContactModal from "../modals/ContactModal";

export default function TopBar() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  const scrollToResorts = () => {
    if (pathname === "/") {
      const element = document.getElementById("resorts");
      if (element) element.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push("/#resorts");
    }
    setIsMenuOpen(false);
  };

  return (
    <>
      <div className="w-full bg-white shadow-md fixed top-0 left-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          
          {/* Logo */}
          <Link
            href="/"
            className="text-2xl font-bold text-blue-600"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: "smooth" });
              setIsMenuOpen(false);
            }}
          >
            🍃 Twin Acacia
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex gap-8 font-medium text-gray-700 items-center">
            <button
              onClick={scrollToResorts}
              className="hover:text-blue-600 transition"
            >
              Resorts
            </button>

            <button
              onClick={() => {
                const element = document.getElementById("about");
                if (element) element.scrollIntoView({ behavior: "smooth" });
              }}
              className="hover:text-blue-600 transition"
            >
              About
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="hover:text-blue-600 transition"
            >
              Contact
            </button>
            
            <div className="w-[1px] h-6 bg-slate-200 mx-2" />

            <Link href="/auth/login" className="hover:text-blue-600 transition">
              Admin Page
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-3xl text-gray-700"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden bg-white shadow-md overflow-hidden transition-all duration-300 ${
            isMenuOpen ? "max-h-96 py-4" : "max-h-0"
          }`}
        >
          <div className="flex flex-col gap-4 px-4 font-medium text-gray-700">
            <button
              onClick={scrollToResorts}
              className="text-left hover:text-blue-600 transition"
            >
              Resorts
            </button>

            <button
              onClick={() => {
                const element = document.getElementById("about");
                if (element) element.scrollIntoView({ behavior: "smooth" });
                setIsMenuOpen(false);
              }}
              className="text-left hover:text-blue-600 transition"
            >
              About
            </button>

            <button
              onClick={() => {
                setIsModalOpen(true);
                setIsMenuOpen(false);
              }}
              className="text-left hover:text-blue-600 transition"
            >
              Contact
            </button>

            <Link
              href="/auth/login"
              onClick={() => setIsMenuOpen(false)}
              className="hover:text-blue-600 transition"
            >
              Admin Page
            </Link>
          </div>
        </div>
      </div>

      <ContactModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        panelClass="bg-white text-black"
        overlayClass="bg-black/70 backdrop-blur-sm"
      />
    </>
  );
}