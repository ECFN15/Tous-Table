import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, image, url, type = 'website', schema }) => {
    const siteTitle = "Tous à Table Made in Normandie";
    const defaultDescription = "Atelier de restauration de mobilier à Ifs (14123). Vente de meubles normands authentiques en chêne : tables de ferme, armoires parisiennes et buffets. Livraison Caen, Deauville, toute la France et pays frontaliers. Tel: 07 77 32 41 78.";
    const defaultImage = "https://firebasestorage.googleapis.com/v0/b/tousatable-client.appspot.com/o/sys_assets%2Fog_cover.jpg?alt=media";
    const siteUrl = "https://tousatable-madeinnormandie.fr";

    const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
    // Ensure canonical & OG URLs are always absolute (PageSpeed SEO requirement)
    const resolvedUrl = url
        ? (url.startsWith('http') ? url : `${siteUrl}${url}`)
        : siteUrl;

    return (
        <Helmet>
            {/* Standard Metadata */}
            <title>{fullTitle}</title>
            <meta name="description" content={description || defaultDescription} />
            <link rel="canonical" href={resolvedUrl} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={resolvedUrl} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description || defaultDescription} />
            <meta property="og:image" content={image || defaultImage} />

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={resolvedUrl} />
            <meta property="twitter:title" content={fullTitle} />
            <meta property="twitter:description" content={description || defaultDescription} />
            <meta property="twitter:image" content={image || defaultImage} />

            {/* Structured Data (JSON-LD) for Rich Results */}
            {schema && (
                <script type="application/ld+json">
                    {JSON.stringify(schema)}
                </script>
            )}
        </Helmet>
    );
};

export default SEO;
