"use client";
import AdminTopBar from "./layout/AdminTopBar";

export default function AdminLayout({ children }) {
  return (
    <div>
        <AdminTopBar />
        <div className="mt-10">{children}</div>
    </div>
  );
}
