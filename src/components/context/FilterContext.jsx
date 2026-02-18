import React, { createContext, useContext, useState } from "react";
import { resorts as allResorts } from "../data/resorts";

const FilterContext = createContext();

export function FilterProvider({ children }) {
  const [price, setPrice] = useState(10000);
  const [selectedTags, setSelectedTags] = useState([]);
  const [guests, setGuests] = useState({ adults: 2, children: 0, rooms: 1 });

  // 1. First, filter by hard requirements (Tags and Capacity)
  // We still want to REMOVE resorts that don't fit the people or amenities
  const availableResorts = allResorts.filter((resort) => {
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.every(tag => resort.tags?.includes(tag));

    const totalNeeded = guests.adults + guests.children;
    const hasFittingRoom = resort.rooms.some(room => room.guests >= totalNeeded);

    return matchesTags && hasFittingRoom;
  });

  // 2. Then, SORT by price preference
  const sortedResorts = [...availableResorts].sort((a, b) => {
    const aMatchesPrice = a.price <= price;
    const bMatchesPrice = b.price <= price;

    // Logic: If one matches the price and the other doesn't, 
    // the one that matches comes first.
    if (aMatchesPrice && !bMatchesPrice) return -1;
    if (!aMatchesPrice && bMatchesPrice) return 1;

    // If both are in range (or both are out of range), 
    // sort them by cheapest price first.
    return a.price - b.price;
  });

  return (
    <FilterContext.Provider value={{
      price, setPrice,
      selectedTags, setSelectedTags,
      guests, setGuests,
      filteredResorts: sortedResorts // Provide the sorted list
    }}>
      {children}
    </FilterContext.Provider>
  );
}

export const useFilters = () => useContext(FilterContext);