// 📁 routes/expedition.routes.js
const express = require("express");
const router = express.Router();
const {
    createExpedition,
    removeColisFromExpedition,
    updateStatut,
    addColisToExpedition,
    deleteExpedition,
    updateChauffeur,
    getExpeditionsByGerant
} = require("../controllers/expedition.controller");
const admin = require("firebase-admin");

// NOUVELLE ROUTE POUR GET TOUTES LES EXPEDITIONS
router.get("/expeditions", async (req, res) => {
    try {
        const snapshot = await admin.firestore().collection("expeditions").get();
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(data);
    } catch (err) {
        console.error("Erreur get expeditions :", err.message);
        res.status(500).json({ error: err.message });
    }
})

router.post("/expeditions", createExpedition);
router.delete("/expeditions/:expId/colis/:colisId", removeColisFromExpedition);

router.put("/expeditions/:expId/add-colis", addColisToExpedition);

router.put("/expeditions/:expId/statut", updateStatut);

router.delete("/expeditions/:id", deleteExpedition);
router.put("/expeditions/:expId/chauffeur", updateChauffeur);
// par exemple
router.get("/expeditions/gerant/:uid", getExpeditionsByGerant);


module.exports = router;