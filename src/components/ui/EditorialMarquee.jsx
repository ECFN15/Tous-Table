import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useScroll, useVelocity, useAnimationFrame } from 'framer-motion';

const MarqueeRow = ({ items = [], color, direction = 'left', baseSpeed = 1, className = "", zIndex = 1, style = {} }) => {
    const contentRef = useRef(null);
    const { scrollY } = useScroll();
    const scrollVelocity = useVelocity(scrollY);
    const velocityRef = useRef(0);
    const logicRef = useRef(1);

    // Sync state and ref for the ticker, with snappy transition
    useEffect(() => {
        return scrollVelocity.onChange((v) => {
            if (Math.abs(v) > 1) { // More sensitive threshold
                const newLogic = v > 0 ? 1 : -1;
                if (newLogic !== logicRef.current) {
                    logicRef.current = newLogic;
                    // Snappier transition (0.3s instead of 0.8s)
                    gsap.to(logicRef, { current: newLogic, duration: 0.3, ease: "power2.out" });
                }
            }
        });
    }, [scrollVelocity]);

    useEffect(() => {
        if (!contentRef.current) return;
        const content = contentRef.current;
        const totalWidth = content.offsetWidth / 2;
        let x = 0;
        const update = () => {
            const v = scrollVelocity.get();
            const absVelocity = Math.abs(v);

            velocityRef.current += (absVelocity - velocityRef.current) * 0.05;

            const dirMultiplier = direction === 'left' ? -1 : 1;
            const scrollInfluence = velocityRef.current * 0.003;

            // Total Movement = (Base + Scroll) * Switching Logic
            const totalSpeed = (baseSpeed + scrollInfluence) * dirMultiplier * logicRef.current;
            x += totalSpeed;

            if (x < -totalWidth) x += totalWidth;
            if (x > 0) x -= totalWidth;
            content.style.transform = `translate3d(${x}px, 0, 0)`;
        };
        const ticker = gsap.ticker.add(update);
        return () => gsap.ticker.remove(update);
    }, [baseSpeed, direction]);

    return (
        <div
            className={`absolute w-[240%] -left-[70%] flex items-center h-[18vh] md:h-[28vh] overflow-hidden ${className}`}
            style={{ backgroundColor: color, zIndex, ...style }}
        >
            <div ref={contentRef} className="flex whitespace-nowrap will-change-transform items-center h-full">
                {[...Array(2)].map((_, i) => (
                    <div key={i} className="flex items-center gap-12 px-8 h-full">
                        {items.map((item, idx) => (
                            <React.Fragment key={idx}>
                                {item.type === 'text' ? (
                                    <span className="text-[14vh] md:text-[28vh] font-serif italic uppercase tracking-tighter text-black leading-[0.8] py-2">
                                        {item.content}
                                    </span>
                                ) : (
                                    <div className="h-[80%] aspect-square rounded-full border-[2px] md:border-[4px] border-white/90 overflow-hidden shadow-sm mx-4">
                                        <img src={item.content} alt="decor" className="w-full h-full object-cover scale-110" />
                                    </div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

const EditorialMarquee = () => {
    const row1Items = [
        { type: 'text', content: 'Table' },
        { type: 'image', content: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=400' },
        { type: 'text', content: 'Chaise' },
        { type: 'image', content: 'https://images.unsplash.com/photo-1503602642458-232111445657?q=80&w=400' },
        { type: 'text', content: 'Buffet' },
        { type: 'image', content: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=400' },
    ];

    const row2Items = [
        { type: 'text', content: 'Armoire' },
        { type: 'image', content: 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?q=80&w=400' },
        { type: 'text', content: 'Commode' },
        { type: 'image', content: 'https://images.unsplash.com/photo-1544457070-4cd773b4d71e?q=80&w=400' },
        { type: 'text', content: 'Établi' },
        { type: 'image', content: 'https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?q=80&w=400' },
    ];

    const row3Items = [
        { type: 'text', content: 'Banc' },
        { type: 'image', content: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?q=80&w=400' },
        { type: 'text', content: 'Tabouret' },
        { type: 'image', content: 'https://images.unsplash.com/photo-1596162954151-cd5438f351bf?q=80&w=400' },
        { type: 'text', content: 'Miroir' },
        { type: 'image', content: 'https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=400' },
    ];

    return (
        <div className="relative w-full h-[85vh] md:h-[125vh] my-12 md:my-24 overflow-hidden bg-transparent select-none">
            {/*
               BEHAVIOR REFINEMENT:
               - Pink base speed: 0.4
               - Blue & Purple base speed: 0.8 (+100%)
            */}

            <MarqueeRow
                items={row1Items}
                color="#AECCE4"
                direction="left"
                baseSpeed={0.8}
                zIndex={1}
                style={{ top: '8%', transform: 'rotate(-4deg)' }}
            />

            <MarqueeRow
                items={row3Items}
                color="#F0A1A1"
                direction="left"
                baseSpeed={0.4}
                zIndex={3}
                style={{ top: '62%', transform: 'rotate(-4deg)' }}
            />

            <MarqueeRow
                items={row2Items}
                color="#C5C1EB"
                direction="right"
                baseSpeed={0.8}
                zIndex={2}
                style={{ top: '35%', transform: 'rotate(3deg)' }}
            />
        </div>
    );
};

export default EditorialMarquee;
