/**
 * COMMERCE: creation de commande.
 *
 * INPUT: { orderData: { items: [{ id, originalId, collectionName, quantity }], paymentMethod, shipping } }
 * OUTPUT: { success: true, orderId } for deferred payment, or Stripe PaymentIntent data.
 *
 * Security:
 * - Auth required + verified email token.
 * - Product collection and quantities validated server-side.
 * - Prices are recalculated from Firestore.
 * - Stock reads happen before all writes inside each transaction.
 */
const functions = require('firebase-functions/v1');
const admin = require('firebase-admin');
const { STRIPE_SECRET_KEY, GMAIL_EMAIL, GMAIL_PASSWORD } = require('../../helpers/secrets');
const { APP_ID } = require('../../helpers/config');

const db = admin.firestore();
const Stripe = require('stripe');

const ALLOWED_PRODUCT_COLLECTIONS = new Set(['furniture', 'cutting_boards']);
const BUSINESS_ERROR_CODES = new Set([
    'invalid-argument',
    'failed-precondition',
    'not-found',
    'unauthenticated',
    'permission-denied'
]);

const isCallableBusinessError = (error) => (
    error instanceof functions.https.HttpsError || BUSINESS_ERROR_CODES.has(error?.code)
);

const getValidQuantity = (item = {}) => {
    const quantity = item.quantity === undefined || item.quantity === null ? 1 : Number(item.quantity);
    if (!Number.isInteger(quantity) || quantity <= 0 || quantity > 50) {
        throw new functions.https.HttpsError('invalid-argument', 'Quantite invalide dans le panier.');
    }
    return quantity;
};

const getItemLookup = (item = {}) => {
    const colName = item.collectionName || 'furniture';
    const realItemId = item.originalId || item.productId || item.id;

    if (!ALLOWED_PRODUCT_COLLECTIONS.has(colName)) {
        throw new functions.https.HttpsError('invalid-argument', 'Collection produit non supportee.');
    }

    if (!realItemId || typeof realItemId !== 'string') {
        throw new functions.https.HttpsError(
            'invalid-argument',
            'Un article du panier est invalide. Retirez-le puis ajoutez-le de nouveau.'
        );
    }

    return { colName, realItemId, quantity: getValidQuantity(item) };
};

const normalizeOrderItems = (items = []) => {
    const byProduct = new Map();

    for (const item of items) {
        const { colName, realItemId, quantity } = getItemLookup(item);
        const key = `${colName}/${realItemId}`;
        const existing = byProduct.get(key);

        if (existing) {
            existing.quantity += quantity;
        } else {
            byProduct.set(key, { ...item, colName, realItemId, quantity });
        }
    }

    return Array.from(byProduct.values());
};

const getProductPrice = (itemDb = {}) => {
    const price = Number(itemDb.currentPrice ?? itemDb.startingPrice ?? 0);
    if (!Number.isFinite(price) || price < 0) {
        throw new functions.https.HttpsError(
            'failed-precondition',
            `Prix produit invalide: ${itemDb.name || 'article'}`
        );
    }
    return price;
};

const prepareStockReservation = async (transaction, normalizedItems, userId) => {
    const preparedUpdates = [];
    const serverItems = [];
    let txTotal = 0;

    // Firestore transactions require all reads before writes. Keep this loop read-only.
    for (const item of normalizedItems) {
        const { colName, realItemId, quantity } = item;
        const itemRef = db.doc(`artifacts/${APP_ID}/public/data/${colName}/${realItemId}`);
        const itemDoc = await transaction.get(itemRef);

        if (!itemDoc.exists) {
            throw new functions.https.HttpsError(
                'not-found',
                `Produit "${item.name || realItemId}" introuvable. Retirez-le du panier puis ajoutez-le de nouveau.`
            );
        }

        const itemDb = itemDoc.data();
        const currentStock = itemDb.stock !== undefined ? Number(itemDb.stock) : 1;
        const isUniqueFurniture = colName === 'furniture';

        if (!Number.isFinite(currentStock) || currentStock < quantity || itemDb.sold) {
            throw new functions.https.HttpsError(
                'failed-precondition',
                `Article indisponible (stock epuise): ${itemDb.name || item.name || realItemId}`
            );
        }

        const newStock = isUniqueFurniture ? 0 : Math.max(0, currentStock - quantity);
        const realPrice = getProductPrice(itemDb);
        const updates = { stock: newStock, buyerId: userId };

        if (isUniqueFurniture || newStock === 0) {
            updates.sold = true;
            updates.soldAt = admin.firestore.FieldValue.serverTimestamp();
        }

        txTotal += realPrice * quantity;
        serverItems.push({
            id: realItemId,
            originalId: realItemId,
            collectionName: colName,
            name: itemDb.name || item.name || 'Article',
            price: realPrice,
            quantity,
            image: item.image || (itemDb.images && itemDb.images.length > 0 ? itemDb.images[0] : (itemDb.imageUrl || null))
        });
        preparedUpdates.push({ itemRef, updates });
    }

    return { preparedUpdates, serverItems, txTotal };
};

