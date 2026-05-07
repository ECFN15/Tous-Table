export const SITE_URL = 'https://tousatable-madeinnormandie.fr';

export const FURNITURE_CATEGORY_ROUTES = {
  all: {
    path: '/meubles-anciens',
    label: 'Meubles anciens',
  },
  buffet: {
    path: '/meubles-anciens/buffets',
    label: 'Buffets anciens',
  },
  table: {
    path: '/meubles-anciens/tables-de-ferme',
    label: 'Tables de ferme',
  },
  chaise: {
    path: '/meubles-anciens/chaises-bancs',
    label: 'Chaises et bancs',
  },
  armoire: {
    path: '/meubles-anciens/armoires',
    label: 'Armoires anciennes',
  },
  commode: {
    path: '/meubles-anciens/commodes-chevets',
    label: 'Commodes et chevets',
  },
  autre: {
    path: '/meubles-anciens/autres',
    label: 'Autres meubles anciens',
  },
};

export const PATH_TO_FURNITURE_CATEGORY = Object.fromEntries(
  Object.entries(FURNITURE_CATEGORY_ROUTES).map(([id, route]) => [route.path, id])
);

export const slugify = (value = '') => String(value)
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, 80) || 'produit';

export const getFurnitureCategoryPath = (category = 'all') =>
  FURNITURE_CATEGORY_ROUTES[category]?.path || FURNITURE_CATEGORY_ROUTES.all.path;

export const getProductPath = (item) => {
  if (!item?.id) return '/meubles-anciens';
  return `/produit/${slugify(item.name)}-${item.id}`;
};

export const getProductIdFromPath = (pathname = '') => {
  const match = String(pathname).match(/^\/produit\/(.+)$/);
  if (!match) return null;
  const parts = match[1].split('-');
  return parts[parts.length - 1] || null;
};

export const replaceUrl = (path) => {
  if (typeof window === 'undefined') return;
  if (`${window.location.pathname}${window.location.search}${window.location.hash}` === path) return;
  window.history.replaceState({}, document.title, path);
};

export const pushUrl = (path, state = {}) => {
  if (typeof window === 'undefined') return;
  if (`${window.location.pathname}${window.location.search}${window.location.hash}` === path) return;
  window.history.pushState(state, '', path);
};

export const getRouteFromLocation = (location = window.location) => {
  const pathname = location.pathname.replace(/\/+$/, '') || '/';
  const params = new URLSearchParams(location.search);
  const hash = location.hash.replace('#', '');

  if (pathname === '/admin' || params.get('admin') === 'true' || hash === 'admin') {
    return { view: 'login', adminGate: true };
  }

  const productId = params.get('product') || getProductIdFromPath(pathname);
  if (productId) return { view: 'detail', productId };

  if (pathname === '/a-propos' || pathname === '/atelier' || hash === 'home') {
    return { view: 'about' };
  }

  if (pathname === '/comptoir' || params.get('page') === 'shop' || hash === 'shop') {
    return { view: 'shop' };
  }

  if (pathname === '/livraison-meubles-anciens-france') {
    return { view: 'delivery' };
  }

  if (pathname === '/planches-a-decouper-anciennes') {
    return {
      view: 'gallery',
      galleryState: { activeCollection: 'cutting_boards', filter: 'fixed', activeCategory: 'all' },
    };
  }

  if (pathname === '/' || pathname === '/meubles-anciens' || params.get('page') === 'gallery' || hash === 'gallery') {
    return {
      view: 'gallery',
      galleryState: { activeCollection: 'furniture', filter: 'fixed', activeCategory: 'all' },
    };
  }

  if (PATH_TO_FURNITURE_CATEGORY[pathname]) {
    return {
      view: 'gallery',
      galleryState: {
        activeCollection: 'furniture',
        filter: 'fixed',
        activeCategory: PATH_TO_FURNITURE_CATEGORY[pathname],
      },
    };
  }

  if (pathname === '/checkout') return { view: 'checkout' };
  if (pathname === '/mes-commandes') return { view: 'my-orders' };

  return {
    view: 'gallery',
    galleryState: { activeCollection: 'furniture', filter: 'fixed', activeCategory: 'all' },
  };
};
