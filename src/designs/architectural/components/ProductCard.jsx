import React, { useState, Suspense } from 'react';
import { Bookmark, MoveRight, Eye } from 'lucide-react';
import AuctionTimer from '../../../components/ui/AuctionTimer';

/**
 * COMPOSANT : CARTE PRODUIT (DESIGN ARCHITECTURAL v3)
 * - Actions: "Ajouter à la sélection" (Bookmark) + "Détail" (Eye).
 * - Suppression des commentaires/sociaux.
 * - Amélioration Typo & Espacements.
 */
const ProductCard = ({
    item,
    layoutMode,
    isBig,
    onToggleWishlist
}) => {
    const [isBookmarked, setIsBookmarked] = useState(false);

    const handleBookmark = (e) => {
        e.stopPropagation();
        setIsBookmarked(!isBookmarked);
        onToggleWishlist(!isBookmarked);
    };

    return (
        <div className={`group relative flex flex-col gap-6 w-full cursor-pointer ${layoutMode === 'list' ? 'flex-row items-center gap-12 border-b border-stone-200 dark:border-stone-800 pb-12' : ''}`}>

            {/* 1. VISUAL BLOCK */}
            <div className={`relative bg-white dark:bg-[#1A1A1A] overflow-hidden ${layoutMode === 'list' ? 'w-1/3 aspect-[4/3]' : 'w-full aspect-[3/4]'} ${isBig ? 'md:aspect-[16/10]' : ''}`}>
                <img
                    src={item.thumbnailUrl || item.thumbnails?.[0] || item.images?.[0] || item.imageUrl}
                    alt={item.name}
                    className={`w-full h-full object-cover will-change-transform transition-transform duration-[800ms] ease-[cubic-bezier(0.23,1,0.32,1)] ${isBig ? 'group-hover:scale-110' : 'group-hover:scale-110'}`}
                    loading="lazy"
                />

                {/* PREMIUM OVERLAY (Museum Gallery Hook - Desktop Only) */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)] hidden lg:flex items-center justify-center">
                    <div className="relative py-7 px-10 xl:py-9 xl:px-14 2xl:py-12 2xl:px-18 opacity-0 group-hover:opacity-100 transition-all duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)] flex flex-col items-center gap-3 xl:gap-4">
                        {/* Minimal Architectural Frame (Corners) */}
                        <div className="absolute top-0 left-0 w-3 h-3 xl:w-4 xl:h-4 border-t border-l border-white/40 translate-x-2 translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)]"></div>
                        <div className="absolute top-0 right-0 w-3 h-3 xl:w-4 xl:h-4 border-t border-r border-white/40 -translate-x-2 translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)]"></div>
                        <div className="absolute bottom-0 left-0 w-3 h-3 xl:w-4 xl:h-4 border-b border-l border-white/40 translate-x-2 -translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)]"></div>
                        <div className="absolute bottom-0 right-0 w-3 h-3 xl:w-4 xl:h-4 border-b border-r border-white/40 -translate-x-2 -translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)]"></div>

                        <span className="text-[9px] xl:text-[10px] 2xl:text-[11px] font-sans font-black tracking-[0.4em] xl:tracking-[0.6em] 2xl:tracking-[0.8em] uppercase text-white translate-y-2 group-hover:translate-y-0 transition-transform duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)]">
                            Découvrir
                        </span>
                        <div className="w-8 xl:w-10 2xl:w-14 h-[1.5px] bg-white/30 scale-x-0 group-hover:scale-x-100 transition-transform duration-[800ms] ease-[cubic-bezier(0.23,1,0.32,1)] origin-center"></div>
                    </div>
                </div>



                {/* AUCTION TIMER (Discrete Top Left) */}
                {item.auctionActive && (
                    <div className="absolute top-0 left-0 p-6">
                        <div className="px-3 py-1 bg-white/90 dark:bg-black/90 backdrop-blur text-[10px] font-mono border border-black/5 dark:border-white/10 flex items-center gap-2 uppercase tracking-wider">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                            <span>Live Enchère :</span>
                            <Suspense fallback="..:.."><AuctionTimer endDate={item.auctionEnd} /></Suspense>
                        </div>
                    </div>
                )}
            </div>

            {/* 2. INFO BLOCK (Refined Responsive Layout) */}
            <div className={`flex items-start justify-between gap-2 md:gap-4 ${layoutMode === 'list' ? 'flex-1 pt-6' : 'pt-4'}`}>
                {/* Left Side: Material & Name */}
                <div className="flex flex-col gap-0.5 md:gap-1 flex-1 min-w-0">
                    <div className="opacity-50 dark:opacity-40 text-[9px] font-black uppercase tracking-widest truncate">
                        {item.material || 'Matière Inconnue'}
                    </div>
                    <h3 className={`font-serif leading-tight text-[15px] md:text-lg lg:text-xl ${layoutMode === 'list' ? 'text-4xl' : ''}`}>
                        {item.name}
                    </h3>
                </div>

                {/* Right Side: Stock & Price */}
                <div className="flex flex-col items-end shrink-0 text-right gap-0.5 md:gap-1">
                    <div className="opacity-50 dark:opacity-40 text-[9px] font-black uppercase tracking-widest whitespace-nowrap">
                        {item.sold ? 'Stock: 0' : `Stock: ${item.stock !== undefined ? item.stock : 1}`}
                    </div>
                    <p className={`font-bold tabular-nums text-[11px] md:text-xs lg:text-sm ${item.sold ? 'text-red-500' : ''} whitespace-nowrap`}>
                        {item.sold ? 'VENDU' : (item.currentPrice || item.startingPrice) + ' €'}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
