import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';

/**
 * AnimatedShopButton
 * Bouton "Le Comptoir" animé pour attirer l'attention sur la page Gallery.
 * 
 * Animations :
 * - Halo pulsante ambrée autour du bouton
 * - Effet shimmer qui traverse périodiquement
 * - Badge "Nouveau" avec rebond doux
 * - Animation se déclenche au montage avec un délai
 */

const AnimatedShopButton = ({ onOpenShop, darkMode }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [showBadge, setShowBadge] = useState(false);

    useEffect(() => {
        // Délai initial avant le premier lancement
        const startTimer = setTimeout(() => {
            setIsVisible(true);
            setShowBadge(true);
        }, 1500);

        return () => clearTimeout(startTimer);
    }, []);

    // Disparaît après 8 secondes si pas cliqué, réapparaît après 20 secondes
    useEffect(() => {
        if (!isVisible) return;

        const hideTimer = setTimeout(() => {
            setIsVisible(false);
            setShowBadge(false);
        }, 8000);

        const showAgainTimer = setTimeout(() => {
            setIsVisible(true);
            setShowBadge(true);
        }, 28000);

        return () => {
            clearTimeout(hideTimer);
            clearTimeout(showAgainTimer);
        };
    }, [isVisible]);

    const handleClick = () => {
        if (onOpenShop) {
            onOpenShop();
            setIsVisible(false);
            setShowBadge(false);
        }
    };

    return (
        <AnimatePresence>
            {isVisible && onOpenShop && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: -10 }}
                    transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                        duration: 0.5
                    }}
                    className="relative"
                >
                    {/* Halo pulsante extérieure */}
                    <motion.div
                        className="absolute inset-0 rounded-full"
                        animate={{
                            boxShadow: darkMode
                                ? [
                                    "0 0 0 0px rgba(245, 158, 11, 0)",
                                    "0 0 20px 6px rgba(245, 158, 11, 0.4)",
                                    "0 0 0 0px rgba(245, 158, 11, 0)"
                                  ]
                                : [
                                    "0 0 0 0px rgba(180, 83, 9, 0)",
                                    "0 0 20px 6px rgba(180, 83, 9, 0.3)",
                                    "0 0 0 0px rgba(180, 83, 9, 0)"
                                  ],
                            scale: [1, 1.1, 1]
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />

                    {/* Effet shimmer qui traverse le bouton */}
                    <div className="absolute inset-0 overflow-hidden rounded-full z-10">
                        <motion.div
                            className="absolute top-0 -left-full w-full h-full"
                            style={{
                                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                                width: "50%"
                            }}
                            animate={{
                                left: ["-50%", "150%"]
                            }}
                            transition={{
                                duration: 1.2,
                                repeat: Infinity,
                                repeatDelay: 3,
                                ease: "easeInOut"
                            }}
                        />
                    </div>

                    {/* Badge "Nouveau" avec rebond */}
                    <AnimatePresence>
                        {showBadge && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0, y: -5 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 400,
                                    damping: 15,
                                    delay: 0.3
                                }}
                                className="absolute -top-2 -right-2 z-20"
                            >
                                <motion.div
                                    animate={{
                                        y: [0, -3, 0]
                                    }}
                                    transition={{
                                        duration: 1.5,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                    className={`text-[7px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-lg ${
                                        darkMode
                                            ? 'bg-amber-500 text-black'
                                            : 'bg-amber-700 text-white'
                                    }`}
                                >
                                    Nouveau
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Bouton principal */}
                    <motion.button
                        onClick={handleClick}
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.95 }}
                        className={`relative z-10 flex items-center gap-2 px-6 py-2.25 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${
                            darkMode
                                ? 'bg-stone-900/90 text-amber-400 border border-amber-700/50 hover:text-amber-300 hover:border-amber-500/70'
                                : 'bg-stone-100/90 text-amber-700 border-2 border-amber-600/40 hover:text-amber-800 hover:border-amber-700/60'
                        }`}
                    >
                        <motion.div
                            animate={{
                                rotate: [0, 10, -5, 0]
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                repeatDelay: 4,
                                ease: "easeInOut"
                            }}
                        >
                            <ShoppingBag size={14} strokeWidth={2.5} />
                        </motion.div>
                        Le Comptoir
                    </motion.button>
                </motion.div>
            )}

            {/* Bouton normal quand pas d'animation */}
            {(!isVisible || !onOpenShop) && onOpenShop && (
                <button
                    onClick={onOpenShop}
                    className={`relative z-10 flex items-center gap-2 px-6 py-2.25 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${
                        darkMode
                            ? 'bg-stone-900/90 text-stone-300 border border-stone-700 hover:text-amber-400'
                            : 'bg-stone-100/90 text-stone-500 border border-stone-200 hover:text-amber-700'
                    }`}
                >
                    <ShoppingBag size={14} strokeWidth={2.5} />
                    Le Comptoir
                </button>
            )}
