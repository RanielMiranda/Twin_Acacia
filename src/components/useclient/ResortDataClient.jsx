"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

const ResortDataContext = createContext(null);
const RESORT_CACHE_KEY = "resorts_cache_v1";
const RESORT_CACHE_TS_KEY = "resorts_cache_v1_ts";
const RESORT_LIST_COLUMNS = [
  "id",
  "name",
  "location",
  "visible",
  "price",
  "description",
  "tags",
  "rooms",
  "facilities",
  "gallery",
  "profileImage",
  "contactEmail",
  "contactPhone",
].join(", ");
const RESORT_DETAIL_COLUMNS = [
  "id",
  "name",
  "location",
  "visible",
  "price",
  "tags",
  "rooms",
  "facilities",
  "gallery",
  "profileImage",
  "contactEmail",
  "contactPhone",
  "contactMedia",
  "description",
  "extraServices",
].join(", ");

export function ResortDataProvider({ children }) {
  const [allResorts, setAllResorts] = useState(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(RESORT_CACHE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(false);
  const [loadingResort, setLoadingResort] = useState(false);
  const [lastFetchedAt, setLastFetchedAt] = useState(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(RESORT_CACHE_TS_KEY) || null;
  });

  const [priceRange, setPriceRange] = useState({ min: 10000, max: 30000 });
  const [selectedTags, setSelectedTags] = useState([]);
  const [guests, setGuests] = useState({ adults: 2, children: 0, rooms: 1 });
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const fetchResorts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("resorts")
      .select(RESORT_LIST_COLUMNS)
      .eq("visible", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Resort fetch error:", error.message);
    } else {
      const next = data || [];
      setAllResorts(next);
      const fetchedAt = new Date().toISOString();
      setLastFetchedAt(fetchedAt);
      if (typeof window !== "undefined") {
        localStorage.setItem(RESORT_CACHE_KEY, JSON.stringify(next));
        localStorage.setItem(RESORT_CACHE_TS_KEY, fetchedAt);
      }
    }
    setLoading(false);
  }, []);

  const fetchResortByIdentifier = useCallback(async (identifier, isId = true) => {
    if (!identifier) return null;
    setLoadingResort(true);
    try {
      const column = isId ? "id" : "name";
      const { data, error } = await supabase
        .from("resorts")
        .select(RESORT_DETAIL_COLUMNS)
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

  const hydrateCachedResorts = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(RESORT_CACHE_KEY);
      if (!raw) return;
      setAllResorts(JSON.parse(raw));
      setLastFetchedAt(localStorage.getItem(RESORT_CACHE_TS_KEY) || null);
    } catch (err) {
      console.error("Resort cache hydrate error:", err.message);
    }
  }, []);

  const filteredResorts = useMemo(() => {
    const { min, max } = priceRange;
    const safeMin = Math.min(min, max);
    const safeMax = Math.max(min, max);
    const midpoint = (safeMin + safeMax) / 2;

    const distanceToRange = (price) => {
      if (price < safeMin) return safeMin - price;
      if (price > safeMax) return price - safeMax;
      return 0;
    };

    return [...allResorts]
      .filter((resort) => resort.visible !== false)
      .filter((resort) => {
        const matchesTags =
          selectedTags.length === 0 ||
          selectedTags.every((tag) => resort.tags?.includes(tag));
        const totalNeeded = guests.adults + guests.children;
        const hasFittingRoom = resort.rooms?.some((room) => room.guests >= totalNeeded);
        return matchesTags && hasFittingRoom;
      })
      .sort((a, b) => {
        const aDist = distanceToRange(Number(a.price || 0));
        const bDist = distanceToRange(Number(b.price || 0));
        if (aDist !== bDist) return aDist - bDist;

        const aMid = Math.abs(Number(a.price || 0) - midpoint);
        const bMid = Math.abs(Number(b.price || 0) - midpoint);
        return aMid - bMid;
      });
  }, [allResorts, guests.adults, guests.children, priceRange, selectedTags]);

  return (
    <ResortDataContext.Provider
      value={{
        allResorts,
        filteredResorts,
        loading,
        loadingResort,
        lastFetchedAt,
        fetchResorts,
        hydrateCachedResorts,
        fetchResortByIdentifier,
        priceRange,
        setPriceRange,
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
