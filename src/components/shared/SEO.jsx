import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, image, url, type = 'website', schema }) => {
    const siteTitle = 'Tous a Table Made in Normandie';
    const defaultDescription = "Atelier de restauration de mobilier a Ifs pres de Caen. Vente de meubles anciens restaures en bois massif : tables de ferme, armoires, buffets, commodes et planches anciennes. Livraison locale, France et pays frontaliers.";
    const defaultImage = 'https://firebasestorage.googleapis.com/v0/b/tousatable-client.appspot.com/o/sys_assets%2Fog_cover.jpg?alt=media';
    const siteUrl = 'https://tousatable-madeinnormandie.fr';

    const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
    const resolvedUrl = url
        ? (url.startsWith('http') ? url : `${siteUrl}${url}`)
        : siteUrl;

    return (
        <Helmet>
            <title>{fullTitle}</title>
            <meta name="description" content={description || defaultDescription} />
            <link rel="canonical" href={resolvedUrl} />

            <meta property="og:type" content={type} />
            <meta property="og:url" content={resolvedUrl} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description || defaultDescription} />
            <meta property="og:image" content={image || defaultImage} />

            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={resolvedUrl} />
            <meta property="twitter:title" content={fullTitle} />
            <meta property="twitter:description" content={description || defaultDescription} />
            <meta property="twitter:image" content={image || defaultImage} />

            {schema && (
                <script type="application/ld+json">
                    {JSON.stringify(schema)}
                </script>
            )}
        </Helmet>
    );
};

export default SEO;
