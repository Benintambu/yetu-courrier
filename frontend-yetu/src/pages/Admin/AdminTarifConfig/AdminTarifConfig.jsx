// src/pages/Admin/AdminTarifConfig.jsx
import { useState, useEffect } from "react";
import axios from "axios";

export default function AdminTarifConfig() {
    const [tarifs, setTarifs] = useState([]);
    const [form, setForm] = useState({
        zoneDepart: "A",
        zoneArrivee: "A",
        minPoids: 0,
        maxPoids: 1,
        prix: 0
    });

    const fetchTarifs = async () => {
        const res = await axios.get("http://localhost:5000/api/tarifs");
        setTarifs(res.data);
    };

    useEffect(() => {
        fetchTarifs();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post("http://localhost:5000/api/tarifs", form);
            alert("Tarif ajouté");
            setForm({ zoneDepart: "A", zoneArrivee: "A", minPoids: 0, maxPoids: 1, prix: 0 });
            fetchTarifs();
        } catch (err) {
            alert("Erreur : " + err.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Supprimer ce tarif ?")) return;
        await axios.delete(`http://localhost:5000/api/tarifs/${id}`);
        fetchTarifs();
    };

    return (
        <div>
            <h2>Configuration des tarifs</h2>

            <form onSubmit={handleSubmit}>
                <label>Zone de départ :</label>
                <select value={form.zoneDepart} onChange={e => setForm({ ...form, zoneDepart: e.target.value })}>
                    <option value="A">Zone A</option>
                    <option value="B">Zone B</option>
                </select>

                <label>Zone d'arrivée :</label>
                <select value={form.zoneArrivee} onChange={e => setForm({ ...form, zoneArrivee: e.target.value })}>
                    <option value="A">Zone A</option>
                    <option value="B">Zone B</option>
                </select>

                <input type="number" placeholder="Poids min" value={form.minPoids} onChange={e => setForm({ ...form, minPoids: parseFloat(e.target.value) })} />
                <input type="number" placeholder="Poids max" value={form.maxPoids} onChange={e => setForm({ ...form, maxPoids: parseFloat(e.target.value) })} />
                <input type="number" placeholder="Prix (USD)" value={form.prix} onChange={e => setForm({ ...form, prix: parseFloat(e.target.value) })} />
                <button type="submit">Ajouter</button>
            </form>

            <h3>Tarifs enregistrés</h3>
            <ul>
                {tarifs.map(t => (
                    <li key={t.id}>
                        {t.zoneDepart} → {t.zoneArrivee} | {t.minPoids}–{t.maxPoids} kg : {t.prix} USD
                        <button onClick={() => handleDelete(t.id)}>🗑 Supprimer</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
