import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminItineraireConfig() {
    const [nom, setNom] = useState("");
    const [villesDisponibles, setVillesDisponibles] = useState([]);
    const [villesChoisies, setVillesChoisies] = useState([]);
    const [itineraireList, setItineraireList] = useState([]);
    const [villeQuery, setVilleQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);

    useEffect(() => {
        fetchVilles();
        fetchItineraires();
    }, []);

    const fetchVilles = async () => {
        const res = await axios.get("http://localhost:5000/api/villes");
        setVillesDisponibles(res.data);
    };

    const fetchItineraires = async () => {
        const res = await axios.get("http://localhost:5000/api/itineraires");
        setItineraireList(res.data);
    };

    const handleSearchVille = (query) => {
        setVilleQuery(query);
        if (query.length >= 2) {
            const filtered = villesDisponibles.filter(v =>
                v.nom.toLowerCase().includes(query.toLowerCase())
            );
            setSuggestions(filtered);
        } else {
            setSuggestions([]);
        }
    };

    const handleAddVille = (ville) => {
        if (!villesChoisies.find(v => v.id === ville.id)) {
            setVillesChoisies([...villesChoisies, ville]);
        }
        setVilleQuery("");
        setSuggestions([]);
    };

    const handleAddItineraire = async () => {
        if (!nom || villesChoisies.length === 0) {
            alert("Veuillez saisir un nom et au moins une ville");
            return;
        }

        try {
            await axios.post("http://localhost:5000/api/itineraires", {
                nom,
                villes: villesChoisies
            });
            alert("Itinéraire ajouté !");
            setNom("");
            setVillesChoisies([]);
            fetchItineraires();
        } catch (err) {
            alert("Erreur : " + err.message);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Supprimer cet itinéraire ?")) {
            await axios.delete(`http://localhost:5000/api/itineraires/${id}`);
            fetchItineraires();
        }
    };

    return (
        <div style={{ padding: "2rem" }}>
            <h2>🛣 Configuration des itinéraires</h2>

            <input
                placeholder="Nom de l’itinéraire (ex: Matadi → Kinshasa)"
                value={nom}
                onChange={e => setNom(e.target.value)}
            />

            <h4>Ajouter des villes (dans l’ordre du trajet)</h4>

            <input
                placeholder="Rechercher une ville"
                value={villeQuery}
                onChange={e => handleSearchVille(e.target.value)}
            />
            <ul>
                {suggestions.map(v => (
                    <li key={v.id}>
                        {v.nom} ({v.zone})
                        <button type="button" onClick={() => handleAddVille(v)}>➕ Ajouter</button>
                    </li>
                ))}
            </ul>

            <h5>Villes sélectionnées :</h5>
            <ol>
                {villesChoisies.map(v => (
                    <li key={v.id}>
                        {v.nom} ({v.zone})
                        <button onClick={() =>
                            setVillesChoisies(villesChoisies.filter(vc => vc.id !== v.id))
                        }>❌</button>
                    </li>
                ))}
            </ol>

            <button onClick={handleAddItineraire}>✅ Ajouter l’itinéraire</button>

            <hr />
            <h3>📜 Itinéraires enregistrés</h3>
            <ul>
                {itineraireList.map(i => (
                    <li key={i.id}>
                        <strong>{i.nom}</strong> : {i.villes.map(v => v.nom).join(" → ")}
                        <button onClick={() => handleDelete(i.id)} style={{ marginLeft: 10 }}>🗑 Supprimer</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
