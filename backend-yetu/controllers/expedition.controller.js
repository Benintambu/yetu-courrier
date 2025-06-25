// 📁 controllers/expedition.controller.js
const admin = require("../config/firebase");

exports.createExpedition = async (req, res) => {
    try {
        const { itineraireId, chauffeurUid, createdBy } = req.body;

        if (!itineraireId || !chauffeurUid || !createdBy) {
            return res.status(400).json({ error: "Champs requis manquants" });
        }

        const db = admin.firestore();

        // 🔎 Récupérer le gérant
        const userDoc = await db.collection("users").doc(createdBy).get();
        if (!userDoc.exists) {
            return res.status(404).json({ error: "Utilisateur introuvable." });
        }

        const userData = userDoc.data();
        if (userData.role !== "gerant") {
            return res.status(403).json({ error: "Seuls les gérants peuvent créer des expéditions." });
        }

        if (!userData.ville || !userData.ville.id) {
            return res.status(400).json({ error: "Ce gérant n'a pas de ville affectée." });
        }

        // 🔎 Vérifier le droit sur la ville depuis userData directement
        if (!userData.ville.peutCreerExpeditions) {
            return res.status(403).json({ error: "Ce gérant n'a pas le droit de créer des expéditions." });
        }

        // 🔎 Récupérer l'itinéraire
        const itinDoc = await db.collection("itineraires").doc(itineraireId).get();
        if (!itinDoc.exists) {
            return res.status(404).json({ error: "Itinéraire introuvable." });
        }

        const itineraire = itinDoc.data();
        if (!itineraire.villes || itineraire.villes.length < 2) {
            return res.status(400).json({ error: "Itinéraire invalide (pas assez de villes)." });
        }

        // 🔎 Vérifier que la ville de départ correspond à celle du gérant
        if (itineraire.villes[0].id !== userData.ville.id) {
            return res.status(403).json({ error: "Ce gérant ne peut créer une expédition que depuis sa propre ville." });
        }

        // ✅ Création de l'expédition
        const expData = {
            itineraireId,
            itineraireNom: itineraire.nom,
            chauffeurUid,
            createdBy,
            villeDepart: itineraire.villes[0],
            villeArrivee: itineraire.villes[itineraire.villes.length - 1],
            colis: [],
            statut: "créée",
            createdAt: new Date()
        };

        const newExp = await db.collection("expeditions").add(expData);
        res.status(201).json({ message: "Expédition créée", id: newExp.id });

    } catch (err) {
        console.error("Erreur createExpedition :", err);
        res.status(500).json({ error: err.message });
    }
};


/* 
// Création expédition
        const expData = {
            itineraireId,
            itineraireNom: itineraire.nom,
            chauffeurUid,
            createdBy,
            villeDepart: itineraire.villes[0],
            villeArrivee: itineraire.villes[itineraire.villes.length - 1],
            colis: [],
            statut: "créée",
            createdAt: new Date()
        };

        const newExp = await db.collection("expeditions").add(expData);
        res.status(201).json({ message: "Expédition créée", id: newExp.id });

*/


exports.addColisToExpedition = async (req, res) => {
    const { expId } = req.params;
    const { colisId, userUid } = req.body;

    try {
        const db = admin.firestore();
        const [expDoc, colisDoc, userDoc] = await Promise.all([
            db.collection("expeditions").doc(expId).get(),
            db.collection("colis").doc(colisId).get(),
            db.collection("users").doc(userUid).get()
        ]);

        if (!expDoc.exists) return res.status(404).json({ error: "Expédition introuvable" });
        if (!colisDoc.exists) return res.status(404).json({ error: "Colis introuvable" });
        if (!userDoc.exists) return res.status(404).json({ error: "Utilisateur introuvable" });

        const exp = expDoc.data();
        const colis = colisDoc.data();
        const user = userDoc.data();

        if (user.role !== "gerant") {
            return res.status(403).json({ error: "Seuls les gérants peuvent ajouter des colis" });
        }

        if (exp.villeArrivee.nom !== user.ville.nom) {
            return res.status(403).json({ error: "Vous ne pouvez ajouter des colis qu'aux expéditions arrivant dans votre ville" });
        }

        // Vérifier position chauffeur
        const chauffeurDoc = await db.collection("users").doc(exp.chauffeurUid).get();
        if (!chauffeurDoc.exists) return res.status(404).json({ error: "Chauffeur introuvable" });
        const chauffeur = chauffeurDoc.data();

        if (chauffeur.villeActuelle?.nom !== user.ville.nom) {
            return res.status(403).json({ error: "Le chauffeur n'est pas dans votre ville actuellement" });
        }

        const itinDoc = await db.collection("itineraires").doc(exp.itineraireId).get();
        const villes = itinDoc.data().villes.map(v => v.nom);
        if (!villes.includes(colis.villeArrivee.nom)) {
            return res.status(400).json({ error: "Ce colis ne correspond pas à l'itinéraire de l'expédition" });
        }

        const currentColis = exp.colis || [];
        await db.collection("expeditions").doc(expId).update({
            colis: [...currentColis, { id: colisDoc.id, ...colis }]
        });

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

exports.getExpeditionsByGerant = async (req, res) => {
    const { uid } = req.params;

    try {
        const db = admin.firestore();
        const userDoc = await db.collection("users").doc(uid).get();
        if (!userDoc.exists) {
            return res.status(404).json({ error: "Utilisateur introuvable" });
        }

        const user = userDoc.data();
        if (user.role !== "gerant") {
            return res.status(403).json({ error: "Accès réservé aux gérants" });
        }

        const expedDepSnap = await db.collection("expeditions")
            .where("villeDepart.nom", "==", user.ville.nom)
            .get();

        const expedArrSnap = await db.collection("expeditions")
            .where("villeArrivee.nom", "==", user.ville.nom)
            .get();

        const dep = expedDepSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const arr = expedArrSnap.docs
            .filter(doc => !dep.some(d => d.id === doc.id))
            .map(doc => ({ id: doc.id, ...doc.data() }));

        res.status(200).json([...dep, ...arr]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
