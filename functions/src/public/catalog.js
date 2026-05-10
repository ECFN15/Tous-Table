const functions = require('firebase-functions/v1');
const admin = require('firebase-admin');

const db = admin.firestore();
const APP_ID = 'tat-made-in-normandie';
const ALLOWED_ORIGINS = new Set([
    'https://tousatable-madeinnormandie.fr',
    'https://www.tousatable-madeinnormandie.fr',
    'https://tousatable-client.web.app',
    'https://tousatable-client.firebaseapp.com',
    'https://tatmadeinnormandie.web.app',
    'https://tatmadeinnormandie.firebaseapp.com',
    'http://localhost:5173',
    'http://localhost:3000',
]);

const PUBLIC_COLLECTIONS = [
    'furniture',
    'cutting_boards',
    'affiliate_products',
    'shop_tutorials',
];

const serializeValue = (value) => {
    if (!value) return value;
    if (value instanceof admin.firestore.Timestamp) {
        return {
            seconds: value.seconds,
            nanoseconds: value.nanoseconds,
        };
    }
    if (Array.isArray(value)) return value.map(serializeValue);
    if (typeof value === 'object') {
        return Object.fromEntries(
            Object.entries(value).map(([key, nested]) => [key, serializeValue(nested)])
        );
    }
    return value;
};

const readPublicCollection = async (collectionName) => {
    const snap = await db
        .collection('artifacts')
        .doc(APP_ID)
        .collection('public')
        .doc('data')
        .collection(collectionName)
        .get();

    return snap.docs.map((doc) => ({
        id: doc.id,
        collectionName,
        ...serializeValue(doc.data()),
    }));
};

exports.publicCatalog = functions.https.onRequest(async (req, res) => {
    const origin = req.get('origin');
    if (ALLOWED_ORIGINS.has(origin)) {
        res.set('Access-Control-Allow-Origin', origin);
        res.set('Vary', 'Origin');
    }
    res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.set('Cache-Control', 'public, max-age=30, s-maxage=60');

    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }

    if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    try {
        const entries = await Promise.all(
            PUBLIC_COLLECTIONS.map(async (collectionName) => [
                collectionName,
                await readPublicCollection(collectionName),
            ])
        );
        res.status(200).json({
            appId: APP_ID,
            generatedAt: new Date().toISOString(),
            collections: Object.fromEntries(entries),
        });
    } catch (error) {
        console.error('Public catalog fallback failed:', error);
        res.status(500).json({ error: 'catalog_unavailable' });
    }
});
