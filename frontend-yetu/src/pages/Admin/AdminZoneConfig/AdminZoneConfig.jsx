import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import debounce from "lodash.debounce";
import { searchCity } from "../../../services/geolocation";

export default function AdminZoneConfig() {
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [villes, setVilles] = useState([]);
    const [countryCode, setCountryCode] = useState("cd"); // RDC par défaut
    const [zone, setZone] = useState("B"); // Zone B par défaut

    const countries = [
        { code: "cd", name: "RDC (Congo-Kinshasa)" },
        { code: "cg", name: "Congo (Brazzaville)" },
        { code: "ao", name: "Angola" },
        { code: "rw", name: "Rwanda" },
        { code: "bi", name: "Burundi" },
        { code: "zm", name: "Zambie" }
    ];

    const fetchVilles = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/villes");
            setVilles(res.data);
        } catch (error) {
            console.error("Erreur lors du chargement des villes :", error.message);
        }
    };

    const debouncedSearch = useCallback(
        debounce(async (val) => {
            if (val.length >= 2) {
                try {
                    const results = await searchCity(val, countryCode);
                    setSuggestions(results);
                } catch (err) {
                    console.error("Erreur API Nominatim :", err.message);
                }
            } else {
                setSuggestions([]);
            }
        }, 1000),
        [countryCode]
    );

    const handleInputChange = (e) => {
        const val = e.target.value;
        setQuery(val);
        debouncedSearch(val);
    };

    const handleAddFromSuggestion = async (cityObj) => {
        const nom = cityObj.display_name.split(",")[0];
        const province = cityObj.address.state || "Inconnue";

        try {
            await axios.post("http://localhost:5000/api/villes", {
                nom,
                province,
                zone
            });

            setQuery("");
            setSuggestions([]);
            fetchVilles();
        } catch (error) {
            console.error("Erreur ajout ville :", error.message);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/villes/${id}`);
            fetchVilles();
        } catch (error) {
            console.error("Erreur suppression ville :", error.message);
        }
    };

    useEffect(() => {
        fetchVilles();
    }, []);

    return (
        <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
            <h2>🗺️ Gestion des villes et zones</h2>

            <div style={{ marginBottom: "1rem" }}>
                <label>
                    <strong>Pays :</strong>
                    <select
                        value={countryCode}
                        onChange={e => setCountryCode(e.target.value)}
                        style={{ marginLeft: "0.5rem" }}
                    >
                        {countries.map(c => (
                            <option key={c.code} value={c.code}>{c.name}</option>
                        ))}
                    </select>
                </label>
            </div>

            <div style={{ marginBottom: "1rem" }}>
                <label style={{ marginRight: "1rem" }}><strong>Zone :</strong></label>

                <label style={{ marginRight: "1rem" }}>
                    <input
                        type="radio"
                        name="zone"
                        value="A"
                        checked={zone === "A"}
                        onChange={(e) => setZone(e.target.value)}
                    />
                    Zone A
                </label>

                <label>
                    <input
                        type="radio"
                        name="zone"
                        value="B"
                        checked={zone === "B"}
                        onChange={(e) => setZone(e.target.value)}
                    />
                    Zone B
                </label>
            </div>

            <input
                type="text"
                placeholder="Rechercher une ville..."
                value={query}
                onChange={handleInputChange}
                style={{
                    width: "100%",
                    padding: "0.5rem",
                    marginBottom: "1rem",
                    fontSize: "16px"
                }}
            />

            {suggestions.length > 0 && (
                <ul style={{ background: "#f9f9f9", padding: "1rem", borderRadius: "6px" }}>
                    {suggestions.map(city => (
                        <li key={city.place_id} style={{ marginBottom: "0.5rem" }}>
                            {city.display_name}
                            <button
                                onClick={() => handleAddFromSuggestion(city)}
                                style={{
                                    marginLeft: "1rem",
                                    padding: "0.3rem 0.7rem",
                                    background: "#4CAF50",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer"
                                }}
                            >
                                Ajouter
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            <h3 style={{ marginTop: "2rem" }}>🏙️ Villes enregistrées</h3>
            <ul>
                {villes.map(ville => (
                    <li key={ville.id} style={{ marginBottom: "0.5rem" }}>
                        {ville.nom} ({ville.province}) — Zone {ville.zone}
                        <button
                            onClick={() => handleDelete(ville.id)}
                            style={{
                                marginLeft: "1rem",
                                padding: "0.3rem 0.7rem",
                                background: "#e74c3c",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer"
                            }}
                        >
                            Supprimer
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
