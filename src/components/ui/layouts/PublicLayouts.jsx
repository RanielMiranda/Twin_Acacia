// layouts/PublicLayout.jsx
import TopBar from "../TopBar";
import Footer from "../Footer";
import { Outlet } from "react-router-dom";

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <TopBar />
      <Outlet />
      <Footer />
    </div>
  );
}
