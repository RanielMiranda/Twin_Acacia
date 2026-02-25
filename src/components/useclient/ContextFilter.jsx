"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const FilterContext = createContext();

export function FilterProvider({ children }) {
  const [allResorts, setAllResorts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [price, setPrice] = useState(22000);
  const [selectedTags, setSelectedTags] = useState([]);
  const [guests, setGuests] = useState({ adults: 2, children: 0, rooms: 1 });
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // 🔹 Fetch all resorts on mount
  useEffect(() => {
    const fetchResorts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("resorts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) console.error("Filter fetch error:", error.message);
      else setAllResorts(data || []);
      setLoading(false);
    };

    fetchResorts();
  }, []);

  // 🔹 Derived State: Filter logic
  const filteredResorts = allResorts
    .filter((resort) => resort.visible !== false) // <-- only visible resorts
    .filter((resort) => {

    const matchesPrice = resort.price <= price;
    
    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.every((tag) => resort.tags?.includes(tag));

    const totalNeeded = guests.adults + guests.children;
    // Check if any room in the resort array can accommodate the guest count
    const hasFittingRoom = resort.rooms?.some(
      (room) => room.guests >= totalNeeded
    );

    return matchesPrice && matchesTags && hasFittingRoom;
  });

  return (
    <FilterContext.Provider
      value={{
        allResorts,
        filteredResorts,
        loading,
        price,
        setPrice,
        selectedTags,
        setSelectedTags,
        guests,
        setGuests,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
}

export const useFilters = () => useContext(FilterContext);