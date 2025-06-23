import './App.css';
import { useState, useEffect } from 'react';
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
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  if (loading) return <div>Chargement...</div>;

  // Redirection conditionnelle + vérification de montage
  if (isMounted && currentUser && location.pathname === "/login") {
    return <Navigate to={getDashboardPath(role)} replace />; // Notez `replace` ici
  }

  return (
    <Routes>
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/login" element={<Login />} replace />

      <Route
        path="/dashboard"
        element={
          currentUser && role === "admin"
            ? <AdminDashBoard />
            : <Navigate to="/login" replace />
        }
      />
      <Route
        path="/gerant"
        element={
          currentUser && role === "gerant"
            ? <GerantDashBoard />
            : <Navigate to="/login" replace />
        }
      />
      <Route
        path="/chauffeur"
        element={
          currentUser && role === "chauffeur"
            ? <ChauffeurDashBoard />
            : <Navigate to="/login" replace />
        }
      />

      <Route path="/client-login" element={<ClientLogin />} />
      <Route path="/client-dash" element={<ClientDashBoard />} />

      <Route
        path="/admin/zones"
        element={
          currentUser && role === "admin"
            ? <AdminZoneConfig />
            : <Navigate to="/login" replace />
        }
      />

      <Route path="*" element={<Navigate to="/login" />} replace />
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
