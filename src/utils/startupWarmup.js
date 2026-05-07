import {
  isLowPowerMobileDevice,
  isTouchDevice,
  shouldLimitNetworkWarmup as shouldLimitNetworkWarmupForDevice,
} from './devicePerformance';

const FURNITURE_HERO_IMAGES = {
  mobile: [
    '/images/gallery/hero-buffet-parisien-2026-mobile-640.webp',
    '/images/gallery/hero-buffet-parisien-2026-mobile-840.webp',
    '/images/gallery/hero-buffet-parisien-2026-mobile-1122.webp',
  ],
  desktop: [
    '/images/gallery/hero-buffet-parisien-2026-960.webp',
    '/images/gallery/hero-buffet-parisien-2026-1440.webp',
    '/images/gallery/hero-buffet-parisien-2026-2020.webp',
  ],
};

const BOARD_HERO_IMAGES = {
  mobile: [
    '/images/gallery/hero-planches-2026-mobile-outpaint-640.webp',
    '/images/gallery/hero-planches-2026-mobile-outpaint-840.webp',
    '/images/gallery/hero-planches-2026-mobile-outpaint-1122.webp',
  ],
  desktop: [
    '/images/gallery/hero-planches-2026-exact.png',
  ],
};

const CRITICAL_ABOUT_IMAGES = {
  mobile: [
    'https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=720&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1567016432779-094069958ea5?q=80&w=720&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?q=80&w=720&auto=format&fit=crop',
  ],
  desktop: [
    'https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1567016432779-094069958ea5?q=80&w=1200&auto=format&fit=crop',
  ],
};

const STARTUP_PRELOADER_VIEWS = new Set(['home', 'about', 'gallery', 'detail', 'shop', 'shop-detail']);

const decodedImages = new Set();
const imageLoadPromises = new Map();
const imageDecodePromises = new Map();
let galleryChunkWarmup = null;
let shopChunkWarmup = null;
let productDetailChunkWarmup = null;
let shopProductDetailChunkWarmup = null;

const shouldLimitNetworkWarmup = () => shouldLimitNetworkWarmupForDevice();
const wait = (duration) => new Promise((resolve) => setTimeout(resolve, duration));

const waitForPaint = () => new Promise((resolve) => {
  if (typeof requestAnimationFrame !== 'function') {
    setTimeout(resolve, 0);
    return;
  }

  requestAnimationFrame(() => requestAnimationFrame(resolve));
});

const waitForIdle = (timeout = 400) => new Promise((resolve) => {
  if (typeof requestIdleCallback === 'function') {
    requestIdleCallback(resolve, { timeout });
    return;
  }

  setTimeout(resolve, Math.min(timeout, 120));
});

const isStartupPreloaderActive = () => (
  typeof document !== 'undefined' && document.body.classList.contains('tat-startup-preloading')
);

const getWarmupConcurrency = () => {
  if (isStartupPreloaderActive() || shouldLimitNetworkWarmup() || isLowPowerMobileDevice() || isTouchDevice()) {
    return 1;
  }

  return 2;
};

const waitForWarmupSlot = async (index) => {
  if (typeof window === 'undefined') return;

  if (isStartupPreloaderActive()) {
    if (index === 0) await waitForPaint();
    await waitForIdle(isTouchDevice() ? 650 : 420);
    if (index > 0) await wait(isTouchDevice() ? 110 : 60);
    return;
  }

  if (index > 0) {
    await waitForIdle(220);
  }
};

export const shouldShowStartupPreloader = (route = {}) => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  if (window.__tatStartupPreloaderShown) return false;
  if (route.adminGate || ['admin', 'login'].includes(route.view)) return false;
  if (!STARTUP_PRELOADER_VIEWS.has(route.view)) return false;
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return false;

  const params = new URLSearchParams(window.location.search);
  if (params.get('skipPreloader') === '1') return false;

  return true;
};

const unique = (values) => [...new Set(values.filter(Boolean))];

const getCatalogImage = (item) => item?.images?.[0] || item?.imageUrl || item?.thumbnailUrl || '';
const getCatalogImages = (item) => unique([
  ...(Array.isArray(item?.images) ? item.images : []),
  item?.imageUrl,
  item?.thumbnailUrl,
]);

const getAffiliateImage = (product) => (
  product?.imageUrl ||
  product?.thumbnailUrl ||
  product?.images?.[0] ||
  product?.gallery?.[0] ||
  ''
);

const getAffiliateImages = (product) => unique([
  product?.imageUrl,
  product?.thumbnailUrl,
  ...(Array.isArray(product?.images) ? product.images : []),
  ...(Array.isArray(product?.gallery) ? product.gallery : []),
]);

