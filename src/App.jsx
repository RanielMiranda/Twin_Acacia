import React from "react";
import HeroBanner from "./components/hero/HeroBanner";
import ResortList from "./components/resort/ResortList";


export default function App() {
return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <HeroBanner />
        <ResortList />

        <div className="bg-gray-900 text-gray-400 text-sm text-center py-6">
        © 2026 ResortGo. All rights reserved.
        </div>
    </div>
    );
}