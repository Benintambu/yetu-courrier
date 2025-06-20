import { useState, useEffect } from "react";
import axios from "axios";

export default function ExpeditionList() {
    const [expeditions, setExpeditions] = useState([]);
    const [chauffeurQueries, setChauffeurQueries] = useState({});
    const [chauffeurSuggestions, setChauffeurSuggestions] = useState({});
    const [colisQueries, setColisQueries] = useState({});
    const [colisSuggestions, setColisSuggestions] = useState({});

    useEffect(() => {
        fetchExpeditions();
    }, []);

    const fetchExpeditions = async () => {
        const res = await axios.get("http://localhost:5000/api/expeditions");
        setExpeditions(res.data);
    };

    const handleChangeStatut = async (expId, statut) => {
        await axios.put(`http://localhost:5000/api/expeditions/${expId}/statut`, { statut });
        fetchExpeditions();
    };

    const handleRemoveColis = async (expId, colisId) => {
        await axios.delete(`http://localhost:5000/api/expeditions/${expId}/colis/${colisId}`);
        fetchExpeditions();
    };

    const handleChauffeurSearch = async (expId, query) => {
        setChauffeurQueries(prev => ({ ...prev, [expId]: query }));
        if (query.length < 2) return setChauffeurSuggestions(prev => ({ ...prev, [expId]: [] }));

        const res = await axios.get("http://localhost:5000/api/users");
        const list = res.data.filter(c =>
            c.role === "chauffeur" &&
            (c.displayName.toLowerCase().includes(query.toLowerCase()) ||
                c.email.toLowerCase().includes(query.toLowerCase()) ||
                c.phone.includes(query))
        );
        setChauffeurSuggestions(prev => ({ ...prev, [expId]: list }));
    };

    const handleChangeChauffeur = async (expId, chauffeurUid) => {
        if (!chauffeurUid) {
            alert("Sélection invalide : aucun chauffeur choisi");
            return;
        }
        try {
            await axios.put(`http://localhost:5000/api/expeditions/${expId}/chauffeur`, { newChauffeurUid: chauffeurUid });
            alert("Chauffeur réaffecté !");
            fetchExpeditions();
        } catch (err) {
            alert(err.response?.data?.error || err.message);
        }
    };


    const handleColisSearch = async (expId, query) => {
        setColisQueries(prev => ({ ...prev, [expId]: query }));
        if (query.length < 2) return setColisSuggestions(prev => ({ ...prev, [expId]: [] }));

        const res = await axios.get("http://localhost:5000/api/colis");
        const filtered = res.data.filter(c =>
            c.nom.toLowerCase().includes(query.toLowerCase())
        );
        setColisSuggestions(prev => ({ ...prev, [expId]: filtered }));
    };

    const handleAddColis = async (expId, colisId) => {
        try {
            await axios.put(`http://localhost:5000/api/expeditions/${expId}/add-colis`, { colisId });
            fetchExpeditions();
        } catch (err) {
            alert(err.response?.data?.error || err.message);
        }
    };

    const handleDeleteExpedition = async (expId) => {
        if (!window.confirm("Supprimer cette expédition ?")) return;
        await axios.delete(`http://localhost:5000/api/expeditions/${expId}`);
        fetchExpeditions();
    };

    return (
        <div style={{ padding: "2rem" }}>
            <h2>📦 Liste des expéditions</h2>
            {expeditions.map(exp => (
                <div key={exp.id} style={{ border: "1px solid #ccc", padding: "1rem", marginBottom: "1rem" }}>
                    <h3>{exp.itineraireNom}</h3>
                    <p><strong>Départ :</strong> {exp.villeDepart?.nom}</p>
                    <p><strong>Arrivée :</strong> {exp.villeArrivee?.nom}</p>
                    <p><strong>Chauffeur :</strong> {exp.chauffeurUid}</p>
                    <p><strong>Statut :</strong> {exp.statut}</p>

                    <div>
                        <label>Changer statut :</label>
                        <select value={exp.statut} onChange={e => handleChangeStatut(exp.id, e.target.value)}>
                            <option value="créée">Créée</option>
                            <option value="en cours">En cours</option>
                            <option value="terminée">Terminée</option>
                        </select>
                    </div>

                    <div>
                        <label>Changer chauffeur :</label>
                        <input
                            value={chauffeurQueries[exp.id] || ""}
                            onChange={e => handleChauffeurSearch(exp.id, e.target.value)}
                            placeholder="Rechercher un chauffeur"
                        />
                        <ul>
                            {(chauffeurSuggestions[exp.id] || []).map(c => (
                                <li key={c.uid}>
                                    {c.displayName} – {c.email}
                                    <button onClick={() => handleChangeChauffeur(exp.id, c.uid)}>Affecter</button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4>Colis :</h4>
                        <ul>
                            {exp.colis.map(c => (
                                <li key={c.id}>
                                    {c.nom} → {c.villeArrivee?.nom}
                                    <button onClick={() => handleRemoveColis(exp.id, c.id)}>Supprimer</button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <label>Ajouter un colis :</label>
                        <input
                            value={colisQueries[exp.id] || ""}
                            onChange={e => handleColisSearch(exp.id, e.target.value)}
                            placeholder="Rechercher un colis"
                        />
                        <ul>
                            {(colisSuggestions[exp.id] || []).map(c => (
                                <li key={c.id}>
                                    {c.nom}
                                    <button onClick={() => handleAddColis(exp.id, c.id)}>Ajouter</button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <button style={{ color: "red" }} onClick={() => handleDeleteExpedition(exp.id)}>🗑 Supprimer l'expédition</button>
                </div>
            ))}
        </div>
    );
}
