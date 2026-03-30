const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const fs = require('fs');

function extractValue(field) {
    if (field.stringValue !== undefined) return field.stringValue;
    if (field.doubleValue !== undefined) return field.doubleValue;
    if (field.integerValue !== undefined) return parseInt(field.integerValue, 10);
    if (field.booleanValue !== undefined) return field.booleanValue;
    if (field.timestampValue !== undefined) return new Date(field.timestampValue);
    if (field.nullValue !== undefined) return null;
    return undefined;
}

async function fixProdDatabase() {
    try {
        console.log("Initializing App...");
        initializeApp({
            credential: applicationDefault(),
            projectId: 'tousatable-client'
        });

        const db = getFirestore();
        console.log("Reading Sandbox backup JSON...");
        const jsonData = fs.readFileSync('C:/Users/matth/.gemini/antigravity/brain/711f53f6-5144-4a3b-b721-054bed8873e4/.system_generated/steps/343/output.txt', 'utf8');
        
        let parsed;
        try {
            parsed = JSON.parse(jsonData);
        } catch(e) {
            // Find the bounds if there's any prefix/suffix
            const startIndex = jsonData.indexOf('{');
            const endIndex = jsonData.lastIndexOf('}');
            const cleanJson = jsonData.substring(startIndex, endIndex + 1);
            parsed = JSON.parse(cleanJson);
        }

        const documents = parsed.documents;
        console.log(`Found ${documents.length} backup documents to restore missing fields.`);

        let count = 0;
        let batch = db.batch();

        for (const docObj of documents) {
            // Document name: projects/tatmadeinnormandie/databases/(default)/documents/artifacts/tat-made-in-normandie/public/data/affiliate_products/O5uxnoMnD5kew6mkx2Ap
            const nameParts = docObj.name.split('/');
            const docId = nameParts[nameParts.length - 1];

            // Extract fields to restore
            const updatePayload = {};
            for (const [key, valueObj] of Object.entries(docObj.fields)) {
                // Skip the new fields that we explicitly updated in prod to preserve them!
                if (['description', 'experientialDetail', 'name', 'proTip'].includes(key)) {
                    continue; 
                }

                // Restore all other fields like price, category, imageUrl, status, brand, affiliateUrl, ...
                updatePayload[key] = extractValue(valueObj);
            }

            console.log(`Restoring fields for ${docId}:`, Object.keys(updatePayload));
            
            const prodDocRef = db.collection("artifacts").doc("tat-made-in-normandie")
                                 .collection("public").doc("data")
                                 .collection("affiliate_products").doc(docId);
            
            updatePayload.updatedAt = FieldValue.serverTimestamp();
            
            // Set with merge ensures we don't wipe the 4 new properties that are in prod!
            batch.set(prodDocRef, updatePayload, { merge: true });
            
            count++;
            if (count % 10 === 0) {
                console.log(`Committing batch (${count})...`);
                await batch.commit();
                batch = db.batch();
            }
        }

        if (count % 10 !== 0) {
            console.log(`Committing final batch (${count})...`);
            await batch.commit();
        }

        console.log("Successfully restored missing fields!");

    } catch (e) {
        console.error("Error running script:", e);
    }
}

fixProdDatabase();
