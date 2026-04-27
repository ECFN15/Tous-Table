// Script d'audit local : applique le helper getFurnitureCategory sur tous les meubles
// récupérés depuis Firestore REST API et affiche la classification.
// Usage : node _DOCS/AUDITS/_audit_taxonomie.mjs

import { readFileSync } from 'node:fs';

const raw = readFileSync('./_DOCS/AUDITS/_furniture_dump.json', 'utf-8').replace(/^\uFEFF/, '');
const dump = JSON.parse(raw);

const normalizeText = (value = '') =>
    value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const getFurnitureCategory = (item) => {
    if (item?.category) return item.category;
    const name = normalizeText(item?.name || '');
    if (/vestiaire|porte[\s-]?manteaux|penderie/.test(name)) return 'armoire';
    if (/desserte/.test(name)) return 'buffet';
    if (/meuble[\s-]?de[\s-]?metier/.test(name)) return 'buffet';
    if (/buffet|bahut/.test(name)) return 'buffet';
    if (/commode|chevet|secretaire|semainier/.test(name)) return 'commode';
    if (/armoire/.test(name)) return 'armoire';
    if (/chaise|fauteuil|banc|tabouret/.test(name)) return 'chaise';
    if (/credence|vitrine|miroir|console|coffre|etagere|horloge|paravent|servante|meuble[\s-]?a[\s-]?colonne/.test(name)) return 'autre';
    if (/table|bureau|comptoir/.test(name)) return 'table';
    return 'autre';
};

const flatten = (fields) => {
    const out = {};
    for (const [key, value] of Object.entries(fields || {})) {
        if (value.stringValue !== undefined) out[key] = value.stringValue;
        else if (value.integerValue !== undefined) out[key] = Number(value.integerValue);
        else if (value.doubleValue !== undefined) out[key] = value.doubleValue;
        else if (value.booleanValue !== undefined) out[key] = value.booleanValue;
        else if (value.timestampValue !== undefined) out[key] = value.timestampValue;
    }
    return out;
};

const items = (dump.documents || []).map((doc) => ({
    id: doc.name.split('/').pop(),
    ...flatten(doc.fields),
}));

console.log(`\n=== Total meubles en base : ${items.length} ===\n`);

const buckets = { buffet: [], table: [], chaise: [], armoire: [], commode: [], autre: [], '(category-explicite)': [] };
for (const item of items) {
    const cat = getFurnitureCategory(item);
    const tag = item.category ? '(category-explicite)' : cat;
    if (!buckets[tag]) buckets[tag] = [];
    buckets[tag].push({
        id: item.id,
        name: item.name || '(sans nom)',
        category: item.category || null,
        inferred: cat,
    });
}

for (const [tag, list] of Object.entries(buckets)) {
    if (!list.length) continue;
    console.log(`\n--- ${tag.toUpperCase()} (${list.length}) ---`);
    for (const m of list) {
        const note = m.category ? `  [explicite: ${m.category}]` : '';
        console.log(`  • ${m.name}${note}`);
    }
}

// Anomalies potentielles : meubles dont le NOM contient un mot-clé qui suggère qu'ils
// devraient être ailleurs ou qui n'ont pas de regex spécifique.
console.log(`\n=== ANOMALIES POTENTIELLES (mots-clés non couverts) ===\n`);
const suspects = items.filter((item) => {
    if (item.category) return false;
    const haystack = normalizeText(`${item.name || ''} ${item.description || ''}`);
    return /credence|desserte|vitrine|miroir|console|coffre|etagere|horloge|porte[\s-]?manteaux|paravent|bar|servante/.test(haystack);
});
if (suspects.length === 0) {
    console.log('  (aucune)');
} else {
    for (const m of suspects) {
        const haystack = normalizeText(`${m.name || ''} ${m.description || ''}`);
        const matches = [];
        if (/credence/.test(haystack)) matches.push('crédence');
        if (/desserte/.test(haystack)) matches.push('desserte');
        if (/vitrine/.test(haystack)) matches.push('vitrine');
        if (/miroir/.test(haystack)) matches.push('miroir');
        if (/console/.test(haystack)) matches.push('console');
        if (/coffre/.test(haystack)) matches.push('coffre');
        if (/etagere/.test(haystack)) matches.push('étagère');
        if (/horloge/.test(haystack)) matches.push('horloge');
        if (/porte[\s-]?manteaux/.test(haystack)) matches.push('porte-manteau');
        if (/paravent/.test(haystack)) matches.push('paravent');
        if (/\bbar\b/.test(haystack)) matches.push('bar');
        if (/servante/.test(haystack)) matches.push('servante');
        console.log(`  • ${m.name}  →  classé en "${getFurnitureCategory(m)}" (mots détectés : ${matches.join(', ')})`);
    }
}
