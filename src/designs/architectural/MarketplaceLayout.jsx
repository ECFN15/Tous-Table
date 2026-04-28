import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import ProductCard, { RATIO_CACHE } from './components/ProductCard';
import { ArrowDown, ArrowRight, ChevronDown, Hammer, ShieldCheck, Tag, Truck } from 'lucide-react';
import { FurnitureHeaderIcon, BreadBoardHeaderIcon, CounterHeaderIcon } from './components/ArchitecturalHeader';
import TextType from '../../components/ui/TextType';
import { scrollToTarget } from '../../utils/smoothScroll';

// Nombre de colonnes responsive — aligné sur les breakpoints Tailwind utilisés dans
// l'ancien `columns-2 md:columns-3 lg:columns-4`.
const useResponsiveCols = () => {
    const compute = () => {
        if (typeof window === 'undefined') return 4;
        const w = window.innerWidth;
        if (w < 768) return 2;
        if (w < 1024) return 3;
        return 4;
    };
    const [cols, setCols] = useState(compute);
    useEffect(() => {
        let raf = 0;
        const onResize = () => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => setCols(compute()));
        };
        window.addEventListener('resize', onResize);
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('resize', onResize);
        };
    }, []);
    return cols;
};

// Ratio hauteur/largeur prédit pour une carte (en multiples de la largeur de colonne).
// On lit le `RATIO_CACHE` partagé avec `ProductCard` ; à défaut, fallback portrait 4:5
// (= 1.25), qui est le ratio par défaut posé sur le `<a>` quand l'image n'est pas chargée.
const FALLBACK_HEIGHT_RATIO = 5 / 4;
const getPredictedHeightRatio = (item) => {
    const img = item?.images?.[0] || item?.imageUrl || item?.thumbnailUrl;
    if (!img) return FALLBACK_HEIGHT_RATIO;
    const cached = RATIO_CACHE.get(img);
    if (!cached?.aspectRatio) return FALLBACK_HEIGHT_RATIO;
    const parts = String(cached.aspectRatio).split('/');
    const w = parseFloat(parts[0]);
    const h = parseFloat(parts[1]);
    if (!w || !h) return FALLBACK_HEIGHT_RATIO;
    return h / w;
};

// Taxonomie mobilier — slugs alignés avec AdminForm.FURNITURE_CATEGORIES.
// L'identifiant `all` est la pill par défaut ; les autres correspondent au champ Firestore `category`.
const FURNITURE_CATEGORIES = [
    { id: 'all', label: 'Tous les produits' },
    { id: 'buffet', label: 'Buffets' },
    { id: 'table', label: 'Tables' },
    { id: 'chaise', label: 'Chaises & bancs' },
    { id: 'armoire', label: 'Armoires' },
    { id: 'commode', label: 'Commodes & chevets' },
    { id: 'autre', label: 'Autres' }, // Pill publique uniquement (pas dans le select admin)
];

// Tranches de prix fixes — filtre public Galerie.
const PRICE_RANGES = [
    { id: 'lt500', label: 'Moins de 500 €', min: 0, max: 500 },
    { id: '500-1000', label: '500 – 1 000 €', min: 500, max: 1000 },
    { id: '1000-2000', label: '1 000 – 2 000 €', min: 1000, max: 2000 },
    { id: 'gt2000', label: '2 000 € et +', min: 2000, max: Infinity },
];

// Normalisation NFD pour ignorer les accents lors du fallback regex.
const normalizeText = (value = '') =>
    value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

// Retourne UNE seule catégorie par meuble.
// Priorité absolue au champ Firestore `category` (saisi en admin).
// Fallback : analyse du NOM uniquement (signal très fiable pour le mobilier ancien).
// On évite la description car elle contient souvent des mots parasites
// (ex. "table à langer" dans la fiche d'une commode → faisait matcher 'table' à tort).
const getFurnitureCategory = (item) => {
    if (item?.category) return item.category;
    const name = normalizeText(item?.name || '');

    // 1. Cas spéciaux à traiter en priorité (mots qui pourraient matcher plusieurs catégories).
    if (/vestiaire|porte[\s-]?manteaux|penderie/.test(name)) return 'armoire';
    if (/desserte/.test(name)) return 'buffet'; // une desserte est un buffet bas
    if (/meuble[\s-]?de[\s-]?metier/.test(name)) return 'buffet'; // décision client : rangé dans Buffets

    // 2. Catégories principales fortes — testées AVANT "autre" pour éviter les faux positifs
    //    (ex. "Bahut coffre" : bahut > coffre, donc reste un buffet).
    if (/buffet|bahut/.test(name)) return 'buffet';
    if (/commode|chevet|secretaire|semainier/.test(name)) return 'commode';
    if (/armoire/.test(name)) return 'armoire';
    if (/chaise|fauteuil|banc|tabouret/.test(name)) return 'chaise';

    // 3. Mots-clés "Autres" (meubles spéciaux peu fréquents : crédence, vitrine, console, etc.).
    if (/credence|vitrine|miroir|console|coffre|etagere|horloge|paravent|servante|meuble[\s-]?a[\s-]?colonne/.test(name)) return 'autre';

    // 4. Catégorie générique en dernier (table est très générique car peut apparaître partout).
    if (/table|bureau|comptoir/.test(name)) return 'table';

    // 5. Fallback : nom non explicite → "Autres" plutôt que d'imposer une catégorie hasardeuse.
    return 'autre';
};

