import React, { useEffect, useState } from 'react';
import { useLiveTheme } from '../../../hooks/useLiveTheme';
import { useAuth } from '../../../contexts/AuthContext';
import { Heart, LogIn, LogOut, Menu, ShoppingBag, User, X } from 'lucide-react';
import AnimatedThemeToggler from '../../../components/ui/AnimatedThemeToggler';

const FurnitureHeaderIcon = ({ size = 26, className = '', strokeWidth = 1.65 }) => (
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
        <path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3" />
        <path d="M3 16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v1.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V11a2 2 0 0 0-4 0z" />
        <path d="M5 18v2" />
        <path d="M19 18v2" />
    </svg>
);

const BreadBoardHeaderIcon = ({ size = 26, className = '', strokeWidth = 1.65 }) => (
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
        <path d="M12 2.25a1.7 1.7 0 0 1 .52 3.32v.92c0 .66.38 1.26.98 1.54l2.1.98a3 3 0 0 1 1.75 2.72v7.57a2.45 2.45 0 0 1-2.45 2.45H9.1a2.45 2.45 0 0 1-2.45-2.45v-7.57A3 3 0 0 1 8.4 9.01l2.1-.98c.6-.28.98-.88.98-1.54v-.92A1.7 1.7 0 0 1 12 2.25Z" />
        <circle cx="12" cy="13.65" r=".72" />
    </svg>
);

const CounterHeaderIcon = ({ size = 26, className = '', strokeWidth = 1.65 }) => (
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
        <path d="M4.8 4.25h14.4l1.55 4.5H3.25l1.55-4.5Z" />
        <path d="M3.25 8.75h17.5" />
        <path d="M5.25 8.75v1.75A2.25 2.25 0 0 0 7.5 12.75a2.25 2.25 0 0 0 2.25-2.25V8.75" />
        <path d="M9.75 8.75v1.75A2.25 2.25 0 0 0 12 12.75a2.25 2.25 0 0 0 2.25-2.25V8.75" />
        <path d="M14.25 8.75v1.75a2.25 2.25 0 0 0 4.5 0V8.75" />
        <path d="M5.25 12.45v7.3h13.5v-7.3" />
        <path d="M9 19.75v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4" />
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
    const navIconClass = 'shrink-0 text-current opacity-90 transition-colors';

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
                            <FurnitureHeaderIcon className={navIconClass} />
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
                            <BreadBoardHeaderIcon className={navIconClass} />
                            Planches
                        </button>
                        {(onOpenShop || isShopView) && (
                            <button onClick={onOpenShop || (() => {})} className={`${navButtonClass(isShopView)} relative`}>
                                <CounterHeaderIcon className={navIconClass} />
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
                                className={`${isGalleryHeader ? 'hidden md:flex border-[#8a5b2a]/60 text-stone-100 hover:border-red-400 hover:text-red-300' : darkMode ? 'sm:border-stone-600 text-stone-200 hover:border-red-500 hover:text-red-400 hover:bg-red-500/10' : 'sm:border-stone-300 text-stone-600 hover:border-red-400 hover:text-red-600 hover:bg-red-50'} items-center justify-center gap-2 w-10 h-10 sm:w-auto sm:px-4 sm:py-2 rounded sm:border transition-all group`}
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
