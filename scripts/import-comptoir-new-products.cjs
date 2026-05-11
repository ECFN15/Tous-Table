#!/usr/bin/env node

/**
 * Import new Comptoir affiliate product candidates as draft Firestore documents.
 *
 * Safety model:
 * - Default mode is dry-run.
 * - Default target is sandbox.
 * - Every imported product remains status=draft.
 * - Production writes require --target=prod --apply --i-understand-prod-write.
 * - Existing docs are skipped unless --overwrite is passed.
 */

const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const admin = require('../functions/node_modules/firebase-admin');

const ROOT = process.cwd();
const DATA_PATH = join(ROOT, '_DOCS', 'COMPTOIR_NEW_PRODUCT_CANDIDATES_2026-05.json');
const APP_ID = 'tat-made-in-normandie';
const PROJECTS = {
  sandbox: 'tatmadeinnormandie',
  prod: 'tousatable-client',
};

const args = process.argv.slice(2);
const argSet = new Set(args);
const targetArg = args.find((arg) => arg.startsWith('--target='));
const target = targetArg ? targetArg.split('=')[1] : 'sandbox';
const apply = argSet.has('--apply');
const overwrite = argSet.has('--overwrite');
const prodWriteConfirmed = argSet.has('--i-understand-prod-write');

const allowedArgs = new Set(['--apply', '--overwrite', '--i-understand-prod-write', '--help']);

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
Import new Comptoir products as drafts.

Dry-run sandbox:
  node scripts/import-comptoir-new-products.cjs

Apply to sandbox:
  node scripts/import-comptoir-new-products.cjs --target=sandbox --apply

Overwrite existing sandbox docs:
  node scripts/import-comptoir-new-products.cjs --target=sandbox --apply --overwrite

Production is guarded and requires explicit confirmation:
  node scripts/import-comptoir-new-products.cjs --target=prod --apply --i-understand-prod-write
`);
}

function initFirestore(projectId) {
  const app = admin.initializeApp(
    {
      credential: admin.credential.applicationDefault(),
      projectId,
    },
    `comptoir-new-products-import-${projectId}-${Date.now()}`
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
  if (data.products.length < 30) throw new Error('At least 30 new products are required.');

  const ids = new Set();
  for (const product of data.products) {
    if (!product.candidateId) throw new Error('A product is missing candidateId.');
    if (ids.has(product.candidateId)) throw new Error(`Duplicate candidateId: ${product.candidateId}`);
    ids.add(product.candidateId);
    if (product.status !== 'draft') throw new Error(`${product.candidateId} must stay draft.`);
    if (!product.detailDraft) throw new Error(`${product.candidateId} missing detailDraft.`);
    if (!product.auditMeta?.needsExactAmazonAsin) throw new Error(`${product.candidateId} must require exact Amazon ASIN review.`);
  }
}

function buildDoc(product) {
  return {
    name: product.name,
    brand: product.brand,
    description: product.description,
    category: product.category,
    tier: product.tier,
    price: product.price ?? null,
    affiliateUrl: product.affiliateUrl,
    affiliateProgram: product.affiliateProgram,
    imageUrl: product.imageUrl || '',
    whyWeRecommend: product.whyWeRecommend,
    proTip: product.proTip,
    featured: Boolean(product.featured),
    status: 'draft',
    detailDraft: product.detailDraft,
    auditMeta: {
      ...product.auditMeta,
      detailDataSchemaVersion: 1,
      importedAsDraft: true,
      importedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };
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
  const existing = data.products.filter((product) => existingIds.has(product.candidateId));
  const creatable = data.products.filter((product) => overwrite || !existingIds.has(product.candidateId));

  console.log('=== Tous a Table: Comptoir new products import ===');
  console.log(`Mode: ${apply ? 'APPLY' : 'DRY-RUN'}`);
  console.log(`Target: ${target} (${projectId})`);
  console.log(`Path: artifacts/${APP_ID}/public/data/affiliate_products`);
  console.log(`Products in data: ${data.products.length}`);
  console.log(`Existing docs: ${existing.length}`);
  console.log(`Overwrite existing: ${overwrite ? 'yes' : 'no'}`);
  console.log(`Draft docs to write: ${creatable.length}`);

  if (existing.length && !overwrite) {
    console.log(`Skipped existing docs: ${existing.map((product) => product.candidateId).join(', ')}`);
  }

  const operations = creatable.map((product) => {
    const ref = colRef.doc(product.candidateId);
    const docData = {
      ...buildDoc(product),
      ...(existingIds.has(product.candidateId) ? {} : { createdAt: admin.firestore.FieldValue.serverTimestamp() }),
    };
    return {
      db,
      productId: product.candidateId,
      apply: (batch) => batch.set(ref, docData, { merge: overwrite }),
    };
  });

  if (!apply) {
    console.log(`Dry-run complete. Would write ${operations.length} draft documents.`);
    return;
  }

  const committed = await commitInChunks(operations);
  console.log(`Import complete. Wrote ${committed} draft documents.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
