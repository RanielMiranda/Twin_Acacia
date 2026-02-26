import React from "react";
import { Search } from "lucide-react";

export default function SearchBar({ searchTerm, setSearchTerm }) {
  return (
    <div className="relative flex-1 items-center flex justify-center">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400 h-5 w-5" />
      <input
        type="text"
        placeholder="Search by name or location..."
        className="w-full h-[56px] pl-12 pr-4 rounded-xl border-none shadow-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white transition-all"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  );
}