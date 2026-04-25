import React, { useMemo, useState } from 'react';
import ProductCard from './components/ProductCard';
import { ArrowDown, ArrowRight, ChevronDown, Hammer, ShieldCheck, SlidersHorizontal, Tag, Truck } from 'lucide-react';

const CATEGORIES = [
    { id: 'all', label: 'Tous les produits', match: () => true },
    { id: 'buffets', label: 'Buffets & meubles', match: (item) => /buffet|bahut|meuble|commode|armoire/i.test(`${item.name} ${item.category || ''}`) },
    { id: 'tables', label: 'Tables', match: (item) => /table|bureau|comptoir/i.test(`${item.name} ${item.category || ''}`) },
    { id: 'chairs', label: 'Chaises', match: (item) => /chaise|fauteuil|banc|tabouret/i.test(`${item.name} ${item.category || ''}`) },
    { id: 'storage', label: 'Rangements', match: (item) => /rangement|vestiaire|porte manteaux|coffre|armoire/i.test(`${item.name} ${item.category || ''}`) },
    { id: 'accessories', label: 'Accessoires', match: (item) => /miroir|vase|accessoire|decoration|deco/i.test(`${item.name} ${item.category || ''}`) },
];

const BENEFITS = [
    {
        title: 'Pieces uniques',
        body: 'Chaque meuble est unique et selectionne avec exigence.',
        icon: Tag,
    },
    {
        title: 'Restauration artisanale',
        body: 'Restauration a la main dans notre atelier en Normandie.',
        icon: Hammer,
    },
    {
        title: 'Matieres durables',
        body: 'Bois massif et materiaux nobles pour des meubles faits pour durer.',
        icon: ShieldCheck,
    },
    {
        title: 'Livraison soignee',
        body: 'Livraison partout en France avec emballage sur mesure.',
        icon: Truck,
    },
];

const getImage = (item) => item?.images?.[0] || item?.imageUrl || item?.thumbnailUrl || '';
const getPrice = (item) => Number(item?.currentPrice || item?.startingPrice || item?.price || 0);
const getMillis = (value) => {
    if (!value) return 0;
    if (typeof value.toMillis === 'function') return value.toMillis();
    if (value.seconds) return value.seconds * 1000;
    return new Date(value).getTime() || 0;
};

const getCardLayout = (index) => {
    const pattern = [
        'lg:col-span-4 lg:row-span-2',
        'lg:col-span-4',
        'lg:col-span-4 lg:row-span-2',
        'lg:col-span-4',
        'lg:col-span-2',
        'lg:col-span-2',
        'lg:col-span-6',
        'lg:col-span-3',
        'lg:col-span-3',
        'lg:col-span-6',
    ];
    return pattern[index % pattern.length];
};

