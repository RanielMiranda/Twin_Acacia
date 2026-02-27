"use client";

import OwnerTopBar from "@/components/ui/layouts/OwnerTopBar";

export default function AdminLayout({ children }) {
  return (
    <div>
        <OwnerTopBar />
        {children}
    </div>
  );
}
