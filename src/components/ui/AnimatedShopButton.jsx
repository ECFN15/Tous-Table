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
        <div className="relative group p-[1.5px] rounded-full overflow-visible">
            {/* Bordure néon rotative (même style que Mobilier/Planches) */}
            <motion.div
                animate={{ rotate: -360 }}
                transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                className="absolute inset-[-150%] z-0"
                style={{
                    background: "conic-gradient(from 0deg, transparent 30%, rgba(245, 158, 11, 0) 35%, rgba(245, 158, 11, 1) 50%, rgba(245, 158, 11, 0) 65%, transparent 70%)",
                }}
            />

            {/* Bouton principal */}
            <motion.button
                onClick={handleClick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className={`relative z-10 flex items-center gap-2 px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${
                    darkMode
                        ? 'bg-stone-900/90 text-amber-400 hover:text-amber-300'
                        : 'bg-stone-100/90 text-amber-700 hover:text-amber-800'
                }`}
            >
                <ShoppingBag size={14} strokeWidth={2.5} />
                <span>Le Comptoir</span>
            </motion.button>
        </div>
    );
};

export default AnimatedShopButton;
