import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

export default function UserList() {
    const [users, setUsers] = useState([]);
    const { currentUser } = useAuth();

    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({});

    // Récupérer la liste des utilisateurs
    const fetchUsers = async () => {
        const res = await axios.get("http://localhost:5000/api/users");
        setUsers(res.data);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Mise à jour d'un utilisateur
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://localhost:5000/api/users/${editingUser.uid}`, formData);
            alert("Utilisateur modifié !");
            setEditingUser(null);
            fetchUsers(); // rafraîchir la liste
        } catch (err) {
            alert("Erreur : " + err.message);
        }
    };



    return (
        <div>
            <h2>Liste des utilisateurs</h2>
            <ul>
                {users.map((user) => (
                    <li key={user.uid}>
                        <strong>{user.displayName}</strong> – {user.role}
                        {user.email === currentUser.email && (
                            <span style={{ color: "green", fontStyle: "italic" }}> (vous)</span>
                        )}
                        {/* Modifier Utilisateur */}
                        <button style={{ marginLeft: 10 }} onClick={() => {
                            setEditingUser(user);
                            setFormData({
                                email: user.email,
                                displayName: user.displayName,
                                phone: user.phone,
                                matricule: user.matricule,
                                role: user.role,
                                status: user.status || "active"
                            });
                        }}>
                            Modifier
                        </button>

                        {/* Supprimer */}
                        <button style={{ marginLeft: 10 }} onClick={() => {
                            if (window.confirm("Voulez-vous vraiment supprimer cet utilisateur ?")) {
                                axios.delete(`http://localhost:5000/api/users/${user.uid}`)
                                    .then(() => {
                                        alert("Utilisateur supprimé !");
                                        fetchUsers(); // recharge la liste
                                    })
                                    .catch(err => {
                                        alert("Erreur : " + err.message);
                                    });
                            }
                        }}>
                            Supprimer
                        </button>
                    </li>
                ))}
            </ul>

            {editingUser && (
                <form onSubmit={handleSubmit} style={{ marginTop: 20, border: "1px solid #ccc", padding: 20 }}>
                    <h3>Modifier : {editingUser.email}</h3>

                    <input
                        type="email"
                        placeholder="Email"
                        value={formData.email || ""}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />

                    <input
                        type="text"
                        placeholder="Nom"
                        value={formData.displayName || ""}
                        onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    />
                    <br />

                    <input
                        type="text"
                        placeholder="Téléphone"
                        value={formData.phone || ""}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                    <br />

                    <input
                        type="text"
                        placeholder="Matricule"
                        value={formData.matricule || ""}
                        onChange={(e) => setFormData({ ...formData, matricule: e.target.value })}
                    />
                    <br />

                    <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    >
                        <option value="admin">Admin</option>
                        <option value="gerant">Gérant</option>
                        <option value="chauffeur">Chauffeur</option>
                    </select>
                    <br />

                    <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                        <option value="active">Actif</option>
                        <option value="disabled">Désactivé</option>
                    </select>
                    <br />

                    <button type="submit">Enregistrer</button>
                    <button type="button" onClick={() => setEditingUser(null)} style={{ marginLeft: 10 }}>
                        Annuler
                    </button>
                </form>
            )}
        </div>
    );
}
