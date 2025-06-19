// 📁 routes/expedition.routes.js
const express = require("express");
const router = express.Router();
const { createExpedition, removeColisFromExpedition } = require("../controllers/expedition.controller");

router.post("/expeditions", createExpedition);
router.delete("/expeditions/:expId/colis/:colisId", removeColisFromExpedition);

module.exports = router;