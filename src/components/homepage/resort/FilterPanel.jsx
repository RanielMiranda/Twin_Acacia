"use client";

import React from "react";
import { useFilters } from "../../useclient/ContextFilter"; // Adjust path

export default function FilterPanel() {
  const { price, setPrice, selectedTags, setSelectedTags } = useFilters();

  const handleTagChange = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="w-full lg:w-80 bg-white shadow rounded-2xl p-6 h-fit lg:sticky lg:top-24">
      <h3 className="font-semibold text-lg mb-4">Filters</h3>
      
      {/* PRICE SLIDER */}
      <div className="mb-6">
        <p className="font-medium mb-2">Max Price: ₱{price}</p>
        <input 
          type="range" min="1000" max="50000" step="500"
          value={price} onChange={(e) => setPrice(Number(e.target.value))}
          className="w-full"
        />
      </div>

      {/* TAGS */}
      <div>
        <p className="font-medium mb-2">Amenities</p>
        <div className="flex flex-col gap-2">
          {["Wifi", "Kitchen", "Swimming Pool", "Videoke", "Natural Hot Spring", "Billiard Table"].map(tag => (
            <label key={tag} className="flex items-center gap-2 text-sm">
              <input 
                type="checkbox" 
                checked={selectedTags.includes(tag)}
                onChange={() => handleTagChange(tag)}
              /> {tag}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}