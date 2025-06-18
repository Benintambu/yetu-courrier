// src/App.js
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
  const { currentUser, role } = useAuth();

  return (
    <Routes>
      {/*  Accessible sans être connecté */}
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/login" element={<Login />} />

      {/*  Routes protégées par rôle */}
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

      {/* Toute autre route redirige vers /login */}
      <Route path="*" element={<Navigate to="/login" />} />

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
    </Routes>
  );
}

export default App;
