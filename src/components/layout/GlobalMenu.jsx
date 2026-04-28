import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { X, Menu, Instagram, Facebook, Mail, Plus } from 'lucide-react';
import { scrollToTop } from '../../utils/smoothScroll';

// ── Courbes d'easing (approximation fidèle des springs Framer Motion) ──
// Open spring (stiffness:250, damping:35, mass:0.8) → ζ≈1.24 overdamped → pas d'oscillation
// Close spring (stiffness:450, damping:30, mass:0.7) → ζ≈0.85 underdamped → ~4% overshoot
const EASE_OPEN = 'cubic-bezier(0.23,1,0.32,1)';
const EASE_CLOSE = 'cubic-bezier(0.12,0.8,0.3,1)';

// ── MenuItemHover ──
// Seul composant qui garde Framer Motion (motion.span) pour le hover par lettres sur desktop.
// Le tap feedback est désormais en CSS :active (compositor) au lieu de whileTap (main thread).
const MenuItemHover = React.memo(({ item, index, isClicked, darkMode, handlePremiumClick, isMobile }) => {
    const controls = useAnimation();
    const isHoveredRef = useRef(false);
    const isAnimatingRef = useRef(false);
    const [isActive, setIsActive] = useState(false);

    const handleMouseEnter = () => {
        if (isMobile) return;
        isHoveredRef.current = true;
        setIsActive(true);
        if (!isAnimatingRef.current) {
            isAnimatingRef.current = true;
            controls.start("hover");
        }
    };

    const handleMouseLeave = () => {
        if (isMobile) return;
        isHoveredRef.current = false;
        if (!isAnimatingRef.current) {
            controls.start("initial");
            setIsActive(false);
        }
    };

    const content = (
        <>
            <div className="relative flex overflow-hidden whitespace-nowrap">
                {isMobile ? (
                    <span className="flex">{item.label}</span>
                ) : (
                    <>
                        <span className="flex">
                            {item.label.split('').map((char, i) => {
                                const isLast = i === item.label.length - 1;
                                return (
                                    <motion.span
                                        key={i}
                                        variants={{
                                            initial: { y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1], delay: i * 0.01 } },
                                            hover: { y: '-100%', transition: { duration: 0.4, ease: [0.19, 1, 0.22, 1], delay: i * 0.015 } }
                                        }}
                                        initial="initial"
                                        animate={controls}
                                        onAnimationComplete={(def) => {
                                            if (isLast && def === "hover") {
                                                isAnimatingRef.current = false;
                                                if (!isHoveredRef.current) {
                                                    controls.start("initial");
                                                    setIsActive(false);
                                                }
                                            }
                                        }}
                                        // Le will-change est géré dynamiquement par Framer Motion. 
                                        // Le retirer du repos libère 80+ calques VRAM inutiles.
                                    >
                                        {char === ' ' ? '\u00A0' : char}
                                    </motion.span>
                                );
                            })}
                        </span>
                        <span className={`absolute inset-0 flex ${darkMode ? 'text-white' : 'text-stone-900'}`}>
                            {item.label.split('').map((char, i) => (
                                <motion.span
                                    key={i}
                                    variants={{
                                        initial: { y: '100%', transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1], delay: i * 0.01 } },
                                        hover: { y: 0, transition: { duration: 0.4, ease: [0.19, 1, 0.22, 1], delay: i * 0.015 } }
                                    }}
                                    initial="initial"
                                    animate={controls}
                                >
                                    {char === ' ' ? '\u00A0' : char}
                                </motion.span>
                            ))}
                        </span>
                    </>
                )}
            </div>
            <div className={`flex-grow ml-4 mr-3 md:ml-6 md:mr-4 h-[1px] border-b border-dashed origin-left transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] opacity-100 scale-x-100 md:opacity-0 md:scale-x-0 ${isActive ? 'md:opacity-100 md:scale-x-100' : ''} ${darkMode ? 'border-stone-800' : 'border-stone-200'}`}></div>
            <span className={`text-[10px] md:text-xs font-bold tracking-widest opacity-100 translate-x-0 md:opacity-0 md:translate-x-4 transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${isActive ? 'md:opacity-100 md:translate-x-0' : ''} ${darkMode ? 'text-amber-500' : 'text-amber-600'}`}>0{index + 1}</span>
        </>
    );

    // active:scale-[0.96] + active:opacity-70 = CSS :active pseudo-class → compositor thread
    // Remplace whileTap de Framer Motion qui tournait sur le main thread (RAF JS)
    const className = `group flex items-center justify-between w-full py-2 text-left text-4xl md:text-5xl font-light tracking-tighter cursor-pointer active:scale-[0.96] active:opacity-70 ${isClicked ? 'text-amber-500' : 'text-stone-400 hover:text-white'}`;

    const tapStyle = { transition: 'color 500ms ease, transform 150ms ease-out, opacity 150ms ease-out' };

    if (item.href) {
        return (
            <a
                href={item.href}
                onClick={handlePremiumClick}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className={className}
                style={tapStyle}
            >
                {content}
            </a>
        );
    }

    return (
        <button
            onClick={handlePremiumClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={className}
            style={tapStyle}
        >
            {content}
        </button>
    );
});

