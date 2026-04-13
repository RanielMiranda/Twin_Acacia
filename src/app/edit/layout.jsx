"use client";
import AdminTopBar from "@/app/admin/layout/AdminTopBar";
import OwnerTopBar from "@/app/owner/layout/OwnerTopBar";
import { useResort } from "@/components/useclient/ContextEditor";
import { useAccounts } from "@/components/useclient/AccountsClient";

export default function AdminLayout({ children }) {
  const { resort } = useResort();
  const { activeAccount } = useAccounts();
  const primaryColor = resort?.description?.theme?.primaryColor || "#2563eb";

  const role = (activeAccount?.role || "").toLowerCase();
  const isAdmin = role === "admin";

  return (
    <div style={{ "--editor-primary": primaryColor }}>
      {isAdmin ? <AdminTopBar /> : <OwnerTopBar />}
      <div className="pt-2 mt-10">
        <div className="editor-theme">{children}</div>
      </div>
    </div>
  );
}
