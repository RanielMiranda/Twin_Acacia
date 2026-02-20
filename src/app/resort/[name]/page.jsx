"use client";

import ResortDetailPage from "@/components/resortpages/ResortDetailPage";

export default function ResortPage({ params }) {
  const { name } = params; // Next.js gives dynamic route params
  return <ResortDetailPage name={name} />;
}
