import { useAuth } from "../../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import CreateClient from "../CreateClient";
import ClientList from "../ClientList";
import CreateColis from "../CreateColis";
import ColisList from "../ColisList";

export default function GerantDashBoard() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const handleLogout = async () => {
        await logout();
        navigate("/"); // ou vers ta page Login
    };

    return (
        <>
            <h1>Gérant</h1>
            <button onClick={handleLogout}>Déconnexion</button>
            <CreateClient />
            <ClientList />
            <CreateColis />
            <ColisList />

        </>

    )
}