import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { trackAffiliateClick } from '../../utils/tracking';

const PROGRAM_LABELS = {
    amazon: 'Amazon',
    manomano: 'ManoMano',
    leroymerlin: 'Leroy Merlin',
    rakuten: 'Rakuten',
    castorama: 'Castorama',
    direct: 'Direct'
};

const TIER_LABELS = {
    essentiel: 'Essentiel',
    premium: 'Premium',
    expert: 'Expert'
};

const getTierBadgeClass = (tier, darkMode) => {
    if (tier === 'premium') return 'bg-amber-500/20 text-amber-700 border-amber-500/30 font-black';
    if (tier === 'expert') return 'bg-stone-600/80 text-white border-white/20 font-bold';
    return darkMode
        ? 'bg-stone-800/85 text-stone-100 border-white/15 font-bold'
        : 'bg-stone-100/85 text-stone-700 border-stone-300 font-bold';
};

const ShopProductCard = ({
    product,
    darkMode = false,
    compact = false,
    source = 'shop_grid',
    parentFurnitureId = null,
    parentFurnitureName = null,
    detailHref = null,
    onProductIntent = null,
    disableAppearAnimation = false,
    onOpenProductDetail = null
}) => {
    const { isAdmin } = useAuth();

    const handleAffiliateClick = async (event) => {
        event.preventDefault();

        if (onOpenProductDetail) {
            onOpenProductDetail(product);
            return;
        }

        trackAffiliateClick({
            product,
            source,
            isAdmin,
            parentFurnitureId,
            parentFurnitureName
        });
    };

    const ctaLabel = onOpenProductDetail ? 'Voir la fiche' : 'Acheter';
    const imageFrameClass = "relative mb-4 aspect-[3/4] overflow-hidden rounded-[16px] bg-[#e8d9c6] [clip-path:inset(1.5px_round_16px)] lg:rounded-[28px] lg:[clip-path:inset(1.5px_round_28px)]";
    const imageFrameContent = (
        <>
            <img
                src={product.imageUrl || 'https://images.unsplash.com/photo-1616627456224-a80e6f7dd0bb?auto=format&fit=crop&w=900&q=80'}
                alt={product.name || 'Produit'}
                className={`relative z-10 h-full w-full object-contain ${compact ? 'p-4' : 'p-5'}`}
                style={{ mixBlendMode: 'multiply' }}
                loading="lazy"
                decoding="async"
            />

            <div className={`absolute right-2 top-2 z-30 flex items-center justify-center rounded-md border px-1.5 py-0.5 sm:right-4 sm:top-4 sm:px-2.5 sm:py-1 sm:backdrop-blur-md ${darkMode ? 'bg-stone-900/70 sm:bg-stone-900/40 border-stone-800/30' : 'bg-stone-900/75 sm:bg-stone-900/60 border-stone-800/30 shadow-sm'}`}>
                <span className="text-[7.5px] font-black uppercase tracking-wider text-white/90 sm:text-[10px]">
                    {PROGRAM_LABELS[product.affiliateProgram] || 'Direct'}
                </span>
            </div>

            <div className={`absolute bottom-2 left-2 z-30 flex items-center justify-center rounded-full border px-2 py-0.5 shadow-sm sm:bottom-4 sm:left-4 sm:px-3 sm:py-1.5 sm:backdrop-blur-md ${getTierBadgeClass(product.tier, darkMode)}`}>
                <span className="text-[7.5px] font-bold uppercase tracking-wide sm:text-[9px]">
                    {TIER_LABELS[product.tier] || 'Essentiel'}
                </span>
            </div>
        </>
    );

    return (
        <article
            className={`tat-shop-card-shell relative flex h-full flex-col ${disableAppearAnimation ? '' : 'animate-in fade-in slide-in-from-bottom-4 duration-500'}`}
            data-shop-card-appear={disableAppearAnimation ? 'false' : 'true'}
        >
            {onOpenProductDetail ? (
                <a
                    href={detailHref || '#'}
                    onMouseEnter={() => onProductIntent?.(product)}
                    onFocus={() => onProductIntent?.(product)}
                    onPointerDown={() => onProductIntent?.(product)}
                    onClick={handleAffiliateClick}
                    aria-label={`Voir la fiche ${product.name || 'produit'}`}
                    className={`${imageFrameClass} block cursor-pointer transition-transform duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-4 focus-visible:ring-offset-stone-950 active:scale-[0.99]`}
                >
                    {imageFrameContent}
                </a>
            ) : (
                <div className={imageFrameClass}>
                    {imageFrameContent}
                </div>
            )}

            <div className="mt-4 flex flex-1 flex-col px-1 pb-2">
                <p className={`mb-1.5 text-[9px] font-black uppercase tracking-[0.3em] ${darkMode ? 'text-amber-500/80' : 'text-amber-600/80'}`}>
                    {product.brand || 'ATELIER'}
                </p>

                <h3 className={`mb-1.5 line-clamp-2 font-serif text-[18px] leading-tight md:text-[21px] ${darkMode ? 'text-stone-50' : 'text-stone-900'}`}>
                    {product.name || 'Produit de renovation'}
                </h3>

                <div className="mt-auto flex flex-col pt-4">
                    <p className={`mb-3.5 text-[12px] font-medium tracking-wide ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                        Prix : {(Number(product.price) || 0).toFixed(2).replace('.', ',')} EUR
                    </p>

                    <div className="flex items-start">
                        <a
                            href={detailHref || product.affiliateUrl || '#'}
                            target={onOpenProductDetail ? undefined : '_blank'}
                            rel={onOpenProductDetail ? undefined : 'noopener noreferrer sponsored'}
                            onMouseEnter={() => onProductIntent?.(product)}
                            onFocus={() => onProductIntent?.(product)}
                            onPointerDown={() => onProductIntent?.(product)}
                            onClick={handleAffiliateClick}
                            className={`
                                group/cta inline-flex items-center gap-2 rounded-full border px-4 py-2
                                text-[11px] font-medium transition-all duration-300 sm:backdrop-blur-sm
                                ${darkMode
                                    ? 'bg-white/5 border-white/10 text-stone-300 hover:bg-amber-500/10 hover:border-amber-500/30 hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                                    : 'bg-stone-900/5 border-stone-200/50 text-stone-700 hover:bg-amber-500/10 hover:border-amber-500/30 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                                }
                            `}
                        >
                            <span>{ctaLabel}</span>
                            <span className="transition-transform duration-300 group-hover/cta:translate-x-1">
                                &rarr;
                            </span>
                        </a>
                    </div>
                </div>
            </div>
        </article>
    );
};

export default React.memo(ShopProductCard, (prev, next) => (
    prev.product?.id === next.product?.id &&
    prev.product?.updatedAt === next.product?.updatedAt &&
    prev.darkMode === next.darkMode &&
    prev.compact === next.compact &&
    prev.source === next.source &&
    prev.parentFurnitureId === next.parentFurnitureId &&
    prev.detailHref === next.detailHref &&
    prev.onProductIntent === next.onProductIntent &&
    prev.disableAppearAnimation === next.disableAppearAnimation &&
    prev.onOpenProductDetail === next.onOpenProductDetail
));
