import React, { useState } from 'react';
import { ArrowUpRight, Clock } from 'lucide-react';
import AuctionTimer from './ui/AuctionTimer';

const GalleryView = ({ items, isAdmin, isSecretGateOpen, user, onSelectItem, onShowLogin }) => {
    const [filter, setFilter] = useState('all');

    const filteredItems = items.filter(i => {
        const isVisible = i.status === 'published' || (isAdmin && isSecretGateOpen);
        if (!isVisible) return false;
        if (filter === 'auction') return i.auctionActive;
        if (filter === 'fixed') return !i.auctionActive;
        return true;
    });

    return (
        <div className="min-h-screen bg-[#FAF9F6] text-[#1a1a1a] selection:bg-[#9C8268] selection:text-white animate-in fade-in duration-1000">
            {/* Header Section */}
            <div className="pt-32 pb-16 px-8 md:px-[10vw] flex flex-col md:flex-row justify-between items-end gap-10 border-b border-[#1a1a1a]/10">
                <div className="space-y-6">
                    <span className="text-[10px] uppercase tracking-[0.6em] text-[#9C8268] font-bold block">
                        Collections
                    </span>
                    <h2 className="font-serif text-6xl md:text-8xl font-light italic text-[#1a1a1a] leading-[0.9]">
                        La Galerie
                    </h2>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-8 pb-4">
                    {['all', 'fixed', 'auction'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`text-[10px] uppercase tracking-[0.2em] transition-all duration-500 relative py-2 
                                ${filter === f ? 'text-[#1a1a1a] font-bold' : 'text-[#1a1a1a]/40 hover:text-[#1a1a1a]'}`}
                        >
                            {f === 'all' && 'Tout Voir'}
                            {f === 'fixed' && 'Collection Permanente'}
                            {f === 'auction' && 'Ventes Privées'}

                            <span className={`absolute bottom-0 left-0 w-full h-[1px] bg-[#9C8268] transform origin-left transition-transform duration-500 ${filter === f ? 'scale-x-100' : 'scale-x-0'}`}></span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            <div className="px-8 md:px-[10vw] py-20 min-h-[60vh]">
                {filteredItems.length === 0 ? (
                    <div className="w-full h-full flex items-center justify-center opacity-30">
                        <p className="font-serif text-2xl italic">Aucune pièce disponible pour le moment.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-24">
                        {filteredItems.map(item => (
                            <div key={item.id} className="group cursor-pointer flex flex-col gap-6" onClick={() => {
                                if (item.auctionActive && user?.isAnonymous) onShowLogin();
                                else { onSelectItem(item.id); }
                            }}>
                                {/* Image Container */}
                                <div className="relative aspect-[3/4] overflow-hidden bg-[#e5e5e5] shadow-sm transition-all duration-700 group-hover:shadow-2xl">
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 z-10 transition-colors duration-500"></div>
                                    <img
                                        src={item.images?.[0] || item.imageUrl}
                                        alt={item.name}
                                        className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-1000 ease-out"
                                        loading="lazy"
                                    />

                                    {/* Badges */}
                                    <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                                        {item.auctionActive && (
                                            <div className="bg-[#1a1a1a] text-white px-3 py-1.5 flex items-center gap-2 shadow-lg backdrop-blur-md">
                                                <Clock size={12} className="text-[#9C8268]" />
                                                <span className="text-[10px] tracking-widest font-mono"><AuctionTimer endDate={item.auctionEnd} /></span>
                                            </div>
                                        )}
                                        {isAdmin && isSecretGateOpen && item.status === 'draft' && (
                                            <div className="bg-amber-500 text-white px-3 py-1 text-[9px] uppercase tracking-widest font-bold">Brouillon</div>
                                        )}
                                    </div>

                                    {/* Quick View Action (Desktop) */}
                                    <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                        <div className="bg-white/90 backdrop-blur text-[#1a1a1a] px-6 py-3 uppercase text-[10px] tracking-[0.2em] transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                            Voir la pièce
                                        </div>
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="flex justify-between items-start border-t border-[#1a1a1a]/10 pt-6 group-hover:border-[#9C8268]/50 transition-colors duration-500">
                                    <div className="space-y-2">
                                        <h3 className="font-serif text-3xl italic text-[#1a1a1a] group-hover:text-[#9C8268] transition-colors duration-300">
                                            {item.name}
                                        </h3>
                                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 text-[10px] uppercase tracking-[0.2em] text-[#1a1a1a]/60">
                                            <span>{item.material || 'Pièce Unique'}</span>
                                            <span className="hidden md:inline-block w-1 h-1 rounded-full bg-[#9C8268]"></span>
                                            <span className="font-bold text-[#1a1a1a]">
                                                {item.auctionActive ? 'Offre actuelle' : 'Prix'} <span className="text-[#9C8268] ml-2 text-sm serif italic normal-case">{item.currentPrice || item.startingPrice} €</span>
                                            </span>
                                        </div>
                                    </div>

                                    <div className="w-10 h-10 border border-[#1a1a1a]/10 rounded-full flex items-center justify-center group-hover:bg-[#1a1a1a] group-hover:text-white transition-all duration-500 flex-shrink-0">
                                        <ArrowUpRight size={16} className="group-hover:rotate-45 transition-transform duration-500" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default GalleryView;