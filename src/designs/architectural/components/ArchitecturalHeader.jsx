import { useLiveTheme } from '../../../hooks/useLiveTheme';
import { Menu, ShoppingBag, ShieldCheck, Sun, Moon } from 'lucide-react';

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
    wishlistCount = 0,
    toggleTheme,
    darkMode // Explicit prop
}) => {
    // Optional props destructuring with defaults
    const { activeCollection, setActiveCollection } = headerProps || {};
    // Check if mode is forced (we need to pass current darkmode state to hook if we want it to react, 
    // but here we just need to know if it is forced. We can pass a dummy or read from localStorage if needed, 
    // but cleaner to just trust the hook default or pass it via props. 
    // Since we don't receive darkMode boolean here, we'll let useLiveTheme resolve it or rely on parent.
    // Actually, forcedMode comes from Firestore.
    const { forcedMode } = useLiveTheme();

    // We only show toggle if mode is NOT forced
    const showToggle = forcedMode !== 'light' && forcedMode !== 'dark';
    // We need to know current state for the icon. Since we don't have 'darkMode' prop here (oops, missed it in drilling),
    // we can check document class or localStorage. Or better, just fix the drilling in next step if needed. 
    // Let's assume standard Tailwind 'dark' class presence for icon state.
    const isDark = darkMode;

    return (
        <header className={`sticky top-0 z-[100] backdrop-blur-md transition-colors duration-500 ${darkMode ? 'bg-[#0A0A0A]/95' : 'bg-[#FAFAF9]/95'}`}>
            <div className="max-w-[1920px] mx-auto px-6 md:px-12 h-20 flex items-center justify-between">

                {/* 1. LEFT: LOGO & TABS */}
                <div className="flex items-center gap-8">
                    {/* MINI LOGO TEXT */}
                    <div className="flex flex-col leading-none cursor-pointer group" onClick={() => window.location.href = '/'}>
                        <span className={`font-black uppercase text-sm tracking-widest transition-colors ${darkMode ? 'text-stone-200 group-hover:text-stone-400' : 'text-stone-900 group-hover:text-stone-600'}`}>Tous à Table</span>
                        <span className={`font-serif italic text-[10px] ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>Atelier Normand</span>
                    </div>



                    {/* COLLECTION TABS (Only show if activeCollection is managed, e.g. on Gallery) */}
                    {setActiveCollection && (
                        <nav className="hidden md:flex items-center gap-1">
                            <button
                                onClick={() => setActiveCollection('furniture')}
                                className={`px-4 py-1.5 rounded text-[11px] font-bold uppercase tracking-widest transition-all ${activeCollection === 'furniture' ? (darkMode ? 'bg-stone-800 text-white' : 'bg-stone-200 text-black') : (darkMode ? 'text-stone-400 hover:text-stone-300' : 'text-stone-400 hover:text-stone-600')}`}
                            >
                                Mobilier
                            </button>
                            <button
                                onClick={() => setActiveCollection('cutting_boards')}
                                className={`px-4 py-1.5 rounded text-[11px] font-bold uppercase tracking-widest transition-all ${activeCollection === 'cutting_boards' ? (darkMode ? 'bg-stone-800 text-white' : 'bg-stone-200 text-black') : (darkMode ? 'text-stone-400 hover:text-stone-300' : 'text-stone-400 hover:text-stone-600')}`}
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

                        {/* DARK MODE TOGGLE (Only if Auto) */}
                        {showToggle && toggleTheme && (
                            <button
                                onClick={toggleTheme}
                                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-stone-100 dark:hover:bg-stone-800 transition-all text-stone-400 hover:text-amber-500"
                                title="Changer de thème"
                            >
                                {isDark ? <Sun size={18} strokeWidth={1.5} /> : <Moon size={18} strokeWidth={1.5} />}
                            </button>
                        )}

                        {/* LOGIN BUTTON */}
                        {(!user || user.isAnonymous) ? (
                            <button onClick={onShowLogin} className={`hidden md:flex items-center gap-2 px-4 py-1.5 rounded border transition-all group ${darkMode ? 'border-stone-800 hover:bg-stone-800' : 'border-stone-200 hover:bg-stone-200'}`}>
                                <ShieldCheck size={14} className={`group-hover:text-amber-500 transition-colors ${darkMode ? 'text-stone-400' : 'text-stone-400'}`} />
                                <span className={`text-[10px] font-bold uppercase tracking-widest group-hover:text-stone-900 dark:group-hover:text-stone-200 ${darkMode ? 'text-stone-500' : 'text-stone-500'}`}>Connexion</span>
                            </button>
                        ) : (
                            <div className="hidden md:flex items-center gap-2 px-4 py-1.5">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Connecté</span>
                            </div>
                        )}

                        <button onClick={onOpenCart} className={`relative group p-2 rounded transition-colors ${darkMode ? 'hover:bg-stone-800' : 'hover:bg-stone-200'}`} title="Panier">
                            <ShoppingBag size={20} strokeWidth={1.5} className={`group-hover:scale-110 transition-transform ${darkMode ? 'text-stone-200' : 'text-stone-900'}`} />
                            {wishlistCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-black"></span>}
                        </button>

                        <button onClick={onOpenMenu} className={`flex items-center gap-2 group cursor-pointer px-3 py-1.5 rounded transition-colors ${darkMode ? 'hover:bg-stone-800' : 'hover:bg-stone-200'}`} title="Menu">
                            <span className={`hidden md:block text-[10px] font-bold uppercase tracking-widest group-hover:underline underline-offset-4 ${darkMode ? 'text-stone-200' : 'text-stone-900'}`}>Menu</span>
                            <Menu size={20} strokeWidth={1.5} className={darkMode ? 'text-stone-200' : 'text-stone-900'} />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default ArchitecturalHeader;
