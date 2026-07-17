import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CreateHuddle from "./pages/CreateHuddle";
import HuddleDetail from "./pages/HuddleDetail";
import InviteJoin from "./pages/InviteJoin";
import NotFound from "./pages/NotFound";

export default function App() {
  const location = useLocation();
  const hideNavbar = location.pathname === "/";

  return (
    <div className="min-h-screen bg-ink text-paper">
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/invite/:code" element={<InviteJoin />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create"
          element={
            <ProtectedRoute>
              <CreateHuddle />
            </ProtectedRoute>
          }
        />
        <Route path="/h/:id" element={<HuddleDetail />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}
