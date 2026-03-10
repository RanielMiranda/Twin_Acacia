"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { buildRequestedRange, getUnavailableRoomIds } from "@/lib/availability";

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
  "payment_image_url",
  "bank_payment_image_url",
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
  const [destination, setDestination] = useState("");
  const [guests, setGuests] = useState({ adults: 2, children: 0, rooms: 1 });
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [checkInTime, setCheckInTime] = useState("14:00");
  const [checkOutTime, setCheckOutTime] = useState("12:00");
  const [availabilityByResort, setAvailabilityByResort] = useState({});

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
      if (isId) {
        const { data, error } = await supabase
          .from("resorts")
          .select(RESORT_DETAIL_COLUMNS)
          .eq("id", Number(identifier))
          .maybeSingle();
        if (error) throw error;
        return data || null;
      }

      const normalizedName = decodeURIComponent(String(identifier));
      const { data, error } = await supabase
        .from("resorts")
        .select(RESORT_DETAIL_COLUMNS)
        .ilike("name", normalizedName)
        .order("created_at", { ascending: false })
        .limit(1);
      if (error) throw error;
      return data?.[0] || null;
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

  useEffect(() => {
    let cancelled = false;
    const loadAvailability = async () => {
      if (!allResorts?.length) {
        setAvailabilityByResort({});
        return;
      }

      const requestedRange = buildRequestedRange({ startDate, endDate, checkInTime, checkOutTime });
      if (!requestedRange) {
        const fallback = {};
        allResorts.forEach((resort) => {
          const rooms = resort.rooms || [];
          const totalAvailablePax = rooms.reduce((sum, room) => sum + Number(room?.guests || 0), 0);
          fallback[resort.id] = {
            unavailableRoomIds: new Set(),
            availableRoomIds: new Set((rooms || []).map((room) => room?.id?.toString()).filter(Boolean)),
            availableRoomCount: rooms.length,
            totalAvailablePax,
            hasEnoughRooms: rooms.length >= Number(guests.rooms || 1),
            hasEnoughPax: totalAvailablePax >= Number(guests.adults || 0) + Number(guests.children || 0),
            viable: rooms.length >= Number(guests.rooms || 1) && totalAvailablePax >= Number(guests.adults || 0) + Number(guests.children || 0),
          };
        });
        if (!cancelled) setAvailabilityByResort(fallback);
        return;
      }

      const resortIds = allResorts.map((resort) => Number(resort.id)).filter((id) => Number.isFinite(id));
      const { data, error } = await supabase
        .from("bookings")
        .select("resort_id, room_ids, start_date, end_date, check_in_time, check_out_time, status, booking_form")
        .in("resort_id", resortIds);
      if (error) {
        console.error("Availability fetch error:", error.message);
        if (!cancelled) setAvailabilityByResort({});
        return;
      }

      const byResortBookings = {};
      (data || []).forEach((row) => {
        const key = Number(row.resort_id);
        if (!byResortBookings[key]) byResortBookings[key] = [];
        byResortBookings[key].push(row);
      });

      const next = {};
      allResorts.forEach((resort) => {
        const rooms = resort.rooms || [];
        const blockedSet = getUnavailableRoomIds(
          byResortBookings[Number(resort.id)] || [],
          requestedRange,
          (rooms || []).map((room) => room?.id)
        );
        const availableRooms = rooms.filter((room) => !blockedSet.has(room?.id?.toString()));
        const totalAvailablePax = availableRooms.reduce((sum, room) => sum + Number(room?.guests || 0), 0);
        const requestedRooms = Number(guests.rooms || 1);
        const requestedPax = Number(guests.adults || 0) + Number(guests.children || 0);
        const hasEnoughRooms = availableRooms.length >= requestedRooms;
        const hasEnoughPax = totalAvailablePax >= requestedPax;
        next[resort.id] = {
          unavailableRoomIds: blockedSet,
          availableRoomIds: new Set(availableRooms.map((room) => room?.id?.toString()).filter(Boolean)),
          availableRoomCount: availableRooms.length,
          totalAvailablePax,
          hasEnoughRooms,
          hasEnoughPax,
          viable: hasEnoughRooms && hasEnoughPax,
        };
      });
      if (!cancelled) setAvailabilityByResort(next);
    };
    loadAvailability();
    return () => {
      cancelled = true;
    };
  }, [allResorts, checkInTime, checkOutTime, endDate, guests.adults, guests.children, guests.rooms, startDate]);

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
      .sort((a, b) => {
        const buildSearchableMeta = (resort) => [
          ...((resort.tags || []).map((tag) => String(tag).toLowerCase())),
          ...((resort.facilities || [])
            .map((facility) => String(facility?.name || "").toLowerCase())
            .filter(Boolean)),
        ];
        const hasAllTerms = (resort) => {
          if (selectedTags.length === 0) return true;
          const searchableMeta = buildSearchableMeta(resort);
          return selectedTags.every((term) =>
            searchableMeta.some((item) => item.includes(String(term || "").toLowerCase()))
          );
        };

        const aAvailability = availabilityByResort[a.id];
        const bAvailability = availabilityByResort[b.id];
        const aViable = aAvailability?.viable !== false;
        const bViable = bAvailability?.viable !== false;
        if (aViable !== bViable) return aViable ? -1 : 1;

        const aMatchesTerms = hasAllTerms(a);
        const bMatchesTerms = hasAllTerms(b);
        if (aMatchesTerms !== bMatchesTerms) return aMatchesTerms ? -1 : 1;

        const aDist = distanceToRange(Number(a.price || 0));
        const bDist = distanceToRange(Number(b.price || 0));
        if (aDist !== bDist) return aDist - bDist;

        const aMid = Math.abs(Number(a.price || 0) - midpoint);
        const bMid = Math.abs(Number(b.price || 0) - midpoint);
        return aMid - bMid;
      });
  }, [allResorts, availabilityByResort, priceRange, selectedTags]);

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
        destination,
        setDestination,
        guests,
        setGuests,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        checkInTime,
        setCheckInTime,
        checkOutTime,
        setCheckOutTime,
        availabilityByResort,
      }}
    >
      {children}
    </ResortDataContext.Provider>
  );
}

export const useResortData = () => useContext(ResortDataContext);
export const useFilters = () => useContext(ResortDataContext);
