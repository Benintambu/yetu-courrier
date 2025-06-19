import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";

export default function CreateColis() {
    const { currentUser } = useAuth();

    const [villeDepart, setVilleDepart] = useState(null);
    const [villeArriveeQuery, setVilleArriveeQuery] = useState("");
    const [villeArriveeSuggestions, setVilleArriveeSuggestions] = useState([]);
    const [villeArrivee, setVilleArrivee] = useState(null);

    const [form, setForm] = useState({
        nom: "",
        poids: "",
        longueur: "",
        largeur: "",
        contenu: "",
        client: null,
        destinataire: {
            nom: "",
            email: "",
            phone: ""
        }
    });

    const [clientQuery, setClientQuery] = useState("");
    const [clientSuggestions, setClientSuggestions] = useState([]);
    const [newClientFormVisible, setNewClientFormVisible] = useState(false);
    const [prixAuto, setPrixAuto] = useState(null);

    const generateSecretCode = () => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let code = "";
        for (let i = 0; i < 6; i++) {
            code += chars[Math.floor(Math.random() * chars.length)];
        }
        return code;
    };

    useEffect(() => {
        const fetchVille = async () => {
            const res = await axios.get("http://localhost:5000/api/users");
            const gerant = res.data.find(u => u.uid === currentUser?.uid);
            if (gerant?.ville) setVilleDepart(gerant.ville);
        };
        if (currentUser?.uid) fetchVille();
    }, [currentUser]);

    useEffect(() => {
        const calculateTarif = async () => {
            if (form.poids && villeDepart?.zone && villeArrivee?.zone) {
                try {
                    const res = await axios.get("http://localhost:5000/api/tarifs/calculate", {
                        params: {
                            poids: parseFloat(form.poids),
                            zoneDepart: villeDepart.zone,
                            zoneArrivee: villeArrivee.zone
                        }
                    });
                    setPrixAuto(res.data.prix);
                } catch (err) {
                    console.error("Erreur calcul prix:", err);
                    setPrixAuto(null);
                }
            }
        };
        calculateTarif();
    }, [form.poids, villeDepart, villeArrivee]);

    const handleVilleArriveeSearch = async (e) => {
        const val = e.target.value;
        setVilleArriveeQuery(val);
        if (val.length >= 2) {
            const res = await axios.get(`http://localhost:5000/api/villes/search?q=${val}`);
            setVilleArriveeSuggestions(res.data);
        } else {
            setVilleArriveeSuggestions([]);
        }
    };

    const handleClientSearch = async (e) => {
        const val = e.target.value;
        setClientQuery(val);
        if (val.length >= 2) {
            const res = await axios.get("http://localhost:5000/api/clients");
            const results = res.data.filter(c =>
                c.displayName?.toLowerCase().includes(val.toLowerCase()) ||
                c.email?.toLowerCase().includes(val.toLowerCase()) ||
                c.phone?.includes(val)
            );
            setClientSuggestions(results);
        } else {
            setClientSuggestions([]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!villeDepart || !villeArrivee) {
            alert("Sélectionnez les villes de départ et d’arrivée");
            return;
        }

        if (prixAuto === null) {
            alert("Le prix est en cours de calcul, veuillez patienter.");
            return;
        }

        let clientData = form.client;
        if (!clientData?.uid) {
            const newClientRes = await axios.post("http://localhost:5000/api/create-client", {
                displayName: clientData.displayName,
                email: clientData.email,
                phone: clientData.phone,
                ville: clientData.ville,
                province: clientData.province,
                password: Math.random().toString(36).slice(2, 10)
            });
            clientData.uid = newClientRes.data.uid;
        }

        const payload = {
            nom: form.nom,
            poids: form.poids,
            contenu: form.contenu,
            prix: prixAuto,
            dimensions: {
                longueur: form.longueur,
                largeur: form.largeur
            },
            client: {
                uid: clientData.uid,
                displayName: clientData.displayName,
                email: clientData.email,
                phone: clientData.phone
            },
            destinataire: form.destinataire,
            villeDepart,
            villeArrivee,
            codeSecret: generateSecretCode(),
            createdBy: currentUser.uid
        };

        try {
            await axios.post("http://localhost:5000/api/colis", payload);
            alert("✅ Colis créé avec succès !");
            setForm({
                nom: "",
                poids: "",
                longueur: "",
                largeur: "",
                contenu: "",
                client: null,
                destinataire: { nom: "", email: "", phone: "" }
            });
            setVilleArrivee(null);
            setVilleArriveeQuery("");
            setClientQuery("");
            setClientSuggestions([]);
            setNewClientFormVisible(false);
            setPrixAuto(null);
        } catch (err) {
            alert("❌ Erreur : " + err.message);
        }
    };

    return (
        <div style={{ padding: "2rem" }}>
            <h2>📦 Créer un nouveau colis</h2>
            <form onSubmit={handleSubmit}>
                <input placeholder="Nom du colis" value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} />
                <input placeholder="Poids (kg)" value={form.poids} onChange={e => setForm({ ...form, poids: e.target.value })} />
                <input type="number" placeholder="Longueur (cm)" value={form.longueur} onChange={e => setForm({ ...form, longueur: e.target.value })} />
                <input type="number" placeholder="Largeur (cm)" value={form.largeur} onChange={e => setForm({ ...form, largeur: e.target.value })} />
                <input placeholder="Contenu" value={form.contenu} onChange={e => setForm({ ...form, contenu: e.target.value })} />

                <p><strong>💰 Prix automatique :</strong> {prixAuto !== null ? `${prixAuto} USD` : "(en attente...)"}</p>

                <h4>🧍 Client</h4>
                <input placeholder="Rechercher un client (nom, email, téléphone)" value={clientQuery} onChange={handleClientSearch} />
                <ul>
                    {clientSuggestions.map(c => (
                        <li key={c.uid}>{c.displayName} – {c.email} – {c.phone}
                            <button type="button" onClick={() => {
                                setForm({ ...form, client: c });
                                setClientQuery(c.displayName);
                                setClientSuggestions([]);
                                setNewClientFormVisible(false);
                            }}>Sélectionner</button>
                        </li>
                    ))}
                </ul>
                {form.client ? (
                    <p><strong>Client sélectionné :</strong> {form.client.displayName}</p>
                ) : (
                    <div>
                        <p>Aucun client trouvé ?</p>
                        <button type="button" onClick={() => setNewClientFormVisible(true)}>Créer un nouveau client</button>
                    </div>
                )}

                {newClientFormVisible && (
                    <div style={{ border: "1px solid #ccc", padding: 10, marginTop: 10 }}>
                        <h5>➕ Nouveau client</h5>
                        <input placeholder="Nom complet" onChange={e => setForm({ ...form, client: { ...form.client, displayName: e.target.value } })} />
                        <input placeholder="Email" onChange={e => setForm({ ...form, client: { ...form.client, email: e.target.value } })} />
                        <input placeholder="Téléphone" onChange={e => setForm({ ...form, client: { ...form.client, phone: e.target.value } })} />
                        <input placeholder="Ville" onChange={e => setForm({ ...form, client: { ...form.client, ville: e.target.value } })} />
                        <input placeholder="Province" onChange={e => setForm({ ...form, client: { ...form.client, province: e.target.value } })} />
                    </div>
                )}

                <h4>📩 Informations du destinataire</h4>
                <input placeholder="Nom" value={form.destinataire.nom} onChange={e => setForm({ ...form, destinataire: { ...form.destinataire, nom: e.target.value } })} />
                <input placeholder="Email" value={form.destinataire.email} onChange={e => setForm({ ...form, destinataire: { ...form.destinataire, email: e.target.value } })} />
                <input placeholder="Téléphone" value={form.destinataire.phone} onChange={e => setForm({ ...form, destinataire: { ...form.destinataire, phone: e.target.value } })} />

                <p><strong>📍 Ville de départ :</strong> {villeDepart?.nom} ({villeDepart?.zone})</p>

                <input placeholder="Ville de destination" value={villeArriveeQuery} onChange={handleVilleArriveeSearch} />
                <ul>
                    {villeArriveeSuggestions.map(v => (
                        <li key={v.id}>{v.nom} ({v.zone})
                            <button type="button" onClick={() => {
                                setVilleArrivee(v);
                                setVilleArriveeQuery(v.nom);
                                setVilleArriveeSuggestions([]);
                            }}>Sélectionner</button>
                        </li>
                    ))}
                </ul>

                <button type="submit" style={{ marginTop: "1rem" }}>Enregistrer le colis</button>
            </form>
        </div>
    );
}