const isPublishedFixedItem = (item) => (
  item &&
  (item.status === undefined || item.status === 'published') &&
  item.auctionActive !== true
);

const selectViewportImages = (sets) => {
  const isDesktop = typeof window !== 'undefined' && window.matchMedia?.('(min-width: 768px)').matches;
  return isDesktop ? sets.desktop : sets.mobile;
};

const getStartupProductLimit = () => {
  if (shouldLimitNetworkWarmup() || isLowPowerMobileDevice()) return 3;
  if (isTouchDevice()) return 5;
  return 8;
};

const getIntentProductLimit = () => {
  if (shouldLimitNetworkWarmup() || isLowPowerMobileDevice()) return 4;
  if (isTouchDevice()) return 6;
  return 10;
};

const getDetailImageLimit = () => {
  if (shouldLimitNetworkWarmup() || isLowPowerMobileDevice()) return 2;
  return 4;
};

export const warmImage = (src, { priority = 'low', timeout = 2600, decode = priority === 'high' } = {}) => {
  if (typeof Image === 'undefined' || !src) {
    return Promise.resolve(null);
  }

  if (!imageLoadPromises.has(src)) {
    const loadPromise = new Promise((resolve) => {
      const img = new Image();
      let settled = false;
      const settle = (value = img) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        if (!value) {
          imageLoadPromises.delete(src);
          imageDecodePromises.delete(src);
        }
        resolve(value);
      };
      const timer = setTimeout(() => settle(img.complete ? img : null), timeout);

      img.decoding = 'async';
      img.loading = priority === 'high' ? 'eager' : 'lazy';
      if ('fetchPriority' in img) img.fetchPriority = priority;
      img.onload = () => settle(img);
      img.onerror = () => settle(null);
      img.src = src;
    });

    imageLoadPromises.set(src, loadPromise);
  }

  const loadPromise = imageLoadPromises.get(src);
  if (!decode || decodedImages.has(src)) {
    return loadPromise;
  }

  if (!imageDecodePromises.has(src)) {
    const decodePromise = loadPromise.then((img) => {
      if (!img || typeof img.decode !== 'function') return img;
      return img.decode()
        .then(() => {
          decodedImages.add(src);
          return img;
        })
        .catch(() => img);
    });

    imageDecodePromises.set(src, decodePromise);
  }

  return imageDecodePromises.get(src);
};

const warmImageList = async (urls, { highPriorityCount = 1, timeout, concurrency } = {}) => {
  const candidates = unique(urls);
  const workerCount = Math.max(1, Math.min(concurrency || getWarmupConcurrency(), candidates.length || 1));
  let cursor = 0;

  const workers = Array.from({ length: workerCount }, async () => {
    while (cursor < candidates.length) {
      const index = cursor;
      cursor += 1;

      await waitForWarmupSlot(index);
      await warmImage(candidates[index], {
        priority: index < highPriorityCount ? 'high' : 'low',
        decode: index < highPriorityCount,
        ...(timeout ? { timeout } : {}),
      });
    }
  });

  return Promise.allSettled(workers);
};

export const warmCatalogCardImages = (items = [], {
  limit = items.length,
  highPriorityCount = limit,
  timeout,
  concurrency,
} = {}) => {
  const urls = items
    .slice(0, limit)
    .map(getCatalogImage);

  return warmImageList(urls, {
    highPriorityCount: Math.min(highPriorityCount, urls.length),
    timeout,
    concurrency,
  });
};

export const warmupGalleryRouteChunk = () => {
  if (!galleryChunkWarmup) {
    galleryChunkWarmup = import('../pages/GalleryView').catch(() => undefined);
  }
  return galleryChunkWarmup;
};

export const warmupShopRouteChunk = () => {
  if (!shopChunkWarmup) {
    shopChunkWarmup = import('../pages/ShopView').catch(() => undefined);
  }
  return shopChunkWarmup;
};

export const warmupProductDetailRouteChunk = () => {
  if (!productDetailChunkWarmup) {
    productDetailChunkWarmup = import('../pages/ProductDetail').catch(() => undefined);
  }
  return productDetailChunkWarmup;
};

export const warmupShopProductDetailRouteChunk = () => {
  if (!shopProductDetailChunkWarmup) {
    shopProductDetailChunkWarmup = import('../pages/ShopProductDetail').catch(() => undefined);
  }
  return shopProductDetailChunkWarmup;
};

export const warmupFurnitureHeroImages = () => (
  warmImageList(selectViewportImages(FURNITURE_HERO_IMAGES), { highPriorityCount: 1 })
);

export const warmupBoardHeroImages = () => (
  warmImageList(selectViewportImages(BOARD_HERO_IMAGES), { highPriorityCount: 1 })
);

