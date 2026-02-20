import { useState } from "react";
import ContactModal from "../modals/ContactModal";

export default function Footer() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <footer id="about" className="bg-gray-950 text-gray-400">
        <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-medium mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#rooms" className="hover:text-sky-400 transition">Rooms</a></li>
              <li><a href="#facilities" className="hover:text-sky-400 transition">Facilities</a></li>
              <li><a href="#gallery" className="hover:text-sky-400 transition">Gallery</a></li>
              <li><a href="#contact" className="hover:text-sky-400 transition">Contact</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-medium mb-4">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li>📍 Calamba, Philippines</li>
              <li>📞 +63 11 111 1111</li>
              <li>✉️ twinacacia@gmail.com</li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-white font-medium mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-sky-400 transition">Facebook</a>
              <a href="#" className="hover:text-sky-400 transition">Instagram</a>
            </div>
          </div>

          {/* Contact CTA */}
          <div>
            <h2 className="text-white text-lg font-semibold mb-4">
              Contact Us
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              Have questions about availability, amenities, or group bookings?
              Send us a message and we’ll get back to you.
            </p>

            <button
              onClick={() => setOpen(true)}
              className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-3 rounded-lg transition font-medium"
            >
              Send a Message
            </button>
          </div>

        </div>

        {/* Bottom Divider */}
        <div className="border-t border-gray-800 mt-6">
          <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
            <p>© {new Date().getFullYear()} Twin Acacia. All rights reserved.</p>
            <div className="space-x-4 mt-3 md:mt-0">
              <a href="#" className="hover:text-sky-400 transition">Privacy Policy</a>
              <a href="#" className="hover:text-sky-400 transition">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>

      {/* --- MODAL --- */}
      {open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
          <ContactModal
            open={open}
            onClose={() => setOpen(false)}
            panelClass="bg-gray-900 text-white"
            overlayClass="bg-black/70 backdrop-blur-md"
          />

        </div>
      )}
    </>
  );
}
