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

                {/* PREMIUM OVERLAY (Museum Gallery Hook) */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)] flex items-center justify-center">
                    <div className="relative py-12 px-16 opacity-0 group-hover:opacity-100 transition-all duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)] flex flex-col items-center gap-4">
                        {/* Minimal Architectural Frame (Corners) */}
                        <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-white/40 translate-x-4 translate-y-4 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)]"></div>
                        <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-white/40 -translate-x-4 translate-y-4 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)]"></div>
                        <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-white/40 translate-x-4 -translate-y-4 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)]"></div>
                        <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-white/40 -translate-x-4 -translate-y-4 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)]"></div>

                        <span className="text-[10px] md:text-[11px] font-sans font-black tracking-[0.7em] uppercase text-white translate-y-2 group-hover:translate-y-0 transition-transform duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)]">
                            Découvrir
                        </span>
                        <div className="w-12 h-[1px] bg-white/30 scale-x-0 group-hover:scale-x-100 transition-transform duration-[800ms] ease-[cubic-bezier(0.23,1,0.32,1)] origin-center"></div>
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

            {/* 2. INFO BLOCK */}
            <div className={`flex flex-col gap-1 ${layoutMode === 'list' ? 'flex-1 pt-4' : 'pt-4'}`}>
                {/* META */}
                <div className="flex justify-between items-baseline opacity-50 dark:opacity-40 text-[9px] font-black uppercase tracking-widest">
                    <span>{item.material || 'Matière Inconnue'}</span>
                    <span>{item.sold ? 'Stock: 0' : `Stock: ${item.stock !== undefined ? item.stock : 1}`}</span>
                </div>

                {/* TITLE & PRICE */}
                <div className="flex justify-between items-end mt-1">
                    <h3 className={`font-serif leading-none pr-4 text-lg ${layoutMode === 'list' ? 'text-4xl' : ''}`}>
                        {item.name}
                    </h3>
                    <p className={`font-bold tabular-nums text-xs ${item.sold ? 'text-red-500' : ''}`}>
                        {item.sold ? 'VENDU' : (item.currentPrice || item.startingPrice) + ' €'}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
