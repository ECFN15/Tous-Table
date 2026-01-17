import React, { useState } from 'react';
import { ArrowUpRight, Clock } from 'lucide-react';
import AuctionTimer from './ui/AuctionTimer';

const GalleryView = ({ items, boardItems = [], isAdmin, isSecretGateOpen, user, onSelectItem, onShowLogin }) => {
    const [filter, setFilter] = useState('fixed');
    const [activeCollection, setActiveCollection] = useState('furniture'); // 'furniture' | 'cutting_boards'

    const currentItems = activeCollection === 'furniture' ? items : boardItems;

    const filteredItems = currentItems.filter(i => {
        const isVisible = i.status === 'published' || (isAdmin && isSecretGateOpen);
        if (!isVisible) return false;
        if (filter === 'auction') return i.auctionActive;
        if (filter === 'fixed') return !i.auctionActive;
        return true;
    });

    return (
        <div className="min-h-screen bg-[#FAF9F6] text-[#1a1a1a] selection:bg-[#9C8268] selection:text-white animate-in fade-in duration-1000">
            {/* Header Section */}
            <div className="pt-24 pb-10 px-6 md:pt-32 md:pb-16 md:px-[10vw] flex flex-col md:flex-row justify-between items-end gap-8 md:gap-10 border-b border-[#1a1a1a]/10">
                <div className="space-y-4 md:space-y-6 w-full md:w-auto">
                    <span className="text-[9px] md:text-[10px] uppercase tracking-[0.4em] md:tracking-[0.6em] text-[#9C8268] font-bold block">
                        Collections
                    </span>
                    <h2 className="font-serif text-5xl md:text-8xl font-light italic text-[#1a1a1a] leading-[0.9]">
                        La Galerie
                    </h2>

                    {/* Collection Tabs */}
                    <div className="flex gap-6 md:gap-8 pt-2 md:pt-4 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                        <button
                            onClick={() => { setActiveCollection('furniture'); setFilter('fixed'); }}
                            className={`text-xs md:text-sm uppercase tracking-widest transition-opacity whitespace-nowrap ${activeCollection === 'furniture' ? 'font-black opacity-100' : 'opacity-40 hover:opacity-100'}`}
                        >
                            Mobilier
                        </button>
                        <button
                            onClick={() => { setActiveCollection('cutting_boards'); setFilter('fixed'); }}
                            className={`text-xs md:text-sm uppercase tracking-widest transition-opacity whitespace-nowrap ${activeCollection === 'cutting_boards' ? 'font-black opacity-100' : 'opacity-40 hover:opacity-100'}`}
                        >
                            Planches à Découper
                        </button>
                    </div>
                </div>

                {/* Filters */}
                {/* Filters */}
                {/* Filters (Mobilier Uniquement) */}
                {activeCollection === 'furniture' && (
                    <div className="flex md:flex-wrap gap-6 md:gap-8 pb-2 md:pb-4 w-full md:w-auto overflow-x-auto no-scrollbar md:justify-end mask-linear-fade">
                        {['fixed', 'auction'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`text-[9px] md:text-[10px] uppercase tracking-[0.2em] transition-all duration-500 relative py-2 flex-shrink-0
                                    ${filter === f ? 'text-[#1a1a1a] font-bold' : 'text-[#1a1a1a]/40 hover:text-[#1a1a1a]'}`}
                            >
                                {f === 'fixed' && 'Collection'}
                                {f === 'auction' && 'Ventes aux enchères'}

                                <span className={`absolute bottom-0 left-0 w-full h-[1px] bg-[#9C8268] transform origin-left transition-transform duration-500 ${filter === f ? 'scale-x-100' : 'scale-x-0'}`}></span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Grid */}
            <div className="px-6 md:px-[10vw] py-12 md:py-20 min-h-[60vh]">
                {filteredItems.length === 0 ? (
                    <div className="w-full h-full flex items-center justify-center opacity-30">
                        <p className="font-serif text-xl md:text-2xl italic">Aucune pièce disponible pour le moment.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-16 md:gap-y-24">
                        {filteredItems.map(item => (
                            <div key={item.id} className="group cursor-pointer flex flex-col gap-4 md:gap-6" onClick={() => {
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
                                                <span className="text-[9px] tracking-widest font-mono"><AuctionTimer endDate={item.auctionEnd} /></span>
                                            </div>
                                        )}
                                        {isAdmin && isSecretGateOpen && item.status === 'draft' && (
                                            <div className="bg-amber-500 text-white px-3 py-1 text-[9px] uppercase tracking-widest font-bold">Brouillon</div>
                                        )}
                                    </div>

                                    {/* Quick View Action (Desktop) */}
                                    <div className="hidden md:flex absolute inset-0 z-20 items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                        <div className="bg-white/90 backdrop-blur text-[#1a1a1a] px-6 py-3 uppercase text-[10px] tracking-[0.2em] transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                            Voir la pièce
                                        </div>
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="flex justify-between items-start border-t border-[#1a1a1a]/10 pt-4 md:pt-6 group-hover:border-[#9C8268]/50 transition-colors duration-500">
                                    <div className="space-y-1 md:space-y-2">
                                        <h3 className="font-serif text-2xl md:text-3xl italic text-[#1a1a1a] group-hover:text-[#9C8268] transition-colors duration-300">
                                            {item.name}
                                        </h3>
                                        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-[#1a1a1a]/60">
                                            <span>{item.material || 'Pièce Unique'}</span>
                                            <span className="hidden md:inline-block w-1 h-1 rounded-full bg-[#9C8268]"></span>
                                            <span className="font-bold text-[#1a1a1a]">
                                                {item.auctionActive ? 'Offre actuelle' : 'Prix'} <span className="text-[#9C8268] ml-2 text-sm serif italic normal-case">{item.currentPrice || item.startingPrice} €</span>
                                            </span>
                                        </div>
                                    </div>

                                    <div className="w-8 h-8 md:w-10 md:h-10 border border-[#1a1a1a]/10 rounded-full flex items-center justify-center group-hover:bg-[#1a1a1a] group-hover:text-white transition-all duration-500 flex-shrink-0">
                                        <ArrowUpRight size={14} className="md:w-4 md:h-4 group-hover:rotate-45 transition-transform duration-500" />
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