const restoreReservedStock = async (transaction, items = []) => {
    const preparedRestorations = [];

    // Same transaction rule: read every product first, then write.
    for (const item of items) {
        const { colName, realItemId, quantity } = getItemLookup(item);
        const itemRef = db.doc(`artifacts/${APP_ID}/public/data/${colName}/${realItemId}`);
        const itemDoc = await transaction.get(itemRef);
        if (!itemDoc.exists) continue;

        const currentStock = itemDoc.data().stock !== undefined ? Number(itemDoc.data().stock) : 0;
        const restoredStock = colName === 'furniture' ? 1 : currentStock + quantity;
        preparedRestorations.push({
            itemRef,
            updates: {
                stock: restoredStock,
                sold: false,
                soldAt: admin.firestore.FieldValue.delete(),
                buyerId: admin.firestore.FieldValue.delete()
            }
        });
    }

    for (const restoration of preparedRestorations) {
        transaction.update(restoration.itemRef, restoration.updates);
    }
};

exports.createOrder = functions.runWith({ secrets: [STRIPE_SECRET_KEY, GMAIL_EMAIL, GMAIL_PASSWORD] }).https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Auth requise.');
    }

    if (!context.auth.token.email_verified) {
        throw new functions.https.HttpsError(
            'failed-precondition',
            'Veuillez verifier votre email avant de passer commande. Consultez votre boite de reception (ou spams).'
        );
    }

    const userId = context.auth.uid;
    const { orderData } = data || {};

    if (!orderData || !Array.isArray(orderData.items) || orderData.items.length === 0) {
        throw new functions.https.HttpsError('invalid-argument', 'Format de commande invalide.');
    }

    const normalizedItems = normalizeOrderItems(orderData.items);

    if (orderData.paymentMethod === 'manual' || orderData.paymentMethod === 'deferred') {
        const orderRef = db.collection('orders').doc();

        try {
            await db.runTransaction(async (transaction) => {
                const { preparedUpdates, serverItems, txTotal } = await prepareStockReservation(transaction, normalizedItems, userId);

                for (const item of preparedUpdates) {
                    transaction.update(item.itemRef, item.updates);
                }

                transaction.set(orderRef, {
                    ...orderData,
                    items: serverItems,
                    userId,
                    userEmail: context.auth.token.email || orderData.shipping?.email,
                    paymentMethod: 'deferred',
                    total: txTotal,
                    status: 'pending_payment',
                    stockReserved: true,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    stripeSessionId: null
                });
            });

            return { success: true, orderId: orderRef.id };
        } catch (error) {
            console.error('Manual Order Error', {
                code: error?.code || null,
                message: error?.message || String(error),
                orderId: orderRef.id
            });

            if (isCallableBusinessError(error)) throw error;
            throw new functions.https.HttpsError('internal', 'Erreur enregistrement commande.');
        }
    }

    if (orderData.paymentMethod === 'stripe_elements') {
        const stripe = Stripe(STRIPE_SECRET_KEY.value());
        const orderRef = db.collection('orders').doc();
        let serverTotalAmount = 0;
        let serverItemsForMetadata = [];

        try {
            await db.runTransaction(async (transaction) => {
                const { preparedUpdates, serverItems, txTotal } = await prepareStockReservation(transaction, normalizedItems, userId);

                for (const item of preparedUpdates) {
                    transaction.update(item.itemRef, item.updates);
                }

                serverTotalAmount = txTotal;
                serverItemsForMetadata = serverItems;

                transaction.set(orderRef, {
                    userId,
                    userEmail: context.auth.token.email || orderData.shipping?.email,
                    items: serverItems,
                    shipping: orderData.shipping || {},
                    total: txTotal,
                    paymentMethod: 'stripe_elements',
                    status: 'pending_payment',
                    stockReserved: true,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    stripePaymentIntentId: null
                });
            });
        } catch (error) {
            console.error('Stock Reservation Error', {
                code: error?.code || null,
                message: error?.message || String(error),
                orderId: orderRef.id
            });
            if (isCallableBusinessError(error)) throw error;
            throw new functions.https.HttpsError('internal', 'Erreur reservation stock.');
        }

        const shippingData = orderData.shipping || {};
        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(serverTotalAmount * 100),
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
                    userId,
                    userEmail: context.auth.token.email || '',
                    orderId: orderRef.id,
                    shippingMeta: JSON.stringify(shippingData).substring(0, 500),
                    itemsMeta: JSON.stringify(serverItemsForMetadata.map((item) => ({
                        id: item.originalId || item.id,
                        col: item.collectionName || 'furniture',
                        qty: item.quantity || 1
                    }))).substring(0, 500)
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
            console.error('PaymentIntent Error, restoring stock', {
                message: error?.message || String(error),
                orderId: orderRef.id
            });

            try {
                await db.runTransaction(async (transaction) => {
                    await restoreReservedStock(transaction, normalizedItems);
                    transaction.delete(orderRef);
                });
            } catch (restoreError) {
                console.error('CRITICAL: Stock restore failed after PaymentIntent error', {
                    message: restoreError?.message || String(restoreError),
                    orderId: orderRef.id
                });
            }

            throw new functions.https.HttpsError('internal', 'Erreur initialisation paiement securise.');
        }
    }

    throw new functions.https.HttpsError('invalid-argument', 'Methode de paiement non supportee.');
});
