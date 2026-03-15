/**
 * ============================================================
 * TOUS À TABLE — Cloud Functions Entry Point
 * ============================================================
 */
const admin = require('firebase-admin');
admin.initializeApp();

// ── COMMERCE ──────────────────────────────────────────────
const { createOrder } = require('./src/commerce/createOrder');
const { stripeWebhook } = require('./src/commerce/stripeWebhook');
const { cancelOrderClient } = require('./src/commerce/cancelOrder');

exports.createOrder = createOrder;
exports.stripeWebhook = stripeWebhook;
exports.cancelOrderClient = cancelOrderClient;

// ── AUCTION ───────────────────────────────────────────────
const { placeBid } = require('./src/auction/placeBid');
const { wakeUp } = require('./src/auction/wakeUp');

exports.placeBid = placeBid;
exports.wakeUp = wakeUp;

// ── AUTH ──────────────────────────────────────────────────
const { grantAdminOnAuth } = require('./src/auth/grantAdmin');
const { addAdminUser, removeAdminUser, logUserConnection, getUserStats } = require('./src/auth/adminManagement');

exports.grantAdminOnAuth = grantAdminOnAuth;
exports.addAdminUser = addAdminUser;
exports.removeAdminUser = removeAdminUser;
exports.logUserConnection = logUserConnection;
exports.getUserStats = getUserStats;

// ── EMAIL (Triggers) ─────────────────────────────────────
const { onOrderCreated, onOrderUpdated } = require('./src/email/orderEmails');

exports.onOrderCreated = onOrderCreated;
exports.onOrderUpdated = onOrderUpdated;

// ── ANALYTICS ────────────────────────────────────────────
const { initLiveSession, syncSession, syncSessionBeacon, deleteSession, clearAllSessions } = require('./src/analytics/sessions');
const { trackAdminIP } = require('./src/analytics/adminIP');
const { updateUserSessions } = require('./src/analytics/updateUserSessions');

exports.initLiveSession = initLiveSession;
exports.syncSession = syncSession;
exports.syncSessionBeacon = syncSessionBeacon;
exports.deleteSession = deleteSession;
exports.clearAllSessions = clearAllSessions;
exports.trackAdminIP = trackAdminIP;
exports.updateUserSessions = updateUserSessions;

// ── MAINTENANCE ──────────────────────────────────────────
const { resetAllStats, runGarbageCollector, resetAllUsers, purgeAnonymousUsers, resetAllOrders, getUploadUrl } = require('./src/maintenance/tools');

exports.resetAllStats = resetAllStats;
exports.runGarbageCollector = runGarbageCollector;
exports.resetAllUsers = resetAllUsers;
exports.purgeAnonymousUsers = purgeAnonymousUsers;
exports.resetAllOrders = resetAllOrders;
exports.getUploadUrl = getUploadUrl;

// ── SEO ──────────────────────────────────────────────────
const { sitemap, shareMeta } = require('./src/seo/seoTools');

exports.sitemap = sitemap;
exports.shareMeta = shareMeta;

// ── TRIGGERS ─────────────────────────────────────────────
const { onArtifactDeleted } = require('./src/triggers/onArtifactDeleted');

exports.onArtifactDeleted = onArtifactDeleted;