export const warmupCriticalAboutImages = () => {
  const candidates = selectViewportImages(CRITICAL_ABOUT_IMAGES);
  const limited = shouldLimitNetworkWarmup();

  return warmImageList(
    candidates.slice(0, limited ? 1 : candidates.length),
    {
      highPriorityCount: 1,
      timeout: limited ? 1500 : 2400,
    },
  );
};

export const warmupFurnitureProductImages = ({
  items = [],
} = {}) => {
  const limit = getStartupProductLimit();
  const urls = items
    .filter(isPublishedFixedItem)
    .slice(0, limit)
    .map(getCatalogImage);

  return warmImageList(urls, { highPriorityCount: Math.min(2, limit) });
};

export const warmupFurnitureIntent = ({ items = [] } = {}) => (
  Promise.allSettled([
    warmupFurnitureHeroImages(),
    warmupFurnitureProductImages({ items }),
  ])
);

export const warmupBoardsIntent = ({ boardItems = [] } = {}) => {
  const limit = getIntentProductLimit();
  const urls = boardItems
    .filter(isPublishedFixedItem)
    .slice(0, limit)
    .map(getCatalogImage);

  return Promise.allSettled([
    warmupBoardHeroImages(),
    warmImageList(urls, { highPriorityCount: Math.min(2, limit) }),
  ]);
};

export const warmupShopIntent = ({ affiliateProducts = [] } = {}) => {
  const limit = shouldLimitNetworkWarmup() || isLowPowerMobileDevice() ? 2 : 4;
  const urls = affiliateProducts
    .slice(0, limit)
    .map(getAffiliateImage);

  return Promise.allSettled([
    warmupShopRouteChunk(),
    warmImageList(urls, { highPriorityCount: 1 }),
  ]);
};

export const warmupProductDetailIntent = (item) => {
  const urls = getCatalogImages(item).slice(0, getDetailImageLimit());

  return Promise.allSettled([
    warmupProductDetailRouteChunk(),
    warmImageList(urls, { highPriorityCount: 1 }),
  ]);
};

export const warmupShopProductDetailIntent = (product) => {
  const urls = getAffiliateImages(product).slice(0, getDetailImageLimit());

  return Promise.allSettled([
    warmupShopProductDetailRouteChunk(),
    warmImageList(urls, { highPriorityCount: 1 }),
  ]);
};

export const warmupMarketplaceStartup = async (catalogPayload = {}) => {
  await Promise.allSettled([
    warmupGalleryRouteChunk(),
    warmupFurnitureHeroImages(),
  ]);

  return warmupFurnitureProductImages(catalogPayload);
};

export const warmupAboutStartup = () => (
  Promise.allSettled([
    warmupCriticalAboutImages(),
  ])
);

export const warmupStartupForRoute = (route = {}, catalogPayload = {}) => {
  if (route.view === 'home' || route.view === 'about') {
    return warmupAboutStartup();
  }

  if (route.view === 'gallery' && route.galleryState?.activeCollection === 'cutting_boards') {
    return Promise.allSettled([
      warmupGalleryRouteChunk(),
      warmupBoardsIntent(catalogPayload),
    ]);
  }

  if (route.view === 'shop') {
    return warmupShopIntent(catalogPayload);
  }

  if (route.view === 'shop-detail') {
    return Promise.allSettled([
      warmupShopRouteChunk(),
      warmupShopProductDetailRouteChunk(),
    ]);
  }

  if (route.view === 'detail') {
    return Promise.allSettled([
      warmupGalleryRouteChunk(),
      warmupProductDetailRouteChunk(),
    ]);
  }

  return warmupMarketplaceStartup(catalogPayload);
};

export const warmupStartupCatalogImagesForRoute = (route = {}, catalogPayload = {}) => {
  if (route.view === 'gallery' && route.galleryState?.activeCollection === 'cutting_boards') {
    return warmupBoardsIntent(catalogPayload);
  }

  if (route.view === 'gallery') {
    return warmupFurnitureProductImages(catalogPayload);
  }

  if (route.view === 'detail' && route.productId) {
    const item = [...(catalogPayload.items || []), ...(catalogPayload.boardItems || [])]
      .find((candidate) => candidate.id === route.productId);
    return item ? warmupProductDetailIntent(item) : Promise.resolve();
  }

  if (route.view === 'shop-detail' && route.shopProductId) {
    const product = (catalogPayload.affiliateProducts || [])
      .find((candidate) => candidate.id === route.shopProductId);
    return product ? warmupShopProductDetailIntent(product) : Promise.resolve();
  }

  return Promise.resolve();
};
