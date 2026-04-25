import React, { Suspense } from 'react';
import { Plus } from 'lucide-react';
import AuctionTimer from '../../../components/ui/AuctionTimer';

const getImage = (item) => item?.images?.[0] || item?.imageUrl || item?.thumbnailUrl || '';
const getPrice = (item) => item?.currentPrice || item?.startingPrice || item?.price;

const ProductCard = ({
    item,
    className = '',
    onClick
}) => {
    const image = getImage(item);
    const price = getPrice(item);
    const stock = item.sold ? 0 : (item.stock !== undefined ? item.stock : 1);
    const label = item.stock !== undefined && Number(item.stock) > 1
        ? `Stock : ${item.stock}`
        : (item.material || 'Matiere inconnue');

    return (
        <a
            href={`/?product=${item.id}`}
            onClick={(event) => {
                if (!event.ctrlKey && !event.metaKey) {
                    event.preventDefault();
                    onClick?.();
                }
            }}
            className={`group relative block overflow-hidden rounded-[8px] border border-[#9a642d]/70 bg-[#0a0a09] text-white no-underline shadow-[0_22px_60px_rgba(0,0,0,0.35)] ${className}`}
        >
            <div className="absolute right-4 top-4 z-30 flex h-11 w-11 md:h-12 md:w-12 items-center justify-center rounded-full border border-[#dba45f] bg-black/25 text-[#f0b969] backdrop-blur-sm transition-all duration-300 group-hover:bg-[#dba45f] group-hover:text-black group-hover:scale-105">
                <Plus size={24} strokeWidth={1.45} />
            </div>

            {image && (
                <img
                    src={image}
                    alt={item.name}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-105"
                    loading="lazy"
                />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-black/5" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_18%,rgba(255,177,87,0.16),transparent_34%)] opacity-70" />

            {item.auctionActive && (
                <div className="absolute left-4 top-4 z-30 max-w-[calc(100%-5.5rem)]">
                    <div className="inline-flex items-center gap-2 border border-[#dba45f]/50 bg-black/45 px-3 py-1.5 text-[8px] font-black uppercase tracking-[0.18em] text-[#f0b969] backdrop-blur-sm">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <Suspense fallback="Live"><AuctionTimer endDate={item.auctionEnd} /></Suspense>
                    </div>
                </div>
            )}

            <div className="relative z-20 flex h-full min-h-[210px] flex-col justify-end p-4 sm:p-5 md:p-6">
                <p className="mb-3 max-w-[calc(100%-3.5rem)] text-[#f0b969] text-[10px] md:text-[11px] font-black uppercase tracking-[0.22em]">
                    {label}
                </p>
                <h3 className="max-w-[16rem] font-serif text-[1.35rem] sm:text-[1.55rem] md:text-[1.7rem] leading-[0.98] text-white drop-shadow line-clamp-2">
                    {item.name}
                </h3>
                <p className="mt-2 max-w-[18rem] font-serif text-[0.95rem] md:text-[1rem] leading-snug text-stone-100/90 line-clamp-2">
                    {item.description || item.shortDescription || 'Piece ancienne restauree dans notre atelier en Normandie.'}
                </p>
                <div className="mt-3">
                    <p className={`font-serif text-[1.45rem] md:text-[1.65rem] leading-none ${item.sold ? 'text-red-300' : 'text-white'}`}>
                        {item.sold ? 'Vendu' : (item.priceOnRequest ? 'Sur demande' : `${price || 0} €`)}
                    </p>
                    <p className="mt-2 text-[10px] md:text-[11px] font-black uppercase tracking-[0.22em] text-stone-200">
                        {stock <= 1 ? 'Piece unique' : `${stock} pieces disponibles`}
                    </p>
                </div>
            </div>
        </a>
    );
};

export default React.memo(ProductCard, (prev, next) => {
    return prev.item?.id === next.item?.id &&
        prev.item?.updatedAt === next.item?.updatedAt &&
        prev.className === next.className;
});
