import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc, increment, addDoc, collection } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';

// Configuration du PROJET (Celle du site public)
const firebaseConfig = {
    apiKey: "AIzaSyCtuul_bp1r6W__c_6B37ank6Nl7Im0H8o",
    authDomain: "tatmadeinnormandie.firebaseapp.com",
    projectId: "tatmadeinnormandie",
    storageBucket: "tatmadeinnormandie.firebasestorage.app",
    messagingSenderId: "116427088828",
    appId: "1:116427088828:web:614ea24f006431d4d581b9"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function runHackingAttempts() {
    console.log("😈 Démarrage du script de 'White Hat Hacking'...");
    console.log("🎯 Cible : tatmadeinnormandie.web.app");

    try {
        await signInAnonymously(auth);
        console.log("✅ Connecté en tant qu'utilisateur anonyme (Hacker potentiel).");
    } catch (e) {
        console.error("❌ Erreur de connexion:", e);
        return;
    }

    const targetCollection = 'furniture'; // ou 'cutting_boards'
    // ID d'un item existant (à adapter si besoin, ici un exemple ou on essaie de lister pour en trouver un, 
    // mais pour le test on va supposer une attaque sur un ID générique ou tenter d'en créer un)
    // Pour le test 'update', il faut un ID valide. On va essayer de taper sur un ID probablement existant ou échouer.
    const targetId = 'table-chaine'; // Un ID qu'on a vu dans les logs précédents
    const docRef = doc(db, 'artifacts', 'tat-made-in-normandie', 'public', 'data', targetCollection, targetId);

    console.log("\n--- TENTATIVE 1 : Le braquage de prix (Changer le prix à 1€) ---");
    try {
        await updateDoc(docRef, { currentPrice: 1 });
        console.error("😱 FAIL : J'ai réussi à changer le prix ! SÉCURITÉ CRITIQUE COMPROMISE.");
    } catch (error) {
        if (error.code === 'permission-denied') {
            console.log("🛡️ SUCCÈS : Bloqué par le pare-feu (Permission Denied).");
        } else {
            console.log("⚠️ Autre erreur :", error.code, error.message);
        }
    }

    console.log("\n--- TENTATIVE 2 : Le Like Infini (Modifier le compteur de likes directement) ---");
    try {
        await updateDoc(docRef, { likeCount: 999999 });
        console.error("😱 FAIL : J'ai réussi à changer le nombre de likes !");
    } catch (error) {
        if (error.code === 'permission-denied') {
            console.log("🛡️ SUCCÈS : Bloqué par le pare-feu (Permission Denied).");
        } else {
            console.log("⚠️ Autre erreur :", error.code);
        }
    }

    console.log("\n--- TENTATIVE 3 : L'Enchère Fantôme (Créer une enchère sans passer par le serveur) ---");
    try {
        await addDoc(collection(docRef, 'bids'), { amount: 100, bidder: 'Hacker' });
        console.error("😱 FAIL : J'ai réussi à créer une fausse enchère !");
    } catch (error) {
        if (error.code === 'permission-denied') {
            console.log("🛡️ SUCCÈS : Bloqué par le pare-feu (Permission Denied).");
        } else {
            console.log("⚠️ Autre erreur :", error.code);
        }
    }

    console.log("\n🏁 Fin du test de pénétration.");
    process.exit(0);
}

runHackingAttempts();
