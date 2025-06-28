//  services/notification.service.js
const nodemailer = require("nodemailer");
const twilio = require("twilio");

//  CONFIGURATION MAIL (Nodemailer)
const emailTransporter = nodemailer.createTransport({
    service: "gmail", // Ou ton service (ex: Mailgun, Outlook...)
    auth: {
        user: process.env.MAIL_USER,       // tonemail@gmail.com
        pass: process.env.MAIL_PASSWORD    // mot de passe ou app password
    }
});

//  FONCTION D'ENVOI EMAIL
exports.sendEmail = async (to, subject, html) => {
    try {
        await emailTransporter.sendMail({
            from: `"Yetu Colis" <${process.env.MAIL_USER}>`,
            to,
            subject,
            html
        });
        console.log(` Email envoyé à ${to}`);
    } catch (error) {
        console.error(` Erreur envoi email à ${to} :`, error.message);
    }
};


// 📱 CONFIGURATION TWILIO (SMS)
const twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

//  FONCTION D'ENVOI SMS
exports.sendSMS = async (to, message) => {
    try {
        await twilioClient.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER, // Ton numéro Twilio
            to
        });
        console.log(` SMS envoyé à ${to}`);
    } catch (error) {
        console.error(` Erreur envoi SMS à ${to} :`, error.message);
    }
};
