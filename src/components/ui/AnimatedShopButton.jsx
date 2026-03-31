import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';

/**
 * AnimatedShopButton
 * Bouton "Le Comptoir" animé pour attirer l'attention sur la page Gallery.
 * Utilise le même effet de bordure néon rotative que les boutons Mobilier et Planches.
 */

const AnimatedShopButton = ({ onOpenShop, darkMode }) => {
    const handleClick = () => {
        if (onOpenShop) {
            onOpenShop();
        }
    };

    return (
        // Conteneur global SANS overflow-hidden pour que le badge ne soit pas coupé
        <div className="relative">
            {/* Wrapper néon : padding crée la bordure, overflow-hidden coupe le néon */}
            <div className="relative p-[1.5px] rounded-full overflow-hidden">
                {/* Néon rotatif - plus grand pour éviter les coupures sur les côtés */}
                <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
                    className="absolute inset-[-200%]"
                    style={{
                        background: "conic-gradient(from 0deg, transparent 30%, rgba(245, 158, 11, 0) 35%, rgba(245, 158, 11, 1) 50%, rgba(245, 158, 11, 0) 65%, transparent 70%)",
                    }}
                />

                {/* Bouton interne - même taille que Mobilier/Planches */}
                <motion.button
                    onClick={handleClick}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative z-10 flex items-center gap-2 px-6 py-2.25 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap ${
                        darkMode
                            ? 'bg-stone-900/90 text-amber-400'
                            : 'bg-stone-100/90 text-amber-700'
                    }`}
                >
                    <ShoppingBag size={14} strokeWidth={2.5} />
                    <span>Le Comptoir</span>
                </motion.button>
            </div>

            {/* Badge "New" flottant - à l'EXTÉRIEUR du overflow-hidden pour ne pas être coupé */}
            <motion.div
                className="absolute -top-2.5 md:-top-3.5 -right-2.5 z-20 transform-gpu rotate-[6deg]"
                animate={{ y: [0, -2, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                style={{ willChange: 'transform' }}
            >
                <div
                    className={`inline-flex items-center justify-center min-w-[34px] md:min-w-[36px] h-[18px] md:h-[19px] text-[9px] md:text-[11px] leading-none font-semibold uppercase tracking-[0.07em] px-2 rounded-full shadow-[0_2px_6px_rgba(0,0,0,0.26)] border ${darkMode ? 'bg-amber-300 text-stone-950 border-amber-200/80' : 'bg-amber-600 text-amber-50 border-amber-400/70'}`}
                    style={{
                        WebkitFontSmoothing: 'antialiased',
                        MozOsxFontSmoothing: 'grayscale',
                        textRendering: 'optimizeLegibility',
                        letterSpacing: '0.07em',
                        fontFamily: "'Space Grotesk', 'Plus Jakarta Sans', 'Segoe UI', sans-serif",
                    }}
                >
                    <span className="block leading-none text-center">NEW</span>
                </div>
            </motion.div>
        </div>
    );
};

export default AnimatedShopButton;