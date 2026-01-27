import React, { useState } from 'react';
import { ShoppingBag, Heart, Grid, LayoutList, ArrowRight, Gavel } from 'lucide-react';
import { functions } from '../firebase/config';
import { httpsCallable } from 'firebase/functions';
import { useRealtimeUserLikes } from '../hooks/useRealtimeUserLikes'; // Import Hook
const AuctionTimer = React.lazy(() => import('../components/ui/AuctionTimer'));
import WarmAmbienceBackground from '../components/WarmAmbienceBackground';
const SEO = React.lazy(() => import('../components/SEO'));

const GalleryView = ({ items, boardItems = [], isAdmin, isSecretGateOpen, user, onSelectItem, onShowLogin, onShowComments, darkMode = false }) => {
    const [filter, setFilter] = useState('fixed');
    const [activeCollection, setActiveCollection] = useState('furniture'); // 'furniture' | 'cutting_boards'
    const [viewMode, setViewMode] = useState('grid'); // 'grid' (2 cols) | 'list' (1 col)

    // HOOK TEMPS RÉEL
    const { likedItemIds, toggleLike } = useRealtimeUserLikes(user);

    // --- LOGIC: FILTER & SORT ---
    // 1. Choose collection source
    const sourceItems = activeCollection === 'furniture' ? items : boardItems;

    // 2. Filter by Status (Public only) & Type (Auction/Fixed)
    const filteredItems = sourceItems.filter(item => {
        if (item.status !== 'published') return false;

        // Séparation stricte : Enchères vs Vente Directe
        if (filter === 'auction') {
            return item.auctionActive === true;
        } else {
            return !item.auctionActive;
        }
    });

    // --- HANDLERS ---
    const handleLike = async (e, item) => {
        e.stopPropagation();
        if (!user) {
            onShowLogin();
            return;
        }

        try {
            // Action immédiate via Firestore Direct (Hook)
            await toggleLike(item.id, activeCollection);
        } catch (err) {
            console.error("Error like:", err);
            alert("Impossible de liker. Vérifiez votre connexion.");
        }
    };

    const handleShare = async (e, item) => {
        e.stopPropagation();
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

            // Track share in background (Optionnel, si on veut encore tracker les shares avec compteur)
            // On peut garder l'ancien système ou passer en direct aussi. 
            // Pour l'instant on garde Cloud Function pour share ou on adapte ? 
            // Le Backend a un Trigger 'onShareCreated', donc il faut écrire dans la subcol 'shares'.
            // Mais pour simplifier ici, on laisse tel quel ou on implémente un 'addShare' simple.
            // On va laisser le trackShare cloud function pour l'instant si elle existe encore, 
            // ou mieux : écrire dans la collection. (Mais require auth).

        } catch (err) {
            console.error(err);
        }
    };

    const handleCommentClick = (e, item) => {
        e.stopPropagation();
        onShowComments(item, activeCollection);
    };

    return (
        <div className={`min-h-screen pb-32 transition-colors duration-500 ${darkMode ? 'bg-[#0a0807] text-white' : 'bg-[#e0d0c1] text-[#1D1D1F]'}`}>

            <React.Suspense fallback={null}>
                <SEO
                    title="La Galerie - Marketplace Ébénisterie d'Art"
                    description="Découvrez nos pièces uniques de mobilier et d'objets d'art restaurés ou créés à la main. Enchères exclusives et vente directe."
                    url="/?page=gallery"
                />
            </React.Suspense>

            {/* AMBIANCE BACKGROUND (Three.js) */}
            <WarmAmbienceBackground darkMode={darkMode} />

            {/* CONTENT WRAPPER */}
            <div className="relative z-10">

                {/* --- HEADER --- */}
                {/* --- HEADER --- */}
                {/* Mobile: pt-20 (80px) to move title UP, making room for subtitle without pushing cards down */}
                <div className="pt-20 md:pt-28 pb-6 md:pb-12 px-5 sm:px-8 md:px-[8vw] xl:px-[12vw] flex flex-col lg:flex-row lg:items-end justify-between gap-3 lg:gap-10">
                    <div className="space-y-1 md:space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-2xl">
                        {/* BADGE REMOVED HERE */}
                        {/* Mobile: Larger Title (text-5xl) */}
                        <h1 className={`font-serif text-5xl sm:text-5xl md:text-7xl lg:text-8xl font-medium tracking-tight leading-[0.9] transition-colors ${darkMode ? 'text-white' : 'text-[#1a0f0a] mix-blend-multiply opacity-100'}`}>
                            La Galerie<span className="text-[#FAF9F6] dark:text-[#FAF9F6] drop-shadow-[0_0_10px_rgba(250,249,246,0.3)] scale-110 inline-block transform translate-x-1">.</span>
                        </h1>
                        {/* NEW SUBTITLE */}
                        <p className={`font-serif italic text-lg sm:text-xl tracking-wide opacity-80 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-100 ${darkMode ? 'text-white/80' : 'text-[#1a0f0a]/80'}`}>
                            {activeCollection === 'furniture' ? 'Nos Meubles de Ferme' : 'Nos Planches à Découper'}
                        </p>
                    </div>
                </div>

                {/* --- FILTRES & VIEW TOGGLE --- */}
                {/* Mobile: Increased margin bottom (mb-8) to separate from cards */}
                <div className="px-5 sm:px-8 md:px-[8vw] xl:px-[12vw] mb-8 md:mb-12 flex flex-row items-center justify-between gap-4 animate-in fade-in duration-1000 delay-200">

                    {/* SWITCHER COLLECTION (Moved from Header) */}
                    <div className={`flex p-1 rounded-full w-fit shadow-lg transition-all ${darkMode ? 'bg-stone-800 border border-white/5' : 'bg-white/80 backdrop-blur-md border border-black/5'}`}>
                        <button onClick={() => { setActiveCollection('furniture'); setFilter('fixed'); }} className={`px-4 md:px-6 py-1.5 md:py-2 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-widest transition-all duration-300 whitespace-nowrap ${activeCollection === 'furniture' ? (darkMode ? 'bg-stone-700 text-white shadow-md' : 'bg-stone-900 text-white shadow-md') : (darkMode ? 'text-white/40 hover:text-white/80' : 'text-stone-900/40 hover:text-stone-900/80')}`}>Mobilier</button>
                        <button onClick={() => { setActiveCollection('cutting_boards'); setFilter('fixed'); }} className={`px-4 md:px-6 py-1.5 md:py-2 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-widest transition-all duration-300 whitespace-nowrap ${activeCollection === 'cutting_boards' ? (darkMode ? 'bg-stone-700 text-white shadow-md' : 'bg-stone-900 text-white shadow-md') : (darkMode ? 'text-white/40 hover:text-white/80' : 'text-stone-900/40 hover:text-stone-900/80')}`}>Planches</button>
                    </div>

                    {/* VIEW SWITCHER + AUCTION */}
                    <div className="flex items-center gap-2">
                        <div className={`flex p-0.5 rounded-lg shadow-sm border shrink-0 transition-colors ${darkMode ? 'bg-stone-800 border-stone-700' : 'bg-white border-stone-200'}`}>
                            <button
                                onClick={() => setFilter(filter === 'auction' ? 'fixed' : 'auction')}
                                className={`p-1.5 rounded-md transition-all relative group ${filter === 'auction' ? (darkMode ? 'bg-amber-500 text-white shadow-inner' : 'bg-stone-900 text-white shadow-inner') : (darkMode ? 'text-stone-500 hover:text-stone-300' : 'text-stone-400 hover:text-stone-600')}`}
                                title="Enchères"
                            >
                                <Gavel size={14} />
                            </button>
                            <div className="w-px h-4 bg-stone-200 dark:bg-stone-700 mx-1 self-center opacity-50"></div>
                            <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? (darkMode ? 'bg-stone-700 text-white shadow-inner' : 'bg-stone-100 text-black shadow-inner') : (darkMode ? 'text-stone-500 hover:text-stone-300' : 'text-stone-400 hover:text-stone-600')}`}>
                                <Grid size={14} />
                            </button>
                            <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? (darkMode ? 'bg-stone-700 text-white shadow-inner' : 'bg-stone-100 text-black shadow-inner') : (darkMode ? 'text-stone-500 hover:text-stone-300' : 'text-stone-400 hover:text-stone-600')}`}>
                                <LayoutList size={14} />
                            </button>
                        </div>
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
                                    className={`relative w-full overflow-hidden rounded-xl transition-all duration-300 ease-out group-hover:-translate-y-2 ${darkMode ? 'bg-[#1C1C1E] shadow-2xl shadow-black/50' : 'bg-[#FAF9F6] shadow-xl shadow-black/10'} ${viewMode === 'list' ? 'aspect-[4/5]' : 'aspect-[3/4] md:aspect-[4/5]'}`}
                                >
                                    {/* 1. IMAGE LAUNCHER (Top Section) */}
                                    <div className="absolute inset-x-0 top-0 bottom-[64px] md:bottom-[88px] overflow-hidden">
                                        <img
                                            src={item.thumbnailUrl || item.thumbnails?.[0] || item.images?.[0] || item.imageUrl}
                                            alt={item.name}
                                            className="w-full h-full object-cover transform-gpu transition-transform duration-700 ease-out group-hover:scale-110"
                                            loading="lazy"
                                            decoding="async"
                                        />
                                        {/* DÉCOUVRIR OVERLAY (Clean Hover) */}
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:flex items-center justify-center">
                                            <div className="bg-white/90 dark:bg-black/80 backdrop-blur-md px-6 py-3 rounded-full flex items-center gap-3 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                                                <span className="text-[10px] uppercase font-bold tracking-widest text-black dark:text-white">Découvrir</span>
                                                <ArrowRight size={14} className="text-black dark:text-white" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* 2. STATUS BADGE V2 (Top Left - Revamp) */}
                                    <div className="absolute top-3 left-3 md:top-4 md:left-4 z-20">
                                        {item.auctionActive ? (
                                            <div className={`${viewMode === 'list' ? 'px-3 py-1.5' : 'px-2.5 py-1.5'} md:px-4 md:py-1.5 rounded-full backdrop-blur-md border shadow-sm flex items-center gap-2 ${darkMode ? 'bg-black/60 border-white/10 text-white' : 'bg-white/80 border-black/5 text-black'}`}>
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#34C759] animate-pulse"></div>
                                                <span className={`${viewMode === 'list' ? 'text-[10px]' : 'text-[9px]'} md:text-[10px] font-mono font-bold tracking-wider leading-none`}>
                                                    <React.Suspense fallback="..:..">
                                                        <AuctionTimer endDate={item.auctionEnd} />
                                                    </React.Suspense>
                                                </span>
                                            </div>
                                        ) : (
                                            <div className={`${viewMode === 'list' ? 'px-3 py-1.5' : 'px-2.5 py-1.5'} md:px-4 md:py-1.5 rounded-full flex items-center gap-2 border backdrop-blur-md shadow-sm ${item.sold
                                                ? 'bg-red-500/90 border-red-400 text-white'
                                                : (darkMode ? 'bg-[#1C1C1E]/80 border-white/20 text-white' : 'bg-white/90 border-black/5 text-black')}`}>
                                                <div className={`${viewMode === 'list' ? 'w-2 h-2' : 'w-1.5 h-1.5'} md:w-2 md:h-2 rounded-full ${item.sold ? 'bg-white' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse'}`}></div>
                                                <span className={`${viewMode === 'list' ? 'text-[10px]' : 'text-[9.5px]'} md:text-[10px] font-bold uppercase tracking-wider leading-none`}>
                                                    {item.sold ? 'Vendu' : 'Disponible'}
                                                </span>
                                            </div>
                                        )}
                                    </div>



                                    {/* 4. SOCIAL ACTIONS (Right Side - Floating) */}
                                    <div className={`absolute ${viewMode === 'list' ? 'top-[15%] right-4 gap-10' : 'top-4 right-3 gap-3.5'} md:top-24 md:right-4 flex flex-col md:gap-6 z-20`}>
                                        <button onClick={(e) => handleLike(e, item)} className={`${viewMode === 'list' ? 'p-2.5' : 'p-1.5'} md:p-2.5 rounded-full backdrop-blur-md border transition-all hover:scale-110 active:scale-95 group/icon ${likedItemIds.includes(item.id) ? 'bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/40 transform scale-105' : (darkMode ? 'bg-black/40 border-white/10 text-white hover:bg-black/60' : 'bg-white/60 border-white/40 text-black hover:bg-white/90')}`}>
                                            <span className={`${viewMode === 'list' ? 'text-[9px] w-4 h-4' : 'text-[8px] w-3.5 h-3.5'} md:text-[10px] md:w-4 md:h-4 font-bold absolute -top-1 -right-1 ${likedItemIds.includes(item.id) ? 'bg-white text-red-500' : 'bg-white text-black'} flex items-center justify-center rounded-full shadow-sm border border-black/10 transition-colors`}>
                                                {item.likeCount || 0}
                                            </span>
                                            <Heart className={`${viewMode === 'list' ? 'w-4 h-4' : 'w-3.5 h-3.5'} md:w-4 md:h-4 ${likedItemIds.includes(item.id) ? 'fill-current' : ''}`} />
                                        </button>

                                        <button onClick={(e) => handleCommentClick(e, item)} className={`${viewMode === 'list' ? 'p-2.5' : 'p-1.5'} md:p-2.5 rounded-full backdrop-blur-md border transition-all hover:scale-110 active:scale-95 group/icon ${darkMode ? 'bg-black/40 border-white/10 text-white hover:bg-black/60' : 'bg-white/60 border-white/40 text-black hover:bg-white/90'}`}>
                                            <span className={`${viewMode === 'list' ? 'text-[9px] w-4 h-4' : 'text-[8px] w-3.5 h-3.5'} md:text-[10px] md:w-4 md:h-4 font-bold absolute -top-1 -right-1 bg-white text-black flex items-center justify-center rounded-full shadow-sm border border-black/10`}>
                                                {item.commentCount || 0}
                                            </span>
                                            <svg className={`${viewMode === 'list' ? 'w-4 h-4' : 'w-3.5 h-3.5'} md:w-4 md:h-4`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                                        </button>

                                        <button onClick={(e) => handleShare(e, item)} className={`${viewMode === 'list' ? 'p-2.5' : 'p-1.5'} md:p-2.5 rounded-full backdrop-blur-md border transition-all hover:scale-110 active:scale-95 group/icon ${darkMode ? 'bg-black/40 border-white/10 text-white hover:bg-black/60' : 'bg-white/60 border-white/40 text-black hover:bg-white/90'}`}>
                                            <span className={`${viewMode === 'list' ? 'text-[9px] w-4 h-4' : 'text-[8px] w-3.5 h-3.5'} md:text-[10px] md:w-4 md:h-4 font-bold absolute -top-1 -right-1 bg-white text-black flex items-center justify-center rounded-full shadow-sm border border-black/10`}>
                                                {item.shareCount || 0}
                                            </span>
                                            <svg className={`${viewMode === 'list' ? 'w-4 h-4' : 'w-3.5 h-3.5'} md:w-4 md:h-4`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>
                                        </button>
                                    </div>

                                    {/* 5. COLOR ZONE FOOTER (Info Panel) */}
                                    <div className={`absolute bottom-0 inset-x-0 h-auto min-h-[64px] md:h-[88px] px-3 py-2.5 md:px-6 md:py-4 flex items-center justify-between border-t transition-colors duration-300 z-10 ${darkMode ? 'bg-[#1C1C1E] border-white/5' : 'bg-[#FAF9F6] border-black/5'}`}>
                                        {/* Left: Name & Material */}
                                        <div className="flex flex-col gap-0.5 md:gap-1 max-w-[65%]">
                                            <h3 className={`font-mono font-medium ${viewMode === 'list' ? 'text-[12px]' : 'text-[10.5px]'} md:text-base leading-snug truncate ${darkMode ? 'text-white' : 'text-[#1D1D1F]'}`}>
                                                {item.name}
                                            </h3>
                                            <p className={`text-[10px] md:text-[13px] font-mono font-medium uppercase tracking-widest ${darkMode ? 'text-white/60' : 'text-[#1D1D1F]/70'}`}>
                                                {item.material || 'Atelier Normand'}
                                            </p>
                                        </div>

                                        {/* Right: Stock & Price */}
                                        <div className="flex flex-col items-end justify-center gap-0.5 md:gap-1">
                                            {/* Stock Label */}
                                            <div className={`${viewMode === 'list' ? 'px-2 py-0.5 text-[8px]' : 'px-1.5 py-0.5 text-[7.5px]'} md:px-2 md:py-1 md:text-[10px] rounded-[3px] border font-mono font-bold uppercase tracking-wider ${darkMode ? 'border-white/10 text-emerald-400 bg-emerald-400/5' : 'border-black/5 text-emerald-700 bg-emerald-50/50'}`}>
                                                {item.sold ? 'Rupture' : `Stock ${item.stock || 1}`}
                                            </div>
                                            {/* Price */}
                                            <div className={`font-mono font-medium ${viewMode === 'list' ? 'text-[12px]' : 'text-[10.5px]'} md:text-base tracking-tight ${darkMode ? 'text-white' : 'text-[#1D1D1F]'}`}>
                                                {item.currentPrice || item.startingPrice} €
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div >
    );
};

export default GalleryView;
