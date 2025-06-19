// routes/tarif.routes.js
const express = require("express");
const router = express.Router();

const {
    addTarif,
    getAllTarifs,
    deleteTarif,
    calculateTarif
} = require("../controllers/tarif.controller");

router.post("/tarifs", addTarif);
router.get("/tarifs", getAllTarifs);
router.delete("/tarifs/:id", deleteTarif);
router.get("/tarifs/calculate", calculateTarif);

module.exports = router;

/* const tarifRoutes = require("./routes/tarif.routes");
app.use("/api", tarifRoutes); */