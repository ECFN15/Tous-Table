import React, { useEffect, useMemo, useState } from 'react';
import { Info } from 'lucide-react';
import SEO from '../components/shared/SEO';
import ShopProductCard from '../components/shop/ShopProductCard';

const CATEGORIES = [
    { id: 'all', label: 'Tout' },
    { id: 'patines_cires', label: 'Patines & Cires' },
    { id: 'peintures', label: 'Peintures' },
    { id: 'huiles', label: 'Huiles' },
    { id: 'resines', label: 'Resines' },
    { id: 'preparation', label: 'Preparation' },
    { id: 'outils', label: 'Outils' }
];

const TIERS = [
    { id: 'all', label: 'Tous' },
    { id: 'essentiel', label: 'Essentiel' },
    { id: 'premium', label: 'Premium' },
    { id: 'expert', label: 'Expert' }
];

const ShopView = ({ affiliateProducts = [], darkMode = false, setHeaderProps }) => {
    const [activeCategory, setActiveCategory] = useState('all');
    const [activeTier, setActiveTier] = useState('all');
    const [sortBy, setSortBy] = useState('featured');

    useEffect(() => {
        if (setHeaderProps) {
            setHeaderProps({
                title: "L'Atelier",
                hideCollectionFilter: true,
                hideAuctionFilter: true
            });
        }
        return () => {
            if (setHeaderProps) setHeaderProps(null);
        };
    }, [setHeaderProps]);

    const filteredProducts = useMemo(() => {
        const products = [...affiliateProducts];

        let result = products;

        if (activeCategory !== 'all') {
            result = result.filter((p) => p.category === activeCategory);
        }

        if (activeTier !== 'all') {
            result = result.filter((p) => p.tier === activeTier);
        }

        if (sortBy === 'price_asc') result.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
        if (sortBy === 'price_desc') result.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
        if (sortBy === 'popular') result.sort((a, b) => (Number(b.clickCount) || 0) - (Number(a.clickCount) || 0));
        if (sortBy === 'featured') result.sort((a, b) => (Number(Boolean(b.featured)) - Number(Boolean(a.featured))));

        return result;
    }, [affiliateProducts, activeCategory, activeTier, sortBy]);

    return (
        <div className="min-h-screen animate-in fade-in duration-500">
            <SEO
                title="L'Atelier - Produits d'entretien et renovation"
                description="Nos produits selectionnes pour entretenir et restaurer vos meubles : cires, patines, peintures, huiles et outils."
                url="/?page=shop"
            />

            <section className="max-w-[1920px] mx-auto px-6 md:px-12 py-24 md:py-32">
                <p className={`text-[10px] font-black uppercase tracking-[0.4em] ${darkMode ? 'text-stone-500' : 'text-stone-400'}`}>
                    Boutique - Affiliation
                </p>
                <div className="mt-6 space-y-6">
                    <h1 className={`font-serif text-6xl md:text-8xl xl:text-[10rem] leading-[0.88] tracking-tighter ${darkMode ? 'text-white' : 'text-stone-900'}`}>
                        L'Atelier
                    </h1>
                    <p className={`max-w-xl text-base md:text-lg ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                        Produits selectionnes pour entretenir, restaurer et sublimer vos meubles.
                    </p>
                    <p className={`text-[11px] font-black uppercase tracking-widest ${darkMode ? 'text-stone-600' : 'text-stone-400'}`}>
                        {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''}
                    </p>
                </div>
            </section>

            <section className={`sticky top-20 md:top-24 z-30 border-y backdrop-blur-xl ${darkMode ? 'bg-[#0a0a0a]/80 border-white/5' : 'bg-white/80 border-stone-200/60'}`}>
                <div className="max-w-[1920px] mx-auto px-6 md:px-12 py-4 space-y-4">
                    <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
                        {CATEGORIES.map((category) => {
                            const isActive = activeCategory === category.id;
                            return (
                                <button
                                    key={category.id}
                                    onClick={() => setActiveCategory(category.id)}
                                    className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-colors ${isActive
                                        ? (darkMode ? 'bg-white text-stone-900' : 'bg-stone-900 text-white')
                                        : (darkMode ? 'text-stone-500 hover:text-white border border-white/10' : 'text-stone-500 hover:text-stone-900 border border-stone-200')
                                        }`}
                                >
                                    {category.label}
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
                        <div className="flex flex-wrap gap-2">
                            {TIERS.map((tier) => {
                                const isActive = activeTier === tier.id;
                                const activeClass = tier.id === 'premium'
                                    ? 'bg-amber-100 text-amber-800 border-amber-200'
                                    : tier.id === 'expert'
                                        ? (darkMode ? 'bg-white text-stone-900 border-white' : 'bg-stone-900 text-white border-stone-900')
                                        : 'bg-stone-200 text-stone-800 border-stone-200';

                                return (
                                    <button
                                        key={tier.id}
                                        onClick={() => setActiveTier(tier.id)}
                                        className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-opacity ${isActive ? activeClass : (darkMode ? 'text-stone-400 border-white/20 opacity-60 hover:opacity-100' : 'text-stone-500 border-stone-300 opacity-60 hover:opacity-100')}`}
                                    >
                                        {tier.label}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="md:ml-auto">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className={`w-full md:w-auto bg-transparent border rounded-xl px-3 py-2 text-[11px] font-black uppercase tracking-wider ${darkMode ? 'border-white/10 text-stone-300' : 'border-stone-200 text-stone-700'}`}
                            >
                                <option value="featured">Mis en avant</option>
                                <option value="price_asc">Prix croissant</option>
                                <option value="price_desc">Prix decroissant</option>
                                <option value="popular">Populaires</option>
                            </select>
                        </div>
                    </div>
                </div>
            </section>

            <section className="max-w-[1920px] mx-auto px-6 md:px-12 py-10 md:py-14">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
                    {filteredProducts.length === 0 ? (
                        <div className="col-span-full py-24 text-center space-y-3">
                            <p className={darkMode ? 'text-stone-400 text-sm' : 'text-stone-500 text-sm'}>
                                Aucun produit dans cette selection.
                            </p>
                            <button
                                onClick={() => {
                                    setActiveCategory('all');
                                    setActiveTier('all');
                                    setSortBy('featured');
                                }}
                                className={`text-[11px] font-black uppercase tracking-widest ${darkMode ? 'text-stone-200' : 'text-stone-700'}`}
                            >
                                Reinitialiser les filtres
                            </button>
                        </div>
                    ) : (
                        filteredProducts.map((product) => (
                            <ShopProductCard
                                key={product.id}
                                product={product}
                                darkMode={darkMode}
                            />
                        ))
                    )}
                </div>
            </section>

            <section className={`border-t py-6 px-6 md:px-12 ${darkMode ? 'border-white/5' : 'border-stone-200/60'}`}>
                <div className={`max-w-[1920px] mx-auto flex items-center justify-center gap-2 text-[10px] text-center ${darkMode ? 'text-stone-600' : 'text-stone-400'}`}>
                    <Info size={12} />
                    <p>
                        Cette page contient des liens d'affiliation. En achetant via ces liens, vous soutenez notre atelier sans surcout pour vous. {' '}
                        <a href="/mentions-legales#affiliation" className="underline underline-offset-4">En savoir plus</a>
                    </p>
                </div>
            </section>
        </div>
    );
};

export default ShopView;
