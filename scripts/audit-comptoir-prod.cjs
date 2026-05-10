#!/usr/bin/env node

/**
 * Read-only audit for Comptoir product detail migration.
 *
 * It compares the local import dataset with the target Firestore project and
 * the publicCatalog function. It never writes to Firestore.
 */

const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const admin = require('../functions/node_modules/firebase-admin');

const args = process.argv.slice(2);
const argValue = (name, fallback) => {
  const found = args.find((arg) => arg.startsWith(`--${name}=`));
  return found ? found.slice(name.length + 3) : fallback;
};

const target = argValue('target', 'prod');
const checkImages = args.includes('--check-images');
const requireDetails = args.includes('--require-details');

const APP_ID = 'tat-made-in-normandie';
const PROJECTS = {
  sandbox: 'tatmadeinnormandie',
  prod: 'tousatable-client',
};

if (!PROJECTS[target]) {
  console.error(`FAIL invalid target "${target}". Use sandbox or prod.`);
  process.exit(1);
}

const projectId = PROJECTS[target];
const dataPath = join(process.cwd(), '_DOCS', 'COMPTOIR_PRODUCT_DETAIL_IMPORT_DATA.json');
const data = JSON.parse(readFileSync(dataPath, 'utf8'));
const expectedProducts = data.products || [];
const expectedIds = new Set(expectedProducts.map((product) => product.productId));
const expectedById = new Map(expectedProducts.map((product) => [product.productId, product]));
const publicCatalogUrl = `https://us-central1-${projectId}.cloudfunctions.net/publicCatalog?audit=${Date.now()}`;

