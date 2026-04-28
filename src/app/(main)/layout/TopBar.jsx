"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function TopBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const isResortDetail = pathname?.startsWith("/resort/");

  const scrollToResorts = () => {
    if (pathname === "/") {
      const element = document.getElementById("resorts");
      if (element) element.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push("/#resorts");
    }
    setIsMenuOpen(false);
  };

  const scrollToAbout = () => {
    const element = document.getElementById("about");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    } else if (pathname !== "/") {
      router.push("/#about");
    }
    setIsMenuOpen(false);
  };

  return (
    <>
      <div className="fixed left-0 top-0 z-50 w-full border-b border-white/70 bg-white/88 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
          <Link
            href="/"
            className="shrink-0 text-xl font-semibold tracking-tight text-blue-600 md:text-2xl"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: "smooth" });
              setIsMenuOpen(false);
            }}
          >
            Twin Acacia
          </Link>

          {isResortDetail ? (
            <div className="hidden min-w-0 flex-1 items-center justify-end gap-2 lg:flex">
              <button onClick={scrollToResorts} className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950">Resorts</button>
              <button onClick={scrollToAbout} className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950">About</button>
              <Link
                href="/auth/login"
                className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-50"
              >
                Login
              </Link>
            </div>
          ) : (
            <div className="hidden items-center gap-3 md:flex">
              <button onClick={scrollToResorts} className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950">Resorts</button>
              <button onClick={scrollToAbout} className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950">About</button>
              <Link
                href="/auth/login"
                className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-50"
              >
                Login
              </Link>
            </div>
          )}

          <button
            className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 lg:hidden"
            onClick={() => setIsMenuOpen((prev) => !prev)}
          >
            {isMenuOpen ? "Close" : "Menu"}
          </button>
        </div>

        <div className={`overflow-hidden border-t border-slate-100 bg-white transition-all duration-300 lg:hidden ${isMenuOpen ? "max-h-[28rem] py-4" : "max-h-0"}`}>
          <div className="flex flex-col gap-3 px-4">
            <button onClick={scrollToResorts} className="rounded-2xl px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50">Resorts</button>
            <button onClick={scrollToAbout} className="rounded-2xl px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50">About</button>
            <Link
              href="/auth/login"
              onClick={() => setIsMenuOpen(false)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
