const admin = require("../config/firebase");

// Ajouter un tarif
exports.addTarif = async (req, res) => {
    const { zoneDepart, zoneArrivee, minPoids, maxPoids, prix } = req.body;

    if (!zoneDepart || !zoneArrivee || minPoids == null || maxPoids == null || prix == null) {
        return res.status(400).json({ error: "Champs requis manquants" });
    }

    try {
        const db = admin.firestore();
        await db.collection("tarifs").add({ zoneDepart, zoneArrivee, minPoids, maxPoids, prix });
        res.status(201).json({ message: "Tarif ajouté avec succès" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtenir tous les tarifs
exports.getAllTarifs = async (req, res) => {
    try {
        const db = admin.firestore();
        const snapshot = await db.collection("tarifs").get();
        const tarifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(tarifs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Supprimer un tarif
exports.deleteTarif = async (req, res) => {
    const { id } = req.params;
    try {
        const db = admin.firestore();
        await db.collection("tarifs").doc(id).delete();
        res.status(200).json({ message: "Tarif supprimé" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Calculer le tarif automatiquement
exports.calculateTarif = async (req, res) => {
    try {
        const { poids, zoneDepart, zoneArrivee } = req.query;

        if (!poids || !zoneDepart || !zoneArrivee) {
            return res.status(400).json({ error: "Paramètres requis : poids, zoneDepart, zoneArrivee" });
        }

        const db = admin.firestore();
        const snapshot = await db.collection("tarifs").get();
        const poidsFloat = parseFloat(poids);

        const tarifs = snapshot.docs.map(doc => doc.data());

        const tarif = tarifs.find(t =>
            poidsFloat >= t.minPoids &&
            poidsFloat < t.maxPoids &&
            t.zoneDepart === zoneDepart &&
            t.zoneArrivee === zoneArrivee
        );

        if (!tarif) {
            console.warn("❌ Aucun tarif trouvé pour :", {
                poids: poidsFloat,
                zoneDepart,
                zoneArrivee
            });
            return res.status(404).json({ error: "Aucun tarif correspondant" });
        }

        return res.status(200).json({ prix: tarif.prix });
    } catch (error) {
        console.error("🔥 Erreur dans calculateTarif :", error);
        return res.status(500).json({ error: "Erreur interne du serveur" });
    }
};
