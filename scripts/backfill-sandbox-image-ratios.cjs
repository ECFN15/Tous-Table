#!/usr/bin/env node

/**
 * Backfill primary image dimensions in a catalog.
 *
 * Safety model:
 * - Sandbox is the default Firestore target.
 * - Production requires --prod and --confirm-prod-write when --apply is used.
 * - Only furniture and cutting_boards under the public catalog path are updated.
 * - Dry-run by default; writes happen only with --apply.
 *
 * Usage:
 *   node scripts/backfill-sandbox-image-ratios.cjs
 *   node scripts/backfill-sandbox-image-ratios.cjs --apply
 *   node scripts/backfill-sandbox-image-ratios.cjs --prod
 *   node scripts/backfill-sandbox-image-ratios.cjs --prod --apply --confirm-prod-write
 */

const admin = require('../functions/node_modules/firebase-admin');

const SANDBOX_PROJECT_ID = 'tatmadeinnormandie';
const PROD_PROJECT_ID = 'tousatable-client';
const APP_ID = 'tat-made-in-normandie';
const COLLECTION_NAMES = ['furniture', 'cutting_boards'];

const args = new Set(process.argv.slice(2));
const apply = args.has('--apply');
const force = args.has('--force');
const prod = args.has('--prod');
const confirmProdWrite = args.has('--confirm-prod-write');
const TARGET_PROJECT_ID = prod ? PROD_PROJECT_ID : SANDBOX_PROJECT_ID;
const TARGET_LABEL = prod ? 'prod' : 'sandbox';
const allowedArgs = new Set(['--apply', '--force', '--prod', '--confirm-prod-write', '--help']);
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

function printHelp() {
  console.log(`
Backfill primary image dimensions in catalog documents.

Sandbox dry-run:
  node scripts/backfill-sandbox-image-ratios.cjs

Sandbox apply:
  node scripts/backfill-sandbox-image-ratios.cjs --apply

Production dry-run:
  node scripts/backfill-sandbox-image-ratios.cjs --prod

Production apply:
  node scripts/backfill-sandbox-image-ratios.cjs --prod --apply --confirm-prod-write

Recompute documents that already have dimensions:
  node scripts/backfill-sandbox-image-ratios.cjs --apply --force
`);
}

function assertSafety() {
    if (SANDBOX_PROJECT_ID !== 'tatmadeinnormandie') {
        throw new Error(`Unexpected sandbox project: ${SANDBOX_PROJECT_ID}`);
    }
    if (PROD_PROJECT_ID !== 'tousatable-client') {
        throw new Error(`Unexpected prod project: ${PROD_PROJECT_ID}`);
    }
    if (TARGET_PROJECT_ID !== SANDBOX_PROJECT_ID && TARGET_PROJECT_ID !== PROD_PROJECT_ID) {
        throw new Error(`Unexpected target project: ${TARGET_PROJECT_ID}`);
    }
    if (apply && prod && !confirmProdWrite) {
        throw new Error('Production writes require --confirm-prod-write.');
    }

    const allowedCollections = new Set(['furniture', 'cutting_boards']);
  for (const collectionName of COLLECTION_NAMES) {
    if (!allowedCollections.has(collectionName)) {
      throw new Error(`This script is limited to public catalog collections, got: ${collectionName}`);
    }
  }
}

function initFirestore() {
    const app = admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: TARGET_PROJECT_ID,
    });
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

function isValidMetric(metric) {
  const width = Number(metric?.width);
  const height = Number(metric?.height);
  const aspectRatio = Number(metric?.aspectRatio);
  return width > 0 && height > 0 && aspectRatio > 0;
}

function hasPrimaryImageMetrics(data) {
  const width = Number(data?.primaryImageWidth);
  const height = Number(data?.primaryImageHeight);
  const aspectRatio = Number(data?.primaryImageAspectRatio);
  return width > 0 && height > 0 && aspectRatio > 0;
}

function normalizeMetric({ width, height }) {
  return {
    width: Math.round(width),
    height: Math.round(height),
    aspectRatio: Number((height / width).toFixed(4)),
  };
}

function getPrimaryImageUrl(data) {
  if (Array.isArray(data?.images) && data.images[0]) return data.images[0];
  return data?.imageUrl || data?.thumbnailUrl || '';
}

function readUInt24LE(buffer, offset) {
  return buffer[offset] | (buffer[offset + 1] << 8) | (buffer[offset + 2] << 16);
}

function parsePng(buffer) {
  if (buffer.length < 24) return null;
  if (buffer[0] !== 0x89 || buffer.toString('ascii', 1, 4) !== 'PNG') return null;
  return {
    format: 'png',
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

function parseJpeg(buffer) {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) return null;

  let offset = 2;
  while (offset < buffer.length - 9) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    const marker = buffer[offset + 1];
    offset += 2;

    if (marker === 0xd8 || marker === 0xd9) continue;
    if (offset + 2 > buffer.length) return null;

    const length = buffer.readUInt16BE(offset);
    if (length < 2 || offset + length > buffer.length) return null;

    const isStartOfFrame = (
      (marker >= 0xc0 && marker <= 0xc3) ||
      (marker >= 0xc5 && marker <= 0xc7) ||
      (marker >= 0xc9 && marker <= 0xcb) ||
      (marker >= 0xcd && marker <= 0xcf)
    );

    if (isStartOfFrame) {
      return {
        format: 'jpeg',
        height: buffer.readUInt16BE(offset + 3),
        width: buffer.readUInt16BE(offset + 5),
      };
    }

    offset += length;
  }

  return null;
}

