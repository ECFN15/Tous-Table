/**
 * SEO: dynamic sitemap XML + Open Graph share metadata.
 */
const functions = require('firebase-functions/v1');
const admin = require('firebase-admin');
const { APP_ID, PRODUCT_COLLECTIONS, getSiteUrl } = require('../../helpers/config');

const db = admin.firestore();

const SITE_NAME = 'Tous a Table Made in Normandie';
const DEFAULT_SHARE_TITLE = 'Meubles anciens restaures - Tous a Table';
const DEFAULT_SHARE_DESCRIPTION = 'Atelier de restauration de mobilier a Ifs pres de Caen. Meubles anciens restaures, tables de ferme, buffets, armoires, commodes et planches anciennes. Livraison locale, France et pays frontaliers.';
const DEFAULT_SHARE_IMAGE = 'https://firebasestorage.googleapis.com/v0/b/tousatable-client.appspot.com/o/sys_assets%2Fog_cover.jpg?alt=media';

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

const ROUTE_SHARE_META = {
    '/': {
        title: 'Meubles anciens a Caen | Showroom a Ifs',
        desc: 'Showroom local a Ifs pres de Caen : meubles anciens restaures, tables de ferme, buffets, armoires, commodes, planches anciennes et produits d entretien bois.',
    },
    '/meubles-anciens': {
        title: 'Meubles anciens restaures',
        desc: 'Collection de meubles anciens restaures en Normandie : buffets, tables, armoires, commodes, chaises et pieces uniques disponibles a la vente.',
    },
    '/meubles-anciens/buffets': {
        title: 'Buffets anciens restaures',
        desc: 'Buffets anciens en bois massif restaures avec soin : pieces uniques pour salle a manger, cuisine ou interieur de caractere.',
    },
    '/meubles-anciens/tables-de-ferme': {
        title: 'Tables de ferme anciennes',
        desc: 'Tables de ferme anciennes restaurees, bois massif, patines naturelles et livraison possible en France selon le meuble.',
    },
    '/meubles-anciens/armoires': {
        title: 'Armoires anciennes restaurees',
        desc: 'Armoires anciennes restaurees en bois massif, selection de pieces uniques disponibles chez Tous a Table.',
    },
    '/meubles-anciens/commodes-chevets': {
        title: 'Commodes et chevets anciens',
        desc: 'Commodes, chevets et petits meubles anciens restaures pour interieur authentique, atelier Tous a Table en Normandie.',
    },
    '/meubles-anciens/chaises-bancs': {
        title: 'Chaises et bancs anciens',
        desc: 'Chaises anciennes, bancs et assises en bois massif restaures pour accompagner une table de ferme ou une piece ancienne.',
    },
    '/meubles-anciens/autres': {
        title: 'Autres meubles anciens',
        desc: 'Autres meubles anciens restaures : pieces singulieres, mobilier de metier et trouvailles en bois massif.',
    },
    '/planches-a-decouper-anciennes': {
        title: 'Planches a decouper anciennes',
        desc: 'Planches anciennes et pieces en bois massif selectionnees pour la cuisine, la table et la decoration.',
    },
    '/comptoir': {
        title: 'Le Comptoir - Boutique bois et entretien',
        desc: "Produits pour entretenir, proteger et restaurer les meubles en bois massif : huiles, cires, savons doux et accessoires d'atelier.",
    },
    '/a-propos': {
        title: 'Atelier de restauration a Ifs pres de Caen',
        desc: "Decouvrez l'atelier Tous a Table : restauration de meubles anciens en Normandie, selection de pieces uniques et savoir-faire bois massif.",
    },
    '/livraison-meubles-anciens-france': {
        title: 'Livraison meubles anciens France, Caen et Ifs',
        desc: 'Livraison de meubles anciens depuis Ifs pres de Caen : local autour de Caen, Normandie, France et pays frontaliers selon transporteur.',
    },
};

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
