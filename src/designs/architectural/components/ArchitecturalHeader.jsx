import React, { useEffect, useState } from 'react';
import { useLiveTheme } from '../../../hooks/useLiveTheme';
import { useAuth } from '../../../contexts/AuthContext';
import { Heart, LogIn, LogOut, Menu, Search, ShieldCheck, ShoppingBag, X } from 'lucide-react';
import AnimatedThemeToggler from '../../../components/ui/AnimatedThemeToggler';

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
    const { activeCollection, setActiveCollection, setFilter, onOpenShop } = headerProps || {};
    const isGalleryHeader = Boolean(setActiveCollection);
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

    const navButtonClass = (isActive = false) => `relative h-20 md:h-24 inline-flex items-center text-[10px] font-black uppercase tracking-[0.23em] transition-colors ${
        isActive ? 'text-white' : 'text-stone-300 hover:text-white'
    }`;

    return (
        <header
            className={`sticky top-0 z-50 transition-transform duration-300 ease-in-out ${isVisible ? 'translate-y-0' : '-translate-y-full'} ${
                isGalleryHeader
                    ? 'bg-black/92 text-white border-b border-[#8a5b2a]/25 backdrop-blur-xl'
                    : 'bg-transparent'
            }`}
            style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
        >
            <div className={`max-w-[1920px] mx-auto h-20 md:h-24 flex items-center justify-between relative ${
                isGalleryHeader ? 'px-5 md:px-12 lg:px-16' : 'px-4 md:px-12'
            }`}>
                {isGalleryHeader && (
                    <button
                        onClick={onOpenMenu}
                        className="md:hidden absolute left-5 top-1/2 -translate-y-1/2 z-20 flex h-11 w-11 items-center justify-center text-[#dba45f]"
                        title="Menu"
                    >
                        <Menu size={31} strokeWidth={1.35} className={`${isMenuOpen ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'} absolute transition-all duration-500`} />
                        <X size={31} strokeWidth={1.35} className={`${isMenuOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'} absolute transition-all duration-500`} />
                    </button>
                )}

                <div className={`${isGalleryHeader ? 'absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0' : ''} flex items-center z-10`}>
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
                    <nav className="hidden lg:flex absolute left-1/2 top-0 h-full -translate-x-1/2 items-center justify-center gap-9">
                        <button
                            onClick={() => {
                                setActiveCollection('furniture');
                                setFilter?.('fixed');
                            }}
                            className={navButtonClass(activeCollection === 'furniture')}
                        >
                            Mobilier
                            <span className={`absolute bottom-5 left-0 h-px bg-[#dba45f] transition-all ${activeCollection === 'furniture' ? 'w-full' : 'w-0 group-hover:w-full'}`} />
                        </button>
                        <button
                            onClick={() => setActiveCollection('cutting_boards')}
                            className={navButtonClass(activeCollection === 'cutting_boards')}
                        >
                            Planches
                            <span className={`absolute bottom-5 left-0 h-px bg-[#dba45f] transition-all ${activeCollection === 'cutting_boards' ? 'w-full' : 'w-0'}`} />
                        </button>
                        {onOpenShop && (
                            <button onClick={onOpenShop} className={navButtonClass(false)}>
                                Le Comptoir
                            </button>
                        )}
                        <span className="rounded-sm border border-[#dba45f]/35 bg-[#dba45f]/14 px-2 py-1 text-[8px] font-black uppercase tracking-[0.18em] text-[#dba45f]">
                            Nouveau
                        </span>
                    </nav>
                )}

                {!isGalleryHeader && setActiveCollection && (
                    <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center justify-center z-0 w-max">
                        <nav className="flex items-center gap-10" />
                    </div>
                )}

                <div className={`${isGalleryHeader ? 'ml-auto gap-1 md:gap-4' : 'gap-2 md:gap-4'} flex items-center z-10`}>
                    {isGalleryHeader && (
                        <>
                            <button type="button" className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center text-stone-100 hover:text-[#dba45f] transition-colors" title="Rechercher">
                                <Search size={22} strokeWidth={1.7} />
                            </button>
                            <button type="button" className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center text-stone-100 hover:text-[#dba45f] transition-colors" title="Favoris">
                                <Heart size={23} strokeWidth={1.7} />
                            </button>
                        </>
                    )}

                    {(!user || user.isAnonymous) ? (
                        <button
                            onClick={onShowLogin}
                            className={`${isGalleryHeader ? 'hidden md:flex border-[#8a5b2a]/60 text-stone-100 hover:border-[#dba45f] hover:text-[#dba45f]' : darkMode ? 'border-stone-800 text-stone-500 hover:bg-stone-800' : 'border-stone-200 text-stone-500 hover:bg-stone-200'} items-center gap-2 px-4 py-2 rounded border transition-all group`}
                            title="Connexion Admin"
                        >
                            <ShieldCheck size={15} className="hidden md:block" />
                            <LogIn size={19} className="md:hidden" />
                            <span className="hidden md:inline text-[10px] font-black uppercase tracking-widest">Admin</span>
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

                    <button onClick={onOpenCart} className="relative group w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full transition-colors" title="Panier">
                        <ShoppingBag size={isGalleryHeader ? 23 : 20} strokeWidth={1.6} className={`transition-colors duration-300 ${isGalleryHeader || darkMode ? 'text-stone-100 group-hover:text-[#dba45f]' : 'text-stone-900 group-hover:text-amber-600'}`} />
                        {cartCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#dba45f] px-1 text-[10px] font-black text-black border border-black/50">
                                {cartCount}
                            </span>
                        )}
                    </button>

                    <button onClick={onOpenMenu} className={`relative ${isGalleryHeader ? 'hidden md:flex' : 'flex'} items-center justify-center group w-10 h-10 rounded-full cursor-pointer transition-colors`} title="Menu">
                        <Menu size={isGalleryHeader ? 30 : 24} strokeWidth={isGalleryHeader ? 1.35 : 1} className={`absolute transition-all duration-500 ease-in-out ${isGalleryHeader || darkMode ? 'text-[#dba45f] group-hover:text-white' : 'text-stone-900 group-hover:text-amber-600'} ${isMenuOpen ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'}`} />
                        <X size={isGalleryHeader ? 30 : 24} strokeWidth={isGalleryHeader ? 1.35 : 1} className={`absolute transition-all duration-500 ease-in-out ${isGalleryHeader || darkMode ? 'text-[#dba45f] group-hover:text-white' : 'text-stone-900 group-hover:text-amber-600'} ${isMenuOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'}`} />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default ArchitecturalHeader;
