import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

// Selection d'images plus coherentes avec l'univers atelier
const WORKSHOP_IMAGES = [
    'https://images.unsplash.com/photo-1567016432779-094069958ea5?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&w=1800&q=80',
    'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1505693314120-0d443867891c?auto=format&fit=crop&w=1400&q=80',
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

            {/* Unified Responsive Composition (6 images) */}
            <div className="absolute top-[38%] md:top-1/2 left-1/2 md:left-auto -translate-x-1/2 md:translate-x-0 -translate-y-1/2 right-auto md:right-4 lg:right-[2%] w-[90vw] md:w-[55vw] lg:w-[56vw] max-w-[420px] md:max-w-[700px] lg:max-w-[900px]" style={{ zIndex: 2 }}>
                <div className={`rounded-[24px] md:rounded-[30px] border p-2.5 md:p-3 lg:p-4 shadow-2xl ${darkMode ? 'border-white/5 bg-black/10' : 'border-stone-300/60 bg-white/25'}`}>
                    {/* Top Grid: 4 images */}
                    <div className="grid grid-cols-12 grid-rows-6 gap-x-2 md:gap-x-3 lg:gap-x-4 gap-y-2 md:gap-y-3 lg:gap-y-4 h-[260px] sm:h-[300px] md:h-[340px] lg:h-[448px]">
                        <div
                            ref={el => imagesRef.current[0] = el}
                            className="col-span-7 row-span-3 rounded-[12px] md:rounded-[18px] overflow-hidden"
                        >
                            <div className={`relative h-full w-full rounded-[12px] md:rounded-[18px] overflow-hidden border ${darkMode ? 'border-stone-800' : 'border-stone-200'} shadow-[0_16px_44px_rgba(0,0,0,0.28)]`}>
                                <img
                                    src={WORKSHOP_IMAGES[0]}
                                    alt="Mobilier artisanal"
                                    className="h-full w-full object-cover scale-100 hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
                            </div>
                        </div>

                        <div
                            ref={el => imagesRef.current[1] = el}
                            className="col-span-5 row-span-6 rounded-[14px] md:rounded-[20px] overflow-hidden"
                        >
                            <div className={`relative h-full w-full rounded-[14px] md:rounded-[20px] overflow-hidden border ${darkMode ? 'border-stone-800' : 'border-stone-200'} shadow-[0_20px_56px_rgba(0,0,0,0.32)]`}>
                                <img
                                    src={WORKSHOP_IMAGES[1]}
                                    alt="Atelier interieur"
                                    className="h-full w-full object-cover scale-100 hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-b from-black/12 via-transparent to-black/22 pointer-events-none" />
                            </div>
                        </div>

                        <div
                            ref={el => imagesRef.current[2] = el}
                            className="col-span-3 row-span-3 rounded-[12px] md:rounded-[18px] overflow-hidden"
                        >
                            <div className={`relative h-full w-full rounded-[12px] md:rounded-[18px] overflow-hidden border ${darkMode ? 'border-stone-800' : 'border-stone-200'} shadow-[0_14px_36px_rgba(0,0,0,0.24)]`}>
                                <img
                                    src={WORKSHOP_IMAGES[2]}
                                    alt="Details bois"
                                    className="h-full w-full object-cover scale-100 hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/10 pointer-events-none" />
                            </div>
                        </div>

                        <div
                            ref={el => imagesRef.current[3] = el}
                            className="col-span-4 row-span-3 rounded-[10px] md:rounded-[17px] overflow-hidden"
                        >
                            <div className={`relative h-full w-full rounded-[10px] md:rounded-[17px] overflow-hidden border ${darkMode ? 'border-stone-800' : 'border-stone-200'} shadow-[0_12px_28px_rgba(0,0,0,0.2)]`}>
                                <img
                                    src={WORKSHOP_IMAGES[3]}
                                    alt="Bois et texture"
                                    className="h-full w-full object-cover scale-100 hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/16 via-transparent to-transparent pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Bottom Grid: 2 images */}
                    <div className="mt-2 md:mt-3 lg:mt-4 grid grid-cols-12 gap-2 md:gap-3 lg:gap-4">
                        <div
                            ref={el => imagesRef.current[4] = el}
                            className="col-span-5 h-[90px] sm:h-[100px] md:h-[110px] lg:h-[152px] rounded-[10px] md:rounded-[16px] overflow-hidden"
                        >
                            <div className={`relative h-full w-full rounded-[10px] md:rounded-[16px] overflow-hidden border ${darkMode ? 'border-stone-800' : 'border-stone-200'} shadow-[0_12px_28px_rgba(0,0,0,0.2)]`}>
                                <img
                                    src={WORKSHOP_IMAGES[4]}
                                    alt="Salon atelier"
                                    className="h-full w-full object-cover scale-100 hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/16 via-transparent to-transparent pointer-events-none" />
                            </div>
                        </div>

                        <div
                            ref={el => imagesRef.current[5] = el}
                            className="col-span-7 h-[90px] sm:h-[100px] md:h-[110px] lg:h-[152px] rounded-[10px] md:rounded-[16px] overflow-hidden"
                        >
                            <div className={`relative h-full w-full rounded-[10px] md:rounded-[16px] overflow-hidden border ${darkMode ? 'border-stone-800' : 'border-stone-200'} shadow-[0_12px_28px_rgba(0,0,0,0.2)]`}>
                                <img
                                    src={WORKSHOP_IMAGES[5]}
                                    alt="Chambre meublee"
                                    className="h-full w-full object-cover scale-100 hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/16 via-transparent to-transparent pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default WorkshopHero;
