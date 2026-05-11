import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const DATA_PATH = join(process.cwd(), '_DOCS', 'COMPTOIR_NEW_PRODUCT_CANDIDATES_2026-05.json');
const EXISTING_DATA_PATH = join(process.cwd(), '_DOCS', 'COMPTOIR_PRODUCT_DETAIL_IMPORT_DATA.json');
const REQUIRED_CATEGORIES = new Set(['huiles', 'cires', 'savons', 'accessoires', 'renovation', 'outils']);
const REQUIRED_ARRAY_FIELDS = ['useCases', 'strengths', 'atelierTips', 'safetyNotes', 'avoidIf', 'sourceUrls'];
const AFFILIATE_TAG = 'tousatable-21';

let hasError = false;

function fail(message) {
  hasError = true;
  console.error(`FAIL ${message}`);
}

function ok(message) {
  console.log(`OK ${message}`);
}

function normalize(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function validateUrl(value, label) {
  try {
    const parsed = new URL(value);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      fail(`${label}: invalid URL protocol ${value}`);
    }
    return parsed;
  } catch {
    fail(`${label}: invalid URL ${value}`);
    return null;
  }
}

function assertString(product, key) {
  if (!product[key] || typeof product[key] !== 'string') {
    fail(`${product.candidateId || 'unknown'}: ${key} missing`);
  }
}

const data = JSON.parse(readFileSync(DATA_PATH, 'utf8'));
const existingData = JSON.parse(readFileSync(EXISTING_DATA_PATH, 'utf8'));

if (data.schemaVersion !== 1) fail('schemaVersion must be 1');
if (!Array.isArray(data.products)) fail('products must be an array');
if ((data.products || []).length < 30) fail(`at least 30 products required, got ${(data.products || []).length}`);

const ids = new Set();
const slugs = new Set();
const categories = new Set();
const existingNames = new Set((existingData.products || []).map((product) => normalize(`${product.currentBrand} ${product.currentName}`)));

for (const product of data.products || []) {
  for (const key of ['candidateId', 'name', 'brand', 'category', 'tier', 'affiliateProgram', 'affiliateUrl', 'description', 'whyWeRecommend', 'proTip', 'status']) {
    assertString(product, key);
  }

  if (ids.has(product.candidateId)) fail(`duplicate candidateId ${product.candidateId}`);
  ids.add(product.candidateId);

  categories.add(product.category);
  if (!REQUIRED_CATEGORIES.has(product.category)) fail(`${product.candidateId}: invalid category ${product.category}`);
  if (product.affiliateProgram !== 'amazon') fail(`${product.candidateId}: affiliateProgram must be amazon`);
  if (product.status !== 'draft') fail(`${product.candidateId}: new candidates must stay draft`);

  const affiliateUrl = validateUrl(product.affiliateUrl, `${product.candidateId}.affiliateUrl`);
  if (affiliateUrl) {
    if (!affiliateUrl.hostname.endsWith('amazon.fr')) fail(`${product.candidateId}: affiliateUrl must target amazon.fr`);
    if (affiliateUrl.searchParams.get('tag') !== AFFILIATE_TAG) fail(`${product.candidateId}: missing affiliate tag ${AFFILIATE_TAG}`);
  }

  if (existingNames.has(normalize(`${product.brand} ${product.name}`))) {
    fail(`${product.candidateId}: exact normalized duplicate of existing Comptoir product`);
  }

  const draft = product.detailDraft;
  if (!draft || typeof draft !== 'object') {
    fail(`${product.candidateId}: detailDraft missing`);
    continue;
  }

  for (const key of ['slug', 'shortTitle', 'correctedBrand', 'productType', 'detailStatus', 'confidence', 'detailIntro', 'customerDescription']) {
    if (!draft[key] || typeof draft[key] !== 'string') fail(`${product.candidateId}: detailDraft.${key} missing`);
  }
  if (draft.customerDescription && draft.customerDescription.length < 160) {
    fail(`${product.candidateId}: customerDescription too short (${draft.customerDescription.length})`);
  }
  if (slugs.has(draft.slug)) fail(`duplicate slug ${draft.slug}`);
  slugs.add(draft.slug);

  for (const field of REQUIRED_ARRAY_FIELDS) {
    if (!Array.isArray(draft[field])) {
      fail(`${product.candidateId}: detailDraft.${field} must be an array`);
      continue;
    }
    if (!draft[field].length) fail(`${product.candidateId}: detailDraft.${field} must not be empty`);
  }
  for (const url of draft.sourceUrls || []) {
    validateUrl(url, `${product.candidateId}.sourceUrls`);
  }

  if (!product.auditMeta?.needsHumanReviewBeforePublish) fail(`${product.candidateId}: auditMeta.needsHumanReviewBeforePublish must be true`);
  if (!product.auditMeta?.needsExactAmazonAsin) fail(`${product.candidateId}: auditMeta.needsExactAmazonAsin must be true`);
}

for (const category of REQUIRED_CATEGORIES) {
  if (!categories.has(category)) fail(`missing category ${category}`);
}

const byCategory = [...categories].sort().reduce((acc, category) => {
  acc[category] = data.products.filter((product) => product.category === category).length;
  return acc;
}, {});

if (hasError) {
  console.error('Comptoir new product validation failed.');
  process.exit(1);
}

ok(`JSON valid: ${data.products.length} new products`);
ok(`Unique candidate ids: ${ids.size}`);
ok(`Unique slugs: ${slugs.size}`);
ok(`Category counts: ${JSON.stringify(byCategory)}`);
ok('All candidates are draft Amazon search links with affiliate tag and human review flags');
