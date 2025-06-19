// 📁 controllers/expedition.controller.js
const admin = require("../config/firebase");

exports.createExpedition = async (req, res) => {
    try {
        const { itineraireId, chauffeurUid, createdBy } = req.body;

        if (!itineraireId || !chauffeurUid || !createdBy) {
            return res.status(400).json({ error: "Champs requis manquants" });
        }

        const db = admin.firestore();

        // 📌 Récupérer l'itinéraire
        const itineraireDoc = await db.collection("itineraires").doc(itineraireId).get();
        if (!itineraireDoc.exists) {
            return res.status(404).json({ error: "Itinéraire introuvable" });
        }
        const itineraire = itineraireDoc.data();
        const villes = itineraire.villes || [];
        if (villes.length < 2) {
            return res.status(400).json({ error: "Itinéraire invalide" });
        }
        const villeDepart = villes[0];
        const destinations = villes.slice(1);

        // 📦 Récupérer les colis correspondant
        const colisSnapshot = await db.collection("colis").where("villeDepart.nom", "==", villeDepart.nom).get();
        const colisAssocies = colisSnapshot.docs
            .filter(doc => destinations.some(v => v.nom === doc.data().villeArrivee.nom))
            .map(doc => ({ id: doc.id, ...doc.data() }));

        const exp = {
            itineraireId,
            itineraireNom: itineraire.nom,
            chauffeurUid,
            createdBy,
            villeDepart,
            villeArrivee: villes[villes.length - 1],
            colis: colisAssocies,
            statut: "créée",
            createdAt: new Date()
        };

        const newExpRef = await db.collection("expeditions").add(exp);
        res.status(201).json({ message: "Expédition créée", id: newExpRef.id });

    } catch (err) {
        console.error("Erreur création expédition:", err);
        res.status(500).json({ error: err.message });
    }
};

exports.removeColisFromExpedition = async (req, res) => {
    const { expId, colisId } = req.params;
    try {
        const db = admin.firestore();
        const expRef = db.collection("expeditions").doc(expId);
        const snapshot = await expRef.get();
        if (!snapshot.exists) return res.status(404).json({ error: "Expédition introuvable" });

        const data = snapshot.data();
        const updatedColis = (data.colis || []).filter(c => c.id !== colisId);

        await expRef.update({ colis: updatedColis });
        res.status(200).json({ message: "Colis retiré de l'expédition" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
