// PropertyList.jsx
import React, { useState } from "react";
import PropertyCard from "./PropertyCard";
import { properties } from "../../data/properties";

export default function PropertyList() {
  const [statusFilter, setStatusFilter] = useState("");
  const [unitTypeFilter, setUnitTypeFilter] = useState("");

  // Filter logic
  const filteredProperties = properties.filter((p) => {
    const matchesStatus = statusFilter ? p.status === statusFilter : true;
    const matchesUnitType = unitTypeFilter
      ? p.buildings.some((b) => b.units.some((u) => u.type === unitTypeFilter))
      : true;
    return matchesStatus && matchesUnitType;
  });

  return (
    <div className="w-full lg:w-4/6 mx-auto px-4 py-12">
      <h2 className="text-3xl font-bold mb-8">Properties</h2>

      <div className="flex gap-8">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow rounded-2xl p-6 h-fit sticky top-24">
          <h3 className="font-semibold text-lg mb-4">Filters</h3>

          <div className="mb-6">
            <p className="font-medium mb-2">Status</p>
            <div className="flex flex-col gap-2 text-sm">
              <label>
                <input
                  type="radio"
                  name="status"
                  value="Completed"
                  onChange={(e) => setStatusFilter(e.target.value)}
                />{" "}
                Completed
              </label>
              <label>
                <input
                  type="radio"
                  name="status"
                  value="Ongoing"
                  onChange={(e) => setStatusFilter(e.target.value)}
                />{" "}
                Ongoing
              </label>
              <label>
                <input
                  type="radio"
                  name="status"
                  value=""
                  onChange={() => setStatusFilter("")}
                />{" "}
                All
              </label>
            </div>
          </div>

          <div className="mb-6">
            <p className="font-medium mb-2">Unit Type</p>
            <div className="flex flex-col gap-2 text-sm">
              <label>
                <input
                  type="radio"
                  name="unitType"
                  value="Office"
                  onChange={(e) => setUnitTypeFilter(e.target.value)}
                />{" "}
                Office
              </label>
              <label>
                <input
                  type="radio"
                  name="unitType"
                  value="Commercial"
                  onChange={(e) => setUnitTypeFilter(e.target.value)}
                />{" "}
                Commercial
              </label>
              <label>
                <input
                  type="radio"
                  name="unitType"
                  value="Retail"
                  onChange={(e) => setUnitTypeFilter(e.target.value)}
                />{" "}
                Retail
              </label>
              <label>
                <input
                  type="radio"
                  name="unitType"
                  value=""
                  onChange={() => setUnitTypeFilter("")}
                />{" "}
                All
              </label>
            </div>
          </div>
        </div>

        {/* Property Cards */}
        <div className="flex-1 flex flex-col gap-6">
          {filteredProperties.map((property) => (
            <PropertyCard key={property.name} property={property} />
          ))}
        </div>
      </div>
    </div>
  );
}
