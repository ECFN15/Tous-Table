import React, { useState } from 'react';
import { ShoppingBag, Heart } from 'lucide-react';
import { db, appId } from '../firebase/config';
import { doc, updateDoc, increment } from 'firebase/firestore';
import AuctionTimer from './ui/AuctionTimer';
import CommentsModal from './ui/CommentsModal';

const InstagramGallery = ({ items, boardItems = [], isAdmin, isSecretGateOpen, user, onSelectItem, onShowLogin }) => {
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
        try {
            const itemRef = doc(db, 'artifacts', appId, 'public', 'data', activeCollection, item.id);
            await updateDoc(itemRef, { shareCount: increment(1) });
        } catch (error) { console.error("Error updating share count:", error); }

        if (navigator.share) {
            try { await navigator.share({ title: `Tous à Table - ${item.name}`, text: `Découvre cette pièce unique : ${item.name}`, url: window.location.href }); } catch (error) { console.log('Error sharing', error); }
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert("Lien copié !");
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

                                {/* --- SOCIAL ICONS INSTAGRAM STYLE (LUCIDE + CUSTOM DIRECT) --- */}
                                <div className="absolute right-3 bottom-16 md:bottom-20 flex flex-col items-center gap-4 z-20">
                                    {/* LIKE */}
                                    <button onClick={(e) => handleLike(e, item)} className="flex flex-col items-center gap-1 group/btn">
                                        <Heart
                                            size={26}
                                            strokeWidth={1.5}
                                            className={`transition-all duration-300 drop-shadow-md ${likedItems.includes(item.id) ? 'fill-red-500 text-red-500 scale-110' : 'text-white hover:scale-110'}`}
                                            style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
                                        />
                                        <span className="text-[11px] font-bold text-white drop-shadow-md font-sans">{item.likeCount || 0}</span>
                                    </button>

                                    {/* COMMENTS */}
                                    <button onClick={(e) => handleCommentClick(e, item)} className="flex flex-col items-center gap-1 group/btn">
                                        <svg
                                            width="26"
                                            height="26"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="text-white transition-all duration-300 drop-shadow-md hover:scale-110"
                                            style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
                                        >
                                            <path d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z" />
                                        </svg>
                                        <span className="text-[11px] font-bold text-white drop-shadow-md font-sans">{item.commentCount || 0}</span>
                                    </button>

                                    {/* SHARE (CUSTOM DIRECT ICON for Rounded Look) */}
                                    <button onClick={(e) => handleShare(e, item)} className="flex flex-col items-center gap-1 group/btn">
                                        <svg
                                            width="24"
                                            height="24"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="text-white transition-all duration-300 drop-shadow-md hover:scale-110 hover:rotate-12"
                                            style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
                                        >
                                            <path d="M22 2L11 13" />
                                            <path d="M22 2l-7 20-4-9-9-4 20-7z" />
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
                                                <div className="px-4 py-1.5 rounded-full bg-white/20 backdrop-blur border border-white/10 flex items-center justify-center"><span className="text-[10px] font-bold tracking-widest pt-[1px]">{item.currentPrice || item.startingPrice} €</span></div>
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

export default InstagramGallery;
