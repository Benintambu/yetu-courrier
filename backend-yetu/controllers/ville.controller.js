// controllers/ville.controller.js
const admin = require("../config/firebase");

exports.createVille = async (req, res) => {
    const { nom, province, zone } = req.body;

    try {
        const db = admin.firestore();

        const docRef = await db.collection("villes").add({
            nom,
            province,
            zone,
            createdAt: new Date()
        });

        res.status(201).json({ id: docRef.id, nom, province, zone });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.getAllVilles = async (req, res) => {
    try {
        const db = admin.firestore();
        const snapshot = await db.collection("villes").get();

        const villes = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.status(200).json(villes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteVille = async (req, res) => {
    try {
        const db = admin.firestore();
        await db.collection("villes").doc(req.params.id).delete();
        res.status(200).json({ message: "Ville supprimée avec succès" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
