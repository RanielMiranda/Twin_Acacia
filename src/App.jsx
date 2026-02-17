import { BrowserRouter, Routes, Route } from "react-router-dom";

import PublicLayout from "./components/ui/layouts/PublicLayouts";
import AdminLayout from "./components/ui/layouts/AdminLayout";

import HomePage from "./components/homepage/HomePage";
import ResortDetailPage from "./components/resortpages/ResortDetailPage";
import ResortBuilder from "./components/adminpage/ResortBuilder/ResortBuilder";
import Dashboard from "./components/adminpage/Dashboard/Dashboard";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLIC PAGES */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/resort/:name" element={<ResortDetailPage />} />
        </Route>

        {/* ADMIN PAGES */}
        <Route element={<AdminLayout />}>
          <Route path="/resort-builder" element={<ResortBuilder />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}
