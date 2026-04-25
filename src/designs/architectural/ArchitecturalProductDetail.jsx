import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Box, ArrowRight, Trophy, Clock, X, Maximize2, ShoppingBag, TreePine, Sparkles, ShieldCheck, Heart } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { db, appId, functions } from '../../firebase/config';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { getMillis } from '../../utils/time';
import SEO from '../../components/shared/SEO';


import { useLiveTheme } from '../../hooks/useLiveTheme';
import AnimatedPrice from '../../components/ui/AnimatedPrice';
import ShopProductCard from '../../components/shop/ShopProductCard';

const RECOMMENDED_TUTORIALS = [
    { videoId: "ictKhF92-pY", label: "Comment appliquer Rubio Monocoat Oil Plus 2C sur un meuble", productMatch: "Rubio Monocoat" },
    { videoId: "EZ2w0DBLkTI", label: "Comment appliquer Osmo PolyX-Oil sur un meuble", productMatch: "Osmo Polyx" },
    { videoId: "KfHoHFA7Av8", label: "John Boos Mystery Oil & Board Cream — entretien planche", productMatch: "John Boos" }
];

const CARE_FEATURES = [
    { icon: TreePine, title: "Bois Massif Patiné", description: "Chaque pièce est sélectionnée avec soin et travaillée à la main dans notre atelier en Normandie." },
    { icon: Sparkles, title: "Pièce Unique", description: "Aucune pièce n'est reproduite. Vous investissez dans un meuble qui a une âme." },
    { icon: ShieldCheck, title: "Finition Naturelle", description: "Nos finitions respectent le bois et votre intérieur. Huiles et cires naturelles écoresponsables." },
    { icon: Heart, title: "Livraison Soignée", description: "Emballage sécurisé et livraison partout en France et pays frontaliers." }
];

const placeBidFunction = httpsCallable(functions, 'placeBid');
const wakeUpFunction = httpsCallable(functions, 'wakeUp');

