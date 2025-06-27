// 📁 controllers/expedition.controller.js
const admin = require("../config/firebase");

exports.createExpedition = async (req, res) => {
    try {
        const { itineraireId, chauffeurUid, createdBy } = req.body;
        const db = admin.firestore();

        if (!itineraireId || !chauffeurUid || !createdBy) {
            return res.status(400).json({ error: "Champs requis manquants" });
        }

        // 🔍 Récupérer le gérant
        const userDoc = await db.collection("users").doc(createdBy).get();
        if (!userDoc.exists) return res.status(404).json({ error: "Utilisateur introuvable." });
        const userData = userDoc.data();

        if (userData.role !== "gerant") {
            return res.status(403).json({ error: "Seuls les gérants peuvent créer des expéditions." });
        }

        if (!userData.ville || !userData.ville.id) {
            return res.status(400).json({ error: "Ce gérant n'a pas de ville affectée." });
        }

        if (!userData.ville.peutCreerExpeditions) {
            return res.status(403).json({ error: "Ce gérant n'a pas le droit de créer des expéditions." });
        }

        // 🔍 Récupérer l’itinéraire
        const itinDoc = await db.collection("itineraires").doc(itineraireId).get();
        if (!itinDoc.exists) return res.status(404).json({ error: "Itinéraire introuvable." });

        const itineraire = itinDoc.data();
        if (!itineraire.villes || itineraire.villes.length < 2) {
            return res.status(400).json({ error: "Itinéraire invalide (pas assez de villes)." });
        }

        if (itineraire.villes[0].id !== userData.ville.id) {
            return res.status(403).json({ error: "Ce gérant ne peut créer une expédition que depuis sa propre ville." });
        }

        // 🔍 Chercher les colis correspondants
        const villeDepartNom = itineraire.villes[0].nom;
        const destinations = itineraire.villes.slice(1).map(v => v.nom);

        const colisSnap = await db.collection("colis")
            .where("villeDepart.nom", "==", villeDepartNom)
            .get();

        const colisCorrespondants = colisSnap.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(c => destinations.includes(c.villeArrivee?.nom));

        // ✅ Création expédition
        const expData = {
            itineraireId,
            itineraireNom: itineraire.nom,
            chauffeurUid,
            createdBy,
            villeDepart: itineraire.villes[0],
            villeArrivee: itineraire.villes[itineraire.villes.length - 1],
            colis: colisCorrespondants,
            statut: "créée",
            createdAt: new Date()
        };

        const newExp = await db.collection("expeditions").add(expData);
        res.status(201).json({ message: "Expédition créée avec colis", id: newExp.id });

    } catch (err) {
        console.error("❌ Erreur createExpedition :", err.message);
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

    if (!expId || !colisId || !userUid) {
        return res.status(400).json({ error: "Données manquantes" });
    }

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

        // ❌ Gérant de la ville d'arrivée ne peut pas ajouter
        if (user.ville.nom === exp.villeArrivee.nom) {
            return res.status(403).json({ error: "Le gérant de la ville d'arrivée ne peut pas ajouter de colis à cette expédition." });
        }

        // ✅ Vérifie si sa ville est bien sur l’itinéraire
        const itinDoc = await db.collection("itineraires").doc(exp.itineraireId).get();
        const villes = itinDoc.data().villes.map(v => v.nom);

        if (!villes.includes(user.ville.nom)) {
            return res.status(403).json({ error: "Votre ville n’est pas sur l’itinéraire de cette expédition." });
        }

        // ✅ Vérifie si le colis a une destination conforme
        if (!villes.includes(colis.villeArrivee.nom)) {
            return res.status(400).json({ error: "Ce colis ne correspond pas à l'itinéraire de l'expédition" });
        }

        // ✅ Vérifie si le chauffeur est dans la ville
        const chauffeurDoc = await db.collection("users").doc(exp.chauffeurUid).get();
        const chauffeur = chauffeurDoc.data();

        if (chauffeur.villeActuelle?.nom !== user.ville.nom) {
            return res.status(403).json({ error: "Le chauffeur n’est pas dans votre ville actuellement." });
        }

        // Ajout sécurisé du colis
        const currentColis = exp.colis || [];
        await db.collection("expeditions").doc(expId).update({
            colis: [...currentColis, { id: colisDoc.id, ...colis }]
        });

        res.status(200).json({ message: "Colis ajouté à l'expédition" });

    } catch (err) {
        console.error("🔥 Erreur interne :", err.message);
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
    try {
        const { uid } = req.params;

        if (!uid) return res.status(400).json({ error: "UID requis" });

        const db = admin.firestore();

        // Récupérer le gérant
        const userDoc = await db.collection("users").doc(uid).get();
        if (!userDoc.exists) {
            return res.status(404).json({ error: "Gérant introuvable." });
        }

        const userData = userDoc.data();
        if (userData.role !== "gerant") {
            return res.status(403).json({ error: "Accès réservé aux gérants." });
        }

        if (!userData.ville || !userData.ville.id) {
            return res.status(400).json({ error: "Ce gérant n'a pas de ville affectée." });
        }

        const villeId = userData.ville.id;

        // Récupérer les expéditions concernées
        const snapshot = await db.collection("expeditions").get();
        const expeditions = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(exp =>
                exp.villeDepart?.id === villeId || exp.villeArrivee?.id === villeId
            );

        res.status(200).json(expeditions);

    } catch (err) {
        console.error("Erreur getExpeditionsForGerant :", err);
        res.status(500).json({ error: err.message });
    }
};

exports.getColisPourChauffeur = async (req, res) => {
    const { uid } = req.params;

    try {
        const db = admin.firestore();

        // Chercher les expéditions actives du chauffeur
        const snapshot = await db.collection("expeditions")
            .where("chauffeurUid", "==", uid)
            .where("statut", "in", ["créée", "en cours"])
            .get();

        if (snapshot.empty) {
            return res.status(200).json([]); // aucun colis
        }

        // Rassembler tous les colis des expéditions actives
        let colis = [];
        snapshot.docs.forEach(doc => {
            const data = doc.data();
            if (Array.isArray(data.colis)) {
                colis = [...colis, ...data.colis];
            }
        });

        res.status(200).json(colis);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
