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
    // ... (Code existant inchangé pour placeBid)
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
// CLOUD FUNCTION: COMMANDE SÉCURISÉE (ATOMIC TRANSACTION)
// ============================================================
exports.createOrder = functions.https.onCall(async (data, context) => {
    // 1. Authentification
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Connectez-vous pour commander.');
    }

    const userId = context.auth.uid;
    const { orderData } = data; // orderData contains items, shipping, paymentMethod, total...

    // IMPORTANT: On force l'userID côté serveur pour éviter l'usurpation
    orderData.userId = userId;
    orderData.userEmail = context.auth.token.email;
    orderData.createdAt = admin.firestore.FieldValue.serverTimestamp();
    orderData.status = orderData.paymentMethod === 'deferred' ? 'pending_payment' : 'pending_stripe';

    // Références vers les documents "Meubles" pour la transaction
    const appId = 'tat-made-in-normandie';
    // On suppose que orderData.items contient { id, collectionName } 
    // (Il faudra s'assurer que le Frontend envoie bien 'collectionName' pour chaque item)

    // Pour simplifier cette V1, on gère item par item, mais dans une transaction globale.
    // Si un seul item échoue, TOUT échoue.

    try {
        const result = await db.runTransaction(async (transaction) => {

            // Étape A : VÉRIFICATION DU STOCK
            for (const item of orderData.items) {
                // Déterminer la collection (par défaut furniture si manquant)
                const colName = item.collectionName || 'furniture';
                const itemRef = db.doc(`artifacts/${appId}/public/data/${colName}/${item.id || item.originalId}`);

                const itemSnap = await transaction.get(itemRef);

                if (!itemSnap.exists) {
                    throw new functions.https.HttpsError('not-found', `L'article ${item.name} n'existe plus.`);
                }

                if (itemSnap.data().sold) {
                    throw new functions.https.HttpsError('failed-precondition', `Désolé, l'article "${item.name}" vient d'être vendu à l'instant.`);
                }

                if (itemSnap.data().status !== 'published') {
                    throw new functions.https.HttpsError('failed-precondition', `L'article "${item.name}" n'est plus disponible à la vente.`);
                }
            }

            // Étape B : VERROUILLAGE (MARK AS SOLD)
            for (const item of orderData.items) {
                const colName = item.collectionName || 'furniture';
                const itemRef = db.doc(`artifacts/${appId}/public/data/${colName}/${item.id || item.originalId}`);

                transaction.update(itemRef, {
                    sold: true,
                    soldAt: admin.firestore.FieldValue.serverTimestamp(),
                    buyerId: userId
                });
            }

            // Étape C : CRÉATION COMMANDE
            const orderRef = db.collection('orders').doc();
            transaction.set(orderRef, orderData);

            return { orderId: orderRef.id, success: true };
        });

        console.log(`Commande créée avec succès: ${result.orderId} par ${userId}`);
        return result;

    } catch (error) {
        console.error("Transaction Commande Échouée:", error);
        // On renvoie l'erreur originale pour que le Frontend puisse l'afficher
        throw error;
    }
});


// ============================================================
// CLOUD FUNCTION: EMAIL COMMANDES (TRIGGER)
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

        // Texte intro pour le client
        let paymentInfo = "";
        if (order.paymentMethod === 'deferred') {
            paymentInfo = `<p><strong>Important :</strong> Votre commande est confirmée mais en attente de paiement. Vous recevrez prochainement nos instructions pour le virement/chèque.</p>`;
        } else {
            paymentInfo = `<p>Votre paiement par carte est validé. Nous préparons votre commande.</p>`;
        }

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
                    
                    ${paymentInfo}
                    
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

