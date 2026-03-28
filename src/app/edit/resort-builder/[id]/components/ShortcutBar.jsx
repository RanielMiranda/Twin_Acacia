"use client";

export default function ShortcutBar() {
  const scrollTo = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="sticky top-0 z-30 mt-2 border-y border-slate-200/70 bg-white/85 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-7xl gap-3 overflow-x-auto px-4 py-3 text-sm font-medium text-slate-600">
        <button
          onClick={() => scrollTo("overview")}
          className="whitespace-nowrap rounded-full border border-transparent px-4 py-2 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-950"
        >
          Overview
        </button>

        <button
          onClick={() => scrollTo("facilities")}
          className="whitespace-nowrap rounded-full border border-transparent px-4 py-2 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-950"
        >
          Facilities
        </button>

        <button
          onClick={() => scrollTo("extra-services")}
          className="whitespace-nowrap rounded-full border border-transparent px-4 py-2 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-950"
        >
          Additional Services
        </button>

        <button
          onClick={() => scrollTo("rooms")}
          className="whitespace-nowrap rounded-full border border-transparent px-4 py-2 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-950"
        >
          Available Rooms
        </button>
      </div>
    </div>
  );
}
