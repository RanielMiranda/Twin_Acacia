"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import AdminTopBar from "@/app/admin/layout/AdminTopBar";
import OwnerTopBar from "@/app/owner/layout/OwnerTopBar";
import { useResort } from "@/components/useclient/ContextEditor";
import { useAccounts } from "@/components/useclient/AccountsClient";

export default function AdminLayout({ children }) {
  const { resort } = useResort();
  const { activeAccount } = useAccounts();
  const pathname = usePathname();
  const primaryColor = resort?.description?.theme?.primaryColor || "#2563eb";

  const role = (activeAccount?.role || "").toLowerCase();
  const isAdmin = role === "admin";
  const pathSegments = (pathname || "")
    .split("/")
    .filter(Boolean);

  const crumbs = pathSegments
    .map((segment, index, parts) => {
      const href = `/${parts.slice(0, index + 1).join("/")}`;
      return { href, segment };
    })
    .filter((crumb, index) => !(crumb.segment === "edit" && index === 0))
    .map((crumb, index, arr) => {
      const prev = arr[index - 1]?.segment;
      const next = arr[index + 1]?.segment;
      let label = crumb.segment.replace(/-/g, " ").replace(/^./, (c) => c.toUpperCase());

      if (crumb.segment === "resort-builder") label = "Resort Builder";
      if (crumb.segment === "bookings") label = "Bookings";
      if (crumb.segment === "booking-details") label = "Booking Details";
      if (crumb.segment === "form") label = "Form";
      if (crumb.segment === "accounts") label = "Account";

      const isNumeric = /^\d+$/.test(crumb.segment);
      if (isNumeric && prev === "bookings") label = "Resort";
      if (isNumeric && prev === "booking-details") label = "Booking";
      if (isNumeric && prev === "accounts") label = "Profile";
      if (isNumeric && next === "booking-details") label = "Resort";

      return { ...crumb, label };
    });

  return (
    <div style={{ "--editor-primary": primaryColor }}>
      {isAdmin ? <AdminTopBar /> : <OwnerTopBar />}
      <div className="max-w-7xl mx-auto px-4 pt-4">
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 flex items-center gap-1 text-xs font-semibold text-slate-500 overflow-x-auto whitespace-nowrap">
          <Link href={isAdmin ? "/admin/dashboard" : "/owner/dashboard"} className="hover:text-blue-600 transition-colors">
            Dashboard
          </Link>
          {crumbs.map((crumb, index) => (
            <div key={`${crumb.href}-${index}`} className="flex items-center gap-1">
              <ChevronRight size={12} className="text-slate-300" />
              <Link
                href={crumb.href}
                className={`transition-colors ${index === crumbs.length - 1 ? "text-slate-900" : "hover:text-blue-600"}`}
              >
                {crumb.label}
              </Link>
            </div>
          ))}
        </div>
      </div>
      <div className="pt-2">
      <div className="editor-theme">{children}</div>
      </div>
    </div>
  );
}
