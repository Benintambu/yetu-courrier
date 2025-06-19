import { useState } from "react";
import axios from "axios";

export default function VilleSearch({ onSelect }) {
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = async (e) => {
        const val = e.target.value;
        setQuery(val);
        setError("");

        if (val.length >= 2) {
            try {
                setLoading(true);
                const res = await axios.get(`http://localhost:5000/api/villes/search?q=${val}`);
                setSuggestions(res.data || []);
            } catch (err) {
                console.error("Erreur recherche ville :", err.message);
                setError("Erreur lors de la recherche.");
                setSuggestions([]);
            } finally {
                setLoading(false);
            }
        } else {
            setSuggestions([]);
        }
    };

    return (
        <div style={{ marginTop: "1rem" }}>
            <label>Ville assignée (Gérant uniquement) :</label>
            <input
                type="text"
                placeholder="Rechercher une ville..."
                value={query}
                onChange={handleChange}
            />
            {loading && <p>Recherche...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
            <ul style={{ listStyle: "none", padding: 0 }}>
                {suggestions.map(v => (
                    <li key={v.id}>
                        {v.nom} ({v.zone})
                        <button
                            type="button"
                            onClick={() => {
                                onSelect(v);
                                setQuery(v.nom); // Affiche la ville choisie
                                setSuggestions([]);
                            }}
                            style={{ marginLeft: 10 }}
                        >
                            Sélectionner
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
