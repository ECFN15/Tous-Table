import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useScroll, useVelocity, useAnimationFrame } from 'framer-motion';
import { db } from '../../firebase/config';
import { doc, getDoc } from 'firebase/firestore';

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
                    // Snappier transition (0.3s -> 0.25s) with smoother easing
                    gsap.to(logicRef, { current: newLogic, duration: 0.25, ease: "power3.out" });
                }
            }
        });
    }, [scrollVelocity]);

    useEffect(() => {
        if (!contentRef.current) return;
        const content = contentRef.current;
        const totalWidth = content.offsetWidth / 4; // Adjusted for 4 repetitions
        let x = 0;
        const update = () => {
            const v = scrollVelocity.get();
            const absVelocity = Math.abs(v);

            // Reactive physics: low friction (0.1) and high influence (0.005)
            velocityRef.current += (absVelocity - velocityRef.current) * 0.1;

            const dirMultiplier = direction === 'left' ? -1 : 1;
            const scrollInfluence = velocityRef.current * 0.005;

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
            className={`absolute w-[350%] -left-[100%] sm:w-[300%] sm:-left-[100%] flex items-center h-[16vh] sm:h-[20vh] md:h-[24vh] lg:h-[28vh] xl:h-[30vh] overflow-visible ${className}`}
            style={{ backgroundColor: color, zIndex, ...style }}
        >
            <div ref={contentRef} className="flex whitespace-nowrap will-change-transform items-center h-full">
                {[...Array(4)].map((_, i) => ( // Increased to 4 reps to fix the 'gap' bug
                    <div key={i} className="flex items-center gap-4 sm:gap-6 md:gap-10 lg:gap-12 px-2 sm:px-6 h-full">
                        {items.map((item, idx) => (
                            <React.Fragment key={idx}>
                                {item.type === 'text' ? (
                                    <span
                                        className="text-[12vh] sm:text-[15vh] md:text-[20vh] lg:text-[24vh] xl:text-[26vh] italic uppercase tracking-[-0.03em] text-black leading-none py-1 drop-shadow-sm"
                                        style={{ fontFamily: '"DM Serif Display", serif' }}
                                    >
                                        {item.content}
                                    </span>
                                ) : (
                                    <div className="h-[95%] sm:h-[105%] aspect-square rounded-full border-[4px] sm:border-[6px] md:border-[8px] lg:border-[12px] border-[#FDFDFD] overflow-hidden shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] mx-3 sm:mx-5 lg:mx-8 flex-shrink-0 relative transform hover:scale-105 transition-transform duration-500 ring-1 ring-black/5">
                                        <img src={item.content} alt="decor" className="w-full h-full object-cover" />
                                        {/* Inner texture/bevel effect */}
                                        <div className="absolute inset-0 rounded-full border-[1px] border-black/5 pointer-events-none mix-blend-multiply" />
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
    const [rows, setRows] = React.useState({ r1: [], r2: [], r3: [] });
    const [loading, setLoading] = React.useState(true);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const docRef = doc(db, 'sys_metadata', 'homepage_images');
                const snap = await getDoc(docRef);
                const data = snap.exists() ? snap.data() : {};

                const buildRow = (rowNum) => {
                    const rowItems = [];
                    for (let i = 1; i <= 3; i++) {
                        const key = `marquee_r${rowNum}_${i}`;
                        const img = data[key] || getDefault(rowNum, i).img;
                        const word = data[`${key}_text`]?.word || getDefault(rowNum, i).word;

                        rowItems.push({ type: 'text', content: word });
                        rowItems.push({ type: 'image', content: img });
                    }
                    return rowItems;
                };

                setRows({
                    r1: buildRow(1),
                    r2: buildRow(2),
                    r3: buildRow(3)
                });
            } catch (err) {
                console.error("Error fetching marquee config:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchConfig();
    }, []);

    const getDefault = (r, i) => {
        const defaults = {
            1: [
                { word: 'Table', img: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=400' },
                { word: 'Chaise', img: 'https://images.unsplash.com/photo-1503602642458-232111445657?q=80&w=400' },
                { word: 'Buffet', img: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=400' }
            ],
            2: [
                { word: 'Armoire', img: 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?q=80&w=400' },
                { word: 'Commode', img: 'https://images.unsplash.com/photo-1544457070-4cd773b4d71e?q=80&w=400' },
                { word: 'Établi', img: 'https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?q=80&w=400' }
            ],
            3: [
                { word: 'Banc', img: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?q=80&w=400' },
                { word: 'Tabouret', img: 'https://images.unsplash.com/photo-1596162954151-cd5438f351bf?q=80&w=400' },
                { word: 'Miroir', img: 'https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=400' }
            ]
        };
        return defaults[r][i - 1];
    };

    if (loading) return null; // Or a subtle loader

    return (
        <div className="relative w-full h-[60vh] sm:h-[75vh] md:h-[90vh] lg:h-[110vh] xl:h-[120vh] my-8 md:my-24 overflow-hidden bg-transparent select-none">
            {/*
               BEHAVIOR REFINEMENT:
               - Pink base speed: 0.4
               - Blue & Purple base speed: 0.8 (+100%)
            */}

            <MarqueeRow
                items={rows.r1}
                color="#E5C99BF2"
                direction="left"
                baseSpeed={0.9}
                zIndex={1}
                className="top-[12%] rotate-[-3deg]"
            />

            <MarqueeRow
                items={rows.r3}
                color="#D97B6BF2"
                direction="left"
                baseSpeed={0.45}
                zIndex={2}
                className="top-[66%] rotate-[-3deg]"
            />

            <MarqueeRow
                items={rows.r2}
                color="#F3B664F2"
                direction="right"
                baseSpeed={0.8}
                zIndex={10}
                className="top-[36%] rotate-[2deg]"
            />
        </div>
    );
};

export default EditorialMarquee;
