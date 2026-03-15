/**
 * AUCTION: Warm-up (Anti Cold-Start)
 * Appelé au chargement de la fiche produit pour "réveiller" les Cloud Functions.
 */
const functions = require('firebase-functions/v1');

exports.wakeUp = functions.https.onCall(async (data, context) => {
    return { status: 'awake', timestamp: Date.now() };
});
