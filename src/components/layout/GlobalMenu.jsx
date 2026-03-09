import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { X, Instagram, Facebook, Mail } from 'lucide-react';

const MenuItemHover = ({ item, index, isClicked, darkMode, handlePremiumClick, isMobile }) => {
    const controls = useAnimation();
    const isHoveredRef = useRef(false);
    const isAnimatingRef = useRef(false);

    // Pour la ligne et le numéro, on utilise un state très léger
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
                    // OPTIMISATION MOBILE : Mode texte simple sans injection de motion physics lourde
                    <span className="flex">{item.label}</span>
                ) : (
                    // DESIGN PREMIUM DESKTOP : Chaque lettre contrôlée indépendamment
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
                                        style={{ willChange: 'transform' }}
                                    >
                                        {char === ' ' ? '\u00A0' : char}
                                    </motion.span>
                                )
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
                                    style={{ willChange: 'transform' }}
                                >
                                    {char === ' ' ? '\u00A0' : char}
                                </motion.span>
                            ))}
                        </span>
                    </>
                )}
            </div>
            <div className={`flex-grow ml-4 mr-3 md:ml-6 md:mr-4 h-[1px] border-b border-dashed origin-left transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] opacity-100 scale-x-100 md:opacity-0 md:scale-x-0 ${isActive ? 'md:opacity-100 md:scale-x-100' : ''} ${darkMode ? 'border-stone-800' : 'border-stone-200'}`}></div>
            <span className={`text-[10px] md:text-xs font-bold tracking-widest opacity-100 translate-x-0 md:opacity-0 md:translate-x-4 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${isActive ? 'md:opacity-100 md:translate-x-0' : ''} ${darkMode ? 'text-amber-500' : 'text-amber-600'}`}>0{index + 1}</span>
        </>
    );

    const className = `group flex items-center justify-between w-full py-2 text-left text-4xl md:text-5xl font-light tracking-tighter cursor-pointer transition-colors duration-500 ${isClicked ? 'text-amber-500' : 'text-stone-400 hover:text-white'}`;

    if (item.href) {
        return (
            <motion.a
                whileTap={{ scale: 0.96, opacity: 0.7 }}
                href={item.href}
                onClick={handlePremiumClick}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className={className}
            >
                {content}
            </motion.a>
        );
    }

    return (
        <motion.button
            whileTap={{ scale: 0.96, opacity: 0.7 }}
            onClick={handlePremiumClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={className}
        >
            {content}
        </motion.button>
    );
};

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

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const menuItems = [
        {
            label: activeDesignId === 'architectural' ? 'Accueil' : 'Accueil.',
            onClick: (e) => {
                if (!e.ctrlKey && !e.metaKey) {
                    e.preventDefault(); window.hasShownPreloader = true; setView('home'); setIsMenuOpen(false); window.scrollTo(0, 0);
                }
            },
            href: '/'
        },
        {
            label: activeDesignId === 'architectural' ? 'La Galerie' : 'Marketplace.',
            onClick: (e) => {
                if (!e.ctrlKey && !e.metaKey) {
                    e.preventDefault(); setView('gallery'); setIsMenuOpen(false); window.scrollTo(0, 0);
                }
            },
            href: '/?page=gallery'
        },
        ...(user && !user.isAnonymous ? [{
            label: activeDesignId === 'architectural' ? 'Commandes' : 'Commandes.',
            onClick: () => { setView('my-orders'); setIsMenuOpen(false); window.scrollTo(0, 0); }
        }] : []),
        ...(isAdmin ? [{
            label: 'Admin.',
            onClick: () => { setView('admin'); setIsMenuOpen(false); window.scrollTo(0, 0); }
        }] : [])
    ];

    return (
        <div className={`fixed inset-0 z-[2000] transition-all duration-300 ${isMenuOpen ? 'visible' : 'invisible pointer-events-none'}`} style={{ transitionDelay: isMenuOpen ? '0ms' : '500ms' }}>
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, transition: { duration: 0.1 } }}
                        transition={{ duration: 0.5 }}
                        // OPTIMISATION MOBILE : on enlève le backdrop-blur sur mobile car c'est un tueur de performances
                        className={`absolute inset-0 bg-stone-900/60 ${!isMobile ? 'backdrop-blur-md' : ''}`}
                        onClick={() => setIsMenuOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* OPTIMISATION PRINCIPALE : remplacement de transition-all par transition-transform pour empêcher le moteur
                de recalculer l'animation de l'ombre portée (shadow-2xl) ultra coûteuse à chaque frame */}
            <div className={`absolute right-0 top-0 bottom-0 w-full md:w-[450px] shadow-2xl transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] p-12 flex flex-col justify-between z-[2001] ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}
              ${activeDesignId === 'architectural'
                    ? (darkMode ? 'bg-[#0A0A0A] border-l border-stone-800 text-stone-200' : 'bg-[#FAFAF9] border-l border-stone-200 text-stone-900')
                    : (darkMode ? 'bg-stone-900 border-l border-stone-800' : 'bg-white')}
            `}
                style={{ transitionDelay: isMenuOpen ? '0ms' : '250ms' }}
            >
                <div className="space-y-20">
                    <div className="flex justify-between items-center">
                        <span className={`text-[10px] font-black uppercase tracking-[0.3em] transition-opacity duration-500 ${isMenuOpen ? 'opacity-100' : 'opacity-0'} ${darkMode ? 'text-stone-500' : 'text-stone-300'}`}>Menu</span>
                        <button onClick={() => setIsMenuOpen(false)} className={`w-12 h-12 rounded-full border flex items-center justify-center transition-colors duration-300 ${darkMode ? 'border-stone-800 text-white hover:bg-stone-800' : 'border-stone-100 hover:bg-stone-50'}`}><X size={20} /></button>
                    </div>
                    <nav className="flex flex-col gap-8">
                        {menuItems.map((item, index, arr) => {
                            const isClicked = clickedMenuItem === index;
                            const isOtherClicked = clickedMenuItem !== null && clickedMenuItem !== index;

                            const handlePremiumClick = (e) => {
                                if (e) e.preventDefault();
                                setClickedMenuItem(index);
                                // Delay the actual navigation to let the premium animation play
                                setTimeout(() => {
                                    item.onClick(e);
                                    setClickedMenuItem(null);
                                }, 500);
                            };

                            const blurInitial = 'blur(8px)';
                            const blurActive = 'blur(0px)';
                            const skewInitial = isMobile ? 0 : -14;
                            const skewExit = isMobile ? 0 : 14;
                            const scaleInitial = isMobile ? 1 : 0.9;

                            // OPTIMISATION GPU MOBILE : on supprime totalement la déclaration "filter" (blur)
                            // du state de motion lorsqu'on est sur mobile.
                            const animateState = isMenuOpen
                                ? {
                                    x: isClicked ? 15 : (isOtherClicked ? -20 : 0),
                                    y: isOtherClicked ? 20 : 0,
                                    opacity: isOtherClicked ? 0 : 1,
                                    scale: isClicked ? 1.05 : 1,
                                    skewX: 0,
                                    rotateZ: 0.01,
                                    ...(!isMobile && { filter: isOtherClicked ? blurInitial : blurActive }),
                                    transition: {
                                        type: 'spring',
                                        stiffness: 250,
                                        damping: 35,
                                        mass: 0.8,
                                        delay: clickedMenuItem !== null ? 0 : (index * 0.1),
                                    }
                                }
                                : {
                                    x: 140,
                                    y: 0,
                                    opacity: 0,
                                    skewX: skewExit,
                                    scale: scaleInitial,
                                    rotateZ: 0.01,
                                    ...(!isMobile && { filter: blurInitial }),
                                    transition: {
                                        type: 'spring',
                                        stiffness: 450,
                                        damping: 30,
                                        mass: 0.7,
                                        delay: clickedMenuItem !== null ? 0 : ((arr.length - 1 - index) * 0.05),
                                    }
                                };

                            return (
                                <motion.div
                                    key={item.label}
                                    initial={{
                                        x: 140,
                                        y: 0,
                                        opacity: 0,
                                        skewX: skewInitial,
                                        scale: scaleInitial,
                                        rotateZ: 0.01,
                                        ...(!isMobile && { filter: blurInitial })
                                    }}
                                    animate={animateState}
                                    style={{
                                        willChange: isMobile ? 'transform, opacity' : 'transform, opacity, filter',
                                        transformOrigin: 'left center',
                                        transform: isMobile ? 'translateZ(0)' : 'none'
                                    }}
                                >
                                    <MenuItemHover
                                        item={item}
                                        index={index}
                                        isClicked={isClicked}
                                        darkMode={darkMode}
                                        handlePremiumClick={handlePremiumClick}
                                        isMobile={isMobile}
                                    />
                                </motion.div>
                            )
                        })}
                    </nav>
                </div>

                <motion.div
                    className={`space-y-6 pt-10 border-t origin-bottom ${darkMode ? 'border-stone-800' : 'border-stone-100'}`}
                    initial={{ y: 20, opacity: 0, scale: 0.95 }}
                    animate={
                        isMenuOpen ? {
                            y: 0,
                            opacity: 1,
                            scale: 1,
                            transition: { type: 'spring', stiffness: 250, damping: 35, mass: 0.8, delay: 0.3 }
                        } : {
                            y: 20,
                            opacity: 0,
                            scale: 0.95,
                            transition: { type: 'spring', stiffness: 450, damping: 30, mass: 0.7, delay: 0 }
                        }
                    }
                    style={{ willChange: 'transform, opacity', transform: 'translateZ(0)' }}
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
                </motion.div>
            </div>
        </div>
    );
};

export default GlobalMenu;
