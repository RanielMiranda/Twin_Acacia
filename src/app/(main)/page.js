import React from "react";
import dynamic from "next/dynamic";

const HeroBanner = dynamic(() => import("./components/hero/HeroBanner"), {
  loading: () => <div className="h-[520px] md:h-[460px] bg-slate-100" />,
});
const ResortSection = dynamic(() => import("./components/resort/ResortSection"), {
  loading: () => (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="h-8 w-40 bg-slate-100 rounded-lg" />
      <div className="mt-6 grid gap-4">
        <div className="h-36 bg-slate-100 rounded-2xl" />
        <div className="h-36 bg-slate-100 rounded-2xl" />
        <div className="h-36 bg-slate-100 rounded-2xl" />
      </div>
    </div>
  ),
});

//Home Page
export default function Page() {
  return (
    <>
    <div className = "bg-slate-50">
      <HeroBanner />
      <div id="resorts">
        <ResortSection />
      </div>
    </div>
    </>
  );
}
