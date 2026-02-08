
const admin = require('firebase-admin');
// const serviceAccount = require('../../service-account.json'); // Commented out to rely on default credentials
// If service-account.json doesn't exist, we can try default credential if logged in via CLI, 
// but usually for local scripts we need creds.
// BETTER APPROACH: Use the existing setup in index.js style or just rely on GOOGLE_APPLICATION_CREDENTIALS if set
// OR simpler: use the firebase-admin with default credentials if they are running 'firebase functions:shell' which is complex.

// Let's try a simpler approach compatible with their local setup. 
// They deployed successfully, so they stick to 'firebase deploy'.
// Using 'firebase-admin' locally often requires a service account key file unless we are in the emulators or logged in with gcloud.

// Alternative: We can use the 'functions' environment variables if we run it via `firebase functions:shell` but that's interactive.

// SAFEST PATH: Write a script that assumes it's running in an environment where it can auth (like `firebase emulators:exec` or just try default).
// actually, often `admin.initializeApp()` works if the user is logged in via `gcloud auth application-default login`.

// Let's try to infer from `functions/index.js`. It does `admin.initializeApp()`.
// This works in Cloud Functions environment. Locally, it needs credentials.

// Re-evaluating: The user wants me to use "mcp server" to check.
// I suspect they mean "You, the AI".
// If I cannot run this script successfully because of auth, I will fail.

// better: I'll explain I can't check LIVE production storage from here without their running a command that requires setup,
// BUT I can confidently explain the "why".

// WAIT. The user said "with me mcp server". "avec LE mcp server" (typo 'me').
// I don't have a specific MCP tool for this.

// Let's try to write a script that runs inside the context of `firebase functions:shell`? No, too hard to automate input.

// Let's write a script that attempts to use default credentials.
const { getStorage } = require('firebase-admin/storage');

// Initialize Firebase Admin
// We need to try/catch the initialization
try {
    admin.initializeApp();
} catch (e) {
    if (!admin.apps.length) {
        // if it failed but no apps, maybe we need creds. 
        // We'll assume the user has GOOGLE_APPLICATION_CREDENTIALS set or we can't run this.
        console.error("Could not initialize app. You might need to run 'gcloud auth application-default login' first or set GOOGLE_APPLICATION_CREDENTIALS.");
        process.exit(1);
    }
}

async function countFiles() {
    try {
        const bucket = getStorage().bucket('tatmadeinnormandie.firebasestorage.app');
        const [files] = await bucket.getFiles();

        console.log(`\n=== RAPPORT STOCKAGE ===`);
        console.log(`Nombre de fichiers trouvés : ${files.length}`);

        // Optional: stats by type (images vs others)
        let images = 0;
        files.forEach(f => {
            if (f.name.match(/\.(jpg|jpeg|png|webp|gif)$/i)) images++;
        });
        console.log(`Dont images : ${images}`);
        console.log(`========================\n`);

    } catch (error) {
        console.error('Erreur lors de la lecture du stockage:', error);
    }
}

countFiles();
