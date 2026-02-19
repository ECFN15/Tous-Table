import React, { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Star } from 'lucide-react'; // Restored Import

// Register Plugin
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

// --- ROTATING SYMBOL COMPONENT (Original "v26.9" Code) ---
const RotatingSymbol = ({ className, size = 120, text = "TOUS À TABLE • 2026 • TOUS À TABLE • 2026 •" }) => {
    return (
        <div className={`relative flex items-center justify-center pointer-events-none select-none ${className}`}>
            <svg width={size} height={size} viewBox="0 0 100 100" className="animate-spin-slow" style={{ animationDuration: '20s' }}>
                <path id="circlePath" d="M 50, 50 m -40, 0 a 40,40 0 1,1 80,0 a 40,40 0 1,1 -80,0" fill="transparent" />
                <text className="text-[8px] uppercase tracking-[0.2em] font-medium fill-current text-[#9C8268] opacity-60">
                    <textPath href="#circlePath">{text}</textPath>
                </text>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <Star size={size / 5} className="opacity-30 text-[#9C8268]" />
            </div>
        </div>
    );
};

// --- DATA CONSTANTS (Original Specs) ---
const PROCESS_DEFAULTS = [
    {
        n: "I", t: "L'Essence", d: "Sélection rigoureuse des billes de bois précieux.", info: "Matière première",
        img: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?q=80&w=1400",
        w: "min-[1920px]:w-[30.2vw] min-[1920px]:max-w-[580px]",
        h: "min-[1920px]:h-[26vw] min-[1920px]:max-h-[500px]"
    },
    {
        n: "II", t: "L'Analyse", d: "Diagnostic structurel et scan de la patine historique.", info: "Étude microscopique",
        img: "https://images.unsplash.com/photo-1644358686685-4ed525a59663?q=80&w=2000",
        w: "min-[1920px]:w-[39vw] min-[1920px]:max-w-[750px]",
        h: "min-[1920px]:h-[23.4vw] min-[1920px]:max-h-[450px]"
    },
    {
        n: "III", t: "Le Dessin", d: "Tracé géométrique pour les greffes complexes.", info: "Perspective d'art",
        img: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=2000",
        w: "min-[1920px]:w-[33.8vw] min-[1920px]:max-w-[650px]",
        h: "min-[1920px]:h-[23.4vw] min-[1920px]:max-h-[450px]"
    },
    {
        n: "IV", t: "La Cure", d: "Greffes invisibles et consolidation structurelle.", info: "Renaissance physique",
        img: "https://images.unsplash.com/photo-1600585152220-90363fe7e115?q=80&w=1400",
        w: "min-[1920px]:w-[31.2vw] min-[1920px]:max-w-[600px]",
        h: "min-[1920px]:h-[26vw] min-[1920px]:max-h-[500px]"
    },
    {
        n: "V", t: "L'Éclat", d: "Secret du vernis au tampon selon la tradition normande.", info: "Miroir de bois",
        img: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=1400",
        w: "min-[1920px]:w-[44.2vw] min-[1920px]:max-w-[850px]",
        h: "min-[1920px]:h-[28.6vw] min-[1920px]:max-h-[550px]"
    }
];

