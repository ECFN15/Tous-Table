import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, Box, Heart, MessageCircle, Share2, ArrowRight, Trophy, Zap, Clock } from 'lucide-react';
import { db, appId, functions } from '../../firebase/config';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
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
        setBidLoading(true);
        try {
            const result = await placeBidFunction({
                itemId: item.id,
                collectionName: collectionName,
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
        <div className={`min-h-screen transition-colors duration-500 animate-in fade-in ${darkMode ? 'bg-[#0A0A0A] text-stone-200' : 'bg-[#FAFAF9] text-stone-900'}`}>

            <ArchitecturalHeader
                user={user}
                onShowLogin={onShowLogin}
                onOpenMenu={onOpenMenu}
                onOpenCart={onOpenCart}
                toggleTheme={toggleTheme}
                darkMode={darkMode}
                onBack={onBack}
            />

            <div className="w-full h-auto md:h-[calc(100vh-5rem)] overflow-hidden flex flex-col md:flex-row">
                {/* BACK BUTTON (Absolute Top Left) */}
                <div className="absolute top-24 left-6 z-50 md:hidden">
                    <button onClick={onBack} className="flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest px-4 py-2 bg-white/80 dark:bg-black/80 backdrop-blur rounded-full">
                        <ChevronLeft size={14} /> Retour
                    </button>
                </div>

                {/* LEFT COLUMN: IMAGE GALLERY (Fixed & Styled like Atelier Theme) */}
                <div className="w-full md:w-1/2 h-[50vh] md:h-full flex flex-col p-6 md:p-12">

                    {/* BACK BUTTON (Desktop - Above Image) */}
                    <button onClick={onBack} className="hidden md:flex items-center gap-3 font-bold text-[10px] uppercase tracking-widest transition-colors hover:opacity-60 mb-6 opacity-60 hover:opacity-100">
                        <ChevronLeft size={14} /> Retour Collection
                    </button>

                    {/* ROUNDED IMAGE CONTAINER */}
                    <div className="relative w-full flex-1 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/20 group"
                        onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const x = e.clientX - rect.left;
                            if (x < rect.width / 2) {
                                setActiveImg(prev => prev === 0 ? images.length - 1 : prev - 1);
                            } else {
                                setActiveImg(prev => prev === images.length - 1 ? 0 : prev + 1);
                            }
                        }}>
                        <img
                            src={images[activeImg]}
                            className="w-full h-full object-cover transition-transform duration-700 ease-in-out"
                            alt={item.name}
                        />

                        {/* Arrows (Visible on hover) */}
                        {images.length > 1 && (
                            <>
                                <div className="absolute top-1/2 left-6 -translate-y-1/2 p-3 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer drop-shadow-md bg-black/20 backdrop-blur-md rounded-full hover:bg-black/50 hover:scale-110 flex items-center justify-center"><ChevronLeft size={24} strokeWidth={2} /></div>
                                <div className="absolute top-1/2 right-6 -translate-y-1/2 p-3 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 rotate-180 cursor-pointer drop-shadow-md bg-black/20 backdrop-blur-md rounded-full hover:bg-black/50 hover:scale-110 flex items-center justify-center"><ChevronLeft size={24} strokeWidth={2} /></div>
                            </>
                        )}

                        {/* Pager (Bottom Overlay) */}
                        {images.length > 1 && (
                            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
                                {images.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={(e) => { e.stopPropagation(); setActiveImg(idx) }}
                                        className={`h-1.5 rounded-full transition-all duration-300 shadow-sm backdrop-blur-sm ${activeImg === idx ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/80'}`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT COLUMN: SCROLLABLE INFO */}
                <div className="w-full md:w-1/2 h-auto md:h-full md:overflow-y-auto px-6 md:px-16 py-12 md:py-24 flex flex-col justify-center">

                    <div className="max-w-xl mx-auto w-full space-y-10">
                        <button onClick={onBack} className="flex md:hidden items-center gap-2 font-bold text-xs uppercase tracking-widest transition-colors hover:opacity-60 mb-8 opacity-100">
                            <ChevronLeft size={16} /> Retour Collection
                        </button>
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