function parseWebp(buffer) {
  if (buffer.length < 30) return null;
  if (buffer.toString('ascii', 0, 4) !== 'RIFF' || buffer.toString('ascii', 8, 12) !== 'WEBP') return null;

  const type = buffer.toString('ascii', 12, 16);
  if (type === 'VP8X' && buffer.length >= 30) {
    return {
      format: 'webp',
      width: readUInt24LE(buffer, 24) + 1,
      height: readUInt24LE(buffer, 27) + 1,
    };
  }

  if (type === 'VP8 ' && buffer.length >= 30) {
    return {
      format: 'webp',
      width: buffer.readUInt16LE(26) & 0x3fff,
      height: buffer.readUInt16LE(28) & 0x3fff,
    };
  }

  if (type === 'VP8L' && buffer.length >= 25 && buffer[20] === 0x2f) {
    const bits = buffer.readUInt32LE(21);
    return {
      format: 'webp',
      width: (bits & 0x3fff) + 1,
      height: ((bits >> 14) & 0x3fff) + 1,
    };
  }

  return null;
}

function parseImageDimensions(buffer) {
  const parsed = parsePng(buffer) || parseJpeg(buffer) || parseWebp(buffer);
  if (!parsed?.width || !parsed?.height) return null;
  return parsed;
}

async function fetchImageMetric(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Image fetch failed: HTTP ${response.status}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const dimensions = parseImageDimensions(buffer);
  if (!dimensions) {
    throw new Error('Unsupported or unreadable image dimensions');
  }

  return normalizeMetric(dimensions);
}

async function mapLimit(items, limit, mapper) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await mapper(items[currentIndex], currentIndex);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
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

    console.log(`=== Tous a Table: ${TARGET_LABEL} image ratio backfill ===`);
    console.log(`Mode: ${apply ? `APPLY (writes to ${TARGET_LABEL} only)` : 'DRY-RUN (no writes)'}`);
    console.log(`Project: ${TARGET_PROJECT_ID}`);
  console.log(`Collections: ${COLLECTION_NAMES.join(', ')}`);
  console.log(`Base path: artifacts/${APP_ID}/public/data/{collection}`);
  console.log('');

  const db = initFirestore();
  const operations = [];
  const totals = {
    scanned: 0,
    skippedExisting: 0,
    skippedNoImage: 0,
    planned: 0,
    failed: 0,
  };

  for (const collectionName of COLLECTION_NAMES) {
    const snapshot = await publicCollection(db, collectionName).get();
    const docs = snapshot.docs;
    totals.scanned += docs.length;

    const results = await mapLimit(docs, 6, async (documentSnapshot) => {
      const data = documentSnapshot.data();
      if (!force && hasPrimaryImageMetrics(data)) {
        return { status: 'skippedExisting' };
      }

      const imageUrl = getPrimaryImageUrl(data);
      if (!imageUrl) {
        return { status: 'skippedNoImage' };
      }

      try {
        const metric = await fetchImageMetric(imageUrl);
        const currentDimensions = Array.isArray(data.imageDimensions) ? data.imageDimensions : [];
        const imageCount = Array.isArray(data.images) && data.images.length > 0 ? data.images.length : 1;
        const imageDimensions = Array.from({ length: imageCount }, (_, index) => {
          if (index === 0) return metric;
          return isValidMetric(currentDimensions[index]) ? currentDimensions[index] : null;
        });

        return {
          status: 'planned',
          operation: (batch) => batch.update(documentSnapshot.ref, {
            imageDimensions,
            primaryImageWidth: metric.width,
            primaryImageHeight: metric.height,
            primaryImageAspectRatio: metric.aspectRatio,
            imageRatioSource: `${TARGET_LABEL}-backfill-2026-05-29`,
            imageRatioUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
          }),
        };
      } catch (error) {
        const name = data?.name || documentSnapshot.id;
        return {
          status: 'failed',
          message: `${collectionName}/${documentSnapshot.id} (${name}): ${error.message}`,
        };
      }
    });

    for (const result of results) {
      totals[result.status] = (totals[result.status] || 0) + 1;
      if (result.operation) operations.push(result.operation);
      if (result.message) console.warn(`WARN ${result.message}`);
    }
  }

  totals.planned = operations.length;

  console.log('Summary:');
  console.log(`- scanned: ${totals.scanned}`);
  console.log(`- planned updates: ${totals.planned}`);
  console.log(`- skipped existing: ${totals.skippedExisting}`);
  console.log(`- skipped without image: ${totals.skippedNoImage}`);
  console.log(`- failed: ${totals.failed}`);

  if (apply) {
    const committed = await commitInChunks(db, operations);
    console.log(`Committed writes: ${committed}`);
  } else {
    console.log(`Dry-run only. Re-run with --apply to write ${TARGET_LABEL}.`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
