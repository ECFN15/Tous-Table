import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();

const read = (path) => readFileSync(join(root, path), 'utf8');

const checks = [];

function addCheck(label, passed, detail = '') {
  checks.push({ label, passed, detail });
}

function includesAll(label, content, values) {
  const missing = values.filter((value) => !content.includes(value));
  addCheck(label, missing.length === 0, missing.length ? `missing: ${missing.join(', ')}` : '');
}

function collectFiles(dir, predicate, files = []) {
  if (!existsSync(dir)) return files;
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      collectFiles(path, predicate, files);
    } else if (predicate(path)) {
      files.push(path);
    }
  }
  return files;
}

const seoRoutes = [
  '/',
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

const sitemapRoutes = seoRoutes.filter((route) => route !== '/');

const seoTools = read('functions/src/seo/seoTools.js');
includesAll('sitemap CATEGORY_URLS covers SEO routes', seoTools, sitemapRoutes);
includesAll('shareMeta covers SEO routes', seoTools, seoRoutes);
includesAll('shareMeta has social fallback tags', seoTools, [
  'og:title',
  'og:description',
  'og:image',
  'twitter:card',
  '<link rel="canonical"',
]);

const routeUtils = read('src/utils/seoRoutes.js');
includesAll('client routing covers SEO routes', routeUtils, sitemapRoutes);
includesAll('client routing maps required views', routeUtils, [
  "view: 'about'",
  "view: 'shop'",
  "view: 'delivery'",
  "view: 'gallery'",
]);

const appContent = read('src/App.jsx');
addCheck('App does not emit a competing global canonical', !/<SEO\s*\/>/.test(appContent));

const firebaseConfig = read('firebase.json');
includesAll('hosting redirects canonical duplicate SEO routes', firebaseConfig, [
  '"/index.html"',
  '"/atelier"',
  '"/meubles-anciens/"',
  '"/planches-a-decouper-anciennes/"',
  '"/comptoir/"',
  '"/a-propos/"',
  '"/livraison-meubles-anciens-france/"',
]);

includesAll('production builds clean stale dist assets first', read('package.json'), [
  'node scripts/clean-dist.mjs && vite build',
  'node scripts/clean-dist.mjs && vite build --mode prod',
]);

const seoComponent = read('src/components/shared/SEO.jsx');
includesAll('SEO component emits canonical and JSON-LD', seoComponent, [
  '<link rel="canonical"',
  'name="robots"',
  'application/ld+json',
  'og:title',
  'twitter:card',
]);

includesAll('private transactional pages are noindex', [
  read('src/pages/CheckoutView.jsx'),
  read('src/pages/MyOrdersView.jsx'),
  read('src/pages/LoginView.jsx'),
  read('src/Router.jsx'),
].join('\n'), [
  'robots="noindex,nofollow,noarchive"',
  'url="/checkout"',
  'url="/mes-commandes"',
  'url="/admin"',
]);

includesAll('Comptoir affiliate detail pages stay out of the index', read('src/pages/ShopProductDetail.jsx'), [
  'robots="noindex,follow,max-image-preview:large"',
]);

includesAll('meubles collection has distinct visible SEO intro', read('src/data/categorySeoContent.js'), [
  'Meubles anciens restaures en Normandie',
  'Livraison meubles anciens',
]);

includesAll('root landing and meubles collection have distinct meta copy', [
  read('src/pages/RootLandingView.jsx'),
  read('src/pages/GalleryView.jsx'),
].join('\n'), [
  'title="Meubles anciens à Caen - Showroom à Ifs"',
  'title: \'Meubles Anciens a Vendre\'',
  'url="/"',
]);

includesAll('product deep-link loading does not emit noindex', [
  read('src/App.jsx'),
  read('src/Router.jsx'),
  read('src/designs/architectural/ArchitecturalProductDetail.jsx'),
].join('\n'), [
  'return \'furniture|cutting_boards|affiliate_products\';',
  'const isProductCatalogResolved = resolvedPublicCollections.furniture && resolvedPublicCollections.cutting_boards;',
  'isCatalogResolving={!isProductCatalogResolved}',
  'if (!item && isCatalogResolving)',
  'title="Meuble ancien"',
]);

const schemaChecks = [
  {
    file: 'src/pages/GalleryView.jsx',
    label: 'marketplace/category schemas',
    tokens: ['CollectionPage', 'BreadcrumbList', 'ItemList', 'Product', 'Offer', 'priceCurrency', 'availability', 'UsedCondition'],
  },
  {
    file: 'src/pages/ShopView.jsx',
    label: 'Comptoir schemas',
    tokens: ['CollectionPage', 'BreadcrumbList', 'FAQPage', 'ItemList'],
  },
  {
    file: 'src/pages/DeliveryView.jsx',
    label: 'delivery schemas',
    tokens: ['WebPage', 'BreadcrumbList', 'FAQPage'],
  },
  {
    file: 'src/pages/HomeView.jsx',
    label: 'about/local schemas',
    tokens: ['FurnitureStore', 'LocalBusiness', 'hasOfferCatalog', 'FAQPage', 'BreadcrumbList'],
  },
  {
    file: 'src/pages/RootLandingView.jsx',
    label: 'root landing local SEO schemas',
    tokens: ['WebPage', 'WebSite', 'FurnitureStore', 'LocalBusiness', 'OfferCatalog', 'FAQPage', 'ItemList'],
  },
  {
    file: 'src/designs/architectural/ArchitecturalProductDetail.jsx',
    label: 'product detail schemas',
    tokens: ['Product', 'Offer', 'UsedCondition', 'FurnitureStore', 'BreadcrumbList'],
  },
];

for (const { file, label, tokens } of schemaChecks) {
  includesAll(label, read(file), tokens);
}

const adminAnalytics = read('src/features/admin/AdminAnalytics.jsx');
includesAll('admin analytics labels cover SEO views', adminAnalytics, [
  "home: 'Accueil SEO'",
  "about: 'A propos'",
  "gallery: 'Galerie mobilier'",
  "shop: 'Le Comptoir'",
  "delivery: 'Livraison'",
  "detail: 'Fiche produit'",
  'affiliate_shop_grid',
  'affiliate_shop_tutorial',
  'affiliate_gallery_detail',
]);

const firestoreRules = read('firestore.rules');
includesAll('firestore affiliate click schema is hardened', firestoreRules, [
  'function isValidAffiliateClick()',
  'data.timestamp is timestamp',
  "data.tier in ['essentiel', 'premium', 'expert']",
  "isOptionalString(data, 'sessionId', 120)",
]);

const packageJson = read('package.json');
addCheck('xlsx dependency removed', !/"xlsx"\s*:/.test(packageJson));

const srcFiles = collectFiles(join(root, 'src'), (path) => /\.(js|jsx|ts|tsx)$/i.test(path));
const xlsxUsages = srcFiles
  .map((path) => ({ path, content: readFileSync(path, 'utf8') }))
  .filter(({ content }) => /\bXLSX\b|import\(['"]xlsx['"]\)|\.xlsx\b/i.test(content))
  .map(({ path }) => path.replace(`${root}\\`, '').replaceAll('\\', '/'));
addCheck('no XLSX runtime usage remains in src', xlsxUsages.length === 0, xlsxUsages.join(', '));

const docs = read('SEOlivre.md');
includesAll('SEOlivre contains final audit chapters', docs, [
  'Chapitre 20 - Audit visuel pre-deploy SEO',
  'Chapitre 21 - Audit SEO technique routes schemas sitemap',
  'Chapitre 22 - Preflight deploy securite et dependances',
  'Chapitre 23 - Audit admin data analytics apres roadmap SEO',
  'Chapitre 24 - Gate automatisable roadmap SEO',
]);

const failed = checks.filter((check) => !check.passed);

for (const check of checks) {
  const status = check.passed ? 'OK' : 'FAIL';
  console.log(`${status} ${check.label}${check.detail ? ` (${check.detail})` : ''}`);
}

if (failed.length) {
  console.error(`\nSEO roadmap verification failed: ${failed.length} check(s) failed.`);
  process.exit(1);
}

console.log(`\nSEO roadmap verification OK: ${checks.length} checks passed.`);
