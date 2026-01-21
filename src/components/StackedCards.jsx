import React, { useLayoutEffect, useRef } from 'react';
import { ArrowRight, Hammer } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

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
                            y: 60, // Slight upward movement as it shrinks
                            ease: "none", // Linear for consistent progressive feel
                            force3D: true,
                            scrollTrigger: {
                                trigger: spacer,
                                start: "top 110%", // Start very early
                                end: "top -30%", // Continue well past the spacer for long progressive effect
                                scrub: 1.2, // Very smooth scrub
                                invalidateOnRefresh: true,
                                onLeaveBack: () => {
                                    gsap.set(lastVisual, { scaleX: 1, scaleY: 1, y: 0 });
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
        <section className="relative w-full bg-[#E5E5E5] flex flex-col items-center gap-[20px] pt-32 pb-[10vh]" style={{ overflowX: 'clip' }} ref={containerRef}>

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

            {items.map((item, index) => (
                <div
                    key={item.id}
                    ref={el => cardsRef.current[index] = el}
                    // Sticky ~21px
                    className="sticky top-[21px] w-full min-h-[70vh] md:h-screen flex flex-col items-center justify-start pt-0"
                    style={{
                        zIndex: index + 10,
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
                        {/* 1. IMAGE ZONE (Top ~60%) */}
                        <div className="relative w-full h-[58%] md:h-[62%] overflow-hidden">
                            <img
                                src={item.img}
                                alt={item.title.join(' ')}
                                loading="lazy"
                                decoding="async"
                                className="w-full h-full object-cover"
                            />
                            {/* Gradient Overlay for legibility */}
                            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/30 to-transparent opacity-80"></div>

                            {/* PBE Style Badge */}
                            <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 bg-[#1a1a1a] text-white px-5 py-2.5 rounded-full shadow-lg z-20">
                                <span className="text-[10px] md:text-xs uppercase tracking-[0.2em] font-bold">
                                    {item.subtitle}
                                </span>
                            </div>
                        </div>

                        {/* 2. TEXT ZONE (Bottom ~40%) */}
                        <div className="relative z-10 w-full h-[42%] md:h-[38%] flex flex-col items-center justify-start pt-2 md:pt-4 px-6 text-center -mt-8 md:-mt-12">

                            {/* Title */}
                            <h2 className="font-serif text-5xl md:text-7xl lg:text-8xl leading-[0.9] text-[#1a1a1a] mix-blend-multiply mb-5 md:mb-8 drop-shadow-sm" style={{ color: item.textColor }}>
                                {item.title[0]} <br />
                                <span className="italic font-light">{item.title[1]}</span>
                            </h2>

                            {/* Description */}
                            <p className="text-sm md:text-lg italic font-light max-w-sm md:max-w-xl leading-relaxed opacity-70 mb-auto" style={{ color: item.textColor }}>
                                {item.desc}
                            </p>

                            {/* CTA Button */}
                            <button onClick={onEnterMarketplace} className="flex items-center justify-center gap-4 group mb-8 md:mb-10 bg-[#1a1a1a] text-white px-8 py-4 rounded-full hover:scale-105 transition-transform duration-300 shadow-xl">
                                <span className="text-[10px] uppercase tracking-[0.2em] font-bold">
                                    Découvrir la collection
                                </span>
                                <Hammer size={16} className="text-[#9C8268]" />
                            </button>
                        </div>

                        {/* Background Texture - Hidden on mobile for performance */}
                        <div className="hidden md:block absolute inset-0 pointer-events-none opacity-[0.03]"
                            style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}>
                        </div>
                    </div>
                </div>
            ))}

            {/* Minimal spacer - last card scrolls away naturally like Paris By Emily */}
            <div className="section-spacer w-full h-[10vh] bg-[#E5E5E5]"></div>
        </section>
    );
};

export default StackedCards;
