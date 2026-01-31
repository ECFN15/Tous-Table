import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, Box, Heart, MessageCircle, Share2, ArrowRight } from 'lucide-react';
import { db, appId, functions } from '../../firebase/config';
import { httpsCallable } from 'firebase/functions';
import { getMillis } from '../../utils/time';
import ConfettiRain from '../../components/ui/ConfettiRain';
const SEO = React.lazy(() => import('../../components/SEO'));

import { useRealtimeUserLikes } from '../../hooks/useRealtimeUserLikes';
import { useLiveTheme } from '../../hooks/useLiveTheme';
import ArchitecturalHeader from './components/ArchitecturalHeader';

const placeBidFunction = httpsCallable(functions, 'placeBid');

const ArchitecturalProductDetail = ({ item, user, onBack, onAddToCart, onShowComments, onOpenMenu, onOpenCart, onShowLogin, toggleTheme, darkMode }) => {
    const { palette, activeDesignId } = useLiveTheme();
    const [activeImg, setActiveImg] = useState(0);
    const [bidLoading, setBidLoading] = useState(false);
    const [msg, setMsg] = useState(null);
    const [bidsHistory, setBidsHistory] = useState([]);

    // HOOK TEMPS RÉEL
    const { likedItemIds, toggleLike } = useRealtimeUserLikes(user);

    const isLiked = item ? likedItemIds.includes(item.id) : false;

    // Hooks
    const images = useMemo(() => {
        if (!item) return [];
        const imgs = item.images || (item.imageUrl ? [item.imageUrl] : []);
        return Array.isArray(imgs) ? imgs : [item.imageUrl || ""];
    }, [item]);

    const collectionName = useMemo(() => {
        if (!item) return 'furniture';
        return item.collectionName || ((item.id && item.id.includes('board')) ? 'cutting_boards' : 'furniture');
    }, [item]);

    // Preload
    useEffect(() => {
        if (!images || images.length === 0) return;
        images.forEach((src) => {
            const img = new Image();
            img.src = src;
        });
    }, [images]);

    // Auction Logic
    useEffect(() => {
        if (!item?.auctionActive) return;
        try {
            const q = query(
                collection(db, 'artifacts', appId, 'public', 'data', collectionName, item.id, 'bids'),
                orderBy('timestamp', 'desc'),
                limit(10)
            );
            return onSnapshot(q, (snap) => setBidsHistory(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
        } catch (err) {
            console.error("Error subscribing to bids:", err);
        }
    }, [item?.id, collectionName, item?.auctionActive]);

    const isAuctionOver = item?.auctionActive && getMillis(item.auctionEnd) < Date.now();
    const isWinner = isAuctionOver && user && item?.lastBidderId === user.uid;

    if (!item) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 pt-32 text-center animate-in fade-in duration-500">
            <div className="p-6 rounded-full bg-stone-100 mb-4 animate-pulse">
                <Box size={40} className="text-stone-400" />
            </div>
            <div className="space-y-2">
                <h2 className="text-xl md:text-2xl font-black uppercase tracking-widest">Produit Introuvable</h2>
            </div>
            <button onClick={onBack} className="px-8 py-3 bg-stone-900 text-white uppercase tracking-widest text-xs font-bold">Retour</button>
        </div>
    );

    const handleQuickBid = async (inc) => {
        if (bidLoading) return;
        if (!user) {
            setMsg({ type: 'error', text: 'Connectez-vous pour enchérir.' });
            return;
        }
        setBidLoading(true);
        try {
            const result = await placeBidFunction({
                itemId: item.id,
                collectionName: 'furniture',
                increment: inc
            });
            if (result.data.success) {
                setMsg({ type: 'success', text: `Offre validée !` });
            }
        } catch (e) {
            setMsg({ type: 'error', text: e.message || 'Erreur lors de l\'enchère.' });
        } finally {
            setBidLoading(false);
            setTimeout(() => setMsg(null), 3000);
        }
    };

    const handleLike = async () => {
        if (!user) return;
        const col = item.collectionName || (item.id.includes('board') ? 'cutting_boards' : 'furniture');
        await toggleLike(item.id, col);
    };

    const handleShare = async () => {
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
            const trackShareFn = httpsCallable(functions, 'trackShare');
            trackShareFn({ itemId: item.id, collectionName: item.collectionName || 'furniture' });
        } catch (e) { }
    };

    // SEO
    const productSchema = useMemo(() => {
        return {
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": item.name,
            "image": images,
            "description": item.description,
            "brand": { "@type": "Brand", "name": "Tous à Table - Atelier Normand" },
            "offers": {
                "@type": "Offer",
                "url": `${window.location.origin}/?product=${item.id}`,
                "priceCurrency": "EUR",
                "price": item.currentPrice || item.startingPrice,
                "availability": !item.sold ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            }
        };
    }, [item, images]);

    // --- RENDER ARCHITECTURAL ---
    return (
        <div className={`min-h-screen transition-colors duration-500 animate-in fade-in ${darkMode ? 'bg-[#0A0A0A] text-stone-200' : 'bg-[#FAFAF9] text-stone-900'}`}>

            <ArchitecturalHeader
                user={user}
                onShowLogin={onShowLogin}
                onOpenMenu={onOpenMenu}
                onOpenCart={onOpenCart}
                toggleTheme={toggleTheme}
                darkMode={darkMode}
            />

            <div className="max-w-[1920px] mx-auto px-6 md:px-12 pb-20 pt-8">
                <React.Suspense fallback={null}>
                    <SEO
                        title={`${item.name} - Tous à Table`}
                        description={item.description}
                        image={images[0]}
                        url={`/?product=${item.id}`}
                        schema={productSchema}
                    />
                </React.Suspense>

                {isWinner && <ConfettiRain />}

                <button onClick={onBack} className="mb-8 flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest transition-colors px-0 hover:opacity-60">
                    <ChevronLeft size={14} /> Retour collection
                </button>

                <div className="grid md:grid-cols-2 gap-12 lg:gap-24">

                    {/* Left Column: Images */}
                    <div className="space-y-8 sticky top-24 h-fit">
                        <div className="transform-gpu backface-hidden group cursor-pointer w-full max-h-[75vh] flex items-center justify-center rounded-none bg-white dark:bg-[#111]"
                            onClick={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const x = e.clientX - rect.left;
                                if (x < rect.width / 2) {
                                    setActiveImg(prev => prev === 0 ? images.length - 1 : prev - 1);
                                } else {
                                    setActiveImg(prev => prev === images.length - 1 ? 0 : prev + 1);
                                }
                            }}>
                            <img src={images[activeImg]} className="transition-transform duration-700 group-hover:scale-105 max-w-full max-h-[75vh] object-contain p-6" alt={item.name} />

                            {/* Arrows */}
                            {images.length > 1 && (
                                <>
                                    <div className="absolute top-1/2 left-4 -translate-y-1/2 p-3 rounded-full bg-black/20 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/40"><ChevronLeft size={24} /></div>
                                    <div className="absolute top-1/2 right-4 -translate-y-1/2 p-3 rounded-full bg-black/20 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/40 rotate-180"><ChevronLeft size={24} /></div>
                                </>
                            )}
                        </div>
                        {/* Pager */}
                        {images.length > 1 && (
                            <div className="flex justify-center gap-2 mt-4">
                                {images.map((_, idx) => (
                                    <button key={idx} onClick={(e) => { e.stopPropagation(); setActiveImg(idx) }} className={`h-0.5 transition-all duration-300 ${activeImg === idx ? 'w-8 bg-black dark:bg-white' : 'w-4 bg-stone-300 dark:bg-stone-700'}`} />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right Column: Details */}
                    <div className="space-y-6 px-1 py-1">
                        {/* Header */}
                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <span className="px-3 py-1 text-[9px] font-black uppercase tracking-widest border border-stone-200 dark:border-stone-800 bg-transparent text-stone-500">Lot n°{item.id.substring(0, 4)}</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-none font-serif font-normal italic">{item.name}</h1>

                        </div>

                        {/* Description (Scrollable) */}
                        <div className="p-0 border-l pl-8 border-stone-200 dark:border-stone-800 max-h-[250px] overflow-y-auto custom-scrollbar pr-4">
                            <p className="whitespace-pre-wrap font-serif text-lg leading-loose text-stone-600 dark:text-stone-400">
                                {item.description}
                            </p>
                        </div>

                        {/* Price & Actions */}
                        <div className="p-6 bg-transparent border-t border-b border-stone-200 dark:border-stone-800">
                            <div className="flex justify-between items-end mb-8">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Prix Actuel</p>
                                    <p className="text-6xl font-black tracking-tighter font-serif italic font-normal">{item.currentPrice || item.startingPrice} €</p>
                                </div>
                            </div>

                            {item.auctionActive && !isAuctionOver ? (
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black uppercase opacity-40">Placer une enchère rapide</p>
                                    <div className="grid grid-cols-3 gap-3">
                                        {[10, 50, 100].map(inc => (
                                            <button key={inc} onClick={() => handleQuickBid(inc)} disabled={bidLoading}
                                                className="py-4 border font-black text-xs hover:bg-black hover:text-white transition-all border-stone-200 dark:border-stone-700 bg-transparent">
                                                +{inc}€
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : !item.auctionActive ? (
                                <button onClick={() => onAddToCart(item)} className="w-full py-6 text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-emerald-600 transition-all flex items-center justify-center gap-4 bg-[#0A0A0A] dark:bg-white dark:text-black rounded-none">
                                    <span>Acquérir cette pièce</span>
                                    <ArrowRight size={16} />
                                </button>
                            ) : (
                                <div className="text-center py-4 bg-stone-50 rounded-none border border-stone-200 text-stone-400">
                                    <span className="font-serif italic">Vente terminée [Fin Enchère]</span>
                                </div>
                            )}
                        </div>

                        {/* Specs */}
                        <div className="grid grid-cols-2 gap-8 pt-4 pl-6 opacity-80">
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest mb-1 opacity-50">Matières</p>
                                <p className="text-xs font-bold">{item.material || "Non spécifié"}</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest mb-1 opacity-50">Dimensions</p>
                                <p className="font-mono text-xs">{item.width ? `${item.width} x ${item.depth} x ${item.height} cm` : item.dimensions}</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ArchitecturalProductDetail;
