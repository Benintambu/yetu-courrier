const express = require("express");
const router = express.Router();
const admin = require("../config/firebase");
const { createItineraire, getItinerairesForGerant, deleteItineraire, getItineraires } = require("../controllers/itineraire.controller");

// 👉 Route pour récupérer tous les itinéraires
router.get("/itineraires/for-gerant/:gerantUid", getItinerairesForGerant);

// 👉 Route pour créer un itinéraire
router.post("/itineraires", createItineraire);

router.get("/itineraires", getItineraires);

// 👉 Route pour supprimer un itinéraire
router.delete("/itineraires/:id", deleteItineraire);

// 👉 Route pour récupérer les villes
router.get("/villes", async (req, res) => {
    try {
        const db = admin.firestore();
        const snapshot = await db.collection("villes").get();
        const villes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(villes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
