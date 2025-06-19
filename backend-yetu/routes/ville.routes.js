// routes/ville.routes.js
const express = require("express");
const router = express.Router();
const admin = require("../config/firebase");

const {
    createVille,
    getAllVilles,
    deleteVille,
    searchVilles
} = require("../controllers/ville.controller");

/* router.get("/villes/search", async (req, res) => {
    const q = req.query.q?.toLowerCase();
    if (!q) return res.status(400).json({ error: "Paramètre 'q' requis" });

    try {
        const snapshot = await admin.firestore().collection("villes").get();
        const results = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(v => v.nom && v.nom.toLowerCase().includes(q));

        res.status(200).json(results);
    } catch (err) {
        console.error("Erreur recherche ville :", err.message);
        res.status(500).json({ error: err.message });
    }
}); */




router.post("/villes", createVille);
router.get("/villes/search", searchVilles);
router.get("/villes", getAllVilles);
router.delete("/villes/:id", deleteVille);


module.exports = router;