const BENEFITS = [
    {
        title: 'Pièces uniques',
        body: 'Chaque meuble est unique et sélectionné avec exigence.',
        icon: Tag,
    },
    {
        title: 'Restauration artisanale',
        body: 'Restauration à la main dans notre atelier en Normandie.',
        icon: Hammer,
    },
    {
        title: 'Matières durables',
        body: 'Bois massif et matériaux nobles pour des meubles faits pour durer.',
        icon: ShieldCheck,
    },
    {
        title: 'Livraison soignée',
        body: 'Livraison partout en France avec emballage sur mesure.',
        icon: Truck,
    },
];

const getPrice = (item) => Number(item?.currentPrice || item?.startingPrice || item?.price || 0);
const HERO_BY_COLLECTION = {
    furniture: {
        image: '/images/gallery/hero-buffet-parisien-2026-2020.webp',
        srcSet: [
            '/images/gallery/hero-buffet-parisien-2026-960.webp 960w',
            '/images/gallery/hero-buffet-parisien-2026-1440.webp 1440w',
            '/images/gallery/hero-buffet-parisien-2026-2020.webp 2020w',
        ].join(', '),
        mobileSrcSet: [
            '/images/gallery/hero-buffet-parisien-2026-mobile-640.webp 640w',
            '/images/gallery/hero-buffet-parisien-2026-mobile-840.webp 840w',
            '/images/gallery/hero-buffet-parisien-2026-mobile-1122.webp 1122w',
        ].join(', '),
        alt: 'Mobilier ancien restaure',
        objectPosition: 'center center',
    },
    cutting_boards: {
        image: '/images/gallery/hero-planches-2026-exact.png',
        srcSet: '/images/gallery/hero-planches-2026-exact.png 1672w',
        mobileSrcSet: [
            '/images/gallery/hero-planches-2026-mobile-outpaint-640.webp 640w',
            '/images/gallery/hero-planches-2026-mobile-outpaint-840.webp 840w',
            '/images/gallery/hero-planches-2026-mobile-outpaint-1122.webp 1122w',
        ].join(', '),
        alt: 'Planches en bois Tous a Table, made in Normandie',
        mobileObjectPosition: 'center center',
        objectPosition: '68% center',
    },
};
const getMillis = (value) => {
    if (!value) return 0;
    if (typeof value.toMillis === 'function') return value.toMillis();
    if (value.seconds) return value.seconds * 1000;
    return new Date(value).getTime() || 0;
};

const AtelierBadge = () => (
    <svg
        viewBox="0 0 220 220"
        role="img"
        aria-label="Atelier Normand, pieces uniques"
        className="h-36 w-36 lg:h-44 lg:w-44 drop-shadow-[0_18px_45px_rgba(0,0,0,0.65)]"
    >
        <defs>
            <radialGradient id="atelierBadgeFill" cx="42%" cy="36%" r="72%">
                <stop offset="0%" stopColor="#2a2115" stopOpacity="0.78" />
                <stop offset="54%" stopColor="#050505" stopOpacity="0.88" />
                <stop offset="100%" stopColor="#020202" stopOpacity="0.96" />
            </radialGradient>
            <linearGradient id="atelierGold" x1="48" y1="26" x2="176" y2="196" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#f4d08c" />
                <stop offset="45%" stopColor="#c99643" />
                <stop offset="100%" stopColor="#f1c879" />
            </linearGradient>
            <path id="atelierTopPath" d="M 42 110 A 68 68 0 0 1 178 110" />
            <path id="atelierBottomPath" d="M 42 110 A 68 68 0 0 0 178 110" />
            <filter id="atelierSoftGlow" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="2.4" result="blur" />
                <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
            </filter>
        </defs>

        {/* Fond transparent (le cercle avec atelierBadgeFill a été retiré) */}
        <circle cx="110" cy="110" r="87" fill="none" stroke="url(#atelierGold)" strokeWidth="1.35" />
        
        <g>
            <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 110 110"
                to="360 110 110"
                dur="18s"
                repeatCount="indefinite"
            />

            {/* Points décoratifs de séparation */}
            <circle cx="42" cy="110" r="2.2" fill="#f1e6d0" opacity="0.85" />
            <circle cx="178" cy="110" r="2.2" fill="#f1e6d0" opacity="0.85" />

            <text
                fill="#f1e6d0"
                fontSize="9.5"
                fontWeight="500"
                letterSpacing="6.5"
                fontFamily="'Plus Jakarta Sans', sans-serif"
                textAnchor="middle"
                dominantBaseline="central"
                className="uppercase"
            >
                <textPath href="#atelierTopPath" startOffset="51.5%">ATELIER NORMAND</textPath>
            </text>
            <text
                fill="#f1e6d0"
                fontSize="9.5"
                fontWeight="500"
                letterSpacing="6.5"
                fontFamily="'Plus Jakarta Sans', sans-serif"
                textAnchor="middle"
                dominantBaseline="central"
                className="uppercase"
            >
                <textPath href="#atelierBottomPath" startOffset="51.5%">PIÈCES UNIQUES</textPath>
            </text>
        </g>

        <g fill="url(#atelierGold)" fontFamily="'Cormorant Garamond', 'Playfair Display', serif" fontSize="62" fontWeight="300" textAnchor="middle">
            <text x="109" y="119">A</text>
            <text x="116" y="142">N</text>
        </g>
    </svg>
);

