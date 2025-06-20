import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

export default function CreateExpedition() {
    const { currentUser } = useAuth();
    const [chauffeurQuery, setChauffeurQuery] = useState("");
    const [chauffeurSuggestions, setChauffeurSuggestions] = useState([]);
    const [selectedChauffeur, setSelectedChauffeur] = useState(null);

    const [itineraires, setItineraires] = useState([]);
    const [selectedItineraire, setSelectedItineraire] = useState(null);
    const [colisProposes, setColisProposes] = useState([]);
    const [selectedColisIds, setSelectedColisIds] = useState([]);
    const [chauffeurMessage, setChauffeurMessage] = useState("");

    useEffect(() => {
        axios.get("http://localhost:5000/api/itineraires").then(res => setItineraires(res.data));
    }, []);

    const handleChauffeurSearch = async (e) => {
        const val = e.target.value;
        setChauffeurQuery(val);
        setChauffeurMessage("");  // Reset message
        if (val.length < 2) return setChauffeurSuggestions([]);

        try {
            const res = await axios.get("http://localhost:5000/api/users");
            const results = res.data.filter(user =>
                user.role === "chauffeur" && (
                    user.displayName?.toLowerCase().includes(val.toLowerCase()) ||
                    user.email?.toLowerCase().includes(val.toLowerCase()) ||
                    user.phone?.includes(val)
                )
            );
            setChauffeurSuggestions(results);
        } catch (err) {
            console.error("Erreur de recherche chauffeur:", err);
        }
    };

    const checkChauffeurDisponibilite = async (chauffeur) => {
        try {
            const res = await axios.get("http://localhost:5000/api/expeditions");
            const expActives = res.data.filter(exp =>
                exp.chauffeurUid === chauffeur.uid &&
                (exp.statut === "en attente" || exp.statut === "en cours")
            );

            if (expActives.length > 0) {
                setChauffeurMessage(`⚠️ Ce chauffeur est déjà affecté à une expédition active : ${expActives[0].itineraireNom}`);
            } else {
                setChauffeurMessage("✅ Chauffeur disponible !");
            }

        } catch (err) {
            console.error("Erreur vérif dispo chauffeur:", err);

        }
    };

    const handleItineraireSelect = async (itinId) => {
        const itin = itineraires.find(i => i.id === itinId);
        setSelectedItineraire(itin);
        if (!itin?.villes?.length) return;

        const villeDepart = itin.villes[0].nom;
        const destinations = itin.villes.slice(1).map(v => v.nom);

        const res = await axios.get("http://localhost:5000/api/colis");
        const matches = res.data.filter(c => c.villeDepart?.nom === villeDepart && destinations.includes(c.villeArrivee?.nom));
        setColisProposes(matches);
        setSelectedColisIds(matches.map(c => c.id));
    };

    const handleSubmit = async () => {
        if (!selectedItineraire || !selectedChauffeur) return alert("Tous les champs sont obligatoires");
        try {
            await axios.post("http://localhost:5000/api/expeditions", {
                itineraireId: selectedItineraire.id,
                chauffeurUid: selectedChauffeur.uid,
                createdBy: currentUser.uid
            });
            alert("Expédition créée !");
        } catch (err) {
            if (err.response?.status === 409) {
                alert(err.response.data.error);
            } else {
                alert("Erreur : " + (err.response?.data?.error || err.message));
            }
        }

    };

    return (
        <div>
            <h2>Créer une expédition</h2>

            <input
                placeholder="🔍 Rechercher un chauffeur"
                value={chauffeurQuery}
                onChange={handleChauffeurSearch}
            />
            <ul>
                {chauffeurSuggestions.map(ch => (
                    <li key={ch.uid}>
                        {ch.displayName} – {ch.email}
                        <button onClick={() => {
                            setSelectedChauffeur(ch);
                            setChauffeurQuery(ch.displayName);
                            setChauffeurSuggestions([]);
                            checkChauffeurDisponibilite(ch);
                        }}>Sélectionner</button>
                    </li>
                ))}
            </ul>

            {selectedChauffeur && (
                <p>
                    ✅ Chauffeur sélectionné : <strong>{selectedChauffeur.displayName}</strong><br />
                    {chauffeurMessage && <span>{chauffeurMessage}</span>}
                </p>
            )}

            <select onChange={e => handleItineraireSelect(e.target.value)}>
                <option value="">-- Itinéraire --</option>
                {itineraires.map(it => (
                    <option key={it.id} value={it.id}>{it.nom}</option>
                ))}
            </select>

            <h4>Colis affectés</h4>
            <ul>
                {colisProposes.map(c => (
                    <li key={c.id}>{c.nom} → {c.villeArrivee?.nom}</li>
                ))}
            </ul>

            <button onClick={handleSubmit}>Enregistrer l'expédition</button>
        </div>
    );
}
