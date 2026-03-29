import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

// Selection d'images plus coherentes avec l'univers atelier
const WORKSHOP_IMAGES = [
    'https://images.unsplash.com/photo-1567016432779-094069958ea5?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&w=1800&q=80',
    'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?auto=format&fit=crop&w=1400&q=80',
];

const WorkshopHero = ({ darkMode = false }) => {
    const containerRef = useRef(null);
    const imagesRef = useRef([]);

    useGSAP(() => {
        const ctx = gsap.context(() => {
            const cards = imagesRef.current.filter(Boolean);

            gsap.fromTo(
                cards,
                { opacity: 0, y: 42, scale: 1.04 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 1.25,
                    stagger: 0.12,
                    delay: 0.1,
                    ease: 'power4.out'
                }
            );
        }, containerRef);

        return () => ctx.revert();
    }, [darkMode]);


    return (
        <div 
            ref={containerRef}
            className="absolute inset-0 overflow-hidden pointer-events-none"
        >
            <div className={`absolute inset-0 ${darkMode ? 'bg-[radial-gradient(circle_at_77%_44%,rgba(245,158,11,0.16),transparent_52%)]' : 'bg-[radial-gradient(circle_at_77%_44%,rgba(180,83,9,0.16),transparent_52%)]'}`} />

            {/* Grain subtil pour eviter la platitude */}
            <div
                className="absolute inset-0 opacity-[0.07]"
                style={{
                    backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.2) 0 1px, transparent 1px 3px), repeating-linear-gradient(90deg, rgba(255,255,255,0.12) 0 1px, transparent 1px 4px)'
                }}
            />

            {/* Desktop composition sans superposition */}
            <div className="absolute right-[2%] top-1/2 -translate-y-1/2 w-[56vw] max-w-[900px] hidden lg:block" style={{ zIndex: 2 }}>
                <div className={`rounded-[30px] border p-4 ${darkMode ? 'border-white/5 bg-black/10' : 'border-stone-300/60 bg-white/25'}`}>
                    <div className="grid grid-cols-12 grid-rows-6 gap-x-4 gap-y-4 h-[448px]">
                        <div
                            ref={el => imagesRef.current[0] = el}
                            className="col-span-7 row-span-3 rounded-[18px] overflow-hidden"
                        >
                            <div className={`relative h-full w-full rounded-[18px] overflow-hidden border ${darkMode ? 'border-stone-800' : 'border-stone-200'} shadow-[0_16px_44px_rgba(0,0,0,0.28)]`}>
                                <img
                                    src={WORKSHOP_IMAGES[0]}
                                    alt="Mobilier artisanal"
                                    className="h-full w-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
                            </div>
                        </div>

                        <div
                            ref={el => imagesRef.current[1] = el}
                            className="col-span-5 row-span-6 rounded-[20px] overflow-hidden"
                        >
                            <div className={`relative h-full w-full rounded-[20px] overflow-hidden border ${darkMode ? 'border-stone-800' : 'border-stone-200'} shadow-[0_20px_56px_rgba(0,0,0,0.32)]`}>
                                <img
                                    src={WORKSHOP_IMAGES[1]}
                                    alt="Atelier interieur"
                                    className="h-full w-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-b from-black/12 via-transparent to-black/22" />
                            </div>
                        </div>

                        <div
                            ref={el => imagesRef.current[2] = el}
                            className="col-span-3 row-span-3 rounded-[18px] overflow-hidden"
                        >
                            <div className={`relative h-full w-full rounded-[18px] overflow-hidden border ${darkMode ? 'border-stone-800' : 'border-stone-200'} shadow-[0_14px_36px_rgba(0,0,0,0.24)]`}>
                                <img
                                    src={WORKSHOP_IMAGES[2]}
                                    alt="Details bois"
                                    className="h-full w-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/10" />
                            </div>
                        </div>

                        <div
                            ref={el => imagesRef.current[3] = el}
                            className="col-span-4 row-span-3 rounded-[17px] overflow-hidden"
                        >
                            <div className={`relative h-full w-full rounded-[17px] overflow-hidden border ${darkMode ? 'border-stone-800' : 'border-stone-200'} shadow-[0_12px_28px_rgba(0,0,0,0.2)]`}>
                                <img
                                    src={WORKSHOP_IMAGES[3]}
                                    alt="Bois et texture"
                                    className="h-full w-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/16 via-transparent to-transparent" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile composition sans superposition */}
            <div className="absolute right-4 top-[54%] -translate-y-1/2 w-[46vw] max-w-[240px] lg:hidden" style={{ zIndex: 2 }}>
                <div className={`rounded-2xl border p-2.5 ${darkMode ? 'border-white/8 bg-black/20' : 'border-stone-300/70 bg-white/30'}`}>
                    <div className="grid grid-cols-2 gap-2.5">
                        <div
                            ref={el => imagesRef.current[4] = el}
                            className="col-span-2 aspect-[16/10] rounded-xl overflow-hidden"
                        >
                            <img
                                src={WORKSHOP_IMAGES[1]}
                                alt="Atelier interieur"
                                className={`w-full h-full object-cover border ${darkMode ? 'border-stone-800' : 'border-stone-200'}`}
                            />
                        </div>
                        <div
                            ref={el => imagesRef.current[5] = el}
                            className="aspect-[4/3] rounded-xl overflow-hidden"
                        >
                            <img
                                src={WORKSHOP_IMAGES[0]}
                                alt="Mobilier artisanal"
                                className={`w-full h-full object-cover border ${darkMode ? 'border-stone-800' : 'border-stone-200'}`}
                            />
                        </div>
                        <div
                            ref={el => imagesRef.current[6] = el}
                            className="aspect-[4/3] rounded-xl overflow-hidden"
                        >
                            <img
                                src={WORKSHOP_IMAGES[3]}
                                alt="Bois et texture"
                                className={`w-full h-full object-cover border ${darkMode ? 'border-stone-800' : 'border-stone-200'}`}
                            />
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default WorkshopHero;
