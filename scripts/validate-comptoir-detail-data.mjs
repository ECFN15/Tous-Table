import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const dataPath = join(root, '_DOCS', 'COMPTOIR_PRODUCT_DETAIL_IMPORT_DATA.json');
const args = new Set(process.argv.slice(2));
const checkLive = args.has('--check-live');

const allowedStatuses = new Set(['ready', 'needs-data-fix', 'needs-source-check']);
const allowedConfidence = new Set(['high', 'medium', 'low']);

function fail(message) {
  console.error(`FAIL ${message}`);
  process.exitCode = 1;
}

function ok(message) {
  console.log(`OK ${message}`);
}

function assertArray(value, label, productId) {
  if (!Array.isArray(value)) {
    fail(`${productId}: ${label} must be an array`);
    return false;
  }
  return true;
}

function validateUrl(value, productId) {
  try {
    const parsed = new URL(value);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      fail(`${productId}: invalid source protocol ${value}`);
    }
  } catch {
    fail(`${productId}: invalid source URL ${value}`);
  }
}

const raw = readFileSync(dataPath, 'utf8');
const data = JSON.parse(raw);

if (data.schemaVersion !== 1) fail('schemaVersion must be 1');
if (!Array.isArray(data.products)) fail('products must be an array');
if (!Array.isArray(data.tutorialFixes)) fail('tutorialFixes must be an array');

const products = data.products || [];
const ids = new Set();
const slugs = new Set();

for (const product of products) {
  const { productId, currentName, detailDraft, auditMeta } = product;

  if (!productId || typeof productId !== 'string') fail('productId missing or invalid');
  if (ids.has(productId)) fail(`duplicate productId ${productId}`);
  ids.add(productId);

  if (!currentName || typeof currentName !== 'string') fail(`${productId}: currentName missing`);
  if (!detailDraft || typeof detailDraft !== 'object') fail(`${productId}: detailDraft missing`);
  if (!auditMeta || typeof auditMeta !== 'object') fail(`${productId}: auditMeta missing`);

  if (!detailDraft) continue;

  if (!detailDraft.slug || typeof detailDraft.slug !== 'string') fail(`${productId}: slug missing`);
  if (slugs.has(detailDraft.slug)) fail(`${productId}: duplicate slug ${detailDraft.slug}`);
  slugs.add(detailDraft.slug);

  if (!allowedStatuses.has(detailDraft.detailStatus)) {
    fail(`${productId}: unknown detailStatus ${detailDraft.detailStatus}`);
  }
  if (!allowedConfidence.has(detailDraft.confidence)) {
    fail(`${productId}: unknown confidence ${detailDraft.confidence}`);
  }

  for (const field of ['useCases', 'strengths', 'atelierTips', 'safetyNotes', 'avoidIf', 'sourceUrls']) {
    assertArray(detailDraft[field], field, productId);
  }

  if (!detailDraft.sourceUrls?.length) fail(`${productId}: at least one source URL is required`);
  for (const url of detailDraft.sourceUrls || []) validateUrl(url, productId);

  if (typeof auditMeta.canImportDetailDraft !== 'boolean') {
    fail(`${productId}: auditMeta.canImportDetailDraft must be boolean`);
  }
  if (typeof auditMeta.needsHumanReviewBeforePublish !== 'boolean') {
    fail(`${productId}: auditMeta.needsHumanReviewBeforePublish must be boolean`);
  }
}

const byStatus = products.reduce((acc, product) => {
  const status = product.detailDraft?.detailStatus || 'missing';
  acc[status] = (acc[status] || 0) + 1;
  return acc;
}, {});

const reviewCount = products.filter((product) => product.auditMeta?.needsHumanReviewBeforePublish).length;

if (process.exitCode) {
  console.error('Comptoir detail data validation failed.');
} else {
  ok(`JSON valid: ${products.length} products`);
  ok(`Unique product ids: ${ids.size}`);
  ok(`Unique slugs: ${slugs.size}`);
  ok(`Status counts: ${JSON.stringify(byStatus)}`);
  ok(`Human review before publish: ${reviewCount}`);
}

if (checkLive && !process.exitCode) {
  const response = await fetch(data.catalogSource);
  if (!response.ok) {
    fail(`live catalog fetch failed: ${response.status}`);
  } else {
    const payload = await response.json();
    const liveProducts = (payload.collections?.affiliate_products || [])
      .filter((product) => product.status === 'published');
    const liveIds = new Set(liveProducts.map((product) => product.id));
    const missingInData = [...liveIds].filter((id) => !ids.has(id));
    const missingLive = [...ids].filter((id) => !liveIds.has(id));

    if (missingInData.length) fail(`live published products missing from data: ${missingInData.join(', ')}`);
    if (missingLive.length) fail(`data products missing from live published catalog: ${missingLive.join(', ')}`);

    if (!missingInData.length && !missingLive.length) {
      ok(`Live catalog match: ${liveProducts.length} published products`);
    }
  }
}
