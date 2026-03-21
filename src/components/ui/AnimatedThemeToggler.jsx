
import React, { useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { flushSync } from 'react-dom';

/**
 * AnimatedThemeToggler (Inspired by Magic UI)
 * Uses Framer Motion for icon transition + View Transitions API for circular clip reveal.
 */
export function AnimatedThemeToggler({ isDark, toggleTheme }) {
    const buttonRef = useRef(null);

    const handleToggle = async () => {
        // Fallback for browsers not supporting View Transitions
        if (!document.startViewTransition) {
            toggleTheme();
            return;
        }

        const button = buttonRef.current;
        const rect = button.getBoundingClientRect();

        // Calculate the center of the button relative to the viewport
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;

        // Calculate the radius needed to cover the furthest corner of the screen
        const endRadius = Math.hypot(
            Math.max(x, window.innerWidth - x),
            Math.max(y, window.innerHeight - y)
        );

        // 1. Démarrer la transition "snapshot"
        const transition = document.startViewTransition(() => {
            // 2. Mettre à jour le DOM (changer le thème) de manière synchrone
            flushSync(() => {
                toggleTheme();
            });
        });

        // 3. Attendre que le navigateur soit prêt à animer
        await transition.ready;

        // 4. Définir le cercle clip-path (du centre vers l'extérieur)
        const clipPath = [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`
        ];

        // SIMPLIFICATION : Que l'on passe de Light->Dark ou Dark->Light,
        // On fait TOUJOURS agrandir le NOUVEAU calque (::view-transition-new) par-dessus l'ancien.
        // Comme on a forcé z-index: 9999 dans index.css, le nouveau thème va toujours recouvrir l'ancien.

        document.documentElement.animate(
            {
                clipPath: clipPath, // Toujours : Petit -> Grand
            },
            {
                duration: 700, // Retour au tempo original (plus majestueux)
                easing: "ease-in-out",
                pseudoElement: "::view-transition-new(root)", // C'est toujours le NOUVEAU qui grandit
            }
        );
    };

    return (
        <button
            ref={buttonRef}
            onClick={handleToggle}
            className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-colors z-[100] bg-transparent 
                ${isDark ? 'text-stone-200 hover:text-amber-400' : 'text-stone-900 hover:text-amber-600'}`}
            style={{ WebkitTapHighlightColor: 'transparent' }} // Remove mobile tap highlight
            aria-label={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
        >
            {/* 
                AnimatePresence mode="popLayout" allows the new element to animate in WHILE the old one is animating out.
                This removes the delay! 
            */}
            <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                    key={isDark ? 'dark' : 'light'}
                    initial={{ y: -20, opacity: 0, rotate: -90, scale: 0.5 }}
                    animate={{ y: 0, opacity: 1, rotate: 0, scale: 1 }}
                    exit={{ y: 20, opacity: 0, rotate: 90, scale: 0.5, transition: { duration: 0.15 } }} // SORTIE DOUCE (0.15s)
                    transition={{ duration: 0.25, type: "spring", stiffness: 150, damping: 15 }} // ENTRÉE MAJESTUEUSE (Plus lente)
                    className="absolute inset-0 flex items-center justify-center"
                >
                    {isDark ? (
                        <Moon className="w-5 h-5" strokeWidth={1.5} />
                    ) : (
                        <Sun className="w-5 h-5" strokeWidth={1.5} />
                    )}
                </motion.div>
            </AnimatePresence>
        </button>
    );
}

export default AnimatedThemeToggler;
