const functions = require('firebase-functions/v1');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();

// Configuration du transporteur Gmail
// IMPORTANT: L'utilisateur devra configurer l'email et le mot de passe d'application
// via: firebase functions:config:set gmail.email="monmail@gmail.com" gmail.password="mon_app_password"
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_EMAIL,
        pass: process.env.GMAIL_PASSWORD
    }
});

exports.onOrderCreated = functions.firestore
    .document('orders/{orderId}')
    .onCreate(async (snap, context) => {
        const order = snap.data();
        const orderId = context.params.orderId;

        console.log(`Nouvelle commande détectée : ${orderId}`);

        // Si pas de config email, on arrête
        if (!process.env.GMAIL_EMAIL) {
            console.log("Configuration Gmail manquante. Email non envoyé.");
            return null;
        }

        const adminEmail = process.env.GMAIL_EMAIL; // L'email de l'artisan
        const clientEmail = order.shipping.email;
        const clientName = order.shipping.fullName;

        // 1. Email pour l'Artisan (Vous)
        const mailOptionsAdmin = {
            from: `Tous à Table Robot <${adminEmail}>`,
            to: adminEmail,
            subject: `🔔 Nouvelle commande : ${clientName} (${order.total}€)`,
            html: `
                <h1>Nouvelle Commande Reçue !</h1>
                <p><strong>Client :</strong> ${clientName}</p>
                <p><strong>Total :</strong> ${order.total} €</p>
                <p><strong>Paiement :</strong> ${order.paymentMethod === 'deferred' ? 'Différé (Chèque/Virement)' : 'Stripe'}</p>
                <hr />
                <h3>Panier :</h3>
                <ul>
                    ${order.items.map(item => `<li>${item.name} - ${item.price}€</li>`).join('')}
                </ul>
                <p><a href="https://tous-a-table.web.app/admin">Voir la commande dans l'Admin</a></p>
            `
        };

        // 2. Email pour le Client
        const mailOptionsClient = {
            from: `Tous à Table <${adminEmail}>`,
            to: clientEmail,
            subject: `Confirmation de votre commande - Tous à Table`,
            html: `
                <div style="font-family: sans-serif; color: #333;">
                    <h1 style="color: #d97706;">Merci pour votre commande !</h1>
                    <p>Bonjour ${clientName},</p>
                    <p>Nous avons bien reçu votre commande et nous vous en remercions.</p>
                    <p>Nous allons la traiter dans les plus brefs délais.</p>
                    
                    <div style="background: #f5f5f4; padding: 20px; border-radius: 10px; margin: 20px 0;">
                        <h3>Récapitulatif (Commande #${orderId.slice(0, 8)})</h3>
                        <ul>
                             ${order.items.map(item => `<li>${item.name} - ${item.price}€</li>`).join('')}
                        </ul>
                        <p><strong>Total : ${order.total} €</strong></p>
                        <p>Mode de paiement : ${order.paymentMethod === 'deferred' ? 'Paiement à venir (Virement/Chèque)' : 'Carte Bancaire'}</p>
                    </div>

                    <p>À très bientôt,</p>
                    <p><strong>L'équipe Tous à Table</strong></p>
                </div>
            `
        };

        try {
            await transporter.sendMail(mailOptionsAdmin);
            console.log('Email Admin envoyé');

            await transporter.sendMail(mailOptionsClient);
            console.log('Email Client envoyé');

            // Mise à jour du statut dans Firestore
            return snap.ref.update({ emailStatus: 'sent', emailSentAt: admin.firestore.FieldValue.serverTimestamp() });
        } catch (error) {
            console.error('Erreur envoi email:', error);
            return snap.ref.update({ emailStatus: 'error', emailError: error.toString() });
        }
    });