// ── GlobalMenu ──
// ARCHITECTURE PERF : Toutes les animations ouverture/fermeture/clic utilisent
// des CSS transitions (compositor thread = refresh rate natif de l'écran).
// Framer Motion n'est conservé QUE pour le hover par lettres desktop (motion.span).
const GlobalMenu = ({
    isMenuOpen,
    setIsMenuOpen,
    setView,
    user,
    isAdmin,
    darkMode,
    activeDesignId,
    contactInfo
}) => {
    const [clickedMenuItem, setClickedMenuItem] = useState(null);
    const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 1024 : false);
    // Empêche l'animation de fermeture au premier rendu (le panel est déjà fermé)
    const [transitionsReady, setTransitionsReady] = useState(false);

    useEffect(() => { setTransitionsReady(true); }, []);
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // PERF: mémoïsé — recalculé uniquement si auth/design change
    const menuItems = useMemo(() => [
        {
            label: activeDesignId === 'architectural' ? 'Accueil' : 'Accueil.',
            onClick: (e) => {
                if (!e.ctrlKey && !e.metaKey) {
                    e.preventDefault(); window.hasShownPreloader = true; setView('home'); setIsMenuOpen(false); scrollToTop();
                }
            },
            href: '/'
        },
        {
            label: activeDesignId === 'architectural' ? 'La Galerie' : 'Marketplace.',
            onClick: (e) => {
                if (!e.ctrlKey && !e.metaKey) {
                    e.preventDefault(); setView('gallery'); setIsMenuOpen(false); scrollToTop();
                }
            },
            href: '/?page=gallery'
        },
        {
            label: "Le Comptoir",
            onClick: (e) => {
                if (!e.ctrlKey && !e.metaKey) {
                    e.preventDefault(); setView('shop'); setIsMenuOpen(false); scrollToTop();
                }
            },
            href: '/?page=shop'
        },
        ...(user && !user.isAnonymous ? [{
            label: activeDesignId === 'architectural' ? 'Commandes' : 'Commandes.',
            onClick: () => { setView('my-orders'); setIsMenuOpen(false); scrollToTop(); }
        }] : []),
        ...(isAdmin ? [{
            label: 'Admin.',
            onClick: () => { setView('admin'); setIsMenuOpen(false); scrollToTop(); }
        }] : [])
    ], [activeDesignId, user?.uid, user?.isAnonymous, isAdmin, setView, setIsMenuOpen]);

    // PERF: références stables → React.memo de MenuItemHover filtre effectivement
    const premiumClickHandlers = useMemo(() =>
        menuItems.map((item, index) => (e) => {
            if (e) e.preventDefault();
            setClickedMenuItem(index);
            setTimeout(() => { item.onClick(e); setClickedMenuItem(null); }, 500);
        }),
        [menuItems]
    );

    // ── Helper: style compositor pour chaque item du menu ──
    // Retourne un objet style 100% CSS transitions (zéro JS par frame)
    const getItemStyle = (index, total, isClicked) => {
        const animProps = isMobile ? ['transform', 'opacity'] : ['transform', 'opacity', 'filter'];
        const buildTransition = (duration, ease, delay = 0) =>
            animProps.map(p => `${p} ${duration}ms ${ease} ${delay}ms`).join(', ');

        // ▸ Feedback clic (immédiat, pas de stagger)
        if (clickedMenuItem !== null) {
            if (isClicked) return {
                transform: isMobile ? 'translate3d(15px,0,0)' : 'translate3d(15px,0,0) scale(1.05) rotateZ(0.01deg)',
                opacity: 1,
                // On utilise 0.01px au lieu de 0px pour forcer le navigateur
                // à garder le pipeline shader actif en cache vidéo (évite le stutter)
                ...(!isMobile && { filter: 'blur(0.01px)' }),
                transition: buildTransition(300, EASE_OPEN),
            };
            return {
                transform: isMobile ? 'translate3d(-20px,20px,0)' : 'translate3d(-20px,20px,0) rotateZ(0.01deg)',
                opacity: 0,
                ...(!isMobile && { filter: 'blur(8px)' }),
                transition: buildTransition(300, EASE_OPEN),
            };
        }

        // ▸ Ouvert (stagger progressif)
        if (isMenuOpen) return {
            transform: isMobile ? 'translate3d(0,0,0)' : 'translate3d(0,0,0) skewX(0deg) scale(1) rotateZ(0.01deg)',
            opacity: 1,
            ...(!isMobile && { filter: 'blur(0.01px)' }), // Cache Shader actif
            transition: buildTransition(650, EASE_OPEN, index * 100),
        };

        // ▸ Fermé (stagger inversé)
        return {
            transform: isMobile ? 'translate3d(140px,0,0)' : 'translate3d(140px,0,0) skewX(14deg) scale(0.9) rotateZ(0.01deg)',
            opacity: 0,
            ...(!isMobile && { filter: 'blur(8px)' }),
            transition: transitionsReady ? buildTransition(500, EASE_CLOSE, (total - 1 - index) * 50) : 'none',
        };
    };

    return (
        <div className={`fixed inset-0 z-[2000] ${isMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
            {/* Backdrop — CSS transition (compositor thread) au lieu de Framer Motion (main thread RAF) */}
            <div
                className={`absolute inset-0 bg-stone-900/60 ${!isMobile ? 'backdrop-blur-md' : ''} ${isMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
                style={{
                    opacity: isMenuOpen ? 1 : 0,
                    transition: 'opacity 500ms ease',
                    willChange: 'opacity',
                    transform: 'translateZ(0)', // Force GPU layer optimal
                }}
                onClick={() => setIsMenuOpen(false)}
            />

            {/* Panel — GPU pre-promoted : translate3d + will-change permanent
                Le compositing layer est créé AVANT l'animation → zéro jank premier frame */}
            <div className={`absolute right-0 top-0 bottom-0 w-full md:w-[450px] shadow-2xl
                pt-[max(1.5rem,calc(env(safe-area-inset-top,0px)+1.5rem))] px-8 md:px-12 pb-12 md:pb-12 md:pt-[28px]
                flex flex-col justify-between z-[2001]
              ${activeDesignId === 'architectural'
                  ? (darkMode ? 'bg-[#0A0A0A] text-stone-200' : 'bg-[#FAFAF9] text-stone-900')
                  : (darkMode ? 'bg-stone-900' : 'bg-white')}
            `}
                style={{
                    transform: isMenuOpen ? 'translate3d(0,0,0)' : 'translate3d(100%,0,0)',
                    transition: `transform 700ms ${EASE_OPEN}`,
                    transitionDelay: isMenuOpen ? '0ms' : '250ms',
                    willChange: 'transform',
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    contain: 'content', // Isolate layout et rendering du document (crucial pour 144Hz)
                }}
            >
                <div className="space-y-20">
                    <div className="flex justify-between items-center h-10 relative">
                        <span className={`text-[10px] font-black uppercase tracking-[0.3em] transition-opacity duration-500 ${isMenuOpen ? 'opacity-100' : 'opacity-0'} ${darkMode ? 'text-stone-500' : 'text-stone-300'}`}>Menu</span>
                        
                        {/* Animated Close Button - Hamburger morphing to Cross */}
                        <div className="absolute -right-2 flex items-center justify-center">
                            <button 
                                onClick={(e) => {
                                    setIsMenuOpen(false);
                                }} 
                                className={`flex items-center justify-center group w-10 h-10 rounded-full cursor-pointer transition-colors`}
                                title="Fermer le menu"
                            >
                                <Menu size={24} strokeWidth={1} className={`absolute transition-all duration-500 ease-in-out ${darkMode ? 'text-stone-200 group-hover:text-amber-400' : 'text-stone-900 group-hover:text-amber-600'} ${isMenuOpen ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'} delay-100`} />
                                <X size={24} strokeWidth={1} className={`absolute transition-all duration-500 ease-in-out ${darkMode ? 'text-stone-200 group-hover:text-amber-400' : 'text-stone-900 group-hover:text-amber-600'} ${isMenuOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'} delay-100`} />
                            </button>
                        </div>
                    </div>
                    <nav className="flex flex-col gap-8">
                        {menuItems.map((item, index, arr) => {
                            const isClicked = clickedMenuItem === index;
                            return (
                                <div
                                    key={item.label}
                                    style={{
                                        ...getItemStyle(index, arr.length, isClicked),
                                        willChange: isMobile ? 'transform, opacity' : 'transform, opacity, filter',
                                        transformOrigin: 'left center',
                                    }}
                                >
                                    <MenuItemHover
                                        item={item}
                                        index={index}
                                        isClicked={isClicked}
                                        darkMode={darkMode}
                                        handlePremiumClick={premiumClickHandlers[index]}
                                        isMobile={isMobile}
                                    />
                                </div>
                            );
                        })}
                    </nav>
                </div>

                {/* Footer — CSS transition (compositor thread) */}
                <div
                    className={`space-y-6 pt-10 border-t origin-bottom ${darkMode ? 'border-stone-800' : 'border-stone-100'}`}
                    style={{
                        transform: isMenuOpen ? 'translate3d(0,0,0) scale(1)' : 'translate3d(0,20px,0) scale(0.95)',
                        opacity: isMenuOpen ? 1 : 0,
                        transition: isMenuOpen
                            ? `transform 650ms ${EASE_OPEN} 300ms, opacity 650ms ${EASE_OPEN} 300ms`
                            : `transform 400ms ${EASE_CLOSE}, opacity 400ms ${EASE_CLOSE}`,
                        willChange: 'transform, opacity',
                    }}
                >
                    {user && !user.isAnonymous && (
                        <div className="mb-4">
                            <p className={`text-xs font-bold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-stone-900'}`}>
                                {user.email || user.displayName}
                                {user.emailVerified && <span className="text-blue-500 text-[10px] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">Vérifié</span>}
                            </p>
                            <p className={`text-[10px] uppercase tracking-widest ${darkMode ? 'text-stone-500' : 'text-stone-400'}`}>Connecté</p>
                        </div>
                    )}
                    <div className="flex gap-4 sm:gap-6">
                        {contactInfo?.instagram && (
                            <a
                                href={contactInfo.instagram}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-300 ${darkMode ? 'bg-stone-800 text-white hover:bg-stone-700' : 'bg-stone-50 hover:bg-stone-900 hover:text-white'}`}
                            >
                                <Instagram size={20} />
                            </a>
                        )}
                        {contactInfo?.facebook && (
                            <a href={contactInfo.facebook} target="_blank" rel="noopener noreferrer" className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-300 ${darkMode ? 'bg-stone-800 text-white hover:bg-stone-700' : 'bg-stone-50 hover:bg-stone-900 hover:text-white'}`}>
                                <Facebook size={20} />
                            </a>
                        )}
                        <a href={`mailto:${contactInfo?.email}`} className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-300 ${darkMode ? 'bg-stone-800 text-white hover:bg-stone-700' : 'bg-stone-50 hover:bg-stone-900 hover:text-white'}`}>
                            <Mail size={20} />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GlobalMenu;
