import { useState, useEffect } from "react";
import axios from "axios";

export default function AdminCreateUser() {
    const [form, setForm] = useState({
        email: "",
        password: "",
        displayName: "",
        role: "gerant",
        phone: "",
        matricule: "",
    });

    const [selectedVille, setSelectedVille] = useState(null);
    const [villesDisponibles, setVillesDisponibles] = useState([]);
    const [villeQuery, setVilleQuery] = useState("");
    const [villeSuggestions, setVilleSuggestions] = useState([]);

    useEffect(() => {
        const fetchVilles = async () => {
            const res = await axios.get("http://localhost:5000/api/villes");
            setVillesDisponibles(res.data);
        };
        fetchVilles();
    }, []);

    const handleSearchVille = (val) => {
        setVilleQuery(val);
        if (val.length >= 2) {
            const filtered = villesDisponibles.filter(v =>
                v.nom.toLowerCase().includes(val.toLowerCase())
            );
            setVilleSuggestions(filtered);
        } else {
            setVilleSuggestions([]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (form.role === "gerant" && !selectedVille) {
            alert("Veuillez sélectionner une ville pour ce gérant.");
            return;
        }

        try {
            const payload = {
                ...form,
                villeId: form.role === "gerant" ? selectedVille?.id : null
            };

            await axios.post("http://localhost:5000/api/create-user", payload);
            alert("Utilisateur créé !");
            setForm({ email: "", password: "", displayName: "", role: "gerant", phone: "", matricule: "" });
            setSelectedVille(null);
            setVilleQuery("");
            setVilleSuggestions([]);
        } catch (err) {
            alert("Erreur : " + (err.response?.data?.error || err.message));
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input placeholder="Nom complet" value={form.displayName} onChange={e => setForm({ ...form, displayName: e.target.value })} />
            <input placeholder="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            <input placeholder="Mot de passe" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            <input placeholder="Téléphone (avec +243...)" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            <input placeholder="Matricule" value={form.matricule} onChange={e => setForm({ ...form, matricule: e.target.value })} />

            <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                <option value="gerant">Gérant</option>
                <option value="chauffeur">Chauffeur</option>
                <option value="admin">Admin</option>
            </select>

            {form.role === "gerant" && (
                <div style={{ marginTop: "1rem" }}>
                    <label>Ville assignée (Gérant uniquement) :</label>
                    <input
                        type="text"
                        placeholder="Rechercher une ville..."
                        value={villeQuery}
                        onChange={e => handleSearchVille(e.target.value)}
                    />
                    <ul>
                        {villeSuggestions.map(v => (
                            <li key={v.id}>
                                {v.nom} ({v.zone})
                                <button type="button" onClick={() => {
                                    setSelectedVille(v);
                                    setVilleQuery(v.nom);
                                    setVilleSuggestions([]);
                                }}>Sélectionner</button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <button type="submit">Créer l'utilisateur</button>
        </form>
    );
}
