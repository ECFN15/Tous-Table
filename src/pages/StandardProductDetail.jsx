import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Award, Mail, Box, Ruler, History, Quote, Heart, MessageCircle, Share2, ArrowRight } from 'lucide-react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db, appId, functions } from '../firebase/config';
import { httpsCallable } from 'firebase/functions';
import { getMillis } from '../utils/time';
import ConfettiRain from '../components/ui/ConfettiRain';
const SEO = React.lazy(() => import('../components/SEO'));

import { useRealtimeUserLikes } from '../hooks/useRealtimeUserLikes';
import { useLiveTheme } from '../hooks/useLiveTheme';

const placeBidFunction = httpsCallable(functions, 'placeBid');

const StandardProductDetail = ({ item, user, onBack, onAddToCart, onShowComments, darkMode, onOpenMenu, onOpenCart, onShowLogin }) => {
    const { palette, isStandardMode } = useLiveTheme(darkMode);
    const [activeImg, setActiveImg] = useState(0);
    const [bidLoading, setBidLoading] = useState(false);
    const [msg, setMsg] = useState(null);
    const [bidsHistory, setBidsHistory] = useState([]);

    // HOOK TEMPS RÉEL
    const { likedItemIds, toggleLike } = useRealtimeUserLikes(user);

    const isLiked = item ? likedItemIds.includes(item.id) : false;

    const images = useMemo(() => {
        if (!item) return [];
        const imgs = item.images || (item.imageUrl ? [item.imageUrl] : []);
        return Array.isArray(imgs) ? imgs : [item.imageUrl || ""];
    }, [item]);

    const collectionName = useMemo(() => {
        if (!item) return 'furniture';
        return item.collectionName || ((item.id && item.id.includes('board')) ? 'cutting_boards' : 'furniture');
    }, [item]);

    useEffect(() => {
        if (!images || images.length === 0) return;
        images.forEach((src) => {
            const img = new Image();
            img.src = src;
        });
    }, [images]);

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
                <h2 className="text-xl md:text-2xl font-black uppercase tracking-widest">
                    Produit Introuvable
                </h2>
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

    // --- RENDER STANDARD (ATELIER) ---
    return (
        <div
            className={`min-h-screen transition-colors duration-500 animate-in fade-in ${darkMode ? 'bg-[#0A0A0A] text-stone-200' : 'bg-[#FAFAF9] text-stone-900'}`}
            style={isStandardMode ? {
                backgroundImage: `linear-gradient(to bottom, ${palette.bgGradientTop}, ${palette.bgGradientBot})`,
                color: palette.textBody
            } : {}}
        >
            <div className="max-w-[1920px] mx-auto px-6 md:px-12 pb-12 pt-24 md:pt-32">
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

                <button onClick={onBack} className="mb-4 flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest transition-colors" style={{ color: palette.textSubtitle }}>
                    <ChevronLeft size={14} /> Retour collection
                </button>

                <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-stretch" style={{ color: palette.textBody }}>
                    {/* Left Column: Images (Strictly follows Right Column Height) */}
                    <div className="relative w-full h-auto min-h-[500px] rounded-2xl overflow-hidden shadow-sm"
                        style={{ backgroundColor: palette.cardBg, borderRadius: palette.borderRadius, boxShadow: palette.cardShadow }}>

                        <div className="absolute inset-0 group cursor-pointer"
                            onClick={(e) => {
                                // Image Nav Logic
                                const rect = e.currentTarget.getBoundingClientRect();
                                const x = e.clientX - rect.left;
                                if (x < rect.width / 2) {
                                    setActiveImg(prev => prev === 0 ? images.length - 1 : prev - 1);
                                } else {
                                    setActiveImg(prev => prev === images.length - 1 ? 0 : prev + 1);
                                }
                            }}>
                            <img src={images[activeImg]} className="w-full h-full object-cover object-center" alt={item.name} />

                            {/* Nav Arrows */}
                            {images.length > 1 && (
                                <>
                                    <div className="absolute top-1/2 left-4 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/40"
                                        onClick={(e) => { e.stopPropagation(); setActiveImg(prev => prev === 0 ? images.length - 1 : prev - 1); }}>
                                        <ChevronLeft size={24} />
                                    </div>
                                    <div className="absolute top-1/2 right-4 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/40"
                                        onClick={(e) => { e.stopPropagation(); setActiveImg(prev => prev === images.length - 1 ? 0 : prev + 1); }}>
                                        <ChevronRight size={24} />
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Pager (Floating at bottom of image) */}
                        {images.length > 1 && (
                            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-10">
                                {images.map((_, idx) => (
                                    <button key={idx} onClick={(e) => { e.stopPropagation(); setActiveImg(idx); }} className={`h-1 rounded-full shadow-sm transition-all duration-300 ${activeImg === idx ? 'w-8 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'}`} />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right Column: Content (Drivers the Height) */}
                    <div className="flex flex-col h-full px-1 py-1 min-h-[500px]">
                        {/* Header */}
                        <div className="space-y-4 mb-4">
                            <div className="flex gap-2">
                                <span className="px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full" style={{ backgroundColor: `${palette.accent}20`, borderColor: `${palette.accent}40`, color: palette.accent }}>Lot n°{item.id.substring(0, 4)}</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl lg:text-5xl font-black tracking-tighter leading-none" style={{ color: palette.textTitle }}>{item.name}</h1>

                            <div className="flex flex-wrap items-center gap-6 pt-1">
                                <button onClick={handleLike} className="flex items-center gap-2 transition-colors hover:opacity-100 opacity-60">
                                    <Heart size={16} className={isLiked ? "fill-current text-red-500" : ""} />
                                    <span className="text-xs font-bold">{item.likeCount || 0} Likes</span>
                                </button>
                                <button onClick={() => onShowComments(item)} className="flex items-center gap-2 transition-colors hover:opacity-100 opacity-60">
                                    <MessageCircle size={16} /> <span className="text-xs font-bold">{item.commentCount || 0} Avis</span>
                                </button>
                                <button onClick={handleShare} className="flex items-center gap-2 transition-colors hover:opacity-100 opacity-60">
                                    <Share2 size={16} /> <span className="text-xs font-bold">Partager</span>
                                </button>
                            </div>
                        </div>

                        {/* Description (Flexible with Max Limit) */}
                        <div className="flex-1 min-h-[100px] mb-4 relative">
                            <div className="p-6 h-full ring-1 ring-inset rounded-2xl overflow-y-auto custom-scrollbar"
                                style={{ backgroundColor: palette.cardBg, '--tw-ring-color': palette.switcherBorder, borderRadius: palette.borderRadius, boxShadow: palette.cardShadow }}>
                                <p className="font-serif text-lg leading-relaxed text-stone-600 dark:text-stone-300 whitespace-pre-wrap pb-8">{item.description}</p>
                            </div>
                        </div>

                        {/* Specs (Compact Row) */}
                        <div className="grid grid-cols-2 gap-8 px-2 mb-6 opacity-80">
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest mb-1 opacity-50">Matières</p>
                                <p className="text-xs font-bold">{item.material || "Non spécifié"}</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest mb-1 opacity-50">Dimensions</p>
                                <p className="font-mono text-xs">{item.width ? `${item.width} x ${item.depth} x ${item.height} cm` : item.dimensions}</p>
                            </div>
                        </div>

                        {/* Price & Actions (Fixed at Bottom) */}
                        <div className="p-5 ring-1 ring-inset rounded-2xl overflow-hidden mt-auto"
                            style={{
                                backgroundColor: palette.cardBg,
                                '--tw-ring-color': isWinner ? palette.accent : palette.switcherBorder,
                                color: palette.textBody,
                                boxShadow: isWinner ? `0 0 30px -5px ${palette.accent}60` : palette.cardShadow,
                                borderRadius: palette.borderRadius
                            }}>
                            <div className="flex justify-between items-end mb-6">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Prix Actuel</p>
                                    <p className="text-5xl md:text-6xl font-black tracking-tighter">{item.currentPrice || item.startingPrice} €</p>
                                </div>
                            </div>

                            {item.auctionActive && !isAuctionOver ? (
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black uppercase opacity-40">Placer une enchère rapide</p>
                                    <div className="grid grid-cols-3 gap-3">
                                        {[10, 50, 100].map(inc => (
                                            <button key={inc} onClick={() => handleQuickBid(inc)} disabled={bidLoading} className="py-4 bg-stone-50 border-stone-200 rounded-2xl border font-black text-xs hover:bg-black hover:text-white transition-all">+{inc}€</button>
                                        ))}
                                    </div>
                                </div>
                            ) : !item.auctionActive ? (
                                <button onClick={() => onAddToCart(item)} className="w-full py-5 bg-stone-900 rounded-2xl shadow-xl text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-emerald-600 transition-all flex items-center justify-center gap-4 group">
                                    <span>Acquérir cette pièce</span>
                                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            ) : (
                                <div className="text-center py-4 bg-stone-50 rounded-none border border-stone-200 text-stone-400">
                                    <span className="font-serif italic">Vente terminée</span>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default StandardProductDetail;
