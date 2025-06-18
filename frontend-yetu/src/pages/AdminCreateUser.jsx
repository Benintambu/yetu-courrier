import { useState } from "react";
import axios from "axios";
import VilleSearch from "../components/VilleSearch";

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

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Si gérant sans ville → refuser
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

            {/* Affiche la recherche de ville uniquement pour les gérants */}
            {form.role === "gerant" && (
                <VilleSearch onSelect={setSelectedVille} />
            )}

            <button type="submit">Créer l'utilisateur</button>
        </form>
    );
}
