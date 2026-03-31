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
                className="absolute -top-1.5 -right-2.5 z-20 transform-gpu rotate-[6deg]"
                animate={{ y: [0, -2, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                style={{ willChange: 'transform' }}
            >
                <div
                    className={`text-[9px] leading-none font-bold uppercase tracking-[0.02em] px-1.5 py-[3px] rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.35)] border ${darkMode ? 'bg-amber-400 text-black border-amber-300/70' : 'bg-amber-700 text-white border-amber-500/70'}`}
                    style={{
                        WebkitFontSmoothing: 'antialiased',
                        MozOsxFontSmoothing: 'grayscale',
                        textRendering: 'optimizeLegibility',
                        letterSpacing: '0.02em',
                    }}
                >
                    <span className="inline-block">NEW</span>
                </div>
            </motion.div>
        </div>
    );
};

export default AnimatedShopButton;