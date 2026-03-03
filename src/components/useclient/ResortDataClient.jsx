"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

const ResortDataContext = createContext(null);

export function ResortDataProvider({ children }) {
  const [allResorts, setAllResorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingResort, setLoadingResort] = useState(false);

  const [price, setPrice] = useState(22000);
  const [selectedTags, setSelectedTags] = useState([]);
  const [guests, setGuests] = useState({ adults: 2, children: 0, rooms: 1 });
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const fetchResorts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("resorts")
      .select("*")
      .eq("visible", true)
      .order("created_at", { ascending: false });

    if (error) console.error("Resort fetch error:", error.message);
    else setAllResorts(data || []);
    setLoading(false);
  }, []);

  const fetchResortByIdentifier = useCallback(async (identifier, isId = true) => {
    if (!identifier) return null;
    setLoadingResort(true);
    try {
      const column = isId ? "id" : "name";
      const { data, error } = await supabase
        .from("resorts")
        .select("*")
        .eq(column, identifier)
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.error("Resort detail fetch error:", err.message);
      return null;
    } finally {
      setLoadingResort(false);
    }
  }, []);

  useEffect(() => {
    fetchResorts();
  }, [fetchResorts]);

  const filteredResorts = useMemo(() => {
    return allResorts
      .filter((resort) => resort.visible !== false)
      .filter((resort) => {
        const matchesPrice = resort.price <= price;
        const matchesTags =
          selectedTags.length === 0 ||
          selectedTags.every((tag) => resort.tags?.includes(tag));
        const totalNeeded = guests.adults + guests.children;
        const hasFittingRoom = resort.rooms?.some((room) => room.guests >= totalNeeded);
        return matchesPrice && matchesTags && hasFittingRoom;
      });
  }, [allResorts, guests.adults, guests.children, price, selectedTags]);

  return (
    <ResortDataContext.Provider
      value={{
        allResorts,
        filteredResorts,
        loading,
        loadingResort,
        fetchResorts,
        fetchResortByIdentifier,
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
    </ResortDataContext.Provider>
  );
}

export const useResortData = () => useContext(ResortDataContext);
export const useFilters = () => useContext(ResortDataContext);
