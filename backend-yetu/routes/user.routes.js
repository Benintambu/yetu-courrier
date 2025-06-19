// user.routes
const express = require("express");
const router = express.Router();


const {
    createUserWithRole,
    getAllUsers,
    updateUser,
    deleteUser
} = require("../controllers/user.controller");

const {
    createClient,
    getAllClients,
    updateClient,
    deleteClient,
} = require("../controllers/user.controller");

const { createColis, getColisByUser } = require("../controllers/colis.controller");

const { updateColis, deleteColis } = require("../controllers/colis.controller");

// Routes admin
router.post("/create-user", createUserWithRole);
router.get("/users", getAllUsers);
router.put("/users/:uid", updateUser);
router.delete("/users/:uid", deleteUser);

// Routes Gérant
router.post("/create-client", createClient);
router.get("/clients", getAllClients);
router.put("/clients/:uid", updateClient);
router.delete("/clients/:uid", deleteClient);

router.get("/colis/user/:uid", getColisByUser);
router.put("/colis/:id", updateColis);
router.delete("/colis/:id", deleteColis);

module.exports = router;
