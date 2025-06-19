import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";

export default function ColisList() {
    const { currentUser } = useAuth();
    const [colis, setColis] = useState([]);

    useEffect(() => {
        const fetchColis = async () => {
            if (!currentUser?.uid) return;
            try {
                const res = await axios.get(`http://localhost:5000/api/colis/user/${currentUser.uid}`);
                setColis(res.data);
            } catch (err) {
                console.error("Erreur de récupération des colis :", err);
                alert("Impossible de charger les colis : " + (err.response?.data?.error || err.message));
            }
        };


        fetchColis();
    }, [currentUser]);

    return (
        <div style={{ padding: "2rem" }}>
            <h2>📦 Liste de mes colis</h2>

            {colis.length === 0 && <p>Aucun colis enregistré.</p>}

            <ul style={{ listStyle: "none", padding: 0 }}>
                {colis.map(c => (
                    <li key={c.id} style={{ border: "1px solid #ccc", marginBottom: "1rem", padding: "1rem" }}>
                        <h3>{c.nom}</h3>
                        <p><strong>Poids :</strong> {c.poids} kg</p>
                        <p><strong>Dimensions :</strong> {c.dimensions?.longueur} cm x {c.dimensions?.largeur} cm</p>
                        <p><strong>Contenu :</strong> {c.contenu}</p>
                        <p><strong>Prix :</strong> {c.prix} CDF</p>
                        <p><strong>📍 Départ :</strong> {c.villeDepart?.nom} ({c.villeDepart?.zone})</p>
                        <p><strong>🎯 Destination :</strong> {c.villeArrivee?.nom} ({c.villeArrivee?.zone})</p>
                        <p><strong>🧍 Expéditeur (client) :</strong> {c.client?.displayName} – {c.client?.email} – {c.client?.phone}</p>
                        <p><strong>🧍 Destinataire :</strong> {c.destinataire?.nom} – {c.destinataire?.email} – {c.destinataire?.phone}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
}
