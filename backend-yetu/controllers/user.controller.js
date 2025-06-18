// user.controler.js
const admin = require("../config/firebase");

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.EMAIL_PASS
    }
});


// Créer les utilisateurs
exports.createUserWithRole = async (req, res) => {
    const { email, password, displayName, role, matricule, phone } = req.body;

    try {
        const user = await admin.auth().createUser({
            email,
            password,
            displayName,
            phoneNumber: phone
        });

        // Attribuer le rôle personnalisé
        await admin.auth().setCustomUserClaims(user.uid, { role });

        // Enregistrer les infos complémentaires dans Firestore
        const db = admin.firestore();
        await db.collection("users").doc(user.uid).set({
            uid: user.uid,
            email,
            role,
            displayName,
            phone,
            matricule,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        res.status(201).json({ message: "Utilisateur créé avec succès", uid: user.uid });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Récupérer les utilisateurs
exports.getAllUsers = async (req, res) => {
    try {
        const db = require("../config/firebase").firestore();
        const snapshot = await db.collection("users").get();

        const users = snapshot.docs.map(doc => doc.data());
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Modifier les utilisateurs
exports.updateUser = async (req, res) => {
    const { uid } = req.params;
    const { displayName, phone, matricule, role, status, email } = req.body;

    try {
        const db = require("../config/firebase").firestore();
        const auth = require("../config/firebase").auth();

        // 1. Mise à jour dans Firebase Auth
        await auth.updateUser(uid, { email });

        // 2. Mise à jour dans Firestore
        await db.collection("users").doc(uid).update({
            email,
            displayName,
            phone,
            matricule,
            role,
            status,
            updatedAt: new Date()
        });

        res.status(200).json({ message: "Utilisateur mis à jour avec succès" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Supprimer un utilisateur
exports.deleteUser = async (req, res) => {
    const { uid } = req.params;

    try {
        const db = require("../config/firebase").firestore();
        const auth = require("../config/firebase").auth();

        // 1. Supprimer l'utilisateur de Firebase Auth
        await auth.deleteUser(uid);

        // 2. Supprimer les données dans Firestore
        await db.collection("users").doc(uid).delete();

        res.status(200).json({ message: "Utilisateur supprimé avec succès" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Gérant Créer un client
exports.createClient = async (req, res) => {
    const { displayName, email, phone, password, ville, province } = req.body;

    try {
        const admin = require("../config/firebase");
        const auth = admin.auth();
        const db = admin.firestore();

        // 1. Créer le compte Firebase Auth
        const user = await auth.createUser({
            email,
            password,
            displayName,
            phoneNumber: phone
        });

        // 2. Ajouter le rôle
        await auth.setCustomUserClaims(user.uid, { role: "client" });

        // 3. Enregistrer dans Firestore
        await db.collection("client").doc(user.uid).set({
            uid: user.uid,
            displayName,
            email,
            phone,
            ville,
            province,
            role: "client",
            createdAt: new Date()
        });

        // 4. Générer le lien de création de mot de passe
        const actionLink = await auth.generatePasswordResetLink(email, {
            url: "http://localhost:3000/reset-password" // tu peux personnaliser cette URL
        });

        // 5. Envoyer l’email
        await transporter.sendMail({
            from: `"Yetu App" <${process.env.EMAIL_FROM}>`,
            to: email,
            subject: "Définissez votre mot de passe – Yetu App",
            html: `
        <p>Bonjour ${displayName},</p>
        <p>Bienvenue chez Yetu ! Cliquez ici pour définir votre mot de passe :</p>
        <p><a href="${actionLink}">Définir mon mot de passe</a></p>
        <p>Ce lien est valide pour 1 heure.</p>
      `
        });

        console.log("📧 Email envoyé à", email);
        res.status(201).json({ message: "Client créé et email envoyé", uid: user.uid });

    } catch (error) {
        console.error("❌ Erreur dans createClient:", error);
        res.status(500).json({ error: error.message });
    }
};


// Gérant Afficher les clients
exports.getAllClients = async (req, res) => {
    try {
        const db = require("../config/firebase").firestore();
        const snapshot = await db.collection("client").get();
        const clients = snapshot.docs.map(doc => doc.data());
        res.status(200).json(clients);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Modifier un client
exports.updateClient = async (req, res) => {
    const { uid } = req.params;
    const { displayName, phone, ville, province } = req.body;

    try {
        const db = require("../config/firebase").firestore();
        await db.collection("client").doc(uid).update({
            displayName,
            phone,
            ville,
            province,
            updatedAt: new Date()
        });
        res.status(200).json({ message: "Client mis à jour avec succès" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Supprimer un client
exports.deleteClient = async (req, res) => {
    const { uid } = req.params;

    try {
        const db = require("../config/firebase").firestore();
        const auth = require("../config/firebase").auth();

        await auth.deleteUser(uid); // Supprimer du système d'auth
        await db.collection("client").doc(uid).delete(); // Supprimer des données
        res.status(200).json({ message: "Client supprimé avec succès" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
