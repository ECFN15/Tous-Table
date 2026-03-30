const { initializeApp, getApps, applicationDefault } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

async function syncProdToSandbox() {
    try {
        console.log("Initializing Apps...");
        
        const prodApp = initializeApp({
            credential: applicationDefault(),
            projectId: 'tousatable-client'
        }, 'prod');

        const devApp = initializeApp({
            credential: applicationDefault(),
            projectId: 'tatmadeinnormandie'
        }, 'dev');

        const dbProd = getFirestore(prodApp);
        const dbDev = getFirestore(devApp);

        console.log("Fetching Prod data...");
        const snapshot = await dbProd.collection("artifacts").doc("tat-made-in-normandie")
                                     .collection("public").doc("data")
                                     .collection("affiliate_products").get();
        
        console.log(`Found ${snapshot.size} documents in Prod to mirror to Sandbox.`);

        let count = 0;
        let batch = dbDev.batch();

        snapshot.forEach((doc) => {
            const data = doc.data();
            const devDocRef = dbDev.collection("artifacts").doc("tat-made-in-normandie")
                                   .collection("public").doc("data")
                                   .collection("affiliate_products").doc(doc.id);
            
            // Set with overwrite because Prod is the Source of Truth now
            batch.set(devDocRef, data);
            
            count++;
            if (count % 10 === 0) {
                console.log(`Committing batch (${count})...`);
                batch.commit();
                batch = dbDev.batch();
            }
        });

        if (count % 10 !== 0) {
            console.log(`Committing final batch (${count})...`);
            await batch.commit();
        }

        console.log("Successfully cloned Prod hybrid to Sandbox!");

    } catch (e) {
        console.error("Error:", e);
    }
}

syncProdToSandbox();
