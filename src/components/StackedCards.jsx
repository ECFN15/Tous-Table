import React, { useLayoutEffect, useRef, useMemo } from 'react';
import { ArrowRight, Hammer } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// --- iOS DETECTION ---
// iOS Safari has unique scroll physics (rubber-banding, momentum) that conflict
// with GSAP's scrub interpolation and expensive filter animations.
const getIsIOS = () => {
    if (typeof navigator === 'undefined') return false;
    return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

// --- COMPOSANT : BOUTON DÉCOUVRIR (MARTEAU FLOTTANT SANS FOND) ---
const RotatingButton = ({ id }) => {
    const pathId = `btnPath-${id}`;
    return (
        <div className="relative w-16 h-16 md:w-24 md:h-24 flex items-center justify-center select-none group-hover:scale-110 transition-transform duration-500">
            {/* Texte rotatif */}
            <div className="absolute inset-0 animate-spin-slow">
                <svg width="100%" height="100%" viewBox="0 0 100 100">
                    <defs>
                        <path id={pathId} d="M 50, 50 m -34, 0 a 34,34 0 1,1 68,0 a 34,34 0 1,1 -68,0" fill="transparent" />
                    </defs>
                    <text className="text-[10px] uppercase font-bold tracking-[0.25em] fill-current text-[#1a1a1a]">
                        <textPath xlinkHref={`#${pathId}`} startOffset="0%">
                            TOUS À TABLE • TOUS À TABLE •
                        </textPath>
                    </text>
                </svg>
            </div>

            {/* Marteau Central - SANS CERCLE BLANC */}
            <div className="absolute inset-0 flex items-center justify-center">
                <Hammer size={20} className="text-[#1a1a1a] md:w-6 md:h-6" strokeWidth={1.5} />
            </div>
        </div>
    );
};

const StackedCards = ({ items, onEnterMarketplace }) => {
    const containerRef = useRef(null);
    const cardsRef = useRef([]);
    const isIOS = useMemo(() => getIsIOS(), []);

    useLayoutEffect(() => {
        const cards = cardsRef.current;
        if (!cards || cards.length === 0) return;

        let ctx;

        // --- iOS-SAFE ANIMATION VALUES ---
        // iOS Safari cannot handle filter:blur() during scrub without jittering.
        // We replace blur with opacity fade (GPU-composited, zero repaints).
        // scrub:true (1:1 mapping) instead of 0.5 avoids fighting iOS momentum physics.
        const scrubValue = isIOS ? true : 0.5;
        const exitScrubValue = isIOS ? true : 1.2;

        const initGSAP = () => {
            if (ctx) ctx.revert(); // Cleanup if existing (e.g. resize)

            ctx = gsap.context(() => {
                // STEP 1: RESET ALL CARDS TO CLEAN SLATE
                cards.forEach((card) => {
                    const visual = card?.querySelector('.card-visual');
                    if (visual) {
                        gsap.set(visual, {
                            scale: 1,
                            y: 0,
                            opacity: 1,
                            ...(isIOS ? {} : { filter: "blur(0px)" }),
                            transformOrigin: 'center top',
                            force3D: true,
                            clearProps: "all"
                        });
                    }
                });

                // STEP 2: SETUP ANIMATIONS
                cards.forEach((card, index) => {
                    if (index === 0) return;

                    const prevCard = cards[index - 1];
                    const prevVisual = prevCard?.querySelector('.card-visual');

                    if (prevVisual) {
                        // iOS: Use opacity instead of blur (blur causes per-frame repaint jitter)
                        // Desktop/Android: Keep the premium blur effect
                        const animProps = isIOS
                            ? { scale: 0.80, y: 0, opacity: 0.4 }
                            : { scale: 0.80, y: 0, filter: "blur(8px)" };

                        const resetProps = isIOS
                            ? { scale: 1, y: 0, opacity: 1 }
                            : { scale: 1, y: 0, filter: "blur(0px)" };

                        gsap.to(prevVisual, {
                            ...animProps,
                            ease: "none",
                            force3D: true,
                            scrollTrigger: {
                                trigger: card,
                                start: "top 70%",
                                end: "top 21px",
                                scrub: scrubValue,
                                invalidateOnRefresh: true,
                                fastScrollEnd: true,
                                refreshPriority: -1, // Refresh AFTER pinned sections (Process horizontal scroll)
                                onLeaveBack: () => {
                                    gsap.set(prevVisual, resetProps);
                                }
                            }
                        });
                    }
                });

                // Last card exit animation
                const lastCard = cards[cards.length - 1];
                const lastVisual = lastCard?.querySelector('.card-visual');
                const spacer = containerRef.current?.querySelector('.section-spacer');

                if (lastVisual && spacer) {
                    gsap.to(lastVisual, {
                        scaleX: 0.90,
                        scaleY: 0.96,
                        ease: "none",
                        force3D: true,
                        scrollTrigger: {
                            trigger: spacer,
                            start: "top 110%",
                            end: "top -30%",
                            scrub: exitScrubValue,
                            invalidateOnRefresh: true,
                            refreshPriority: -1, // Refresh AFTER pinned sections
                            onLeaveBack: () => {
                                gsap.set(lastVisual, { scaleX: 1, scaleY: 1 });
                            }
                        }
                    });
                }
            }, containerRef);

            ScrollTrigger.refresh();
        };

        // RUN INIT:
        // 1. Immediately
        initGSAP();

        // 2. On Window Load (Critical)
        const onWindowLoad = () => {
            initGSAP();
        };

        if (document.readyState === 'complete') {
            onWindowLoad();
        } else {
            window.addEventListener('load', onWindowLoad);
        }

        // 3. SAFETY REFRESH PATTERN (La solution "Vraie")
        // Force ScrollTrigger to re-calculate periodically during the first few seconds
        // This fixes the "Desktop First Load" bug where layout isn't fully stable yet
        const refreshTimers = [100, 500, 1000, 2000].map(delay =>
            setTimeout(() => ScrollTrigger.refresh(), delay)
        );

        // 4. RESIZE OBSERVER (Pour le redimensionnement dynamique)
        // If the container size changes (images loading, etc.), refresh triggers
        // iOS FIX: Throttle to prevent firing during address bar hide/show
        let resizeDebounceTimer;
        const resizeObserver = new ResizeObserver(() => {
            clearTimeout(resizeDebounceTimer);
            resizeDebounceTimer = setTimeout(() => {
                ScrollTrigger.refresh();
            }, isIOS ? 300 : 100); // Longer debounce on iOS to avoid mid-scroll refresh
        });

        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        // 5. WINDOW RESIZE HANDLER (Re-init on viewport width change)
        // When crossing breakpoints (e.g. 2xl at 1536px), the page layout changes
        // and trigger positions need full recalculation
        let lastWidth = window.innerWidth;
        let resizeTimer;
        const handleWindowResize = () => {
            const newWidth = window.innerWidth;
            if (Math.abs(newWidth - lastWidth) > 20) {
                lastWidth = newWidth;
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(() => initGSAP(), 300);
            }
        };
        window.addEventListener('resize', handleWindowResize);

        return () => {
            window.removeEventListener('load', onWindowLoad);
            window.removeEventListener('resize', handleWindowResize);
            clearTimeout(resizeTimer);
            clearTimeout(resizeDebounceTimer);
            refreshTimers.forEach(t => clearTimeout(t));
            resizeObserver.disconnect();
            if (ctx) ctx.revert();
        };
    }, [isIOS]);

    return (
        // Layout Action 1: pt-32 (Large top padding)
        <section className="featured-section relative w-full bg-[#E5E5E5] flex flex-col items-center gap-[20px] pt-32 pb-[10vh]" style={{ overflowX: 'clip' }} ref={containerRef}>

            {/* MARQUEE */}
            {/* Layout Action 2: mb-2 (Marquee glued to first card) */}
            <div className="w-full py-6 border-b border-[#1a1a1a]/10 mb-2 overflow-hidden">
                <div className="whitespace-nowrap flex animate-marquee">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="flex items-center gap-12 mx-6">
                            <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] text-[#1a1a1a]">
                                Découvrez notre collection
                            </span>
                            <span className="w-2 h-2 rounded-full bg-[#9C8268]"></span>
                        </div>
                    ))}
                </div>
            </div>

            {items.map((item, index) => {
                const isLastCard = index === items.length - 1;
                return (
                    <div
                        key={item.id}
                        ref={el => cardsRef.current[index] = el}
                        // Last card: top far away so it never "sticks" - flows smoothly
                        // Other cards: sticky at 21px from top
                        className={`sticky ${isLastCard ? 'top-[-100vh]' : 'top-[21px]'} w-full min-h-[70vh] flex flex-col items-center justify-start pt-0`}
                        style={{
                            zIndex: index + 10,
                            // iOS FIX: Minimal GPU hints to avoid WebKit compositor conflicts with sticky
                            ...(isIOS ? {
                                WebkitTransform: 'translate3d(0, 0, 0)',
                                WebkitBackfaceVisibility: 'hidden',
                            } : {
                                willChange: 'transform',
                                transform: 'translate3d(0, 0, 0)',
                                backfaceVisibility: 'hidden',
                                WebkitBackfaceVisibility: 'hidden',
                            }),
                        }}
                    >
                        {/* VISUAL CARD - PBE "Magazine" Style */}
                        <div
                            className="card-visual relative w-[90%] md:w-[97%] max-w-[1800px] h-[88vh] md:h-[88vh] bg-[#FAF9F6] rounded-[2.5rem] md:rounded-[4rem] overflow-hidden shadow-[0_20px_70px_rgba(0,0,0,0.15)] flex flex-col items-center"
                            style={{
                                backgroundColor: item.bgColor,
                                transformOrigin: '50% 100%',
                                // iOS FIX: Remove willChange:'filter' and contain:'layout paint'
                                // These cause WebKit to create conflicting compositing layers with sticky
                                ...(isIOS ? {
                                    WebkitTransform: 'translateZ(0)',
                                } : {
                                    willChange: 'transform, filter',
                                    contain: 'layout paint',
                                }),
                            }}
                        >
                            {/* 1. IMAGE ZONE (Top ~60% Mobile / ~55% Desktop) */}
                            {/* Adjusted heights to give more room to text on desktop */}
                            <div className="relative w-full h-[58%] md:h-[55%] overflow-hidden">
                                <picture className="w-full h-full">
                                    <source media="(max-width: 767px)" srcSet={item.imgMobile} />
                                    <img
                                        src={item.img}
                                        alt={item.title.join(' ')}
                                        loading="eager"
                                        decoding="async"
                                        className="w-full h-full object-cover will-change-transform"
                                    />
                                </picture>
                                {/* Gradient Overlay for legibility */}
                                <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/30 to-transparent opacity-80"></div>

                                {/* PBE Style Badge - PERFECT CENTERING FIX */}
                                <div className="absolute bottom-6 md:bottom-8 lg:bottom-10 left-1/2 -translate-x-1/2 flex items-center justify-center bg-[#1a1a1a] text-white px-5 py-2.5 md:px-6 md:py-3 rounded-full shadow-2xl z-20 whitespace-nowrap overflow-hidden">
                                    <span className="text-[10px] md:text-[11px] lg:text-xs uppercase tracking-[0.3em] font-bold leading-none translate-y-[0.5px]">
                                        {item.subtitle}
                                    </span>
                                </div>
                            </div>

                            {/* 2. TEXT ZONE (Bottom ~40% Mobile / ~45% Desktop) */}
                            {/* Symmetric distribution: Title at top, Desc in middle (auto margins), Button at bottom */}
                            <div className="relative z-10 w-full h-[42%] md:h-[45%] flex flex-col items-center justify-start pt-6 md:pt-8 lg:pt-10 px-6 md:px-12 text-center -mt-8 md:-mt-16">

                                {/* Title - RESPONSIVE TYPOGRAPHY */}
                                <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl leading-[1.1] md:leading-[0.9] text-[#1a1a1a] mix-blend-multiply mb-4 md:mb-6 drop-shadow-sm" style={{ color: item.textColor }}>
                                    {item.title[0]}
                                    {item.title[1] && (
                                        <>
                                            <br />
                                            <span className="italic font-light text-[0.8em]">{item.title[1]}</span>
                                        </>
                                    )}
                                </h2>

                                {/* Description - Centering with mt-auto/mb-auto to occupy space symmetrically */}
                                <p className="text-[10px] md:text-xs lg:text-sm uppercase tracking-[0.25em] font-light max-w-[85%] sm:max-w-md md:max-w-lg lg:max-w-xl leading-relaxed opacity-60 md:opacity-50 mt-auto mb-auto" style={{ color: item.textColor }}>
                                    {item.desc}
                                </p>

                                {/* BOUTON FIXE EN BAS */}
                                <button onClick={onEnterMarketplace} className="flex items-center gap-4 md:gap-5 lg:gap-6 group text-[#1a1a1a] mt-0 md:mt-8 mb-8 md:mb-8 flex-shrink-0">
                                    <RotatingButton id={item.id} />
                                    <span className="text-[10px] md:text-xs uppercase tracking-[0.4em] font-medium text-[#1a1a1a]">
                                        Découvrir la Galerie
                                    </span>
                                </button>
                            </div>

                            {/* Background Texture - Hidden on mobile for performance */}
                            <div className="hidden md:block absolute inset-0 pointer-events-none opacity-[0.03]"
                                style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}>
                            </div>
                        </div>
                    </div>
                )
            })}


            {/* Minimal spacer for ScrollTrigger detection - invisible */}
            <div className="section-spacer w-full h-0"></div>
        </section>
    );
};

export default StackedCards;
