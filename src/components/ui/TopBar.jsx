import React, { useState } from "react";
import { Link } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import ContactModal from "./modals/ContactModal";

export default function TopBar() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeAll = () => {
    setIsMenuOpen(false);
    setIsModalOpen(false);
  };

  return (
    <>
      {/* ================= TOP BAR ================= */}
      <div className="w-full bg-white shadow-md fixed top-0 left-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          
          {/* Logo */}
          <Link
            to="/"
            className="text-2xl font-bold text-blue-600 cursor-pointer"
            onClick={(e) => {
              window.scrollTo({ top: 0, behavior: "smooth" });
              setIsMenuOpen(false);
            }}
          >
            🍃 Twin Acacia
          </Link>

          {/* ================= DESKTOP NAV ================= */}
          <div className="hidden md:flex gap-8 font-medium text-gray-700 items-center">
            
            <HashLink
              smooth
              to="/#resorts"
              className="hover:text-blue-600 transition"
            >
              Resorts
            </HashLink>

            <a
              href="#about"
              onClick={(e) => {
                e.preventDefault();
                const element = document.getElementById("about");
                if (element) element.scrollIntoView({ behavior: "smooth" });
              }}
              className="hover:text-blue-600 transition"
            >
              About
            </a>

            <button
              onClick={() => setIsModalOpen(true)}
              className="hover:text-blue-600 transition"
            >
              Contact
            </button>

            <Link
              to="/dashboard"
              className="hover:text-blue-600 transition"
            >
              Admin page
            </Link>
          </div>

          {/* ================= MOBILE MENU BUTTON ================= */}
          <button
            className="md:hidden text-3xl text-gray-700"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* ================= MOBILE DROPDOWN ================= */}
        <div
          className={`md:hidden bg-white shadow-md overflow-hidden transition-all duration-300 ${
            isMenuOpen ? "max-h-96 py-4" : "max-h-0"
          }`}
        >
          <div className="flex flex-col gap-4 px-4 font-medium text-gray-700">
            
            <HashLink
              smooth
              to="/#resorts"
              onClick={() => setIsMenuOpen(false)}
              className="hover:text-blue-600 transition"
            >
              Resorts
            </HashLink>

            <a
              href="#about"
              onClick={(e) => {
                e.preventDefault();
                const element = document.getElementById("about");
                if (element) element.scrollIntoView({ behavior: "smooth" });
                setIsMenuOpen(false);
              }}
              className="hover:text-blue-600 transition"
            >
              About
            </a>

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
              to="/dashboard"
              onClick={() => setIsMenuOpen(false)}
              className="hover:text-blue-600 transition"
            >
              Admin Page
            </Link>
          </div>
        </div>
      </div>

      {/* ================= CONTACT MODAL ================= */}
      <ContactModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <h2 className="text-xl font-bold mb-4">Contact Us</h2>
        <p className="text-gray-600 mb-2">
          Feel free to reach out via email or phone!
        </p>
        <p className="text-gray-600 mb-2">+63 9XX-XXX-XXXX</p>
        <a href="mailto:name@example.com" className="text-blue-600">
          name@example.com
        </a>
      </ContactModal>
    </>
  );
}
