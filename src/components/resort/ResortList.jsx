import React from "react";
import ResortCard from "./ResortCard";
import { resorts } from "../data/resorts";


export default function ResortList() {
return (
<div className="max-w-7xl mx-auto px-4 py-12">
<h2 className="text-3xl font-bold mb-8">Top Resorts</h2>


<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
{resorts.map((resort) => (
<ResortCard key={resort.name} resort={resort} />
))}
</div>
</div>
);
}