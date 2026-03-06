"use client";

import { useParams } from "next/navigation";
import ResortBuilder from "@/app/edit/resort-builder/[id]/ResortBuilder";

export default function AdminBuilderPage() {
  const params = useParams();
  return <ResortBuilder resortId={params?.id} />;
}
