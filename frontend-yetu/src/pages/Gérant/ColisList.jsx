import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";

export default function ColisList() {
    const { currentUser } = useAuth();
    const [colis, setColis] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [villeSuggestions, setVilleSuggestions] = useState([]);
    const [clientQuery, setClientQuery] = useState("");
    const [clientSuggestions, setClientSuggestions] = useState([]);
    const [prixAuto, setPrixAuto] = useState(null);
    const [villeArriveeQuery, setVilleArriveeQuery] = useState("");
    const [villeArriveeSuggestions, setVilleArriveeSuggestions] = useState([]);

    const fetchColis = async () => {
        if (!currentUser?.uid) return;
        try {
            const res = await axios.get(`http://localhost:5000/api/colis/user/${currentUser.uid}`);
            setColis(res.data);
        } catch (err) {
            alert("Erreur de chargement : " + err.message);
        }
    };

    useEffect(() => {
        fetchColis();
    }, [currentUser]);

    useEffect(() => {
        const calculateTarif = async () => {
            if (
                editForm.poids &&
                editForm.villeDepart?.zone &&
                editForm.villeArrivee?.zone
            ) {
                try {
                    const res = await axios.get("http://localhost:5000/api/tarifs/calculate", {
                        params: {
                            poids: parseFloat(editForm.poids),
                            zoneDepart: editForm.villeDepart.zone,
                            zoneArrivee: editForm.villeArrivee.zone
                        }
                    });
                    setPrixAuto(res.data.prix);
                } catch (err) {
                    console.error("Erreur recalcul prix :", err.message);
                    setPrixAuto(null);
                }
            }
        };

        if (editingId) {
            calculateTarif();
        }
    }, [editForm.poids, editForm.villeArrivee, editForm.villeDepart, editingId]);



    const handleDelete = async (id) => {
        if (!window.confirm("Supprimer ce colis ?")) return;
        try {
            await axios.delete(`http://localhost:5000/api/colis/${id}`);
            alert("Colis supprimé !");
            fetchColis();
        } catch (err) {
            alert("Erreur : " + err.message);
        }
    };

    const handleUpdate = async (id) => {
        try {
            let clientData = editForm.client;

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

            const updatedPayload = {
                ...editForm,
                prix: prixAuto,
                client: {
                    uid: clientData.uid,
                    displayName: clientData.displayName,
                    email: clientData.email,
                    phone: clientData.phone
                }
            };

            await axios.put(`http://localhost:5000/api/colis/${id}`, updatedPayload);
            alert("Colis mis à jour !");
            setEditingId(null);
            fetchColis();
        } catch (err) {
            alert("Erreur : " + err.message);
        }
    };


    const searchClients = async (query) => {
        setClientQuery(query);
        if (query.length < 2) return setClientSuggestions([]);
        const res = await axios.get("http://localhost:5000/api/clients");
        const filtered = res.data.filter(c =>
            c.displayName.toLowerCase().includes(query.toLowerCase()) ||
            c.email.toLowerCase().includes(query.toLowerCase()) ||
            c.phone.includes(query)
        );
        setClientSuggestions(filtered);
    };

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

    return (
        <div style={{ padding: "2rem" }}>
            <h2>📦 Liste de mes colis</h2>
            {colis.length === 0 && <p>Aucun colis enregistré.</p>}
            <ul style={{ listStyle: "none", padding: 0 }}>
                {colis.map(c => (
                    <li key={c.id} style={{ border: "1px solid #ccc", marginBottom: "1rem", padding: "1rem" }}>
                        {editingId === c.id ? (
                            <div>
                                <input placeholder="Nom" value={editForm.nom} onChange={e => setEditForm({ ...editForm, nom: e.target.value })} />
                                <input
                                    placeholder="Poids"
                                    value={editForm.poids}
                                    onChange={e => setEditForm({ ...editForm, poids: e.target.value })}
                                />

                                <input placeholder="Contenu" value={editForm.contenu} onChange={e => setEditForm({ ...editForm, contenu: e.target.value })} />
                                <input placeholder="Longueur" value={editForm.dimensions.longueur} onChange={e => setEditForm({ ...editForm, dimensions: { ...editForm.dimensions, longueur: e.target.value } })} />
                                <input placeholder="Largeur" value={editForm.dimensions.largeur} onChange={e => setEditForm({ ...editForm, dimensions: { ...editForm.dimensions, largeur: e.target.value } })} />

                                <input placeholder="Nom destinataire" value={editForm.destinataire.nom} onChange={e => setEditForm({ ...editForm, destinataire: { ...editForm.destinataire, nom: e.target.value } })} />
                                <input placeholder="Email destinataire" value={editForm.destinataire.email} onChange={e => setEditForm({ ...editForm, destinataire: { ...editForm.destinataire, email: e.target.value } })} />
                                <input placeholder="Téléphone destinataire" value={editForm.destinataire.phone} onChange={e => setEditForm({ ...editForm, destinataire: { ...editForm.destinataire, phone: e.target.value } })} />

                                <input
                                    placeholder="Ville de destination"
                                    value={villeArriveeQuery}
                                    onChange={handleVilleArriveeSearch}
                                />
                                <ul>
                                    {villeArriveeSuggestions.map(v => (
                                        <li key={v.id}>
                                            {v.nom} ({v.zone})
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setEditForm({ ...editForm, villeArrivee: v });
                                                    setVilleArriveeQuery(v.nom);
                                                    setVilleArriveeSuggestions([]);
                                                }}
                                            >
                                                Sélectionner
                                            </button>
                                        </li>
                                    ))}
                                </ul>

                                <ul>
                                    {villeArriveeSuggestions.map(v => (
                                        <li key={v.id}>{v.nom} ({v.zone})
                                            <button type="button" onClick={() => {
                                                setEditForm({ ...editForm, villeArrivee: v });
                                                setVilleArriveeQuery(v.nom);
                                                setVilleArriveeSuggestions([]);
                                            }}>Sélectionner</button>
                                        </li>
                                    ))}
                                </ul>

                                <p><strong>💰 Prix recalculé :</strong> {prixAuto !== null ? `${prixAuto} USD` : "(sera recalculé à l'enregistrement)"}</p>

                                <input placeholder="Rechercher un client" value={clientQuery} onChange={e => searchClients(e.target.value)} />
                                <ul>
                                    {clientSuggestions.map(cl => (
                                        <li key={cl.uid}>{cl.displayName} – {cl.email}
                                            <button onClick={() => {
                                                setEditForm({ ...editForm, client: cl });
                                                setClientQuery(cl.displayName);
                                                setClientSuggestions([]);
                                            }}>Sélectionner</button>
                                        </li>
                                    ))}
                                </ul>

                                <button onClick={() => handleUpdate(c.id)}>💾 Enregistrer</button>
                                <button onClick={() => setEditingId(null)}>❌ Annuler</button>
                            </div>
                        ) : (
                            <div>
                                <h3>{c.nom}</h3>
                                <p><strong>Poids :</strong> {c.poids} kg</p>
                                <p><strong>Dimensions :</strong> {c.dimensions?.longueur} x {c.dimensions?.largeur} cm</p>
                                <p><strong>Contenu :</strong> {c.contenu}</p>
                                <p><strong>Prix :</strong> {c.prix} USD</p>
                                <p><strong>Départ :</strong> {c.villeDepart?.nom} ({c.villeDepart?.zone})</p>
                                <p><strong>Arrivée :</strong> {c.villeArrivee?.nom} ({c.villeArrivee?.zone})</p>
                                <p><strong>Client :</strong> {c.expediteur?.displayName} – {c.expediteur?.email} – {c.expediteur?.phone}</p>
                                <p><strong>Destinataire :</strong> {c.destinataire?.nom} – {c.destinataire?.email}</p>
                                <button onClick={() => {
                                    setEditingId(c.id);
                                    setEditForm(c);
                                    setClientQuery(c.client?.displayName || "");
                                    setVilleArriveeQuery(c.villeArrivee?.nom || "");
                                }}>✏️ Modifier</button>
                                <button onClick={() => handleDelete(c.id)} style={{ marginLeft: 10 }}>🗑 Supprimer</button>
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}
