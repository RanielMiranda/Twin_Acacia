import React from "react";
import { Users } from "lucide-react";
import { useFilters } from "../../../useclient/ContextFilter"; // Ensure this path is correct

export default function GuestField({
  activeDropdown,
  setActiveDropdown,
  guestType,
  setGuestType,
  handleGuestTypeChange
}) {
  // Pull guest state and setter from global context
  const { guests, setGuests } = useFilters();

  // Helper to update specific fields in the guests object
  const updateGuests = (field, value) => {
    setGuests((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="relative flex items-center gap-2 border-gray-200 border rounded-xl px-3 py-2 flex-1">
      <Users size={16} />

      <button
        className="flex-1 flex justify-between items-center text-left"
        onClick={() =>
          setActiveDropdown(activeDropdown === "guests" ? null : "guests")
        }
      >
        <div className="flex flex-col">
          <span className="text-sm font-medium whitespace-nowrap">
            {guests.adults} Adults
            {guests.children > 0 && `, ${guests.children} Child${guests.children > 1 ? "ren" : ""}`}
          </span>
          <span className="text-xs text-gray-500">Room {guests.rooms}</span>
        </div>
        <span className="text-gray-500 text-sm">▼</span>
      </button>

      {activeDropdown === "guests" && (
        <div
          className={`absolute top-full left-0 bg-white shadow-xl rounded-xl mt-2 p-4 z-[9999]
          ${
            guestType === "Family" || guestType === "Group"
              ? "w-96"
              : "w-64"
          } transition-all duration-300`}
        >
          <div
            className={`grid gap-4 ${
              guestType === "Family" || guestType === "Group"
                ? "grid-cols-2"
                : "grid-cols-1"
            }`}
          >
            {/* Guest Types */}
            <div className="flex flex-col gap-2">
              {["Solo Traveler", "Couple", "Family", "Group"].map((type) => (
                <button
                  key={type}
                  className={`text-left relative p-2 rounded-md hover:bg-blue-100 text-sm ${
                    guestType === type ? "bg-blue-50 font-medium" : ""
                  }`}
                  onClick={() => handleGuestTypeChange(type)}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Family / Group Controls */}
            {(guestType === "Family" || guestType === "Group") && (
              <div className="flex flex-col gap-3 text-sm">
                {/* Rooms */}
                <div className="flex justify-between items-center">
                  <span>Rooms</span>
                  <div className="flex items-center gap-2">
                    <button
                      className="px-2 py-1 bg-gray-100 rounded"
                      onClick={() => updateGuests("rooms", Math.max(1, guests.rooms - 1))}
                    >
                      -
                    </button>
                    <span className="w-6 text-center">{guests.rooms}</span>
                    <button
                      className="px-2 py-1 bg-gray-100 rounded"
                      onClick={() => updateGuests("rooms", guests.rooms + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Adults */}
                <div className="flex justify-between items-center">
                  <span>Adults</span>
                  <div className="flex items-center gap-2">
                    <button
                      className="px-2 py-1 bg-gray-100 rounded"
                      onClick={() => updateGuests("adults", Math.max(1, guests.adults - 1))}
                    >
                      -
                    </button>
                    <span className="w-6 text-center">{guests.adults}</span>
                    <button
                      className="px-2 py-1 bg-gray-100 rounded"
                      onClick={() => updateGuests("adults", guests.adults + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Children */}
                <div className="flex justify-between items-center">
                  <span>Children</span>
                  <div className="flex items-center gap-2">
                    <button
                      className="px-2 py-1 bg-gray-100 rounded"
                      onClick={() => updateGuests("children", Math.max(0, guests.children - 1))}
                    >
                      -
                    </button>
                    <span className="w-6 text-center">{guests.children}</span>
                    <button
                      className="px-2 py-1 bg-gray-100 rounded"
                      onClick={() => updateGuests("children", guests.children + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}