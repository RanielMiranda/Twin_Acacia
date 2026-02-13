import React from "react";
import { Users } from "lucide-react";

export default function GuestField({
  guestType,
  setGuestType,
  rooms,
  setRooms,
  adults,
  setAdults,
  children,
  setChildren,
  activeDropdown,
  setActiveDropdown,
  handleGuestTypeChange
}) {
  return (
    <div className="relative flex items-center gap-2 border rounded-xl px-3 py-2 flex-1">
      <Users size={16} />

      <button
        className="flex-1 flex justify-between items-center text-left"
        onClick={() =>
          setActiveDropdown(activeDropdown === "guests" ? null : "guests")
        }
      >
        <div className="flex flex-col">
          <span className="text-sm font-medium whitespace-nowrap">
            {adults} Adults
            {children > 0 && `, ${children} Child${children > 1 ? "ren" : ""}`}
          </span>
          <span className="text-xs text-gray-500">Room {rooms}</span>
        </div>
        ▼
      </button>

      {activeDropdown === "guests" && (
        <div className="absolute top-full left-0 bg-white shadow-xl rounded-xl mt-2 p-4 z-[9999] w-80">
          {/* Guest Types */}
          <div className="flex flex-col gap-2 mb-4">
            {["Solo Traveler", "Couple", "Family", "Group"].map((type) => (
              <button
                key={type}
                className={`text-left px-3 py-1 rounded hover:bg-blue-100 text-sm ${
                  guestType === type ? "bg-blue-50 font-medium" : ""
                }`}
                onClick={() => handleGuestTypeChange(type)}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Controls */}
          {["Rooms", "Adults", "Children"].map((label) => {
            const value =
              label === "Rooms" ? rooms :
              label === "Adults" ? adults :
              children;

            const setter =
              label === "Rooms" ? setRooms :
              label === "Adults" ? setAdults :
              setChildren;

            const min = label === "Children" ? 0 : 1;

            return (
              <div key={label} className="flex justify-between items-center mb-3 text-sm">
                <span>{label}</span>
                <div className="flex gap-2 items-center">
                  <button
                    className="px-2 py-1 bg-gray-100 rounded"
                    onClick={() => setter(Math.max(min, value - 1))}
                  >
                    -
                  </button>
                  <span className="w-6 text-center">{value}</span>
                  <button
                    className="px-2 py-1 bg-gray-100 rounded"
                    onClick={() => setter(value + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
