import React, { useState } from 'react';
import { ShoppingBag, Heart, Grid, LayoutList, ArrowRight } from 'lucide-react';
import { db, appId } from '../firebase/config';
import { doc, updateDoc, increment, onSnapshot } from 'firebase/firestore';
const AuctionTimer = React.lazy(() => import('./ui/AuctionTimer'));
const CommentsModal = React.lazy(() => import('./ui/CommentsModal'));

const GalleryView = ({ items, boardItems = [], isAdmin, isSecretGateOpen, user, onSelectItem, onShowLogin, darkMode = false }) => {
    const [filter, setFilter] = useState('fixed');
    const [activeCollection, setActiveCollection] = useState('furniture'); // 'furniture' | 'cutting_boards'
    const [viewMode, setViewMode] = useState('grid'); // 'grid' (2 cols) | 'list' (1 col)

    const [likedItems, setLikedItems] = useState(() => {
        const saved = localStorage.getItem('tat_liked_items_v2');
        return saved ? JSON.parse(saved) : [];
    });
    const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
    const [selectedItemForComments, setSelectedItemForComments] = useState(null);

    // Global Stats Reset Check (Real-time)
    React.useEffect(() => {
        const docRef = doc(db, 'sys_metadata', 'stats_reset');

        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                // Get timestamp safely.
                const lastGlobalReset = data.lastStatsReset?.toMillis ? data.lastStatsReset.toMillis() : (data.lastStatsReset || 0);

                const localVal = localStorage.getItem('tat_last_local_reset');
                // Ensure local is a valid number, default to 0
                const lastLocalReset = localVal && !isNaN(Number(localVal)) ? Number(localVal) : 0;

                const shouldReset = lastGlobalReset > 0 && lastGlobalReset > lastLocalReset;

                if (shouldReset) {
                    console.log("Stats reset signal received. Clearing local cache (v2).");

                    localStorage.removeItem('tat_liked_items_v2');
                    localStorage.removeItem('tat_shared_items_v2');
                    localStorage.setItem('tat_last_local_reset', lastGlobalReset.toString());

                    setLikedItems([]);
                }
            }
        });

        return () => unsubscribe();
    }, []);

    const currentItems = React.useMemo(() =>
        activeCollection === 'furniture' ? items : boardItems,
        [activeCollection, items, boardItems]
    );

    const filteredItems = React.useMemo(() => {
        return currentItems.filter(i => {
            const isVisible = i.status === 'published' || (isAdmin && isSecretGateOpen);
            if (!isVisible) return false;
            if (filter === 'auction') return i.auctionActive;
            if (filter === 'fixed') return !i.auctionActive;
            return true;
        });
    }, [currentItems, filter, isAdmin, isSecretGateOpen]);

    const handleLike = React.useCallback(async (e, item) => {
        e.stopPropagation();
        const isLiked = likedItems.includes(item.id);
        const newLikestatus = !isLiked;

        // 1. Optimistic UI Update (Client-side instant feedback)
        let newLikedItems;
        if (newLikestatus) newLikedItems = [...likedItems, item.id];
        else newLikedItems = likedItems.filter(id => id !== item.id);

        setLikedItems(newLikedItems);
        localStorage.setItem('tat_liked_items_v2', JSON.stringify(newLikedItems));

        // 2. Secure Server-Side Update
        try {
            const { httpsCallable } = await import('firebase/functions');
            const { functions } = await import('../firebase/config');
            const toggleLike = httpsCallable(functions, 'toggleLike');

            await toggleLike({
                itemId: item.id,
                collectionName: activeCollection
            });
            // The Firestore onSnapshot in parent component will update user's view with real count
        } catch (error) {
            console.error("Error toggling like:", error);
            // Rollback if needed (optional but recommended for robust apps)
        }
    }, [likedItems, activeCollection]);

    const handleCommentClick = React.useCallback((e, item) => {
        e.stopPropagation();
        setSelectedItemForComments(item);
        setIsCommentModalOpen(true);
    }, []);

    const handleShare = React.useCallback(async (e, item) => {
        e.stopPropagation();

        let shareSuccessful = false;
        // Création du lien spécifique vers le produit
        const shareUrl = `${window.location.origin}/?product=${item.id}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Tous à Table - ${item.name}`,
                    text: `Découvre cette pièce unique : ${item.name}`,
                    url: shareUrl
                });
                shareSuccessful = true; // Only true if user completed the share
            } catch (error) {
                // User cancelled the share dialog or error occurred
                console.log('Share cancelled or failed:', error);
            }
        } else {
            // Fallback: clipboard copy always "succeeds"
            navigator.clipboard.writeText(shareUrl);
            alert("Lien copié !");
            shareSuccessful = true;
        }

        // --- STATS LOGIC SÉCURISÉE (VIA CLOUD FUNCTION) ---
        if (shareSuccessful) {
            const sharedItemsKey = 'tat_shared_items_v2';
            const sharedItems = JSON.parse(localStorage.getItem(sharedItemsKey) || '[]');

            if (!sharedItems.includes(item.id)) {
                try {
                    // Mark locally immediately
                    sharedItems.push(item.id);
                    localStorage.setItem(sharedItemsKey, JSON.stringify(sharedItems));

                    // Call Server Function
                    const { httpsCallable } = await import('firebase/functions');
                    const { functions } = await import('../firebase/config');
                    const trackShare = httpsCallable(functions, 'trackShare');

                    await trackShare({
                        itemId: item.id,
                        collectionName: activeCollection
                    });

                } catch (error) {
                    console.error("Error tracking share:", error);
                }
            } else {
                console.log("Stat not incremented: Item already shared by this user.");
            }
        }
    }, [activeCollection]);

    return (
        <div className={`min-h-screen pb-32 transition-colors duration-500 ${darkMode ? 'bg-stone-900 text-white' : 'bg-[#F5F5F7] text-[#1D1D1F]'}`}>

            <React.Suspense fallback={null}>
                <CommentsModal
                    isOpen={isCommentModalOpen}
                    onClose={() => setIsCommentModalOpen(false)}
                    itemId={selectedItemForComments?.id}
                    user={user}
                    isAdmin={isAdmin}
                    activeCollection={activeCollection}
                />
            </React.Suspense>

            {/* --- HEADER --- */}
            <div className="pt-24 md:pt-32 pb-8 md:pb-12 px-5 sm:px-8 md:px-[8vw] xl:px-[12vw] flex flex-col lg:flex-row lg:items-end justify-between gap-6 lg:gap-10">
                <div className="space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-2xl">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full backdrop-blur-md border w-fit shadow-sm transition-colors ${darkMode ? 'bg-white/10 border-white/10' : 'bg-white/60 border-black/5'}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${darkMode ? 'text-white/80' : 'text-black/60'}`}>Marketplace Live</span>
                    </div>
                    <h2 className={`font-serif text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-medium tracking-tight leading-[0.9] transition-colors ${darkMode ? 'text-white' : 'text-[#1D1D1F]'}`}>
                        La Galerie<span className="text-[#9C8268]">.</span>
                    </h2>
                </div>

                <div className={`flex p-1.5 rounded-full w-full sm:w-fit self-start lg:self-end animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100 overflow-x-auto no-scrollbar transition-colors ${darkMode ? 'bg-white/10' : 'bg-[#E8E8ED]'}`}>
                    <button onClick={() => { setActiveCollection('furniture'); setFilter('fixed'); }} className={`relative flex-1 sm:flex-none px-6 sm:px-8 py-3 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all duration-300 whitespace-nowrap ${activeCollection === 'furniture' ? (darkMode ? 'bg-stone-800 text-white shadow-sm' : 'bg-white text-black shadow-sm') : (darkMode ? 'text-white/40 hover:text-white/80 hover:bg-white/5' : 'text-black/40 hover:text-black/70 hover:bg-black/5')} ${activeCollection === 'furniture' ? 'scale-100' : ''}`}>Mobilier</button>
                    <button onClick={() => { setActiveCollection('cutting_boards'); setFilter('fixed'); }} className={`relative flex-1 sm:flex-none px-6 sm:px-8 py-3 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all duration-300 whitespace-nowrap ${activeCollection === 'cutting_boards' ? (darkMode ? 'bg-stone-800 text-white shadow-sm' : 'bg-white text-black shadow-sm') : (darkMode ? 'text-white/40 hover:text-white/80 hover:bg-white/5' : 'text-black/40 hover:text-black/70 hover:bg-black/5')} ${activeCollection === 'cutting_boards' ? 'scale-100' : ''}`}>Planches</button>
                </div>
            </div>

            {/* --- FILTRES & VIEW TOGGLE --- */}
            <div className="px-5 sm:px-8 md:px-[8vw] xl:px-[12vw] mb-6 md:mb-12 flex flex-row items-center justify-between gap-4 animate-in fade-in duration-1000 delay-200">

                {/* Filtres TYPE */}
                <div className="flex-1 overflow-x-auto no-scrollbar mask-linear-fade">
                    {activeCollection === 'furniture' && (
                        <div className="flex gap-2 md:gap-3">
                            {['fixed', 'auction'].map((f) => (
                                <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 md:px-5 md:py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all duration-300 whitespace-nowrap ${filter === f ? (darkMode ? 'bg-white text-black border-white shadow-lg shadow-white/10' : 'bg-[#1D1D1F] text-white border-[#1D1D1F] shadow-lg shadow-black/10') : (darkMode ? 'bg-transparent text-white/40 border-white/20 hover:border-white/40 hover:text-white/90' : 'bg-transparent text-black/40 border-black/10 hover:border-black/30 hover:text-black/80')}`}>{f === 'fixed' ? 'Immédiat' : 'Enchères'}</button>
                            ))}
                        </div>
                    )}
                </div>

                {/* VIEW SWITCHER */}
                <div className={`flex p-1 rounded-xl shadow-sm border shrink-0 transition-colors ${darkMode ? 'bg-stone-800 border-stone-700' : 'bg-white border-stone-200'}`}>
                    <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? (darkMode ? 'bg-stone-700 text-white shadow-inner' : 'bg-stone-100 text-black shadow-inner') : (darkMode ? 'text-stone-500 hover:text-stone-300' : 'text-stone-400 hover:text-stone-600')}`}>
                        <Grid size={18} />
                    </button>
                    <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? (darkMode ? 'bg-stone-700 text-white shadow-inner' : 'bg-stone-100 text-black shadow-inner') : (darkMode ? 'text-stone-500 hover:text-stone-300' : 'text-stone-400 hover:text-stone-600')}`}>
                        <LayoutList size={18} />
                    </button>
                </div>
            </div>

            <div className={`px-4 sm:px-8 md:px-[8vw] xl:px-[12vw] grid gap-x-3 gap-y-6 md:gap-x-8 md:gap-y-12 transition-all duration-500 ${viewMode === 'grid' ? 'grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
                {filteredItems.length === 0 ? (
                    <div className="col-span-full py-32 flex flex-col items-center justify-center text-center opacity-40 space-y-4">
                        <ShoppingBag size={48} strokeWidth={1} />
                        <p className="font-serif text-2xl italic">Cette collection est vide pour le moment.</p>
                    </div>
                ) : (
                    filteredItems.map((item, index) => (
                        <div
                            key={item.id}
                            onClick={() => { if (item.auctionActive && user?.isAnonymous) onShowLogin(); else onSelectItem(item.id); }}
                            className={`group relative flex flex-col cursor-pointer animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-backwards transform-gpu`}
                            style={{
                                animationDelay: index < 8 ? `${index * 50}ms` : '0ms',
                                willChange: 'transform, opacity'
                            }}
                        >
                            {/* NEW CARD STRUCTURE (NFT STYLE) */}
                            <div
                                className={`relative w-full overflow-hidden rounded-xl transition-all duration-300 ease-out group-hover:-translate-y-2 ${darkMode ? 'bg-[#1C1C1E] shadow-2xl shadow-black/50' : 'bg-white shadow-xl shadow-stone-200/50'} ${viewMode === 'list' ? 'aspect-[4/5]' : 'aspect-[3/4] md:aspect-[4/5]'}`}
                            >
                                {/* 1. IMAGE LAUNCHER (Top Section) */}
                                <div className="absolute inset-x-0 top-0 bottom-[88px] overflow-hidden">
                                    <img
                                        src={item.images?.[0] || item.imageUrl}
                                        alt={item.name}
                                        className="w-full h-full object-cover transform-gpu transition-transform duration-700 ease-out group-hover:scale-110"
                                        loading="lazy"
                                        decoding="async"
                                    />
                                    {/* DÉCOUVRIR OVERLAY (Clean Hover) */}
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                        <div className="bg-white/90 dark:bg-black/80 backdrop-blur-md px-6 py-3 rounded-full flex items-center gap-3 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                                            <span className="text-[10px] uppercase font-bold tracking-widest text-black dark:text-white">Découvrir</span>
                                            <ArrowRight size={14} className="text-black dark:text-white" />
                                        </div>
                                    </div>
                                </div>

                                {/* 2. STATUS BADGE V2 (Top Left - Revamp) */}
                                <div className="absolute top-4 left-4 z-20">
                                    {item.auctionActive ? (
                                        <div className={`px-4 py-1.5 rounded-full backdrop-blur-md border shadow-sm flex items-center gap-2 ${darkMode ? 'bg-black/60 border-white/10 text-white' : 'bg-white/80 border-black/5 text-black'}`}>
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#34C759] animate-pulse"></div>
                                            <span className="text-[10px] font-mono font-bold tracking-widest">
                                                <React.Suspense fallback="..:..">
                                                    <AuctionTimer endDate={item.auctionEnd} />
                                                </React.Suspense>
                                            </span>
                                        </div>
                                    ) : (
                                        <div className={`px-4 py-1.5 rounded-full flex items-center gap-2 border backdrop-blur-md shadow-sm ${item.sold
                                            ? 'bg-red-500/90 border-red-400 text-white'
                                            : (darkMode ? 'bg-[#1C1C1E]/80 border-white/20 text-white' : 'bg-white/90 border-black/5 text-black')}`}>
                                            <div className={`w-2 h-2 rounded-full ${item.sold ? 'bg-white' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse'}`}></div>
                                            <span className="text-[10px] font-black uppercase tracking-widest leading-none pt-0.5">
                                                {item.sold ? 'Vendu' : 'Disponible'}
                                            </span>
                                        </div>
                                    )}
                                </div>



                                {/* 4. SOCIAL ACTIONS (Right Side - Floating) */}
                                <div className="absolute top-20 right-4 flex flex-col gap-5 z-20">
                                    <button onClick={(e) => handleLike(e, item)} className={`p-2.5 rounded-full backdrop-blur-md border transition-all hover:scale-110 active:scale-95 group/icon ${likedItems.includes(item.id) ? 'bg-red-500 border-red-500 text-white' : (darkMode ? 'bg-black/40 border-white/10 text-white hover:bg-black/60' : 'bg-white/60 border-white/40 text-black hover:bg-white/90')}`}>
                                        <Heart size={16} className={`${likedItems.includes(item.id) ? 'fill-current' : ''}`} />
                                    </button>
                                    <button onClick={(e) => handleCommentClick(e, item)} className={`p-2.5 rounded-full backdrop-blur-md border transition-all hover:scale-110 active:scale-95 group/icon ${darkMode ? 'bg-black/40 border-white/10 text-white hover:bg-black/60' : 'bg-white/60 border-white/40 text-black hover:bg-white/90'}`}>
                                        <span className="text-[10px] font-bold absolute -top-1 -right-1 bg-white text-black w-4 h-4 flex items-center justify-center rounded-full shadow-sm border border-black/10">{item.commentCount || 0}</span>
                                        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                                    </button>
                                    <button onClick={(e) => handleShare(e, item)} className={`p-2.5 rounded-full backdrop-blur-md border transition-all hover:scale-110 active:scale-95 group/icon ${darkMode ? 'bg-black/40 border-white/10 text-white hover:bg-black/60' : 'bg-white/60 border-white/40 text-black hover:bg-white/90'}`}>
                                        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>
                                    </button>
                                </div>

                                {/* 5. COLOR ZONE FOOTER (Info Panel) */}
                                <div className={`absolute bottom-0 inset-x-0 h-[88px] px-6 py-4 flex items-center justify-between border-t transition-colors duration-300 z-10 ${darkMode ? 'bg-[#1C1C1E] border-white/5' : 'bg-white border-black/5'}`}>
                                    {/* Left: Name & Material */}
                                    <div className="flex flex-col gap-1 max-w-[65%]">
                                        <h3 className={`font-mono font-medium text-[15px] md:text-base leading-snug truncate ${darkMode ? 'text-white' : 'text-[#1D1D1F]'}`}>
                                            {item.name}
                                        </h3>
                                        <p className={`text-[10px] font-mono font-medium uppercase tracking-widest ${darkMode ? 'text-white/60' : 'text-[#1D1D1F]/70'}`}>
                                            {item.material || 'Atelier Normand'}
                                        </p>
                                    </div>

                                    {/* Right: Stock & Price */}
                                    <div className="flex flex-col items-end justify-center gap-1">
                                        {/* Stock Label */}
                                        <div className={`px-2 py-[3px] rounded-[4px] border text-[8px] font-mono font-bold uppercase tracking-wider mb-0.5 ${darkMode ? 'border-white/20 text-emerald-400 bg-emerald-400/10' : 'border-black/10 text-emerald-700 bg-emerald-50'}`}>
                                            {item.sold ? 'Rupture' : `Stock ${item.stock || 1}`}
                                        </div>
                                        {/* Price */}
                                        <div className={`font-mono font-medium text-[15px] md:text-base tracking-tight ${darkMode ? 'text-white' : 'text-[#1D1D1F]'}`}>
                                            {item.currentPrice || item.startingPrice} €
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    ))
                )}
            </div>
        </div >
    );
};

export default GalleryView;
