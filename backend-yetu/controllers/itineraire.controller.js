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

exports.getItinerairesForGerant = async (req, res) => {
    const { gerantUid } = req.params;

    try {
        const db = admin.firestore();

        // 🔍 Récupérer les infos du gérant
        const userSnap = await db.collection("users").doc(gerantUid).get();
        if (!userSnap.exists) {
            return res.status(404).json({ error: "Gérant introuvable" });
        }
        const userData = userSnap.data();

        if (userData.role !== "gerant") {
            return res.status(403).json({ error: "Cet utilisateur n'est pas un gérant" });
        }

        if (!userData.ville || !userData.ville.nom) {
            return res.status(400).json({ error: "Le gérant n'a pas de ville attribuée" });
        }

        const villeNom = userData.ville.nom;

        // 🔥 Filtrer les itinéraires où la première ville = ville du gérant
        const itinSnap = await db.collection("itineraires").get();
        const itineraires = itinSnap.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(it => it.villes && it.villes.length > 0 && it.villes[0].nom === villeNom);

        res.status(200).json(itineraires);

    } catch (err) {
        console.error("Erreur getItinerairesForGerant:", err);
        res.status(500).json({ error: err.message });
    }
};


exports.getItineraires = async (req, res) => {
    try {
        const db = admin.firestore();
        const snapshot = await db.collection("itineraires").get();

        if (snapshot.empty) {
            return res.status(200).json([]);  // pas d'itinéraires mais requête OK
        }

        const result = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.status(200).json(result);

    } catch (err) {
        console.error("Erreur getItineraires :", err);
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
