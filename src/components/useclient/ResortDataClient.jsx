"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { buildRequestedRange, getUnavailableRoomIds } from "@/lib/availability";

const ResortDataContext = createContext(null);
const RESORT_CACHE_KEY = "resorts_cache_v1";
const RESORT_CACHE_TS_KEY = "resorts_cache_v1_ts";
const getStorage = () => (typeof window === "undefined" ? null : window.sessionStorage);
const DEFAULT_PRICE_RANGE = { min: 10000, max: 30000 };
const DEFAULT_GUESTS = { adults: 2, children: 0, rooms: 1 };
const DEFAULT_CHECKIN_TIME = "12:00";
const DEFAULT_CHECKOUT_TIME = "17:00";
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
  "rulesAndRegulations",
  "termsAndConditions",
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
  "gcash_account_name",
  "gcash_account_number",
  "bank_name",
  "bank_account_name",
  "bank_account_number",
  "contactEmail",
  "contactPhone",
  "contactMedia",
  "rulesAndRegulations",
  "termsAndConditions",
  "description",
  "extraServices",
].join(", ");

export function ResortDataProvider({ children }) {
  const [allResorts, setAllResorts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingResort, setLoadingResort] = useState(false);
  const [lastFetchedAt, setLastFetchedAt] = useState(null);

  const [priceRange, setPriceRange] = useState(DEFAULT_PRICE_RANGE);
  const [selectedTags, setSelectedTags] = useState([]);
  const [destination, setDestination] = useState("");
  const [guests, setGuests] = useState(DEFAULT_GUESTS);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [checkInTime, setCheckInTime] = useState(DEFAULT_CHECKIN_TIME);
  const [checkOutTime, setCheckOutTime] = useState(DEFAULT_CHECKOUT_TIME);
  const [availabilityByResort, setAvailabilityByResort] = useState({});
  const [appliedPriceRange, setAppliedPriceRange] = useState(DEFAULT_PRICE_RANGE);
  const [appliedSelectedTags, setAppliedSelectedTags] = useState([]);
  const [appliedDestination, setAppliedDestination] = useState("");
  const [appliedGuests, setAppliedGuests] = useState(DEFAULT_GUESTS);
  const [appliedStartDate, setAppliedStartDate] = useState(null);
  const [appliedEndDate, setAppliedEndDate] = useState(null);
  const [appliedCheckInTime, setAppliedCheckInTime] = useState(DEFAULT_CHECKIN_TIME);
  const [appliedCheckOutTime, setAppliedCheckOutTime] = useState(DEFAULT_CHECKOUT_TIME);

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

      const requestedRange = buildRequestedRange({
        startDate: appliedStartDate,
        endDate: appliedEndDate,
        checkInTime: appliedCheckInTime,
        checkOutTime: appliedCheckOutTime,
      });
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
            hasEnoughRooms: rooms.length >= Number(appliedGuests.rooms || 1),
            hasEnoughPax: totalAvailablePax >= Number(appliedGuests.adults || 0) + Number(appliedGuests.children || 0),
            viable:
              rooms.length >= Number(appliedGuests.rooms || 1) &&
              totalAvailablePax >= Number(appliedGuests.adults || 0) + Number(appliedGuests.children || 0),
          };
        });
        if (!cancelled) setAvailabilityByResort(fallback);
        return;
      }

      const resortIds = allResorts.map((resort) => Number(resort.id)).filter((id) => Number.isFinite(id));
      let query = supabase
        .from("bookings")
        .select("resort_id, room_ids, start_date, end_date, check_in_time, check_out_time, status")
        .in("resort_id", resortIds)
        .lte("start_date", requestedRange.endDate)
        .or(`end_date.gte.${requestedRange.startDate},end_date.is.null`);

      const { data, error } = await query;
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
        const requestedRooms = Number(appliedGuests.rooms || 1);
        const requestedPax = Number(appliedGuests.adults || 0) + Number(appliedGuests.children || 0);
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
          requestedPax,
        };
      });
      if (!cancelled) setAvailabilityByResort(next);
    };
    loadAvailability();
    return () => {
      cancelled = true;
    };
  }, [
    allResorts,
    appliedCheckInTime,
    appliedCheckOutTime,
    appliedEndDate,
    appliedGuests.adults,
    appliedGuests.children,
    appliedGuests.rooms,
    appliedStartDate,
  ]);

  const filteredResorts = useMemo(() => {
    const { min, max } = appliedPriceRange;
    const safeMin = Math.min(min, max);
    const safeMax = Math.max(min, max);
    const midpoint = (safeMin + safeMax) / 2;
    const normalizedDestination = appliedDestination.trim().toLowerCase();
    const requestedPax = Number(appliedGuests.adults || 0) + Number(appliedGuests.children || 0);

    const distanceToRange = (price) => {
      if (price < safeMin) return safeMin - price;
      if (price > safeMax) return price - safeMax;
      return 0;
    };
    const matchesDestination = (resort) => {
      if (!normalizedDestination) return true;
      const name = String(resort?.name || "").toLowerCase();
      const location = String(resort?.location || "").toLowerCase();
      return name.includes(normalizedDestination) || location.includes(normalizedDestination);
    };
    const destinationScore = (resort) => {
      if (!normalizedDestination) return 0;
      const name = String(resort?.name || "").toLowerCase();
      const location = String(resort?.location || "").toLowerCase();
      if (location === normalizedDestination || name === normalizedDestination) return 3;
      if (location.startsWith(normalizedDestination) || name.startsWith(normalizedDestination)) return 2;
      if (location.includes(normalizedDestination) || name.includes(normalizedDestination)) return 1;
      return 0;
    };
    const buildSearchableMeta = (resort) => [
      ...((resort.tags || []).map((tag) => String(tag).toLowerCase())),
      ...((resort.facilities || [])
        .map((facility) => String(facility?.name || "").toLowerCase())
        .filter(Boolean)),
    ];
    const hasAllTerms = (resort) => {
      if (appliedSelectedTags.length === 0) return true;
      const searchableMeta = buildSearchableMeta(resort);
      return appliedSelectedTags.every((term) =>
        searchableMeta.some((item) => item.includes(String(term || "").toLowerCase()))
      );
    };
    const tagScore = (resort) => {
      if (appliedSelectedTags.length === 0) return 0;
      const searchableMeta = buildSearchableMeta(resort);
      return appliedSelectedTags.reduce((sum, term) => {
        const normalizedTerm = String(term || "").toLowerCase();
        return sum + (searchableMeta.some((item) => item.includes(normalizedTerm)) ? 1 : 0);
      }, 0);
    };

    return [...allResorts]
      .filter((resort) => resort.visible !== false)
      .filter((resort) => matchesDestination(resort))
      .sort((a, b) => {
        const aDestinationScore = destinationScore(a);
        const bDestinationScore = destinationScore(b);
        if (aDestinationScore !== bDestinationScore) return bDestinationScore - aDestinationScore;

        const aTagScore = tagScore(a);
        const bTagScore = tagScore(b);
        if (aTagScore !== bTagScore) return bTagScore - aTagScore;

        const aAvailability = availabilityByResort[a.id];
        const bAvailability = availabilityByResort[b.id];
        const aViable = aAvailability?.viable !== false;
        const bViable = bAvailability?.viable !== false;
        if (aViable !== bViable) return aViable ? -1 : 1;

        const aDist = distanceToRange(Number(a.price || 0));
        const bDist = distanceToRange(Number(b.price || 0));
        if (aDist !== bDist) return aDist - bDist;

        const aMid = Math.abs(Number(a.price || 0) - midpoint);
        const bMid = Math.abs(Number(b.price || 0) - midpoint);
        return aMid - bMid;
      });
  }, [allResorts, availabilityByResort, appliedPriceRange, appliedSelectedTags, appliedDestination]);

  const applyFilters = useCallback(
    (overrides = {}) => {
      const nextPriceRange = overrides.priceRange ?? priceRange;
      const nextSelectedTags = overrides.selectedTags ?? selectedTags;
      const nextDestination = overrides.destination ?? destination;
      const nextGuests = overrides.guests ?? guests;
      const nextStartDate = overrides.startDate ?? startDate;
      const nextEndDate = overrides.endDate ?? endDate;
      const nextCheckInTime = overrides.checkInTime ?? checkInTime;
      const nextCheckOutTime = overrides.checkOutTime ?? checkOutTime;

      if (overrides.priceRange) setPriceRange(overrides.priceRange);
      if (overrides.selectedTags) setSelectedTags(overrides.selectedTags);
      if (overrides.destination !== undefined) setDestination(overrides.destination);
      if (overrides.guests) setGuests(overrides.guests);
      if (overrides.startDate !== undefined) setStartDate(overrides.startDate);
      if (overrides.endDate !== undefined) setEndDate(overrides.endDate);
      if (overrides.checkInTime) setCheckInTime(overrides.checkInTime);
      if (overrides.checkOutTime) setCheckOutTime(overrides.checkOutTime);

      setAppliedPriceRange(nextPriceRange);
      setAppliedSelectedTags(nextSelectedTags);
      setAppliedDestination(nextDestination);
      setAppliedGuests(nextGuests);
      setAppliedStartDate(nextStartDate);
      setAppliedEndDate(nextEndDate);
      setAppliedCheckInTime(nextCheckInTime);
      setAppliedCheckOutTime(nextCheckOutTime);
    },
    [priceRange, selectedTags, destination, guests, startDate, endDate, checkInTime, checkOutTime]
  );

  const clearFilters = useCallback(() => {
    setPriceRange(DEFAULT_PRICE_RANGE);
    setSelectedTags([]);
    setDestination("");
    setGuests(DEFAULT_GUESTS);
    setStartDate(null);
    setEndDate(null);
    setCheckInTime(DEFAULT_CHECKIN_TIME);
    setCheckOutTime(DEFAULT_CHECKOUT_TIME);
    setAppliedPriceRange(DEFAULT_PRICE_RANGE);
    setAppliedSelectedTags([]);
    setAppliedDestination("");
    setAppliedGuests(DEFAULT_GUESTS);
    setAppliedStartDate(null);
    setAppliedEndDate(null);
    setAppliedCheckInTime(DEFAULT_CHECKIN_TIME);
    setAppliedCheckOutTime(DEFAULT_CHECKOUT_TIME);
  }, []);

  const hasActiveFilters = useMemo(() => {
    const priceActive =
      appliedPriceRange.min !== DEFAULT_PRICE_RANGE.min ||
      appliedPriceRange.max !== DEFAULT_PRICE_RANGE.max;
    const tagsActive = appliedSelectedTags.length > 0;
    const destinationActive = appliedDestination.trim() !== "";
    const guestsActive =
      appliedGuests.adults !== DEFAULT_GUESTS.adults ||
      appliedGuests.children !== DEFAULT_GUESTS.children ||
      appliedGuests.rooms !== DEFAULT_GUESTS.rooms;
    const datesActive = !!appliedStartDate || !!appliedEndDate;
    const timeActive =
      appliedCheckInTime !== DEFAULT_CHECKIN_TIME || appliedCheckOutTime !== DEFAULT_CHECKOUT_TIME;
    return priceActive || tagsActive || destinationActive || guestsActive || datesActive || timeActive;
  }, [
    appliedPriceRange,
    appliedSelectedTags,
    appliedDestination,
    appliedGuests,
    appliedStartDate,
    appliedEndDate,
    appliedCheckInTime,
    appliedCheckOutTime,
  ]);

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
        applyFilters,
        clearFilters,
        hasActiveFilters,
      }}
    >
      {children}
    </ResortDataContext.Provider>
  );
}

export const useResortData = () => useContext(ResortDataContext);
export const useFilters = () => useContext(ResortDataContext);
