import { useEffect, useState } from "react";
import axios from "axios";

export default function ClientList() {
    const [clients, setClients] = useState([]);
    const [editingClient, setEditingClient] = useState(null);
    const [formData, setFormData] = useState({});

    const fetchClients = async () => {
        const res = await axios.get("http://localhost:5000/api/clients");
        setClients(res.data);
    };

    useEffect(() => {
        fetchClients();
    }, []);

    const handleUpdate = async (e) => {
        e.preventDefault();
        await axios.put(`http://localhost:5000/api/clients/${editingClient.uid}`, formData);
        alert("Client mis à jour");
        setEditingClient(null);
        fetchClients();
    };

    const handleDelete = async (uid) => {
        if (window.confirm("Supprimer ce client ?")) {
            await axios.delete(`http://localhost:5000/api/clients/${uid}`);
            alert("Client supprimé");
            fetchClients();
        }
    };

    return (
        <div>
            <h2>Liste des clients</h2>
            <ul>
                {clients.map(client => (
                    <li key={client.uid}>
                        {client.displayName} – {client.ville}, {client.province}
                        <button onClick={() => {
                            setEditingClient(client);
                            setFormData({
                                displayName: client.displayName,
                                phone: client.phone,
                                ville: client.ville,
                                province: client.province
                            });
                        }}>Modifier</button>
                        <button onClick={() => handleDelete(client.uid)}>Supprimer</button>
                    </li>
                ))}
            </ul>

            {editingClient && (
                <form onSubmit={handleUpdate}>
                    <h4>Modifier {editingClient.email}</h4>
                    <input
                        value={formData.displayName}
                        onChange={e => setFormData({ ...formData, displayName: e.target.value })}
                        placeholder="Nom complet"
                    />
                    <input
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="Téléphone"
                    />
                    <input
                        value={formData.ville}
                        onChange={e => setFormData({ ...formData, ville: e.target.value })}
                        placeholder="Ville"
                    />
                    <input
                        value={formData.province}
                        onChange={e => setFormData({ ...formData, province: e.target.value })}
                        placeholder="Province"
                    />
                    <button type="submit">Enregistrer</button>
                    <button type="button" onClick={() => setEditingClient(null)}>Annuler</button>
                </form>
            )}
        </div>
    );
}
