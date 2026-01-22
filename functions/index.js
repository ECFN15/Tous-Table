const functions = require('firebase-functions/v1');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();
const db = admin.firestore();

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

// ============================================================
// CLOUD FUNCTION: ENCHÈRES SÉCURISÉES
// ============================================================
exports.placeBid = functions.https.onCall(async (data, context) => {
    // 1. Vérifier l'authentification
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Vous devez être connecté pour enchérir.');
    }

    const { itemId, collectionName, increment } = data;
    const userId = context.auth.uid;
    const userEmail = context.auth.token.email || 'Non renseigné';
    const userName = context.auth.token.name || 'Anonyme';
    const userPhoto = context.auth.token.picture || '';

    // 2. Validation des données
    if (!itemId || typeof itemId !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'ID produit invalide.');
    }
    if (!collectionName || !['furniture', 'cutting_boards'].includes(collectionName)) {
        throw new functions.https.HttpsError('invalid-argument', 'Collection invalide.');
    }
    if (!increment || typeof increment !== 'number' || increment < 5) {
        throw new functions.https.HttpsError('invalid-argument', 'Incrément minimum: 5€.');
    }
    if (increment > 10000) {
        throw new functions.https.HttpsError('invalid-argument', 'Incrément maximum: 10000€.');
    }

    const appId = 'tat-made-in-normandie';
    const itemRef = db.doc(`artifacts/${appId}/public/data/${collectionName}/${itemId}`);

    try {
        const result = await db.runTransaction(async (transaction) => {
            const snap = await transaction.get(itemRef);

            if (!snap.exists) {
                throw new functions.https.HttpsError('not-found', 'Produit introuvable.');
            }

            const itemData = snap.data();

            // 3. Vérifier que l'enchère est active
            if (!itemData.auctionActive) {
                throw new functions.https.HttpsError('failed-precondition', 'Cette enchère n\'est pas active.');
            }

            const auctionEndMs = itemData.auctionEnd?.toMillis() || 0;
            if (auctionEndMs < Date.now()) {
                throw new functions.https.HttpsError('failed-precondition', 'Cette enchère est terminée.');
            }

            // 4. Calculer le nouveau prix
            const currentPrice = itemData.currentPrice || itemData.startingPrice || 0;
            const newPrice = currentPrice + increment;

            // 5. Extension automatique si moins de 2 minutes restantes
            let newEnd = itemData.auctionEnd;
            if ((auctionEndMs - Date.now()) < 120000) {
                newEnd = admin.firestore.Timestamp.fromMillis(Date.now() + 120000);
            }

            // 6. Mettre à jour le produit
            transaction.update(itemRef, {
                currentPrice: newPrice,
                bidCount: (itemData.bidCount || 0) + 1,
                lastBidderId: userId,
                lastBidderName: userName,
                lastBidderEmail: userEmail,
                lastBidderPhoto: userPhoto,
                auctionEnd: newEnd,
                lastBidAt: admin.firestore.FieldValue.serverTimestamp()
            });

            // 7. Ajouter l'enchère dans l'historique
            const bidRef = db.collection(`artifacts/${appId}/public/data/${collectionName}/${itemId}/bids`).doc();
            transaction.set(bidRef, {
                amount: newPrice,
                increment: increment,
                bidderId: userId,
                bidderName: userName,
                bidderEmail: userEmail,
                timestamp: admin.firestore.FieldValue.serverTimestamp()
            });

            return { newPrice, bidCount: (itemData.bidCount || 0) + 1 };
        });

        console.log(`Enchère placée: ${userEmail} +${increment}€ sur ${itemId}`);
        return { success: true, newPrice: result.newPrice, bidCount: result.bidCount };

    } catch (error) {
        console.error('Erreur enchère:', error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'Erreur lors de l\'enchère.');
    }
});

// ============================================================
// CLOUD FUNCTION: EMAIL COMMANDES
// ============================================================
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

