#!/usr/bin/env node

/**
 * Import Comptoir product detail drafts into Firestore.
 *
 * Safety model:
 * - Default mode is dry-run.
 * - Default target is sandbox.
 * - Production writes require all of:
 *   --target=prod --apply --i-understand-prod-write
 * - Core catalog fixes are never applied unless --apply-core-fixes is passed.
 *
 * Examples:
 *   node scripts/import-comptoir-detail-data.cjs
 *   node scripts/import-comptoir-detail-data.cjs --target=sandbox --apply
 *   node scripts/import-comptoir-detail-data.cjs --target=sandbox --apply --apply-core-fixes
 */

const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const admin = require('../functions/node_modules/firebase-admin');

const args = process.argv.slice(2);
const argSet = new Set(args);

const ROOT = process.cwd();
const DATA_PATH = join(ROOT, '_DOCS', 'COMPTOIR_PRODUCT_DETAIL_IMPORT_DATA.json');
const APP_ID = 'tat-made-in-normandie';
const PROJECTS = {
  sandbox: 'tatmadeinnormandie',
  prod: 'tousatable-client',
};

const apply = argSet.has('--apply');
const applyCoreFixes = argSet.has('--apply-core-fixes');
const prodWriteConfirmed = argSet.has('--i-understand-prod-write');
const targetArg = args.find((arg) => arg.startsWith('--target='));
const target = targetArg ? targetArg.split('=')[1] : 'sandbox';

const allowedArgs = new Set([
  '--apply',
  '--apply-core-fixes',
  '--i-understand-prod-write',
  '--help',
]);

for (const arg of args) {
  if (arg.startsWith('--target=')) continue;
  if (!allowedArgs.has(arg)) {
    console.error(`Unknown argument: ${arg}`);
    printHelp();
    process.exit(1);
  }
}

if (argSet.has('--help')) {
  printHelp();
  process.exit(0);
}

if (!PROJECTS[target]) {
  console.error(`Invalid target "${target}". Use sandbox or prod.`);
  process.exit(1);
}

if (target === 'prod' && apply && !prodWriteConfirmed) {
  console.error('Refusing production write without --i-understand-prod-write.');
  process.exit(1);
}

function printHelp() {
  console.log(`
Import Comptoir detail drafts.

Dry-run sandbox:
  node scripts/import-comptoir-detail-data.cjs

Apply to sandbox:
  node scripts/import-comptoir-detail-data.cjs --target=sandbox --apply

Apply to sandbox including core fixes:
  node scripts/import-comptoir-detail-data.cjs --target=sandbox --apply --apply-core-fixes

Production is guarded and requires explicit confirmation:
  node scripts/import-comptoir-detail-data.cjs --target=prod --apply --i-understand-prod-write
`);
}

function initFirestore(projectId) {
  const app = admin.initializeApp(
    {
      credential: admin.credential.applicationDefault(),
      projectId,
    },
    `comptoir-detail-import-${projectId}-${Date.now()}`
  );
  return admin.firestore(app);
}

function productCollection(db) {
  return db
    .collection('artifacts')
    .doc(APP_ID)
    .collection('public')
    .doc('data')
    .collection('affiliate_products');
}

function validateData(data) {
  if (data.schemaVersion !== 1) throw new Error('schemaVersion must be 1.');
  if (!Array.isArray(data.products)) throw new Error('products must be an array.');

  const ids = new Set();
  for (const product of data.products) {
    if (!product.productId) throw new Error('A product is missing productId.');
    if (ids.has(product.productId)) throw new Error(`Duplicate productId: ${product.productId}`);
    ids.add(product.productId);
    if (!product.detailDraft) throw new Error(`${product.productId} missing detailDraft.`);
    if (!product.auditMeta) throw new Error(`${product.productId} missing auditMeta.`);
  }
}

function buildUpdate(product) {
  const update = {
    detailDraft: product.detailDraft,
    auditMeta: {
      ...product.auditMeta,
      detailDataSchemaVersion: 1,
      detailDataImportedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    proposedCoreFixes: product.proposedCoreFixes || {},
  };

  if (applyCoreFixes && product.proposedCoreFixes) {
    Object.assign(update, product.proposedCoreFixes);
  }

  return update;
}

async function commitInChunks(operations) {
  let batch = null;
  let count = 0;
  let committed = 0;

  for (const operation of operations) {
    if (!batch) batch = operation.db.batch();
    operation.apply(batch);
    count += 1;

    if (count === 450) {
      await batch.commit();
      committed += count;
      batch = null;
      count = 0;
    }
  }

  if (batch && count > 0) {
    await batch.commit();
    committed += count;
  }

  return committed;
}

async function main() {
  const data = JSON.parse(readFileSync(DATA_PATH, 'utf8'));
  validateData(data);

  const projectId = PROJECTS[target];
  const db = initFirestore(projectId);
  const colRef = productCollection(db);
  const snapshot = await colRef.get();
  const existingIds = new Set(snapshot.docs.map((doc) => doc.id));

  const missing = data.products.filter((product) => !existingIds.has(product.productId));
  const ready = data.products.filter((product) => product.detailDraft.detailStatus === 'ready');
  const needsReview = data.products.filter((product) => product.auditMeta.needsHumanReviewBeforePublish);

  console.log('=== Tous a Table: Comptoir detail import ===');
  console.log(`Mode: ${apply ? 'APPLY' : 'DRY-RUN'}`);
  console.log(`Target: ${target} (${projectId})`);
  console.log(`Path: artifacts/${APP_ID}/public/data/affiliate_products`);
  console.log(`Products in data: ${data.products.length}`);
  console.log(`Ready detail drafts: ${ready.length}`);
  console.log(`Needs human review before publish: ${needsReview.length}`);
  console.log(`Apply core fixes: ${applyCoreFixes ? 'yes' : 'no'}`);

  if (missing.length) {
    console.log(`Missing product docs in target: ${missing.map((product) => product.productId).join(', ')}`);
  }

  const operations = data.products
    .filter((product) => existingIds.has(product.productId))
    .map((product) => {
      const ref = colRef.doc(product.productId);
      const update = buildUpdate(product);
      return {
        db,
        apply: (batch) => batch.set(ref, update, { merge: true }),
        productId: product.productId,
      };
    });

  if (!apply) {
    console.log(`Dry-run complete. Would update ${operations.length} documents.`);
    return;
  }

  const committed = await commitInChunks(operations);
  console.log(`Import complete. Updated ${committed} documents.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
