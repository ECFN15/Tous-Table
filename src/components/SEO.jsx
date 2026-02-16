import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, image, url, type = 'website', schema }) => {
    const siteTitle = "Atelier Normand — Tous à Table";
    const defaultDescription = "Atelier de restauration de mobilier à Ifs (14123). Vente de meubles normands authentiques en chêne : tables de ferme, armoires parisiennes et buffets. Livraison Caen, Deauville, toute la France et pays frontaliers.";
    const defaultImage = "https://firebasestorage.googleapis.com/v0/b/tousatable-client.appspot.com/o/sys_assets%2Flogo_hammer.png?alt=media";
    const siteUrl = "https://tousatable-madeinnormandie.fr";

    const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;

    return (
        <Helmet>
            {/* Standard Metadata */}
            <title>{fullTitle}</title>
            <meta name="description" content={description || defaultDescription} />
            <link rel="canonical" href={url || siteUrl} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={url || siteUrl} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description || defaultDescription} />
            <meta property="og:image" content={image || defaultImage} />

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={url || siteUrl} />
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
