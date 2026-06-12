/**
 * SEO: source unique des métadonnées de partage par route publique.
 * Module de données pur (zéro dépendance) : consommé par les Cloud Functions
 * (seoTools.js, renderPage.js) ET par le script de pré-rendu build-time
 * (scripts/prerender-static-routes.mjs via createRequire).
 */

const SITE_NAME = 'Tous à Table Made in Normandie';
const DEFAULT_SHARE_TITLE = 'Meubles anciens restaurés - Tous à Table';
const DEFAULT_SHARE_DESCRIPTION = 'Atelier de restauration de mobilier à Ifs près de Caen. Meubles anciens restaurés, tables de ferme, buffets, armoires, commodes et planches à découper. Livraison locale, France et pays frontaliers.';
const DEFAULT_SHARE_IMAGE = 'https://firebasestorage.googleapis.com/v0/b/tousatable-client.appspot.com/o/sys_assets%2Fog_cover.jpg?alt=media';

const ROUTE_SHARE_META = {
    '/': {
        title: 'Meubles anciens Made in Normandie | Showroom à Ifs',
        desc: "Showroom local à Ifs près de Caen : meubles anciens restaurés, tables de ferme, buffets, armoires, commodes, planches à découper et produits d'entretien bois.",
    },
    '/meubles-anciens': {
        title: 'Meubles anciens restaurés',
        desc: 'Collection de meubles anciens restaurés en Normandie : buffets, tables, armoires, commodes, chaises et pièces uniques disponibles à la vente.',
    },
    '/meubles-anciens/buffets': {
        title: 'Buffets anciens restaurés',
        desc: 'Buffets anciens en bois massif restaurés avec soin : pièces uniques pour salle à manger, cuisine ou intérieur de caractère.',
    },
    '/meubles-anciens/tables-de-ferme': {
        title: 'Tables de ferme anciennes',
        desc: 'Tables de ferme anciennes restaurées, bois massif, patines naturelles et livraison possible en France selon le meuble.',
    },
    '/meubles-anciens/armoires': {
        title: 'Armoires anciennes restaurées',
        desc: 'Armoires anciennes restaurées en bois massif, sélection de pièces uniques disponibles chez Tous à Table.',
    },
    '/meubles-anciens/commodes-chevets': {
        title: 'Commodes et chevets anciens',
        desc: 'Commodes, chevets et petits meubles anciens restaurés pour intérieur authentique, atelier Tous à Table en Normandie.',
    },
    '/meubles-anciens/chaises-bancs': {
        title: 'Chaises et bancs anciens',
        desc: 'Chaises anciennes, bancs et assises en bois massif restaurés pour accompagner une table de ferme ou une pièce ancienne.',
    },
    '/meubles-anciens/autres': {
        title: 'Autres meubles anciens',
        desc: 'Autres meubles anciens restaurés : pièces singulières, mobilier de métier et trouvailles en bois massif.',
    },
    '/planches-a-decouper-anciennes': {
        title: 'Planches à découper anciennes',
        desc: 'Planches à découper anciennes et pièces en bois massif sélectionnées pour la cuisine, la table et la décoration.',
    },
    '/comptoir': {
        title: 'Le Comptoir - Boutique bois et entretien',
        desc: "Produits pour entretenir, protéger et restaurer les meubles en bois massif : huiles, cires, savons doux et accessoires d'atelier.",
    },
    '/a-propos': {
        title: 'Atelier de restauration à Ifs près de Caen',
        desc: "Découvrez l'atelier Tous à Table : restauration de meubles anciens en Normandie, sélection de pièces uniques et savoir-faire bois massif.",
    },
    '/livraison-meubles-anciens-france': {
        title: 'Livraison meubles anciens France, Caen et Ifs',
        desc: 'Livraison de meubles anciens depuis Ifs près de Caen : local autour de Caen, Normandie, France et pays frontaliers selon transporteur.',
    },
};

module.exports = {
    SITE_NAME,
    DEFAULT_SHARE_TITLE,
    DEFAULT_SHARE_DESCRIPTION,
    DEFAULT_SHARE_IMAGE,
    ROUTE_SHARE_META,
};
