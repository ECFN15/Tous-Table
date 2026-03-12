import React, { useState, useEffect } from 'react';
import { useLiveTheme } from '../../../hooks/useLiveTheme';
import { useAuth } from '../../../contexts/AuthContext';
import { Menu, ShoppingBag, ShieldCheck, LogOut, Hammer, LogIn, ChevronLeft, Armchair, Gavel } from 'lucide-react';
import { motion } from 'framer-motion';
import AnimatedThemeToggler from '../../../components/ui/AnimatedThemeToggler';

const CuttingBoard = ({ size = 14, strokeWidth = 2, ...props }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <rect x="3" y="7" width="18" height="12" rx="1.5" />
        <circle cx="7" cy="13" r="1.2" />
        <path d="M21 11V15" opacity="0.3" />
    </svg>
);

/**
 * COMPONENT : ARCHITECTURAL HEADER
 * Shared header for Gallery and Product Detail views in Architectural Theme.
 * - [UX] Smart Scroll: Hides on scroll down, shows on scroll up.
 */
const ArchitecturalHeader = ({
    headerProps,
    user,
    onShowLogin,
    onOpenMenu,
    onOpenCart,
    cartCount = 0,
    toggleTheme,

    darkMode, // Explicit prop
    onBack // New prop for navigation
}) => {
    // Optional props destructuring with defaults
    const { activeCollection, setActiveCollection } = headerProps || {};
    // Check if mode is forced (we need to pass current darkmode state to hook if we want it to react, 
    // but here we just need to know if it is forced. We can pass a dummy or read from localStorage if needed, 
    // but cleaner to just trust the hook default or pass it via props. 
    // Since we don't receive darkMode boolean here, we'll let useLiveTheme resolve it or rely on parent.
    // Actually, forcedMode comes from Firestore.
    const { forcedMode } = useLiveTheme();
    const { logout, isAdmin } = useAuth();

    // We always show the toggle to allow user override
    const showToggle = true;
    // We need to know current state for the icon. Since we don't have 'darkMode' prop here (oops, missed it in drilling),
    // we can check document class or localStorage. Or better, just fix the drilling in next step if needed. 
    // Let's assume standard Tailwind 'dark' class presence for icon state.
    const isDark = darkMode;

    // --- SMART SCROLL LOGIC ---
    const [isVisible, setIsVisible] = useState(true);
    const lastScrollY = React.useRef(0); // Use Ref for performance

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // Immediate reaction: hide on scroll down, show on scroll up
            if (currentScrollY <= 0) {
                setIsVisible(true);
            } else if (currentScrollY > lastScrollY.current) {
                // Scrolling DOWN -> Hide
                setIsVisible(false);
            } else if (currentScrollY < lastScrollY.current) {
                // Scrolling UP -> Show
                setIsVisible(true);
            }
            lastScrollY.current = currentScrollY;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);


    return (
        <header
            className={`sticky top-0 z-[1000] transition-all duration-300 ease-in-out transform ${isVisible ? 'translate-y-0' : '-translate-y-full'} bg-transparent`}
        >
            <div className="max-w-[1920px] mx-auto px-4 md:px-12 h-20 md:h-24 flex items-center justify-between relative">

                {/* 1. LEFT: LOGO */}
                <div className="flex items-center z-10">
                    <div className="flex flex-col leading-none cursor-pointer group" onClick={() => window.location.href = '/'}>
                        <span className={`font-black uppercase text-sm tracking-widest transition-colors ${darkMode ? 'text-stone-200 group-hover:text-stone-400' : 'text-stone-900 group-hover:text-stone-600'}`}>Tous à Table</span>
                        <span className={`font-serif italic text-xs mt-1 ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>Atelier Normand</span>
                    </div>
                </div>

                {/* 2. CENTER: COLLECTION TABS */}
                {setActiveCollection && (
                    <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center justify-center z-0 w-max">
                        <nav className="flex items-center gap-10">
                                {/* MOBILIER BUTTON */}
                                <button
                                    onClick={() => {
                                        setActiveCollection('furniture');
                                        if (headerProps?.setFilter) headerProps.setFilter('fixed');
                                    }}
                                    className={`relative group flex items-center gap-3 py-2 text-[10.5px] font-bold uppercase tracking-[0.2em] transition-all duration-500 overflow-hidden bg-transparent
                                        ${activeCollection === 'furniture' && (!headerProps?.filter || headerProps.filter !== 'auction') 
                                            ? (darkMode ? 'text-stone-100' : 'text-stone-900')
                                            : (darkMode ? 'text-stone-400 hover:text-stone-100' : 'text-stone-500 hover:text-stone-900')
                                        }
                                    `}
                                >
                                    {/* Bottom Line expanding */}
                                    <span className={`absolute bottom-0 left-0 h-[1.5px] bg-current transition-all duration-500 ease-out z-10 
                                        ${activeCollection === 'furniture' && (!headerProps?.filter || headerProps.filter !== 'auction') ? 'w-full' : 'w-0 group-hover:w-full'}
                                    `}></span>

                                    <Armchair size={15} strokeWidth={1.5} className="relative z-10 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:scale-110" />
                                    <span className="relative z-10">Mobilier</span>
                                </button>

                                {/* PLANCHES BUTTON */}
                                <button
                                    onClick={() => setActiveCollection('cutting_boards')}
                                    className={`relative group flex items-center gap-3 py-2 text-[10.5px] font-bold uppercase tracking-[0.2em] transition-all duration-500 overflow-hidden bg-transparent
                                        ${activeCollection === 'cutting_boards'
                                            ? (darkMode ? 'text-stone-100' : 'text-stone-900')
                                            : (darkMode ? 'text-stone-400 hover:text-stone-100' : 'text-stone-500 hover:text-stone-900')
                                        }
                                    `}
                                >
                                    {/* Bottom Line expanding */}
                                    <span className={`absolute bottom-0 left-0 h-[1.5px] bg-current transition-all duration-500 ease-out z-10 
                                        ${activeCollection === 'cutting_boards' ? 'w-full' : 'w-0 group-hover:w-full'}
                                    `}></span>

                                    <div className="relative z-10 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:scale-110">
                                        <CuttingBoard size={15} strokeWidth={1.5} />
                                    </div>
                                    <span className="relative z-10">Planches</span>
                                </button>

                                {/* ENCHÈRES BUTTON */}
                                <button
                                    onClick={() => {
                                        setActiveCollection('furniture');
                                        if (headerProps?.setFilter) headerProps.setFilter('auction');
                                    }}
                                    className={`relative group flex items-center gap-3 py-2 text-[10.5px] font-bold uppercase tracking-[0.2em] transition-all duration-500 overflow-hidden bg-transparent
                                        ${activeCollection === 'furniture' && headerProps?.filter === 'auction'
                                            ? (darkMode ? 'text-amber-400' : 'text-amber-700')
                                            : (darkMode ? 'text-stone-400 hover:text-amber-400' : 'text-stone-500 hover:text-amber-600')
                                        }
                                    `}
                                >
                                    {/* Bottom Line expanding */}
                                    <span className={`absolute bottom-0 left-0 h-[1.5px] bg-current transition-all duration-500 ease-out z-10 
                                        ${activeCollection === 'furniture' && headerProps?.filter === 'auction' ? 'w-full' : 'w-0 group-hover:w-full'}
                                    `}></span>

                                    <Gavel size={15} strokeWidth={1.5} className="relative z-10 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:scale-110" />
                                    <span className="relative z-10">Enchères</span>
                                </button>
                            </nav>
                        </div>
                )}

                {/* 3. RIGHT: ACTIONS */}
                <div className="flex items-center gap-6 z-10">

                    {/* GLOBAL ACTIONS */}
                    <div className="flex items-center gap-1 md:gap-4">

                        {/* LOGIN / LOGOUT BUTTON (Integrated Mobile + Desktop) */}
                        {(!user || user.isAnonymous) ? (
                            <div className="flex items-center gap-1 md:gap-2">
                                {/* Mobile Icon (LogIn) */}
                                <button
                                    onClick={onShowLogin}
                                    className={`md:hidden w-10 h-10 flex items-center justify-center transition-all ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}
                                    title="Connexion Admin"
                                >
                                    <LogIn size={20} strokeWidth={1.5} />
                                </button>

                                {/* Desktop Button */}
                                <button onClick={onShowLogin} className={`hidden md:flex items-center gap-2 px-5 py-2 rounded border transition-all group ${darkMode ? 'border-stone-800 hover:bg-stone-800' : 'border-stone-200 hover:bg-stone-200'}`}>
                                    <ShieldCheck size={16} className={`group-hover:text-amber-500 transition-colors ${darkMode ? 'text-stone-400' : 'text-stone-400'}`} />
                                    <span className={`text-xs font-bold uppercase tracking-widest group-hover:text-stone-900 dark:group-hover:text-stone-200 ${darkMode ? 'text-stone-500' : 'text-stone-500'}`}>Connexion</span>
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                {/* Mobile/Desktop Indicator */}
                                {isAdmin && (
                                    <div className="px-3 py-2 hidden sm:block">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 cursor-default">Admin</span>
                                    </div>
                                )}
                                <button
                                    onClick={() => logout()}
                                    className={`flex items-center justify-center sm:gap-2 w-10 h-10 sm:w-auto sm:px-4 sm:py-2 rounded-full sm:rounded sm:border transition-all group ${darkMode ? 'sm:border-stone-800 sm:hover:bg-red-900/20 sm:hover:border-red-900/50 text-stone-400 hover:text-red-400' : 'sm:border-stone-200 sm:hover:bg-red-50 sm:hover:border-red-200 text-stone-500 hover:text-red-600'}`}
                                    title="Se déconnecter"
                                >
                                    <LogOut size={20} />
                                    <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-widest">Quitter</span>
                                </button>
                            </div>
                        )}

                        {/* DARK MODE TOGGLE (Only if Auto) */}
                        {showToggle && toggleTheme && (
                            <AnimatedThemeToggler isDark={isDark} toggleTheme={toggleTheme} />
                        )}

                        <button onClick={onOpenCart} className={`relative group w-10 h-10 flex items-center justify-center rounded-full transition-colors ${darkMode ? 'hover:bg-stone-800' : 'hover:bg-stone-200'}`} title="Panier">
                            <ShoppingBag size={20} strokeWidth={1.5} className={`group-hover:scale-110 transition-transform ${darkMode ? 'text-stone-200' : 'text-stone-900'}`} />
                            {cartCount > 0 && (
                                <span className="absolute top-2 right-2 flex h-2.5 w-2.5 items-center justify-center">
                                    <span className="absolute inline-flex h-2.5 w-2.5 rounded-full border-[0.5px] border-emerald-400 animate-[radar-ping_3s_ease-out_infinite]"></span>
                                    <span className="absolute inline-flex h-2.5 w-2.5 rounded-full border-[0.5px] border-emerald-400 animate-[radar-ping_3s_ease-out_infinite]" style={{ animationDelay: '-1.5s' }}></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-sm border border-white dark:border-[#0A0A0A]"></span>
                                </span>
                            )}
                        </button>

                        <button onClick={onOpenMenu} className={`flex items-center justify-center gap-3 group cursor-pointer w-10 h-10 md:w-auto md:px-4 md:py-2 rounded-full md:rounded transition-colors ${darkMode ? 'hover:bg-stone-800' : 'hover:bg-stone-200'}`} title="Menu">
                            <span className={`hidden md:block text-xs font-bold uppercase tracking-widest group-hover:underline underline-offset-4 ${darkMode ? 'text-stone-200' : 'text-stone-900'}`}>Menu</span>
                            <Menu size={24} strokeWidth={1} className={darkMode ? 'text-stone-200' : 'text-stone-900'} />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default ArchitecturalHeader;
