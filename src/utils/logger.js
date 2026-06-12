import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase/config';

// Liste des emails administrateurs pour éviter d'enregistrer leurs propres erreurs lors des tests
const ADMIN_EMAILS = ['matthis.fradin2@gmail.com'];

/**
 * Enregistre une erreur client dans Firestore de manière sécurisée et asynchrone.
 * 
 * @param {Error|string|any} error - L'objet Erreur ou le message
 * @param {Object} [metadata] - Métadonnées supplémentaires (panier, ID produit, etc.)
 */
export const logClientError = async (error, metadata = {}) => {
  try {
    const currentUser = auth.currentUser;

    // Éviter de logger les actions de l'admin pour ne pas polluer la base
    if (currentUser && ADMIN_EMAILS.includes(currentUser.email)) {
      console.warn('[Logger] Erreur admin ignorée (non loggée) :', error);
      return;
    }

    // Extraction des infos de l'erreur
    const message = error?.message || (typeof error === 'string' ? error : 'Erreur inconnue');
    const stack = error?.stack || null;
    const page = typeof window !== 'undefined' ? window.location.pathname + window.location.hash : 'Inconnu';
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'Inconnu';

    // Nettoyage des métadonnées pour éviter toute fuite de secret/donnée sensible
    const cleanMetadata = { ...metadata };
    delete cleanMetadata.stripeSecretKey;
    delete cleanMetadata.clientSecret;
    delete cleanMetadata.password;
    delete cleanMetadata.confirmPassword;

    const errorPayload = {
      message: message.substring(0, 1000), // Sécurité de taille
      stack: stack ? stack.substring(0, 4000) : null,
      page,
      userAgent,
      userId: currentUser?.uid || 'anonymous',
      userEmail: currentUser?.email || null,
      metadata: cleanMetadata,
      timestamp: serverTimestamp()
    };

    // Écriture asynchrone dans Firestore (fire-and-forget)
    await addDoc(collection(db, 'client_errors'), errorPayload);
  } catch (logError) {
    // Échec de la journalisation elle-même (ex: réseau coupé, permission refusée)
    // On écrit simplement dans la console pour éviter toute boucle infinie d'erreurs
    console.error('[Logger Fail] Impossible de sauvegarder le log d\'erreur client :', logError);
  }
};
