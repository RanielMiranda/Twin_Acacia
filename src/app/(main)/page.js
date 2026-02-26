import React from "react";
import HeroBanner from "./components/hero/HeroBanner";
import ResortSection from "./components/resort/ResortSection"

//Home Page
export default function Page() {
  return (
    <>
      <HeroBanner />
      <div id="resorts">
        <ResortSection />
      </div>
    </>
  );
}
