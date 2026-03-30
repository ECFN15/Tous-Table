import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

const ShopSidebar = ({ categories, activeCategory, onCategoryChange, darkMode = false, isMobileOpen = false, onMobileClose }) => {
    return (
        <>
            {/* DESKTOP SIDEBAR - Fixed Left */}
            <aside className={`
                hidden lg:block
                fixed left-0 top-[88px] bottom-0
                w-[280px] xl:w-[320px]
                border-r
                ${darkMode ? 'bg-[#0a0a0a] border-white/5' : 'bg-[#FAFAF9] border-stone-200/60'}
                overflow-y-auto scrollbar-thin
                z-30
            `}>
                <div className="p-8 xl:p-10 space-y-8">
                    {/* Header */}
                    <div className="space-y-3">
                        <span className={`text-[9px] uppercase tracking-[0.3em] font-black ${darkMode ? 'text-stone-600' : 'text-stone-400'}`}>
                            Collections
                        </span>
                        <div className={`w-12 h-px ${darkMode ? 'bg-white/10' : 'bg-stone-300'}`}></div>
                    </div>

                    {/* Bouton "Tout Afficher" */}
                    <button
                        onClick={() => onCategoryChange(null)}
                        className={`
                            w-full text-left group
                            transition-all duration-300
                        `}
                    >
                        <div className={`
                            flex items-center justify-between
                            py-3 px-4 rounded-xl
                            transition-all duration-300
                            ${activeCategory === null
                                ? `${darkMode ? 'bg-amber-500/10 border-l-2 border-amber-500' : 'bg-amber-500/5 border-l-2 border-amber-600'}`
                                : `${darkMode ? 'hover:bg-white/5' : 'hover:bg-stone-100/50'}`
                            }
                        `}>
                            <div className="space-y-1">
                                <h3 className={`
                                    text-sm font-bold tracking-tight
                                    transition-colors duration-300
                                    ${activeCategory === null
                                        ? `${darkMode ? 'text-amber-500' : 'text-amber-600'}`
                                        : `${darkMode ? 'text-white group-hover:text-amber-500' : 'text-stone-900 group-hover:text-amber-600'}`
                                    }
                                `}>
                                    Tout Afficher
                                </h3>
                            </div>
                            {activeCategory === null && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className={`w-1.5 h-1.5 rounded-full ${darkMode ? 'bg-amber-500' : 'bg-amber-600'}`}
                                />
                            )}
                        </div>
                    </button>

                    {/* Séparateur */}
                    <div className={`w-full h-px ${darkMode ? 'bg-white/5' : 'bg-stone-200'}`}></div>

                    {/* Filtres Label */}
                    <div className="space-y-3">
                        <span className={`text-[9px] uppercase tracking-[0.3em] font-black ${darkMode ? 'text-stone-600' : 'text-stone-400'}`}>
                            Filtres
                        </span>
                    </div>

                    {/* Liste des Catégories */}
                    <nav className="space-y-2">
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => onCategoryChange(category.id)}
                                className={`
                                    w-full text-left group
                                    transition-all duration-300
                                `}
                            >
                                <div className={`
                                    flex items-center justify-between
                                    py-3 px-4 rounded-xl
                                    transition-all duration-300
                                    ${activeCategory === category.id
                                        ? `${darkMode ? 'bg-amber-500/10 border-l-2 border-amber-500' : 'bg-amber-500/5 border-l-2 border-amber-600'}`
                                        : `${darkMode ? 'hover:bg-white/5' : 'hover:bg-stone-100/50'}`
                                    }
                                `}>
                                    <div className="space-y-1 flex-1 min-w-0">
                                        <h3 className={`
                                            text-sm font-bold tracking-tight truncate
                                            transition-colors duration-300
                                            ${activeCategory === category.id
                                                ? `${darkMode ? 'text-amber-500' : 'text-amber-600'}`
                                                : `${darkMode ? 'text-white group-hover:text-amber-500' : 'text-stone-900 group-hover:text-amber-600'}`
                                            }
                                        `}>
                                            {category.title}
                                        </h3>
                                        <p className={`
                                            text-[10px] uppercase tracking-wider font-medium truncate
                                            ${activeCategory === category.id
                                                ? `${darkMode ? 'text-amber-500/60' : 'text-amber-600/60'}`
                                                : `${darkMode ? 'text-stone-500' : 'text-stone-400'}`
                                            }
                                        `}>
                                            {category.subtitle}
                                        </p>
                                    </div>
                                    {activeCategory === category.id && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ml-2 ${darkMode ? 'bg-amber-500' : 'bg-amber-600'}`}
                                        />
                                    )}
                                </div>
                            </button>
                        ))}
                    </nav>
                </div>
            </aside>

            {/* MOBILE DRAWER - Bottom Sheet */}
            {isMobileOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onMobileClose}
                        className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className={`
                            lg:hidden fixed bottom-0 left-0 right-0
                            max-h-[80vh] rounded-t-[28px]
                            ${darkMode ? 'bg-[#0a0a0a] border-t border-white/10' : 'bg-white border-t border-stone-200'}
                            overflow-y-auto
                            z-50
                        `}
                    >
                        {/* Handle */}
                        <div className="sticky top-0 pt-4 pb-2 px-6 flex items-center justify-between">
                            <div className={`w-12 h-1 rounded-full mx-auto ${darkMode ? 'bg-white/20' : 'bg-stone-300'}`}></div>
                            <button
                                onClick={onMobileClose}
                                className={`absolute right-6 top-4 p-2 rounded-full transition-colors ${darkMode ? 'hover:bg-white/10' : 'hover:bg-stone-100'}`}
                            >
                                <X size={20} className={darkMode ? 'text-stone-400' : 'text-stone-600'} />
                            </button>
                        </div>

                        <div className="px-6 pb-8 space-y-6">
                            {/* Header */}
                            <div className="space-y-2">
                                <h2 className={`text-2xl font-serif ${darkMode ? 'text-white' : 'text-stone-900'}`}>
                                    Catégories
                                </h2>
                                <p className={`text-sm ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                                    Filtrez par type de produit
                                </p>
                            </div>

                            {/* Bouton "Tout Afficher" */}
                            <button
                                onClick={() => {
                                    onCategoryChange(null);
                                    onMobileClose();
                                }}
                                className={`
                                    w-full text-left
                                    py-4 px-5 rounded-2xl
                                    transition-all duration-300
                                    ${activeCategory === null
                                        ? `${darkMode ? 'bg-amber-500/15 border-2 border-amber-500/40' : 'bg-amber-500/10 border-2 border-amber-600/40'}`
                                        : `${darkMode ? 'bg-white/5 border-2 border-transparent hover:border-white/10' : 'bg-stone-50 border-2 border-transparent hover:border-stone-200'}`
                                    }
                                `}
                            >
                                <h3 className={`
                                    text-base font-bold
                                    ${activeCategory === null
                                        ? `${darkMode ? 'text-amber-500' : 'text-amber-600'}`
                                        : `${darkMode ? 'text-white' : 'text-stone-900'}`
                                    }
                                `}>
                                    Tout Afficher
                                </h3>
                            </button>

                            {/* Séparateur */}
                            <div className={`w-full h-px ${darkMode ? 'bg-white/10' : 'bg-stone-200'}`}></div>

                            {/* Liste des Catégories */}
                            <div className="space-y-3">
                                {categories.map((category) => (
                                    <button
                                        key={category.id}
                                        onClick={() => {
                                            onCategoryChange(category.id);
                                            onMobileClose();
                                        }}
                                        className={`
                                            w-full text-left
                                            py-4 px-5 rounded-2xl
                                            transition-all duration-300
                                            ${activeCategory === category.id
                                                ? `${darkMode ? 'bg-amber-500/15 border-2 border-amber-500/40' : 'bg-amber-500/10 border-2 border-amber-600/40'}`
                                                : `${darkMode ? 'bg-white/5 border-2 border-transparent hover:border-white/10' : 'bg-stone-50 border-2 border-transparent hover:border-stone-200'}`
                                            }
                                        `}
                                    >
                                        <h3 className={`
                                            text-base font-bold mb-1
                                            ${activeCategory === category.id
                                                ? `${darkMode ? 'text-amber-500' : 'text-amber-600'}`
                                                : `${darkMode ? 'text-white' : 'text-stone-900'}`
                                            }
                                        `}>
                                            {category.title}
                                        </h3>
                                        <p className={`
                                            text-xs uppercase tracking-wider
                                            ${activeCategory === category.id
                                                ? `${darkMode ? 'text-amber-500/60' : 'text-amber-600/60'}`
                                                : `${darkMode ? 'text-stone-500' : 'text-stone-400'}`
                                            }
                                        `}>
                                            {category.subtitle}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </>
    );
};

export default ShopSidebar;
