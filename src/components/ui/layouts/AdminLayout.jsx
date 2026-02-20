// layouts/AdminLayout.jsx
import AdminTopBar from "./AdminTopBar";
import { Outlet } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <AdminTopBar />
      <Outlet />
    </div>
  );
}
