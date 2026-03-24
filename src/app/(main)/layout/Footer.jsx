import { useState } from "react";
import ContactModal from "@/components/ui/modals/ContactModal";

export default function Footer() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <footer id="about" className="bg-gray-950 text-gray-400">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 py-8 md:grid-cols-3">
          <div>
            <h3 className="mb-4 font-medium text-white">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li>Calamba, Philippines</li>
              <li>+63 11 111 1111</li>
              <li>twinacacia@gmail.com</li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-medium text-white">Follow Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="transition hover:text-sky-400">Facebook</a>
              <a href="#" className="transition hover:text-sky-400">Instagram</a>
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-lg font-semibold text-white">Contact Us</h2>
            <p className="mb-5 text-sm text-gray-500">
              Have questions about availability, amenities, or group bookings? Send us a
              message and we will get back to you.
            </p>

            <button
              onClick={() => setOpen(true)}
              className="rounded-lg bg-sky-500 px-6 py-3 font-medium text-white transition hover:bg-sky-600"
            >
              Send a Message
            </button>
          </div>
        </div>

        <div className="border-t border-gray-800">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between px-6 py-4 text-xs text-gray-500 md:flex-row">
            <p>(c) {new Date().getFullYear()} Twin Acacia. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <ContactModal
            open={open}
            onClose={() => setOpen(false)}
            panelClass="bg-white text-black"
            overlayClass="bg-black/70 backdrop-blur-sm"
          />
        </div>
      ) : null}
    </>
  );
}
