import { useEffect, useState } from "react";
import axios from "axios";

export default function VillePermissions() {
    const [villes, setVilles] = useState([]);

    useEffect(() => {
        fetchVilles();
    }, []);

    const fetchVilles = async () => {
        const res = await axios.get("http://localhost:5000/api/villes");
        setVilles(res.data);
    };

    const togglePermission = async (villeId, currentValue) => {
        await axios.put(`http://localhost:5000/api/villes/${villeId}`, {
            peutCreerExpeditions: !currentValue
        });
        fetchVilles();
    };

    return (
        <div>
            <h2>Gestion des droits des villes</h2>
            <ul>
                {villes.map(v => (
                    <li key={v.id}>
                        {v.nom} — Peut créer expéditions : {v.peutCreerExpeditions ? "✅" : "❌"}
                        <button onClick={() => togglePermission(v.id, v.peutCreerExpeditions)}>
                            {v.peutCreerExpeditions ? "Retirer le droit" : "Accorder le droit"}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
