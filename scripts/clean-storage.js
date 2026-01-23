import admin from 'firebase-admin';
import { readFile } from 'fs/promises';
import path from 'path';

// --- CONFIGURATION ---
const DRY_RUN = false; // Suppression réelle activée !
const SERVICE_ACCOUNT_PATH = './service-account.json';

async function cleanStorage() {
    try {
        const serviceAccount = JSON.parse(
            await readFile(path.join(process.cwd(), SERVICE_ACCOUNT_PATH), 'utf8')
        );

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            storageBucket: "tatmadeinnormandie.firebasestorage.app"
        });

        const db = admin.firestore();
        const bucket = admin.storage().bucket();

        console.log('--- Démarrage du nettoyage ---');
        if (DRY_RUN) console.log('⚠️ MODE TEST (DRY RUN) : Aucune suppression réelle.');

        // 1. Récupérer toutes les URLs d'images utilisées dans Firestore
        const usedImages = new Set();

        // Scan furniture
        console.log('Analyse de la collection furniture...');
        const furnitureSnap = await db.collection('artifacts/tat-made-in-normandie/public/data/furniture').get();
        furnitureSnap.forEach(doc => {
            const data = doc.data();
            if (data.imageUrl) usedImages.add(extractPath(data.imageUrl));
            if (data.images && Array.isArray(data.images)) {
                data.images.forEach(url => usedImages.add(extractPath(url)));
            }
        });

        // Scan cutting_boards
        console.log('Analyse de la collection cutting_boards...');
        const boardsSnap = await db.collection('artifacts/tat-made-in-normandie/public/data/cutting_boards').get();
        boardsSnap.forEach(doc => {
            const data = doc.data();
            if (data.imageUrl) usedImages.add(extractPath(data.imageUrl));
            if (data.images && Array.isArray(data.images)) {
                data.images.forEach(url => usedImages.add(extractPath(url)));
            }
        });

        // Scan homepage
        console.log('Analyse de la homepage...');
        const hpSnap = await db.collection('sys_metadata').doc('homepage_images').get();
        if (hpSnap.exists) {
            const data = hpSnap.data();
            Object.values(data).forEach(url => usedImages.add(extractPath(url)));
        }

        console.log(`Nombre d'images utilisées trouvées : ${usedImages.size}`);

        // 2. Lister tous les fichiers dans le Storage
        console.log('Récupération de la liste des fichiers Storage...');
        const [files] = await bucket.getFiles();

        let deletedCount = 0;
        let savedCount = 0;

        for (const file of files) {
            // Ignorer les dossiers ou les fichiers à la racine si besoin
            if (file.name.endsWith('/')) continue;

            if (!usedImages.has(file.name)) {
                console.log(`[ORPHELIN] ${file.name}`);
                if (!DRY_RUN) {
                    await file.delete();
                    console.log(`  -> Supprimé !`);
                }
                deletedCount++;
            } else {
                savedCount++;
            }
        }

        console.log('\n--- Résultat ---');
        console.log(`Images conservées : ${savedCount}`);
        console.log(`Images ${DRY_RUN ? 'identifiées pour suppression' : 'supprimées'} : ${deletedCount}`);

        if (DRY_RUN && deletedCount > 0) {
            console.log('\nPour supprimer réellement ces fichiers, change DRY_RUN à false dans le script.');
        }

    } catch (error) {
        if (error.code === 'ENOENT') {
            console.error('❌ Erreur : Le fichier service-account.json est introuvable.');
            console.error('Assure-toi de l\'avoir placé à la racine du projet.');
        } else {
            console.error('❌ Une erreur est survenue :', error);
        }
    }
}

// Fonction pour extraire le chemin relatif du Storage depuis une URL de téléchargement Firebase
function extractPath(url) {
    if (!url || typeof url !== 'string') return null;
    // Les URLs Firebase ressemblent à : https://firebasestorage.googleapis.com/v0/b/BUCKET/o/PATH?alt=media...
    try {
        const decodedUrl = decodeURIComponent(url);
        const parts = decodedUrl.split('/o/');
        if (parts.length > 1) {
            return parts[1].split('?')[0];
        }
    } catch (e) {
        return null;
    }
    return null;
}

cleanStorage();
