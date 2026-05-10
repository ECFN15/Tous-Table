/**
 * HELPERS: Configuration centralisée
 */

// ⚠️ CONFIGURER: Identifiant logique de l'app (doit correspondre à VITE_APP_LOGICAL_NAME)
const APP_ID = 'tat-made-in-normandie';

// Collections de données produits
const PRODUCT_COLLECTIONS = ['furniture', 'cutting_boards'];

/**
 * Retourne l'URL du site en fonction du projet Firebase actif
 */
function getProjectIdFromHost(host = '') {
    const match = String(host).match(/us-central1-([^.]+)\.cloudfunctions\.net/i);
    return match?.[1];
}

function getProjectId(host) {
    if (process.env.GCLOUD_PROJECT) return process.env.GCLOUD_PROJECT;
    if (process.env.GCP_PROJECT) return process.env.GCP_PROJECT;

    try {
        const firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG || '{}');
        if (firebaseConfig.projectId) return firebaseConfig.projectId;
    } catch (error) {
        // Ignore malformed platform config and fall back to the request host.
    }

    return getProjectIdFromHost(host);
}

function getSiteUrl(host) {
    const projectId = getProjectId(host);
    // ⚠️ CONFIGURER: Mapper vos project IDs vers vos URLs
    const urlMap = {
        'tousatable-client': 'https://tousatable-madeinnormandie.fr',
        'tatmadeinnormandie': 'https://tatmadeinnormandie.web.app'
    };
    return urlMap[projectId] || 'https://tousatable-madeinnormandie.fr';
}

module.exports = { APP_ID, PRODUCT_COLLECTIONS, getSiteUrl };

