/**
 * AUCTION: Enchère sécurisée
 * 
 * INPUT: { itemId, collectionName, increment, idempotencyKey }
 * 
 * SÉCURITÉ:
 * - Rate limiting: 5 enchères/minute/utilisateur
 * - Idempotence: Clé unique par clic (anti-doublon)
 * - Transaction atomique pour le prix
 */
const functions = require('firebase-functions/v1');
const admin = require('firebase-admin');
const { APP_ID } = require('../../helpers/config');

const db = admin.firestore();

exports.placeBid = functions.https.onCall(async (data, context) => {
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Vous devez être connecté.');

    const { itemId, collectionName, increment, idempotencyKey } = data;
    const userId = context.auth.uid;
    const userName = context.auth.token.name || 'Anonyme';
    const userEmail = context.auth.token.email || '';

    if (!itemId || !increment || increment <= 0) {
        throw new functions.https.HttpsError('invalid-argument', 'Données invalides.');
    }

    // --- RATE LIMITING (5 enchères/minute) ---
    const rateLimitRef = db.doc(`sys_ratelimit/bid_${userId}`);
    const rateLimitSnap = await rateLimitRef.get();
    const rateLimitData = rateLimitSnap.exists ? rateLimitSnap.data() : { count: 0, resetAt: 0 };

    if (Date.now() < rateLimitData.resetAt && rateLimitData.count >= 5) {
        throw new functions.https.HttpsError('resource-exhausted', 'Trop de tentatives. Réessayez dans une minute.');
    }

    // Update rate limit counter (fire-and-forget)
    if (Date.now() > rateLimitData.resetAt) {
        rateLimitRef.set({ count: 1, resetAt: Date.now() + 60000 }).catch(() => { });
    } else {
        rateLimitRef.update({ count: admin.firestore.FieldValue.increment(1) }).catch(() => { });
    }

    const itemRef = db.doc(`artifacts/${APP_ID}/public/data/${collectionName}/${itemId}`);

    // --- IDEMPOTENCE CHECK ---
    if (idempotencyKey) {
        const idempRef = db.doc(`sys_idempotency/${idempotencyKey}`);
        try {
            await db.runTransaction(async (tx) => {
                const idempSnap = await tx.get(idempRef);
                if (idempSnap.exists) throw { code: 'already-exists' };
                tx.set(idempRef, {
                    uid: userId,
                    createdAt: admin.firestore.FieldValue.serverTimestamp()
                });
            });
        } catch (e) {
            if (e.code === 'already-exists') return { success: true, duplicated: true };
            throw e;
        }
    }

    // --- TRANSACTION ENCHÈRE ---
    return db.runTransaction(async (transaction) => {
        const snap = await transaction.get(itemRef);
        if (!snap.exists) throw new functions.https.HttpsError('not-found', 'Produit introuvable.');

        const itemData = snap.data();
        if (!itemData.auctionActive) {
            throw new functions.https.HttpsError('failed-precondition', 'Aucune enchère active.');
        }

        const currentPrice = itemData.currentPrice || itemData.startingPrice || 0;
        const newPrice = currentPrice + increment;

        transaction.update(itemRef, {
            currentPrice: newPrice,
            lastBidderId: userId,
            lastBidderName: userName,
            bidCount: (itemData.bidCount || 0) + 1,
            lastBidAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // Ajouter à l'historique des enchères
        const bidRef = db.collection(`artifacts/${APP_ID}/public/data/${collectionName}/${itemId}/bids`).doc();
        transaction.set(bidRef, {
            amount: newPrice,
            increment: increment,
            bidderId: userId,
            bidderName: userName,
            bidderEmail: userEmail,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });

        return { success: true, newPrice, bidCount: (itemData.bidCount || 0) + 1 };
    });
});
