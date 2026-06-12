/**
 * SEO: dynamic sitemap XML + Open Graph share metadata.
 */
const functions = require('firebase-functions/v1');
const admin = require('firebase-admin');
const { APP_ID, PRODUCT_COLLECTIONS, getSiteUrl } = require('../../helpers/config');

const { SITE_NAME, DEFAULT_SHARE_TITLE, DEFAULT_SHARE_DESCRIPTION, DEFAULT_SHARE_IMAGE, ROUTE_SHARE_META } = require('./routeMeta');

const db = admin.firestore();

const CATEGORY_URLS = [
    '/meubles-anciens',
    '/meubles-anciens/buffets',
    '/meubles-anciens/tables-de-ferme',
    '/meubles-anciens/armoires',
    '/meubles-anciens/commodes-chevets',
    '/meubles-anciens/chaises-bancs',
    '/meubles-anciens/autres',
    '/planches-a-decouper-anciennes',
    '/comptoir',
    '/a-propos',
    '/livraison-meubles-anciens-france',
];

function slugify(value = '') {
    return String(value)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 80) || 'produit';
}

function getProductPath(item, id) {
    return `/produit/${slugify(item?.name)}-${id}`;
}

function normalizeSharePath(value = '/') {
    let path = String(value || '/').trim();
    try {
        if (path.startsWith('http')) path = new URL(path).pathname;
    } catch (error) {
        path = '/';
    }

    path = path.split('?')[0].split('#')[0];
    if (!path.startsWith('/')) path = `/${path}`;
    path = path.replace(/\/+$/, '') || '/';
    return /^\/[a-z0-9/_-]*$/i.test(path) ? path : '/';
}

function extractProductId(value = '') {
    const safe = String(value || '').replace(/[^a-zA-Z0-9_-]/g, '');
    if (!safe) return '';
    const parts = safe.split('-').filter(Boolean);
    return parts[parts.length - 1] || '';
}

function escapeXml(str) {
    return String(str || '').replace(/[<>&'"]/g, m => ({
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        "'": '&apos;',
        '"': '&quot;',
    }[m]));
}

function escapeHtml(str) {
    return String(str || '').replace(/[&<>"']/g, m => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
    }[m]));
}

exports.sitemap = functions.https.onRequest(async (req, res) => {
    const SITE_URL = getSiteUrl(req.headers.host);
    try {
        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
    <url>
        <loc>${escapeXml(`${SITE_URL}/`)}</loc>
        <changefreq>weekly</changefreq>
        <priority>1.0</priority>
    </url>
`;

        CATEGORY_URLS.forEach((path) => {
            xml += `
    <url>
        <loc>${escapeXml(`${SITE_URL}${path}`)}</loc>
        <changefreq>weekly</changefreq>
        <priority>${path === '/meubles-anciens' ? '0.95' : '0.8'}</priority>
    </url>`;
        });

        for (const colName of PRODUCT_COLLECTIONS) {
            const snap = await db.collection(`artifacts/${APP_ID}/public/data/${colName}`).get();
            snap.forEach(doc => {
                const item = doc.data();
                if (item.status !== 'published') return;
                const lastMod = item.updatedAt?.toDate?.()?.toISOString?.()?.split('T')[0] || new Date().toISOString().split('T')[0];
                const imgTag = item.images?.[0] ? `
        <image:image>
            <image:loc>${escapeXml(item.images[0])}</image:loc>
            <image:title>${escapeXml(item.name)}</image:title>
        </image:image>` : '';

                xml += `
    <url>
        <loc>${escapeXml(`${SITE_URL}${getProductPath(item, doc.id)}`)}</loc>
        <lastmod>${lastMod}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.7</priority>${imgTag}
    </url>`;
            });
        }

        xml += `
</urlset>`;

        res.set('Content-Type', 'text/xml');
        res.set('Cache-Control', 'public, max-age=300, s-maxage=300');
        res.status(200).send(xml);
    } catch (error) {
        console.error('Sitemap Error:', error);
        res.status(500).send('Error generating sitemap');
    }
});

exports.shareMeta = functions.https.onRequest(async (req, res) => {
    const SITE_URL = getSiteUrl(req.headers.host);
    const sharePath = normalizeSharePath(req.query.path || req.query.url || '/');
    const pathProductId = sharePath.startsWith('/produit/') ? extractProductId(sharePath.split('/produit/')[1]) : '';
    const productId = extractProductId(req.query.product || pathProductId);
    const routeMeta = ROUTE_SHARE_META[sharePath] || ROUTE_SHARE_META['/'];

    let title = routeMeta.title || DEFAULT_SHARE_TITLE;
    let desc = routeMeta.desc || DEFAULT_SHARE_DESCRIPTION;
    let img = DEFAULT_SHARE_IMAGE;
    let canonicalPath = productId ? `/produit/${productId}` : sharePath;

    if (productId) {
        try {
            for (const col of PRODUCT_COLLECTIONS) {
                const docSnap = await db.doc(`artifacts/${APP_ID}/public/data/${col}/${productId}`).get();
                if (docSnap.exists) {
                    const data = docSnap.data();
                    title = data.name || title;
                    desc = (data.description || desc).substring(0, 160);
                    img = data.images?.[0] || img;
                    canonicalPath = getProductPath(data, productId);
                    break;
                }
            }
        } catch (error) {
            console.error('Share meta product lookup failed:', error);
        }
    }

    const canonicalUrl = `${SITE_URL}${canonicalPath}`;
    const html = `
    <!doctype html>
    <html lang="fr">
    <head>
        <meta charset="utf-8">
        <title>${escapeHtml(title)}</title>
        <meta name="description" content="${escapeHtml(desc)}">
        <meta property="og:title" content="${escapeHtml(title)}">
        <meta property="og:site_name" content="${escapeHtml(SITE_NAME)}">
        <meta property="og:type" content="${productId ? 'product' : 'website'}">
        <meta property="og:description" content="${escapeHtml(desc)}">
        <meta property="og:image" content="${escapeHtml(img)}">
        <meta property="og:url" content="${escapeHtml(canonicalUrl)}">
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="${escapeHtml(title)}">
        <meta name="twitter:description" content="${escapeHtml(desc)}">
        <meta name="twitter:image" content="${escapeHtml(img)}">
        <link rel="canonical" href="${escapeHtml(canonicalUrl)}">
    </head>
    <body>
        <script>window.location.href = ${JSON.stringify(canonicalPath)};</script>
    </body>
    </html>`;

    res.set('Content-Type', 'text/html');
    res.set('Cache-Control', 'public, max-age=300, s-maxage=300');
    res.status(200).send(html);
});

exports.helpers = { slugify, getProductPath, extractProductId, normalizeSharePath };
