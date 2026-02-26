"use client";

import React from "react"; //
import ResortDetailPage from "@/components/resortpages/ResortDetailPage";

export default function Page({ params }) {
  const unwrappedParams = React.use(params); 
  
  return <ResortDetailPage name={unwrappedParams.name} />;
}