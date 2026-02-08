import React, { Suspense } from 'react';
import { Heart, ArrowRight } from 'lucide-react';
// Import relatif : on remonte de designs/standard/components (3 niveaux) vers src, puis components/ui
import AuctionTimer from '../../../components/ui/AuctionTimer';

/**
 * COMPOSANT : CARTE PRODUIT (STANDARD DESIGN)
 * Visuel autonome pour la grille Marketplace.
 */
const ProductCard = ({
    item,
    palette,
    viewMode,
    isLiked,
    onLike,
    onComment
}) => {

    // Logic interne pour le partage (Pure Client)
    const handleShare = async (e) => {
        e.stopPropagation();
        const shareData = {
            title: item.name,
            text: `Découvrez ${item.name} sur Tous à Table`,
            url: window.location.origin + '/?product=' + item.id
        };
        try {
            if (navigator.share) await navigator.share(shareData);
            else {
                await navigator.clipboard.writeText(shareData.url);
                alert("Lien copié !");
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div
            className={`relative w-full overflow-hidden rounded-xl transition-all duration-300 ease-out group-hover:-translate-y-2 backdrop-blur-xl ${viewMode === 'list' ? 'aspect-[4/5]' : 'aspect-[3/4] md:aspect-[4/5]'}`}
            style={{
                backgroundColor: palette.cardBg,
                boxShadow: palette.cardShadow
            }}
        >
            {/* 1. IMAGE LAUNCHER (Top Section) */}
            <div className="absolute inset-x-0 top-0 bottom-[64px] md:bottom-[88px] overflow-hidden">
                <img
                    src={item.images?.[0] || item.imageUrl || item.thumbnailUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                />
                {/* DÉCOUVRIR OVERLAY (Clean Hover) */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:flex items-center justify-center">
                    <div className="bg-white/90 dark:bg-black/80 backdrop-blur-md px-6 py-3 rounded-full flex items-center gap-3 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-black dark:text-white">Découvrir</span>
                        <ArrowRight size={14} className="text-black dark:text-white" />
                    </div>
                </div>
            </div>

            {/* 2. STATUS BADGE V2 (Top Left - Revamp) */}
            <div className="absolute top-3 left-3 md:top-4 md:left-4 z-20">
                {item.auctionActive ? (
                    <div
                        className={`${viewMode === 'list' ? 'px-3 py-1.5 gap-2' : 'px-2.5 py-1 gap-1.5'} md:px-4 md:py-1.5 md:gap-2 rounded-full backdrop-blur-md border shadow-sm flex items-center`}
                        style={{
                            backgroundColor: palette.isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.8)',
                            borderColor: palette.switcherBorder,
                            color: palette.isDark ? '#ffffff' : '#000000'
                        }}
                    >
                        <div className={`${viewMode === 'list' ? 'w-1.5 h-1.5' : 'w-1.5 h-1.5'} md:w-1.5 md:h-1.5 rounded-full bg-[#34C759] animate-pulse`}></div>
                        <span className={`${viewMode === 'list' ? 'text-[10px]' : 'text-[9px]'} md:text-[10px] font-mono font-bold tracking-wider leading-none`}>
                            <Suspense fallback="..:..">
                                <AuctionTimer endDate={item.auctionEnd} />
                            </Suspense>
                        </span>
                    </div>
                ) : item.sold && (
                    <div
                        className={`${viewMode === 'list' ? 'px-3 py-1.5 gap-2' : 'px-2.5 py-1 gap-1.5'} md:px-4 md:py-1.5 md:gap-2 rounded-full flex items-center border backdrop-blur-md shadow-sm`}
                        style={{
                            backgroundColor: 'rgba(239, 68, 68, 0.9)',
                            borderColor: 'rgba(248, 113, 113, 1)',
                            color: '#ffffff'
                        }}
                    >
                        <div className={`${viewMode === 'list' ? 'w-2 h-2' : 'w-1.5 h-1.5'} md:w-2 md:h-2 rounded-full bg-white`}></div>
                        <span className={`${viewMode === 'list' ? 'text-[10px]' : 'text-[9px]'} md:text-[10px] font-bold uppercase tracking-wider leading-none`}>
                            Vendu
                        </span>
                    </div>
                )}
            </div>

            {/* 4. SOCIAL ACTIONS (Right Side - Floating - Hidden on Mobile) */}
            <div className={`absolute ${viewMode === 'list' ? 'top-[15%] right-4 gap-10' : 'top-4 right-3 gap-3.5'} md:top-24 md:right-4 hidden md:flex flex-col md:gap-6 z-20`}>
                <button
                    onClick={onLike}
                    className={`${viewMode === 'list' ? 'p-2.5' : 'p-1.5'} md:p-2.5 rounded-full backdrop-blur-md border transition-all hover:scale-110 active:scale-95 group/icon`}
                    style={{
                        backgroundColor: isLiked ? '#ef4444' : (palette.isDark ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.6)'),
                        borderColor: isLiked ? '#ef4444' : (palette.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.4)'),
                        color: isLiked ? '#ffffff' : (palette.isDark ? '#ffffff' : '#000000')
                    }}
                >
                    <span
                        className={`${viewMode === 'list' ? 'text-[9px] w-4 h-4' : 'text-[8px] w-3.5 h-3.5'} md:text-[10px] md:w-4 md:h-4 font-bold absolute -top-1 -right-1 flex items-center justify-center rounded-full shadow-sm border border-black/10 transition-colors`}
                        style={{
                            backgroundColor: '#ffffff',
                            color: isLiked ? '#ef4444' : '#000000'
                        }}
                    >
                        {item.likeCount || 0}
                    </span>
                    <Heart className={`${viewMode === 'list' ? 'w-4 h-4' : 'w-3.5 h-3.5'} md:w-4 md:h-4 ${isLiked ? 'fill-current' : ''}`} />
                </button>

                <button
                    onClick={onComment}
                    className={`${viewMode === 'list' ? 'p-2.5' : 'p-1.5'} md:p-2.5 rounded-full backdrop-blur-md border transition-all hover:scale-110 active:scale-95 group/icon`}
                    style={{
                        backgroundColor: palette.isDark ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.6)',
                        borderColor: palette.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.4)',
                        color: palette.isDark ? '#ffffff' : '#000000'
                    }}
                >
                    <span className={`${viewMode === 'list' ? 'text-[9px] w-4 h-4' : 'text-[8px] w-3.5 h-3.5'} md:text-[10px] md:w-4 md:h-4 font-bold absolute -top-1 -right-1 bg-white text-black flex items-center justify-center rounded-full shadow-sm border border-black/10`}>
                        {item.commentCount || 0}
                    </span>
                    <svg className={`${viewMode === 'list' ? 'w-4 h-4' : 'w-3.5 h-3.5'} md:w-4 md:h-4`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                </button>

                <button
                    onClick={handleShare}
                    className={`${viewMode === 'list' ? 'p-2.5' : 'p-1.5'} md:p-2.5 rounded-full backdrop-blur-md border transition-all hover:scale-110 active:scale-95 group/icon`}
                    style={{
                        backgroundColor: palette.isDark ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.6)',
                        borderColor: palette.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.4)',
                        color: palette.isDark ? '#ffffff' : '#000000'
                    }}
                >
                    <span className={`${viewMode === 'list' ? 'text-[9px] w-4 h-4' : 'text-[8px] w-3.5 h-3.5'} md:text-[10px] md:w-4 md:h-4 font-bold absolute -top-1 -right-1 bg-white text-black flex items-center justify-center rounded-full shadow-sm border border-black/10`}>
                        {item.shareCount || 0}
                    </span>
                    <svg className={`${viewMode === 'list' ? 'w-4 h-4' : 'w-3.5 h-3.5'} md:w-4 md:h-4`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>
                </button>
            </div>

            {/* 5. COLOR ZONE FOOTER (Info Panel) */}
            <div
                className="absolute bottom-0 inset-x-0 h-auto min-h-[64px] md:h-[88px] px-3 py-2.5 md:px-6 md:py-4 flex items-center justify-between transition-colors duration-300 z-10"
                style={{
                    backgroundColor: palette.cardBg
                }}
            >
                {/* Left: Name & Material */}
                <div className="flex flex-col gap-0.5 md:gap-1 max-w-[65%]">
                    <h3
                        className={`font-mono font-medium ${viewMode === 'list' ? 'text-[12px]' : 'text-[10.5px]'} md:text-base leading-snug truncate`}
                        style={{ color: palette.textBody }}
                    >
                        {item.name}
                    </h3>
                    <p
                        className="text-[10px] md:text-[13px] font-mono font-medium uppercase tracking-widest opacity-70"
                        style={{ color: palette.textBody }}
                    >
                        {item.material || 'Atelier Normand'}
                    </p>
                </div>

                {/* Right: Stock & Price */}
                <div className="flex flex-col items-end justify-center gap-0.5 md:gap-1 text-right">
                    {/* Stock Label */}
                    <div
                        className={`${viewMode === 'list' ? 'px-2 py-0.5 text-[8px]' : 'px-1.5 py-0.5 text-[7.5px]'} md:px-2 md:py-1 md:text-[10px] rounded-[3px] border font-mono font-bold uppercase tracking-wider tabular-nums`}
                        style={{
                            borderColor: item.sold ? '#ef444440' : palette.switcherBorder,
                            color: item.sold ? '#ef4444' : palette.statusValid,
                            backgroundColor: item.sold ? '#ef444415' : `${palette.statusValid}10`
                        }}
                    >
                        {item.sold ? 'Rupture' : `Stock ${item.stock || 1}`}
                    </div>
                    {/* Price */}
                    <div
                        className={`font-mono font-medium ${viewMode === 'list' ? 'text-[12px]' : 'text-[10.5px]'} md:text-base tracking-tight tabular-nums`}
                        style={{ color: palette.textBody }}
                    >
                        {item.currentPrice || item.startingPrice} €
                    </div>
                </div>
            </div>

        </div>
    );
};

export default ProductCard;
