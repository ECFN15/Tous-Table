import React, { useState } from 'react';
import { Menu, ShoppingBag, ShieldCheck } from 'lucide-react';

/**
 * COMPONENT : ARCHITECTURAL HEADER
 * Shared header for Gallery and Product Detail views in Architectural Theme.
 */
const ArchitecturalHeader = ({
    headerProps,
    user,
    onShowLogin,
    onOpenMenu,
    onOpenCart,
    wishlistCount = 0
}) => {
    // Optional props destructuring with defaults
    const { activeCollection, setActiveCollection } = headerProps || {};

    return (
        <header className="sticky top-0 z-[100] bg-[#FAFAF9]/95 dark:bg-[#0A0A0A]/95 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 transition-colors duration-500">
            <div className="max-w-[1920px] mx-auto px-6 md:px-12 h-20 flex items-center justify-between">

                {/* 1. LEFT: LOGO & TABS */}
                <div className="flex items-center gap-8">
                    {/* MINI LOGO TEXT */}
                    <div className="flex flex-col leading-none cursor-pointer group" onClick={() => window.location.href = '/'}>
                        <span className="font-black uppercase text-sm tracking-widest group-hover:text-stone-500 transition-colors text-stone-900 dark:text-stone-200">Tous à Table</span>
                        <span className="font-serif italic text-[10px] text-stone-400">Atelier Normand</span>
                    </div>

                    {/* SEPARATOR */}
                    <div className="h-8 w-px bg-stone-200 dark:bg-stone-800 hidden md:block"></div>

                    {/* COLLECTION TABS (Only show if activeCollection is managed, e.g. on Gallery) */}
                    {setActiveCollection && (
                        <nav className="hidden md:flex items-center gap-1">
                            <button
                                onClick={() => setActiveCollection('furniture')}
                                className={`px-4 py-1.5 rounded text-[11px] font-bold uppercase tracking-widest transition-all ${activeCollection === 'furniture' ? 'text-black dark:text-white bg-stone-100 dark:bg-stone-800' : 'text-stone-400 hover:text-stone-600'}`}
                            >
                                Mobilier
                            </button>
                            <button
                                onClick={() => setActiveCollection('cutting_boards')}
                                className={`px-4 py-1.5 rounded text-[11px] font-bold uppercase tracking-widest transition-all ${activeCollection === 'cutting_boards' ? 'text-black dark:text-white bg-stone-100 dark:bg-stone-800' : 'text-stone-400 hover:text-stone-600'}`}
                            >
                                Objets d'Art
                            </button>
                        </nav>
                    )}
                </div>

                {/* 2. RIGHT: ACTIONS */}
                <div className="flex items-center gap-6">

                    {/* GLOBAL ACTIONS */}
                    <div className="flex items-center gap-4">

                        {/* LOGIN BUTTON */}
                        {(!user || user.isAnonymous) ? (
                            <button onClick={onShowLogin} className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded border border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all group">
                                <ShieldCheck size={14} className="text-stone-400 group-hover:text-black dark:group-hover:text-white" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500 group-hover:text-stone-900 dark:group-hover:text-stone-200">Connexion</span>
                            </button>
                        ) : (
                            <div className="hidden md:flex items-center gap-2 px-4 py-1.5">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Connecté</span>
                            </div>
                        )}

                        <button onClick={onOpenCart} className="relative group p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded transition-colors" title="Panier">
                            <ShoppingBag size={20} strokeWidth={1.5} className="group-hover:scale-110 transition-transform text-stone-900 dark:text-stone-200" />
                            {wishlistCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-black"></span>}
                        </button>

                        <button onClick={onOpenMenu} className="flex items-center gap-2 group cursor-pointer hover:bg-stone-100 dark:hover:bg-stone-800 px-3 py-1.5 rounded transition-colors" title="Menu">
                            <span className="hidden md:block text-[10px] font-bold uppercase tracking-widest group-hover:underline underline-offset-4 text-stone-900 dark:text-stone-200">Menu</span>
                            <Menu size={20} strokeWidth={1.5} className="text-stone-900 dark:text-stone-200" />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default ArchitecturalHeader;
