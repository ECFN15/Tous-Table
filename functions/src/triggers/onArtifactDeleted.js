/**
 * TRIGGERS: Nettoyage automatique à la suppression d'un produit
 * 
 * Supprime les images Storage + sous-collections (bids, likes, comments)
 * quand un produit est effacé de Firestore.
 */
const functions = require('firebase-functions/v1');
const admin = require('firebase-admin');

const db = admin.firestore();

async function cleanupDocumentAssets(snap, context) {
    const data = snap.data();
    const docPath = snap.ref.path;
    console.log(`🧹 Cleanup triggered for: ${docPath}`);

    // 1. Supprimer les images du Storage
    const bucket = admin.storage().bucket();
    const imageUrls = [...(data.images || []), ...(data.thumbnails || [])];

    for (const url of imageUrls) {
        try {
            const pathMatch = url.match(/\/o\/(.+?)\?/);
            if (pathMatch) {
                const filePath = decodeURIComponent(pathMatch[1]);
                await bucket.file(filePath).delete();
                console.log(`🗑️ Image supprimée: ${filePath}`);
            }
        } catch (e) {
            if (e.code !== 404) console.error(`Erreur suppression image:`, e.message);
        }
    }

    // 2. Supprimer les sous-collections
    const subCollections = ['bids', 'likes', 'comments'];
    for (const subCol of subCollections) {
        try {
            const subRef = snap.ref.collection(subCol);
            const subSnap = await subRef.get();
            if (subSnap.empty) continue;

            const batch = db.batch();
            subSnap.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
            console.log(`🗑️ Sous-collection ${subCol}: ${subSnap.size} docs supprimés`);
        } catch (e) {
            console.error(`Erreur nettoyage ${subCol}:`, e.message);
        }
    }

    console.log(`✅ Cleanup terminé pour: ${docPath}`);
}

// Trigger Wildcard pour toutes les collections produits
exports.onArtifactDeleted = functions.runWith({ timeoutSeconds: 300 }).firestore
    .document('artifacts/{appId}/public/data/{collection}/{docId}')
    .onDelete(cleanupDocumentAssets);
