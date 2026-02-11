// ServicesTable.jsx
import React from "react";

export default function ServicesTable({ services }) {
  if (!services || services.length === 0) return null;

  return (
    <div id="extra-services" className="mt-6">
      <h2 className="text-2xl font-semibold mb-2">Extra Services</h2>

      <div className="grid grid-cols-3 gap-4 bg-gray-50 p-4 rounded flex items-center justify-center">
        {services.map((service, idx) => (
          <React.Fragment key={idx}>
            <div className="font-medium">{service.name}</div>
            <div>{service.description}</div>
            <div className="font-semibold text-blue-600">
              ₱{service.cost?.toLocaleString()}
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
