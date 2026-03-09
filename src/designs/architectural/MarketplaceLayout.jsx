import React, { useState } from 'react';
import ProductCard from './components/ProductCard';
import ArchitecturalHeader from './components/ArchitecturalHeader';
import TextType from '../../components/ui/TextType';
import { Bookmark, LayoutGrid, Rows, GripHorizontal, ChevronDown, Menu, ShoppingBag, ShieldCheck, Armchair, Gavel } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * LAYOUT : ARCHITECTURAL (EDITORIAL V5)
 * - Added: Connection Button in Header.
 * - Fixed: Broken Menu/Cart triggers (Validation of props passing).
 */

const CuttingBoard = ({ size = 14, strokeWidth = 2, ...props }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <rect x="3" y="7" width="18" height="12" rx="1.5" />
        <circle cx="7" cy="13" r="1.2" />
        <path d="M21 11V15" opacity="0.3" />
    </svg>
);

const MarketplaceLayout = ({
    items,
    palette,
    onSelectItem,
    onShowLogin,
    headerProps,
    user,
    onOpenCart,  // GLOBAL CART TRIGGER
    toggleTheme, // Global Theme Toggle
    darkMode, // Explicit state
    setHeaderProps // Global Header Sync
}) => {
    // Déstructuration des props de header
    const { activeCollection, setActiveCollection, filter, setFilter } = headerProps || {};
    const [viewMode, setViewMode] = useState('editorial'); // 'catalog', 'editorial', 'list'
    const [wishlistCount, setWishlistCount] = useState(0);

    const toggleWishlist = (val) => {
        setWishlistCount(prev => val ? prev + 1 : Math.max(0, prev - 1));
    };

    // SYNC WITH GLOBAL HEADER
    React.useEffect(() => {
        if (setHeaderProps) {
            setHeaderProps(headerProps);
        }
        return () => {
            if (setHeaderProps) setHeaderProps(null);
        };
    }, [headerProps, setHeaderProps]);

    return (
        <div className={`w-full min-h-screen transition-colors duration-700 selection:bg-stone-300 selection:text-black bg-transparent`}>
            {/* ArchitecturalHeader removed here, it's now handled globally in App.jsx */}

            {/* --- MAIN CONTENT --- */}
            <main className="max-w-[1920px] mx-auto px-4 md:px-12 py-10 md:pt-8 md:pb-12">

                {/* HERO TITLE */}
                <div className="mb-10 md:mb-8 flex flex-col items-center text-center gap-4 md:gap-4 max-w-7xl mx-auto">
                    <span className={`text-[10px] uppercase font-bold tracking-[0.4em] ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                        Collection 2026
                    </span>
                    <h2 className={`font-serif text-4xl md:text-7xl lg:text-8xl whitespace-nowrap leading-[0.9] min-h-[1.8em] flex items-center justify-center tracking-tight md:tracking-normal ${darkMode ? 'text-stone-100' : 'text-stone-900'}`}>
                        <TextType
                            key={activeCollection}
                            text={activeCollection === 'furniture'
                                ? ["Tous à Table", "Savoir-Faire", "Made in Normandie", "L'Élégance du Temps.", "Votre Intérieur Sublimé."]
                                : ["L'Art de la Table.", "Apéro Chic.", "Pièce Unique.", "Service d'Exception."]}
                            typingSpeed={150}
                            deletingSpeed={50}
                            pauseDuration={1500}
                            loop={true}
                            showCursor={true}
                            cursorCharacter="_"
                        />
                    </h2>

                    {/* MOBILE NAVIGATION BUTTONS (Integrated in Hero space) */}
                    <div className="flex md:hidden flex-wrap justify-center gap-3 mt-6">
                        {/* MOBILIER BUTTON */}
                        <div className="relative group p-[1.5px] rounded-full overflow-hidden">
                            {activeCollection !== 'furniture' && (
                                <motion.div
                                    animate={{ rotate: -360 }}
                                    transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
                                    className="absolute inset-[-150%] z-0"
                                    style={{
                                        background: "conic-gradient(from 0deg, transparent 60%, #1c1917 70%, #44403c 85%, #ffffff 99%, transparent 100%)",
                                    }}
                                />
                            )}
                            <button
                                onClick={() => {
                                    setActiveCollection('furniture');
                                    if (setFilter) setFilter('fixed');
                                }}
                                className={`relative z-10 flex items-center gap-2 px-6 py-2.25 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${activeCollection === 'furniture' && filter !== 'auction' ? (darkMode ? 'bg-stone-100 text-black' : 'bg-stone-900 text-white') : (darkMode ? 'bg-stone-900/90 text-stone-500 backdrop-blur-md' : 'bg-stone-100/90 text-stone-400 backdrop-blur-md')}`}
                            >
                                <Armchair size={14} strokeWidth={2.5} />
                                Mobilier
                            </button>
                        </div>

                        {/* PLANCHES BUTTON */}
                        <div className="relative group p-[1.5px] rounded-full overflow-hidden">
                            {activeCollection !== 'cutting_boards' && (
                                <motion.div
                                    animate={{ rotate: -360 }}
                                    transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
                                    className="absolute inset-[-150%] z-0"
                                    style={{
                                        background: "conic-gradient(from 0deg, transparent 60%, #1c1917 70%, #44403c 85%, #ffffff 99%, transparent 100%)",
                                    }}
                                />
                            )}
                            <button
                                onClick={() => setActiveCollection('cutting_boards')}
                                className={`relative z-10 flex items-center gap-2 px-6 py-2.25 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${activeCollection === 'cutting_boards' ? (darkMode ? 'bg-stone-100 text-black' : 'bg-stone-900 text-white') : (darkMode ? 'bg-stone-900/90 text-stone-500 backdrop-blur-md' : 'bg-stone-100/90 text-stone-400 backdrop-blur-md')}`}
                            >
                                <CuttingBoard size={14} strokeWidth={2.5} />
                                Planches
                            </button>
                        </div>

                        {/* ENCHÈRES BUTTON (No Neon) */}
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
                                className="w-full group"
                            >
                                <ProductCard
                                    item={item}
                                    layoutMode="editorial"
                                    isBig={false}
                                    onToggleWishlist={toggleWishlist}
                                    onClick={() => onSelectItem(item.id)}
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
