import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { auth } from "../../firebase"; // ajuste selon ton arborescence

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const [password, setPassword] = useState("");
    const [confirmed, setConfirmed] = useState(false);
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const oobCode = searchParams.get("oobCode");

    useEffect(() => {
        if (confirmed) {
            setTimeout(() => {
                navigate("/client-login"); // ← redirection vers la page de login client
            }, 3000);
        }
    }, [confirmed]);

    if (confirmed) {
        return <p>Mot de passe défini avec succès ! Redirection vers la page de connexion client...</p>;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await confirmPasswordReset(auth, oobCode, password);
            setConfirmed(true);
            setTimeout(() => navigate("/client"), 2000);
        } catch (err) {
            setError("Impossible de mettre à jour le mot de passe.");
        }
    };

    if (error) return <p style={{ color: "red" }}>{error}</p>;
    if (confirmed) return <p>Mot de passe défini avec succès ! Redirection...</p>;

    return (
        <form onSubmit={handleSubmit}>
            <h2>Définissez votre mot de passe</h2>
            <p>Compte : <strong>{email}</strong></p>
            <input
                type="password"
                placeholder="Nouveau mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            <button type="submit">Enregistrer</button>
        </form>
    );
}
