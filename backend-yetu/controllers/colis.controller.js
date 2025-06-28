const admin = require("../config/firebase");
const { sendEmail, sendSMS } = require('../services/notification.service')

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
        destinataire, expediteurUid, createdBy
    } = req.body;

    try {
        const db = admin.firestore();


        const [gerantDoc, expediteurDoc] = await Promise.all([
            db.collection("users").doc(createdBy).get(),
            db.collection("client").doc(expediteurUid).get()
        ]);

        if (!gerantDoc.exists || !expediteurDoc.exists) {
            return res.status(404).json({ error: "Gérant ou expéditeur introuvable." });
        }


        const gerant = gerantDoc.data();
        const expediteur = expediteurDoc.data();

        // ✅ Création du colis
        const newColisRef = await db.collection("colis").add({
            nom, poids, dimensions, contenu, prix,
            codeSecret,
            villeDepart,
            villeArrivee,
            destinataire,
            createdBy: {
                uid: createdBy,
                nom: gerant.displayName,
                email: gerant.email,
                phone: gerant.phone
            },
            expediteur: {
                uid: expediteurUid,
                nom: expediteur.displayName,
                email: expediteur.email,
                phone: expediteur.phone
            },
            createdAt: new Date()
        });

        // 🔁 Association à une expédition "créée"
        const expSnapshot = await db.collection("expeditions")
            .where("villeDepart.nom", "==", villeDepart.nom)
            .where("statut", "==", "créée")
            .get();

        for (const doc of expSnapshot.docs) {
            const exp = doc.data();

            const itinDoc = await db.collection("itineraires").doc(exp.itineraireId).get();
            const villes = itinDoc.data().villes.map(v => v.nom);

            if (villes.includes(villeArrivee.nom)) {
                const expRef = db.collection("expeditions").doc(doc.id);
                const currentColis = exp.colis || [];

                await expRef.update({
                    colis: [...currentColis, {
                        id: newColisRef.id,
                        nom,
                        villeDepart,
                        villeArrivee,
                        destinataire,
                        expediteur: {
                            uid: expediteurUid,
                            nom: expediteur.displayName,
                            email: expediteur.email,
                            phone: expediteur.phone
                        },
                        createdBy: {
                            uid: createdBy,
                            email: gerant.email,
                            phone: gerant.phone,
                            nom: gerant.displayName
                        }
                    }]
                });

                break;
            }
        }

        // ✅ NOTIFICATIONS
        await sendEmail(destinataire.email, "📦 Colis enregistré", `
            <p>Bonjour ${destinataire.nom},</p>
            <p>Un colis vous a été adressé : <strong>${nom}</strong>. En cours de traitement.</p>
        `);
        await sendSMS(destinataire.phone, `Yetu Express : Un colis vous a été adressé (${nom}).`);

        await sendEmail(expediteur.email, "✅ Colis enregistré", `
            <p>Bonjour ${expediteur.displayName},</p>
            <p>Votre colis <strong>${nom}</strong> a été enregistré avec succès.</p>
        `);
        await sendSMS(expediteur.phone, `Yetu Express : Votre colis "${nom}" est enregistré.`);

        res.status(201).json({ message: "Colis créé avec succès" });

    } catch (err) {
        console.error("Erreur backend createColis :", err);
        res.status(500).json({ error: err.message });
    }
};

exports.getColisByUser = async (req, res) => {
    const { uid } = req.params;

    try {
        const db = require("../config/firebase").firestore();
        const snapshot = await db.collection("colis")
            .where("createdBy.uid", "==", uid)
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

exports.updateColis = async (req, res) => {
    const { id } = req.params;
    const updatedData = req.body;

    try {
        const db = admin.firestore();
        await db.collection("colis").doc(id).update(updatedData);
        res.status(200).json({ message: "Colis mis à jour avec succès" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteColis = async (req, res) => {
    const { id } = req.params;

    try {
        const db = admin.firestore();
        await db.collection("colis").doc(id).delete();
        res.status(200).json({ message: "Colis supprimé avec succès" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 📌 Ajouter cette fonction dans ton controller colis.controller.js
exports.getAllColis = async (req, res) => {
    try {
        const db = require("../config/firebase").firestore();
        const snapshot = await db.collection("colis").get();
        const colis = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        res.status(200).json(colis);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};