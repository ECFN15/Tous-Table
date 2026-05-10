import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const require = createRequire(import.meta.url);
const admin = require('../functions/node_modules/firebase-admin');

const projectId = 'tousatable-client';
const appId = 'tat-made-in-normandie';
const collectionPath = ['artifacts', appId, 'public', 'data', 'furniture'];
const mappingUrl = pathToFileURL(path.resolve('src/data/legacyFurnitureCategories.js')).href;

const { LEGACY_FURNITURE_CATEGORY_BY_ID } = await import(mappingUrl);

if (admin.apps.length === 0) {
  admin.initializeApp({ projectId });
}

const db = admin.firestore();
const snap = await db
  .collection(collectionPath[0])
  .doc(collectionPath[1])
  .collection(collectionPath[2])
  .doc(collectionPath[3])
  .collection(collectionPath[4])
  .get();

const prodIds = snap.docs.map((doc) => doc.id).sort();
const mappedIds = Object.keys(LEGACY_FURNITURE_CATEGORY_BY_ID).sort();
const missing = prodIds.filter((id) => !LEGACY_FURNITURE_CATEGORY_BY_ID[id]);
const extra = mappedIds.filter((id) => !prodIds.includes(id));
const invalidCategories = Object.entries(LEGACY_FURNITURE_CATEGORY_BY_ID)
  .filter(([, category]) => !['buffet', 'table', 'chaise', 'armoire', 'commode', 'autre'].includes(category))
  .map(([id, category]) => ({ id, category }));
const counts = mappedIds.reduce((acc, id) => {
  const category = LEGACY_FURNITURE_CATEGORY_BY_ID[id];
  acc[category] = (acc[category] || 0) + 1;
  return acc;
}, {});

const result = {
  projectId,
  appId,
  prodFurnitureCount: prodIds.length,
  mappingCount: mappedIds.length,
  missing,
  extra,
  invalidCategories,
  counts,
};

console.log(JSON.stringify(result, null, 2));

if (missing.length > 0 || extra.length > 0 || invalidCategories.length > 0) {
  process.exit(1);
}
