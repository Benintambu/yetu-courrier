import { useAuth } from "../../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function ChauffeurDashBoard() {

    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate("/"); // ou vers ta page Login
    };

    return (
        <>
            <h1>Chauffeur ({currentUser.displayName})</h1>
            <button onClick={handleLogout}>Déconnexion</button>
        </>
    )
}