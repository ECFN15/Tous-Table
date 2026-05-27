const DEFAULT_BASE_URL = 'https://tousatable-madeinnormandie.fr';
const DEFAULT_PROJECT = 'tousatable-client';
const DEFAULT_REGION = 'us-central1';

const requiredRoutes = [
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

function argValue(name, fallback) {
  const prefix = `--${name}=`;
  const found = process.argv.find((arg) => arg.startsWith(prefix));
  return found ? found.slice(prefix.length) : fallback;
}

const baseUrl = argValue('base', DEFAULT_BASE_URL).replace(/\/+$/, '');
const project = argValue('project', DEFAULT_PROJECT);
const region = argValue('region', DEFAULT_REGION);
const functionBase = argValue('function-base', `https://${region}-${project}.cloudfunctions.net`);

const checks = [];

function addCheck(label, passed, detail = '') {
  checks.push({ label, passed, detail });
}

async function fetchText(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Number(options.timeoutMs || 15000));
  try {
    const response = await fetch(url, {
      redirect: 'follow',
      headers: options.headers || {},
      signal: controller.signal,
    });
    const text = await response.text();
    return {
      ok: response.ok,
      status: response.status,
      contentType: response.headers.get('content-type') || '',
      text,
    };
  } finally {
    clearTimeout(timeout);
  }
}

function extractLocs(xml) {
  return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1].trim());
}

function extractTag(html, pattern) {
  return html.match(pattern)?.[1]?.trim() || '';
}

async function main() {
  console.log(`Public SEO audit base: ${baseUrl}`);

  const robots = await fetchText(`${baseUrl}/robots.txt`);
  addCheck('robots.txt HTTP 200', robots.status === 200, `status=${robots.status}`);
  addCheck(
    'robots.txt points to sitemap',
    robots.text.includes(`Sitemap: ${baseUrl}/sitemap.xml`),
    robots.text.split(/\r?\n/).filter(Boolean).join(' | '),
  );

  const sitemap = await fetchText(`${baseUrl}/sitemap.xml`);
  addCheck('sitemap.xml HTTP 200', sitemap.status === 200, `status=${sitemap.status}`);
  addCheck('sitemap.xml content-type XML', /xml/i.test(sitemap.contentType), sitemap.contentType);

  const locs = extractLocs(sitemap.text);
  const requiredUrls = requiredRoutes.map((route) => `${baseUrl}${route === '/' ? '/' : route}`);
  const missingRequired = requiredUrls.filter((url) => !locs.includes(url));
  const queryUrls = locs.filter((url) => url.includes('?'));
  const productPathUrls = locs.filter((url) => url.includes('/produit/'));

  addCheck('sitemap has URLs', locs.length > 0, `loc_count=${locs.length}`);
  addCheck(
    'sitemap contains required clean routes',
    missingRequired.length === 0,
    missingRequired.length ? `missing=${missingRequired.join(', ')}` : `required=${requiredUrls.length}`,
  );
  addCheck(
    'sitemap no query-string legacy URLs',
    queryUrls.length === 0,
    queryUrls.length ? `query_url_count=${queryUrls.length}; first=${queryUrls[0]}` : '',
  );
  addCheck(
    'sitemap product URLs use /produit/',
    productPathUrls.length > 0,
    `product_path_url_count=${productPathUrls.length}`,
  );

  for (const route of requiredRoutes) {
    const url = `${baseUrl}${route === '/' ? '/' : route}`;
    const response = await fetchText(url, {
      headers: {
        'user-agent': 'Googlebot/2.1 (+http://www.google.com/bot.html)',
      },
    });
    addCheck(`route HTTP 200 ${route}`, response.status === 200, `status=${response.status}`);
  }

  const shareChecks = [
    ['/meubles-anciens', 'Meubles anciens restaurés'],
    ['/comptoir', 'Le Comptoir'],
    ['/livraison-meubles-anciens-france', 'Livraison meubles anciens France'],
    ['/a-propos', 'Atelier de restauration'],
  ];

  for (const [route, expectedTitlePart] of shareChecks) {
    const url = `${functionBase}/shareMeta?path=${encodeURIComponent(route)}`;
    const response = await fetchText(url);
    const title = extractTag(response.text, /<title>(.*?)<\/title>/);
    const canonical = extractTag(response.text, /<link rel="canonical" href="([^"]+)"/);
    addCheck(`shareMeta HTTP 200 ${route}`, response.status === 200, `status=${response.status}`);
    addCheck(
      `shareMeta title ${route}`,
      title.includes(expectedTitlePart),
      `title=${title || '(empty)'}`,
    );
    addCheck(
      `shareMeta canonical ${route}`,
      canonical === `${baseUrl}${route}`,
      `canonical=${canonical || '(empty)'}`,
    );
  }

  const failed = checks.filter((check) => !check.passed);

  for (const check of checks) {
    const status = check.passed ? 'OK' : 'FAIL';
    console.log(`${status} ${check.label}${check.detail ? ` (${check.detail})` : ''}`);
  }

  console.log(`\nSitemap summary: loc_count=${locs.length}, query_url_count=${queryUrls.length}, product_path_url_count=${productPathUrls.length}`);

  if (failed.length) {
    console.error(`\nPublic SEO audit failed: ${failed.length} check(s) failed.`);
    process.exit(1);
  }

  console.log(`\nPublic SEO audit OK: ${checks.length} checks passed.`);
}

main().catch((error) => {
  console.error(error?.stack || error?.message || error);
  process.exit(1);
});
