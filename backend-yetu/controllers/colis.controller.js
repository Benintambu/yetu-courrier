const admin = require("../config/firebase");

function generateSecretCode() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
}

exports.createColis = async (req, res) => {
    const {
        nom, poids, dimensions, contenu, prix,
        codeSecret, villeDepart, villeArrivee,
        destinataire, createdBy
    } = req.body;

    try {
        const db = require("../config/firebase").firestore();

        await db.collection("colis").add({
            nom, poids, dimensions, contenu, prix,
            codeSecret,
            villeDepart,
            villeArrivee,
            destinataire,
            createdBy,
            createdAt: new Date()
        });

        res.status(201).json({ message: "Colis créé avec succès" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getColisByUser = async (req, res) => {
    const { uid } = req.params;

    try {
        const db = require("../config/firebase").firestore();
        const snapshot = await db.collection("colis")
            .where("createdBy", "==", uid)
            /* .orderBy("createdAt", "desc") */
            .get();

        const data = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};