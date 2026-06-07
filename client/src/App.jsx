import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "./utils/AppContext";
import Navbar from "./components/Navbar";
import LandingPage from "./pages/LandingPage";
import SearchResultsPage from "./pages/SearchResultsPage";
import ResourceDetailsPage from "./pages/ResourceDetailsPage";
import AdminDashboard from "./pages/AdminDashboard";
import LoginPage from "./pages/LoginPage";
import MapPage from "./pages/MapPage";

// Protect admin route — redirect to login if not admin
function AdminRoute() {
  const { currentUser } = useApp();
  if (!currentUser) return <Navigate to="/login?role=admin" replace />;
  if (currentUser.role !== "admin") return <Navigate to="/map" replace />;
  return <AdminDashboard />;
}

// Protect map route — redirect to login if not logged in
function MapRoute() {
  const { currentUser } = useApp();
  if (!currentUser) return <Navigate to="/login?role=user" replace />;
  return <MapPage />;
}

function AppRoutes() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/search" element={<SearchResultsPage />} />
          <Route path="/resource/:id" element={<ResourceDetailsPage />} />
          <Route path="/admin" element={<AdminRoute />} />
          <Route path="/map" element={<MapRoute />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="border-t border-slate-100 bg-white py-6 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} CommunityFinder · Free · Open · Always Available
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}
