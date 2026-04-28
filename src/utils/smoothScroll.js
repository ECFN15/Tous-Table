const DEFAULT_EASING = (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t));

export const getLenis = () => {
    if (typeof window === 'undefined') return null;
    return window.__lenis || null;
};

export const scrollToTarget = (target, options = {}) => {
    if (typeof window === 'undefined') return;

    const {
        offset = 0,
        duration = 0.95,
        immediate = false,
        easing = DEFAULT_EASING,
        force = true,
    } = options;

    const lenis = getLenis();
    if (lenis && typeof lenis.scrollTo === 'function') {
        lenis.scrollTo(target, {
            offset,
            duration,
            immediate,
            easing,
            force,
        });
        return;
    }

    if (typeof target === 'number') {
        window.scrollTo({
            top: target,
            behavior: immediate ? 'auto' : 'smooth',
        });
        return;
    }

    const element = typeof target === 'string'
        ? document.querySelector(target)
        : target;

    if (!element) return;
    const top = element.getBoundingClientRect().top + window.scrollY + offset;
    window.scrollTo({
        top,
        behavior: immediate ? 'auto' : 'smooth',
    });
};

export const scrollToTop = (options = {}) => {
    scrollToTarget(0, { immediate: true, duration: 0, ...options });
};

export const lockLenis = () => {
    if (typeof window === 'undefined') return () => {};

    window.__lenisLockCount = (window.__lenisLockCount || 0) + 1;
    getLenis()?.stop?.();

    let released = false;
    return () => {
        if (released) return;
        released = true;
        window.__lenisLockCount = Math.max((window.__lenisLockCount || 1) - 1, 0);
        if (window.__lenisLockCount === 0) {
            getLenis()?.start?.();
        }
    };
};