const MarketplaceLayout = ({
    items,
    onSelectItem,
    headerProps,
    darkMode,
    setHeaderProps
}) => {
    const { activeCollection, setActiveCollection, filter, setFilter, onOpenShop } = headerProps || {};
    const [activeCategory, setActiveCategory] = useState('all');
    const [sortMode, setSortMode] = useState('recent');
    const [visibleCount, setVisibleCount] = useState(10);

    React.useEffect(() => {
        if (setHeaderProps && headerProps) setHeaderProps(headerProps);
        return () => {
            if (setHeaderProps) setHeaderProps(null);
        };
    }, [activeCollection, filter, setHeaderProps]);

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
    const heroImage = getImage(heroItem);

    const scrollToCollection = () => {
        document.getElementById('collection-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <div className="w-full min-h-screen bg-[#050605] text-stone-100 selection:bg-[#dba45f] selection:text-black">
            <main className="relative overflow-hidden">
                <section className="relative min-h-[calc(100vh-5rem)] md:min-h-[560px] lg:min-h-[620px] border-b border-[#8a5b2a]/30 overflow-hidden">
                    {heroImage && (
                        <img
                            src={heroImage}
                            alt={heroItem?.name || 'Mobilier ancien restaure'}
                            className="absolute inset-0 h-full w-full object-cover object-center opacity-85"
                            loading="eager"
                        />
                    )}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_42%,rgba(0,0,0,0.04),rgba(0,0,0,0.62)_42%,rgba(0,0,0,0.98)_92%)]" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-black/15" />
                    <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black to-transparent" />

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
                                    Mobilier ancien restaure et pieces artisanales en bois massif. Chaque meuble raconte une histoire, chaque piece est unique.
                                </p>
                                <button
                                    onClick={scrollToCollection}
                                    className="mt-8 md:mt-10 inline-flex h-14 md:h-16 items-center justify-center gap-6 border border-[#dba45f] px-7 md:px-10 text-[#f0b969] text-[11px] md:text-xs font-black uppercase tracking-[0.28em] transition-all hover:bg-[#dba45f] hover:text-black"
                                >
                                    Decouvrir la collection
                                    <ArrowRight size={20} strokeWidth={1.5} />
                                </button>
                            </div>

                            <div className="hidden md:flex justify-end">
                                <div className="relative h-36 w-36 lg:h-44 lg:w-44 rounded-full border border-[#dba45f] text-[#dba45f] flex items-center justify-center bg-black/20 backdrop-blur-sm">
                                    <div className="absolute inset-3 rounded-full border border-[#dba45f]/25" />
                                    <span className="font-serif text-5xl lg:text-6xl">AN</span>
                                    <span className="absolute inset-0 animate-spin-extremely-slow rounded-full text-[9px] uppercase tracking-[0.38em] flex items-center justify-center">
                                        Atelier Normand - Pieces Uniques
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="collection-grid" className="max-w-[1920px] mx-auto px-5 md:px-16 py-8 md:py-12">
                    <div className="grid gap-7 lg:grid-cols-[290px_minmax(0,1fr)] lg:items-start">
                        <aside className="hidden lg:block sticky top-28">
                            <p className="font-serif text-lg text-stone-300 mb-3">Notre mobilier</p>
                            <p className="font-serif text-2xl leading-snug text-stone-100/90">
                                Des pieces uniques,<br />selectionnees avec exigence.
                            </p>
                        </aside>

                        <div className="min-w-0">
                            <div className="flex flex-col gap-6 border-b border-[#8a5b2a]/25 pb-6">
                                <div className="hidden md:flex items-center gap-5 overflow-x-auto no-scrollbar">
                                    {CATEGORIES.map((category) => (
                                        <button
                                            key={category.id}
                                            onClick={() => {
                                                setActiveCategory(category.id);
                                                setVisibleCount(10);
                                            }}
                                            className={`shrink-0 rounded-full border px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                                                activeCategory === category.id
                                                    ? 'border-[#dba45f] text-white bg-[#dba45f]/10'
                                                    : 'border-transparent text-[#dba45f] hover:border-[#dba45f]/40 hover:text-white'
                                            }`}
                                        >
                                            {category.label}
                                        </button>
                                    ))}
                                </div>

                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <span className="text-[#dba45f] text-[10px] font-black uppercase tracking-[0.24em]">Filtrer :</span>
                                        <button
                                            onClick={() => {
                                                setFilter?.(filter === 'auction' ? 'fixed' : 'auction');
                                            }}
                                            className="inline-flex h-11 items-center gap-3 rounded border border-[#8a5b2a]/70 px-4 text-[#f0b969] text-[10px] font-black uppercase tracking-[0.2em] transition-colors hover:border-[#dba45f]"
                                        >
                                            <span className="hidden sm:inline">{filter === 'auction' ? 'Encheres' : 'Categorie'}</span>
                                            <SlidersHorizontal size={16} strokeWidth={1.5} />
                                        </button>
                                        <button
                                            onClick={() => {
                                                setActiveCollection?.(activeCollection === 'cutting_boards' ? 'furniture' : 'cutting_boards');
                                                setVisibleCount(10);
                                            }}
                                            className="hidden sm:inline-flex h-11 items-center rounded border border-[#8a5b2a]/70 px-4 text-stone-300 text-[10px] font-black uppercase tracking-[0.18em] transition-colors hover:border-[#dba45f] hover:text-white"
                                        >
                                            {activeCollection === 'cutting_boards' ? 'Planches' : 'Mobilier'}
                                        </button>
                                        {onOpenShop && (
                                            <button
                                                onClick={onOpenShop}
                                                className="hidden xl:inline-flex h-11 items-center rounded border border-[#8a5b2a]/70 px-4 text-stone-300 text-[10px] font-black uppercase tracking-[0.18em] transition-colors hover:border-[#dba45f] hover:text-white"
                                            >
                                                Le comptoir
                                            </button>
                                        )}
                                    </div>

                                    <label className="flex items-center gap-4">
                                        <span className="hidden sm:inline text-stone-200 text-[10px] font-black uppercase tracking-[0.24em]">Trier par :</span>
                                        <span className="relative">
                                            <select
                                                value={sortMode}
                                                onChange={(event) => setSortMode(event.target.value)}
                                                className="h-11 appearance-none rounded border border-[#8a5b2a]/70 bg-black/20 pl-4 pr-10 text-[#f0b969] text-[10px] font-black uppercase tracking-[0.18em] outline-none transition-colors hover:border-[#dba45f] focus:border-[#dba45f]"
                                            >
                                                <option value="recent">Plus recents</option>
                                                <option value="priceAsc">Prix croissant</option>
                                                <option value="priceDesc">Prix decroissant</option>
                                            </select>
                                            <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#f0b969]" />
                                        </span>
                                    </label>
                                </div>
                            </div>

                            <div className="mt-7 grid grid-cols-2 lg:grid-cols-12 auto-rows-[210px] sm:auto-rows-[260px] lg:auto-rows-[180px] gap-4 md:gap-5">
                                {visibleItems.length === 0 ? (
                                    <div className="col-span-full min-h-80 border border-[#8a5b2a]/40 flex items-center justify-center text-center">
                                        <p className="font-serif text-2xl text-stone-400">Aucune piece disponible.</p>
                                    </div>
                                ) : (
                                    visibleItems.map((item, index) => (
                                        <ProductCard
                                            key={item.id}
                                            item={item}
                                            className={`${index === 6 ? 'col-span-2' : ''} ${getCardLayout(index)}`}
                                            onClick={() => onSelectItem(item.id)}
                                        />
                                    ))
                                )}
                            </div>

                            {visibleCount < sortedItems.length && (
                                <div className="flex justify-center pt-8">
                                    <button
                                        onClick={() => setVisibleCount((count) => count + 8)}
                                        className="inline-flex h-14 min-w-[280px] items-center justify-center gap-6 border border-[#dba45f] px-8 text-[#f0b969] text-[11px] font-black uppercase tracking-[0.24em] transition-all hover:bg-[#dba45f] hover:text-black"
                                    >
                                        Voir plus de produits
                                        <ArrowDown size={19} strokeWidth={1.5} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-9 md:mt-12 grid gap-0 overflow-hidden border border-[#8a5b2a]/20 bg-[#15120e]/80 md:grid-cols-4">
                        {BENEFITS.map(({ title, body, icon: Icon }, index) => (
                            <div key={title} className={`flex gap-5 p-6 md:p-7 ${index > 0 ? 'border-t md:border-t-0 md:border-l' : ''} border-[#8a5b2a]/25`}>
                                <Icon size={32} strokeWidth={1.35} className="shrink-0 text-[#dba45f]" />
                                <div>
                                    <h2 className="text-[#dba45f] text-[11px] font-black uppercase tracking-[0.18em]">{title}</h2>
                                    <p className="mt-2 font-serif text-lg leading-snug text-stone-200">{body}</p>
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
