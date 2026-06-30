/**
 * SEO: injection de métadonnées et de contenu sémantique dans le shell HTML Vite.
 * Module pur (zéro dépendance) partagé entre :
 *  - scripts/prerender-static-routes.mjs (SSG build-time des routes stables)
 *  - functions/src/seo/renderPage.js (rendu dynamique /produit/**)
 * Principe "HTML Shell Injection" : même HTML servi aux robots et aux humains,
 * React hydrate par-dessus -> zéro risque de cloaking.
 */

const SSG_START = '<!--tat-ssg-->';
const SSG_END = '<!--/tat-ssg-->';
const SSG_VISUALLY_HIDDEN_STYLE = [
    'position:absolute!important',
    'width:1px!important',
    'height:1px!important',
    'padding:0!important',
    'margin:-1px!important',
    'overflow:hidden!important',
    'clip:rect(0,0,0,0)!important',
    'clip-path:inset(50%)!important',
    'white-space:nowrap!important',
    'border:0!important',
].join(';');

function escapeHtml(str) {
    return String(str || '').replace(/[&<>"']/g, m => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
    }[m]));
}

/**
 * Remplace/insère les balises SEO critiques dans le <head> du template.
 * meta = { title, description, canonicalUrl, image, ogType, siteName, robots, jsonLd: [objets] }
 */
function injectHead(html, meta) {
    let out = html;
    const title = escapeHtml(meta.title);
    const desc = escapeHtml(meta.description);
    const canonical = escapeHtml(meta.canonicalUrl);
    const image = escapeHtml(meta.image);

    out = out.replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`);
    out = out.replace(/<meta\s+name="description"[\s\S]*?\/>/, `<meta name="description" content="${desc}" />`);
    out = out.replace(/<meta\s+property="og:title"[\s\S]*?\/>/, `<meta property="og:title" content="${title}" />`);
    out = out.replace(/<meta\s+property="og:description"[\s\S]*?\/>/, `<meta property="og:description" content="${desc}" />`);
    out = out.replace(/<meta\s+property="twitter:description"[\s\S]*?\/>/, `<meta property="twitter:description" content="${desc}" />`);
    if (meta.image) {
        out = out.replace(/<meta\s+property="og:image"[\s\S]*?\/>/, `<meta property="og:image" content="${image}" />`);
    }

    // Retire un éventuel canonical/og:url/og:type/twitter:card déjà injecté (idempotence)
    out = out
        .replace(/\s*<link rel="canonical"[^>]*\/?>/g, '')
        .replace(/\s*<meta property="og:url"[^>]*\/>/g, '')
        .replace(/\s*<meta property="og:type"[^>]*\/>/g, '')
        .replace(/\s*<meta name="twitter:card"[^>]*\/>/g, '')
        .replace(/\s*<meta name="twitter:title"[^>]*\/>/g, '')
        .replace(/\s*<meta name="twitter:image"[^>]*\/>/g, '')
        .replace(/\s*<meta name="robots"[^>]*\/>/g, '')
        .replace(/\s*<script type="application\/ld\+json" data-tat-ssg="true">[\s\S]*?<\/script>/g, '');

    const extra = [
        `<link rel="canonical" href="${canonical}" />`,
        `<meta property="og:url" content="${canonical}" />`,
        `<meta property="og:type" content="${escapeHtml(meta.ogType || 'website')}" />`,
        `<meta name="twitter:card" content="summary_large_image" />`,
        `<meta name="twitter:title" content="${title}" />`,
        meta.image ? `<meta name="twitter:image" content="${image}" />` : '',
        meta.robots ? `<meta name="robots" content="${escapeHtml(meta.robots)}" />` : '',
        ...(meta.jsonLd || []).map(obj =>
            `<script type="application/ld+json" data-tat-ssg="true">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`
        ),
    ].filter(Boolean).join('\n  ');

    return out.replace('</head>', `  ${extra}\n</head>`);
}

/**
 * Injecte un bloc HTML sémantique crawlable dans <div id="root">.
 * React (createRoot) remplace ce contenu au mount : les robots lisent le HTML
 * initial, les utilisateurs voient l'app. Le bloc est borné par des marqueurs
 * pour être remplaçable (renderPage) ou retirable proprement.
 */
function injectRootContent(html, innerHtml) {
    const stripped = stripRootContent(html);
    if (!innerHtml) return stripped;
    const hiddenRoot = `<div data-tat-ssg-root="true" style="${SSG_VISUALLY_HIDDEN_STYLE}">${innerHtml}</div>`;
    return stripped.replace(
        /<div id="root">/,
        `<div id="root">${SSG_START}${hiddenRoot}${SSG_END}`
    );
}

function stripRootContent(html) {
    const start = html.indexOf(SSG_START);
    const end = html.indexOf(SSG_END);
    if (start === -1 || end === -1) return html;
    return html.slice(0, start) + html.slice(end + SSG_END.length);
}

module.exports = { injectHead, injectRootContent, stripRootContent, escapeHtml, SSG_START, SSG_END };
