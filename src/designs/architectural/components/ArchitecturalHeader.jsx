import React, { useEffect, useState } from 'react';
import { useLiveTheme } from '../../../hooks/useLiveTheme';
import { useAuth } from '../../../contexts/AuthContext';
import { Armchair, Heart, LogIn, LogOut, Menu, ShoppingBag, Store, User, X } from 'lucide-react';
import AnimatedThemeToggler from '../../../components/ui/AnimatedThemeToggler';

const CuttingBoardIcon = ({ size = 18, className = '', strokeWidth = 1.5 }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
    >
        <path d="M8 2h8c1.1 0 2 .9 2 2v3h1c1.1 0 2 .9 2 2v11c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V9c0-1.1.9-2 2-2h1V4c0-1.1.9-2 2-2z" />
        <circle cx="12" cy="4" r="1" />
    </svg>
);

const ArchitecturalHeader = ({
    headerProps,
    user,
    onShowLogin,
    onOpenMenu,
    isMenuOpen,
    onOpenCart,
    cartCount = 0,
    toggleTheme,
    darkMode
}) => {
    const { activeCollection, setActiveCollection, setFilter, onOpenShop, title } = headerProps || {};
    const isShopView = title === "Le Comptoir";
    const isGalleryHeader = Boolean(setActiveCollection) || isShopView;
    useLiveTheme();
    const { logout, isAdmin } = useAuth();

    const [isVisible, setIsVisible] = useState(true);
    const lastScrollY = React.useRef(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY <= 0) {
                setIsVisible(true);
            } else if (currentScrollY > lastScrollY.current) {
                setIsVisible(false);
            } else if (currentScrollY < lastScrollY.current) {
                setIsVisible(true);
            }
            lastScrollY.current = currentScrollY;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navButtonClass = (isActive = false) => `group relative inline-flex h-16 md:h-[78px] items-center gap-2 border-b text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${
        isActive
            ? 'border-[#dba45f] text-white'
            : 'border-transparent text-stone-300 hover:border-[#dba45f]/70 hover:text-white'
    }`;

    return (
        <header
            className={`sticky top-0 z-50 transition-transform duration-300 ease-in-out ${isVisible ? 'translate-y-0' : '-translate-y-full'} ${
                isGalleryHeader
                    ? 'border-b border-white/10 bg-black/92 text-white backdrop-blur-xl'
                    : 'bg-transparent'
            }`}
            style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
        >
            <div className={`max-w-[1920px] mx-auto h-16 md:h-[78px] flex items-center justify-between relative ${
                isGalleryHeader ? 'px-4 md:px-8 lg:px-12' : 'px-4 md:px-12'
            }`}>
                <div className={`${isGalleryHeader ? 'hidden xl:flex items-center z-10 pr-6' : 'flex items-center z-10'}`}>
                    <button
                        type="button"
                        className="flex flex-col leading-none text-left cursor-pointer group"
                        onClick={() => { window.location.href = '/'; }}
                    >
                        <span className={`${isGalleryHeader ? 'font-serif normal-case text-[1.35rem] md:text-xl lg:text-2xl tracking-[0.03em]' : 'font-black uppercase text-sm tracking-widest'} transition-colors ${
                            isGalleryHeader || darkMode ? 'text-stone-100 group-hover:text-[#f0b969]' : 'text-stone-900 group-hover:text-stone-600'
                        }`}>
                            Tous à Table
                        </span>
                        <span className={`font-serif italic ${isGalleryHeader ? 'text-sm md:text-sm lg:text-base text-[#dba45f] text-center md:text-left' : `text-xs mt-1 ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}`}>
                            Atelier Normand
                        </span>
                    </button>
                </div>

                {isGalleryHeader && (
                    <nav className="flex min-w-0 flex-1 items-center justify-start xl:justify-center gap-5 md:gap-8 overflow-x-auto whitespace-nowrap no-scrollbar">
                        <button
                            onClick={() => {
                                if (isShopView) {
                                    window.location.hash = 'gallery';
                                } else {
                                    setActiveCollection('furniture');
                                    setFilter?.('fixed');
                                }
                            }}
                            className={navButtonClass(activeCollection === 'furniture' && !isShopView)}
                        >
                            <Armchair size={18} strokeWidth={1.5} className="text-stone-200/90" />
                            Mobilier
                        </button>
                        <button
                            onClick={() => {
                                if (isShopView) {
                                    window.location.hash = 'gallery';
                                } else {
                                    setActiveCollection('cutting_boards');
                                }
                            }}
                            className={navButtonClass(activeCollection === 'cutting_boards' && !isShopView)}
                        >
                            <CuttingBoardIcon size={18} strokeWidth={1.5} className="text-stone-200/90" />
                            Planches
                        </button>
                        {(onOpenShop || isShopView) && (
                            <button onClick={onOpenShop || (() => {})} className={`${navButtonClass(isShopView)} relative`}>
                                <Store size={18} strokeWidth={1.5} className="text-stone-200/90" />
                                Le Comptoir
                                <span className="absolute top-2 -right-3 pointer-events-none">
                                    <span className="relative inline-flex items-center justify-center rounded-full bg-[#f0c987] px-2 py-[3px] text-[8px] font-black uppercase tracking-[0.18em] text-stone-900 shadow-[0_2px_8px_rgba(240,201,135,0.25)]">
                                        New
                                        <svg className="absolute -top-2 -right-2" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#f0c987" strokeWidth="1.4" strokeLinecap="round" aria-hidden="true">
                                            <line x1="8" y1="3" x2="11" y2="0.5" />
                                            <line x1="11" y1="6" x2="13.5" y2="5" />
                                            <line x1="11" y1="9" x2="13.5" y2="10.5" />
                                        </svg>
                                    </span>
                                </span>
                            </button>
                        )}
                    </nav>
                )}

                {!isGalleryHeader && setActiveCollection && (
                    <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center justify-center z-0 w-max">
                        <nav className="flex items-center gap-10" />
                    </div>
                )}

                <div className={`${isGalleryHeader ? 'ml-auto gap-2 md:gap-3 pl-3 md:pl-6' : 'gap-2 md:gap-4'} flex items-center z-10`}>
                    {(!user || user.isAnonymous) ? (
                        <button
                            onClick={onShowLogin}
                            className={`${isGalleryHeader ? 'hidden md:flex border-[#dba45f]/55 text-stone-100 hover:border-[#dba45f] hover:text-[#dba45f] rounded-xl px-5 py-2.5' : darkMode ? 'border-stone-800 text-stone-500 hover:bg-stone-800' : 'border-stone-200 text-stone-500 hover:bg-stone-200'} items-center gap-2 border transition-all group`}
                            title="Connexion"
                        >
                            <User size={15} strokeWidth={1.6} className="hidden md:block" />
                            <LogIn size={19} className="md:hidden" />
                            <span className="hidden md:inline text-[10px] font-black uppercase tracking-widest">Connexion</span>
                        </button>
                    ) : (
                        <>
                            {isAdmin && (
                                <span className={`hidden md:inline text-[10px] font-black uppercase tracking-[0.2em] ${isGalleryHeader ? 'text-stone-200' : 'text-emerald-500'}`}>
                                    Admin
                                </span>
                            )}
                            <button
                                onClick={() => logout()}
                                className={`${isGalleryHeader ? 'hidden md:flex border-[#8a5b2a]/60 text-stone-100 hover:border-red-400 hover:text-red-300' : darkMode ? 'sm:border-stone-800 text-stone-400 hover:text-red-400' : 'sm:border-stone-200 text-stone-500 hover:text-red-600'} items-center justify-center gap-2 w-10 h-10 sm:w-auto sm:px-4 sm:py-2 rounded sm:border transition-all group`}
                                title="Se deconnecter"
                            >
                                <LogOut size={19} />
                                <span className="hidden sm:inline text-[10px] font-black uppercase tracking-widest">Quitter</span>
                            </button>
                        </>
                    )}

                    {!isGalleryHeader && toggleTheme && (
                        <AnimatedThemeToggler isDark={darkMode} toggleTheme={toggleTheme} />
                    )}

                    {isGalleryHeader && (
                        <button type="button" className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center text-stone-100 hover:text-[#dba45f] transition-colors" title="Favoris">
                            <Heart size={24} strokeWidth={1.5} />
                        </button>
                    )}

                    <button onClick={onOpenCart} className="relative group w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full border-0 bg-transparent shadow-none transition-colors" title="Panier">
                        <ShoppingBag size={isGalleryHeader ? 24 : 22} strokeWidth={1.5} className={`transition-colors duration-300 ${isGalleryHeader || darkMode ? 'text-stone-100 group-hover:text-[#dba45f]' : 'text-stone-900 group-hover:text-amber-600'}`} />
                        {cartCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#dba45f] px-1 text-[10px] font-black text-black border border-black/50">
                                {cartCount}
                            </span>
                        )}
                    </button>

                    {isGalleryHeader && <span className="h-7 w-px bg-white/20" />}

                    <button onClick={onOpenMenu} className={`relative flex items-center justify-center group w-10 h-10 rounded-full border-0 bg-transparent shadow-none cursor-pointer transition-colors`} title="Menu">
                        <Menu size={isGalleryHeader ? 28 : 24} strokeWidth={1.5} className={`absolute transition-all duration-500 ease-in-out ${isGalleryHeader || darkMode ? 'text-stone-100 group-hover:text-[#dba45f]' : 'text-stone-900 group-hover:text-amber-600'} ${isMenuOpen ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'}`} />
                        <X size={isGalleryHeader ? 28 : 24} strokeWidth={1.5} className={`absolute transition-all duration-500 ease-in-out ${isGalleryHeader || darkMode ? 'text-stone-100 group-hover:text-[#dba45f]' : 'text-stone-900 group-hover:text-amber-600'} ${isMenuOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'}`} />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default ArchitecturalHeader;
