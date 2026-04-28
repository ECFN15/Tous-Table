import React, { Suspense, useEffect, useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import AuctionTimer from '../../../components/ui/AuctionTimer';

// Cache module-level : survit aux unmount/remount des cartes (changement de filtre/catégorie).
// Tue le "flash de carrés" quand on switche de catégorie : si on a déjà calculé le ratio
// d'une image, on le rejoue immédiatement sans attendre onLoad.
const RATIO_CACHE = new Map();

const getImage = (item) => item?.images?.[0] || item?.imageUrl || item?.thumbnailUrl || '';
const getPrice = (item) => item?.currentPrice || item?.startingPrice || item?.price;

const getTopLabel = (item) => {
    if (item.stock !== undefined && Number(item.stock) >= 1) {
        return `Stock : ${item.stock}`;
    }
    if (item.isNew || item.collection) {
        return item.collection || 'Collection 2026';
    }
    if (item.material) {
        return item.material;
    }
    if (item.craft || item.metier) {
        return 'Métier';
    }
    return 'Matière inconnue';
};

const ProductCard = ({
    item,
    className = '',
    onClick
}) => {
    const image = getImage(item);
    const price = getPrice(item);
    const stock = item.sold ? 0 : (item.stock !== undefined ? item.stock : 1);
    const topLabel = getTopLabel(item);

    // Hydratation depuis le cache module → pas de flash de carrés au switch de catégorie.
    const cached = image ? RATIO_CACHE.get(image) : null;
    const [aspectRatio, setAspectRatio] = useState(cached?.aspectRatio || null);
    const [objectPos, setObjectPos] = useState(cached?.objectPos || 'center');
    const imgRef = useRef(null);

    // Détection letterbox déférée à l'idle thread : ne bloque plus le rendu initial.
    // Coûteux (~5–10ms par image en getImageData) → ne fige plus la grille au mount massif.
    const detectLetterbox = (img, fastRatio) => {
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        try {
            const canvas = document.createElement('canvas');
            const SAMPLE = 100;
            canvas.width = 1;
            canvas.height = SAMPLE;
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            ctx.drawImage(img, 0, 0, 1, SAMPLE);
            const data = ctx.getImageData(0, 0, 1, SAMPLE).data;

            const isBlack = (y) => {
                const i = y * 4;
                return data[i] + data[i + 1] + data[i + 2] < 30;
            };

            let topRows = 0;
            while (topRows < SAMPLE && isBlack(topRows)) topRows += 1;
            let bottomRows = 0;
            while (bottomRows < SAMPLE && isBlack(SAMPLE - 1 - bottomRows)) bottomRows += 1;

            let topPct = topRows / SAMPLE;
            let bottomPct = bottomRows / SAMPLE;

            // > 60% de noir = vraie photo sombre, pas un letterbox.
            if (topPct + bottomPct > 0.6) return;

            if (topPct > 0 || bottomPct > 0) {
                const contentH = h * (1 - topPct - bottomPct);
                const newRatio = `${w} / ${Math.round(contentH)}`;
                const total = topPct + bottomPct;
                const posY = total > 0 ? (topPct / total) * 100 : 50;
                const newPos = `center ${posY}%`;
                setAspectRatio(newRatio);
                setObjectPos(newPos);
                if (image) RATIO_CACHE.set(image, { aspectRatio: newRatio, objectPos: newPos });
            }
        } catch (err) {
            // CORS bloque le canvas → ratio natif déjà appliqué, on s'arrête là.
        }
    };

    const applyNaturalRatio = (img) => {
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        if (!w || !h) return;
        const fastRatio = `${w} / ${h}`;
        // On pose le ratio natif IMMÉDIATEMENT (pas de carré) puis on défère l'analyse letterbox.
        setAspectRatio((prev) => prev || fastRatio);
        if (image && !RATIO_CACHE.has(image)) {
            RATIO_CACHE.set(image, { aspectRatio: fastRatio, objectPos: 'center' });
        }
        const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 1));
        idle(() => detectLetterbox(img, fastRatio), { timeout: 800 });
    };

    const handleImageLoad = (e) => applyNaturalRatio(e.currentTarget);

    // Filet de sécurité : si l'image est en cache HTTP, onLoad peut ne pas se déclencher
    // après mount selon le navigateur. On lit naturalWidth synchroniquement via le ref.
    useEffect(() => {
        if (aspectRatio) return;
        const img = imgRef.current;
        if (img && img.complete && img.naturalWidth > 0) {
            applyNaturalRatio(img);
        }
    }, [image, aspectRatio]);

    return (
        <a
            href={`/?product=${item.id}`}
            onClick={(event) => {
                if (!event.ctrlKey && !event.metaKey) {
                    event.preventDefault();
                    onClick?.();
                }
            }}
            style={{ aspectRatio: aspectRatio || '4 / 5', contain: 'layout paint' }}
            className={`group relative block overflow-hidden rounded-[6px] border border-[#3a2a18]/60 bg-[#0a0a09] text-white no-underline shadow-[0_22px_60px_rgba(0,0,0,0.35)] ${className}`}
        >
            {/* Image remplit la carte — bandes noires recadrées via aspect-ratio + object-position si CORS le permet */}
            {image && (
                <img
                    ref={imgRef}
                    src={image}
                    alt={item.name}
                    onLoad={handleImageLoad}
                    style={{ objectPosition: objectPos }}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.04]"
                    loading="lazy"
                    decoding="async"
                />
            )}

            {/* Gradient overlay — darker at bottom for text readability */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />

            {/* TOP-LEFT : small category/stock tag */}
            <div className="absolute left-4 top-4 z-30 flex items-center gap-2 max-w-[calc(100%-4rem)]">
                {item.auctionActive ? (
                    <div className="inline-flex items-center gap-2 border border-[#dba45f]/60 bg-black/55 px-3 py-1.5 text-[8px] font-black uppercase tracking-[0.2em] text-[#f0b969] backdrop-blur-sm">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <Suspense fallback="Live"><AuctionTimer endDate={item.auctionEnd} /></Suspense>
                    </div>
                ) : (
                    <span className="text-[#e8a968] text-[9px] md:text-[10px] font-black uppercase tracking-[0.24em] drop-shadow">
                        {topLabel}
                    </span>
                )}
            </div>

            {/* TOP-RIGHT : + button */}
            <div className="absolute right-4 top-4 z-30 flex h-10 w-10 md:h-11 md:w-11 items-center justify-center rounded-full border border-[#dba45f]/80 bg-black/30 text-[#f0b969] backdrop-blur-sm transition-all duration-300 group-hover:bg-[#dba45f] group-hover:text-black group-hover:scale-105">
                <Plus size={20} strokeWidth={1.5} />
            </div>

            {/* BOTTOM-LEFT : title, price, unique — overlayed on image bottom */}
            <div className="absolute inset-x-0 bottom-0 z-20 p-4 sm:p-5 md:p-6">
                <h3 className="max-w-[18rem] font-serif text-[1.25rem] sm:text-[1.45rem] md:text-[1.65rem] leading-[0.98] text-white drop-shadow line-clamp-2">
                    {item.name}
                </h3>
                <p className={`mt-2 font-serif text-[1.2rem] md:text-[1.4rem] leading-none ${item.sold ? 'text-red-300' : 'text-white'}`}>
                    {item.sold ? 'Vendu' : (item.priceOnRequest ? 'Sur demande' : `${price || 0} €`)}
                </p>
                <p className="mt-2 text-[9px] md:text-[10px] font-black uppercase tracking-[0.28em] text-[#c89158]">
                    {stock <= 1 ? 'Pièce unique' : `${stock} pièces disponibles`}
                </p>
            </div>
        </a>
    );
};

export default React.memo(ProductCard, (prev, next) => {
    return prev.item?.id === next.item?.id &&
        prev.item?.updatedAt === next.item?.updatedAt &&
        prev.className === next.className;
});
