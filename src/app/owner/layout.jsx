"use client";

import OwnerTopBar from "./layout/OwnerTopBar";

export default function AdminLayout({ children }) {
  return (
    <div>
        <OwnerTopBar />
        <main className="mt-10">{children}</main>
    </div>
  );
}
