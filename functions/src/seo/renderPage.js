/**
 * SEO: rendu HTML first-octet des fiches produit (/produit/slug-id).
 * Stratégie "HTML Shell Injection" : on sert le shell SPA (dist/index.html via
 * Hosting) dans lequel on injecte avant envoi le <head> complet (title, meta
 * description, canonical, Open Graph, Twitter Card), le JSON-LD Product/Offer/
 * BreadcrumbList et un bloc HTML sémantique crawlable dans #root.
 * React hydrate par-dessus : même HTML pour robots et humains, zéro cloaking.
 *
 * Coût maîtrisé (cf. AGENTS.md) : 1-2 reads Firestore par produit non caché,
 * réponse cachée sur le CDN Hosting via s-maxage=3600.
 */
const functions = require('firebase-functions/v1');
const admin = require('firebase-admin');
const { APP_ID, PRODUCT_COLLECTIONS, getSiteUrl } = require('../../helpers/config');
const { SITE_NAME, DEFAULT_SHARE_TITLE, DEFAULT_SHARE_DESCRIPTION, DEFAULT_SHARE_IMAGE } = require('./routeMeta');
const { injectHead, injectRootContent, escapeHtml } = require('./htmlInject');
const { helpers } = require('./seoTools');

const db = admin.firestore();

const TEMPLATE_TTL_MS = 10 * 60 * 1000;
let templateCache = { html: null, fetchedAt: 0 };

async function getTemplate(siteUrl) {
    const now = Date.now();
    if (templateCache.html && now - templateCache.fetchedAt < TEMPLATE_TTL_MS) {
        return templateCache.html;
    }
    try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 5000);
        const response = await fetch(`${siteUrl}/`, { signal: controller.signal });
        clearTimeout(timer);
        if (response.ok) {
            const html = await response.text();
            if (html.includes('<div id="root">')) {
                templateCache = { html, fetchedAt: now };
                return html;
            }
        }
    } catch (error) {
        console.error('renderPage template fetch failed:', error.message);
    }
    return templateCache.html;
}

async function findProduct(productId) {
    for (const col of PRODUCT_COLLECTIONS) {
        const snap = await db.doc(`artifacts/${APP_ID}/public/data/${col}/${productId}`).get();
        if (snap.exists) return { data: snap.data(), collection: col };
    }
    return null;
}

function getProductPrice(item) {
    if (!item || item.priceOnRequest) return null;
    const raw = item.currentPrice ?? item.startingPrice ?? item.price;
    const price = Number(raw);
    return Number.isFinite(price) && price > 0 ? price : null;
}

function getProductDescription(item, isBoard) {
    if (item.description && item.description.trim()) {
        return item.description;
    }
    const action = isBoard ? 's\u00E9lectionn\u00E9' : 'restaur\u00E9';
    return `${item.name} ${action} par Tous \u00E0 Table Made in Normandie.`;
}

function buildProductJsonLd({ item, productUrl, siteUrl, categoryName, categoryUrl, isBoard }) {
    const price = getProductPrice(item);
    const isAvailable = !item.sold && Number(item.stock ?? 1) > 0;
    const product = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        '@id': `${productUrl}#product`,
        name: item.name,
        description: String(getProductDescription(item, isBoard)).substring(0, 500),
        image: (item.images || []).slice(0, 3),
        url: productUrl,
        category: categoryName,
        material: item.material || undefined,
        brand: { '@type': 'Brand', name: SITE_NAME },
    };
    if (price) {
        product.offers = {
            '@type': 'Offer',
            '@id': `${productUrl}#offer`,
            url: productUrl,
            priceCurrency: 'EUR',
            price,
            availability: isAvailable ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            itemCondition: 'https://schema.org/UsedCondition',
            seller: { '@type': 'FurnitureStore', name: SITE_NAME, url: siteUrl },
            shippingDetails: {
                '@type': 'OfferShippingDetails',
                shippingRate: {
                    '@type': 'MonetaryAmount',
                    value: isBoard ? 4.90 : 20.00,
                    currency: 'EUR',
                },
                shippingDestination: {
                    '@type': 'DefinedRegion',
                    addressCountry: 'FR',
                },
            },
            hasMerchantReturnPolicy: {
                '@type': 'MerchantReturnPolicy',
                applicableCountry: 'FR',
                returnPolicyCountry: 'FR',
                returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
                merchantReturnDays: 14,
                returnMethod: 'https://schema.org/ReturnByMail',
                returnFees: 'https://schema.org/ReturnFeesCustomerResponsibility',
            },
        };
    }
    const breadcrumb = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Accueil', item: `${siteUrl}/` },
            { '@type': 'ListItem', position: 2, name: categoryName, item: `${siteUrl}${categoryUrl}` },
            { '@type': 'ListItem', position: 3, name: item.name, item: productUrl },
        ],
    };
    return [product, breadcrumb];
}

