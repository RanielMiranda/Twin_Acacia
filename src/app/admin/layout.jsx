"use client";
import AdminTopBar from "@/components/ui/layouts/AdminTopBar";

export default function AdminLayout({ children }) {
  return (
    <div>
        <AdminTopBar />
        {children}
    </div>
  );
}
