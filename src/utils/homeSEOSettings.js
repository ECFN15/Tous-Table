import { getFurnitureCategory } from './furnitureCategory';

export const HOME_SEO_SETTINGS_DOC = 'home_seo_settings';
export const HOME_SEO_SETTINGS_CACHE_KEY = 'tat_home_seo_settings';
export const HOME_SEO_SETTINGS_UPDATED_EVENT = 'tat:home-seo-settings-updated';

export const FEATURED_SLOT_COUNT = 4;
export const HOME_SEO_SELECTION_PRESET_VERSION = 2;
export const COMPTOIR_CATEGORY_ORDER = ['huiles', 'cires', 'savons', 'accessoires'];
export const COMPTOIR_SLOT_COUNT = COMPTOIR_CATEGORY_ORDER.length * 2;
export const DEFAULT_FEATURED_FURNITURE_CATEGORIES = ['buffet', 'table', 'commode', 'armoire'];

export const HOME_SEO_DEFAULT_HERO_SLIDES = [
  {
    key: 'mobilier',
    image: '/images/gallery/hero-buffet-parisien-2026-1440.webp',
    desktop: '/images/gallery/hero-buffet-parisien-2026-1440.webp',
    mobile: '/images/gallery/hero-buffet-parisien-2026-mobile-840.webp',
    alt: 'Buffet ancien restauré dans le showroom Tous à Table à Ifs près de Caen',
  },
  {
    key: 'planches',
    image: '/images/gallery/hero-planches-2026-1440.webp',
    desktop: '/images/gallery/hero-planches-2026-1440.webp',
    mobile: '/images/gallery/hero-planches-2026-mobile-outpaint-840.webp',
    alt: 'Planches à découper anciennes en bois massif préparées en Normandie',
  },
];

export const HOME_SEO_DEFAULT_SETTINGS = {
  heroEyebrow: 'Showroom local à Ifs, près de Caen',
  heroTitle: 'Meubles anciens restaurés en Normandie.',
  heroDescription: 'Tables de ferme, buffets, armoires, commodes et pièces uniques en bois massif. Un atelier-showroom à Ifs pour découvrir le mobilier ancien autrement.',
  heroLocationText: 'À Ifs, aux portes de Caen : sélection, préparation et accompagnement pour choisir un meuble ancien durable.',
  heroSlides: HOME_SEO_DEFAULT_HERO_SLIDES,
  featuredEyebrow: 'Meubles en vedette',
  featuredTitle: 'Une premiere porte vers la galerie.',
  featuredFurnitureIds: [],
  comptoirEyebrow: 'Le Comptoir',
  comptoirTitle: 'Entretenir le bois apres le coup de coeur.',
  comptoirDescription: "Huiles, cires, savons, accessoires et gestes simples pour protéger une table ancienne, nourrir un buffet ou prolonger la vie d'une planche en bois massif.",
  comptoirProductIds: [],
};

export const normalizeSlots = (ids, count) => Array.from({ length: count }, (_, index) => ids?.[index] || '');

export const mergeHomeSEOSettings = (data = {}) => ({
  ...HOME_SEO_DEFAULT_SETTINGS,
  ...data,
  heroSlides: Array.isArray(data.heroSlides) && data.heroSlides.length > 0
    ? HOME_SEO_DEFAULT_SETTINGS.heroSlides.map((slide, index) => ({ ...slide, ...(data.heroSlides[index] || {}) }))
    : HOME_SEO_DEFAULT_SETTINGS.heroSlides,
  featuredFurnitureIds: Array.isArray(data.featuredFurnitureIds) ? data.featuredFurnitureIds : [],
  comptoirProductIds: Array.isArray(data.comptoirProductIds) ? data.comptoirProductIds : [],
});

export const getDefaultFeaturedFurnitureIds = (items = []) => {
  const published = items.filter((item) => item.status === 'published' && item.auctionActive !== true && !item.sold);
  const selected = DEFAULT_FEATURED_FURNITURE_CATEGORIES
    .map((category) => published.find((item) => getFurnitureCategory(item) === category))
    .filter(Boolean);
  const selectedIds = new Set(selected.map((item) => item.id));

  return [
    ...selected,
    ...published.filter((item) => !selectedIds.has(item.id)),
  ].slice(0, FEATURED_SLOT_COUNT).map((item) => item.id);
};

export const getDefaultComptoirProductIds = (products = []) => {
  const published = products.filter((product) => product.status === 'published');
  const selected = COMPTOIR_CATEGORY_ORDER.flatMap((category) => (
    published.filter((product) => product.category === category).slice(0, 2)
  ));
  const selectedIds = new Set(selected.map((product) => product.id));

  return [
    ...selected,
    ...published.filter((product) => !selectedIds.has(product.id)),
  ].slice(0, COMPTOIR_SLOT_COUNT).map((product) => product.id);
};

export const applyHomeSEODefaultSelections = (settings = {}, items = [], affiliateProducts = []) => {
  const merged = mergeHomeSEOSettings(settings);
  const usesCurrentPreset = Number(settings?.selectionPresetVersion) === HOME_SEO_SELECTION_PRESET_VERSION;
  const featuredFurnitureIds = usesCurrentPreset && merged.featuredFurnitureIds.length >= FEATURED_SLOT_COUNT
    ? merged.featuredFurnitureIds
    : getDefaultFeaturedFurnitureIds(items);
  const comptoirProductIds = usesCurrentPreset && merged.comptoirProductIds.length >= COMPTOIR_SLOT_COUNT
    ? merged.comptoirProductIds
    : getDefaultComptoirProductIds(affiliateProducts);

  return {
    ...merged,
    featuredFurnitureIds,
    comptoirProductIds,
  };
};