function buildProductRootHtml({ item, categoryName, categoryUrl }) {
    const price = getProductPrice(item);
    const priceLabel = item.priceOnRequest ? 'Prix sur demande' : (price ? `${price} \u20AC` : '');
    const desc = String(item.description || '').substring(0, 400);
    return [
        '<main>',
        '<nav aria-label="Fil d\'Ariane"><a href="/">Accueil</a> \u203A ',
        `<a href="${escapeHtml(categoryUrl)}">${escapeHtml(categoryName)}</a></nav>`,
        `<h1>${escapeHtml(item.name)}</h1>`,
        priceLabel ? `<p>${escapeHtml(priceLabel)}</p>` : '',
        desc ? `<p>${escapeHtml(desc)}</p>` : '',
        `<p>Meuble ancien restaur\u00E9 dans notre atelier d'Ifs, pr\u00E8s de Caen (Normandie). ` +
        `<a href="/livraison-meubles-anciens-france">Livraison en France</a>.</p>`,
        '</main>',
    ].filter(Boolean).join('');
}

exports.renderPage = functions.https.onRequest(async (req, res) => {
    const siteUrl = getSiteUrl(req.headers.host);
    const path = String(req.path || '/');
    const productId = path.startsWith('/produit/')
        ? helpers.extractProductId(path.split('/produit/')[1])
        : '';

    const template = await getTemplate(siteUrl);

    let found = null;
    if (productId) {
        try {
            found = await findProduct(productId);
        } catch (error) {
            console.error('renderPage product lookup failed:', error);
        }
    }

    // Sans template récupérable : fallback minimal (meta + redirection client)
    if (!template) {
        const title = found?.data?.name || DEFAULT_SHARE_TITLE;
        res.set('Content-Type', 'text/html');
        res.set('Cache-Control', 'public, max-age=60, s-maxage=60');
        res.status(found ? 200 : 404).send(`<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>${escapeHtml(title)}</title></head><body><script>window.location.reload();</script></body></html>`);
        return;
    }

    if (!found || found.data.status !== 'published') {
        const html = injectHead(template, {
            title: DEFAULT_SHARE_TITLE,
            description: DEFAULT_SHARE_DESCRIPTION,
            canonicalUrl: `${siteUrl}/meubles-anciens`,
            image: DEFAULT_SHARE_IMAGE,
            ogType: 'website',
            robots: 'noindex,follow',
        });
        res.set('Content-Type', 'text/html');
        res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
        res.status(404).send(injectRootContent(html, ''));
        return;
    }

    const item = found.data;
    const isBoard = found.collection === 'cutting_boards';
    const categoryName = isBoard ? 'Planches \u00E0 d\u00E9couper anciennes' : 'Meubles anciens';
    const categoryUrl = isBoard ? '/planches-a-decouper-anciennes' : '/meubles-anciens';
    const canonicalPath = helpers.getProductPath(item, productId);
    const productUrl = `${siteUrl}${canonicalPath}`;

    let html = injectHead(template, {
        title: `${item.name} | ${SITE_NAME}`,
        description: String(item.description || DEFAULT_SHARE_DESCRIPTION).substring(0, 160),
        canonicalUrl: productUrl,
        image: item.images?.[0] || DEFAULT_SHARE_IMAGE,
        ogType: 'product',
        jsonLd: buildProductJsonLd({ item, productUrl, siteUrl, categoryName, categoryUrl, isBoard }),
    });
    html = injectRootContent(html, buildProductRootHtml({ item, categoryName, categoryUrl }));

    res.set('Content-Type', 'text/html');
    res.set('Cache-Control', 'public, max-age=300, s-maxage=3600');
    res.status(200).send(html);
});
