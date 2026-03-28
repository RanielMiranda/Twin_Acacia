import { useState } from "react";
import ContactModal from "@/components/ui/modals/ContactModal";

export default function Footer() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <footer id="about" className="border-t border-slate-200 bg-[linear-gradient(180deg,#eff6ff_0%,#f8fafc_100%)] text-slate-500">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-6 py-10 md:grid-cols-3">
          <div>
            <h3 className="mb-4 text-lg font-semibold text-slate-950">Twin Acacia</h3>
            <p className="max-w-xs text-sm leading-6 text-slate-600">
              Resort browsing, availability checks, and inquiry flow designed to feel clean and ready for launch.
            </p>
          </div>

          <div>
            <h3 className="mb-4 font-medium text-slate-950">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li>Calamba, Philippines</li>
              <li>+63 11 111 1111</li>
              <li>twinacacia@gmail.com</li>
            </ul>
          </div>

          <div>
            <h2 className="mb-4 text-lg font-semibold text-slate-950">Contact Us</h2>
            <p className="mb-5 text-sm text-slate-500">
              Have questions about availability, amenities, or group bookings? Send us a message and we will get back to you.
            </p>

            <button
              onClick={() => setOpen(true)}
              className="rounded-xl bg-sky-600 px-6 py-3 font-medium text-white transition hover:-translate-y-0.5 hover:bg-sky-700"
            >
              Send a Message
            </button>
          </div>
        </div>

        <div className="border-t border-slate-200">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between px-6 py-4 text-xs text-slate-500 md:flex-row">
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
