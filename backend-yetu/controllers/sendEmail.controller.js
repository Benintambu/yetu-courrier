const { sendEmail, sendSMS } = require("../services/notification.service");

await sendEmail("client@email.com", "Colis enregistré", "<b>Votre colis est bien enregistré</b>");
await sendSMS("+243891234567", "Votre colis est enregistré sur Yetu Express");
