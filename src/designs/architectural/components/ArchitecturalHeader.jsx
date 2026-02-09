import React, { useState, useEffect } from 'react';
import { useLiveTheme } from '../../../hooks/useLiveTheme';
import { useAuth } from '../../../contexts/AuthContext';
import { Menu, ShoppingBag, ShieldCheck, Sun, Moon, LogOut, Hammer, LogIn } from 'lucide-react';

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
    wishlistCount = 0,
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
    const { logout } = useAuth();

    // We only show toggle if mode is NOT forced
    const showToggle = forcedMode !== 'light' && forcedMode !== 'dark';
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

            // Ignore small movements or top of page (elastic bounce)
            if (Math.abs(currentScrollY - lastScrollY.current) < 10) return;

            if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
                // Scrolling DOWN (>100px) -> Hide
                setIsVisible(false);
            } else {
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
            className={`sticky top-0 z-[100] backdrop-blur-md transition-all duration-300 ease-in-out transform ${isVisible ? 'translate-y-0' : '-translate-y-full'} ${darkMode ? 'bg-[#0A0A0A]/95' : 'bg-[#FAFAF9]/95'}`}
        >
            <div className="max-w-[1920px] mx-auto px-4 md:px-12 h-20 md:h-24 flex items-center justify-between">

                {/* 1. LEFT: LOGO & TABS */}
                {/* 1. LEFT: NAVIGATION & LOGO */}
                <div className="flex items-center gap-6">

                    <div className="flex items-center gap-8">
                        {/* MINI LOGO TEXT */}
                        <div className="flex flex-col leading-none cursor-pointer group" onClick={() => window.location.href = '/'}>
                            <span className={`font-black uppercase text-sm tracking-widest transition-colors ${darkMode ? 'text-stone-200 group-hover:text-stone-400' : 'text-stone-900 group-hover:text-stone-600'}`}>Tous à Table</span>
                            <span className={`font-serif italic text-xs mt-1 ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>Atelier Normand</span>
                        </div>

                        {/* COLLECTION TABS */}
                        {setActiveCollection && (
                            <nav className="hidden md:flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        setActiveCollection('furniture');
                                        if (headerProps?.setFilter) headerProps.setFilter('fixed');
                                    }}
                                    className={`px-5 py-2 rounded text-xs font-bold uppercase tracking-widest transition-all ${activeCollection === 'furniture' && (!headerProps?.filter || headerProps.filter !== 'auction') ? (darkMode ? 'bg-stone-800 text-white' : 'bg-stone-200 text-black') : (darkMode ? 'text-stone-400 hover:text-stone-300' : 'text-stone-400 hover:text-stone-600')}`}
                                >
                                    Mobilier
                                </button>
                                <button
                                    onClick={() => setActiveCollection('cutting_boards')} // Cutting boards don't have auctions usually
                                    className={`px-5 py-2 rounded text-xs font-bold uppercase tracking-widest transition-all ${activeCollection === 'cutting_boards' ? (darkMode ? 'bg-stone-800 text-white' : 'bg-stone-200 text-black') : (darkMode ? 'text-stone-400 hover:text-stone-300' : 'text-stone-400 hover:text-stone-600')}`}
                                >
                                    Planches
                                </button>
                                <button
                                    onClick={() => {
                                        setActiveCollection('furniture');
                                        if (headerProps?.setFilter) headerProps.setFilter('auction');
                                    }}
                                    className={`px-5 py-2 rounded text-xs font-bold uppercase tracking-widest transition-all ${activeCollection === 'furniture' && headerProps?.filter === 'auction' ? (darkMode ? 'bg-stone-800 text-white' : 'bg-stone-200 text-black') : (darkMode ? 'text-stone-400 hover:text-stone-300' : 'text-stone-400 hover:text-stone-600')}`}
                                >
                                    Enchères
                                </button>
                            </nav>
                        )}
                    </div>
                </div>

                {/* 2. RIGHT: ACTIONS */}
                <div className="flex items-center gap-6">

                    {/* GLOBAL ACTIONS */}
                    <div className="flex items-center gap-4">

                        {/* DARK MODE TOGGLE (Only if Auto) */}
                        {showToggle && toggleTheme && (
                            <button
                                onClick={toggleTheme}
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${darkMode ? 'text-stone-400 hover:bg-stone-800 hover:text-amber-500' : 'text-stone-400 hover:bg-stone-200 hover:text-stone-900'}`}
                                title="Changer de thème"
                            >
                                {isDark ? <Sun size={20} strokeWidth={1.5} /> : <Moon size={20} strokeWidth={1.5} />}
                            </button>
                        )}

                        {/* LOGIN / LOGOUT BUTTON (Integrated Mobile + Desktop) */}
                        {(!user || user.isAnonymous) ? (
                            <div className="flex items-center gap-1 md:gap-2">
                                {/* Mobile Icon (LogIn) */}
                                <button
                                    onClick={onShowLogin}
                                    className={`md:hidden w-10 h-10 rounded-full flex items-center justify-center transition-all ${darkMode ? 'text-stone-400 hover:bg-stone-800' : 'text-stone-500 hover:bg-stone-200'}`}
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
                                <div className="px-3 py-2 hidden sm:block">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 cursor-default">Admin</span>
                                </div>
                                <button
                                    onClick={() => logout()}
                                    className={`flex items-center justify-center sm:gap-2 w-10 h-10 sm:w-auto sm:px-4 sm:py-2 rounded-full sm:rounded border transition-all group ${darkMode ? 'border-stone-800 hover:bg-red-900/20 hover:border-red-900/50 text-stone-400 hover:text-red-400' : 'border-stone-200 hover:bg-red-50 hover:border-red-200 text-stone-500 hover:text-red-600'}`}
                                    title="Se déconnecter"
                                >
                                    <LogOut size={18} />
                                    <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-widest">Quitter</span>
                                </button>
                            </div>
                        )}

                        <button onClick={onOpenCart} className={`relative group w-10 h-10 flex items-center justify-center rounded-full transition-colors ${darkMode ? 'hover:bg-stone-800' : 'hover:bg-stone-200'}`} title="Panier">
                            <ShoppingBag size={20} strokeWidth={1.5} className={`group-hover:scale-110 transition-transform ${darkMode ? 'text-stone-200' : 'text-stone-900'}`} />
                            {wishlistCount > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-black"></span>}
                        </button>

                        <button onClick={onOpenMenu} className={`flex items-center justify-center gap-3 group cursor-pointer w-10 h-10 md:w-auto md:px-4 md:py-2 rounded-full md:rounded transition-colors ${darkMode ? 'hover:bg-stone-800' : 'hover:bg-stone-200'}`} title="Menu">
                            <span className={`hidden md:block text-xs font-bold uppercase tracking-widest group-hover:underline underline-offset-4 ${darkMode ? 'text-stone-200' : 'text-stone-900'}`}>Menu</span>
                            <Menu size={20} strokeWidth={1.5} className={darkMode ? 'text-stone-200' : 'text-stone-900'} />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default ArchitecturalHeader;
