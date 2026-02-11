import React, { useState, useEffect, useRef } from "react";
import { MapPin, Calendar, Users } from "lucide-react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import RangeCalendar from "../../calendar/RangeCalendar";
import { areaSuggestions } from "../../data/constants";

export default function SearchBar() {
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [activeDropdown, setActiveDropdown] = useState(null);
  const containerRef = useRef(null);

  const [guestType, setGuestType] = useState("Solo Traveler");
  const [rooms, setRooms] = useState(1);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);

  function formatFullDate(date) {
    if (!date) return "";
    return date.toLocaleString("default", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  function formatWeekday(date) {
    if (!date) return "";
    return date.toLocaleString("default", { weekday: "long" });
  }

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
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      ref={containerRef}
      className="bg-white rounded-2xl shadow-xl py-3 px-4 flex flex-wrap md:flex-nowrap gap-2 w-full max-w-6xl"
    >
      {/* LOCATION */}
      <div className="relative flex items-center gap-2 border rounded-xl px-3 py-2 flex-1">
        <MapPin size={16} />
        <Input
          placeholder="Select a destination"
          value={destination}
          onFocus={() => setActiveDropdown("destination")}
          onChange={(e) => setDestination(e.target.value)}
          className="border-0 text-sm"
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

      {/* DATE RANGE */}
      <div className="relative flex items-center gap-2 border rounded-xl px-3 py-2 flex-1">
        <Calendar size={16} />

        {/* START DATE */}
        <button
          className="flex-1 text-center whitespace-nowrap"
          onClick={() => setActiveDropdown("start")}
        >
          <div className="text-sm font-medium">
            {startDate ? formatFullDate(startDate) : "Check-in date"}
          </div>
          <div className="text-xs text-gray-400">
            {startDate ? formatWeekday(startDate) : ""}
          </div>
        </button>

        <span className="w-px bg-gray-200 h-8" />

        {/* END DATE */}
        <button
          className="flex-1 text-center whitespace-nowrap"
          onClick={() => setActiveDropdown("end")}
        >
          <div className="text-sm font-medium">
            {endDate ? formatFullDate(endDate) : "Check-out date"}
          </div>
          <div className="text-xs text-gray-400">
            {endDate ? formatWeekday(endDate) : ""}
          </div>
        </button>

        {(activeDropdown === "start" || activeDropdown === "end") && (
          <div className="absolute top-full left-0 mt-2 z-[9999] w-[420px] shadow-lg">
            <RangeCalendar
              startDate={startDate}
              endDate={endDate}
              activeDropdown={activeDropdown}
              onChange={(s, e) => {
                setStartDate(s);
                setEndDate(e);

                if (activeDropdown === "start" && s)
                  setActiveDropdown("end");
              }}
            />
          </div>
        )}
      </div>

{/* GUEST MENU */}
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
              className={`text-left px-3 py-1 rounded hover:bg-blue-100 text-sm ${
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
                  onClick={() => setRooms(Math.max(1, rooms - 1))}
                >
                  -
                </button>
                <span className="w-6 text-center">{rooms}</span>
                <button
                  className="px-2 py-1 bg-gray-100 rounded"
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
                  className="px-2 py-1 bg-gray-100 rounded"
                  onClick={() => setAdults(Math.max(1, adults - 1))}
                >
                  -
                </button>
                <span className="w-6 text-center">{adults}</span>
                <button
                  className="px-2 py-1 bg-gray-100 rounded"
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
                  className="px-2 py-1 bg-gray-100 rounded"
                  onClick={() => setChildren(Math.max(0, children - 1))}
                >
                  -
                </button>
                <span className="w-6 text-center">{children}</span>
                <button
                  className="px-2 py-1 bg-gray-100 rounded"
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
      <Button className="rounded-xl px-6 text-sm">
        Search
      </Button>
    </div>
  );
}
