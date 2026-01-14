import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import AuctionTimer from './ui/AuctionTimer';

const GalleryView = ({ items, isAdmin, isSecretGateOpen, user, onSelectItem, onShowLogin }) => {
    return (
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-32 animate-in fade-in duration-700">
            <div className="space-y-4 border-b border-stone-200/60 pb-10 mb-16">
                <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-none text-stone-900">Marketplace.</h2>
                <p className="text-stone-400 font-serif italic text-lg">Acquérez une pièce d'histoire.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
                {items.filter(i => i.status === 'published' || (isAdmin && isSecretGateOpen)).map(item => (
                <div key={item.id} className="group cursor-pointer space-y-6" onClick={() => {
                    if (item.auctionActive && user?.isAnonymous) onShowLogin(); 
                    else { onSelectItem(item.id); }
                }}>
                    <div className="aspect-[4/5] overflow-hidden rounded-[2.5rem] bg-white shadow-xl relative border-[12px] border-white group-hover:shadow-2xl transition-all duration-700">
                        <img src={item.images?.[0] || item.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt="" loading="lazy" />
                        <div className="absolute top-6 right-6 bg-white/95 px-4 py-2 rounded-xl shadow-lg border border-stone-100 flex flex-col items-center">
                            <span className="text-[7px] font-black text-stone-400 uppercase leading-none mb-0.5">{item.auctionActive ? 'Offre' : 'Fixe'}</span>
                            <p className="text-sm font-black">{item.currentPrice || item.startingPrice} €</p>
                        </div>
                        {item.auctionActive && <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur px-3 py-1.5 rounded-xl shadow-md border border-stone-100"><AuctionTimer endDate={item.auctionEnd} /></div>}
                        {isAdmin && isSecretGateOpen && item.status === 'draft' && (
                            <div className="absolute top-6 left-6 bg-amber-500 text-white px-2 py-0.5 rounded-md text-[7px] font-black uppercase shadow-md text-white">Brouillon</div>
                        )}
                    </div>
                    <div className="px-2 flex justify-between items-center text-stone-900">
                        <div className="space-y-1 text-stone-900">
                            <h3 className="text-2xl font-black tracking-tighter leading-none group-hover:text-amber-700 transition-colors text-stone-900">{item.name}</h3>
                            <p className="text-[9px] font-bold text-stone-300 uppercase tracking-widest">{item.material || 'Artisanal'}</p>
                        </div>
                        <div className="w-12 h-12 rounded-full border border-stone-200 flex items-center justify-center text-stone-200 group-hover:text-stone-900 group-hover:border-stone-900 transition-all group-hover:rotate-45">
                            <ArrowUpRight size={20} />
                        </div>
                    </div>
                </div>
                ))}
            </div>
        </div>
    );
};

export default GalleryView;