// ============================================================
// CLOUD FUNCTION: DYNAMIC META TAGS
// ============================================================
exports.shareMeta = functions.https.onRequest(async (req, res) => {
    // ... (Code existant inchangé pour shareMeta)
    const SITE_URL = 'https://tatmadeinnormandie.web.app';
    const productId = req.query.product;
    const userAgent = req.headers['user-agent'] || '';

    const getIndexHtml = async () => {
        try {
            const response = await fetch(`${SITE_URL}/index.html`);
            return await response.text();
        } catch (e) {
            return `<!DOCTYPE html><html><head><title>Tous à Table</title></head><body><h1>Erreur chargement</h1></body></html>`;
        }
    };

    let html = await getIndexHtml();

    // Default values
    let title = "Tous à Table - Made in Normandie";
    let description = "Atelier d'ébénisterie d'art en Normandie. Créations uniques et sur-mesure.";
    let image = `${SITE_URL}/assets/logo.png`;
    let url = SITE_URL;

    if (productId) {
        try {
            const [furnSnap, boardSnap] = await Promise.all([
                db.doc(`artifacts/tat-made-in-normandie/public/data/furniture/${productId}`).get(),
                db.doc(`artifacts/tat-made-in-normandie/public/data/cutting_boards/${productId}`).get()
            ]);

            let item = null;
            if (furnSnap.exists) item = furnSnap.data();
            else if (boardSnap.exists) item = boardSnap.data();

            if (item) {
                title = `${item.name} | Tous à Table`;
                description = `Découvrez cette pièce unique : ${item.name}. ${item.material ? item.material : ''} - ${item.currentPrice || item.startingPrice}€`;
                image = (item.images && item.images.length > 0) ? item.images[0] : (item.imageUrl || image);
                url = `${SITE_URL}/?product=${productId}`;
            }
        } catch (error) {
            console.error("Erreur meta:", error);
        }
    }

    html = html.replace(/__OG_TITLE__/g, title);
    html = html.replace(/__OG_DESCRIPTION__/g, description);
    html = html.replace(/__OG_IMAGE__/g, image);
    html = html.replace(/__OG_URL__/g, url);

    res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
    res.send(html);
});

// ============================================================
// CLOUD FUNCTION: TOGGLE LIKE
// ============================================================
exports.toggleLike = functions.https.onCall(async (data, context) => {
    // ... (Code existant inchangé pour toggleLike)
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Auth requise');

    const { itemId, collectionName } = data;
    const userId = context.auth.uid;
    const appId = 'tat-made-in-normandie';
    const itemRef = db.doc(`artifacts/${appId}/public/data/${collectionName}/${itemId}`);
    const likeRef = itemRef.collection('likes').doc(userId);

    try {
        const result = await db.runTransaction(async (transaction) => {
            const itemSnap = await transaction.get(itemRef);
            if (!itemSnap.exists) throw new functions.https.HttpsError('not-found', 'Item not found');
            const likeSnap = await transaction.get(likeRef);
            let currentCount = itemSnap.data().likeCount || 0;
            let isLiked = false;

            if (likeSnap.exists) {
                transaction.delete(likeRef);
                currentCount = Math.max(0, currentCount - 1);
            } else {
                transaction.set(likeRef, { likedAt: admin.firestore.FieldValue.serverTimestamp(), userId });
                currentCount++;
                isLiked = true;
            }
            transaction.update(itemRef, { likeCount: currentCount });
            return { newCount: currentCount, isLiked };
        });
        return result;
    } catch (error) {
        throw new functions.https.HttpsError('internal', "Error toggling like");
    }
});

// ============================================================
// CLOUD FUNCTION: TRACK SHARE
// ============================================================
exports.trackShare = functions.https.onCall(async (data, context) => {
    // ... (Code existant inchangé pour trackShare)
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Auth requise');
    const { itemId, collectionName } = data;
    const userId = context.auth.uid;
    const itemRef = db.doc(`artifacts/tat-made-in-normandie/public/data/${collectionName}/${itemId}`);
    const shareRef = itemRef.collection('shares').doc(userId);

    try {
        await db.runTransaction(async (transaction) => {
            const shareSnap = await transaction.get(shareRef);
            if (shareSnap.exists) return;
            transaction.set(shareRef, { sharedAt: admin.firestore.FieldValue.serverTimestamp(), userId });
            transaction.update(itemRef, { shareCount: admin.firestore.FieldValue.increment(1) });
        });
        return { success: true };
    } catch (error) {
        throw new functions.https.HttpsError('internal', "Error sharing");
    }
});