const ArchitecturalProductDetail = ({ item, user, onBack, onAddToCart, onOpenCart, onShowLogin, darkMode, setHeaderProps, cartItems = [], affiliateProducts = [] }) => {
    const { palette } = useLiveTheme();
    const [activeImg, setActiveImg] = useState(0);
    const [bidLoading, setBidLoading] = useState(false);
    const [, setMsg] = useState(null);
    const [bidsHistory, setBidsHistory] = useState([]);
    const [activeBidInc, setActiveBidInc] = useState(null);
    const [bidProgress, setBidProgress] = useState(0);
    const [tutorialIndex, setTutorialIndex] = useState(0);

    // LIGHTBOX STATE
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    // TOUCH SWIPE STATE (Mobile)
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);
    const minSwipeDistance = 50;

    const onTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) {
            setActiveImg(prev => prev === images.length - 1 ? 0 : prev + 1);
        }
        if (isRightSwipe) {
            setActiveImg(prev => prev === 0 ? images.length - 1 : prev - 1);
        }
    };

    // WAKE UP CLOUD FUNCTIONS (Anti-Cold Start)
    useEffect(() => {
        if (item?.auctionActive) {
            wakeUpFunction().catch(() => { }); // Silent ping
        }
    }, [item?.id]);

    // SYNC WITH GLOBAL HEADER (Clear tabs on detail view)
    useEffect(() => {
        if (setHeaderProps) {
            setHeaderProps(null);
        }
    }, [setHeaderProps]);

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

    const isInCart = cartItems.some(cartItem => cartItem.originalId === item?.id);

    // Recommended care products: 4 best oils (huiles), expert tier first
    const recommendedProducts = useMemo(() => {
        if (!affiliateProducts || affiliateProducts.length === 0) return [];
        const oils = affiliateProducts.filter(p => p.category === 'huiles');
        const sorted = [...oils].sort((a, b) => {
            const tierOrder = { expert: 3, premium: 2, essentiel: 1 };
            const aTier = tierOrder[a.tier] || 0;
            const bTier = tierOrder[b.tier] || 0;
            if (bTier !== aTier) return bTier - aTier;
            return (Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
        });
        return sorted.slice(0, 4);
    }, [affiliateProducts]);

    const currentTutorial = RECOMMENDED_TUTORIALS[tutorialIndex];

    const productSchema = useMemo(() => {
        if (!item) return null;
        return {
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": item.name,
            "image": images,
            "description": item.description,
            "brand": { "@type": "Brand", "name": "Tous à Table Made in Normandie" },
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
            onShowLogin();
            return;
        }
        setBidLoading(true);
        setActiveBidInc(inc);
        setBidProgress(0);

        // Simulation de progression (0 -> 90% en 1s)
        const startTime = Date.now();
        const duration = 1200; // Un peu plus long pour laisser le temps au serveur
        const timer = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(90, Math.floor((elapsed / duration) * 90));
            setBidProgress(progress);
            if (progress >= 90) clearInterval(timer);
        }, 50);

        // Clé d'idempotence (Unique par clic pour éviter les doublons techniques)
        const idempotencyKey = `bid_${user.uid}_${item.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        try {
            const result = await placeBidFunction({
                itemId: item.id,
                collectionName: collectionName,
                increment: inc,
                idempotencyKey
            });
            if (result.data.success) {
                clearInterval(timer);
                setBidProgress(100);
                setMsg({ type: 'success', text: `Offre validée !` });
            }
        } catch (e) {
            clearInterval(timer);
            setBidProgress(0);
            setMsg({ type: 'error', text: e.message || 'Erreur lors de l\'enchère.' });
        } finally {
            // On laisse la barre à 100% un court instant pour la satisfaction visuelle
            setTimeout(() => {
                setBidLoading(false);
                setActiveBidInc(null);
                setBidProgress(0);
            }, 500);
            setTimeout(() => setMsg(null), 3000);
        }
    };






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

    // --- RENDER ARCHITECTURAL ---
    return (
        <div className={`min-h-screen transition-colors duration-700 bg-transparent`}>
            <SEO
                title={item.name}
                description={item.description}
                image={images[0]}
                url={window.location.href}
                type="product"
                schema={productSchema}
            />
            {/* ArchitecturalHeader removed here, handled globally in App.jsx */}

            <div className={`w-full min-h-screen flex flex-col lg:flex-row relative pt-4 lg:pt-0`}>
                {/* LEFT COLUMN: IMAGE GALLERY (Natural Scroll) */}
                <div className="w-full lg:w-1/2 flex flex-col p-6 lg:p-12 h-auto lg:h-[calc(100vh-6rem)] justify-center">
                    {/* BACK BUTTON (Desktop & Mobile - Above Image) */}
                    <button onClick={onBack} className={`flex items-center gap-3 font-black text-[10px] uppercase tracking-widest transition-all hover:opacity-100 mb-6 group ${darkMode ? 'text-white/80' : 'text-stone-900/80'}`}>
                        <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${darkMode ? 'border-white/10 group-hover:bg-white/10' : 'border-stone-200 group-hover:bg-stone-100'}`}>
                            <ChevronLeft size={16} />
                        </div>
                        <span>Retour Collection</span>
                    </button>

                    {/* ROUNDED IMAGE CONTAINER (Gallery Style - Full Bleed) */}
                    <div
                        className="relative w-full md:max-w-2xl mx-auto rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/20 group bg-stone-100 dark:bg-[#151515] aspect-[3/4] md:aspect-[4/3] lg:aspect-auto lg:h-full lg:max-w-none"
                        onTouchStart={onTouchStart}
                        onTouchMove={onTouchMove}
                        onTouchEnd={onTouchEnd}
                        onClick={(e) => {
                            // Standard Navigation on Click (Left/Right zones)
                            const rect = e.currentTarget.getBoundingClientRect();
                            const x = e.clientX - rect.left;
                            if (x < rect.width / 2) {
                                setActiveImg(prev => prev === 0 ? images.length - 1 : prev - 1);
                            } else {
                                setActiveImg(prev => prev === images.length - 1 ? 0 : prev + 1);
                            }
                        }}
                    >

                        {/* Main Picture (Object Cover - No Margins) */}
                        <img
                            src={images[activeImg]}
                            className="w-full h-full object-cover transition-transform duration-700 ease-in-out"
                            alt={item.name}
                        />

                        {/* Arrows (Visible on hover) */}
                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setActiveImg(prev => prev === 0 ? images.length - 1 : prev - 1); }}
                                    className="hidden md:flex absolute top-1/2 left-6 -translate-y-1/2 w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer drop-shadow-md bg-black/20 backdrop-blur-md rounded-full hover:bg-black/50 items-center justify-center outline-none ring-0 focus:outline-none focus:ring-0 z-20"
                                >
                                    <ChevronLeft size={24} strokeWidth={2} />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setActiveImg(prev => prev === images.length - 1 ? 0 : prev + 1); }}
                                    className="hidden md:flex absolute top-1/2 right-6 -translate-y-1/2 w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer drop-shadow-md bg-black/20 backdrop-blur-md rounded-full hover:bg-black/50 items-center justify-center outline-none ring-0 focus:outline-none focus:ring-0 z-20"
                                >
                                    <ChevronRight size={24} strokeWidth={2} />
                                </button>
                            </>
                        )}

                        {/* Pager (Bottom Overlay) */}
                        {images.length > 1 && (
                            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
                                {images.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={(e) => { e.stopPropagation(); setActiveImg(idx) }}
                                        className={`h-1.5 rounded-full transition-all duration-300 shadow-sm backdrop-blur-sm ${activeImg === idx ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/80'}`}
                                    />
                                ))}
                            </div>
                        )}

                        {/* HINT: Click to Expand (With Luminous Ripple) */}
                        <div className="absolute top-4 right-4 md:top-6 md:right-6 z-30 transition-all duration-500">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsLightboxOpen(true);
                                }}
                                className="relative flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/20 backdrop-blur-md border border-white/10 hover:bg-black/40 transition-all active:scale-95 text-white shadow-xl"
                            >
                                {/* Ripple Effect (Liseret Lumineux) */}
                                <span className="absolute inset-0 rounded-full border border-white/60 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] opacity-50"></span>
                                <Maximize2 className="relative z-10 w-4 h-4 md:w-5 md:h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- LIGHTBOX FULLSCREEN (PREMIUM ZOOM) --- */}
                {isLightboxOpen && (
                    <div className={`fixed inset-0 z-[3000] flex items-center justify-center animate-in fade-in duration-300 ${darkMode ? 'bg-[#0A0A0A]' : 'bg-[#FAFAF9]'}`}>

                        {/* CONTROLS */}
                        <button
                            onClick={() => setIsLightboxOpen(false)}
                            className={`absolute top-6 right-6 z-[3100] w-12 h-12 flex items-center justify-center rounded-full transition-all shadow-xl border ${darkMode ? 'text-white border-white/20 bg-white/10 hover:bg-white/20' : 'text-stone-900 border-stone-200 bg-white hover:bg-stone-50'}`}
                        >
                            <X size={24} strokeWidth={2} />
                        </button>
                        <div className={`absolute top-10 left-8 z-[3100] text-[10px] font-black uppercase tracking-[0.4em] flex items-center gap-4 ${darkMode ? 'text-white/40' : 'text-stone-950/40'}`}>
                            <span>{activeImg + 1} / {images.length}</span>
                        </div>

                        {/* NAVIGATION (Arrows - Refined & Clearer) */}
                        {images.length > 1 && (
                            <>
                                <button className={`absolute left-0 md:left-6 top-1/2 -translate-y-1/2 p-8 transition-all z-[3100] group active:scale-95 hidden md:block`}
                                    onClick={(e) => { e.stopPropagation(); setActiveImg(prev => prev === 0 ? images.length - 1 : prev - 1); }}>
                                    <ChevronLeft size={40} strokeWidth={1} className={`transition-all duration-500 group-hover:scale-110 ${darkMode ? 'text-white/50 group-hover:text-white' : 'text-stone-900/50 group-hover:text-stone-900'}`} />
                                </button>
                                <button className={`absolute right-0 md:right-6 top-1/2 -translate-y-1/2 p-8 transition-all z-[3100] group active:scale-95 hidden md:block`}
                                    onClick={(e) => { e.stopPropagation(); setActiveImg(prev => prev === images.length - 1 ? 0 : prev + 1); }}>
                                    <ChevronRight size={40} strokeWidth={1} className={`transition-all duration-500 group-hover:scale-110 ${darkMode ? 'text-white/50 group-hover:text-white' : 'text-stone-900/50 group-hover:text-stone-900'}`} />
                                </button>
                            </>
                        )}

                        {/* PAGER INDICATOR (Bottom) */}
                        {images.length > 1 && (
                            <div className="absolute bottom-12 md:bottom-20 left-1/2 -translate-x-1/2 flex gap-3 z-[3100]">
                                {images.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={(e) => { e.stopPropagation(); setActiveImg(idx) }}
                                        className={`h-1 rounded-full transition-all duration-300 ${activeImg === idx ? (darkMode ? 'w-8 bg-white' : 'w-8 bg-stone-900') : (darkMode ? 'w-2 bg-white/20 hover:bg-white/40' : 'w-2 bg-stone-900/20 hover:bg-stone-900/40')}`}
                                    />
                                ))}
                            </div>
                        )}


                        {/* MAIN IMAGE CONTAINER */}
                        <div
                            className="w-full h-full flex items-center justify-center overflow-hidden touch-none"
                            onTouchStart={onTouchStart}
                            onTouchMove={onTouchMove}
                            onTouchEnd={onTouchEnd}
                        >
                            <img
                                src={images[activeImg]}
                                alt="Detail"
                                className="max-w-[95%] max-h-[92vh] object-contain transition-all duration-300 animate-in zoom-in-95 pointer-events-none"
                                draggable={false}
                            />
                        </div>
                    </div>
                )}

                {/* RIGHT COLUMN: NATURAL SCROLL (Fix Overflow) */}
                <div className="w-full lg:w-1/2 px-6 lg:px-16 py-12 flex flex-col justify-center min-h-[50vh] lg:h-[calc(100vh-6rem)]">
                    <div className="max-w-xl mx-auto w-full h-full flex flex-col justify-center">

                        {/* Header */}
                        <div className="space-y-8 mb-12">
                            <div className="flex gap-2">
                                <span className="px-3 py-1 text-[9px] font-black uppercase tracking-widest border border-stone-200 dark:border-stone-800 bg-transparent text-stone-500">Lot n°{item.id.substring(0, 4)}</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-none font-serif font-normal italic">{item.name}</h1>

                        </div>


                        {/* Description (Matched to Red Brace ~260px) */}
                        <div className="p-0 border-l pl-8 border-stone-200 dark:border-stone-800 max-h-[260px] overflow-y-auto custom-scrollbar pr-4 mb-2">
                            <p className="whitespace-pre-wrap font-serif text-lg font-medium leading-loose" style={{ color: darkMode ? '#d6d3d1' : '#000000', opacity: 1 }}>
                                {item.description}
                            </p>
                        </div>

                        {/* Price & Actions */}
                        <div className="px-6 pb-6 pt-0 bg-transparent">
                            {/* NEW COMPACT LAYOUT: PRICE (Left) + SPECS HORIZONTAL (Right) */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 pt-8 gap-6 sm:gap-0">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Prix Actuel</p>
                                    <p className={`${item.priceOnRequest ? 'text-3xl md:text-4xl' : 'text-5xl md:text-6xl'} font-black tracking-tighter font-serif italic font-normal leading-none`}>
                                        {item.priceOnRequest ? (
                                            "Prix sur demande"
                                        ) : (
                                            <><AnimatedPrice amount={item.currentPrice || item.startingPrice || 0} /> €</>
                                        )}
                                    </p>
                                </div>
                                <div className="flex items-end gap-8 md:gap-12 text-right opacity-60 pb-1 md:pb-2">
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

                            {item.auctionActive && !isAuctionOver ? (
                                <div className="space-y-8">
                                    {/* Action Buttons */}
                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black uppercase opacity-40">Placer une enchère rapide</p>
                                        <div className="grid grid-cols-3 gap-3">
                                            {[10, 50, 100].map(inc => {
                                                const isActive = activeBidInc === inc;
                                                return (
                                                    <button
                                                        key={inc}
                                                        onClick={() => handleQuickBid(inc)}
                                                        disabled={bidLoading}
                                                        className={`relative py-4 border font-black text-xs transition-all duration-300 flex items-center justify-center overflow-hidden
                                                            ${isActive ? 'bg-black text-white border-black' : 'hover:bg-black hover:text-white border-stone-200 dark:border-stone-700 bg-transparent'}
                                                            ${bidLoading && !isActive ? 'opacity-30 grayscale cursor-not-allowed' : 'opacity-100'}
                                                        `}
                                                    >
                                                        {isActive ? (
                                                            <div className="flex items-center gap-2">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                                                                <span>OFFRE...</span>
                                                            </div>
                                                        ) : (
                                                            <span>+{inc}€</span>
                                                        )}

                                                        {/* Subtle progress bar effect */}
                                                        {isActive && (
                                                            <div
                                                                className="absolute bottom-0 left-0 h-[2px] w-full bg-white/40 origin-left transition-transform duration-300 ease-out"
                                                                style={{ transform: `scaleX(${bidProgress / 100})` }}
                                                            ></div>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* LIVE AUCTION HISTORY (NEW) */}
                                    <div className="border-t border-stone-200 dark:border-stone-800 pt-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <p className="text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                                                En direct
                                            </p>
                                            <span className="text-[9px] opacity-30">{bidsHistory.length} offres</span>
                                        </div>

                                        <div className="max-h-[120px] overflow-y-auto custom-scrollbar space-y-3">
                                            {bidsHistory.length === 0 ? (
                                                <p className="text-xs italic opacity-30 text-center py-2">Aucune offre pour le moment. Soyez le premier !</p>
                                            ) : (
                                                bidsHistory.map((bid, i) => (
                                                    <div key={bid.id || i} className="flex justify-between items-center text-xs group">
                                                        <div className="flex items-center gap-3">
                                                            <span className="font-mono opacity-30 text-[10px]">
                                                                {bid.timestamp ? new Date(bid.timestamp.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                                            </span>
                                                            <span className={`font-bold ${i === 0 ? 'text-amber-600 dark:text-amber-500' : 'opacity-60'}`}>
                                                                {bid.bidderName || 'Anonyme'}
                                                            </span>
                                                        </div>
                                                        <span className={`font-mono font-bold ${i === 0 ? 'text-amber-600 dark:text-amber-500' : 'opacity-60'}`}>
                                                            {bid.amount} €
                                                        </span>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : !item.auctionActive ? (
                                isInCart ? (
                                    <button onClick={onOpenCart} className="w-full py-6 text-white font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-4 bg-emerald-600 hover:bg-emerald-700 shadow-lg" style={{ borderRadius: palette.borderRadius }}>
                                        <span>Voir ma sélection</span>
                                        <ShoppingBag size={16} />
                                    </button>
                                ) : (
                                    <button onClick={() => { onAddToCart(item); }} className="w-full py-6 text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-emerald-600 transition-all flex items-center justify-center gap-4 bg-black dark:bg-white dark:text-black rounded-none shadow-lg">
                                        <span>Acquérir cette pièce</span>
                                        <ArrowRight size={16} />
                                    </button>
                                )
                            ) : !isWinner ? (
                                <div className="text-center py-12 px-6 space-y-4 border border-stone-200 dark:border-stone-800"
                                    style={{ borderRadius: palette.borderRadius }}>
                                    <div className="flex justify-center mb-2 opacity-20">
                                        <Clock size={40} />
                                    </div>
                                    <p className="font-serif italic text-xl text-stone-400">Cette vente est terminée</p>
                                    <p className="text-[10px] uppercase font-black tracking-widest opacity-30">Clôture des enchères</p>
                                </div>
                            ) : (
                                <div className="relative overflow-hidden p-10 text-center space-y-6 animate-in zoom-in-95 duration-1000 shadow-2xl shadow-emerald-500/10"
                                    style={{
                                        backgroundColor: palette.isDark ? 'rgba(16, 185, 129, 0.05)' : 'rgba(16, 185, 129, 0.03)',
                                        border: `1px solid ${palette.statusValid}40`,
                                        borderRadius: palette.borderRadius
                                    }}>
                                    <div className="flex justify-center">
                                        <div className="p-5 rounded-full animate-bounce shadow-xl"
                                            style={{ backgroundColor: palette.statusValid, color: '#fff' }}>
                                            <Trophy size={32} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-3xl font-black tracking-tighter font-serif italic" style={{ color: palette.statusValid }}>
                                            Félicitations !
                                        </h3>
                                        <p className="text-sm font-medium opacity-80 leading-relaxed max-w-[300px] mx-auto">
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

            {/* === MODULE : VOUS AIMEREZ AUSSI + TUTO ATELIER === */}
            {recommendedProducts.length > 0 && (
                <section className="w-full px-6 lg:px-12 pb-8">
                    <div className={`relative max-w-[1920px] mx-auto p-5 lg:p-8 rounded-[28px] backdrop-blur-xl border ${darkMode ? 'bg-[#141414]/90 border-white/5' : 'bg-white/80 border-stone-200/60'}`}>
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

                            {/* LEFT — Recommended products */}
                            <div className="lg:col-span-7">
                                <p className={`text-[10px] font-black uppercase tracking-[0.28em] mb-5 ${darkMode ? 'text-stone-500' : 'text-stone-400'}`}>
                                    Vous aimerez aussi
                                </p>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                    {recommendedProducts.map(product => (
                                        <ShopProductCard 
                                            key={product.id} 
                                            product={product} 
                                            darkMode={darkMode} 
                                            compact 
                                            source="gallery_detail"
                                            parentFurnitureId={item.id}
                                            parentFurnitureName={item.name}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* RIGHT — Tuto Atelier */}
                            <div className="lg:col-span-5 flex flex-col">
                                <p className={`text-[10px] font-black uppercase tracking-[0.28em] mb-4 ${darkMode ? 'text-amber-500' : 'text-amber-700'}`}>
                                    Tuto Atelier
                                </p>
                                <h3 className={`font-serif text-xl lg:text-2xl leading-tight mb-5 ${darkMode ? 'text-stone-50' : 'text-stone-900'}`}>
                                    {currentTutorial?.label}
                                </h3>
                                <div className="relative">
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={currentTutorial?.videoId}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ duration: 0.35 }}
                                            className="relative aspect-video rounded-xl overflow-hidden shadow-2xl"
                                        >
                                            <iframe
                                                src={`https://www.youtube.com/embed/${currentTutorial?.videoId}?rel=0&modestbranding=1&color=white`}
                                                title={currentTutorial?.label}
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                                allowFullScreen
                                                loading="lazy"
                                                className="absolute inset-0 w-full h-full"
                                            />
                                        </motion.div>
                                    </AnimatePresence>

                                    {/* Arrows anchored to video edges */}
                                    {RECOMMENDED_TUTORIALS.length > 1 && (
                                        <>
                                            <button
                                                onClick={() => setTutorialIndex(prev => (prev - 1 + RECOMMENDED_TUTORIALS.length) % RECOMMENDED_TUTORIALS.length)}
                                                aria-label="Tutoriel précédent"
                                                className={`absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full flex items-center justify-center shadow-lg border transition-all duration-200 ${darkMode ? 'bg-[#1a1a1a] border-white/10 text-stone-300 hover:bg-amber-500/20 hover:border-amber-500/30' : 'bg-white border-stone-200 text-stone-600 hover:bg-amber-50 hover:border-amber-300'}`}
                                            >
                                                <ChevronLeft size={14} />
                                            </button>
                                            <button
                                                onClick={() => setTutorialIndex(prev => (prev + 1) % RECOMMENDED_TUTORIALS.length)}
                                                aria-label="Tutoriel suivant"
                                                className={`absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full flex items-center justify-center shadow-lg border transition-all duration-200 ${darkMode ? 'bg-[#1a1a1a] border-white/10 text-stone-300 hover:bg-amber-500/20 hover:border-amber-500/30' : 'bg-white border-stone-200 text-stone-600 hover:bg-amber-50 hover:border-amber-300'}`}
                                            >
                                                <ChevronRight size={14} />
                                            </button>
                                        </>
                                    )}
                                </div>

                                {/* Mobile arrows + YouTube link + dots */}
                                <div className="mt-4 flex items-center justify-between gap-3">
                                    <a
                                        href={`https://www.youtube.com/watch?v=${currentTutorial?.videoId}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`inline-flex items-center gap-2 text-[11px] font-medium transition-colors ${darkMode ? 'text-stone-400 hover:text-amber-400' : 'text-stone-500 hover:text-amber-700'}`}
                                    >
                                        <span className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center flex-shrink-0">
                                            <span className="w-0 h-0 border-l-[5px] border-l-white border-y-[3px] border-y-transparent ml-[1px]" />
                                        </span>
                                        Regarder sur YouTube
                                        <span>→</span>
                                    </a>
                                    {RECOMMENDED_TUTORIALS.length > 1 && (
                                        <div className="flex items-center gap-1.5">
                                            {RECOMMENDED_TUTORIALS.map((_, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => setTutorialIndex(i)}
                                                    aria-label={`Tutoriel ${i + 1}`}
                                                    className={`rounded-full transition-all duration-300 ${
                                                        i === tutorialIndex
                                                            ? `w-4 h-1.5 ${darkMode ? 'bg-amber-500' : 'bg-amber-600'}`
                                                            : `w-1.5 h-1.5 ${darkMode ? 'bg-white/20 hover:bg-white/40' : 'bg-stone-300 hover:bg-stone-400'}`
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* === MODULE : QUATRE PILIERS DE LA MAISON === */}
            <section className="w-full px-6 lg:px-12 pb-16">
                <div className={`max-w-[1920px] mx-auto p-8 lg:p-12 rounded-[28px] backdrop-blur-xl border ${darkMode ? 'bg-[#141414]/90 border-white/5' : 'bg-white/80 border-stone-200/60'}`}>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
                        {CARE_FEATURES.map(({ icon: Icon, title, description }) => (
                            <div key={title} className="flex flex-col items-center text-center">
                                <div className={`w-14 h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center mb-4 border ${darkMode ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-amber-600/10 border-amber-600/20 text-amber-700'}`}>
                                    <Icon size={24} strokeWidth={1.5} />
                                </div>
                                <h4 className={`text-[11px] lg:text-xs font-black uppercase tracking-[0.2em] mb-3 ${darkMode ? 'text-stone-100' : 'text-stone-900'}`}>
                                    {title}
                                </h4>
                                <p className={`text-[11px] lg:text-xs leading-relaxed max-w-[220px] ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                                    {description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ArchitecturalProductDetail;
