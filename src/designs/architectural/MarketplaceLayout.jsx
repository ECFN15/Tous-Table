import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ProductCard from './components/ProductCard';
import { ArrowDown, ArrowRight, ChevronDown, Hammer, ShieldCheck, Tag, Truck } from 'lucide-react';

const CATEGORIES = [
    { id: 'all', label: 'Tous les produits', match: () => true },
    { id: 'buffets', label: 'Buffets & meubles', match: (item) => /buffet|bahut|meuble|commode|armoire/i.test(`${item.name} ${item.category || ''}`) },
    { id: 'tables', label: 'Tables', match: (item) => /table|bureau|comptoir/i.test(`${item.name} ${item.category || ''}`) },
    { id: 'chairs', label: 'Chaises', match: (item) => /chaise|fauteuil|banc|tabouret/i.test(`${item.name} ${item.category || ''}`) },
    { id: 'storage', label: 'Rangements', match: (item) => /rangement|vestiaire|porte[\s-]?manteaux|coffre|armoire/i.test(`${item.name} ${item.category || ''}`) },
    { id: 'accessories', label: 'Accessoires', match: (item) => /miroir|vase|accessoire|d[eé]coration|d[eé]co/i.test(`${item.name} ${item.category || ''}`) },
];

const FILTER_DROPDOWNS = [
    { id: 'category', label: 'Catégorie' },
    { id: 'material', label: 'Matière' },
    { id: 'color', label: 'Couleur' },
    { id: 'price', label: 'Prix' },
    { id: 'availability', label: 'Disponibilité' },
];

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
const GALLERY_HERO_IMAGE = '/images/gallery/hero-buffet-parisien-2026-2020.webp';
const GALLERY_HERO_SRC_SET = [
    '/images/gallery/hero-buffet-parisien-2026-960.webp 960w',
    '/images/gallery/hero-buffet-parisien-2026-1440.webp 1440w',
    '/images/gallery/hero-buffet-parisien-2026-2020.webp 2020w',
].join(', ');
const GALLERY_HERO_MOBILE_SRC_SET = [
    '/images/gallery/hero-buffet-parisien-2026-mobile-640.webp 640w',
    '/images/gallery/hero-buffet-parisien-2026-mobile-840.webp 840w',
    '/images/gallery/hero-buffet-parisien-2026-mobile-1122.webp 1122w',
].join(', ');
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
    const { activeCollection, filter, setFilter } = headerProps || {};
    const [activeCategory, setActiveCategory] = useState('all');
    const [sortMode, setSortMode] = useState('recent');
    const [visibleCount, setVisibleCount] = useState(24);
    const [numCols, setNumCols] = useState(4);

    // Masonry state
    const [positions, setPositions] = useState({});
    const [containerHeight, setContainerHeight] = useState(0);
    const containerRef = useRef(null);
    const measuredHeights = useRef({});  // id → px height
    const visibleItemsRef = useRef([]);
    const numColsRef = useRef(numCols);
    const GAP = 12;

    const recomputeAll = useCallback((items, cols, containerWidth) => {
        if (!containerWidth || !items.length) return;
        const colWidth = (containerWidth - GAP * (cols - 1)) / cols;
        const colHeights = Array(cols).fill(0);
        const newPositions = {};
        items.forEach((item) => {
            const h = measuredHeights.current[item.id] || 280;
            const col = colHeights.indexOf(Math.min(...colHeights));
            newPositions[item.id] = {
                top: colHeights[col],
                left: col * (colWidth + GAP),
                width: colWidth,
            };
            colHeights[col] += h + GAP;
        });
        setPositions(newPositions);
        setContainerHeight(Math.max(...colHeights));
    }, []);

    // Keep a stable ref to recomputeAll so the ResizeObserver callback never goes stale
    const recomputeAllRef = useRef(recomputeAll);
    useEffect(() => { recomputeAllRef.current = recomputeAll; }, [recomputeAll]);

    // Single stable ResizeObserver (created once)
    const roRef = useRef(null);
    if (!roRef.current) {
        roRef.current = new ResizeObserver((entries) => {
            let changed = false;
            entries.forEach((entry) => {
                const id = entry.target.dataset.itemid;
                if (!id) return;
                const h = entry.contentRect.height;
                if (h > 0 && measuredHeights.current[id] !== h) {
                    measuredHeights.current[id] = h;
                    changed = true;
                }
            });
            if (changed && containerRef.current) {
                recomputeAllRef.current(visibleItemsRef.current, numColsRef.current, containerRef.current.offsetWidth);
            }
        });
    }

    useEffect(() => {
        if (setHeaderProps && headerProps) setHeaderProps(headerProps);
        return () => {
            if (setHeaderProps) setHeaderProps(null);
        };
    }, [activeCollection, filter, setHeaderProps]);

    // Nombre de colonnes du masonry selon la taille d'écran
    useEffect(() => {
        const updateCols = () => {
            const w = window.innerWidth;
            if (w < 640) setNumCols(2);
            else if (w < 1024) setNumCols(3);
            else setNumCols(4);
        };
        updateCols();
        window.addEventListener('resize', updateCols);
        return () => window.removeEventListener('resize', updateCols);
    }, []);

    // Keep numColsRef in sync and recompute on column count change
    useEffect(() => {
        numColsRef.current = numCols;
        if (containerRef.current && visibleItemsRef.current.length) {
            recomputeAll(visibleItemsRef.current, numCols, containerRef.current.offsetWidth);
        }
    }, [numCols, recomputeAll]);

    // Keep visibleItemsRef in sync
    useEffect(() => {
        visibleItemsRef.current = visibleItems;
    });

    // Reset masonry when sort/filter/category changes (full recompute)
    const prevSortKey = useRef('');
    useEffect(() => {
        const key = `${activeCategory}-${sortMode}`;
        if (key === prevSortKey.current) return;
        prevSortKey.current = key;
        measuredHeights.current = {};
        setPositions({});
        setContainerHeight(0);
    }, [activeCategory, sortMode]);

    // Container ResizeObserver for responsive reflow
    useEffect(() => {
        if (!containerRef.current) return;
        const ro = new ResizeObserver(() => {
            if (containerRef.current && visibleItemsRef.current.length) {
                recomputeAll(visibleItemsRef.current, numColsRef.current, containerRef.current.offsetWidth);
            }
        });
        ro.observe(containerRef.current);
        return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [recomputeAll]);

    // Ref callback: observe/unobserve individual item elements
    const setItemRef = useCallback((el, id) => {
        if (el) {
            roRef.current.observe(el);
        }
    }, []);

    const currentCategory = CATEGORIES.find((category) => category.id === activeCategory) || CATEGORIES[0];

    const sortedItems = useMemo(() => {
        const categoryFiltered = items.filter((item) => currentCategory.match(item));
        return [...categoryFiltered].sort((a, b) => {
            if (sortMode === 'priceAsc') return getPrice(a) - getPrice(b);
            if (sortMode === 'priceDesc') return getPrice(b) - getPrice(a);
            return getMillis(b.createdAt || b.updatedAt) - getMillis(a.createdAt || a.updatedAt);
        });
    }, [items, currentCategory, sortMode]);

    const visibleItems = sortedItems.slice(0, visibleCount);
    const heroItem = items.find((item) => /buffet|bahut|commode|armoire|meuble|vestiaire/i.test(`${item.name} ${item.category || ''}`)) || items[0];
    const heroImage = GALLERY_HERO_IMAGE;

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
                    {heroImage && (
                        <picture>
                            <source
                                media="(max-width: 767px)"
                                srcSet={GALLERY_HERO_MOBILE_SRC_SET}
                                sizes="100vw"
                            />
                            <img
                                src={heroImage}
                                srcSet={GALLERY_HERO_SRC_SET}
                                sizes="100vw"
                                alt={heroItem?.name || 'Mobilier ancien restauré'}
                                className="absolute inset-0 h-full w-full object-cover object-center"
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
                                    Made in<br />Normandie_
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
                                {CATEGORIES.map((category) => {
                                    const active = activeCategory === category.id;
                                    return (
                                        <button
                                            key={category.id}
                                            onClick={() => {
                                                setActiveCategory(category.id);
                                                setVisibleCount(24);
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

                            {/* Filter bar */}
                            <div className="flex flex-wrap items-center justify-between gap-4 py-5">
                                <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                                    <span className="text-stone-400 text-[10px] font-black uppercase tracking-[0.26em] mr-1">Filtrer :</span>
                                    {FILTER_DROPDOWNS.map((dd) => (
                                        <button
                                            key={dd.id}
                                            type="button"
                                            onClick={() => {
                                                if (dd.id === 'category') {
                                                    setActiveCategory('all');
                                                    setVisibleCount(24);
                                                }
                                                if (dd.id === 'availability') {
                                                    setFilter?.(filter === 'auction' ? 'fixed' : 'auction');
                                                }
                                            }}
                                            className="inline-flex h-10 items-center gap-2 rounded-full border border-[#8a5b2a]/50 px-4 text-stone-200 text-[10px] font-black uppercase tracking-[0.22em] transition-colors hover:border-[#dba45f] hover:text-white"
                                        >
                                            <span>{dd.label}</span>
                                            <ChevronDown size={14} strokeWidth={1.8} className="text-stone-400" />
                                        </button>
                                    ))}
                                </div>

                                <label className="flex items-center gap-3">
                                    <span className="hidden sm:inline text-stone-400 text-[10px] font-black uppercase tracking-[0.26em]">Trier par :</span>
                                    <span className="relative">
                                        <select
                                            value={sortMode}
                                            onChange={(event) => setSortMode(event.target.value)}
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

                    {/* === MASONRY absolue ===
                          Les cartes sont positionnées en absolu après mesure de leur hauteur réelle.
                          Chaque carte occupe son ratio naturel. "Voir plus" n'affecte pas les positions existantes. */}
                    {visibleItems.length === 0 ? (
                        <div className="min-h-80 border border-[#8a5b2a]/40 flex items-center justify-center text-center">
                            <p className="font-serif text-2xl text-stone-400">Aucune pièce disponible.</p>
                        </div>
                    ) : (
                        <div
                            ref={containerRef}
                            className="mt-2 md:mt-4 relative w-full"
                            style={{ height: containerHeight > 0 ? containerHeight : 'auto', minHeight: 400 }}
                        >
                            {visibleItems.map((item) => {
                                const pos = positions[item.id];
                                return (
                                    <div
                                        key={item.id}
                                        data-itemid={item.id}
                                        ref={(el) => setItemRef(el, item.id)}
                                        style={pos ? {
                                            position: 'absolute',
                                            top: pos.top,
                                            left: pos.left,
                                            width: pos.width,
                                        } : {
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            visibility: 'hidden',
                                        }}
                                    >
                                        <ProductCard
                                            item={item}
                                            onClick={() => onSelectItem(item.id)}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {visibleCount < sortedItems.length && (
                        <div className="flex justify-center pt-10">
                            <button
                                type="button"
                                onClick={() => setVisibleCount((count) => count + 12)}
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
