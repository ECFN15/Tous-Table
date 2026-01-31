import React, { useState } from 'react';
import ProductCard from './components/ProductCard';
import { Bookmark, LayoutGrid, Rows, GripHorizontal, ChevronDown, Menu, ShoppingBag, ShieldCheck } from 'lucide-react';

/**
 * LAYOUT : ARCHITECTURAL (EDITORIAL V5)
 * - Added: Connection Button in Header.
 * - Fixed: Broken Menu/Cart triggers (Validation of props passing).
 */
const MarketplaceLayout = ({
    items,
    palette,
    onComment,
    onSelectItem,
    onShowLogin,
    headerProps,
    user,
    onOpenMenu, // GLOBAL MENU TRIGGER
    onOpenCart  // GLOBAL CART TRIGGER
}) => {
    // Déstructuration des props de header
    const { activeCollection, setActiveCollection, filter, setFilter } = headerProps || {};
    const [viewMode, setViewMode] = useState('editorial'); // 'catalog', 'editorial', 'list'
    const [wishlistCount, setWishlistCount] = useState(0);

    const toggleWishlist = (val) => {
        setWishlistCount(prev => val ? prev + 1 : Math.max(0, prev - 1));
    };

    return (
        <div className="w-full min-h-screen bg-[#FAFAF9] dark:bg-[#0A0A0A] text-stone-900 dark:text-stone-200 transition-colors duration-700 selection:bg-stone-300 selection:text-black">

            {/* --- HEADER INTÉGRÉ (STICKY) --- */}
            <header className="sticky top-0 z-[100] bg-[#FAFAF9]/95 dark:bg-[#0A0A0A]/95 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 transition-colors duration-500">
                <div className="max-w-[1920px] mx-auto px-6 md:px-12 h-20 flex items-center justify-between">

                    {/* 1. LEFT: LOGO & TABS */}
                    <div className="flex items-center gap-8">
                        {/* MINI LOGO TEXT */}
                        <div className="flex flex-col leading-none cursor-pointer group" onClick={() => window.location.href = '/'}>
                            <span className="font-black uppercase text-sm tracking-widest group-hover:text-stone-500 transition-colors">Tous à Table</span>
                            <span className="font-serif italic text-[10px] text-stone-400">Atelier Normand</span>
                        </div>

                        {/* SEPARATOR */}
                        <div className="h-8 w-px bg-stone-200 dark:bg-stone-800 hidden md:block"></div>

                        {/* COLLECTION TABS */}
                        <nav className="hidden md:flex items-center gap-1">
                            <button
                                onClick={() => setActiveCollection('furniture')}
                                className={`px-4 py-1.5 rounded text-[11px] font-bold uppercase tracking-widest transition-all ${activeCollection === 'furniture' ? 'text-black dark:text-white bg-stone-100 dark:bg-stone-800' : 'text-stone-400 hover:text-stone-600'}`}
                            >
                                Mobilier
                            </button>
                            <button
                                onClick={() => setActiveCollection('cutting_boards')}
                                className={`px-4 py-1.5 rounded text-[11px] font-bold uppercase tracking-widest transition-all ${activeCollection === 'cutting_boards' ? 'text-black dark:text-white bg-stone-100 dark:bg-stone-800' : 'text-stone-400 hover:text-stone-600'}`}
                            >
                                Objets d'Art
                            </button>
                        </nav>
                    </div>

                    {/* 2. RIGHT: ACTIONS */}
                    <div className="flex items-center gap-6">

                        {/* GLOBAL ACTIONS */}
                        <div className="flex items-center gap-4">

                            {/* LOGIN BUTTON */}
                            {(!user || user.isAnonymous) ? (
                                <button onClick={onShowLogin} className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded border border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all group">
                                    <ShieldCheck size={14} className="text-stone-400 group-hover:text-black dark:group-hover:text-white" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500 group-hover:text-stone-900 dark:group-hover:text-stone-200">Connexion</span>
                                </button>
                            ) : (
                                <div className="hidden md:flex items-center gap-2 px-4 py-1.5">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Connecté</span>
                                </div>
                            )}

                            <button onClick={onOpenCart} className="relative group p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded transition-colors" title="Panier">
                                <ShoppingBag size={20} strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
                                {wishlistCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-black"></span>}
                            </button>

                            <button onClick={onOpenMenu} className="flex items-center gap-2 group cursor-pointer hover:bg-stone-100 dark:hover:bg-stone-800 px-3 py-1.5 rounded transition-colors" title="Menu">
                                <span className="hidden md:block text-[10px] font-bold uppercase tracking-widest group-hover:underline underline-offset-4">Menu</span>
                                <Menu size={20} strokeWidth={1.5} />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* --- MAIN CONTENT --- */}
            <main className="max-w-[1920px] mx-auto px-6 md:px-12 py-16 md:py-24">

                {/* HERO TITLE */}
                <div className="mb-24 flex flex-col items-center text-center gap-6 max-w-4xl mx-auto">
                    <span className="text-[10px] uppercase font-bold tracking-[0.4em] text-stone-400">
                        Collection 2026
                    </span>
                    <h2 className="font-serif text-5xl md:text-7xl lg:text-8xl text-stone-900 dark:text-stone-100 leading-[0.9]">
                        {activeCollection === 'furniture' ? 'L\'Élégance du Temps.' : 'L\'Art de la Table.'}
                    </h2>
                </div>


                {/* GRID SYSTEM */}
                <div className="grid gap-x-4 gap-y-16 transition-all duration-700 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {items.length === 0 ? (
                        <div className="col-span-full py-40 text-center opacity-30 font-serif text-2xl italic">
                            Aucune pièce disponible.
                        </div>
                    ) : (
                        items.map((item, index) => (
                            <div
                                key={item.id}
                                onClick={() => onSelectItem(item.id)}
                                className="w-full group"
                            >
                                <ProductCard
                                    item={item}
                                    layoutMode="editorial"
                                    isBig={false}
                                    onToggleWishlist={toggleWishlist}
                                />
                            </div>
                        ))
                    )}
                </div>

                <div className="h-32"></div>
            </main>
        </div>
    );
};

export default MarketplaceLayout;