function initFirestore() {
  const app = admin.initializeApp(
    {
      credential: admin.credential.applicationDefault(),
      projectId,
    },
    `comptoir-prod-audit-${projectId}-${Date.now()}`
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

function hasImage(product) {
  return Boolean(String(product.imageUrl || '').trim());
}

function hasDetailDraft(product) {
  const draft = product.detailDraft;
  return Boolean(
    draft &&
    typeof draft === 'object' &&
    draft.slug &&
    draft.shortTitle &&
    draft.customerDescription &&
    Array.isArray(draft.useCases) &&
    Array.isArray(draft.strengths) &&
    Array.isArray(draft.atelierTips) &&
    Array.isArray(draft.safetyNotes) &&
    Array.isArray(draft.avoidIf) &&
    Array.isArray(draft.sourceUrls)
  );
}

async function imageStatus(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    let response = await fetch(url, { method: 'HEAD', signal: controller.signal });
    if (response.status === 405 || response.status === 403) {
      response = await fetch(url, { method: 'GET', signal: controller.signal });
    }
    return { ok: response.ok, status: response.status };
  } catch (error) {
    return { ok: false, status: error.name || 'ERROR' };
  } finally {
    clearTimeout(timer);
  }
}

async function main() {
  const db = initFirestore();
  const snap = await productCollection(db).get();
  const docs = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  const published = docs.filter((product) => product.status === 'published');
  const docsById = new Map(docs.map((product) => [product.id, product]));
  const publishedIds = new Set(published.map((product) => product.id));

  const missingDocs = [...expectedIds].filter((id) => !docsById.has(id));
  const missingPublished = [...expectedIds].filter((id) => !publishedIds.has(id));
  const unexpectedPublished = [...publishedIds].filter((id) => !expectedIds.has(id));
  const missingImages = published.filter((product) => expectedIds.has(product.id) && !hasImage(product));
  const missingDetails = published.filter((product) => expectedIds.has(product.id) && !hasDetailDraft(product));
  const localNeedsReview = expectedProducts.filter((product) => product.auditMeta?.needsHumanReviewBeforePublish);

  const mismatchedNames = expectedProducts
    .map((expected) => {
      const current = docsById.get(expected.productId);
      if (!current) return null;
      return current.name === expected.currentName ? null : {
        id: expected.productId,
        prodName: current.name,
        dataName: expected.currentName,
      };
    })
    .filter(Boolean);

  let publicCatalogMismatch = [];
  let publicCatalogMissingImages = [];
  let publicCatalogMissingDetails = [];
  try {
    const response = await fetch(publicCatalogUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const publicCatalog = await response.json();
    const publicProducts = (publicCatalog.collections?.affiliate_products || [])
      .filter((product) => product.status === 'published');
    const publicIds = new Set(publicProducts.map((product) => product.id));
    const publicExpectedProducts = publicProducts.filter((product) => expectedIds.has(product.id));
    publicCatalogMismatch = [
      ...[...expectedIds].filter((id) => !publicIds.has(id)).map((id) => ({ id, issue: 'missing-from-publicCatalog' })),
      ...[...publicIds].filter((id) => !expectedIds.has(id)).map((id) => ({ id, issue: 'unexpected-in-publicCatalog' })),
    ];
    publicCatalogMissingImages = publicExpectedProducts.filter((product) => !hasImage(product));
    publicCatalogMissingDetails = publicExpectedProducts.filter((product) => !hasDetailDraft(product));
  } catch (error) {
    publicCatalogMismatch = [{ id: 'publicCatalog', issue: error.message }];
  }

  const imageChecks = [];
  if (checkImages) {
    for (const product of published.filter((item) => expectedIds.has(item.id) && hasImage(item))) {
      const status = await imageStatus(product.imageUrl);
      if (!status.ok) imageChecks.push({ id: product.id, name: product.name, status: status.status, imageUrl: product.imageUrl });
    }
  }

  const statusCounts = expectedProducts.reduce((acc, product) => {
    const status = product.detailDraft?.detailStatus || 'missing';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  console.log('=== Comptoir prod migration audit ===');
  console.log(`Target: ${target} (${projectId})`);
  console.log(`Collection: artifacts/${APP_ID}/public/data/affiliate_products`);
  console.log(`Firestore docs: ${docs.length}`);
  console.log(`Published docs: ${published.length}`);
  console.log(`Local detail products: ${expectedProducts.length}`);
  console.log(`Local status counts: ${JSON.stringify(statusCounts)}`);
  console.log(`Local human review before publish: ${localNeedsReview.length}`);
  console.log(`Missing product docs: ${missingDocs.length}`);
  console.log(`Missing published expected docs: ${missingPublished.length}`);
  console.log(`Unexpected published docs: ${unexpectedPublished.length}`);
  console.log(`Published expected docs without imageUrl: ${missingImages.length}`);
  console.log(`Published expected docs without complete detailDraft: ${missingDetails.length}`);
  console.log(`Name mismatches vs audit data: ${mismatchedNames.length}`);
  console.log(`publicCatalog mismatches: ${publicCatalogMismatch.length}`);
  console.log(`publicCatalog expected docs without imageUrl: ${publicCatalogMissingImages.length}`);
  console.log(`publicCatalog expected docs without complete detailDraft: ${publicCatalogMissingDetails.length}`);
  if (checkImages) console.log(`Image HTTP check failures: ${imageChecks.length}`);

  const detailReadyCount = published.filter((product) => expectedIds.has(product.id) && hasDetailDraft(product)).length;
  console.log(`Complete detailDraft on published expected docs: ${detailReadyCount}/${expectedProducts.length}`);

  const samples = {
    missingDocs,
    missingPublished,
    unexpectedPublished,
    missingImages: missingImages.map((product) => ({ id: product.id, name: product.name })),
    missingDetails: missingDetails.slice(0, 12).map((product) => ({ id: product.id, name: product.name })),
    mismatchedNames: mismatchedNames.slice(0, 12),
    publicCatalogMismatch: publicCatalogMismatch.slice(0, 12),
    publicCatalogMissingImages: publicCatalogMissingImages.slice(0, 12).map((product) => ({ id: product.id, name: product.name })),
    publicCatalogMissingDetails: publicCatalogMissingDetails.slice(0, 12).map((product) => ({ id: product.id, name: product.name })),
    imageChecks: imageChecks.slice(0, 12),
  };
  console.log(JSON.stringify(samples, null, 2));

  const failures = [
    missingDocs.length,
    missingPublished.length,
    unexpectedPublished.length,
    missingImages.length,
    publicCatalogMismatch.length,
    publicCatalogMissingImages.length,
    publicCatalogMissingDetails.length,
    imageChecks.length,
  ].some(Boolean);

  if (failures) {
    console.error('FAIL audit found blocking product/image/catalog issues.');
    process.exitCode = 1;
  }

  if (requireDetails && missingDetails.length) {
    console.error('FAIL audit requires complete detailDraft on every expected published product.');
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
