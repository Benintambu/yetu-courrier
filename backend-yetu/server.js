// server.js
require("dotenv").config();
console.log("EMAIL_FROM =", process.env.EMAIL_FROM);
console.log("EMAIL_PASS =", process.env.EMAIL_PASS);

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const userRoutes = require("./routes/user.routes");
const colisRoutes = require("./routes/colis.routes");
const villeRoutes = require("./routes/ville.routes");
const tarifRoutes = require("./routes/tarif.routes");
const itineraireRoutes = require("./routes/itineraire.routes");
const app = express();
const expeditionRoutes = require("./routes/expedition.routes");


app.use(cors());
app.use(express.json());

// Enregistrement des routes
app.use("/api", userRoutes);
app.use("/api", colisRoutes);
app.use("/api", villeRoutes);
app.use("/api", tarifRoutes);
app.use("/api", itineraireRoutes);
app.use("/api", expeditionRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => console.log(`Serveur lancé sur http://localhost:${PORT}`));
