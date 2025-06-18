const admin = require("../config/firebase");

function generateCodeSecret(length = 6) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let code = "";
    for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

exports.createColis = async (req, res) => {
    const {
        nom,
        poids,
        longueur,
        largeur,
        contenu,
        prix,
        zoneDepart,
        zoneArrivee,
        destinataire,
        expediteur
    } = req.body;

    function generateCodeSecret(length = 6) {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let code = "";
        for (let i = 0; i < length; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }

    try {
        const db = require("../config/firebase").firestore();
        const colisRef = db.collection("colis");

        const newColis = {
            nom,
            poids,
            dimensions: {
                longueur,
                largeur
            },
            contenu,
            prix,
            codeSecret: generateCodeSecret(),
            zoneDepart,
            zoneArrivee,
            destinataire,
            expediteur,
            statut: "enregistré",
            dateCreation: new Date()
        };

        await colisRef.add(newColis);
        res.status(201).json({ message: "Colis enregistré avec succès" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
