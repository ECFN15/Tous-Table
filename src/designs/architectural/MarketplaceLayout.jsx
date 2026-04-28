import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ProductCard from './components/ProductCard';
import { ArrowDown, ArrowRight, ChevronDown, Hammer, ShieldCheck, Tag, Truck } from 'lucide-react';
import TextType from '../../components/ui/TextType';

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

const MarketplaceLayout = ({
    items,
    onSelectItem,
    headerProps,
    darkMode,
    setHeaderProps
}) => {
    const { activeCollection } = headerProps || {};
    const [activeCategory, setActiveCategory] = useState('all');
    const [activeMaterial, setActiveMaterial] = useState('');
    const [activePriceRange, setActivePriceRange] = useState('');
    const [sortMode, setSortMode] = useState('recent');

    // === ARCHITECTURE PAR BATCHES ===
    // Chaque batch est rendu dans SON PROPRE conteneur `columns`. Ainsi les cartes des batches
    // précédents NE BOUGENT JAMAIS quand on clique "Voir plus" — le nouveau batch s'empile
    // proprement dessous sans déranger l'équilibrage des colonnes existantes.
    // batchBoundaries = bornes de fin (exclusives) de chaque batch. [24] = un seul batch [0, 24).
    // Après "Voir plus" : [24, 36] = batch 0 [0,24), batch 1 [24,36).
    const [batchBoundaries, setBatchBoundaries] = useState([24]);
    // Index du dernier batch ajouté (qui doit jouer l'animation d'entrée).
    // -1 = état initial, aucun batch frais.
    const [freshBatchIndex, setFreshBatchIndex] = useState(-1);

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

    // Reset à l'état initial : un seul batch de 24, pas de batch frais.
    // Appelé sur tout changement de filtre / catégorie / matière / tri.
    const resetView = useCallback(() => {
        setBatchBoundaries([24]);
        setFreshBatchIndex(-1);
    }, []);

    const resetAllFilters = useCallback(() => {
        setActiveCategory('all');
        setActiveMaterial('');
        setActivePriceRange('');
        resetView();
    }, [resetView]);

    const heroConfig = HERO_BY_COLLECTION[activeCollection] || HERO_BY_COLLECTION.furniture;

    // "Voir plus" : append d'un nouveau batch dans son propre conteneur columns.
    // Aucun item existant ne bouge — le nouveau batch s'empile proprement dessous.
    const loadMore = useCallback(() => {
        const newBoundaries = [...batchBoundaries, batchBoundaries[batchBoundaries.length - 1] + 12];
        setBatchBoundaries(newBoundaries);
        setFreshBatchIndex(newBoundaries.length - 1);
    }, [batchBoundaries]);

    // Découpage des items en batches d'après les bornes courantes.
    // Le batch 0 = items 0..24, batch 1 = 24..36, batch 2 = 36..48, etc.
    const batches = useMemo(() => {
        const result = [];
        let start = 0;
        for (const end of batchBoundaries) {
            const chunk = sortedItems.slice(start, end);
            if (chunk.length > 0) result.push(chunk);
            start = end;
        }
        return result;
    }, [sortedItems, batchBoundaries]);

    const totalVisible = batches.reduce((sum, b) => sum + b.length, 0);
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
        const lenis = typeof window !== 'undefined' ? window.__lenis : null;
        if (lenis) {
            lenis.scrollTo(target, { offset: -80, duration: 1.4 });
        } else {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
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
                                fetchPriority="high"
                            />
                        </picture>
                    )}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_42%,rgba(0,0,0,0),rgba(0,0,0,0.28)_46%,rgba(0,0,0,0.72)_100%)]" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/28 to-black/5" />
                    <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/70 to-transparent" />

                    <div className="relative z-10 max-w-[1920px] mx-auto px-6 md:px-16 pt-[7.5rem] md:pt-36 pb-14 md:pb-20 min-h-[calc(100vh-5rem)] md:min-h-[560px] lg:min-h-[620px] flex items-end">
                        <div className="w-full grid lg:grid-cols-[minmax(0,0.95fr)_minmax(260px,0.42fr)] gap-8 items-end">
                            <div className="max-w-2xl">
                                <p className="text-[#dba45f] text-[11px] md:text-xs font-black uppercase tracking-[0.42em] mb-5 md:mb-7">
                                    Collection 2026
                                </p>
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

                            <div className="hidden md:flex justify-end">
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

                    {/* === MASONRY CSS COLUMNS ===
                          Layout 100% natif via `column-count` : aucun calcul JS, aucun ResizeObserver,
                          aucun flicker au switch de filtre. Les cartes prennent leur hauteur naturelle
                          (aspect-ratio image) et le navigateur gère la composition (GPU compositor).
                          Ordre column-major standard (style Pinterest). */}
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
                    `}</style>
                    {totalVisible === 0 ? (
                        <div className="min-h-80 border border-[#8a5b2a]/40 flex items-center justify-center text-center">
                            <p className="font-serif text-2xl text-stone-400">Aucune pièce disponible.</p>
                        </div>
                    ) : (
                        // Chaque batch dans SON propre conteneur columns → les cartes des batches
                        // précédents ne bougent JAMAIS quand on clique "Voir plus". Seul le dernier
                        // batch (freshBatchIndex) joue l'animation cinématographique d'apparition.
                        batches.map((batch, batchIndex) => {
                            const isFreshBatch = batchIndex === freshBatchIndex;
                            return (
                                <div
                                    key={batchIndex}
                                    className={`columns-2 md:columns-3 lg:columns-4 gap-3 [column-fill:_balance] ${batchIndex === 0 ? 'mt-2 md:mt-4' : ''}`}
                                >
                                    {batch.map((item, itemIndex) => {
                                        // Stagger 90ms cap 1080ms — uniquement sur le batch frais.
                                        const delay = isFreshBatch ? Math.min(itemIndex * 90, 1080) : 0;
                                        return (
                                            <div
                                                key={item.id}
                                                className={`mb-3 break-inside-avoid ${isFreshBatch ? 'tat-fresh-card' : ''}`}
                                                style={isFreshBatch ? { animationDelay: `${delay}ms` } : undefined}
                                            >
                                                <ProductCard
                                                    item={item}
                                                    onClick={() => onSelectItem(item.id)}
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })
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
