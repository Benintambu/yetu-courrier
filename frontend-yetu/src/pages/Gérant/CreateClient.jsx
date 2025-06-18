import { useState } from "react";
import axios from "axios";

export default function CreateClient() {
    const [client, setClient] = useState({
        displayName: "",
        email: "",
        phone: "",
        password: "",
        ville: "",
        province: ""
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post("http://localhost:5000/api/create-client", client);
            alert("Client créé avec succès !");
            setClient({
                displayName: "",
                email: "",
                phone: "",
                password: "",
                ville: "",
                province: ""
            });
        } catch (err) {
            alert("Erreur : " + err.response?.data?.error || err.message);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h3>Créer un client</h3>
            <input
                type="text"
                placeholder="Nom complet"
                value={client.displayName}
                onChange={(e) => setClient({ ...client, displayName: e.target.value })}
            />
            <input
                type="email"
                placeholder="Email"
                value={client.email}
                onChange={(e) => setClient({ ...client, email: e.target.value })}
            />
            <input
                type="text"
                placeholder="Téléphone"
                value={client.phone}
                onChange={(e) => setClient({ ...client, phone: e.target.value })}
            />
            <input
                type="password"
                placeholder="Mot de passe"
                value={client.password}
                onChange={(e) => setClient({ ...client, password: e.target.value })}
            />
            <input
                type="text"
                placeholder="Ville"
                value={client.ville}
                onChange={(e) => setClient({ ...client, ville: e.target.value })}
            />
            <input
                type="text"
                placeholder="Province"
                value={client.province}
                onChange={(e) => setClient({ ...client, province: e.target.value })}
            />
            <button type="submit">Créer</button>
        </form>
    );
}