// === NEON COLLECTION SWITCHER ===
// Trois boutons (Mobilier / Planches / Le Comptoir) à border néon rotative,
// affichés au-dessus du label "Collection 2026" dans le hero.
// Réutilise les mêmes icônes que la nav header pour une identité visuelle cohérente.
const NeonCollectionSwitcher = ({ activeCollection, setActiveCollection, setFilter, onOpenShop }) => {
    const items = [
        {
            id: 'furniture',
            label: 'Mobilier',
            Icon: FurnitureHeaderIcon,
            isActive: activeCollection === 'furniture',
            onClick: () => {
                if (typeof setActiveCollection === 'function') setActiveCollection('furniture');
                if (typeof setFilter === 'function') setFilter('fixed');
            },
        },
        {
            id: 'cutting_boards',
            label: 'Planches',
            Icon: BreadBoardHeaderIcon,
            isActive: activeCollection === 'cutting_boards',
            onClick: () => {
                if (typeof setActiveCollection === 'function') setActiveCollection('cutting_boards');
            },
        },
        {
            id: 'shop',
            label: 'Le Comptoir',
            Icon: CounterHeaderIcon,
            isActive: false, // Le Comptoir = page séparée → jamais actif sur MarketplaceLayout
            isShop: true,
            onClick: () => {
                if (typeof onOpenShop === 'function') onOpenShop();
            },
        },
    ];

    return (
        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
            {items.map(({ id, label, Icon, isActive, isShop, onClick }) => (
                <div key={id} className="relative">
                    {isShop ? (
                        /* LE COMPTOIR — border néon rotative (comme en prod) */
                        <>
                            <div className="relative p-[1.5px] rounded-full overflow-hidden">
                                <motion.div
                                    animate={{ rotate: -360 }}
                                    transition={{ repeat: Infinity, duration: 6, ease: 'linear' }}
                                    className="absolute inset-[-200%]"
                                    style={{
                                        background: 'conic-gradient(from 0deg, transparent 30%, rgba(245,158,11,0) 35%, rgba(245,158,11,1) 50%, rgba(245,158,11,0) 65%, transparent 70%)',
                                    }}
                                />
                                <motion.button
                                    type="button"
                                    onClick={onClick}
                                    whileHover={{ scale: 1.04 }}
                                    whileTap={{ scale: 0.97 }}
                                    className="relative z-10 inline-flex items-center gap-2 px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.18em] whitespace-nowrap bg-stone-900/90 text-amber-400"
                                >
                                    <Icon size={14} strokeWidth={1.8} className="shrink-0" />
                                    <span>{label}</span>
                                </motion.button>
                            </div>
                            <motion.div
                                className="absolute -top-2.5 -right-2 z-20 transform-gpu rotate-[6deg]"
                                animate={{ y: [0, -2, 0] }}
                                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                                style={{ willChange: 'transform' }}
                            >
                                <div className="inline-flex items-center justify-center min-w-[30px] h-[16px] text-[8.5px] leading-none font-medium uppercase tracking-[0.07em] px-1.5 rounded-full bg-amber-500 text-amber-50 border border-amber-300/45 shadow-[0_2px_6px_rgba(0,0,0,0.3)]">
                                    NEW
                                </div>
                            </motion.div>
                        </>
                    ) : isActive ? (
                        /* MOBILIER actif — pill blanche pleine, pas de neon */
                        <motion.button
                            type="button"
                            onClick={onClick}
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.97 }}
                            className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.18em] whitespace-nowrap bg-stone-100 text-stone-900"
                        >
                            <Icon size={14} strokeWidth={1.8} className="shrink-0" />
                            <span>{label}</span>
                        </motion.button>
                    ) : (
                        /* MOBILIER inactif & PLANCHES — neon rotatif blanc */
                        <div className="relative p-[1.5px] rounded-full overflow-hidden">
                            <motion.div
                                animate={{ rotate: -360 }}
                                transition={{ repeat: Infinity, duration: 6, ease: 'linear' }}
                                className="absolute inset-[-200%]"
                                style={{
                                    background: 'conic-gradient(from 0deg, transparent 30%, rgba(255,255,255,0) 35%, rgba(255,255,255,1) 50%, rgba(255,255,255,0) 65%, transparent 70%)',
                                }}
                            />
                            <motion.button
                                type="button"
                                onClick={onClick}
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.97 }}
                                className="relative z-10 inline-flex items-center gap-2 px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.18em] whitespace-nowrap bg-black/80 text-stone-100"
                            >
                                <Icon size={14} strokeWidth={1.8} className="shrink-0" />
                                <span>{label}</span>
                            </motion.button>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

const MarketplaceLayout = ({
    items,
    onSelectItem,
    headerProps,
    darkMode,
    setHeaderProps
}) => {
    const { activeCollection, setActiveCollection, setFilter, onOpenShop } = headerProps || {};
    const [activeCategory, setActiveCategory] = useState('all');
    const [activeMaterial, setActiveMaterial] = useState('');
    const [activePriceRange, setActivePriceRange] = useState('');
    const [sortMode, setSortMode] = useState('recent');

    // === ARCHITECTURE MASONRY JS-DRIVEN ===
    // On rend N colonnes flex-col indépendantes (cf. NUM_COLS responsive). Chaque carte est
    // assignée à UNE colonne au moment où elle est traitée par l'algo "shortest-column-first" ;
    // cette assignation est implicitement stable car :
    //   - L'ordre des items dans `sortedItems` ne change pas tant que les filtres ne changent pas
    //   - Les hauteurs prédites par item sont gelées à la première rencontre (`heightsRef`),
    //     donc une mise à jour ultérieure du `RATIO_CACHE` (letterbox détecté) ne décale pas
    //     les anciennes cartes
    //   - Quand on clique "Voir plus", les 24 premiers items sont re-traités à l'identique
    //     (mêmes hauteurs gelées) → ils retombent dans les mêmes colonnes ; les 12 nouveaux
    //     items s'insèrent dans la colonne actuellement la plus courte.
    // Conséquence : zéro reflow des cartes existantes, vrai masonry continu (pas de "trous"
    // sous les colonnes courtes comme avec l'ancien chunking par batch).
    const NUM_COLS = useResponsiveCols();
    const [visibleCount, setVisibleCount] = useState(24);
    // Map<itemId, indexDansLeBatchFrais> — uniquement pour les nouveaux items à animer.
    // Vide à l'état initial et après reset des filtres → aucune animation parasite.
    const [freshOrder, setFreshOrder] = useState(() => new Map());
    // Map<itemId, ratio h/w> — gelé à la première rencontre pour figer les placements.
    const heightsRef = useRef(new Map());
    // Timer pour clear `freshOrder` après la fin de l'animation (libère le will-change
    // GPU des cartes fraîches). Cf. _DOCS/AUDITS/scrolllenis.md §3.4.B.
    const freshClearTimerRef = useRef(null);

    useEffect(() => {
        if (setHeaderProps && headerProps) setHeaderProps(headerProps);
        return () => {
            if (setHeaderProps) setHeaderProps(null);
        };
    }, [activeCollection, setHeaderProps]);

    // Options matière déduites dynamiquement des meubles réellement présents.
    const materialOptions = useMemo(() => {
        return [...new Set(items.map((item) => item.material).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'fr'));
    }, [items]);

    // Tranche de prix active (objet complet ou null).
    const priceRange = PRICE_RANGES.find((r) => r.id === activePriceRange) || null;

    const sortedItems = useMemo(() => {
        const filtered = items.filter((item) => {
            // 1. Catégorie (priorité au champ Firestore, fallback regex sur nom/description).
            if (activeCategory !== 'all' && getFurnitureCategory(item) !== activeCategory) return false;
            // 2. Matière exacte.
            if (activeMaterial && item.material !== activeMaterial) return false;
            // 3. Tranche de prix.
            if (priceRange) {
                if (item.priceOnRequest) return false; // "Prix sur demande" exclu des tranches.
                const price = getPrice(item);
                if (price < priceRange.min || price >= priceRange.max) return false;
            }
            return true;
        });
        return [...filtered].sort((a, b) => {
            if (sortMode === 'priceAsc') return getPrice(a) - getPrice(b);
            if (sortMode === 'priceDesc') return getPrice(b) - getPrice(a);
            return getMillis(b.createdAt || b.updatedAt) - getMillis(a.createdAt || a.updatedAt);
        });
    }, [items, activeCategory, activeMaterial, priceRange, sortMode]);

    const hasActiveFilters = activeCategory !== 'all' || activeMaterial !== '' || activePriceRange !== '';

    // Reset à l'état initial : 24 items visibles, aucun item frais à animer, hauteurs effacées.
    // Appelé sur tout changement de filtre / catégorie / matière / tri (l'ordre des items change
    // → les placements précédents n'ont plus de sens, on repart à zéro).
    const resetView = useCallback(() => {
        if (freshClearTimerRef.current) {
            clearTimeout(freshClearTimerRef.current);
            freshClearTimerRef.current = null;
        }
        heightsRef.current = new Map();
        setVisibleCount(24);
        setFreshOrder(new Map());
    }, []);

    const resetAllFilters = useCallback(() => {
        setActiveCategory('all');
        setActiveMaterial('');
        setActivePriceRange('');
        resetView();
    }, [resetView]);

    const heroConfig = HERO_BY_COLLECTION[activeCollection] || HERO_BY_COLLECTION.furniture;

    // "Voir plus" : on étend simplement la fenêtre visible et on marque les 12 nouveaux items
    // comme "frais" (avec leur ordre d'apparition dans la salve pour le stagger d'animation).
    // Le `useMemo` `columnsLayout` ré-exécute l'algo : les 24 premiers retombent à l'identique
    // grâce aux hauteurs gelées dans `heightsRef`, et les 12 nouveaux s'insèrent dans la
    // colonne actuellement la plus courte. Aucune carte existante ne bouge.
    const loadMore = useCallback(() => {
        const newCount = Math.min(visibleCount + 12, sortedItems.length);
        const newSlice = sortedItems.slice(visibleCount, newCount);
        const order = new Map();
        newSlice.forEach((item, idx) => order.set(item.id, idx));
        setFreshOrder(order);
        setVisibleCount(newCount);
        // Clear le freshOrder 150 ms après la fin de l'animation (1150 ms keyframe + buffer)
        // → la classe `tat-fresh-card` disparaît → will-change retourne à `auto` → le GPU
        // libère ses layers dédiés. Sinon ils s'accumulaient à chaque clic "Voir plus".
        if (freshClearTimerRef.current) clearTimeout(freshClearTimerRef.current);
        freshClearTimerRef.current = setTimeout(() => {
            setFreshOrder(new Map());
            freshClearTimerRef.current = null;
        }, 1300);
    }, [visibleCount, sortedItems]);

    // Cleanup global du timer au unmount du composant.
    useEffect(() => () => {
        if (freshClearTimerRef.current) clearTimeout(freshClearTimerRef.current);
    }, []);

    // Quand le nombre de colonnes change (resize fenêtre), les anciens placements ne sont plus
    // pertinents (l'algo va répartir différemment sur N colonnes vs N±1). On efface les
    // hauteurs gelées pour permettre un re-placement propre. Pas de reset de visibleCount —
    // l'utilisateur garde son progrès "Voir plus".
    useEffect(() => {
        heightsRef.current = new Map();
        setFreshOrder(new Map()); // pas d'animation parasite après resize
    }, [NUM_COLS]);

    // Algo masonry "shortest-column-first" — déterministe pour un même `sortedItems` + heightsRef.
    // Retourne un tableau de colonnes, chacune contenant la liste des items qui lui sont assignés.
    const columnsLayout = useMemo(() => {
        const cols = Array.from({ length: NUM_COLS }, () => ({ items: [], h: 0 }));
        const visible = sortedItems.slice(0, visibleCount);
        for (const item of visible) {
            // Hauteur prédite gelée à la première rencontre (cf. heightsRef).
            let height = heightsRef.current.get(item.id);
            if (height === undefined) {
                height = getPredictedHeightRatio(item);
                heightsRef.current.set(item.id, height);
            }
            // Colonne la plus courte (en cas d'égalité, première colonne gagne → stable).
            let minIdx = 0;
            for (let i = 1; i < cols.length; i++) {
                if (cols[i].h < cols[minIdx].h) minIdx = i;
            }
            cols[minIdx].items.push(item);
            cols[minIdx].h += height;
        }
        return cols;
    }, [sortedItems, visibleCount, NUM_COLS]);

    const totalVisible = Math.min(visibleCount, sortedItems.length);
    const hasMore = totalVisible < sortedItems.length;

    // Préchauffe le cache HTTP pour la catégorie survolée (desktop) → ratios déjà calculables
    // au moment où l'utilisateur clique sur la pill. Limité à 8 images pour ne pas saturer.
    const preloadedRef = useRef(new Set());
    const preloadCategory = useCallback((categoryId) => {
        const key = `${categoryId}-${activeMaterial}-${activePriceRange}-${sortMode}`;
        if (preloadedRef.current.has(key)) return;
        preloadedRef.current.add(key);
        const pool = items.filter((item) => {
            if (categoryId !== 'all' && getFurnitureCategory(item) !== categoryId) return false;
            if (activeMaterial && item.material !== activeMaterial) return false;
            if (priceRange) {
                if (item.priceOnRequest) return false;
                const p = getPrice(item);
                if (p < priceRange.min || p >= priceRange.max) return false;
            }
            return true;
        }).slice(0, 8);
        pool.forEach((item) => {
            const url = item?.images?.[0] || item?.imageUrl || item?.thumbnailUrl;
            if (url) {
                const img = new Image();
                img.decoding = 'async';
                img.src = url;
            }
        });
    }, [items, activeMaterial, activePriceRange, priceRange, sortMode]);

    const scrollToCollection = () => {
        const target = document.getElementById('collection-grid');
        if (!target) return;
        scrollToTarget(target, { offset: -80, duration: 1.05 });
    };

    return (
        <div className="w-full min-h-screen bg-[#050605] text-stone-100 selection:bg-[#dba45f] selection:text-black">
            <main className="relative overflow-hidden">
                <section className="relative min-h-[calc(100vh-5rem)] md:min-h-[560px] lg:min-h-[620px] overflow-hidden">
                    {heroConfig.image && (
                        <picture>
                            <source
                                media="(max-width: 767px)"
                                srcSet={heroConfig.mobileSrcSet}
                                sizes="100vw"
                            />
                            <img
                                src={heroConfig.image}
                                srcSet={heroConfig.srcSet}
                                sizes="100vw"
                                alt={heroConfig.alt}
                                className="absolute inset-0 h-full w-full object-cover object-[var(--hero-mobile-position)] md:object-[var(--hero-desktop-position)]"
                                style={{
                                    '--hero-mobile-position': heroConfig.mobileObjectPosition || heroConfig.objectPosition,
                                    '--hero-desktop-position': heroConfig.objectPosition,
                                }}
                                loading="eager"
                                decoding="async"
                                fetchpriority="high"
                            />
                        </picture>
                    )}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_42%,rgba(0,0,0,0),rgba(0,0,0,0.28)_46%,rgba(0,0,0,0.72)_100%)]" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/28 to-black/5" />
                    <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/70 to-transparent" />

                    <div className="relative z-10 max-w-[1920px] mx-auto px-6 md:px-16 pt-10 md:pt-14 pb-14 md:pb-20 min-h-[calc(100vh-5rem)] md:min-h-[560px] lg:min-h-[620px] flex flex-col justify-start">

                        {/* HAUT — Collection 2026 + switcher centré */}
                        <div className="flex flex-col items-center text-center">
                            <p className="text-[#dba45f] text-[11px] md:text-xs font-black uppercase tracking-[0.42em] mb-10 md:mb-12">
                                Collection 2026
                            </p>
                            <NeonCollectionSwitcher
                                activeCollection={activeCollection}
                                setActiveCollection={setActiveCollection}
                                setFilter={setFilter}
                                onOpenShop={onOpenShop}
                            />
                        </div>

                        {/* BAS — Titre + description + CTA */}
                        <div className="mt-20 md:mt-24 flex items-end justify-between">
                            <div className="max-w-2xl">
                                <h1 className="font-serif text-[4.6rem] leading-[0.82] md:text-[7.8rem] lg:text-[8.6rem] tracking-tight text-white drop-shadow-[0_10px_35px_rgba(0,0,0,0.65)]">
                                    <span className="block h-[1.64em] overflow-hidden">
                                        <TextType
                                            as="span"
                                            text={[
                                                'Made in\nNormandie',
                                                'Tous à\nTable',
                                                'Savoir-\nFaire',
                                                'Pièces\nUniques'
                                            ]}
                                            typingSpeed={115}
                                            deletingSpeed={34}
                                            pauseDuration={1400}
                                            cursorCharacter="_"
                                            cursorClassName="ml-0"
                                            className="inline-block"
                                        />
                                    </span>
                                </h1>
                                <p className="mt-6 md:mt-8 max-w-xl font-serif text-[1.35rem] md:text-[1.7rem] leading-[1.28] text-[#efc489]">
                                    Mobilier ancien restauré et pièces artisanales en bois massif. Chaque meuble raconte une histoire, chaque pièce est unique.
                                </p>
                                <button
                                    onClick={scrollToCollection}
                                    className="mt-8 md:mt-10 inline-flex h-14 md:h-16 items-center justify-center gap-6 border border-[#dba45f] px-7 md:px-10 text-[#f0b969] text-[11px] md:text-xs font-black uppercase tracking-[0.28em] transition-all hover:bg-[#dba45f] hover:text-black"
                                >
                                    Découvrir la collection
                                    <ArrowRight size={20} strokeWidth={1.5} />
                                </button>
                            </div>
                            <div className="hidden md:flex shrink-0">
                                <AtelierBadge />
                            </div>
                        </div>
                    </div>
                </section>

                <section id="collection-grid" className="max-w-[1920px] mx-auto px-5 md:px-12 py-8 md:py-12">
                    {/* === HEADER ROW : sidebar label + pills + filters === */}
                    <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-start lg:gap-10">
                        <aside className="hidden lg:block pt-1">
                            <p className="text-stone-400 text-[10px] font-black uppercase tracking-[0.32em] mb-3">Notre mobilier</p>
                            <p className="font-serif text-[1.05rem] leading-snug text-stone-100/85">
                                Des pièces uniques,<br />sélectionnées avec exigence.
                            </p>
                        </aside>

                        <div className="min-w-0">
                            {/* Categories pills (top) */}
                            <div className="flex items-center gap-2 md:gap-3 overflow-x-auto no-scrollbar pb-4 border-b border-[#8a5b2a]/20">
                                {FURNITURE_CATEGORIES.map((category) => {
                                    const active = activeCategory === category.id;
                                    return (
                                        <button
                                            key={category.id}
                                            onMouseEnter={() => preloadCategory(category.id)}
                                            onFocus={() => preloadCategory(category.id)}
                                            onClick={() => {
                                                setActiveCategory(category.id);
                                                resetView();
                                            }}
                                            className={`shrink-0 rounded-full border px-4 md:px-5 py-2 md:py-2.5 text-[10px] font-black uppercase tracking-[0.22em] transition-all ${
                                                active
                                                    ? 'border-white/80 bg-stone-100 text-stone-900'
                                                    : 'border-transparent text-stone-300/80 hover:text-white hover:border-[#dba45f]/30'
                                            }`}
                                        >
                                            {category.label}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Filter bar — Matière + Prix + Tri + Reset (si au moins un filtre actif) */}
                            <div className="flex flex-wrap items-center justify-between gap-4 py-5">
                                <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                                    <span className="text-stone-400 text-[10px] font-black uppercase tracking-[0.26em] mr-1">Filtrer :</span>

                                    {/* Filtre Matière — masqué si aucune matière renseignée en BDD */}
                                    {materialOptions.length > 0 && (
                                        <span className="relative">
                                            <select
                                                value={activeMaterial}
                                                onChange={(event) => {
                                                    setActiveMaterial(event.target.value);
                                                    resetView();
                                                }}
                                                className={`h-10 appearance-none rounded-full border bg-transparent pl-4 pr-10 text-[10px] font-black uppercase tracking-[0.22em] outline-none transition-colors cursor-pointer ${
                                                    activeMaterial
                                                        ? 'border-[#dba45f] text-[#f0b969]'
                                                        : 'border-[#8a5b2a]/50 text-stone-200 hover:border-[#dba45f] hover:text-white'
                                                }`}
                                            >
                                                <option value="" className="bg-[#0a0a09] text-white">Toutes les matières</option>
                                                {materialOptions.map((mat) => (
                                                    <option key={mat} value={mat} className="bg-[#0a0a09] text-white">{mat}</option>
                                                ))}
                                            </select>
                                            <ChevronDown size={14} strokeWidth={1.8} className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 ${activeMaterial ? 'text-[#dba45f]' : 'text-stone-400'}`} />
                                        </span>
                                    )}

                                    {/* Filtre Prix — tranches fixes, exclut les "prix sur demande" */}
                                    <span className="relative">
                                        <select
                                            value={activePriceRange}
                                            onChange={(event) => {
                                                setActivePriceRange(event.target.value);
                                                resetView();
                                            }}
                                            className={`h-10 appearance-none rounded-full border bg-transparent pl-4 pr-10 text-[10px] font-black uppercase tracking-[0.22em] outline-none transition-colors cursor-pointer ${
                                                activePriceRange
                                                    ? 'border-[#dba45f] text-[#f0b969]'
                                                    : 'border-[#8a5b2a]/50 text-stone-200 hover:border-[#dba45f] hover:text-white'
                                            }`}
                                        >
                                            <option value="" className="bg-[#0a0a09] text-white">Tous les prix</option>
                                            {PRICE_RANGES.map((range) => (
                                                <option key={range.id} value={range.id} className="bg-[#0a0a09] text-white">{range.label}</option>
                                            ))}
                                        </select>
                                        <ChevronDown size={14} strokeWidth={1.8} className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 ${activePriceRange ? 'text-[#dba45f]' : 'text-stone-400'}`} />
                                    </span>

                                    {/* Réinitialiser — visible uniquement quand au moins un filtre est actif */}
                                    {hasActiveFilters && (
                                        <button
                                            type="button"
                                            onClick={resetAllFilters}
                                            className="inline-flex h-10 items-center gap-2 rounded-full px-4 text-[#f0b969] text-[10px] font-black uppercase tracking-[0.22em] transition-colors hover:text-white"
                                        >
                                            Réinitialiser
                                        </button>
                                    )}
                                </div>

                                <label className="flex items-center gap-3">
                                    <span className="hidden sm:inline text-stone-400 text-[10px] font-black uppercase tracking-[0.26em]">Trier par :</span>
                                    <span className="relative">
                                        <select
                                            value={sortMode}
                                            onChange={(event) => {
                                                setSortMode(event.target.value);
                                                resetView();
                                            }}
                                            className="h-10 appearance-none rounded-full border border-[#8a5b2a]/50 bg-transparent pl-4 pr-10 text-stone-200 text-[10px] font-black uppercase tracking-[0.22em] outline-none transition-colors hover:border-[#dba45f] focus:border-[#dba45f] cursor-pointer"
                                        >
                                            <option value="recent" className="bg-[#0a0a09] text-white">Plus récents</option>
                                            <option value="priceAsc" className="bg-[#0a0a09] text-white">Prix croissant</option>
                                            <option value="priceDesc" className="bg-[#0a0a09] text-white">Prix décroissant</option>
                                        </select>
                                        <ChevronDown size={14} strokeWidth={1.8} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-stone-400" />
                                    </span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* === MASONRY JS-DRIVEN ===
                          N colonnes flex-col indépendantes (cf. `useResponsiveCols`). Chaque carte est
                          assignée à une colonne par l'algo "shortest-column-first" et y reste figée
                          (placements gelés via `heightsRef`). Quand on clique "Voir plus", les nouvelles
                          cartes s'insèrent dans la colonne la plus courte AU MOMENT du clic — vrai
                          masonry continu, sans trous sous les colonnes courtes, sans déplacement
                          d'aucune carte existante (les colonnes étant des conteneurs flex séparés,
                          le navigateur ne fait JAMAIS de re-balance). */}
                    {/* Keyframes — apparition cinématographique inspirée du skill `high-end-visual-design` :
                        montée prononcée + blur progressif (effet mise au point objectif) + easing Apple.
                        Le blur se résout à 55% de la durée (focus avant la position finale = sensation de
                        respiration). Animation jouée uniquement sur les items frais (Voir plus). */}
                    <style>{`
                        @keyframes tatCardEnter {
                            0% {
                                opacity: 0;
                                transform: translate3d(0, 56px, 0);
                                filter: blur(14px);
                            }
                            55% {
                                filter: blur(0);
                            }
                            100% {
                                opacity: 1;
                                transform: translate3d(0, 0, 0);
                                filter: blur(0);
                            }
                        }
                        .tat-fresh-card {
                            animation: tatCardEnter 1150ms cubic-bezier(0.32, 0.72, 0, 1) both;
                            will-change: transform, opacity, filter;
                            backface-visibility: hidden;
                        }
                        .tat-fresh-card > * {
                            transform: translateZ(0);
                        }
                        @media (prefers-reduced-motion: reduce) {
                            .tat-fresh-card {
                                animation: none;
                            }
                        }
                        /* Skip le paint des cartes hors viewport pendant le scroll.
                           Le browser maintient un placeholder de hauteur via contain-intrinsic-size,
                           puis active layout/paint dès que la carte approche du viewport.
                           Gain mesuré : ~5× sur le frame-time scroll d'une grille de 100 cartes.
                           Cf. _DOCS/AUDITS/scrolllenis.md §3.4.A. */
                        .tat-card-shell {
                            content-visibility: auto;
                            contain-intrinsic-size: auto 480px;
                        }
                    `}</style>
                    {totalVisible === 0 ? (
                        <div className="min-h-80 border border-[#8a5b2a]/40 flex items-center justify-center text-center">
                            <p className="font-serif text-2xl text-stone-400">Aucune pièce disponible.</p>
                        </div>
                    ) : (
                        // N colonnes flex indépendantes, chacune avec ses items en stack vertical.
                        // Aucune carte ne change de colonne au clic "Voir plus" — les nouveaux items
                        // s'insèrent dans la colonne la plus courte alors que les anciennes restent
                        // exactement où elles sont (DOM stable, pas de re-balance navigateur).
                        <div className="flex gap-3 mt-2 md:mt-4 items-start">
                            {columnsLayout.map((col, colIdx) => (
                                <div key={colIdx} className="flex-1 min-w-0 flex flex-col gap-3">
                                    {col.items.map((item) => {
                                        const orderIdx = freshOrder.get(item.id);
                                        const isFresh = orderIdx !== undefined;
                                        // Stagger 80ms cap 960ms — basé sur l'ordre d'apparition
                                        // dans la salve (pas l'ordre dans la colonne) pour un
                                        // déferlement visuel cohérent à l'écran.
                                        const delay = isFresh ? Math.min(orderIdx * 80, 960) : 0;
                                        return (
                                            <div
                                                key={item.id}
                                                className={`tat-card-shell ${isFresh ? 'tat-fresh-card' : ''}`}
                                                style={isFresh ? { animationDelay: `${delay}ms` } : undefined}
                                            >
                                                <ProductCard
                                                    item={item}
                                                    onClick={() => onSelectItem(item.id)}
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    )}

                    {hasMore && (
                        <div className="flex justify-center pt-10">
                            <button
                                type="button"
                                onClick={loadMore}
                                className="inline-flex h-14 min-w-[280px] items-center justify-center gap-6 border border-[#dba45f] px-8 text-[#f0b969] text-[11px] font-black uppercase tracking-[0.26em] transition-all hover:bg-[#dba45f] hover:text-black"
                            >
                                Voir plus de produits
                                <ArrowDown size={18} strokeWidth={1.5} />
                            </button>
                        </div>
                    )}

                    <div className="mt-10 md:mt-14 grid gap-0 overflow-hidden border border-[#8a5b2a]/25 bg-[#15120e]/80 md:grid-cols-4">
                        {BENEFITS.map(({ title, body, icon: Icon }, index) => (
                            <div key={title} className={`flex gap-5 p-6 md:p-7 ${index > 0 ? 'border-t md:border-t-0 md:border-l' : ''} border-[#8a5b2a]/25`}>
                                <Icon size={28} strokeWidth={1.35} className="shrink-0 text-[#dba45f] mt-0.5" />
                                <div>
                                    <h2 className="text-[#dba45f] text-[10px] md:text-[11px] font-black uppercase tracking-[0.24em]">{title}</h2>
                                    <p className="mt-2 font-serif text-[0.98rem] md:text-[1.05rem] leading-snug text-stone-200/90">{body}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default MarketplaceLayout;
