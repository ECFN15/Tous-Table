import { useEffect, useRef } from 'react';
import Lenis from '@studio-freight/lenis';

/**
 * Smooth scroll hook built on Lenis 1.0.42.
 *
 * Frame-rate independent on 60/120/144/180/240Hz: uses `lerp` exponential damping
 * (1 - exp(-60·lerp·dt)) instead of fixed-duration easing, so the same easing curve
 * runs identically on any refresh rate.
 *
 * Mobile: `syncTouch` smooths native touch frame-by-frame while preserving
 * inertia ("flick to scroll").
 *
 * Disabled when the user has prefers-reduced-motion. Exposes the active instance
 * on `window.__lenis` so other components (e.g. anchor scrollers) can call
 * `window.__lenis.scrollTo(...)`.
 */
export const useLenisScroll = ({ enabled = true } = {}) => {
    const lenisRef = useRef(null);

    useEffect(() => {
        if (!enabled) return;
        if (typeof window === 'undefined') return;
        if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

        const lenis = new Lenis({
            lerp: 0.1,
            smoothWheel: true,
            wheelMultiplier: 1,
            syncTouch: true,
            syncTouchLerp: 0.075,
            touchInertiaMultiplier: 35,
            touchMultiplier: 1.4,
            gestureOrientation: 'vertical',
        });

        lenisRef.current = lenis;
        window.__lenis = lenis;

        let rafId = 0;
        const raf = (time) => {
            lenis.raf(time);
            rafId = requestAnimationFrame(raf);
        };
        rafId = requestAnimationFrame(raf);

        return () => {
            cancelAnimationFrame(rafId);
            lenis.destroy();
            lenisRef.current = null;
            if (window.__lenis === lenis) delete window.__lenis;
        };
    }, [enabled]);

    return lenisRef;
};
