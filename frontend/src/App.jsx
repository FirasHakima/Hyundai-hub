import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import VerifyEmail from "./pages/VerifyEmail";
import Dashboard from "./pages/client/Dashboard";
import Book from "./pages/client/Book";
import Appointments from "./pages/client/Appointments";
import Profile from "./pages/client/Profile";
import AdminDashboard from "./pages/admin/Dashboard";
import Agencies from "./pages/admin/Agencies";
import Users from "./pages/admin/Users";
import AdminAppointments from "./pages/admin/Appointments";
import AdminVehicles from "./pages/admin/Vehicles";
import AgentAppointments from "./pages/agent/Appointments";

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
      <div className="text-gray-400 text-sm">Chargement...</div>
    </div>
  );
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return <Layout>{children}</Layout>;
};

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/" element={
        <PrivateRoute>
          {user?.role === "ADMIN" ? <AdminDashboard /> :
           user?.role === "AGENT" ? <AgentAppointments /> :
           <Dashboard />}
        </PrivateRoute>
      } />
      <Route path="/book"          element={<PrivateRoute roles={["USER"]}><Book /></PrivateRoute>} />
      <Route path="/appointments"  element={<PrivateRoute roles={["USER"]}><Appointments /></PrivateRoute>} />
      <Route path="/profile"       element={<PrivateRoute roles={["USER"]}><Profile /></PrivateRoute>} />
      <Route path="/agencies"      element={<PrivateRoute roles={["ADMIN"]}><Agencies /></PrivateRoute>} />
      <Route path="/users"         element={<PrivateRoute roles={["ADMIN"]}><Users /></PrivateRoute>} />
      <Route path="/appointments"  element={<PrivateRoute roles={["ADMIN"]}><AdminAppointments /></PrivateRoute>} />
      <Route path="/vehicles"      element={<PrivateRoute roles={["ADMIN"]}><AdminVehicles /></PrivateRoute>} />
      <Route path="/schedule"      element={<PrivateRoute roles={["AGENT"]}><AgentAppointments /></PrivateRoute>} />
      <Route path="*"              element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
