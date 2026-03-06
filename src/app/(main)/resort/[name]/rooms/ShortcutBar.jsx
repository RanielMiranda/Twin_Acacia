"use client";

export default function ShortcutBar() {
  const scrollTo = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="bg-gray-50 shadow-md max-w-full mt-6">
      <div className="max-w-6xl mx-auto px-4 py-3 flex gap-6 text-sm font-medium text-gray-600">
        
        <button
          onClick={() => scrollTo("overview")}
          className="hover:text-blue-600 flex items-center"
        >
          Overview
        </button>

        <button
          onClick={() => scrollTo("facilities")}
          className="hover:text-blue-600 flex items-center"
        >
          Facilities
        </button>

        <button
          onClick={() => scrollTo("extra-services")}
          className="hover:text-blue-600 flex items-center"
        >
          Additional Services
        </button>

        <button
          onClick={() => scrollTo("rooms")}
          className="hover:text-blue-600 flex items-center"
        >
          Available Rooms
        </button>

      </div>
    </div>
  );
}
