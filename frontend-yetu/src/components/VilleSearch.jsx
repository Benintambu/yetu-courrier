import { useState } from "react";
import axios from "axios";

export default function VilleSearch({ onSelect }) {
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);

    const handleChange = async (e) => {
        const val = e.target.value;
        setQuery(val);

        if (val.length >= 2) {
            const res = await axios.get(`http://localhost:5000/api/villes/search?q=${val}`);
            setSuggestions(res.data);
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
            <ul>
                {suggestions.map(v => (
                    <li key={v.id}>
                        {v.nom} ({v.zone})
                        <button onClick={() => {
                            onSelect(v);
                            setQuery(v.nom); // pour afficher dans le champ
                            setSuggestions([]);
                        }}>Sélectionner</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
