import React, { useEffect, useRef, useState } from 'react';
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

const CATEGORY_LABELS = {
    huiles: 'Huile & protection',
    cires: 'Patine & finition',
    savons: 'Nettoyage doux',
    accessoires: 'Accessoire atelier',
    renovation: 'Renovation',
    outils: 'Outil pro'
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
    onOpenProductDetail = null,
    mobileLightweight = false,
    deferImageOnMobile = false,
    imageDelayMs = 0,
    dense = false
}) => {
    const { isAdmin } = useAuth();
    const imageFrameRef = useRef(null);
    const shouldDeferImage = deferImageOnMobile &&
        typeof window !== 'undefined' &&
        window.matchMedia?.('(pointer: coarse)').matches;
    const [shouldLoadImage, setShouldLoadImage] = useState(() => !shouldDeferImage);

    useEffect(() => {
        if (!shouldDeferImage) {
            setShouldLoadImage(true);
            return undefined;
        }

        setShouldLoadImage(false);
        const target = imageFrameRef.current;
        let timer = null;
        const loadImage = () => {
            timer = window.setTimeout(() => setShouldLoadImage(true), imageDelayMs);
        };

        if (!target || typeof IntersectionObserver === 'undefined') {
            loadImage();
            return () => {
                if (timer) window.clearTimeout(timer);
            };
        }

        const observer = new IntersectionObserver((entries) => {
            if (!entries.some((entry) => entry.isIntersecting)) return;
            observer.disconnect();
            loadImage();
        }, { rootMargin: '220px 0px' });

        observer.observe(target);

        return () => {
            observer.disconnect();
            if (timer) window.clearTimeout(timer);
        };
    }, [imageDelayMs, product?.id, shouldDeferImage]);

    const handleAffiliateClick = async (event) => {
        event.preventDefault();

        if (onOpenProductDetail) {
            onOpenProductDetail(product, {
                source,
                parentFurnitureId,
                parentFurnitureName
            });
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
    const productTitle = product.detailDraft?.shortTitle || product.name || 'Produit de renovation';
    const productType = product.detailDraft?.productType || CATEGORY_LABELS[product.category] || 'Selection atelier';
    const price = Number(product.price);
    const hasPrice = Number.isFinite(price) && price > 0;
    const priceLabel = hasPrice
        ? `${price.toFixed(2).replace('.', ',')} EUR`
        : 'Prix indicatif';
    const imageFrameClass = mobileLightweight
        ? "relative isolate mb-4 aspect-[3/4] overflow-hidden rounded-[16px] bg-[#e8d9c6] md:[clip-path:inset(1.5px_round_16px)] lg:rounded-[28px] lg:[clip-path:inset(1.5px_round_28px)]"
        : `relative ${dense ? 'mb-3 aspect-[5/6] sm:aspect-[4/5]' : 'mb-4 aspect-[3/4]'} overflow-hidden rounded-[16px] bg-[#e8d9c6] [clip-path:inset(1.5px_round_16px)] lg:rounded-[22px] lg:[clip-path:inset(1.5px_round_22px)]`;
    const imageClassName = `tat-shop-card-image relative z-10 h-full w-full object-contain ${compact || dense ? 'p-4' : 'p-5'} transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover/card:scale-[1.018] ${mobileLightweight ? 'tat-shop-card-image--mobile-light' : 'tat-shop-card-image--blend'}`;
    const imageFrameContent = (
        <>
            {shouldLoadImage ? (
                <img
                    src={product.imageUrl || 'https://images.unsplash.com/photo-1616627456224-a80e6f7dd0bb?auto=format&fit=crop&w=900&q=80'}
                    alt={product.name || 'Produit'}
                    className={imageClassName}
                    loading="lazy"
                    decoding="async"
                    fetchPriority="low"
                />
            ) : (
                <div className="absolute inset-0 z-10 bg-[linear-gradient(135deg,rgba(255,255,255,0.18),rgba(120,84,45,0.08))]" aria-hidden="true" />
            )}

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
            className={`tat-shop-card-shell ${mobileLightweight ? 'tat-shop-card-shell--mobile-light' : ''} group/card relative flex h-full flex-col rounded-[24px] p-1.5 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1 ${darkMode ? 'hover:bg-white/[0.035]' : 'hover:bg-white/35'} ${disableAppearAnimation ? '' : 'animate-in fade-in slide-in-from-bottom-4 duration-500'}`}
            data-shop-card-appear={disableAppearAnimation ? 'false' : 'true'}
        >
            <a
                ref={imageFrameRef}
                href={detailHref || product.affiliateUrl || '#'}
                target={onOpenProductDetail ? undefined : '_blank'}
                rel={onOpenProductDetail ? undefined : 'noopener noreferrer sponsored'}
                onMouseEnter={() => onProductIntent?.(product)}
                onFocus={() => onProductIntent?.(product)}
                onPointerDown={() => onProductIntent?.(product)}
                onClick={handleAffiliateClick}
                aria-label={`Voir la fiche ${product.name || 'produit'}`}
                className={`flex h-full flex-col rounded-[20px] p-1 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-4 focus-visible:ring-offset-stone-950 active:scale-[0.99] ${darkMode ? 'bg-white/[0.015]' : 'bg-white/20'}`}
            >
                <div className={`${imageFrameClass} block cursor-pointer transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]`}>
                    {imageFrameContent}
                </div>

                <div className="mt-2 flex flex-1 flex-col px-1 pb-2">
                <p className={`mb-1.5 truncate text-[8.5px] font-black uppercase tracking-[0.24em] sm:text-[9px] ${darkMode ? 'text-amber-500/80' : 'text-amber-700/80'}`}>
                    {product.brand || 'ATELIER'}
                </p>

                <h3 className={`mb-1.5 line-clamp-2 font-serif ${dense ? 'text-[16px] sm:text-[18px] md:text-[19px]' : 'text-[18px] md:text-[21px]'} leading-[1.04] ${darkMode ? 'text-stone-50' : 'text-stone-900'}`}>
                    {productTitle}
                </h3>

                <p className={`line-clamp-1 text-[11px] font-semibold ${darkMode ? 'text-stone-500' : 'text-stone-500'}`}>
                    {productType}
                </p>

                <div className="mt-auto flex flex-col pt-3">
                    <p className={`mb-3 text-[12px] font-semibold tracking-wide ${hasPrice ? (darkMode ? 'text-stone-300' : 'text-stone-700') : (darkMode ? 'text-stone-600' : 'text-stone-400')}`}>
                        {priceLabel}
                    </p>

                    <div className={`
                        inline-flex w-full items-center justify-between rounded-full border px-3.5 py-2
                        text-[10.5px] font-bold transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
                        ${darkMode
                            ? 'bg-white/5 border-white/10 text-stone-300 group-hover/card:bg-amber-500/12 group-hover/card:border-amber-500/30 group-hover/card:text-amber-300'
                            : 'bg-stone-950/[0.035] border-stone-900/10 text-stone-700 group-hover/card:bg-stone-950 group-hover/card:text-white group-hover/card:border-stone-950'
                        }
                    `}>
                        <span>{ctaLabel}</span>
                        <span className={`flex h-6 w-6 items-center justify-center rounded-full transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover/card:translate-x-0.5 ${darkMode ? 'bg-white/10' : 'bg-white/70 group-hover/card:bg-white/12'}`}>
                            -&gt;
                        </span>
                    </div>
                </div>
                </div>
            </a>
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
    prev.mobileLightweight === next.mobileLightweight &&
    prev.deferImageOnMobile === next.deferImageOnMobile &&
    prev.imageDelayMs === next.imageDelayMs &&
    prev.dense === next.dense &&
    prev.onOpenProductDetail === next.onOpenProductDetail
));
