#!/usr/bin/env node

/**
 * Copy published public catalog documents from production Firestore to sandbox.
 *
 * Safety model:
 * - Production project is used only through read APIs.
 * - Sandbox project is the only write target, and only when --apply is passed.
 * - Only published furniture and cutting board documents are copied by default.
 * - No deletes are performed unless --delete-sandbox-missing is passed with --apply.
 *
 * Usage:
 *   node scripts/sync-prod-to-sandbox.cjs
 *   node scripts/sync-prod-to-sandbox.cjs --apply
 */

const admin = require('../functions/node_modules/firebase-admin');

const SOURCE_PROJECT_ID = 'tousatable-client';
const DESTINATION_PROJECT_ID = 'tatmadeinnormandie';
const APP_ID = 'tat-made-in-normandie';
const COLLECTION_NAMES = ['furniture', 'cutting_boards'];

const args = new Set(process.argv.slice(2));
const apply = args.has('--apply');
const deleteSandboxMissing = args.has('--delete-sandbox-missing');

const allowedArgs = new Set(['--apply', '--delete-sandbox-missing', '--help']);
const unknownArgs = [...args].filter((arg) => !allowedArgs.has(arg));

if (args.has('--help')) {
  printHelp();
  process.exit(0);
}

if (unknownArgs.length > 0) {
  console.error(`Unknown argument(s): ${unknownArgs.join(', ')}`);
  printHelp();
  process.exit(1);
}

if (deleteSandboxMissing && !apply) {
  console.error('--delete-sandbox-missing can only be used with --apply.');
  process.exit(1);
}

function printHelp() {
  console.log(`
Sync published production furniture to sandbox.

Dry-run:
  node scripts/sync-prod-to-sandbox.cjs

Apply writes to sandbox:
  node scripts/sync-prod-to-sandbox.cjs --apply

Apply and delete sandbox furniture docs that are not published in prod:
  node scripts/sync-prod-to-sandbox.cjs --apply --delete-sandbox-missing
`);
}

function assertSafety() {
  if (SOURCE_PROJECT_ID !== 'tousatable-client') {
    throw new Error(`Unexpected SOURCE_PROJECT_ID: ${SOURCE_PROJECT_ID}`);
  }
  if (DESTINATION_PROJECT_ID !== 'tatmadeinnormandie') {
    throw new Error(`Unexpected DESTINATION_PROJECT_ID: ${DESTINATION_PROJECT_ID}`);
  }
  if (SOURCE_PROJECT_ID === DESTINATION_PROJECT_ID) {
    throw new Error('Source and destination projects must be different.');
  }
  const allowedCollections = new Set(['furniture', 'cutting_boards']);
  for (const collectionName of COLLECTION_NAMES) {
    if (!allowedCollections.has(collectionName)) {
      throw new Error(`This script is intentionally limited to public catalog collections, got: ${collectionName}`);
    }
  }
}

function initFirestore(projectId, appName) {
  const app = admin.initializeApp(
    {
      credential: admin.credential.applicationDefault(),
      projectId,
    },
    appName
  );
  return admin.firestore(app);
}

function publicCollection(db, collectionName) {
  return db
    .collection('artifacts')
    .doc(APP_ID)
    .collection('public')
    .doc('data')
    .collection(collectionName);
}

function sanitizeCatalogDoc(data, collectionName) {
  return {
    ...data,
    collectionName,
    syncedFromProduction: true,
    syncedFromProject: SOURCE_PROJECT_ID,
    syncedAt: admin.firestore.FieldValue.serverTimestamp(),
  };
}

async function commitInChunks(db, operations) {
  let batch = db.batch();
  let count = 0;
  let committed = 0;

  for (const operation of operations) {
    operation(batch);
    count += 1;

    if (count === 450) {
      await batch.commit();
      committed += count;
      batch = db.batch();
      count = 0;
    }
  }

  if (count > 0) {
    await batch.commit();
    committed += count;
  }

  return committed;
}

