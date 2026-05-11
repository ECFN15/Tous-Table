import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { SlidersHorizontal, X } from 'lucide-react';
import { lockLenis } from '../../utils/smoothScroll';

const ShopSidebar = ({
    categories,
    activeCategory,
    onCategoryChange,
    priceFilters = [],
    activePriceFilter = 'all',
    onPriceFilterChange,
    totalProductCount = 0,
    filteredProductCount = 0,
    darkMode = false,
    isMobileOpen = false,
    onMobileClose
}) => {
    useEffect(() => {
        let unlock = null;
        if (isMobileOpen) {
            unlock = lockLenis();
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            unlock?.();
            document.body.style.overflow = '';
        };
    }, [isMobileOpen]);

    const handleMobileCategory = (categoryId) => {
        onCategoryChange(categoryId);
        onMobileClose();
    };

    return (
        <>
            <aside className={`
                hidden lg:block
                sticky top-[72px]
                h-[calc(100dvh-72px)]
                w-[280px] xl:w-[320px]
                float-left z-30 overflow-y-auto border-r scrollbar-thin
                ${darkMode ? 'bg-[#0a0a0a] border-white/5' : 'bg-[#f8f1e7]/95 border-[#c79b5d]/24'}
            `}>
                <div className="space-y-7 p-6 xl:p-8">
                    <div className={`rounded-[24px] border p-4 ${darkMode ? 'border-white/10 bg-white/[0.035]' : 'border-[#c79b5d]/24 bg-white/55'}`}>
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <span className={`text-[9px] font-black uppercase tracking-[0.3em] ${darkMode ? 'text-stone-500' : 'text-stone-500'}`}>
                                    Comptoir
                                </span>
                                <p className={`mt-2 font-serif text-3xl leading-none ${darkMode ? 'text-white' : 'text-stone-900'}`}>
                                    {filteredProductCount}
                                </p>
                            </div>
                            <div className={`flex h-11 w-11 items-center justify-center rounded-full ${darkMode ? 'bg-amber-500/15 text-amber-300' : 'bg-amber-700/10 text-amber-800'}`}>
                                <SlidersHorizontal size={17} strokeWidth={1.8} />
                            </div>
                        </div>
                        <p className={`mt-3 text-[11px] leading-relaxed ${darkMode ? 'text-stone-500' : 'text-stone-500'}`}>
                            {filteredProductCount === totalProductCount
                                ? 'Toute la selection atelier visible.'
                                : `${filteredProductCount} sur ${totalProductCount} produits visibles.`}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => onCategoryChange(null)}
                        className="group w-full text-left transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
                    >
                        <div className={`
                            flex items-center justify-between rounded-2xl px-4 py-3
                            transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
                            ${activeCategory === null
                                ? (darkMode ? 'bg-amber-500/12 ring-1 ring-amber-500/24' : 'bg-white/75 ring-1 ring-[#c79b5d]/35 shadow-[0_14px_34px_rgba(102,74,36,0.08)]')
                                : (darkMode ? 'hover:bg-white/5' : 'hover:bg-white/55')
                            }
                        `}>
                            <h3 className={`
                                text-sm font-bold tracking-tight transition-colors duration-500
                                ${activeCategory === null
                                    ? (darkMode ? 'text-amber-400' : 'text-amber-800')
                                    : (darkMode ? 'text-white group-hover:text-amber-500' : 'text-stone-900 group-hover:text-amber-700')
                                }
                            `}>
                                Toute la selection
                            </h3>
                            {activeCategory === null && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className={`h-1.5 w-1.5 rounded-full ${darkMode ? 'bg-amber-500' : 'bg-amber-700'}`}
                                />
                            )}
                        </div>
                    </button>

                    <div className={`h-px w-full ${darkMode ? 'bg-white/5' : 'bg-[#c79b5d]/24'}`} />

                    <nav className="space-y-2">
                        <p className={`px-4 text-[9px] font-black uppercase tracking-[0.28em] ${darkMode ? 'text-stone-600' : 'text-stone-500'}`}>
                            Familles
                        </p>
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                type="button"
                                disabled={category.count === 0}
                                onClick={() => onCategoryChange(category.id)}
                                className="group w-full text-left transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] disabled:cursor-not-allowed disabled:opacity-35"
                            >
                                <div className={`
                                    flex items-center justify-between rounded-2xl px-4 py-3
                                    transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
                                    ${activeCategory === category.id
                                        ? (darkMode ? 'bg-amber-500/12 ring-1 ring-amber-500/24' : 'bg-white/75 ring-1 ring-[#c79b5d]/35 shadow-[0_14px_34px_rgba(102,74,36,0.08)]')
                                        : (darkMode ? 'hover:bg-white/5' : 'hover:bg-white/55')
                                    }
                                `}>
                                    <div className="min-w-0 flex-1 space-y-1">
                                        <h3 className={`
                                            truncate text-sm font-bold tracking-tight transition-colors duration-500
                                            ${activeCategory === category.id
                                                ? (darkMode ? 'text-amber-400' : 'text-amber-800')
                                                : (darkMode ? 'text-white group-hover:text-amber-500' : 'text-stone-900 group-hover:text-amber-700')
                                            }
                                        `}>
                                            {category.title}
                                        </h3>
                                        <p className={`
                                            truncate text-[10px] font-medium uppercase tracking-wider
                                            ${activeCategory === category.id
                                                ? (darkMode ? 'text-amber-500/60' : 'text-amber-700/70')
                                                : (darkMode ? 'text-stone-500' : 'text-stone-500')
                                            }
                                        `}>
                                            {category.subtitle}
                                        </p>
                                    </div>
                                    <span className={`ml-3 flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-[10px] font-black ${activeCategory === category.id
                                        ? (darkMode ? 'bg-amber-400 text-stone-950' : 'bg-stone-950 text-white')
                                        : (darkMode ? 'bg-white/5 text-stone-500' : 'bg-stone-900/5 text-stone-500')
                                    }`}>
                                        {category.count}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </nav>

                    <div className={`h-px w-full ${darkMode ? 'bg-white/5' : 'bg-[#c79b5d]/24'}`} />

                    <div className="space-y-3">
                        <p className={`px-4 text-[9px] font-black uppercase tracking-[0.28em] ${darkMode ? 'text-stone-600' : 'text-stone-500'}`}>
                            Prix indicatif
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                            {priceFilters.map((filter) => {
                                const isActive = activePriceFilter === filter.id;
                                return (
                                    <button
                                        key={filter.id}
                                        type="button"
                                        onClick={() => onPriceFilterChange?.(filter.id)}
                                        className={`rounded-full border px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${isActive
                                            ? (darkMode ? 'border-amber-400 bg-amber-400 text-stone-950' : 'border-stone-950 bg-stone-950 text-white')
                                            : (darkMode ? 'border-white/10 bg-white/[0.03] text-stone-400 hover:border-amber-400/30 hover:text-amber-300' : 'border-[#c79b5d]/22 bg-white/45 text-stone-600 hover:border-[#c79b5d]/50 hover:bg-white/80')
                                        }`}
                                    >
                                        {filter.shortLabel}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </aside>

            {isMobileOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onMobileClose}
                        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
                    />

                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className={`
                            fixed bottom-0 left-0 right-0 z-50 lg:hidden
                            max-h-[82vh] overflow-y-auto rounded-t-[28px]
                            ${darkMode ? 'bg-[#0a0a0a] border-t border-white/10' : 'bg-white border-t border-stone-200'}
                        `}
                        data-lenis-prevent
                    >
                        <div className="sticky top-0 flex items-center justify-between px-6 pb-2 pt-4">
                            <div className={`mx-auto h-1 w-12 rounded-full ${darkMode ? 'bg-white/20' : 'bg-stone-300'}`} />
                            <button
                                type="button"
                                onClick={onMobileClose}
                                className={`absolute right-6 top-4 rounded-full p-2 transition-colors ${darkMode ? 'hover:bg-white/10' : 'hover:bg-stone-100'}`}
                            >
                                <X size={20} className={darkMode ? 'text-stone-400' : 'text-stone-600'} />
                            </button>
                        </div>

                        <div className="space-y-6 px-6 pb-8">
                            <div className="space-y-2">
                                <h2 className={`font-serif text-2xl ${darkMode ? 'text-white' : 'text-stone-900'}`}>
                                    Filtres Comptoir
                                </h2>
                                <p className={`text-sm ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                                    {filteredProductCount} produit{filteredProductCount > 1 ? 's' : ''} visible{filteredProductCount > 1 ? 's' : ''}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => handleMobileCategory(null)}
                                className={`
                                    w-full rounded-2xl px-5 py-4 text-left
                                    transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
                                    ${activeCategory === null
                                        ? (darkMode ? 'bg-amber-500/15 border-2 border-amber-500/40' : 'bg-amber-500/10 border-2 border-amber-600/40')
                                        : (darkMode ? 'bg-white/5 border-2 border-transparent hover:border-white/10' : 'bg-stone-50 border-2 border-transparent hover:border-stone-200')
                                    }
                                `}
                            >
                                <h3 className={`text-base font-bold ${activeCategory === null ? (darkMode ? 'text-amber-500' : 'text-amber-700') : (darkMode ? 'text-white' : 'text-stone-900')}`}>
                                    Toute la selection
                                </h3>
                            </button>

                            <div className={`h-px w-full ${darkMode ? 'bg-white/10' : 'bg-stone-200'}`} />

                            <div className="space-y-3">
                                {categories.map((category) => (
                                    <button
                                        key={category.id}
                                        type="button"
                                        disabled={category.count === 0}
                                        onClick={() => handleMobileCategory(category.id)}
                                        className={`
                                            w-full rounded-2xl px-5 py-4 text-left
                                            transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
                                            disabled:cursor-not-allowed disabled:opacity-35
                                            ${activeCategory === category.id
                                                ? (darkMode ? 'bg-amber-500/15 border-2 border-amber-500/40' : 'bg-amber-500/10 border-2 border-amber-600/40')
                                                : (darkMode ? 'bg-white/5 border-2 border-transparent hover:border-white/10' : 'bg-stone-50 border-2 border-transparent hover:border-stone-200')
                                            }
                                        `}
                                    >
                                        <h3 className={`mb-1 text-base font-bold ${activeCategory === category.id ? (darkMode ? 'text-amber-500' : 'text-amber-700') : (darkMode ? 'text-white' : 'text-stone-900')}`}>
                                            {category.title}
                                        </h3>
                                        <p className={`text-xs uppercase tracking-wider ${activeCategory === category.id ? (darkMode ? 'text-amber-500/60' : 'text-amber-600/70') : (darkMode ? 'text-stone-500' : 'text-stone-400')}`}>
                                            {category.subtitle} - {category.count} produit{category.count > 1 ? 's' : ''}
                                        </p>
                                    </button>
                                ))}
                            </div>

                            <div className={`h-px w-full ${darkMode ? 'bg-white/10' : 'bg-stone-200'}`} />

                            <div className="space-y-3">
                                <p className={`text-[10px] font-black uppercase tracking-[0.24em] ${darkMode ? 'text-stone-500' : 'text-stone-500'}`}>
                                    Prix indicatif
                                </p>
                                <div className="grid grid-cols-2 gap-2">
                                    {priceFilters.map((filter) => {
                                        const isActive = activePriceFilter === filter.id;
                                        return (
                                            <button
                                                key={filter.id}
                                                type="button"
                                                onClick={() => onPriceFilterChange?.(filter.id)}
                                                className={`rounded-2xl border px-4 py-3 text-left text-xs font-black uppercase tracking-[0.14em] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${isActive
                                                    ? (darkMode ? 'border-amber-400 bg-amber-400 text-stone-950' : 'border-stone-950 bg-stone-950 text-white')
                                                    : (darkMode ? 'border-white/10 bg-white/5 text-stone-300' : 'border-stone-200 bg-stone-50 text-stone-700')
                                                }`}
                                            >
                                                {filter.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </>
    );
};

export default ShopSidebar;
