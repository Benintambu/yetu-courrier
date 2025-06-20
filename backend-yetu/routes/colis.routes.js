// routes/colis.routes.js
const express = require("express");
const router = express.Router();
const admin = require("../config/firebase");

const {
    createColis,
    getAllColis,
    getColisByUser,
    updateColis,
    deleteColis
} = require("../controllers/colis.controller");

// ✅ Créer un colis
router.post("/colis", createColis);

// ✅ Récupérer tous les colis
router.get("/colis", getAllColis);

// ✅ Récupérer les colis créés par un utilisateur
router.get("/colis/user/:uid", getColisByUser);

// ✅ Modifier un colis
router.put("/colis/:id", updateColis);

// ✅ Supprimer un colis
router.delete("/colis/:id", deleteColis);

module.exports = router;
