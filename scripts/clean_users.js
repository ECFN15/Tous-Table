const admin = require('firebase-admin');

// 1. Initialisation (assure-toi que tu as le fichier service-account.json ou que tu es loggé en CLI)
// Pour le local avec 'firebase functions:shell', on utilise l'application par défaut
const serviceAccount = require('./service-account.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://tatmadeinnormandie.firebaseio.com"
});

const db = admin.firestore();
const auth = admin.auth();

// --- CONFIGURATION ---
const SUPER_ADMIN_EMAILS = [
    'matthis.fradintatyk@gmail.com',
    'matthis.fradin2@gmail.com'
];

async function cleanSlate() {
    console.log("🧹 DÉMARRAGE DU GRAND NETTOYAGE...");
    console.log(`🛡️  Comptes protégés : ${SUPER_ADMIN_EMAILS.join(', ')}`);

    // --- ÉTAPE 1 : NETTOYAGE AUTHENTIFICATION ---
    console.log("\n--- 1. AUTHENTICATION ---");
    let nextPageToken;
    let deletedCount = 0;

    do {
        const listUsersResult = await auth.listUsers(1000, nextPageToken);
        const usersToDelete = listUsersResult.users
            .filter(user => !SUPER_ADMIN_EMAILS.includes(user.email))
            .map(user => user.uid);

        if (usersToDelete.length > 0) {
            console.log(`Suppression de ${usersToDelete.length} utilisateurs...`);
            await auth.deleteUsers(usersToDelete);
            deletedCount += usersToDelete.length;
            usersToDelete.forEach(uid => console.log(`   - Supprimé : ${uid}`));
        }

        nextPageToken = listUsersResult.pageToken;
    } while (nextPageToken);

    console.log(`✅ Auth nettoyée. ${deletedCount} comptes supprimés.`);


    // --- ÉTAPE 2 : NETTOYAGE FIRESTORE (ADMINS) ---
    console.log("\n--- 2. FIRESTORE ADMINS ---");
    const adminDocRef = db.doc('sys_metadata/admin_users');

    // On recrée la liste propre avec SEULEMENT les super admins
    // On doit d'abord trouver les UID des super admins restants
    const newAdminMap = {};

    for (const email of SUPER_ADMIN_EMAILS) {
        try {
            const user = await auth.getUserByEmail(email);
            newAdminMap[user.uid] = {
                uid: user.uid,
                email: user.email,
                name: user.displayName || 'Super Admin',
                photoURL: user.photoURL || null,
                role: 'super_admin',
                status: 'active',
                addedAt: admin.firestore.FieldValue.serverTimestamp()
            };
            console.log(`👑 Admin restauré : ${email} (UID: ${user.uid})`);

            // On s'assure qu'ils ont bien le claim admin
            await auth.setCustomUserClaims(user.uid, { admin: true });

        } catch (e) {
            console.warn(`⚠️ Compte Super Admin non trouvé dans Auth : ${email} (Ignoré)`);
        }
    }

    await adminDocRef.set({ users: newAdminMap });
    console.log("✅ Firestore Admin Whitelist réinitialisée.");

    console.log("\n✨ NETTOYAGE TERMINÉ AVEC SUCCÈS ! ✨");
    process.exit(0);
}

cleanSlate().catch(console.error);
