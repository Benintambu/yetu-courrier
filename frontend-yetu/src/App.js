import './App.css';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from "./contexts/AuthContext";
import Login from './pages/Login/Login.jsx';
import AdminDashBoard from './pages/Admin/AdminDashBoard/AdminDashBoard.jsx';
import GerantDashBoard from './pages/Gérant/GerantDashBoard/GerantDashBoard.jsx';
import ChauffeurDashBoard from './pages/Chauffeur/ChauffeurDashBoard/ChauffeurDashBoard.jsx';
import ResetPassword from './pages/Client/ResetPassword.jsx';
import ClientLogin from './pages/Client/ClientLogin/ClientLogin.jsx';
import ClientDashBoard from './pages/Client/ClientDashBoard/ClientDashBoard.jsx';
import AdminZoneConfig from './pages/Admin/AdminZoneConfig/AdminZoneConfig.jsx';

function App() {
  const { currentUser, role, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div>Chargement...</div>;

  // Redirection automatique si déjà connecté
  if (currentUser && location.pathname === "/login") {
    return <Navigate to={getDashboardPath(role)} />;
  }

  return (
    <Routes>
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/login" element={<Login />} />

      <Route
        path="/dashboard"
        element={
          currentUser && role === "admin"
            ? <AdminDashBoard />
            : <Navigate to="/login" />
        }
      />
      <Route
        path="/gerant"
        element={
          currentUser && role === "gerant"
            ? <GerantDashBoard />
            : <Navigate to="/login" />
        }
      />
      <Route
        path="/chauffeur"
        element={
          currentUser && role === "chauffeur"
            ? <ChauffeurDashBoard />
            : <Navigate to="/login" />
        }
      />

      <Route path="/client-login" element={<ClientLogin />} />
      <Route path="/client-dash" element={<ClientDashBoard />} />

      <Route
        path="/admin/zones"
        element={
          currentUser && role === "admin"
            ? <AdminZoneConfig />
            : <Navigate to="/login" />
        }
      />

      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

function getDashboardPath(role) {
  switch (role) {
    case "admin": return "/dashboard";
    case "gerant": return "/gerant";
    case "chauffeur": return "/chauffeur";
    default: return "/login";
  }
}

export default App;
