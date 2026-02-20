import React, { createContext, useContext, useState } from "react";
import { resorts as allResorts } from "../data/resorts";

const FilterContext = createContext();

export function FilterProvider({ children }) {
  // Global Filter States
  const [price, setPrice] = useState(25000);
  const [selectedTags, setSelectedTags] = useState([]);
  const [guests, setGuests] = useState({ adults: 2, children: 0, rooms: 1 });

  // Filtering Logic for the Main Resort Results Page
  const filteredResorts = allResorts.filter((resort) => {
    // 1. Price Filter (matches resort average price)
    const matchesPrice = resort.price <= price;

    // 2. Tag Filter (checks if resort has all selected tags)
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.every(tag => resort.tags?.includes(tag));

    // 3. Guest Capacity Filter
    const totalNeeded = guests.adults + guests.children;
    const hasFittingRoom = resort.rooms.some(room => room.guests >= totalNeeded);

    return matchesPrice && matchesTags && hasFittingRoom;
  });

  return (
    <FilterContext.Provider value={{
      price, setPrice,
      selectedTags, setSelectedTags,
      guests, setGuests,
      filteredResorts
    }}>
      {children}
    </FilterContext.Provider>
  );
}

export const useFilters = () => useContext(FilterContext);