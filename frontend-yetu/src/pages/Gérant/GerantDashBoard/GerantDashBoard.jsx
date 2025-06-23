import { useAuth } from "../../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import CreateClient from "../CreateClient";
import ClientList from "../ClientList";
import CreateColis from "../CreateColis";
import ColisList from "../ColisList";
import CreateExpedition from "../../../components/CreateExpedition";
import ExpeditionList from "../../../components/ExpeditionList";


export default function GerantDashBoard() {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const handleLogout = async () => {
        await logout();
        await logout();
        setTimeout(() => navigate("/"), 0); // ou vers ta page Login
    };

    return (
        <>
            <h1>Gérant ({currentUser.displayName})</h1>
            <button onClick={handleLogout}>Déconnexion</button>
            <CreateClient />
            <ClientList />
            <CreateColis />
            <ColisList />
            <CreateExpedition />
            <ExpeditionList />

        </>

    )
}