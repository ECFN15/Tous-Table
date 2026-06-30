/**
 * COMMERCE: client-side order cancellation.
 *
 * Rule: a customer can cancel their own eligible order within 7 days.
 * Reserved stock is restored in the same transaction, with all reads before writes.
 */
const functions = require('firebase-functions/v1');
const admin = require('firebase-admin');
const { APP_ID } = require('../../helpers/config');

const db = admin.firestore();

const prepareStockRestorations = async (transaction, items = [], orderData = {}) => {
    const restorations = [];

    for (const item of items) {
        const itemId = item.originalId || item.id;
        const col = item.collection || item.collectionName || 'furniture';
        if (!itemId) continue;

        const itemRef = db.doc(`artifacts/${APP_ID}/public/data/${col}/${itemId}`);
        const itemSnap = await transaction.get(itemRef);
        if (!itemSnap.exists) continue;

        const itemData = itemSnap.data();
        if (!itemData.sold && !orderData.stockReserved) continue;

        const currentStock = itemData.stock !== undefined ? Number(itemData.stock) : 0;
        const qtyToRestore = item.quantity || 1;
        const restoredStock = col === 'furniture' ? 1 : currentStock + qtyToRestore;

        restorations.push({
            itemRef,
            updates: {
                stock: restoredStock,
                sold: false,
                soldAt: admin.firestore.FieldValue.delete(),
                buyerId: admin.firestore.FieldValue.delete()
            }
        });
    }

    return restorations;
};

exports.cancelOrderClient = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Authentification requise.');
    }

    const { orderId } = data || {};
    if (!orderId) {
        throw new functions.https.HttpsError('invalid-argument', 'ID de commande manquant.');
    }

    const userId = context.auth.uid;
    const orderRef = db.collection('orders').doc(orderId);

    return db.runTransaction(async (transaction) => {
        const orderSnap = await transaction.get(orderRef);
        if (!orderSnap.exists) {
            throw new functions.https.HttpsError('not-found', 'Commande introuvable.');
        }

        const orderData = orderSnap.data();

        if (orderData.userId !== userId) {
            throw new functions.https.HttpsError('permission-denied', 'Cette commande ne vous appartient pas.');
        }

        if (['cancelled_by_client', 'shipped', 'completed'].includes(orderData.status)) {
            throw new functions.https.HttpsError('failed-precondition', 'Cette commande ne peut plus etre annulee.');
        }

        const createdAt = orderData.createdAt?.toDate ? orderData.createdAt.toDate() : new Date(orderData.createdAt);
        const diffDays = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
        if (diffDays > 7) {
            throw new functions.https.HttpsError('failed-precondition', "Le delai d'annulation de 7 jours est depasse.");
        }

        const restorations = Array.isArray(orderData.items)
            ? await prepareStockRestorations(transaction, orderData.items, orderData)
            : [];

        for (const restoration of restorations) {
            transaction.update(restoration.itemRef, restoration.updates);
        }

        transaction.update(orderRef, {
            status: 'cancelled_by_client',
            stockReserved: false,
            cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
            clientNote: "Annulee par l'acheteur"
        });

        return { success: true };
    });
});
