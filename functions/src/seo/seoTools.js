/**
 * SEO: Sitemap XML dynamique + Open Graph Meta
 */
const functions = require('firebase-functions/v1');
const admin = require('firebase-admin');
const { APP_ID, PRODUCT_COLLECTIONS, getSiteUrl } = require('../../helpers/config');

const db = admin.firestore();

// --- SITEMAP XML ---
exports.sitemap = functions.https.onRequest(async (req, res) => {
    const SITE_URL = getSiteUrl();
    try {
        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
    <url>
        <loc>${SITE_URL}/</loc>
        <changefreq>weekly</changefreq>
        <priority>1.0</priority>
    </url>
    <url>
        <loc>${SITE_URL}/?page=gallery</loc>
        <changefreq>daily</changefreq>
        <priority>0.9</priority>
    </url>`;

        for (const colName of PRODUCT_COLLECTIONS) {
            const snap = await db.collection(`artifacts/${APP_ID}/public/data/${colName}`).get();
            snap.forEach(doc => {
                const item = doc.data();
                if (item.status !== 'published') return;
                const lastMod = item.updatedAt?.toDate?.()?.toISOString?.()?.split('T')[0] || new Date().toISOString().split('T')[0];
                const imgTag = item.images?.[0] ? `
        <image:image>
            <image:loc>${item.images[0]}</image:loc>
            <image:title>${(item.name || '').replace(/&/g, '&amp;')}</image:title>
        </image:image>` : '';

                xml += `
    <url>
        <loc>${SITE_URL}/?product=${doc.id}</loc>
        <lastmod>${lastMod}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.7</priority>${imgTag}
    </url>`;
            });
        }

        xml += `
</urlset>`;

        res.set('Content-Type', 'text/xml');
        res.set('Cache-Control', 'public, max-age=3600, s-maxage=86400');
        res.status(200).send(xml);
    } catch (error) {
        console.error("Sitemap Error:", error);
        res.status(500).send("Error generating sitemap");
    }
});

// --- OPEN GRAPH META (Share) ---
function escapeHtml(str) {
    return String(str || '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}

exports.shareMeta = functions.https.onRequest(async (req, res) => {
    const SITE_URL = getSiteUrl();
    const rawProductId = req.query.product || '';
    const productId = rawProductId.replace(/[^a-zA-Z0-9_-]/g, '');

    let title = "Ma Boutique";
    let desc = "Découvrez nos collections";
    let img = `${SITE_URL}/assets/logo.png`;

    if (productId) {
        try {
            // Try all collections
            for (const col of PRODUCT_COLLECTIONS) {
                const docSnap = await db.doc(`artifacts/${APP_ID}/public/data/${col}/${productId}`).get();
                if (docSnap.exists) {
                    const data = docSnap.data();
                    title = data.name || title;
                    desc = (data.description || desc).substring(0, 160);
                    img = data.images?.[0] || img;
                    break;
                }
            }
        } catch (e) { }
    }

    const html = `
    <!doctype html>
    <head>
        <title>${escapeHtml(title)}</title>
        <meta property="og:title" content="${escapeHtml(title)}">
        <meta property="og:description" content="${escapeHtml(desc)}">
        <meta property="og:image" content="${escapeHtml(img)}">
        <meta property="og:url" content="${SITE_URL}/?product=${escapeHtml(productId)}">
        <meta name="twitter:card" content="summary_large_image">
    </head>
    <body>
        <script>window.location.href = '/?product=${escapeHtml(productId)}';</script>
    </body>`;

    res.set('Content-Type', 'text/html');
    res.status(200).send(html);
});
