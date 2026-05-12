import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { SlidersHorizontal, X } from 'lucide-react';
import { lockPageScroll } from '../../utils/smoothScroll';

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
    const closeButtonRef = useRef(null);
    const sheetRef = useRef(null);

    useEffect(() => {
        let unlock = null;
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                onMobileClose?.();
                return;
            }

            if (event.key !== 'Tab' || !sheetRef.current) return;
            const focusable = sheetRef.current.querySelectorAll(
                'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
            );
            if (focusable.length === 0) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];

            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        };

        if (isMobileOpen) {
            unlock = lockPageScroll();
            requestAnimationFrame(() => closeButtonRef.current?.focus());
            window.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            unlock?.();
        };
    }, [isMobileOpen, onMobileClose]);

    const handleMobileCategory = (categoryId) => {
        onCategoryChange(categoryId);
    };

    return (
        <>
            <aside className={`
                hidden lg:block
                sticky top-[64px]
                w-[280px] xl:w-[320px]
                self-start rounded-[24px] border
                shadow-[0_16px_42px_rgba(74,54,32,0.075)]
                ${darkMode ? 'bg-[#0a0a0a]/96 border-white/8' : 'bg-[#f8f1e7]/96 border-[#c79b5d]/28'}
            `}>
                <div className="space-y-3.5 p-4 [@media(max-height:720px)]:space-y-3 [@media(max-height:720px)]:p-3.5 xl:p-4">
                    <div className={`rounded-[18px] border p-3 ${darkMode ? 'border-white/10 bg-white/[0.035]' : 'border-[#c79b5d]/24 bg-white/55'}`}>
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <span className={`text-[8.5px] font-black uppercase tracking-[0.28em] ${darkMode ? 'text-stone-500' : 'text-stone-500'}`}>
                                    Comptoir
                                </span>
                                <p className={`mt-1 font-serif text-[1.55rem] leading-none ${darkMode ? 'text-white' : 'text-stone-900'}`}>
                                    {filteredProductCount}
                                </p>
                            </div>
                            <div className={`flex h-8 w-8 items-center justify-center rounded-full ${darkMode ? 'bg-amber-500/15 text-amber-300' : 'bg-amber-700/10 text-amber-800'}`}>
                                <SlidersHorizontal size={17} strokeWidth={1.8} />
                            </div>
                        </div>
                        <p className={`mt-1.5 text-[9.5px] leading-snug [@media(max-height:720px)]:hidden ${darkMode ? 'text-stone-500' : 'text-stone-500'}`}>
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
                            flex items-center justify-between rounded-[14px] px-3 py-2.5 [@media(max-height:720px)]:py-2
                            transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
                            ${activeCategory === null
                                ? (darkMode ? 'bg-amber-500/12 ring-1 ring-amber-500/24' : 'bg-white/75 ring-1 ring-[#c79b5d]/35 shadow-[0_14px_34px_rgba(102,74,36,0.08)]')
                                : (darkMode ? 'hover:bg-white/5' : 'hover:bg-white/55')
                            }
                        `}>
                            <h3 className={`
                                text-[13px] font-bold tracking-tight transition-colors duration-500
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

                    <nav className="space-y-1.5 [@media(max-height:720px)]:space-y-1">
                        <p className={`px-3 text-[8.5px] font-black uppercase tracking-[0.26em] ${darkMode ? 'text-stone-600' : 'text-stone-500'}`}>
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
                                    flex items-center justify-between rounded-[14px] px-3 py-2.5 [@media(max-height:720px)]:py-2
                                    transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
                                    ${activeCategory === category.id
                                        ? (darkMode ? 'bg-amber-500/12 ring-1 ring-amber-500/24' : 'bg-white/75 ring-1 ring-[#c79b5d]/35 shadow-[0_14px_34px_rgba(102,74,36,0.08)]')
                                        : (darkMode ? 'hover:bg-white/5' : 'hover:bg-white/55')
                                    }
                                `}>
                                    <div className="min-w-0 flex-1 space-y-0.5">
                                        <h3 className={`
                                            truncate text-[13px] font-bold tracking-tight transition-colors duration-500
                                            ${activeCategory === category.id
                                                ? (darkMode ? 'text-amber-400' : 'text-amber-800')
                                                : (darkMode ? 'text-white group-hover:text-amber-500' : 'text-stone-900 group-hover:text-amber-700')
                                            }
                                        `}>
                                            {category.title}
                                        </h3>
                                        <p className={`
                                            [@media(max-height:720px)]:hidden
                                            truncate text-[8.5px] font-medium uppercase tracking-wider
                                            ${activeCategory === category.id
                                                ? (darkMode ? 'text-amber-500/60' : 'text-amber-700/70')
                                                : (darkMode ? 'text-stone-500' : 'text-stone-500')
                                            }
                                        `}>
                                            {category.subtitle}
                                        </p>
                                    </div>
                                    <span className={`ml-2.5 flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[8.5px] font-black ${activeCategory === category.id
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

                    <div className="space-y-2">
                        <p className={`px-3 text-[8.5px] font-black uppercase tracking-[0.26em] ${darkMode ? 'text-stone-600' : 'text-stone-500'}`}>
                            Prix indicatif
                        </p>
                        <div className="grid grid-cols-2 gap-1.5">
                            {priceFilters.map((filter) => {
                                const isActive = activePriceFilter === filter.id;
                                return (
                                    <button
                                        key={filter.id}
                                        type="button"
                                        onClick={() => onPriceFilterChange?.(filter.id)}
                                        className={`rounded-full border px-2.5 py-1.5 text-[8.5px] font-black uppercase tracking-[0.1em] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${isActive
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
                        className="fixed inset-0 z-[1200] bg-black/62 lg:hidden"
                    />

                    <motion.div
                        ref={sheetRef}
                        id="shop-filter-drawer"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="shop-filter-title"
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className={`
                            ios-modal-scroll fixed bottom-0 left-0 right-0 z-[1210] lg:hidden
                            max-h-[min(82dvh,720px)] overflow-y-auto rounded-t-[28px]
                            ${darkMode ? 'bg-[#0a0a0a] border-t border-white/10' : 'bg-white border-t border-stone-200'}
                        `}
                        data-scroll-region
                    >
                        <div className={`sticky top-0 z-10 flex items-center justify-between px-6 pb-2 pt-4 ${darkMode ? 'bg-[#0a0a0a]' : 'bg-white'}`}>
                            <div className={`mx-auto h-1 w-12 rounded-full ${darkMode ? 'bg-white/20' : 'bg-stone-300'}`} />
                            <button
                                ref={closeButtonRef}
                                type="button"
                                onClick={onMobileClose}
                                aria-label="Fermer les filtres du Comptoir"
                                className={`absolute right-6 top-4 rounded-full p-2 transition-colors ${darkMode ? 'hover:bg-white/10' : 'hover:bg-stone-100'}`}
                            >
                                <X size={20} className={darkMode ? 'text-stone-400' : 'text-stone-600'} />
                            </button>
                        </div>

                        <div className="space-y-6 px-6 pb-8">
                            <div className="space-y-2">
                                <h2 id="shop-filter-title" className={`font-serif text-2xl ${darkMode ? 'text-white' : 'text-stone-900'}`}>
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

                        <div className={`sticky bottom-0 px-6 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3 ${darkMode ? 'bg-[#0a0a0a]' : 'bg-white'}`}>
                            <button
                                type="button"
                                onClick={onMobileClose}
                                className={`flex min-h-12 w-full items-center justify-center rounded-full px-5 text-[11px] font-black uppercase tracking-[0.16em] transition-all duration-300 active:scale-[0.98] ${darkMode ? 'bg-amber-400 text-stone-950' : 'bg-stone-950 text-white'}`}
                            >
                                Voir {filteredProductCount} produit{filteredProductCount > 1 ? 's' : ''}
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </>
    );
};

export default ShopSidebar;
