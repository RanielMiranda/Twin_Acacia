import { BrowserRouter, Routes, Route } from "react-router-dom";
import HeroBanner from "./components/homepage/hero/HeroBanner";
import ResortList from "./components/homepage/property/PropertyList";
import ResortDetailPage from "./components/propertypages/PropertyDetailPage";
import TopBar from "./components/ui/TopBar";

function HomePage() {
  return (
    <>
      <HeroBanner />
      <ResortList />
    </>
  );

}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <TopBar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/property/:name" element={<ResortDetailPage />} />
        </Routes>

        <div id = "about" className="bg-gray-900 text-gray-400 text-sm text-center py-6">
          © 2026 Prototype Website
        </div>

      </div>
    </BrowserRouter>
  );
}
