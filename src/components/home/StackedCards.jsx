import React, { useRef } from 'react';
import { Hammer } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';

// --- COMPOSANT : BOUTON DÉCOUVRIR ---
const RotatingButton = ({ id }) => {
    const pathId = `btnPath-${id}`;
    return (
        <div className="relative w-16 h-16 md:w-24 md:h-24 flex items-center justify-center select-none group-hover:scale-110 transition-transform duration-500">
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
            <div className="absolute inset-0 flex items-center justify-center">
                <Hammer size={20} className="text-[#1a1a1a] md:w-6 md:h-6" strokeWidth={1.5} />
            </div>
        </div>
    );
};

// --- SOUS-COMPOSANT : CARTE PARALLAX (Flux Naturel) ---
const ParallaxCard = ({ item, index, onEnterMarketplace }) => {
    const containerRef = useRef(null);

    // Track scroll progress of this specific card relative to the window
    // 'start end': When TOP of card enters BOTTOM of viewport
    // 'end start': When BOTTOM of card leaves TOP of viewport
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start end', 'end start']
    });

    // RESPONSIVE LOGIC (UX Best Practice)
    // Desktop: Needs stability. Animation starts late (0.75).
    // Mobile: Needs flow. Animation starts early (0.25) to feel "alive" under the thumb.

    const [isMobile, setIsMobile] = React.useState(false);

    React.useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // 2. EXIT ANIMATION (Conditional)
    const scaleStart = isMobile ? 0.25 : 0.75;
    const opacityStart = isMobile ? 0.85 : 0.95;

    const scale = useTransform(scrollYProgress, [scaleStart, 1], [1, isMobile ? 0.88 : 0.92]);
    const opacity = useTransform(scrollYProgress, [opacityStart, 1], [1, 0]);
    // const blur = useTransform(scrollYProgress, [0.8, 1], ['0px', '5px']); // Optional

    return (
        <motion.div
            ref={containerRef}
            className="group w-full flex flex-col items-center justify-start sticky-substitute"
            style={{
                scale,
                opacity,
                // filter: blur,
                marginBottom: '-5vh', // Slight overlap for continuity - Stack effect without sticky
                zIndex: index
            }}
        >
            <div
                className="card-visual relative w-[90%] md:w-[97%] max-w-[1800px] h-[80vh] md:h-[88vh] bg-[#FAF9F6] rounded-[2.5rem] md:rounded-[4rem] overflow-hidden shadow-[0_20px_70px_rgba(0,0,0,0.15)] flex flex-col items-center"
                style={{
                    backgroundColor: item.bgColor,
                    willChange: 'transform', // Hint for browser
                    transform: 'translateZ(0)', // Force GPU
                }}
            >
                {/* 1. IMAGE ZONE (STATIC - NO PARALLAX) */}
                <div className="relative w-full h-[58%] md:h-[55%] bg-gray-200">
                    <div
                        className="w-full h-full"
                    >
                        <picture className="w-full h-full block">
                            <source media="(max-width: 767px)" srcSet={item.imgMobile} />
                            <img
                                src={item.img}
                                alt={item.title.join(' ')}
                                loading="eager"
                                decoding="async"
                                className="w-full h-full object-cover"
                            />
                        </picture>
                    </div>

                    {/* Gradient Overlay - Fixed to the frame bottom */}
                    <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/40 to-transparent pointer-events-none"></div>

                    {/* Badge - Mobile & Desktop: Straddle the line (match -mt-6 / -mt-12) */}
                    <div className="absolute bottom-6 translate-y-1/2 md:bottom-12 md:translate-y-1/2 left-1/2 -translate-x-1/2 flex items-center justify-center bg-[#1a1a1a] text-white px-5 py-2.5 md:px-6 md:py-3 rounded-full shadow-2xl z-20 whitespace-nowrap overflow-hidden">
                        <span className="text-[10px] md:text-[11px] lg:text-xs uppercase tracking-[0.3em] font-bold leading-none translate-y-[0.5px]">
                            {item.subtitle}
                        </span>
                    </div>
                </div>

                {/* 2. TEXT ZONE */}
                <div className="relative z-10 w-full flex-1 flex flex-col items-center justify-between pt-6 pb-8 px-4 md:px-12 text-center -mt-6 md:-mt-12 bg-[#FAF9F6]">

                    {/* 1. TITLES (Top) */}
                    <div className="w-full">
                        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-[1.1] text-[#1a1a1a] mix-blend-multiply drop-shadow-sm transition-all duration-300" style={{ color: item.textColor }}>
                            {item.title[0]}
                            {(item.showTitle2 !== false && item.title[1]) && (
                                <>
                                    <br />
                                    <span className="italic font-light text-[0.6em] opacity-80 block mt-1">{item.title[1]}</span>
                                </>
                            )}
                        </h2>
                    </div>

                    {/* 2. DESCRIPTION (Center) */}
                    <div className="w-full py-4 md:py-6">
                        <div className="mx-auto max-w-[90%] sm:max-w-md md:max-w-lg">
                            <p className="text-[9px] sm:text-[10px] md:text-xs uppercase tracking-[0.15em] font-light opacity-70 leading-relaxed" style={{ color: item.textColor }}>
                                {item.desc}
                            </p>
                        </div>
                    </div>

                    {/* 3. ACTION BUTTON (Bottom - Always Visible) */}
                    <div className="w-full flex justify-center pb-2">
                        <button onClick={onEnterMarketplace} className="flex items-center gap-4 md:gap-5 group text-[#1a1a1a]">
                            <RotatingButton id={item.id} />
                            <span className="text-[10px] md:text-xs uppercase tracking-[0.4em] font-medium text-[#1a1a1a]">
                                Découvrir la Galerie
                            </span>
                        </button>
                    </div>
                </div>

                {/* Background Texture */}
                <div className="hidden md:block absolute inset-0 pointer-events-none opacity-[0.03]"
                    style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}>
                </div>
            </div>
        </motion.div>
    );
};

const StackedCards = ({ items, onEnterMarketplace }) => {
    return (
        <section className="featured-section relative w-full bg-[#E5E5E5] flex flex-col items-center gap-0 pt-32 pb-[10vh]" style={{ overflowX: 'clip' }}>

            {/* MARQUEE */}
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

            {/* FLUX DE CARTES (No Sticky) - Just Gap */}
            <div className="w-full flex flex-col items-center gap-[5vh] md:gap-[10vh] pb-24">
                {items.map((item, index) => (
                    <ParallaxCard
                        key={item.id}
                        item={item}
                        index={index}
                        onEnterMarketplace={onEnterMarketplace}
                    />
                ))}
            </div>

            {/* No extra spacer needed, flex gap handles it */}
        </section>
    );
};

export default StackedCards;
