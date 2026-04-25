import React, { Suspense, useState } from 'react';
import { Plus } from 'lucide-react';
import AuctionTimer from '../../../components/ui/AuctionTimer';

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

    // Carte = ratio image naturel (mis à jour dès que l'image est chargée)
    const [aspectRatio, setAspectRatio] = useState(null);
    const [objectPos, setObjectPos] = useState('center');

    const handleImageLoad = (e) => {
        const img = e.currentTarget;
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        if (!w || !h) return;

        let topPct = 0;
        let bottomPct = 0;

        // Détection des bandes noires en haut/bas via canvas (CORS requis)
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
                return data[i] + data[i + 1] + data[i + 2] < 30; // seuil très sombre
            };

            let topRows = 0;
            while (topRows < SAMPLE && isBlack(topRows)) topRows += 1;
            let bottomRows = 0;
            while (bottomRows < SAMPLE && isBlack(SAMPLE - 1 - bottomRows)) bottomRows += 1;

            topPct = topRows / SAMPLE;
            bottomPct = bottomRows / SAMPLE;

            // Sécurité : si > 60% de noir, ce n'est probablement pas un letterbox mais une vraie photo sombre
            if (topPct + bottomPct > 0.6) {
                topPct = 0;
                bottomPct = 0;
            }
        } catch (err) {
            // CORS ou erreur canvas → on retombe sur le ratio natif
        }

        if (topPct > 0 || bottomPct > 0) {
            // Letterbox détecté → ratio de contenu (sans bandes) + crop centré sur le contenu
            const contentH = h * (1 - topPct - bottomPct);
            setAspectRatio(`${w} / ${Math.round(contentH)}`);
            const total = topPct + bottomPct;
            const posY = total > 0 ? (topPct / total) * 100 : 50;
            setObjectPos(`center ${posY}%`);
        } else {
            setAspectRatio(`${w} / ${h}`);
            setObjectPos('center');
        }
    };

    return (
        <a
            href={`/?product=${item.id}`}
            onClick={(event) => {
                if (!event.ctrlKey && !event.metaKey) {
                    event.preventDefault();
                    onClick?.();
                }
            }}
            style={aspectRatio ? { aspectRatio } : { minHeight: '280px' }}
            className={`group relative block overflow-hidden rounded-[6px] border border-[#3a2a18]/60 bg-[#0a0a09] text-white no-underline shadow-[0_22px_60px_rgba(0,0,0,0.35)] ${className}`}
        >
            {/* Image remplit la carte — bandes noires recadrées via aspect-ratio + object-position si CORS le permet */}
            {image && (
                <img
                    src={image}
                    alt={item.name}
                    onLoad={handleImageLoad}
                    style={{ objectPosition: objectPos }}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.04]"
                    loading="lazy"
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
