import { useEffect, useRef } from 'react';
import Lenis from '@studio-freight/lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const destroyExistingLenis = () => {
    if (typeof window === 'undefined') return;
    if (typeof window.__lenisCleanup === 'function') {
        window.__lenisCleanup();
        window.__lenisCleanup = null;
        return;
    }
    if (window.__lenis && typeof window.__lenis.destroy === 'function') {
        window.__lenis.destroy();
        delete window.__lenis;
    }
};

/**
 * Détecte un environnement tactile (téléphone / tablette).
 * Couvre iOS, Android, iPadOS 13+ (qui se déclare MacIntel avec maxTouchPoints>1).
 *
 * Sur mobile, le scroll natif (iOS WebKit momentum, Chrome Android scroll) est
 * désormais de très haute qualité. Lenis y ajoute un RAF continu + des scroll
 * events JS qui combattent React (re-renders du header au scroll) → stutter.
 * Décision (cf. AGENTS.md 29 avr. 2026 audit complet) :
 * Lenis = DESKTOP UNIQUEMENT.
 */
const isTouchDevice = () => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
    // 1. Media query pointer:coarse → couvre quasi tous les mobiles & tablettes.
    if (window.matchMedia?.('(pointer: coarse)').matches) return true;
    // 2. Fallback UA pour anciens navigateurs / iPadOS desktop-mode.
    const ua = navigator.userAgent || '';
    if (/iPad|iPhone|iPod|Android/i.test(ua)) return true;
    if (navigator.platform === 'MacIntel' && (navigator.maxTouchPoints || 0) > 1) return true;
    return false;
};

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

        // === Lenis DESKTOP UNIQUEMENT (cf. audit 29 avr. 2026) ===
        // Sur mobile, on laisse 100% le scroll natif :
        //  - iOS : momentum WebKit excellent, jamais battu par du JS.
        //  - Android : Chrome scroll natif très bon en 2024+, Lenis ajoutait du jank.
        // Cela libère aussi le RAF Lenis + évite les conflits avec les setState
        // déclenchés par les listeners scroll (header, etc.).
        // ScrollTrigger fonctionne sans Lenis : il écoute les scroll events natifs.
        if (isTouchDevice()) {
            return;
        }

        // Garde-fou hot-reload (Vite HMR peut ré-exécuter l'effet sans démonter le
        // composant) : on détruit l'éventuelle instance précédente avant d'en créer une.
        destroyExistingLenis();

        const lenis = new Lenis({
            lerp: 0.1,
            smoothWheel: true,
            wheelMultiplier: 1.05,
            // Touch settings non utilisés (mobile = early return ci-dessus).
            syncTouch: false,
            gestureOrientation: 'vertical',
            autoRaf: false, // on drive depuis gsap.ticker (cf. ci-dessous)
            autoResize: true,
        });

        lenisRef.current = lenis;
        window.__lenis = lenis;
        if (window.__lenisLockCount > 0) {
            lenis.stop?.();
        }

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
        gsap.ticker.lagSmoothing(0);

        const cleanup = () => {
            // Restaure le lag-smoothing précédent (au cas où une autre partie du
            // code l'aurait configuré à autre chose que les défauts).
            gsap.ticker.lagSmoothing(500, 33);
            gsap.ticker.remove(tickerCallback);
            lenis.off('scroll', onLenisScroll);
            lenis.destroy();
            lenisRef.current = null;
            if (window.__lenis === lenis) delete window.__lenis;
            if (window.__lenisCleanup === cleanup) window.__lenisCleanup = null;
        };

        window.__lenisCleanup = cleanup;

        return () => {
            cleanup();
        };
    }, [enabled]);

    return lenisRef;
};
