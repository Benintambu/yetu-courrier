const admin = require("../config/firebase");

exports.createItineraire = async (req, res) => {
    const { nom, villes } = req.body;

    if (!nom || !Array.isArray(villes)) {
        return res.status(400).json({ error: "Nom ou liste des villes manquant" });
    }

    try {
        const db = admin.firestore();
        await db.collection("itineraires").add({
            nom,
            villes,
            createdAt: new Date()
        });
        res.status(201).json({ message: "Itinéraire ajouté" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getItineraires = async (req, res) => {
    try {
        const db = admin.firestore();
        const snapshot = await db.collection("itineraires").get();
        const result = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteItineraire = async (req, res) => {
    const { id } = req.params;
    try {
        const db = admin.firestore();
        await db.collection("itineraires").doc(id).delete();
        res.status(200).json({ message: "Supprimé" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
