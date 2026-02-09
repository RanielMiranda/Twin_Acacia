import React, { useState } from "react";
import { MapPin, Calendar, Users } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import RangeCalendar from "../calendar/RangeCalendar";
import { areaSuggestions } from "../data/constants";

export default function SearchBar() {
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // Track which dropdown is open
  const [activeDropdown, setActiveDropdown] = useState(null); // "destination" | "calendar" | "guests" | null

  const [guestType, setGuestType] = useState("Solo Traveler");
  const [rooms, setRooms] = useState(1);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);

  function formatDateFull(date) {
    if (!date) return "--";
    return date.toLocaleDateString("en-US", {
      month: "long", // January, February...
      day: "numeric", // 1, 2, 3...
      year: "numeric", // 2026
    });
  }

  function formatDateWeekday(date) {
    if (!date) return "--";
    return date.toLocaleDateString("en-US", { weekday: "long" }); // Monday, Tuesday...
  }

  function formatDateMonth(date) {
    if (!date) return "--";
    return date.toLocaleDateString("en-US", { month: "long" }); // January, February
  }

  // Handle guest type change
  function handleGuestTypeChange(type) {
    setGuestType(type);

    if (type === "Solo Traveler") {
      setAdults(1);
      setChildren(0);
      setRooms(1);
    } else if (type === "Couple") {
      setAdults(2);
      setChildren(0);
      setRooms(1);
    }
    // Family / Group can modify manually
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-4 flex flex-wrap md:flex-nowrap gap-3 w-full max-w-6xl">

      {/* LOCATION */}
      <div className="relative flex items-center gap-2 border rounded-xl px-3 py-3 flex-1">
        <MapPin size={18} />
        <Input
          placeholder="Select a destination"
          value={destination}
          onFocus={() => setActiveDropdown("destination")}
          onChange={(e) => setDestination(e.target.value)}
          className="border-0"
        />
        {activeDropdown === "destination" && (
          <div className="absolute top-full left-0 right-0 bg-white shadow rounded-xl mt-2 z-[9999]">
            {areaSuggestions.map((a) => (
              <div
                key={a}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  setDestination(a);
                  setActiveDropdown(null);
                }}
              >
                {a}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DATE RANGE (ONE BUTTON LOOKING LIKE TWO) */}
      <div className="relative flex items-center gap-2 border rounded-xl px-3 py-3 flex-1">
        <Calendar size={18} />

        <button
          className="flex w-full overflow-hidden text-left"
          onClick={() =>
            setActiveDropdown(activeDropdown === "calendar" ? null : "calendar")
          }
        >
          <span
            className={`flex-1 px-4 py-3 text-center ${
              startDate ? "bg-white text-gray-900" : "bg-white-100 text-gray-500"
            }`}
          >
            {startDate ? startDate.toLocaleDateString() : "Check-In"}
          </span>
            
          <span className="w-px bg-gray-300" />

          <span
            className={`flex-1 px-4 py-3 text-center ${
              endDate ? "bg-white text-gray-900" : "bg-white-100 text-gray-500"
            }`}
          >
            {endDate ? endDate.toLocaleDateString() : "Check-out"}
          </span>
        </button>

        {activeDropdown === "calendar" && (
          <div className="absolute top-full left-0 mt-2 z-[9999] w-[400px] shadow-lg ">
            <RangeCalendar
              startDate={startDate}
              endDate={endDate}
              onChange={(s, e) => {
                setStartDate(s);
                setEndDate(e);
              }}
            />
          </div>
        )}
      </div>

      {/* GUEST MENU */}
      <div className="relative flex items-center gap-2 border rounded-xl px-3 py-3 flex-1">
        <Users size={18} />
        <button
          className="flex-1 flex justify-between items-center text-left"
          onClick={() =>
            setActiveDropdown(activeDropdown === "guests" ? null : "guests")
          }
        >
          {/* LEFT HALF: Text */}
          <div className="flex flex-col">
            <span className="font-medium">
              {adults} Adults
              {children > 1
                ? `, ${children} Children`
                : children === 1
                ? `, ${children} Child`
                : ``}
            </span>
            <span className="text-gray-500 text-sm">Room {rooms}</span>
          </div>

          {/* RIGHT HALF: Icon */}
          <div className="flex items-center justify-center">
            <span className="ml-2 text-gray-500">▼</span>
          </div>
        </button>
            

        {activeDropdown === "guests" && (
        <div className={`absolute top-full left-0 bg-white shadow rounded-br-xl rounded-bl-xl mt-2 p-4 z-[9999]
          ${guestType === "Solo Traveler" || guestType === "Couple" ? "w-64" : "w-96"} transition-all duration-300 ease-in-out`}>
        <div
      className={`grid gap-4 ${
        guestType === "Family" || guestType === "Group" ? "grid-cols-2" : "grid-cols-1"
      }`}
    >
      {/* LEFT COLUMN: Guest Types */}
      <div className="flex flex-col gap-2">
        {["Solo Traveler", "Couple", "Family", "Group"].map((type) => (
          <button
            key={type}
            className={`text-left px-4 py-2 rounded hover:bg-gray-100 ${
              guestType === type ? "bg-white-200 font-medium" : ""
            }`}
            onClick={() => handleGuestTypeChange(type)}
          >
            {type}
          </button>
        ))}
      </div>

      {/* RIGHT COLUMN: Inputs */}
      {(guestType === "Family" || guestType === "Group") && (
        <div className="flex flex-col gap-3">
          {/* Rooms */}
          <div className="flex justify-between items-center">
            <span>Rooms</span>
            <div className="flex items-center gap-2">
              <button
                className="px-2 py-1 bg-white-200 rounded"
                onClick={() => setRooms(Math.max(1, rooms - 1))}
              >
                -
              </button>
              <span className="w-8 text-center">{rooms}</span>
              <button
                className="px-2 py-1 bg-white-200 rounded"
                onClick={() => setRooms(rooms + 1)}
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
                className="px-2 py-1 bg-white-200 rounded"
                onClick={() => setAdults(Math.max(1, adults - 1))}
              >
                -
              </button>
              <span className="w-8 text-center">{adults}</span>
              <button
                className="px-2 py-1 bg-white-200 rounded"
                onClick={() => setAdults(adults + 1)}
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
                className="px-2 py-1 bg-white-200 rounded"
                onClick={() => setChildren(Math.max(0, children - 1))}
              >
                -
              </button>
              <span className="w-8 text-center">{children}</span>
              <button
                className="px-2 py-1 bg-white-200 rounded"
                onClick={() => setChildren(children + 1)}
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


      {/* SEARCH BUTTON */}
      <Button className="rounded-xl px-10 text-lg">Search</Button>
    </div>
  );
}
