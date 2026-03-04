"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

const ResortDataContext = createContext(null);
const RESORT_CACHE_KEY = "resorts_cache_v1";
const RESORT_CACHE_TS_KEY = "resorts_cache_v1_ts";
const getStorage = () => (typeof window === "undefined" ? null : window.sessionStorage);
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
  const [allResorts, setAllResorts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingResort, setLoadingResort] = useState(false);
  const [lastFetchedAt, setLastFetchedAt] = useState(null);

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
      const storage = getStorage();
      if (storage) {
        storage.setItem(RESORT_CACHE_KEY, JSON.stringify(next));
        storage.setItem(RESORT_CACHE_TS_KEY, fetchedAt);
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
    const storage = getStorage();
    if (!storage || typeof window === "undefined") return;
    try {
      // Remove legacy persistent cache keys so stale deleted resorts don't survive browser restarts.
      localStorage.removeItem(RESORT_CACHE_KEY);
      localStorage.removeItem(RESORT_CACHE_TS_KEY);
      const raw = storage.getItem(RESORT_CACHE_KEY);
      if (!raw) return;
      setAllResorts(JSON.parse(raw));
      setLastFetchedAt(storage.getItem(RESORT_CACHE_TS_KEY) || null);
    } catch (err) {
      console.error("Resort cache hydrate error:", err.message);
    }
  }, []);

  useEffect(() => {
    hydrateCachedResorts();
    fetchResorts();
  }, [fetchResorts, hydrateCachedResorts]);

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