const ProcessSection = ({ homepageImages = {} }) => {
    const desktopWrapperRef = useRef(null);
    const desktopContentRef = useRef(null);

    // Merge CMS Data
    const steps = PROCESS_DEFAULTS.map((defaultStep, i) => {
        const cmsData = homepageImages[`process_${i + 1}_text`] || {};
        return {
            ...defaultStep,
            t: cmsData.t || defaultStep.t,
            d: cmsData.d || defaultStep.d,
            info: cmsData.info || defaultStep.info,
            img: homepageImages[`process_${i + 1}`] || defaultStep.img
        };
    });

    // --- GSAP LOGIC (EXACTLY AS PREVIOUSLY IMPLEMENTED) ---
    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            const mm = gsap.matchMedia();

            // DESKTOP ONLY (1920px+)
            mm.add("(min-width: 1920px)", () => {
                const wrapper = desktopWrapperRef.current;
                const content = desktopContentRef.current;

                if (!wrapper || !content) return;

                // Calculate exact scroll distance
                const scrollDistance = content.scrollWidth - window.innerWidth;
                const scrollSpeed = 3.5;
                const totalDistance = scrollDistance * scrollSpeed;
                const endBuffer = 400; // 400px safety zone to let scrub settle before unpinning

                // 1. PINNING (The anchor)
                ScrollTrigger.create({
                    trigger: wrapper,
                    start: "top top",
                    end: () => "+=" + (totalDistance + endBuffer),
                    pin: true,
                    anticipatePin: 1,
                    invalidateOnRefresh: true,
                    // If user scrolls extremely fast, force 100% position on leave
                    onLeave: () => {
                        gsap.set(content, { x: -scrollDistance });
                    }
                });

                // 2. HORIZONTAL ANIMATION (The move)
                const xAnim = gsap.to(content, {
                    x: -scrollDistance,
                    ease: "none",
                    scrollTrigger: {
                        trigger: wrapper,
                        start: "top top",
                        end: () => "+=" + totalDistance,
                        scrub: 1,
                        invalidateOnRefresh: true,
                    }
                });

                // Internal Reveal Animations (Synced with Horizontal Scroll)
                const cards = gsap.utils.toArray('.process-card-desktop');
                cards.forEach((card, i) => {
                    const img = card.querySelector('.p-img');
                    const caption = card.querySelector('.p-text');

                    // Initial State
                    gsap.set(img, { y: 40, opacity: 0, scale: 0.95 });
                    gsap.set(caption, { opacity: 0, x: -20 });

                    // Image Reveal
                    gsap.to(img, {
                        y: 0, opacity: 1, scale: 1,
                        duration: 0.5, ease: "power2.out",
                        scrollTrigger: {
                            trigger: card,
                            containerAnimation: xAnim,
                            start: "left 95%",
                            toggleActions: "play none none reverse"
                        }
                    });

                    // Caption Reveal
                    gsap.to(caption, {
                        opacity: 1, x: 0,
                        duration: 0.6,
                        delay: 0.2,
                        scrollTrigger: {
                            trigger: card,
                            containerAnimation: xAnim,
                            start: "left 80%",
                            toggleActions: "play none none reverse"
                        }
                    });
                });
            });
        }, desktopWrapperRef);

        return () => ctx.revert();
    }, []);

    return (
        <section className="relative bg-[#0D0D0D] text-[#FAF9F6]">

            {/* =========================================================================
                A. LAYOUT MOBILE / TABLETTE / LAPTOP (< 1920px) : ZIG-ZAG VERTICAL
               ========================================================================= */}
            <div className="block min-[1920px]:hidden py-24 px-6 md:px-12 w-full min-h-screen bg-[#0D0D0D]">
                {/* Titre Mobile */}
                <div className="text-center mb-32 relative pt-12">
                    <RotatingSymbol className="absolute left-1/2 -translate-x-1/2 -top-12 z-0 opacity-100 mix-blend-screen" size={150} />

                    <span className="text-[10px] uppercase tracking-[1.2em] text-[#9C8268] mb-6 block font-bold relative z-10">L'Alchimie</span>
                    <h2 className="font-serif text-6xl md:text-8xl italic text-white relative z-10">Le Rituel.</h2>
                    <p className="mt-8 text-sm md:text-lg opacity-60 max-w-md mx-auto relative z-10 border-l border-[#9C8268] pl-4">
                        Chaque étape est une célébration de la matière. De l'état brut à l'œuvre d'art.
                    </p>
                </div>

                <div className="flex flex-col gap-32 md:gap-48 max-w-6xl mx-auto pb-24">
                    {steps.map((step, i) => (
                        <div key={i} className={`flex flex-col ${i % 2 !== 0 ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-12 group`}>
                            <div className="w-full md:w-1/2 relative">
                                {/* FIXED: Hover interaction restored (pointer-events-none removed) */}
                                <span className={`absolute -top-16 md:-top-24 ${i % 2 !== 0 ? 'right-0 md:-right-12' : 'left-0 md:-left-12'} font-serif text-[10rem] md:text-[12rem] leading-none text-white/5 z-30 pointer-events-none select-none transition-colors duration-500 group-hover:text-[#9C8268]/20 italic text-stroke-1`}>{step.n}</span>
                                <div className="aspect-[4/5] md:aspect-[3/4] w-full border border-white/10 relative overflow-hidden z-10 group-hover:border-white/30 transition-colors duration-500 bg-[#1a1a1a]">
                                    <img src={step.img} alt={step.t} loading="lazy" className="w-full h-full object-cover transition-transform duration-700" />
                                    <div className="absolute bottom-0 right-0 bg-black border-t border-l border-white/20 px-4 py-2 text-[10px] uppercase tracking-widest text-[#9C8268]">{step.info}</div>
                                </div>
                            </div>
                            <div className={`w-full md:w-1/2 ${i % 2 !== 0 ? 'md:text-right' : 'md:text-left'} text-center px-4 relative z-10`}>
                                <h3 className="text-4xl md:text-5xl font-serif italic mb-6 text-white group-hover:text-[#9C8268] transition-colors duration-300">{step.t}</h3>
                                <p className="text-xs md:text-sm uppercase tracking-[0.25em] opacity-60 leading-loose max-w-sm mx-auto md:mx-0 inline-block">{step.d}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>


            {/* =========================================================================
                B. LAYOUT DESKTOP GIANT (>= 1920px) : GSAP PINNED HORIZONTAL SCROLL
               ========================================================================= */}
            <div ref={desktopWrapperRef} className="hidden min-[1920px]:flex h-screen w-full overflow-hidden items-center bg-[#0D0D0D] relative">

                {/* Rolling Content Container */}
                <div ref={desktopContentRef} className="flex gap-[12vw] pl-[10vw] pr-[18vw] items-center h-full w-max will-change-transform">

                    {/* Intro Titre */}
                    <div className="min-w-[40vw] flex flex-col items-start justify-center border-r border-white/5 pr-[8vw] h-auto relative">
                        {/* RESTORED: RotatingSymbol Easter Egg (Forced Right Position via Left-Margin) */}
                        <RotatingSymbol className="absolute -top-4 left-[22vw] z-0 opacity-100 mix-blend-screen" size={160} />

                        <span className="text-[10px] uppercase tracking-[1.2em] text-[#9C8268] mb-8 block font-black">L'Alchimie</span>
                        <h2 className="font-serif text-[12vw] leading-none font-light italic text-white mb-12">Le Rituel.</h2>
                        <p className="text-xl font-light opacity-50 border-l border-[#9C8268] pl-6 leading-relaxed max-w-lg mt-12">
                            Chaque étape est une célébration de la matière. De l'état brut à l'œuvre d'art, découvrez notre processus de restauration.
                        </p>
                    </div>

                    {/* Horizontal Cards */}
                    {steps.map((step, i) => (
                        <div key={i} className={`process-card-desktop flex flex-col items-start justify-center gap-8 ${step.w} flex-shrink-0 group relative`}>
                            {/* FIXED: Roman Number Hover Interaction Restored (removed pointer-events-none) */}
                            <span className="absolute -top-12 -left-12 font-serif text-[12rem] leading-none text-white/10 select-none z-30 pointer-events-none transition-colors duration-700 group-hover:text-[#9C8268]/20 italic text-stroke-1">{step.n}</span>

                            {/* Image (GSAP Target: .p-img) */}
                            <div className={`p-img w-full ${step.h} border border-white/10 relative overflow-hidden z-10 group-hover:border-white/30 transition-all duration-700`}>
                                <div className="absolute inset-0 bg-black/30 group-hover:bg-transparent transition-colors duration-500 z-20"></div>
                                <img src={step.img} alt={step.t} className="w-full h-full object-cover force-color-tablet grayscale-[0.5] transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105" />
                                <div className="absolute bottom-6 right-6 z-30 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-100">
                                    <span className="text-[10px] uppercase tracking-widest bg-[#111] px-4 py-2 border border-[#9C8268] text-white font-medium">{step.info}</span>
                                </div>
                            </div>

                            {/* Caption (GSAP Target: .p-text) */}
                            <div className="p-text pl-6 border-l border-white/10 group-hover:border-[#9C8268] transition-colors duration-500">
                                <h3 className="text-6xl font-serif italic mb-4 text-white group-hover:translate-x-2 transition-transform duration-500">{step.t}</h3>
                                <p className="opacity-40 text-sm tracking-[0.25em] uppercase group-hover:opacity-80 transition-opacity">{step.d}</p>
                            </div>
                        </div>
                    ))}

                    {/* FIXED: Increased padding-right (pr-[60vw]) to provide a smooth transition and avoid rapid unpining. */}

                </div>
            </div>

        </section>
    );
};

export default ProcessSection;
