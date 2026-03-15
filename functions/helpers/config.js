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
function getSiteUrl() {
    const projectId = process.env.GCLOUD_PROJECT;
    // ⚠️ CONFIGURER: Mapper vos project IDs vers vos URLs
    const urlMap = {
        'tousatable-client': 'https://tousatable-madeinnormandie.fr',
        'tatmadeinnormandie': 'https://tatmadeinnormandie.web.app'
    };
    return urlMap[projectId] || `https://${projectId}.web.app`;
}

module.exports = { APP_ID, PRODUCT_COLLECTIONS, getSiteUrl };

