"use client";
import AdminTopBar from "@/app/admin/layout/AdminTopBar";
import { useResort } from "@/components/useclient/ContextEditor";

export default function AdminLayout({ children }) {
  const { resort } = useResort();
  const primaryColor = resort?.description?.theme?.primaryColor || "#2563eb";
  return (
    <div style={{ "--editor-primary": primaryColor }}>
      <AdminTopBar />
      <div className="editor-theme">{children}</div>
    </div>
  );
}