async function main() {
  assertSafety();

  console.log('=== Tous a Table: prod -> sandbox public catalog sync ===');
  console.log(`Mode: ${apply ? 'APPLY (writes to sandbox only)' : 'DRY-RUN (no writes)'}`);
  console.log(`Source prod: ${SOURCE_PROJECT_ID}`);
  console.log(`Destination sandbox: ${DESTINATION_PROJECT_ID}`);
  console.log(`Collections: ${COLLECTION_NAMES.join(', ')}`);
  console.log(`Base path: artifacts/${APP_ID}/public/data/{collection}`);
  console.log('Filter: status == "published"');
  console.log('');

  const sourceDb = initFirestore(SOURCE_PROJECT_ID, 'source-prod-readonly');
  const destinationDb = initFirestore(DESTINATION_PROJECT_ID, 'destination-sandbox-write');

  const syncPlans = [];

  for (const collectionName of COLLECTION_NAMES) {
    const sourceRef = publicCollection(sourceDb, collectionName);
    const destinationRef = publicCollection(destinationDb, collectionName);

    const [sourceSnapshot, destinationSnapshot] = await Promise.all([
      sourceRef.where('status', '==', 'published').get(),
      destinationRef.get(),
    ]);

    const sourceDocs = sourceSnapshot.docs;
    const destinationDocs = destinationSnapshot.docs;
    const sourceIds = new Set(sourceDocs.map((doc) => doc.id));

    const existingDestinationIds = new Set(destinationDocs.map((doc) => doc.id));
    const toCreate = sourceDocs.filter((doc) => !existingDestinationIds.has(doc.id));
    const toOverwrite = sourceDocs.filter((doc) => existingDestinationIds.has(doc.id));
    const toDelete = deleteSandboxMissing
      ? destinationDocs.filter((doc) => !sourceIds.has(doc.id))
      : [];

    syncPlans.push({
      collectionName,
      destinationRef,
      sourceDocs,
      destinationDocs,
      toCreate,
      toOverwrite,
      toDelete,
    });

    console.log(`--- ${collectionName} ---`);
    console.log(`Published prod docs found: ${sourceDocs.length}`);
    console.log(`Existing sandbox docs: ${destinationDocs.length}`);
    console.log(`Would create in sandbox: ${toCreate.length}`);
    console.log(`Would overwrite in sandbox: ${toOverwrite.length}`);
    console.log(`Would delete from sandbox: ${toDelete.length}${deleteSandboxMissing ? '' : ' (disabled)'}`);
    console.log('');

    if (sourceDocs.length > 0) {
      console.log(`Sample prod ${collectionName}:`);
      sourceDocs.slice(0, 8).forEach((doc, index) => {
        const data = doc.data();
        console.log(`  ${index + 1}. ${doc.id} | ${data.name || '(sans nom)'} | ${data.status || '(sans statut)'}`);
      });
      if (sourceDocs.length > 8) console.log(`  ... +${sourceDocs.length - 8} more`);
      console.log('');
    }
  }

  if (!apply) {
    console.log('');
    console.log('Dry-run complete. No production or sandbox data was changed.');
    console.log('Run with --apply to copy these published public catalog docs into sandbox.');
    return;
  }

  const writeOperations = [];

  for (const plan of syncPlans) {
    for (const doc of plan.sourceDocs) {
      const destinationDocRef = plan.destinationRef.doc(doc.id);
      const copiedData = sanitizeCatalogDoc(doc.data(), plan.collectionName);
      writeOperations.push((batch) => batch.set(destinationDocRef, copiedData, { merge: false }));
    }

    for (const doc of plan.toDelete) {
      writeOperations.push((batch) => batch.delete(plan.destinationRef.doc(doc.id)));
    }
  }

  const committed = await commitInChunks(destinationDb, writeOperations);
  console.log('');
  console.log(`Apply complete. Sandbox write operations committed: ${committed}`);
  console.log('Production remained read-only throughout this script.');
}

main().catch((error) => {
  console.error('');
  console.error('Sync failed:');
  console.error(error.message || error);
  console.error('');
  console.error('If this is an authentication error, run:');
  console.error('  gcloud auth application-default login');
  console.error('or provide GOOGLE_APPLICATION_CREDENTIALS for an account allowed to read prod and write sandbox.');
  process.exit(1);
});
