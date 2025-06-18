import { useState, useEffect } from "react";
import axios from "axios";

export default function CreateColis() {
    const [colis, setColis] = useState({
        nom: "",
        poids: "",
        longueur: "",
        largeur: "",
        contenu: "",
        prix: "",
        codeSecret: "",
        zoneDepart: "",
        zoneArrivee: "",
        destinataire: {
            nom: "",
            email: "",
            phone: ""
        },
        expediteurUid: "",
    });

    const [utilisateurs, setUtilisateurs] = useState([]);
    const [expediteurInfo, setExpediteurInfo] = useState(null);

    // Récupérer tous les utilisateurs clients pour sélection
    useEffect(() => {
        const fetchUsers = async () => {
            const res = await axios.get("http://localhost:5000/api/clients");
            setUtilisateurs(res.data);
        };
        fetchUsers();
    }, []);

    // Mettre à jour l'objet complet
    const handleChange = (e) => {
        const { name, value } = e.target;
        setColis({ ...colis, [name]: value });
    };

    const handleDestChange = (e) => {
        const { name, value } = e.target;
        setColis({
            ...colis,
            destinataire: {
                ...colis.destinataire,
                [name]: value
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const expediteur = utilisateurs.find(u => u.uid === colis.expediteurUid);
            if (!expediteur) return alert("Sélectionnez un expéditeur valide");

            const data = {
                ...colis,
                expediteur: {
                    uid: expediteur.uid,
                    displayName: expediteur.displayName,
                    email: expediteur.email
                }
            };

            await axios.post("http://localhost:5000/api/colis", data);
            alert("Colis enregistré !");
        } catch (err) {
            alert("Erreur : " + err.message);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h3>Enregistrer un nouveau colis</h3>

            <input placeholder="Nom du colis" name="nom" onChange={handleChange} />
            <input placeholder="Poids (kg)" name="poids" onChange={handleChange} />
            <input placeholder="Longueur (cm)" name="longueur" onChange={handleChange} />
            <input placeholder="Largeur (cm)" name="largeur" onChange={handleChange} />
            <input placeholder="Contenu" name="contenu" onChange={handleChange} />
            <input placeholder="Prix (CDF)" name="prix" onChange={handleChange} />
            <input placeholder="Zone de départ" name="zoneDepart" onChange={handleChange} />
            <input placeholder="Zone d'arrivée" name="zoneArrivee" onChange={handleChange} />

            <h4>Destinataire</h4>
            <input placeholder="Nom" name="nom" onChange={handleDestChange} />
            <input placeholder="Email" name="email" onChange={handleDestChange} />
            <input placeholder="Téléphone" name="phone" onChange={handleDestChange} />

            <h4>Expéditeur</h4>
            <select onChange={(e) => setColis({ ...colis, expediteurUid: e.target.value })}>
                <option value="">Sélectionner un utilisateur</option>
                {utilisateurs.map((user) => (
                    <option key={user.uid} value={user.uid}>{user.displayName} – {user.email}</option>
                ))}
            </select>

            <button type="submit">Enregistrer le colis</button>
        </form>
    );
}
