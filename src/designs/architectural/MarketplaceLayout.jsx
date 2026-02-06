import React, { useState } from 'react';
import ProductCard from './components/ProductCard';
import ArchitecturalHeader from './components/ArchitecturalHeader'; // Import
import { Bookmark, LayoutGrid, Rows, GripHorizontal, ChevronDown, Menu, ShoppingBag, ShieldCheck, Armchair, Sparkles, Gavel } from 'lucide-react';

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
    onOpenCart,  // GLOBAL CART TRIGGER
    toggleTheme, // Global Theme Toggle
    darkMode // Explicit state
}) => {
    // Déstructuration des props de header
    const { activeCollection, setActiveCollection, filter, setFilter } = headerProps || {};
    const [viewMode, setViewMode] = useState('editorial'); // 'catalog', 'editorial', 'list'
    const [wishlistCount, setWishlistCount] = useState(0);

    const toggleWishlist = (val) => {
        setWishlistCount(prev => val ? prev + 1 : Math.max(0, prev - 1));
    };

    return (
        <div className={`w-full min-h-screen transition-colors duration-700 selection:bg-stone-300 selection:text-black ${darkMode ? 'bg-[#0A0A0A] text-stone-200' : 'bg-[#FAFAF9] text-stone-900'}`}>

            {/* --- HEADER INTÉGRÉ (VIA COMPONENT) --- */}
            <ArchitecturalHeader
                headerProps={headerProps}
                user={user}
                onShowLogin={onShowLogin}
                onOpenMenu={onOpenMenu}
                onOpenCart={onOpenCart}
                wishlistCount={wishlistCount}
                toggleTheme={toggleTheme}
                darkMode={darkMode} // Pass explicit state
            />

            {/* --- MAIN CONTENT --- */}
            <main className="max-w-[1920px] mx-auto px-4 md:px-12 py-10 md:py-24">

                {/* HERO TITLE */}
                <div className="mb-10 md:mb-24 flex flex-col items-center text-center gap-4 md:gap-6 max-w-4xl mx-auto">
                    <span className={`text-[10px] uppercase font-bold tracking-[0.4em] ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                        Collection 2026
                    </span>
                    <h2 className={`font-serif text-5xl md:text-7xl lg:text-8xl leading-[0.9] ${darkMode ? 'text-stone-100' : 'text-stone-900'}`}>
                        {activeCollection === 'furniture' ? 'L\'Élégance du Temps.' : 'L\'Art de la Table.'}
                    </h2>

                    {/* MOBILE NAVIGATION BUTTONS (Integrated in Hero space) */}
                    <div className="flex md:hidden flex-wrap justify-center gap-3 mt-6">
                        <button
                            onClick={() => {
                                setActiveCollection('furniture');
                                if (setFilter) setFilter('fixed');
                            }}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${activeCollection === 'furniture' && filter !== 'auction' ? (darkMode ? 'bg-stone-100 text-black scale-105 shadow-xl shadow-black/50' : 'bg-stone-900 text-white scale-105 shadow-xl shadow-stone-400/20') : (darkMode ? 'bg-stone-900/40 text-stone-500 border border-stone-800' : 'bg-stone-100 text-stone-400 border border-stone-200')}`}
                        >
                            <Armchair size={14} strokeWidth={2.5} />
                            Mobilier
                        </button>
                        <button
                            onClick={() => setActiveCollection('cutting_boards')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${activeCollection === 'cutting_boards' ? (darkMode ? 'bg-stone-100 text-black scale-105 shadow-xl shadow-black/50' : 'bg-stone-900 text-white scale-105 shadow-xl shadow-stone-400/20') : (darkMode ? 'bg-stone-900/40 text-stone-500 border border-stone-800' : 'bg-stone-100 text-stone-400 border border-stone-200')}`}
                        >
                            <Sparkles size={14} strokeWidth={2.5} />
                            Art
                        </button>
                        <button
                            onClick={() => {
                                setActiveCollection('furniture');
                                if (setFilter) setFilter('auction');
                            }}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${activeCollection === 'furniture' && filter === 'auction' ? (darkMode ? 'bg-stone-100 text-black scale-105 shadow-xl shadow-black/50' : 'bg-stone-900 text-white scale-105 shadow-xl shadow-stone-400/20') : (darkMode ? 'bg-stone-900/40 text-stone-500 border border-stone-800' : 'bg-stone-100 text-stone-400 border border-stone-200')}`}
                        >
                            <Gavel size={14} strokeWidth={2.5} />
                            Enchères
                        </button>
                    </div>
                </div>


                {/* GRID SYSTEM */}
                <div className="grid gap-x-4 gap-y-12 md:gap-y-16 transition-all duration-700 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
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
