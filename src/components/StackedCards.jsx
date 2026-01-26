import React, { useLayoutEffect, useRef } from 'react';
import { ArrowRight, Hammer } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

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

    useLayoutEffect(() => {
        const cards = cardsRef.current;
        if (!cards || cards.length === 0) return;

        let ctx = null;
        let initialized = false;
        let lastScrollY = window.scrollY;

        // STEP 1: Apply CSS class to ensure ALL cards start SHARP
        // This is done immediately and cannot be overridden by GSAP
        cards.forEach((card) => {
            const visual = card?.querySelector('.card-visual');
            if (visual) {
                visual.style.transform = 'scale(1)';
                visual.style.filter = 'blur(0px)';
                visual.style.transformOrigin = 'center top';
            }
        });

        // CRITICAL: Only initialize ScrollTrigger animations AFTER user starts scrolling
        // This completely prevents any premature progress calculations
        const initializeAnimations = () => {
            if (initialized) return;
            initialized = true;

            // Small delay to ensure scroll direction is established
            requestAnimationFrame(() => {
                ctx = gsap.context(() => {
                    cards.forEach((card, index) => {
                        if (index === 0) return;

                        const prevCard = cards[index - 1];
                        const prevVisual = prevCard?.querySelector('.card-visual');

                        if (prevVisual) {
                            // Ensure starting state is sharp
                            gsap.set(prevVisual, {
                                scale: 1,
                                filter: "blur(0px)",
                                transformOrigin: "center top"
                            });

                            // Create the animation - Paris By Emily style
                            // Cards shrink + move down to create a wheel rotation effect
                            gsap.to(prevVisual, {
                                scale: 0.80,
                                y: 100, // Move down to hide behind current card
                                filter: "blur(8px)",
                                ease: "none",
                                force3D: true, // GPU acceleration for smoother mobile performance
                                scrollTrigger: {
                                    trigger: card,
                                    start: "top 70%",
                                    end: "top 21px",
                                    scrub: 0.5,
                                    invalidateOnRefresh: true,
                                    fastScrollEnd: true, // Optimize for fast scrolling
                                    onLeaveBack: () => {
                                        // Reset to initial state when scrolling back up
                                        gsap.set(prevVisual, {
                                            scale: 1,
                                            y: 0,
                                            filter: "blur(0px)"
                                        });
                                    }
                                }
                            });
                        }
                    });

                    // Last card exit: Progressive width reduction (scaleX) - Paris By Emily style
                    // Effect should be smooth and continue until the card is completely out of view
                    const lastCard = cards[cards.length - 1];
                    const lastVisual = lastCard?.querySelector('.card-visual');
                    const spacer = containerRef.current?.querySelector('.section-spacer');

                    if (lastVisual && spacer) {
                        gsap.to(lastVisual, {
                            scaleX: 0.90, // More noticeable reduction like Paris By Emily
                            scaleY: 0.96, // Slight Y reduction too for depth
                            // NO y movement - last card only shrinks, it doesn't move
                            ease: "none", // Linear for consistent progressive feel
                            force3D: true,
                            scrollTrigger: {
                                trigger: spacer,
                                start: "top 110%", // Start very early
                                end: "top -30%", // Continue well past the spacer for long progressive effect
                                scrub: 1.2, // Very smooth scrub
                                invalidateOnRefresh: true,
                                onLeaveBack: () => {
                                    gsap.set(lastVisual, { scaleX: 1, scaleY: 1 });
                                }
                            }
                        });
                    }
                }, containerRef);

                // Refresh after creation to get correct positions
                ScrollTrigger.refresh();
            });
        };

        // Listen for scroll to initialize - use 'once' pattern
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            // Only init if user is scrolling DOWN (towards the cards)
            if (currentScrollY > lastScrollY) {
                initializeAnimations();
                window.removeEventListener('scroll', handleScroll);
            }
            lastScrollY = currentScrollY;
        };

        // Add scroll listener
        window.addEventListener('scroll', handleScroll, { passive: true });

        // Also initialize on first wheel event (in case scroll doesn't fire)
        const handleWheel = () => {
            // Small delay to let scroll position update
            setTimeout(initializeAnimations, 50);
            window.removeEventListener('wheel', handleWheel);
        };
        window.addEventListener('wheel', handleWheel, { passive: true, once: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('wheel', handleWheel);
            if (ctx) ctx.revert();
        };
    }, []);

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
                            willChange: 'transform', // GPU layer hint
                            transform: 'translate3d(0, 0, 0)', // Force GPU compositing
                            backfaceVisibility: 'hidden', // Prevent flickering
                            WebkitBackfaceVisibility: 'hidden', // Safari support
                        }}
                    >
                        {/* VISUAL CARD - PBE "Magazine" Style */}
                        <div
                            className="card-visual relative w-[90%] md:w-[97%] max-w-[1800px] h-[88vh] md:h-[90vh] bg-[#FAF9F6] rounded-[2.5rem] md:rounded-[4rem] overflow-hidden shadow-[0_20px_70px_rgba(0,0,0,0.15)] flex flex-col items-center"
                            style={{
                                backgroundColor: item.bgColor,
                                transformOrigin: '50% 100%',
                                willChange: 'transform, filter', // GPU acceleration hint
                                contain: 'layout paint' // CSS containment for better isolation
                            }}
                        >
                            {/* 1. IMAGE ZONE (Top ~60% Mobile / ~55% Desktop) */}
                            {/* Adjusted heights to give more room to text on desktop */}
                            <div className="relative w-full h-[58%] md:h-[55%] overflow-hidden">
                                <img
                                    src={item.img}
                                    alt={item.title.join(' ')}
                                    loading="lazy"
                                    decoding="async"
                                    className="w-full h-full object-cover"
                                />
                                {/* Gradient Overlay for legibility */}
                                <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/30 to-transparent opacity-80"></div>

                                {/* PBE Style Badge - RESPONSIVE ADJUSTMENTS */}
                                <div className="absolute bottom-6 md:bottom-8 lg:bottom-10 left-1/2 -translate-x-1/2 bg-[#1a1a1a] text-white px-4 py-2 md:px-5 md:py-2.5 rounded-full shadow-lg z-20 whitespace-nowrap">
                                    <span className="text-[9px] md:text-[10px] lg:text-xs uppercase tracking-[0.2em] font-bold">
                                        {item.subtitle}
                                    </span>
                                </div>
                            </div>

                            {/* 2. TEXT ZONE (Bottom ~40% Mobile / ~45% Desktop) */}
                            {/* Pulled up slightly more on desktop (-mt-16) to overlap image nicely */}
                            <div className="relative z-10 w-full h-[42%] md:h-[45%] flex flex-col items-center justify-start pt-4 md:pt-8 lg:pt-10 px-6 md:px-12 text-center -mt-8 md:-mt-16">

                                {/* Title - RESPONSIVE TYPOGRAPHY (Adjusted max size to avoid overflow) */}
                                <h2 className="font-serif text-[2.5rem] sm:text-5xl md:text-6xl lg:text-7xl xl:text-[5rem] leading-[1.0] md:leading-[0.9] text-[#1a1a1a] mix-blend-multiply mb-3 md:mb-4 lg:mb-6 drop-shadow-sm" style={{ color: item.textColor }}>
                                    {item.title[0]} <br />
                                    <span className="italic font-light">{item.title[1]}</span>
                                </h2>

                                {/* Description - OPTIMIZED MEASURE & POSITION */}
                                {/* MOBILE: mt-auto pushes it down, mb-4 keeps it close to button. DESKTOP: mt-0, mb-auto pushes button to bottom. */}
                                <p className="text-xs sm:text-sm md:text-base lg:text-lg italic font-light max-w-[85%] sm:max-w-md md:max-w-lg lg:max-w-xl leading-relaxed opacity-80 md:opacity-70 mt-auto md:mt-0 mb-4 md:mb-auto" style={{ color: item.textColor }}>
                                    {item.desc}
                                </p>

                                {/* BOUTON MODIFIÉ : RotatingButton + TEXTE - RESPONSIVE SPACING */}
                                {/* MOBILE: mt-0 (gap handled by p mb-4). DESKTOP: keep mt margins. */}
                                <button onClick={onEnterMarketplace} className="flex items-center gap-4 md:gap-5 lg:gap-6 group text-[#1a1a1a] mt-0 md:mt-6 lg:mt-8 mb-6 md:mb-8 flex-shrink-0">
                                    <RotatingButton id={item.id} />
                                    <span className="text-[9px] md:text-[10px] lg:text-[11px] uppercase tracking-[0.3em] md:tracking-[0.4em] lg:tracking-[0.5em] font-medium text-[#1a1a1a]">
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
