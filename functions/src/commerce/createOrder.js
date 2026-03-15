/**
 * COMMERCE: Création de commande (Stripe Checkout + Manuel)
 * 
 * INPUT: { items: [{ id, collectionName, quantity }], paymentMethod: 'stripe'|'manual', shipping: {...} }
 * OUTPUT: { success: true, url: string } (Stripe) ou { success: true, orderId: string } (Manuel)
 * 
 * SÉCURITÉ:
 * - Auth requise + email_verified
 * - Prix recalculé côté serveur (jamais confiance au front)
 * - Stock vérifié en transaction atomique
 */
const functions = require('firebase-functions/v1');
const admin = require('firebase-admin');
const { checkIsAdmin } = require('../../helpers/security');
const { STRIPE_SECRET_KEY, GMAIL_EMAIL, GMAIL_PASSWORD } = require('../../helpers/secrets');
const { APP_ID, getSiteUrl } = require('../../helpers/config');

const db = admin.firestore();
const Stripe = require('stripe');

exports.createOrder = functions.runWith({ secrets: [STRIPE_SECRET_KEY, GMAIL_EMAIL, GMAIL_PASSWORD] }).https.onCall(async (data, context) => {
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Auth requise.');

    // Sécurité: Email vérifié obligatoire
    if (!context.auth.token.email_verified) {
        throw new functions.https.HttpsError('failed-precondition',
            'Veuillez vérifier votre email avant de passer commande. Consultez votre boîte de réception (ou spams).'
        );
    }

    const stripe = Stripe(STRIPE_SECRET_KEY.value());

    const userId = context.auth.uid;
    const { orderData } = data;

    if (!orderData || !orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
        throw new functions.https.HttpsError('invalid-argument', 'Format de commande invalide.');
    }

    // 1. Validation de stock et calcul du prix TOTAL réel (côté serveur)
    let totalAmount = 0;
    const line_items = [];
    const itemsToMarkSold = [];

    try {
        await db.runTransaction(async (transaction) => {
            const stockTracker = {};

            for (const item of orderData.items) {
                const colName = item.collectionName || 'furniture';
                const realItemId = item.originalId || item.id;
                const itemRef = db.doc(`artifacts/${APP_ID}/public/data/${colName}/${realItemId}`);
                const itemSnap = await transaction.get(itemRef);

                if (!itemSnap.exists) {
                    throw new functions.https.HttpsError('not-found', `Produit "${realItemId}" introuvable.`);
                }

                const itemDb = itemSnap.data();
                const alreadyTaken = stockTracker[realItemId] || 0;
                const currentDbStock = itemDb.stock !== undefined ? Number(itemDb.stock) : 1;
                const availableStock = currentDbStock - alreadyTaken;

                if (availableStock <= 0 || itemDb.sold) {
                    throw new functions.https.HttpsError('failed-precondition', `Article indisponible (Stock épuisé): ${itemDb.name}`);
                }

                stockTracker[realItemId] = alreadyTaken + 1;

                // Prix prioritaire : Enchère gagnante > Prix actuel > Prix départ
                let realPrice = itemDb.currentPrice || itemDb.startingPrice || 0;

                totalAmount += realPrice;
                itemsToMarkSold.push({ ref: itemRef, name: itemDb.name });

                // Préparer ligne Stripe
                let imgUrl = itemDb.images && itemDb.images.length > 0 ? itemDb.images[0] : '';

                line_items.push({
                    price_data: {
                        currency: 'eur',
                        product_data: {
                            name: itemDb.name,
                            description: itemDb.description ? itemDb.description.substring(0, 100) + '...' : '',
                            images: imgUrl ? [imgUrl] : [],
                            metadata: {
                                id: realItemId,
                                collection: colName
                            }
                        },
                        unit_amount: Math.round(realPrice * 100),
                    },
                    quantity: 1,
                });
            }
        });
    } catch (e) {
        console.error("Stock Check Error", e);
        throw e;
    }

    const SITE_URL = getSiteUrl();

    // 2. Paiement Différé (Manuel: Virement/Chèque)
    if (orderData.paymentMethod === 'manual' || orderData.paymentMethod === 'deferred') {
        const orderRef = db.collection('orders').doc();
        const finalOrder = {
            ...orderData,
            userId: userId,
            userEmail: context.auth.token.email || orderData.shipping?.email,
            paymentMethod: 'deferred',
            total: totalAmount,
            status: 'pending_payment',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            stripeSessionId: null
        };

        try {
            await db.runTransaction(async (transaction) => {
                const stockTrackerManual = {};
                for (const item of orderData.items) {
                    const colName = item.collectionName || 'furniture';
                    const realItemId = item.originalId || item.id;
                    const itemRef = db.doc(`artifacts/${APP_ID}/public/data/${colName}/${realItemId}`);

                    const itemDoc = await transaction.get(itemRef);
                    if (!itemDoc.exists) throw new Error("Item not found");

                    const currentStock = itemDoc.data().stock !== undefined ? Number(itemDoc.data().stock) : 1;
                    const alreadyTaken = stockTrackerManual[realItemId] || 0;
                    const newStock = Math.max(0, currentStock - 1 - alreadyTaken);

                    const updates = { stock: newStock, buyerId: userId };
                    if (newStock === 0) {
                        updates.sold = true;
                        updates.soldAt = admin.firestore.FieldValue.serverTimestamp();
                    }

                    transaction.update(itemRef, updates);
                    stockTrackerManual[realItemId] = alreadyTaken + 1;
                }
                transaction.set(orderRef, finalOrder);
            });

            return { success: true, orderId: orderRef.id };
        } catch (e) {
            console.error("Manual Order Error", e);
            throw new functions.https.HttpsError('internal', "Erreur enregistrement commande.");
        }
    }

    // 3. Stripe Checkout Session — SUPPRIMÉ (Mars 2026)
    // Mode externe supprimé au profit du PaymentElement inline (stripe_elements)

    // 4. Stripe Elements (PaymentElement intégré — PaymentIntent)
    // Architecture: Commande "pending" AVANT le PaymentIntent
    // 1. On crée la commande en Firestore (status: pending_payment)
    // 2. On crée le PaymentIntent avec l'orderId en metadata
    // 3. Le webhook payment_intent.succeeded confirme la commande
    if (orderData.paymentMethod === 'stripe_elements') {
        const orderRef = db.collection('orders').doc();
        const pendingOrder = {
            userId: userId,
            userEmail: context.auth.token.email || orderData.shipping?.email,
            items: orderData.items.map(i => ({
                id: i.originalId || i.id,
                collectionName: i.collectionName || 'furniture',
                name: i.name,
                price: i.price,
                quantity: i.quantity || 1
            })),
            shipping: orderData.shipping || {},
            total: totalAmount,
            paymentMethod: 'stripe_elements',
            status: 'pending_payment',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            stripePaymentIntentId: null
        };

        try {
            await orderRef.set(pendingOrder);

            const shippingData = orderData.shipping || {};
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(totalAmount * 100),
                currency: 'eur',
                automatic_payment_methods: { enabled: true },
                receipt_email: context.auth.token.email,
                shipping: {
                    name: shippingData.fullName || '',
                    address: {
                        line1: shippingData.address || '',
                        city: shippingData.city || '',
                        postal_code: shippingData.zip || '',
                        country: 'FR',
                    },
                    phone: shippingData.phone || '',
                },
                metadata: {
                    userId: userId,
                    userEmail: context.auth.token.email || '',
                    orderId: orderRef.id,
                    shippingMeta: JSON.stringify(shippingData).substring(0, 500),
                    itemsMeta: JSON.stringify(pendingOrder.items.map(i => ({ id: i.id, col: i.collectionName, qty: i.quantity }))).substring(0, 500)
                }
            });

            await orderRef.update({ stripePaymentIntentId: paymentIntent.id });

            return {
                success: true,
                clientSecret: paymentIntent.client_secret,
                paymentIntentId: paymentIntent.id,
                orderId: orderRef.id
            };
        } catch (error) {
            try { await orderRef.delete(); } catch (e) { /* ignore cleanup error */ }
            console.error("PaymentIntent Error:", error);
            throw new functions.https.HttpsError('internal', "Erreur initialisation paiement sécurisé.");
        }
    }

    // Fallback: méthode de paiement non reconnue
    throw new functions.https.HttpsError('invalid-argument', 'Méthode de paiement non supportée.');
});
