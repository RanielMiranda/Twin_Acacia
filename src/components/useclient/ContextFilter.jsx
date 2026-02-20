import React, { createContext, useContext, useState } from "react";
import { resorts as allResorts } from "../data/resorts";

const FilterContext = createContext();

export function FilterProvider({ children }) {
  const [price, setPrice] = useState(25000);
  const [selectedTags, setSelectedTags] = useState([]);
  const [guests, setGuests] = useState({ adults: 2, children: 0, rooms: 1 });
  
  // New Global Date States
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const filteredResorts = allResorts.filter((resort) => {
    const matchesPrice = resort.price <= price;
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.every(tag => resort.tags?.includes(tag));
    const totalNeeded = guests.adults + guests.children;
    const hasFittingRoom = resort.rooms.some(room => room.guests >= totalNeeded);

    return matchesPrice && matchesTags && hasFittingRoom;
  });

  return (
    <FilterContext.Provider value={{
      price, setPrice,
      selectedTags, setSelectedTags,
      guests, setGuests,
      startDate, setStartDate, // Pass to consumers
      endDate, setEndDate,     // Pass to consumers
      filteredResorts
    }}>
      {children}
    </FilterContext.Provider>
  );
}

export const useFilters = () => useContext(FilterContext);