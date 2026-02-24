"use client";

import React from "react";
import ResortBuilder from "@/components/adminpage/ResortBuilder/ResortBuilder";

export default function AdminBuilderPage({ params }) {
  const unwrappedParams = React.use(params);
  
  return <ResortBuilder resortId={unwrappedParams.id} />;
}