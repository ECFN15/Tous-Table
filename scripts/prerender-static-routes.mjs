/**
 * SEO SSG léger post-build : génère dist/<route>/index.html pour les routes
 * publiques stables, avec head injecté (title, meta description, canonical,
 * Open Graph, Twitter Card), JSON-LD CollectionPage/BreadcrumbList et bloc
 * HTML sémantique crawlable dans #root (remplacé par React au mount).
 *
 * Firebase Hosting sert ces fichiers statiques AVANT la rewrite "**" :
 * zéro Function, zéro latence, zéro coût — les robots lisent les bonnes
 * métadonnées au premier octet (first-wave indexing).
 *
 * Source de vérité des métadonnées : functions/src/seo/routeMeta.js
 * Logique d'injection partagée : functions/src/seo/htmlInject.js
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { createRequire } from 'node:module';
import { CATEGORY_SEO_CONTENT, BOARD_SEO_CONTENT } from '../src/data/categorySeoContent.js';

const require = createRequire(import.meta.url);
const { SITE_NAME, ROUTE_SHARE_META } = require('../functions/src/seo/routeMeta.js');
const { injectHead, injectRootContent, escapeHtml } = require('../functions/src/seo/htmlInject.js');

const root = process.cwd();
const SITE_URL = 'https://tousatable-madeinnormandie.fr';
const distIndex = join(root, 'dist', 'index.html');

if (!existsSync(distIndex)) {
    console.error('prerender: dist/index.html introuvable. Lancer vite build d\'abord.');
    process.exit(1);
}

const template = readFileSync(distIndex, 'utf8');

// Mapping route -> contenu éditorial visible (categorySeoContent.js)
const ROUTE_CONTENT = {
    '/meubles-anciens': CATEGORY_SEO_CONTENT.all,
    '/meubles-anciens/buffets': CATEGORY_SEO_CONTENT.buffet,
    '/meubles-anciens/tables-de-ferme': CATEGORY_SEO_CONTENT.table,
    '/meubles-anciens/armoires': CATEGORY_SEO_CONTENT.armoire,
    '/meubles-anciens/commodes-chevets': CATEGORY_SEO_CONTENT.commode,
    '/meubles-anciens/chaises-bancs': CATEGORY_SEO_CONTENT.chaise,
    '/meubles-anciens/autres': CATEGORY_SEO_CONTENT.autre,
    '/planches-a-decouper-anciennes': BOARD_SEO_CONTENT,
};

function routeLabel(route) {
    return ROUTE_SHARE_META[route]?.title || SITE_NAME;
}

function buildBreadcrumbJsonLd(route) {
    const items = [{ '@type': 'ListItem', position: 1, name: 'Accueil', item: `${SITE_URL}/` }];
    if (route.startsWith('/meubles-anciens/')) {
        items.push({ '@type': 'ListItem', position: 2, name: 'Meubles anciens', item: `${SITE_URL}/meubles-anciens` });
        items.push({ '@type': 'ListItem', position: 3, name: routeLabel(route), item: `${SITE_URL}${route}` });
    } else if (route !== '/') {
        items.push({ '@type': 'ListItem', position: 2, name: routeLabel(route), item: `${SITE_URL}${route}` });
    }
    return { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items };
}

function buildCollectionJsonLd(route, meta) {
    return {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        '@id': `${SITE_URL}${route}#collection`,
        name: meta.title,
        description: meta.desc,
        url: `${SITE_URL}${route}`,
        isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: `${SITE_URL}/` },
    };
}

function buildRootHtml(route, meta) {
    const content = ROUTE_CONTENT[route];
    const h1 = content?.title || meta.title;
    const body = content?.body || meta.desc;
    const links = (content?.links || []).map(
        (link) => `<li><a href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a></li>`
    ).join('');
    return [
        '<main>',
        `<h1>${escapeHtml(h1)}</h1>`,
        `<p>${escapeHtml(body)}</p>`,
        links ? `<nav aria-label="Pages associ\u00E9es"><ul>${links}</ul></nav>` : '',
        '</main>',
    ].filter(Boolean).join('');
}

let written = 0;
for (const [route, meta] of Object.entries(ROUTE_SHARE_META)) {
    const isCollection = route in ROUTE_CONTENT || route === '/comptoir';
    const jsonLd = [buildBreadcrumbJsonLd(route)];
    if (isCollection) jsonLd.push(buildCollectionJsonLd(route, meta));

    let html = injectHead(template, {
        title: route === '/' ? meta.title : `${meta.title} | ${SITE_NAME}`,
        description: meta.desc,
        canonicalUrl: route === '/' ? `${SITE_URL}/` : `${SITE_URL}${route}`,
        ogType: 'website',
        jsonLd,
    });
    html = injectRootContent(html, buildRootHtml(route, meta));

    const outPath = route === '/'
        ? distIndex
        : join(root, 'dist', ...route.split('/').filter(Boolean), 'index.html');
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, html, 'utf8');
    written += 1;
    console.log(`prerender OK ${route} -> ${outPath.replace(root, '').replaceAll('\\', '/')}`);
}

console.log(`\nprerender: ${written} routes statiques générées avec head + JSON-LD + bloc sémantique.`);
