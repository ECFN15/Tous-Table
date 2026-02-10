import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, image, url, type = 'website' }) => {
    const siteTitle = "Tous à Table - Atelier Normand";
    const defaultDescription = "Atelier d'ébénisterie d'art en Normandie. Créations uniques et sur-mesure.";
    const defaultImage = "https://images.unsplash.com/photo-1567016432779-094069958ea5?q=80&w=1200";
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
        </Helmet>
    );
};

export default SEO;
