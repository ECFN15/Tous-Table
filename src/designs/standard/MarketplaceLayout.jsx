import React from 'react';
import { ShoppingBag, Grid, LayoutList, Gavel } from 'lucide-react';
import ProductCard from './components/ProductCard';
import WarmAmbienceBackground from '../../components/WarmAmbienceBackground'; // Fix path if needed
const SEO = React.lazy(() => import('../../components/SEO')); // Fix path
import { useRealtimeUserLikes } from '../../hooks/useRealtimeUserLikes'; // Feature spécifique à ce design

/**
 * LAYOUT : STANDARD (Design Original)
 * Le design "Atelier Normand" avec particules, background Three.js et cartes glassmorphism.
 */
const MarketplaceLayout = ({
    items,
    palette,
    viewMode,
    // likedItemIds, // Géré en interne
    // onLike,       // Géré en interne
    onComment,
    onSelectItem,
    onShowLogin,
    headerProps,
    darkMode,
    user // Nécessaire pour le hook
}) => {
    const {
        activeCollection, setActiveCollection,
        filter, setFilter,
        setViewMode // headerProps needs to pass setViewMode too if we move controls here
    } = headerProps || {};

    // --- FEATURE INJECTION: LIKES (Specific to Standard Design) ---
    const { likedItemIds, toggleLike } = useRealtimeUserLikes(user);

    const handleLike = async (e, item) => {
        e.stopPropagation();
        if (!user) {
            onShowLogin();
            return;
        }
        try {
            await toggleLike(item.id, activeCollection);
        } catch (err) {
            console.error("Error like:", err);
            alert("Impossible de liker. Vérifiez votre connexion.");
        }
    };

    return (
        <div
            className="min-h-screen pb-32 transition-colors duration-500"
            style={{
                backgroundColor: palette.bgGradientTop,
                color: palette.textBody
            }}
        >
            {/* AMBIANCE BACKGROUND (Three.js) */}
            <WarmAmbienceBackground darkMode={darkMode} />

            {/* CONTENT WRAPPER */}
            <div className="relative z-10">

                {/* --- HEADER (Original) --- */}
                <div className="pt-20 md:pt-28 pb-6 md:pb-12 px-5 sm:px-8 md:px-[8vw] xl:px-[12vw] flex flex-col lg:flex-row lg:items-end justify-between gap-3 lg:gap-10">
                    <div className="space-y-1 md:space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-2xl">
                        <h1
                            className="font-serif text-5xl sm:text-5xl md:text-7xl lg:text-8xl font-medium tracking-tight leading-[0.9] transition-colors"
                            style={{
                                color: palette.textTitle,
                                mixBlendMode: palette.titleBlendMode
                            }}
                        >
                            La Galerie<span className="scale-110 inline-block transform translate-x-1" style={{ color: palette.textSubtitle }}>.</span>
                        </h1>
                        <p
                            className="font-serif italic text-xl md:text-3xl tracking-wide animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-100"
                            style={{ color: palette.textSubtitle }}
                        >
                            {activeCollection === 'furniture' ? 'Nos Meubles de Ferme' : 'Nos Planches à Découper'}
                        </p>
                    </div>
                </div>

                {/* --- FILTRES & VIEW TOGGLE --- */}
                <div className="px-5 sm:px-8 md:px-[8vw] xl:px-[12vw] mb-8 md:mb-12 flex flex-row items-center justify-between gap-4 animate-in fade-in duration-1000 delay-200">

                    {/* SWITCHER COLLECTION */}
                    <div
                        className="flex p-1 rounded-full w-fit shadow-lg transition-all backdrop-blur-md border"
                        style={{
                            backgroundColor: palette.switcherBg,
                            borderColor: palette.switcherBorder
                        }}
                    >
                        <button
                            onClick={() => { setActiveCollection('furniture'); setFilter('fixed'); }}
                            className={`px-4 md:px-6 py-1.5 md:py-2 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-widest transition-all duration-300 whitespace-nowrap ${activeCollection === 'furniture' ? 'shadow-sm' : ''}`}
                            style={{
                                backgroundColor: activeCollection === 'furniture' ? palette.btnActiveBg : 'transparent',
                                color: activeCollection === 'furniture' ? palette.btnActiveText : palette.btnInactiveText
                            }}
                        >
                            Mobilier
                        </button>
                        <button
                            onClick={() => { setActiveCollection('cutting_boards'); setFilter('fixed'); }}
                            className={`px-4 md:px-6 py-1.5 md:py-2 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-widest transition-all duration-300 whitespace-nowrap group ${activeCollection === 'cutting_boards' ? 'shadow-sm' : ''}`}
                            style={{
                                backgroundColor: activeCollection === 'cutting_boards' ? palette.btnActiveBg : 'transparent',
                                color: activeCollection === 'cutting_boards' ? palette.btnActiveText : palette.btnInactiveText,
                                transform: activeCollection === 'cutting_boards' ? 'scale(1.02)' : 'scale(1)'
                            }}
                        >
                            Planches
                        </button>
                    </div>

                    {/* VIEW SWITCHER */}
                    <div className="flex items-center gap-2">
                        <div
                            className="flex p-0.5 rounded-lg shadow-sm border shrink-0 transition-colors"
                            style={{
                                backgroundColor: palette.viewSwitcherBg,
                                borderColor: palette.switcherBorder
                            }}
                        >
                            <button
                                onClick={() => setFilter(filter === 'auction' ? 'fixed' : 'auction')}
                                className="p-1.5 rounded-md transition-all relative group"
                                style={{
                                    backgroundColor: filter === 'auction' ? palette.accent : 'transparent',
                                    color: filter === 'auction' ? palette.btnActiveText : palette.btnInactiveText
                                }}
                                title="Enchères"
                            >
                                <Gavel size={14} />
                            </button>
                            <div className="w-px h-4 mx-1 self-center opacity-30" style={{ backgroundColor: palette.textBody }}></div>
                            <button
                                onClick={() => headerProps.setViewMode('grid')}
                                className="p-1.5 rounded-md transition-all"
                                style={{
                                    backgroundColor: viewMode === 'grid' ? palette.btnActiveBg : 'transparent',
                                    color: viewMode === 'grid' ? palette.btnActiveText : palette.btnInactiveText
                                }}
                            >
                                <Grid size={14} />
                            </button>
                            <button
                                onClick={() => headerProps.setViewMode('list')}
                                className="p-1.5 rounded-md transition-all"
                                style={{
                                    backgroundColor: viewMode === 'list' ? palette.btnActiveBg : 'transparent',
                                    color: viewMode === 'list' ? palette.btnActiveText : palette.btnInactiveText
                                }}
                            >
                                <LayoutList size={14} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- GRID --- */}
                <div className={`px-4 sm:px-8 md:px-[8vw] xl:px-[12vw] grid gap-x-3 gap-y-6 md:gap-x-8 md:gap-y-12 transition-all duration-500 ${viewMode === 'grid' ? 'grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
                    {items.length === 0 ? (
                        <div className="col-span-full py-32 flex flex-col items-center justify-center text-center opacity-40 space-y-4">
                            <ShoppingBag size={48} strokeWidth={1} />
                            <p className="font-serif text-2xl italic">Cette collection est vide pour le moment.</p>
                        </div>
                    ) : (
                        items.map((item, index) => (
                            <div
                                key={item.id}
                                onClick={() => { if (item.auctionActive && !onLike /* user logic hack if we dont pass user */) onShowLogin(); else onSelectItem(item.id); }}
                                className={`group relative flex flex-col cursor-pointer animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-backwards transform-gpu`}
                                style={{
                                    animationDelay: index < 8 ? `${index * 50}ms` : '0ms',
                                    willChange: 'transform, opacity'
                                }}
                            >
                                <ProductCard
                                    item={item}
                                    palette={palette}
                                    viewMode={viewMode}
                                    isLiked={likedItemIds ? likedItemIds.includes(item.id) : false}
                                    onLike={(e) => handleLike(e, item)}
                                    onComment={(e) => onComment(e, item)}
                                />
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default MarketplaceLayout;
