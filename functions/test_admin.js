const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');

async function main() {
    try {
        console.log("Initializing app...");
        initializeApp({
            credential: applicationDefault(),
            projectId: 'tousatable-client'
        });

        const db = getFirestore();
        console.log("Connected to db. Testing read...");
        const snap = await db.collection("artifacts").doc("tat-made-in-normandie").collection("public").doc("data").collection("affiliate_products").limit(1).get();
        console.log("Read successful. Doc count:", snap.size);
        if (snap.size > 0) {
            console.log("Sample doc ID:", snap.docs[0].id);
            console.log("Fields:", Object.keys(snap.docs[0].data()));
        }
    } catch (e) {
        console.error("Error:", e);
    }
}

main();
