// src/components/ui/TopBar.jsx
import React from "react";

export default function TopBar() {
  return (
    <div className="w-full bg-white shadow-md fixed top-0 left-0 z-[10000]">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="text-2xl font-bold text-blue-600 cursor-pointer">
          Prototype
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex gap-8 font-medium text-gray-700 absolute-end">
          <a href="#destinations" className="hover:text-blue-600 transition">Destinations</a>
          <a href="#resorts" className="hover:text-blue-600 transition">Resorts</a>
          <a href="#about" className="hover:text-blue-600 transition">About</a>
          <a href="#contact" className="hover:text-blue-600 transition">Contact</a>
        </div>

        {/* Profile / Buttons */}
        <div className="flex items-center gap-4">

        </div>
      </div>
    </div>
  );
}
