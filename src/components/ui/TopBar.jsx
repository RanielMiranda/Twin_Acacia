import React, { useState } from "react";
import { Link } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import ContactModal from "./modals/ContactModal";

export default function TopBar() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="w-full bg-white shadow-md fixed top-0 left-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-blue-600 cursor-pointer">
            Prototype
          </Link>

          <div className="hidden md:flex gap-8 font-medium text-gray-700">
            {/* Buildings Button (uses HashLink) */}
            <HashLink
              smooth
              to="/#Properties"
              className="hover:text-blue-600 transition"
            >
              Buildings
            </HashLink>

            {/* About scroll */}
            <a
              href="#about"
              onClick={(e) => {
                e.preventDefault();
                const element = document.getElementById("about");
                if (element) element.scrollIntoView({ behavior: "smooth" });
              }}
            >
              About
            </a>

            {/* Contact Modal */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="hover:text-blue-600 transition"
            >
              Contact
            </button>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      <ContactModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2 className="text-xl font-bold mb-4">Contact Us</h2>
        <p className="text-gray-600 mb-2">Feel free to reach out via email or phone!</p>
        <p className="text-gray-600 mb-2">+63 9XX-XXX-XXXX</p>
        <a href="mailto:name@example.com" className="text-blue-600">name@example.com</a>
      </ContactModal>
    </>
  );
}
