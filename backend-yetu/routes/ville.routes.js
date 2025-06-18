// routes/ville.routes.js
const express = require("express");
const router = express.Router();

const {
    createVille,
    getAllVilles,
    deleteVille
} = require("../controllers/ville.controller");

router.post("/villes", createVille);
router.get("/villes", getAllVilles);
router.delete("/villes/:id", deleteVille);

module.exports = router;
