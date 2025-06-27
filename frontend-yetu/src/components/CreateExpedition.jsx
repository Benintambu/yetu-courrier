import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

export default function CreateExpedition() {
    const { currentUser } = useAuth();
    const [chauffeurQuery, setChauffeurQuery] = useState("");
    const [chauffeurSuggestions, setChauffeurSuggestions] = useState([]);
    const [selectedChauffeur, setSelectedChauffeur] = useState(null);
    const [filteredItineraires, setFilteredItineraires] = useState([]);
    const [selectedItineraire, setSelectedItineraire] = useState(null);
    const [colisProposes, setColisProposes] = useState([]);
    const [colisAffectes, setColisAffectes] = useState([]);
    const [expCreatedId, setExpCreatedId] = useState(null);
    const [chauffeurMessage, setChauffeurMessage] = useState("");
    const [gerantVille, setGerantVille] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const itinRes = await axios.get(`http://localhost:5000/api/itineraires/for-gerant/${currentUser.uid}`);
                setFilteredItineraires(itinRes.data);

                const userRes = await axios.get(`http://localhost:5000/api/users/${currentUser.uid}`);
                if (userRes.data.role !== "gerant") {
                    alert("⚠️ Seuls les gérants peuvent créer une expédition.");
                    return;
                }
                setGerantVille(userRes.data.ville);
            } catch (err) {
                console.error("Erreur chargement données :", err);
            }
        };
        fetchData();
    }, [currentUser.uid]);

    const handleChauffeurSearch = async (e) => {
        const val = e.target.value;
        setChauffeurQuery(val);
        setChauffeurMessage("");
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
            setChauffeurMessage(expActives.length > 0
                ? `⚠️ Chauffeur déjà affecté à : ${expActives[0].itineraireNom}`
                : "✅ Chauffeur disponible !");
        } catch (err) {
            console.error("Erreur vérification dispo chauffeur:", err);
        }
    };

    const handleItineraireSelect = async (itinId) => {
        const itin = filteredItineraires.find(i => i.id === itinId);
        setSelectedItineraire(itin);
        setColisAffectes([]);
        setExpCreatedId(null);

        if (!itin?.villes?.length) return;
        const villeDepart = itin.villes[0].nom;
        const destinations = itin.villes.slice(1).map(v => v.nom);

        try {
            const res = await axios.get("http://localhost:5000/api/colis");
            const matches = res.data.filter(c =>
                c.villeDepart?.nom === villeDepart &&
                destinations.includes(c.villeArrivee?.nom)
            );
            setColisProposes(matches);
        } catch (err) {
            console.error("Erreur chargement colis :", err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); // ⛔ annule le comportement de rechargement

        if (!selectedItineraire || !selectedChauffeur) {
            alert("Tous les champs sont obligatoires");
            return;
        }

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
        <div style={{ padding: "2rem" }}>
            <h2>Créer une expédition</h2>

            {gerantVille && <p>🌍 Ville gérée : <strong>{gerantVille.nom}</strong></p>}

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
                <option value="">-- Sélectionner un itinéraire --</option>
                {filteredItineraires.map(it => (
                    <option key={it.id} value={it.id}>{it.nom}</option>
                ))}
            </select>

            {!expCreatedId ? (
                <>
                    <h4>Colis proposés pour cette expédition :</h4>
                    <ul>
                        {colisProposes.map(c => (
                            <li key={c.id}>
                                {c.nom} → {c.villeArrivee?.nom}
                            </li>
                        ))}
                    </ul>
                </>
            ) : (
                <>
                    <h4>✅ Colis effectivement affectés :</h4>
                    <ul>
                        {colisAffectes.map(c => (
                            <li key={c.id}>
                                {c.nom} → {c.villeArrivee?.nom}
                            </li>
                        ))}
                    </ul>
                </>
            )}

            <button onClick={handleSubmit} disabled={!!expCreatedId}>
                Enregistrer l'expédition
            </button>
        </div>
    );
}
