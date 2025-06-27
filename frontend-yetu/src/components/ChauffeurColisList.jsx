import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";

export default function ChauffeurColisList() {
    const { currentUser } = useAuth();
    const [colis, setColis] = useState([]);

    useEffect(() => {
        if (!currentUser?.uid) return;

        axios.get(`http://localhost:5000/api/chauffeurs/${currentUser.uid}/colis`)
            .then(res => setColis(res.data))
            .catch(err => console.error("Erreur chargement colis chauffeur:", err));
    }, [currentUser]);

    return (
        <div style={{ padding: "2rem" }}>
            <h2>📦 Colis affectés à votre expédition</h2>
            {colis.length === 0 ? (
                <p>Aucun colis en cours.</p>
            ) : (
                <ul>
                    {colis.map(c => (
                        <li key={c.id}>
                            <strong>{c.nom}</strong> – {c.villeDepart?.nom} → {c.villeArrivee?.nom}
                            <br />Poids : {c.poids} kg – Contenu : {c.contenu}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
