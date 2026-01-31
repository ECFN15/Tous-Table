import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, Award, Mail, Box, Ruler, History, Quote, Heart, MessageCircle, Share2, ArrowRight } from 'lucide-react';
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
            <div className="max-w-[1920px] mx-auto px-6 md:px-12 pb-20 pt-24 md:pt-32">
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

                <button onClick={onBack} className="mb-8 flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest transition-colors" style={{ color: palette.textSubtitle }}>
                    <ChevronLeft size={14} /> Retour collection
                </button>

                <div className="grid md:grid-cols-2 gap-12 lg:gap-24" style={{ color: palette.textBody }}>
                    {/* Left Column: Images (Square, Rounded) */}
                    <div className="space-y-8 sticky top-32 h-fit">
                        <div className="aspect-square overflow-hidden relative ring-1 ring-inset rounded-2xl group cursor-pointer"
                            style={{ backgroundColor: palette.cardBg, '--tw-ring-color': palette.switcherBorder, borderRadius: palette.borderRadius, boxShadow: palette.cardShadow }}
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
                            <img src={images[activeImg]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={item.name} />

                            {/* Nav Arrows */}
                            {images.length > 1 && (
                                <>
                                    <div className="absolute top-1/2 left-4 -translate-y-1/2 p-3 rounded-full bg-black/20 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/40"><ChevronLeft size={24} /></div>
                                    <div className="absolute top-1/2 right-4 -translate-y-1/2 p-3 rounded-full bg-black/20 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/40 rotate-180"><ChevronLeft size={24} /></div>
                                </>
                            )}
                        </div>

                        {/* Pager */}
                        {images.length > 1 && (
                            <div className="flex justify-center gap-2 mt-4">
                                {images.map((_, idx) => (
                                    <button key={idx} onClick={() => setActiveImg(idx)} className={`h-0.5 transition-all duration-300 ${activeImg === idx ? 'w-8 bg-black dark:bg-white' : 'w-4 bg-stone-300 dark:bg-stone-700'}`} />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right Column: Content */}
                    <div className="space-y-8 px-1 py-1">
                        {/* Header */}
                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <span className="px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full" style={{ backgroundColor: `${palette.accent}20`, borderColor: `${palette.accent}40`, color: palette.accent }}>Lot n°{item.id.substring(0, 4)}</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-none" style={{ color: palette.textTitle }}>{item.name}</h1>

                            <div className="flex flex-wrap items-center gap-6 pt-2">
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

                        {/* Description (Natural Flow, no scroll) */}
                        <div className="p-8 ring-1 ring-inset rounded-2xl" style={{ backgroundColor: palette.cardBg, '--tw-ring-color': palette.switcherBorder, borderRadius: palette.borderRadius, boxShadow: palette.cardShadow }}>
                            <p className="text-lg leading-relaxed font-light opacity-80 whitespace-pre-wrap">{item.description}</p>
                        </div>

                        {/* Specs (Standard Location: Middle or Bottom? Put it here for now to match current flow but with card style) */}
                        <div className="grid grid-cols-2 gap-8 pt-4 opacity-80 pl-2">
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest mb-1 opacity-50">Matières</p>
                                <p className="text-xs font-bold">{item.material || "Non spécifié"}</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest mb-1 opacity-50">Dimensions</p>
                                <p className="font-mono text-xs">{item.width ? `${item.width} x ${item.depth} x ${item.height} cm` : item.dimensions}</p>
                            </div>
                        </div>

                        {/* Price & Actions */}
                        <div className="p-6 ring-1 ring-inset rounded-2xl overflow-hidden"
                            style={{
                                backgroundColor: palette.cardBg,
                                '--tw-ring-color': isWinner ? palette.accent : palette.switcherBorder,
                                color: palette.textBody,
                                boxShadow: isWinner ? `0 0 30px -5px ${palette.accent}60` : palette.cardShadow,
                                borderRadius: palette.borderRadius
                            }}>
                            <div className="flex justify-between items-end mb-8">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Prix Actuel</p>
                                    <p className="text-6xl font-black tracking-tighter">{item.currentPrice || item.startingPrice} €</p>
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
                                <button onClick={() => onAddToCart(item)} className="w-full py-6 bg-stone-900 rounded-2xl shadow-xl text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-emerald-600 transition-all flex items-center justify-center gap-4 group">
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
