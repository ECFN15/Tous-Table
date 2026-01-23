import admin from 'firebase-admin';
import { readFile } from 'fs/promises';
import path from 'path';

// --- CONFIGURATION ---
const SERVICE_ACCOUNT_PATH = './service-account.json';
const CACHE_CONTROL = 'public, max-age=31536000'; // 1 an

async function updateAllMetadata() {
    try {
        const serviceAccount = JSON.parse(
            await readFile(path.join(process.cwd(), SERVICE_ACCOUNT_PATH), 'utf8')
        );

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            storageBucket: "tatmadeinnormandie.firebasestorage.app"
        });

        const bucket = admin.storage().bucket();

        console.log('--- Démarrage de la mise à jour du cache ---');
        const [files] = await bucket.getFiles();

        console.log(`${files.length} fichiers trouvés.`);

        for (const file of files) {
            if (file.name.endsWith('/')) continue; // Ignorer les dossiers

            // Ne mettre à jour que les images
            const isImage = /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(file.name);
            if (isImage) {
                console.log(`Mise à jour : ${file.name}...`);
                await file.setMetadata({
                    cacheControl: CACHE_CONTROL
                });
            }
        }

        console.log('\n✅ Terminé ! Tous les fichiers existants ont maintenant le cache activé.');

    } catch (error) {
        if (error.code === 'ENOENT') {
            console.error('❌ Erreur : Le fichier service-account.json est introuvable.');
        } else {
            console.error('❌ Une erreur est survenue :', error);
        }
    }
}

updateAllMetadata();
