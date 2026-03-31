import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

// Sélections d'images de produits réels (marques distribuées)
const WORKSHOP_IMAGES = [
    'https://m.media-amazon.com/images/I/61-4bboUxeL._AC_SL1500_.jpg', // 0: Grattoir (Approprié en horizontal)
    'https://m.media-amazon.com/images/I/81WeRhbVc+L._AC_SL1500_.jpg', // 1: Rust-Oleum Chalky Finish
    'https://m.media-amazon.com/images/I/817x8mAGGcL._AC_SL1500_.jpg', // 2: Ciseaux Kirschen
    'https://m.media-amazon.com/images/I/813O2vl0bBL._AC_SL1500_.jpg', // 3: Libéron Black Bison
    'https://m.media-amazon.com/images/I/51ZsB-USKuL._AC_SL1080_.jpg', // 4: V33 Décapant Bois
    'https://m.media-amazon.com/images/I/51VxewNTbaL._AC_SL1286_.jpg', // 5: Outil long (Approprié en horizontal)
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
            className="contents"
        >
            <div className={`absolute inset-0 pointer-events-none z-0 ${darkMode ? 'bg-[radial-gradient(circle_at_77%_44%,rgba(245,158,11,0.16),transparent_52%)]' : 'bg-[radial-gradient(circle_at_77%_44%,rgba(180,83,9,0.16),transparent_52%)]'}`} />

            {/* Grain subtil pour eviter la platitude */}
            <div
                className="absolute inset-0 opacity-[0.07] pointer-events-none z-0"
                style={{
                    backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.2) 0 1px, transparent 1px 3px), repeating-linear-gradient(90deg, rgba(255,255,255,0.12) 0 1px, transparent 1px 4px)'
                }}
            />

            {/* Unified Responsive Composition (6 images) */}
            <div className="relative md:absolute order-2 md:order-none mx-auto md:mx-0 md:top-1/2 md:-translate-y-1/2 md:right-4 lg:right-[2%] w-[88vw] sm:w-[85vw] md:w-[50vw] lg:w-[48vw] xl:w-[42vw] max-w-[420px] sm:max-w-[500px] md:max-w-[550px] lg:max-w-[750px] xl:max-w-[1200px] my-6 md:my-0 flex-shrink-0" style={{ zIndex: 2 }}>
                <div className={`rounded-[24px] md:rounded-[30px] border p-2.5 md:p-3 lg:p-4 shadow-2xl ${darkMode ? 'border-white/5 bg-black/10' : 'border-stone-300/60 bg-white/25'}`}>
                    {/* Top Grid: 4 images */}
                    <div className="grid grid-cols-12 grid-rows-6 gap-x-2 md:gap-x-3 lg:gap-x-4 gap-y-2 md:gap-y-3 lg:gap-y-4 h-[190px] min-[400px]:h-[220px] sm:h-[280px] md:h-[300px] lg:h-[400px]">
                        <div
                            ref={el => imagesRef.current[0] = el}
                            className="col-span-7 row-span-3 rounded-[12px] md:rounded-[18px] overflow-hidden"
                        >
                            <div className="group relative h-full w-full rounded-[12px] md:rounded-[18px] bg-white ring-1 ring-inset ring-black/5 shadow-md transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] hover:-translate-y-2 hover:shadow-2xl overflow-hidden cursor-default">
                                <img
                                    src={WORKSHOP_IMAGES[0]}
                                    alt="Grattoir"
                                    className="h-full w-full object-contain p-4 lg:p-8 transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-110 origin-center"
                                />
                                <div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/[0.02] pointer-events-none" />
                            </div>
                        </div>

                        <div
                            ref={el => imagesRef.current[1] = el}
                            className="col-span-5 row-span-6 rounded-[14px] md:rounded-[20px] overflow-hidden"
                        >
                            <div className="group relative h-full w-full rounded-[14px] md:rounded-[20px] bg-white ring-1 ring-inset ring-black/5 shadow-lg transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] hover:-translate-y-2 hover:shadow-2xl overflow-hidden cursor-default">
                                <img
                                    src={WORKSHOP_IMAGES[1]}
                                    alt="Rust-Oleum Chalky Finish"
                                    className="h-full w-full object-contain p-4 lg:p-10 transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-110 origin-center"
                                />
                                <div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/[0.02] pointer-events-none" />
                            </div>
                        </div>

                        <div
                            ref={el => imagesRef.current[2] = el}
                            className="col-span-3 row-span-3 rounded-[12px] md:rounded-[18px] overflow-hidden"
                        >
                            <div className="group relative h-full w-full rounded-[12px] md:rounded-[18px] bg-white ring-1 ring-inset ring-black/5 shadow-md transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] hover:-translate-y-2 hover:shadow-2xl overflow-hidden cursor-default">
                                <img
                                    src={WORKSHOP_IMAGES[2]}
                                    alt="Ciseaux Kirschen"
                                    className="h-full w-full object-contain p-3 lg:p-6 transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-110 origin-center"
                                />
                                <div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/[0.02] pointer-events-none" />
                            </div>
                        </div>

                        <div
                            ref={el => imagesRef.current[3] = el}
                            className="col-span-4 row-span-3 rounded-[10px] md:rounded-[17px] overflow-hidden"
                        >
                            <div className="group relative h-full w-full rounded-[10px] md:rounded-[17px] bg-white ring-1 ring-inset ring-black/5 shadow-md transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] hover:-translate-y-2 hover:shadow-2xl overflow-hidden cursor-default">
                                <img
                                    src={WORKSHOP_IMAGES[3]}
                                    alt="Pinceau Spalter"
                                    className="h-full w-full object-contain p-4 lg:p-8 transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-110 origin-center"
                                />
                                <div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/[0.02] pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Bottom Grid: 2 images */}
                    <div className="mt-2 md:mt-3 lg:mt-4 grid grid-cols-12 gap-2 md:gap-3 lg:gap-4">
                        <div
                            ref={el => imagesRef.current[4] = el}
                            className="col-span-5 h-[65px] min-[400px]:h-[75px] sm:h-[90px] md:h-[100px] lg:h-[140px] rounded-[10px] md:rounded-[16px] overflow-hidden"
                        >
                            <div className="group relative h-full w-full rounded-[10px] md:rounded-[16px] bg-white ring-1 ring-inset ring-black/5 shadow-sm transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] hover:-translate-y-2 hover:shadow-xl overflow-hidden cursor-default">
                                <img
                                    src={WORKSHOP_IMAGES[4]}
                                    alt="V33 Décapant"
                                    className="h-full w-full object-contain p-2 lg:p-6 transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-110 origin-center"
                                />
                                <div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/[0.02] pointer-events-none" />
                            </div>
                        </div>

                        <div
                            ref={el => imagesRef.current[5] = el}
                            className="col-span-7 h-[65px] min-[400px]:h-[75px] sm:h-[90px] md:h-[100px] lg:h-[140px] rounded-[10px] md:rounded-[16px] overflow-hidden"
                        >
                            <div className="group relative h-full w-full rounded-[10px] md:rounded-[16px] bg-white ring-1 ring-inset ring-black/5 shadow-sm transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] hover:-translate-y-2 hover:shadow-xl overflow-hidden cursor-default">
                                <img
                                    src={WORKSHOP_IMAGES[5]}
                                    alt="Outil horizontal"
                                    className="h-full w-full object-contain p-2 lg:p-6 transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-110 origin-center"
                                />
                                <div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/[0.02] pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default WorkshopHero;
