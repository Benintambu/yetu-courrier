// routes/colis.routes.js
const express = require("express");
const router = express.Router();

const { createColis } = require("../controllers/colis.controller");

router.post("/colis", createColis);

module.exports = router;
