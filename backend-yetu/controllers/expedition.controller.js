// 📁 controllers/expedition.controller.js
const admin = require("../config/firebase");


exports.createExpedition = async (req, res) => {
    try {
        const { itineraireId, chauffeurUid, createdBy } = req.body;

        if (!itineraireId || !chauffeurUid || !createdBy) {
            return res.status(400).json({ error: "Champs requis manquants" });
        }

        const db = admin.firestore();

        // 🔍 Vérifier si ce chauffeur est déjà affecté à une expédition non terminée
        const expSnapshot = await db.collection("expeditions")
            .where("chauffeurUid", "==", chauffeurUid)
            .where("statut", "in", ["créée", "en cours"])
            .get();

        if (!expSnapshot.empty) {
            return res.status(409).json({ error: "Ce chauffeur est déjà affecté à une autre expédition en cours ou créée." });
        }

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
        const colisSnapshot = await db.collection("colis")
            .where("villeDepart.nom", "==", villeDepart.nom)
            .get();

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

exports.addColisToExpedition = async (req, res) => {
    const { expId } = req.params;
    const { colisId } = req.body;

    try {
        const db = admin.firestore();
        const expRef = db.collection("expeditions").doc(expId);
        const expDoc = await expRef.get();
        if (!expDoc.exists) return res.status(404).json({ error: "Expédition introuvable" });

        const colisDoc = await db.collection("colis").doc(colisId).get();
        if (!colisDoc.exists) return res.status(404).json({ error: "Colis introuvable" });

        const colisData = colisDoc.data();

        // Vérifier que la destination est bien dans l'itinéraire
        const itineraireDoc = await db.collection("itineraires").doc(expDoc.data().itineraireId).get();
        const itineraire = itineraireDoc.data();
        const villes = itineraire.villes.map(v => v.nom);

        if (!villes.includes(colisData.villeArrivee.nom)) {
            return res.status(400).json({ error: "Ce colis ne correspond pas à l'itinéraire de l'expédition." });
        }

        const currentColis = expDoc.data().colis || [];
        await expRef.update({ colis: [...currentColis, { id: colisDoc.id, ...colisData }] });

        res.status(200).json({ message: "Colis ajouté à l'expédition" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateStatut = async (req, res) => {
    const { expId } = req.params;
    const { statut } = req.body;

    if (!["créée", "en cours", "terminée"].includes(statut)) {
        return res.status(400).json({ error: "Statut invalide" });
    }

    try {
        await admin.firestore().collection("expeditions").doc(expId).update({ statut });
        res.status(200).json({ message: "Statut mis à jour avec succès." });
    } catch (err) {
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

exports.deleteExpedition = async (req, res) => {
    const { id } = req.params;
    try {
        await admin.firestore().collection("expeditions").doc(id).delete();
        res.status(200).json({ message: "Expédition supprimée" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateChauffeur = async (req, res) => {
    const { expId } = req.params;
    const { newChauffeurUid } = req.body;

    if (!newChauffeurUid) {
        return res.status(400).json({ error: "Chauffeur invalide." });
    }

    try {
        const db = admin.firestore();

        // Vérifier si ce chauffeur n’est pas déjà pris
        const snapshot = await db.collection("expeditions")
            .where("chauffeurUid", "==", newChauffeurUid)
            .where("statut", "in", ["créée", "en cours"])
            .get();

        if (!snapshot.empty) {
            return res.status(409).json({ error: "Ce chauffeur est déjà affecté ailleurs." });
        }

        // Mettre à jour l'expédition
        await db.collection("expeditions").doc(expId).update({
            chauffeurUid: newChauffeurUid
        });

        res.status(200).json({ message: "Chauffeur mis à jour" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

