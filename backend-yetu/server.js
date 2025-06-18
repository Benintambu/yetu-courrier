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
dotenv.config();
//require("dotenv").config();


const app = express();
app.use(cors());
// En Dev local
/* app.use(cors({ origin: "*" }));
 */
app.use(express.json());

app.use("/api", userRoutes);
app.use("/api", colisRoutes);
app.use("/api", villeRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => console.log(`Serveur lancé sur http://localhost:${PORT}`));
