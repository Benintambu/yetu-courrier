import './App.css';
import { Route, Routes, Navigate } from 'react-router-dom';
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
  const { currentUser, role, loading, logout } = useAuth();

  if (loading) {
    return <div>Chargement...</div>; // On bloque tant que Firebase n'a pas rendu son verdict
  }

  if (currentUser && role === null) {
    console.warn("Utilisateur connecté sans rôle, déconnexion forcée.");
    logout?.();
    return <div>Déconnexion en cours...</div>;
  }

  return (
    <Routes>
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route
        path="/login"
        element={!currentUser ? <Login /> : <Navigate to={getDashboardPath(role)} replace />}
      />
      <Route
        path="/dashboard"
        element={currentUser && role === "admin" ? <AdminDashBoard /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/gerant"
        element={currentUser && role === "gerant" ? <GerantDashBoard /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/chauffeur"
        element={currentUser && role === "chauffeur" ? <ChauffeurDashBoard /> : <Navigate to="/login" replace />}
      />
      <Route path="/client-login" element={<ClientLogin />} />
      <Route path="/client-dash" element={<ClientDashBoard />} />
      <Route
        path="/admin/zones"
        element={currentUser && role === "admin" ? <AdminZoneConfig /> : <Navigate to="/login" replace />}
      />
      <Route
        path="*"
        element={
          currentUser
            ? <Navigate to={getDashboardPath(role)} replace />
            : <Navigate to="/login" replace />
        }
      />
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
