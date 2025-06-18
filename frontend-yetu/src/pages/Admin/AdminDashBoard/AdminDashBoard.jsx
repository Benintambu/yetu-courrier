import React from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import AdminCreateUser from "../../AdminCreateUser";
import UserList from "../../UserList";

export default function AdminDashBoard() {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate("/"); // ou vers ta page Login
    };

    return (
        <div>
            <h2>Bienvenue, {currentUser.displayName}</h2>
            <button onClick={handleLogout}>Se déconnecter</button>
            <AdminCreateUser />
            <UserList />
        </div>
    );
}