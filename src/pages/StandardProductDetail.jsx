import React, { useState, useEffect, useMemo } from 'react';
import {
    ChevronRight, ChevronLeft, Heart, MessageCircle, Share2,
    ArrowRight, ShoppingBag, Box, Gavel, Zap, Trophy, Clock
} from 'lucide-react';
import { collection, query, orderBy, limit, onSnapshot, doc } from 'firebase/firestore';
import { db, appId, functions } from '../firebase/config';
import { httpsCallable } from 'firebase/functions';
import { getMillis } from '../utils/time';
import ConfettiRain from '../components/ui/ConfettiRain';
import AuctionTimer from '../components/ui/AuctionTimer';
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
    // 1. Live Data Sync (Turbo Mode - Direct document listener)
    const [liveItem, setLiveItem] = useState(null);
    useEffect(() => {
        if (!item?.id) return;
        const col = item.collectionName || (item.id.includes('board') ? 'cutting_boards' : 'furniture');
        return onSnapshot(doc(db, 'artifacts', appId, 'public', 'data', col, item.id), (snap) => {
            if (snap.exists()) setLiveItem({ id: snap.id, collectionName: col, ...snap.data() });
        });
    }, [item?.id]);

    const displayItem = liveItem || item;
    const isLiked = item ? likedItemIds.includes(item.id) : false;

    const images = useMemo(() => {
        if (!displayItem) return [];
        const imgs = displayItem.images || (displayItem.imageUrl ? [displayItem.imageUrl] : []);
        return Array.isArray(imgs) ? imgs : [displayItem.imageUrl || ""];
    }, [displayItem]);

    const collectionName = useMemo(() => {
        if (!displayItem) return 'furniture';
        return displayItem.collectionName || ((displayItem.id && displayItem.id.includes('board')) ? 'cutting_boards' : 'furniture');
    }, [displayItem]);

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

    const isAuctionOver = displayItem?.auctionActive && getMillis(displayItem.auctionEnd) < Date.now();
    const isWinner = isAuctionOver && user && displayItem?.lastBidderId === user.uid;

    const productSchema = useMemo(() => {
        if (!item) return null;
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

    const handleQuickBid = async (inc) => {
        if (bidLoading) return;
        if (!user) {
            setMsg({ type: 'error', text: 'Connectez-vous pour enchérir.' });
            return;
        }

        // Optimistic UI logic: don't wait for function success to show progress
        setMsg({ type: 'success', text: 'Offre en cours...' });
        setBidLoading(true);

        try {
            await placeBidFunction({
                itemId: displayItem.id,
                collectionName: collectionName,
                increment: inc
            });
            // Result will be reflected instantly via onSnapshot (Turbo listener)
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
                            <img src={images[activeImg]} className="w-full h-full object-cover object-center" alt={displayItem.name} />

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
                                <span className="px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full" style={{ backgroundColor: `${palette.accent}20`, borderColor: `${palette.accent}40`, color: palette.accent }}>Lot n°{displayItem.id.substring(0, 4)}</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl lg:text-5xl font-black tracking-tighter leading-none" style={{ color: palette.textTitle }}>{displayItem.name}</h1>

                            <div className="flex flex-wrap items-center gap-6 pt-1">
                                <button onClick={handleLike} className="flex items-center gap-2 transition-colors hover:opacity-100 opacity-60">
                                    <Heart size={16} className={isLiked ? "fill-current text-red-500" : ""} />
                                    <span className="text-xs font-bold">{displayItem.likeCount || 0} Likes</span>
                                </button>
                                <button onClick={() => onShowComments(displayItem)} className="flex items-center gap-2 transition-colors hover:opacity-100 opacity-60">
                                    <MessageCircle size={16} /> <span className="text-xs font-bold">{displayItem.commentCount || 0} Avis</span>
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
                                <p className="font-serif text-lg leading-relaxed text-stone-600 dark:text-stone-300 whitespace-pre-wrap pb-8">{displayItem.description}</p>
                            </div>
                        </div>

                        {/* Specs (Compact Row) */}
                        <div className="grid grid-cols-2 gap-8 px-2 mb-6 opacity-80">
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest mb-1 opacity-50">Matières</p>
                                <p className="text-xs font-bold">{displayItem.material || "Non spécifié"}</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest mb-1 opacity-50">Dimensions</p>
                                <p className="font-mono text-xs">{displayItem.width ? `${displayItem.width} x ${displayItem.depth} x ${displayItem.height} cm` : displayItem.dimensions}</p>
                            </div>
                        </div>

                        {/* Price & Actions (Fixed at Bottom) */}
                        {/* Price & Actions (Fixed at Bottom, with Auction Support) */}
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
                                    <div className="flex items-center gap-2">
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Prix Actuel</p>
                                        {displayItem.auctionActive && !isAuctionOver && (
                                            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-red-100 text-red-600 text-[9px] font-black uppercase rounded-full animate-pulse">
                                                <Zap size={8} className="fill-current" /> Live
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-5xl md:text-6xl font-black tracking-tighter tabular-nums">{displayItem.currentPrice || displayItem.startingPrice} €</p>
                                </div>

                                {displayItem.auctionActive && (
                                    <div className="text-right">
                                        <p className="text-[10px] font-black uppercase opacity-40 mb-1">Fin dans</p>
                                        <div className="font-mono text-xl font-bold tabular-nums bg-stone-100 dark:bg-stone-800 px-3 py-1 rounded-lg">
                                            <React.Suspense fallback="..:..:..">
                                                <AuctionTimer endDate={displayItem.auctionEnd} />
                                            </React.Suspense>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {displayItem.auctionActive && !isAuctionOver ? (
                                <div className="space-y-6">
                                    {/* Bid Controls */}
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <p className="text-[10px] font-black uppercase opacity-40">Placer une enchère rapide</p>
                                            <p className="text-[10px] font-bold opacity-60">
                                                {user ? (displayItem.lastBidderId === user.uid ? <span className="text-emerald-500">Vous menez !</span> : "Quelqu'un d'autre mène") : "Non connecté"}
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-3 gap-3">
                                            {[10, 50, 100].map(inc => (
                                                <button key={inc} onClick={() => handleQuickBid(inc)} disabled={bidLoading} className="py-4 bg-stone-50 md:bg-white border-stone-200 rounded-xl border font-black text-xs hover:bg-black hover:text-white dark:bg-stone-800 dark:border-stone-700 dark:hover:bg-white dark:hover:text-black transition-all">+{inc}€</button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Mini History (Compact) */}
                                    {bidsHistory.length > 0 && (
                                        <div className="pt-4">
                                            <p className="text-[9px] font-black uppercase opacity-40 mb-2">Dernières offres</p>
                                            <div className="space-y-1.5 max-h-[80px] overflow-y-auto custom-scrollbar pr-2">
                                                {bidsHistory.map((bid) => (
                                                    <div key={bid.id} className="flex justify-between items-center text-[10px]">
                                                        <span className="font-bold opacity-70">
                                                            {bid.bidderId === user?.uid ? "Vous" : (bid.bidderName || `Utilisateur ${(bid.bidderId || 'UID').slice(0, 4)}`)}
                                                        </span>
                                                        <span className="font-mono opacity-50">
                                                            {bid.timestamp?.toDate ? bid.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
                                                        </span>
                                                        <span className="font-black tabular-nums">{bid.amount} €</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : !displayItem.auctionActive ? (
                                <button onClick={() => onAddToCart(displayItem)} className="w-full py-5 bg-stone-900 rounded-2xl shadow-xl text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-emerald-600 transition-all flex items-center justify-center gap-4 group">
                                    <span>Acquérir cette pièce</span>
                                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            ) : !isWinner ? (
                                <div className="text-center py-10 px-6 space-y-4 border border-stone-200 dark:border-stone-800"
                                    style={{ borderRadius: palette.borderRadius, backgroundColor: palette.isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}>
                                    <div className="flex justify-center mb-2 opacity-20">
                                        <Clock size={40} />
                                    </div>
                                    <p className="font-bold text-xl text-stone-400">Cette vente est terminée</p>
                                    <p className="text-[10px] uppercase font-black tracking-widest opacity-30">Clôture des enchères</p>
                                </div>
                            ) : (
                                <div className="relative overflow-hidden p-8 text-center space-y-6 animate-in zoom-in-95 duration-700 shadow-2xl"
                                    style={{
                                        backgroundColor: palette.isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)',
                                        border: `1px solid ${palette.statusValid}40`,
                                        borderRadius: palette.borderRadius,
                                        boxShadow: `0 20px 50px -12px ${palette.statusValid}30`
                                    }}>
                                    <div className="flex justify-center">
                                        <div className="p-4 rounded-full animate-bounce shadow-lg"
                                            style={{ backgroundColor: palette.statusValid, color: '#fff' }}>
                                            <Trophy size={28} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-black tracking-tight" style={{ color: palette.statusValid }}>
                                            Félicitations !
                                        </h3>
                                        <p className="text-sm font-medium opacity-80 leading-relaxed">
                                            Vous avez remporté cette enchère.<br />
                                            <span className="text-[10px] uppercase font-black tracking-widest mt-4 block opacity-60">Notre équipe va vous contacter pour finaliser l'acquisition.</span>
                                        </p>
                                    </div>

                                    {/* Sub-bg effect */}
                                    <div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 blur-3xl opacity-20 rounded-full" style={{ backgroundColor: palette.statusValid }}></div>
                                    <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 blur-3xl opacity-10 rounded-full" style={{ backgroundColor: palette.statusValid }}></div>
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
