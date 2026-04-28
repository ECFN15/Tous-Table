import { useEffect, useRef } from 'react';
import Lenis from '@studio-freight/lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Smooth scroll hook — instance Lenis UNIQUE pour toute l'app (à monter dans `App.jsx`).
 *
 * Architecture choisie (cf. `_DOCS/AUDITS/scrolllenis.md`) :
 *  - Une seule instance Lenis hoisée au niveau racine → plus de double-instance pendant
 *    la transition Home → Galerie (qui causait des micro-saccades).
 *  - Mode `lerp` (damping exponentiel `1 - exp(-60·lerp·dt)`) → courbe d'easing IDENTIQUE
 *    sur 60 / 120 / 144 / 160 / 180 / 240 Hz. Pas de "fin de courbe" perceptible sur
 *    écran haut-Hz comme avec un `duration` à durée fixe en wall-clock.
 *  - Driver depuis `gsap.ticker` (un seul RAF partagé GSAP+Lenis) :
 *      • `lenis.on('scroll', ScrollTrigger.update)` → ScrollTrigger lit la position
 *        Lenis dans le MÊME tick que l'écriture, drift = 0 ms (vs ~6 ms à 160 Hz avant)
 *      • `gsap.ticker.lagSmoothing(0)` → ScrollTrigger n'avance plus ses tweens "en
 *        rattrapage" lors de drops de frame, ce qui évitait des micro-jumps high-Hz
 *  - `syncTouch: true` (au lieu du déprécié `smoothTouch`) → inertie iOS naturelle.
 *  - `prefers-reduced-motion: reduce` → on n'instancie PAS Lenis (scroll natif).
 *
 * Backward-compat : l'instance reste exposée sur `window.__lenis` (utilisé par
 * `MarketplaceLayout.scrollToCollection`).
 */
export const useLenisScroll = ({ enabled = true } = {}) => {
    const lenisRef = useRef(null);

    useEffect(() => {
        if (!enabled) return;
        if (typeof window === 'undefined') return;
        if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

        // Garde-fou hot-reload (Vite HMR peut ré-exécuter l'effet sans démonter le
        // composant) : on détruit l'éventuelle instance précédente avant d'en créer une.
        if (window.__lenis && typeof window.__lenis.destroy === 'function') {
            window.__lenis.destroy();
        }

        const lenis = new Lenis({
            lerp: 0.1,
            smoothWheel: true,
            wheelMultiplier: 1.05,
            syncTouch: true,
            syncTouchLerp: 0.075,
            touchInertiaMultiplier: 35,
            touchMultiplier: 1.4,
            gestureOrientation: 'vertical',
            autoRaf: false, // on drive depuis gsap.ticker (cf. ci-dessous)
        });

        lenisRef.current = lenis;
        window.__lenis = lenis;

        // === Lockstep avec GSAP ScrollTrigger ===
        // 1) ScrollTrigger update à chaque tick scroll Lenis (avant repaint).
        const onLenisScroll = () => ScrollTrigger.update();
        lenis.on('scroll', onLenisScroll);

        // 2) Lenis driven par gsap.ticker → un seul RAF pour les deux moteurs.
        //    `gsap.ticker` fournit `time` en SECONDES, Lenis veut des MILLISECONDES.
        const tickerCallback = (time) => {
            lenis.raf(time * 1000);
        };
        gsap.ticker.add(tickerCallback);

        // 3) Désactive le lag-smoothing (sinon ScrollTrigger compense les frames
        //    droppés en avançant les anims plus vite → micro-jumps sur high-Hz).
        const previousLagSmoothing = gsap.ticker.lagSmoothing();
        gsap.ticker.lagSmoothing(0);

        return () => {
            // Restaure le lag-smoothing précédent (au cas où une autre partie du
            // code l'aurait configuré à autre chose que les défauts).
            gsap.ticker.lagSmoothing(
                Array.isArray(previousLagSmoothing) ? previousLagSmoothing[0] : 500,
                Array.isArray(previousLagSmoothing) ? previousLagSmoothing[1] : 33
            );
            gsap.ticker.remove(tickerCallback);
            lenis.off('scroll', onLenisScroll);
            lenis.destroy();
            lenisRef.current = null;
            if (window.__lenis === lenis) delete window.__lenis;
        };
    }, [enabled]);

    return lenisRef;
};
