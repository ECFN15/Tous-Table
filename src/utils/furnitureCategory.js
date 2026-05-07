import { LEGACY_FURNITURE_CATEGORY_BY_ID } from '../data/legacyFurnitureCategories';

const normalizeText = (value = '') =>
  String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export const getFurnitureCategory = (item) => {
  if (item?.category) return item.category;
  if (item?.id && LEGACY_FURNITURE_CATEGORY_BY_ID[item.id]) {
    return LEGACY_FURNITURE_CATEGORY_BY_ID[item.id];
  }

  const name = normalizeText(item?.name || '');

  if (/vestiaire|porte[\s-]?manteaux|penderie/.test(name)) return 'armoire';
  if (/desserte/.test(name)) return 'buffet';
  if (/meuble[\s-]?de[\s-]?metier/.test(name)) return 'buffet';

  if (/buffet|bahut/.test(name)) return 'buffet';
  if (/commode|chevet|secretaire|semainier/.test(name)) return 'commode';
  if (/armoire/.test(name)) return 'armoire';
  if (/chaise|fauteuil|banc|tabouret/.test(name)) return 'chaise';

  if (/credence|vitrine|miroir|console|coffre|etagere|horloge|paravent|servante|meuble[\s-]?a[\s-]?colonne/.test(name)) return 'autre';
  if (/table|bureau|comptoir/.test(name)) return 'table';

  return 'autre';
};
