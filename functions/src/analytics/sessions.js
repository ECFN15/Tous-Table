/**
 * ANALYTICS: Sessions en direct
 * 
 * - initLiveSession: Crée une session avec geo-IP + détection admin IP
 * - syncSession: Met à jour le parcours
 * - syncSessionBeacon: Endpoint fiable pour fermeture de page
 * - deleteSession / clearAllSessions: Admin cleanup
 */
const functions = require('firebase-functions/v1');
const admin = require('firebase-admin');
const { isAdminIP } = require('./adminIP');

const db = admin.firestore();

// Géolocalisation simple via IP (ip-api.com — gratuit, pas de clé API requise)
const getGeoFromIp = async (ip) => {
    if (!ip || ip === 'Unknown' || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.')) return null;
    try {
        const response = await fetch(`http://ip-api.com/json/${ip}?fields=country,regionName,city,status`);
        const data = await response.json();
        if (data.status === 'success') {
            return {
                country: data.country || 'Unknown',
                region: data.regionName || 'Unknown',
                city: data.city || 'Unknown'
            };
        }
        return null;
    } catch (e) {
        console.error("GeoLoc Error:", e);
        return null;
    }
};

exports.initLiveSession = functions.https.onCall(async (data, context) => {
    const rawIp = context.rawRequest.headers['x-forwarded-for'] || context.rawRequest.connection.remoteAddress;
    const ip = rawIp ? rawIp.split(',')[0].trim() : 'Unknown';
    const userAgent = context.rawRequest.headers['user-agent'] || 'Unknown';
    const { userId, email, type, device, browser, os } = data;

    let geo = await getGeoFromIp(ip);

    // Vérifier si l'IP appartient à un admin
    const isFromAdminIP = await isAdminIP(ip);

    // Marquer la session comme admin si type admin ou IP admin
    const sessionType = (type === 'admin' || isFromAdminIP) ? 'admin' : (type || 'anonymous');

    const sessionData = {
        userId: userId || 'unknown',
        email: email || null,
        type: sessionType,
        ip: ip,
        startedAt: admin.firestore.FieldValue.serverTimestamp(),
        lastActivityAt: admin.firestore.FieldValue.serverTimestamp(),
        duration: 0,
        device: device || 'Unknown',
        browser: browser || 'Unknown',
        os: os || 'Unknown',
        userAgent: userAgent,
        geo: geo || { country: 'Unknown', city: 'Unknown', region: 'Unknown' },
        journey: [],
        sessionActive: true,
        adminIPDetected: isFromAdminIP && type !== 'admin'
    };

    try {
        const sessionRef = await db.collection('analytics_sessions').add(sessionData);
        return { success: true, sessionId: sessionRef.id };
    } catch (error) {
        console.error("Init Error:", error);
        throw new functions.https.HttpsError('internal', 'Init failed');
    }
});

exports.syncSession = functions.https.onCall(async (data, context) => {
    const { sessionId, journey, duration, sessionActive } = data;
    if (!sessionId) return { success: false };

    try {
        const sessionRef = db.collection('analytics_sessions').doc(sessionId);
        const updates = {
            lastActivityAt: admin.firestore.FieldValue.serverTimestamp(),
            duration: duration || 0,
            sessionActive: sessionActive !== undefined ? sessionActive : true
        };

        if (journey && journey.length > 0) {
            updates.journey = admin.firestore.FieldValue.arrayUnion(...journey);
        }

        await sessionRef.update(updates);
        return { success: true };
    } catch (error) {
        console.error("Sync Error:", error);
        return { success: false };
    }
});

exports.syncSessionBeacon = functions.https.onRequest(async (req, res) => {
    const allowedOrigins = [
        'https://tousatable-madeinnormandie.fr',
        'https://tatmadeinnormandie.web.app',
        'https://tousatable-client.web.app',
        'https://tousatable-client.firebaseapp.com',
        'http://localhost:5173',
        'http://localhost:3000'
    ];

    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.set('Access-Control-Allow-Origin', origin);
    } else {
        res.set('Access-Control-Allow-Origin', allowedOrigins[0]);
    }
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') { res.status(204).send(''); return; }

    try {
        let payload;
        if (typeof req.body === 'string') {
            payload = JSON.parse(req.body);
        } else if (req.rawBody) {
            payload = JSON.parse(req.rawBody.toString());
        } else {
            payload = req.body;
        }

        const { sessionId, journey, duration, sessionActive } = payload;

        if (!sessionId) {
            res.status(400).send('Missing session ID');
            return;
        }

        const sessionRef = db.collection('analytics_sessions').doc(sessionId);
        const updates = {
            lastActivityAt: admin.firestore.FieldValue.serverTimestamp(),
            duration: duration || 0,
            sessionActive: sessionActive !== undefined ? sessionActive : false
        };

        if (journey && journey.length > 0) {
            updates.journey = admin.firestore.FieldValue.arrayUnion(...journey);
        }

        await sessionRef.update(updates);
        res.status(200).send('Session synced via beacon');
    } catch (error) {
        console.error("Beacon Sync Error:", error);
        res.status(500).send('Beacon sync failed');
    }
});

exports.deleteSession = functions.https.onCall(async (data, context) => {
    if (!context.auth || !context.auth.token.admin && context.auth.token.email !== require('../../helpers/security').SUPER_ADMIN_EMAIL) {
        throw new functions.https.HttpsError('permission-denied', 'Admin only');
    }
    const { sessionId } = data;
    if (!sessionId) throw new functions.https.HttpsError('invalid-argument', 'Missing sessionId');
    await db.collection('analytics_sessions').doc(sessionId).delete();
    return { success: true };
});

exports.clearAllSessions = functions.https.onCall(async (data, context) => {
    if (!context.auth || !context.auth.token.admin && context.auth.token.email !== require('../../helpers/security').SUPER_ADMIN_EMAIL) {
        throw new functions.https.HttpsError('permission-denied', 'Admin only');
    }
    try {
        const sessionsRef = db.collection('analytics_sessions');
        let totalDeleted = 0;

        while (true) {
            const snapshot = await sessionsRef.limit(500).get();
            if (snapshot.empty) break;

            const batch = db.batch();
            snapshot.docs.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
            totalDeleted += snapshot.size;

            if (snapshot.size < 500) break;
        }

        return { success: true, count: totalDeleted };
    } catch (error) {
        console.error("Clear All Error:", error);
        throw new functions.https.HttpsError('internal', 'Clear failed');
    }
});

exports.clearAllAffiliateClicks = functions.https.onCall(async (data, context) => {
    if (!context.auth || !context.auth.token.admin && context.auth.token.email !== require('../../helpers/security').SUPER_ADMIN_EMAIL) {
        throw new functions.https.HttpsError('permission-denied', 'Admin only');
    }
    try {
        const ref = db.collection('affiliate_clicks');
        let totalDeleted = 0;

        while (true) {
            const snapshot = await ref.limit(500).get();
            if (snapshot.empty) break;

            const batch = db.batch();
            snapshot.docs.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
            totalDeleted += snapshot.size;

            if (snapshot.size < 500) break;
        }

        return { success: true, count: totalDeleted };
    } catch (error) {
        console.error("Clear All Affiliate Clicks Error:", error);
        throw new functions.https.HttpsError('internal', 'Clear failed');
    }
});
