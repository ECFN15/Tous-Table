import React, { useState } from 'react';
import { ShoppingBag, Heart, Grid, LayoutList } from 'lucide-react';
import { db, appId } from '../firebase/config';
import { doc, updateDoc, increment } from 'firebase/firestore';
import AuctionTimer from './ui/AuctionTimer';
import CommentsModal from './ui/CommentsModal';

const InstagramGallery = ({ items, boardItems = [], isAdmin, isSecretGateOpen, user, onSelectItem, onShowLogin }) => {
    const [filter, setFilter] = useState('fixed');
    const [activeCollection, setActiveCollection] = useState('furniture'); // 'furniture' | 'cutting_boards'
    const [viewMode, setViewMode] = useState('grid'); // 'grid' (2 cols) | 'list' (1 col)

    const [likedItems, setLikedItems] = useState(() => {
        const saved = localStorage.getItem('tat_liked_items');
        return saved ? JSON.parse(saved) : [];
    });
    const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
    const [selectedItemForComments, setSelectedItemForComments] = useState(null);

    const currentItems = activeCollection === 'furniture' ? items : boardItems;

    const filteredItems = currentItems.filter(i => {
        const isVisible = i.status === 'published' || (isAdmin && isSecretGateOpen);
        if (!isVisible) return false;
        if (filter === 'auction') return i.auctionActive;
        if (filter === 'fixed') return !i.auctionActive;
        return true;
    });

    const handleLike = async (e, item) => {
        e.stopPropagation();
        const isLiked = likedItems.includes(item.id);
        const newLikestatus = !isLiked;

        let newLikedItems;
        if (newLikestatus) newLikedItems = [...likedItems, item.id];
        else newLikedItems = likedItems.filter(id => id !== item.id);

        setLikedItems(newLikedItems);
        localStorage.setItem('tat_liked_items', JSON.stringify(newLikedItems));

        try {
            const itemRef = doc(db, 'artifacts', appId, 'public', 'data', activeCollection, item.id);
            await updateDoc(itemRef, { likeCount: increment(newLikestatus ? 1 : -1) });
        } catch (error) { console.error("Error updating like:", error); }
    };

    const handleCommentClick = (e, item) => {
        e.stopPropagation();
        setSelectedItemForComments(item);
        setIsCommentModalOpen(true);
    };

    const handleShare = async (e, item) => {
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

        // --- STATS LOGIC SÉCURISÉE ---
        // 1. Vérifie si l'utilisateur a déjà partagé cet item (localStorage)
        // 2. Met à jour seulement si nouveau partage
        if (shareSuccessful) {
            const sharedItemsKey = 'tat_shared_items_v1';
            const sharedItems = JSON.parse(localStorage.getItem(sharedItemsKey) || '[]');

            if (!sharedItems.includes(item.id)) {
                try {
                    const itemRef = doc(db, 'artifacts', appId, 'public', 'data', activeCollection, item.id);
                    await updateDoc(itemRef, { shareCount: increment(1) });

                    // Marquer comme partagé localement
                    sharedItems.push(item.id);
                    localStorage.setItem(sharedItemsKey, JSON.stringify(sharedItems));
                } catch (error) {
                    console.error("Error updating share count:", error);
                }
            } else {
                console.log("Stat not incremented: Item already shared by this user.");
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] selection:bg-[#1D1D1F] selection:text-white pb-32">

            <CommentsModal
                isOpen={isCommentModalOpen}
                onClose={() => setIsCommentModalOpen(false)}
                itemId={selectedItemForComments?.id}
                user={user}
                isAdmin={isAdmin}
                activeCollection={activeCollection}
            />

            {/* --- HEADER --- */}
            <div className="pt-24 md:pt-32 pb-8 md:pb-12 px-5 sm:px-8 md:px-[8vw] xl:px-[12vw] flex flex-col lg:flex-row lg:items-end justify-between gap-6 lg:gap-10">
                <div className="space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/60 backdrop-blur-md border border-black/5 w-fit shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-black/60">Marketplace Live</span>
                    </div>
                    <h2 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-medium tracking-tight text-[#1D1D1F] leading-[0.9]">
                        La Galerie<span className="text-[#9C8268]">.</span>
                    </h2>
                </div>

                <div className="flex bg-[#E8E8ED] p-1.5 rounded-full w-full sm:w-fit self-start lg:self-end animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100 overflow-x-auto no-scrollbar">
                    <button onClick={() => { setActiveCollection('furniture'); setFilter('fixed'); }} className={`relative flex-1 sm:flex-none px-6 sm:px-8 py-3 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all duration-300 whitespace-nowrap ${activeCollection === 'furniture' ? 'bg-white text-black shadow-sm scale-100' : 'text-black/40 hover:text-black/70 hover:bg-black/5'}`}>Mobilier</button>
                    <button onClick={() => { setActiveCollection('cutting_boards'); setFilter('fixed'); }} className={`relative flex-1 sm:flex-none px-6 sm:px-8 py-3 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all duration-300 whitespace-nowrap ${activeCollection === 'cutting_boards' ? 'bg-white text-black shadow-sm scale-100' : 'text-black/40 hover:text-black/70 hover:bg-black/5'}`}>Planches</button>
                </div>
            </div>

            {/* --- FILTRES & VIEW TOGGLE --- */}
            <div className="px-5 sm:px-8 md:px-[8vw] xl:px-[12vw] mb-6 md:mb-12 flex flex-row items-center justify-between gap-4 animate-in fade-in duration-1000 delay-200">

                {/* Filtres TYPE */}
                <div className="flex-1 overflow-x-auto no-scrollbar mask-linear-fade">
                    {activeCollection === 'furniture' && (
                        <div className="flex gap-2 md:gap-3">
                            {['fixed', 'auction'].map((f) => (
                                <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 md:px-5 md:py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all duration-300 whitespace-nowrap ${filter === f ? 'bg-[#1D1D1F] text-white border-[#1D1D1F] shadow-lg shadow-black/10' : 'bg-transparent text-black/40 border-black/10 hover:border-black/30 hover:text-black/80'}`}>{f === 'fixed' ? 'Immédiat' : 'Enchères'}</button>
                            ))}
                        </div>
                    )}
                </div>

                {/* VIEW SWITCHER */}
                <div className="flex bg-white p-1 rounded-xl shadow-sm border border-stone-200 shrink-0">
                    <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-stone-100 text-black shadow-inner' : 'text-stone-400 hover:text-stone-600'}`}>
                        <Grid size={18} />
                    </button>
                    <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-stone-100 text-black shadow-inner' : 'text-stone-400 hover:text-stone-600'}`}>
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
                            className={`group relative flex flex-col cursor-pointer animate-in fade-in slide-in-from-bottom-12 duration-1000 fill-mode-backwards`}
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            {/* ASPECT RATIO ADAPTATIF */}
                            <div className={`relative w-full overflow-hidden rounded-[1.2rem] md:rounded-[2rem] bg-white shadow-lg shadow-stone-200/50 transition-all duration-700 ease-premium group-hover:shadow-xl group-hover:shadow-stone-300/60 group-hover:-translate-y-1 ${viewMode === 'list' ? 'aspect-[4/5]' : 'aspect-[3/4] md:aspect-[4/5]'}`} style={{ WebkitMaskImage: '-webkit-radial-gradient(white, black)' }}>
                                <img src={item.images?.[0] || item.imageUrl} alt={item.name} className="w-full h-full object-cover transition-transform duration-1000 ease-premium group-hover:scale-105" loading="lazy" />

                                {/* --- PRIX / TIMER (EN HAUT À GAUCHE) --- */}
                                <div className="absolute top-3 left-3 z-20 pointer-events-auto">
                                    {item.auctionActive ? (
                                        <div className="px-2.5 py-1 rounded-full bg-stone-900/90 backdrop-blur-md border border-white/10 flex items-center gap-1.5 shadow-sm">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#34C759] animate-pulse"></div>
                                            <span className="text-[10px] font-mono tracking-widest text-white"><AuctionTimer endDate={item.auctionEnd} /></span>
                                        </div>
                                    ) : (
                                        <div className="px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-sm">
                                            <span className="text-[11px] font-black tracking-widest text-black">{item.currentPrice || item.startingPrice} €</span>
                                        </div>
                                    )}
                                </div>

                                {/* --- SOCIAL ICONS (RESPONSIVE & COMPACT) --- */}
                                <div className={`absolute right-2 md:right-3 flex flex-col items-center z-20 transition-all duration-300 ${viewMode === 'list' ? 'bottom-24 gap-6 right-4' : 'bottom-16 gap-2.5'}`}>
                                    {/* LIKE */}
                                    <button onClick={(e) => handleLike(e, item)} className="flex flex-col items-center gap-0.5 group/btn p-1">
                                        <Heart
                                            size={viewMode === 'list' ? 28 : 22}
                                            strokeWidth={1.5}
                                            className={`transition-all duration-300 drop-shadow-md ${likedItems.includes(item.id) ? 'fill-red-500 text-red-500 scale-110' : 'text-white hover:scale-110'}`}
                                            style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}
                                        />
                                        <span className={`${viewMode === 'list' ? 'text-xs' : 'text-[9px]'} font-bold text-white drop-shadow-md font-sans leading-none`}>{item.likeCount || 0}</span>
                                    </button>

                                    {/* COMMENTS */}
                                    <button onClick={(e) => handleCommentClick(e, item)} className="flex flex-col items-center gap-0.5 group/btn p-1">
                                        <svg width={viewMode === 'list' ? 28 : 22} height={viewMode === 'list' ? 28 : 22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white transition-all duration-300 drop-shadow-md hover:scale-110" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}>
                                            <path d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z" />
                                        </svg>
                                        <span className={`${viewMode === 'list' ? 'text-xs' : 'text-[9px]'} font-bold text-white drop-shadow-md font-sans leading-none`}>{item.commentCount || 0}</span>
                                    </button>

                                    {/* SHARE */}
                                    <button onClick={(e) => handleShare(e, item)} className="flex flex-col items-center gap-0.5 group/btn p-1">
                                        <svg width={viewMode === 'list' ? 26 : 20} height={viewMode === 'list' ? 26 : 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white transition-all duration-300 drop-shadow-md hover:scale-110 hover:rotate-12" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}>
                                            <path d="M22 2L11 13" />
                                            <path d="M22 2l-7 20-4-9-9-4 20-7z" />
                                        </svg>
                                        <span className={`${viewMode === 'list' ? 'text-xs' : 'text-[9px]'} font-bold text-white drop-shadow-md font-sans leading-none`}>{item.shareCount || 0}</span>
                                    </button>
                                </div>

                                {/* --- TEXT OVERLAY --- */}
                                <div className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10 text-white pointer-events-none ${viewMode === 'list' ? 'p-6 pt-32' : 'p-3 pt-24'}`}>
                                    <div className="flex flex-col gap-0.5 md:gap-1">
                                        <h3 className={`font-serif leading-none drop-shadow-md pr-6 ${viewMode === 'list' ? 'text-2xl md:text-3xl' : 'text-[17px] line-clamp-2'}`}>{item.name}</h3>
                                        <p className="text-[8px] sm:text-[9px] text-white/90 font-bold uppercase tracking-widest truncate opacity-90">{item.material || 'Atelier Normand'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default InstagramGallery;
