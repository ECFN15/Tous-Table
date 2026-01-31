import React, { useState } from 'react';
import ProductCard from './components/ProductCard';
import ArchitecturalHeader from './components/ArchitecturalHeader'; // Import
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

            {/* --- HEADER INTÉGRÉ (VIA COMPONENT) --- */}
            <ArchitecturalHeader
                headerProps={headerProps}
                user={user}
                onShowLogin={onShowLogin}
                onOpenMenu={onOpenMenu}
                onOpenCart={onOpenCart}
                wishlistCount={wishlistCount}
            />

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
