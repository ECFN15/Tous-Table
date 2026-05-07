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
const crypto = require('crypto');
const { isAdminIP } = require('./adminIP');
const { getClientIpInfo, isPrivateOrLocalIp } = require('./ip');

const db = admin.firestore();
const MAX_SESSION_DURATION_SECONDS = 24 * 60 * 60;
const MAX_JOURNEY_CHUNK = 25;

const createSyncToken = () => crypto.randomBytes(32).toString('base64url');

const hashSyncToken = (token) => crypto
    .createHash('sha256')
    .update(String(token || ''))
    .digest('hex');

const isValidSyncToken = (sessionData, token) => {
    const expectedHash = sessionData?.syncTokenHash;
    if (!expectedHash) return true; // Legacy sessions created before token hardening.
    if (!token || typeof token !== 'string') return false;

    const actualHash = hashSyncToken(token);
    const expected = Buffer.from(expectedHash, 'hex');
    const actual = Buffer.from(actualHash, 'hex');
    return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
};

const clampDuration = (value) => {
    const duration = Number(value);
    if (!Number.isFinite(duration)) return 0;
    return Math.max(0, Math.min(MAX_SESSION_DURATION_SECONDS, Math.round(duration)));
};

const sanitizeString = (value, maxLength = 160) => {
    if (value === null || value === undefined) return null;
    return String(value).slice(0, maxLength);
};

const sanitizeJourney = (journey) => {
    if (!Array.isArray(journey)) return [];

    return journey
        .slice(0, MAX_JOURNEY_CHUNK)
        .map((step) => ({
            page: sanitizeString(step?.page, 80) || 'unknown',
            itemId: sanitizeString(step?.itemId, 255),
            time: sanitizeString(step?.time, 40),
            duration: clampDuration(step?.duration)
        }))
        .filter(step => step.page);
};

// Géolocalisation simple via IP (ip-api.com — gratuit, pas de clé API requise)
const getGeoFromIp = async (ip) => {
    if (!ip || isPrivateOrLocalIp(ip)) return null;
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

exports.initLiveSession = functions.https.onCall(async (data = {}, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Auth required');
    }

    const ipInfo = getClientIpInfo(context.rawRequest);
    const ip = ipInfo.ip;
    const userAgent = context.rawRequest.headers['user-agent'] || 'Unknown';
    const { userId, email, type, device, browser, os } = data;
    const authUid = context.auth.uid || userId || 'unknown';
    const authEmail = context.auth.token.email || email || null;
    const authProvider = context.auth.token.firebase?.sign_in_provider || 'unknown';
    const syncToken = createSyncToken();

    let geo = await getGeoFromIp(ip);

    // Vérifier si l'IP appartient à un admin
    const isFromAdminIP = await isAdminIP(ip);

    // Marquer la session comme admin si type admin ou IP admin
    const sessionType = (type === 'admin' || isFromAdminIP) ? 'admin' : (type || 'anonymous');

    const sessionData = {
        userId: authUid,
        email: authEmail,
        type: sessionType,
        ip: ip,
        ipMeta: {
            source: ipInfo.source,
            version: ipInfo.version,
            detected: ipInfo.detected,
            usable: ipInfo.usable,
            public: ipInfo.public
        },
        authProvider,
        visitorIdentity: {
            source: authUid && authUid !== 'unknown'
                ? (authProvider === 'anonymous' ? 'anonymous_uid' : 'auth_uid')
                : (ipInfo.usable ? 'ip' : 'session'),
            hasAuthUid: Boolean(authUid && authUid !== 'unknown'),
            hasServerIp: ipInfo.usable
        },
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
        adminIPDetected: isFromAdminIP && type !== 'admin',
        analyticsVersion: 2,
        syncTokenHash: hashSyncToken(syncToken)
    };

    try {
        const sessionRef = await db.collection('analytics_sessions').add(sessionData);
        return { success: true, sessionId: sessionRef.id, syncToken, ipDetected: ipInfo.detected };
    } catch (error) {
        console.error("Init Error:", error);
        throw new functions.https.HttpsError('internal', 'Init failed');
    }
});

exports.syncSession = functions.https.onCall(async (data = {}, context) => {
    if (!context.auth) return { success: false, unauthenticated: true };

    const { sessionId, journey, duration, sessionActive, syncToken } = data;
    if (!sessionId) return { success: false };

    try {
        const sessionRef = db.collection('analytics_sessions').doc(sessionId);
        const sessionSnap = await sessionRef.get();

        if (!sessionSnap.exists) {
            console.warn("Sync skipped: session not found", { sessionId });
            return { success: true, missing: true };
        }

        const sessionData = sessionSnap.data();
        if (!isValidSyncToken(sessionData, syncToken)) {
            console.warn("Sync rejected: invalid token", { sessionId });
            return { success: false, invalidToken: true };
        }

        const updates = {
            lastActivityAt: admin.firestore.FieldValue.serverTimestamp(),
            duration: clampDuration(duration),
            sessionActive: sessionActive !== undefined ? sessionActive : true
        };

        const cleanJourney = sanitizeJourney(journey);
        if (cleanJourney.length > 0) {
            updates.journey = admin.firestore.FieldValue.arrayUnion(...cleanJourney);
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

        payload = payload || {};
        const { sessionId, journey, duration, sessionActive, syncToken } = payload;

        if (!sessionId) {
            res.status(400).send('Missing session ID');
            return;
        }

        const sessionRef = db.collection('analytics_sessions').doc(sessionId);
        const sessionSnap = await sessionRef.get();

        if (!sessionSnap.exists) {
            console.warn("Beacon sync skipped: session not found", { sessionId });
            res.status(204).send('');
            return;
        }

        const sessionData = sessionSnap.data();
        if (!isValidSyncToken(sessionData, syncToken)) {
            console.warn("Beacon sync rejected: invalid token", { sessionId });
            res.status(403).send('Invalid session token');
            return;
        }

        const updates = {
            lastActivityAt: admin.firestore.FieldValue.serverTimestamp(),
            duration: clampDuration(duration),
            sessionActive: sessionActive !== undefined ? sessionActive : false
        };

        const cleanJourney = sanitizeJourney(journey);
        if (cleanJourney.length > 0) {
            updates.journey = admin.firestore.FieldValue.arrayUnion(...cleanJourney);
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
