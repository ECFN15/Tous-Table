import React, { useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { db, appId } from '../firebase/config';
import { doc, updateDoc, increment } from 'firebase/firestore';
import AuctionTimer from './ui/AuctionTimer';
import CommentsModal from './ui/CommentsModal';

const GalleryView = ({ items, boardItems = [], isAdmin, isSecretGateOpen, user, onSelectItem, onShowLogin }) => {
    const [filter, setFilter] = useState('fixed');
    const [activeCollection, setActiveCollection] = useState('furniture'); // 'furniture' | 'cutting_boards'

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

            {activeCollection === 'furniture' && (
                <div className="px-5 sm:px-8 md:px-[8vw] xl:px-[12vw] mb-8 md:mb-16 flex gap-3 md:gap-4 animate-in fade-in duration-1000 delay-200 overflow-x-auto no-scrollbar mask-linear-fade">
                    {['fixed', 'auction'].map((f) => (
                        <button key={f} onClick={() => setFilter(f)} className={`px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all duration-300 whitespace-nowrap ${filter === f ? 'bg-[#1D1D1F] text-white border-[#1D1D1F] shadow-lg shadow-black/10' : 'bg-transparent text-black/40 border-black/10 hover:border-black/30 hover:text-black/80'}`}>{f === 'fixed' ? 'Achat Immédiat' : 'Ventes aux enchères'}</button>
                    ))}
                </div>
            )}

            <div className={`px-4 sm:px-8 md:px-[8vw] xl:px-[12vw] grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-8 md:gap-y-12`}>
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
                            <div className="relative aspect-[3/4] md:aspect-[4/5] w-full overflow-hidden rounded-[1.5rem] md:rounded-[2rem] bg-white shadow-xl shadow-stone-200/50 transition-all duration-700 ease-premium group-hover:shadow-2xl group-hover:shadow-stone-300/60 group-hover:-translate-y-1">
                                <img src={item.images?.[0] || item.imageUrl} alt={item.name} className="w-full h-full object-cover transition-transform duration-1000 ease-premium group-hover:scale-105" loading="lazy" />

                                {/* --- SOCIAL ICONS INSTAGRAM STYLE --- */}
                                <div className="absolute right-3 bottom-16 md:bottom-20 flex flex-col items-center gap-4 z-20">
                                    {/* LIKE */}
                                    <button onClick={(e) => handleLike(e, item)} className="flex flex-col items-center gap-1 group/btn">
                                        <svg aria-label="J’aime" className={`transition-all duration-300 drop-shadow-lg ${likedItems.includes(item.id) ? 'scale-110 active:scale-90' : 'hover:scale-110 active:scale-90'}`} color={likedItems.includes(item.id) ? '#ef4444' : '#ffffff'} fill={likedItems.includes(item.id) ? '#ef4444' : 'transparent'} height="26" role="img" viewBox="0 0 24 24" width="26" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}>
                                            <path d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.956-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 0 1 3.679-1.938m0-2a6.04 6.04 0 0 0-4.797 2.127 6.052 6.052 0 0 0-4.787-2.127A6.985 6.985 0 0 0 .5 9.122c0 3.61 2.55 5.827 5.015 7.97.283.246.569.494.853.747l1.027.918a44.998 44.998 0 0 0 3.518 3.018 2 2 0 0 0 2.174 0 45.263 45.263 0 0 0 3.626-3.115l.922-.824c.293-.26.59-.519.885-.774 2.334-2.025 4.98-4.32 4.98-7.94a6.985 6.985 0 0 0-6.708-7.218Z" stroke="currentColor" strokeWidth="2"></path>
                                        </svg>
                                        <span className="text-[11px] font-bold text-white drop-shadow-md font-sans">{item.likeCount || 0}</span>
                                    </button>

                                    {/* COMMENTS */}
                                    <button onClick={(e) => handleCommentClick(e, item)} className="flex flex-col items-center gap-1 group/btn">
                                        <svg aria-label="Commenter" className="transition-all duration-300 drop-shadow-lg hover:scale-110 active:scale-90" color="#ffffff" fill="transparent" height="26" role="img" viewBox="0 0 24 24" width="26" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}>
                                            <path d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2"></path>
                                        </svg>
                                        <span className="text-[11px] font-bold text-white drop-shadow-md font-sans">{item.commentCount || 0}</span>
                                    </button>

                                    {/* SHARE (ROUNDED DIRECT) */}
                                    <button onClick={(e) => handleShare(e, item)} className="flex flex-col items-center gap-1 group/btn">
                                        <svg aria-label="Partager" className="transition-all duration-300 drop-shadow-lg hover:scale-110 active:scale-90 hover:rotate-12" color="#ffffff" fill="transparent" height="26" role="img" viewBox="0 0 24 24" width="26" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}>
                                            <line fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2" x1="22" x2="9.218" y1="2" y2="10.083"></line>
                                            <polygon fill="none" points="11.698 20.334 22 3.001 2 3.001 9.218 10.084 11.698 20.334" stroke="currentColor" strokeLinejoin="round" strokeWidth="2"></polygon>
                                        </svg>
                                        <span className="text-[11px] font-bold text-white drop-shadow-md font-sans">{item.shareCount || 0}</span>
                                    </button>
                                </div>

                                <div className="absolute inset-x-0 bottom-0 p-4 md:p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10 text-white pointer-events-none">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2 mb-1 pointer-events-auto">
                                            {item.auctionActive ? (
                                                <div className="px-2 py-0.5 rounded-full bg-stone-900/80 backdrop-blur border border-white/10 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#34C759] animate-pulse"></div><span className="text-[9px] font-mono tracking-widest"><AuctionTimer endDate={item.auctionEnd} /></span></div>
                                            ) : (
                                                <div className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur border border-white/10"><span className="text-[10px] font-bold tracking-widest">{item.currentPrice || item.startingPrice} €</span></div>
                                            )}
                                        </div>
                                        <h3 className="font-serif text-xl md:text-2xl leading-tight line-clamp-2 drop-shadow-sm">{item.name}</h3>
                                        <p className="text-[10px] text-white/80 font-bold uppercase tracking-widest truncate">{item.material || 'Atelier Normand'}</p>
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

export default GalleryView;