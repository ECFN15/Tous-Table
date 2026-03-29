import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

// Images de l'atelier
const WORKSHOP_IMAGES = [
    'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1565793298595-6a879b1d9492?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80',
];

const WorkshopHero = ({ darkMode = false }) => {
    const containerRef = useRef(null);
    const imagesRef = useRef([]);
    const particlesRef = useRef(null);

    const generateParticles = () => {
        const particles = [];
        for (let i = 0; i < 25; i++) {
            particles.push({
                id: i,
                x: Math.random() * 100,
                y: Math.random() * 100,
                size: Math.random() * 2 + 1,
                duration: Math.random() * 3 + 2,
                delay: Math.random() * 2,
            });
        }
        return particles;
    };

    const particles = generateParticles();

    useGSAP(() => {
        const ctx = gsap.context(() => {
            // Animation d'entrée simple sans rotation
            imagesRef.current.forEach((img, index) => {
                if (!img) return;
                
                gsap.fromTo(img, 
                    { opacity: 0, y: 30 },
                    { 
                        opacity: 1, 
                        y: 0,
                        duration: 0.8,
                        delay: 0.2 + (index * 0.1),
                        ease: "power2.out"
                    }
                );
            });

            // Animation des particules
            const particleElements = particlesRef.current?.children;
            if (particleElements) {
                Array.from(particleElements).forEach((particle, i) => {
                    gsap.to(particle, {
                        y: "-=80",
                        opacity: 0,
                        duration: particles[i]?.duration || 3,
                        delay: particles[i]?.delay || 0,
                        ease: "power1.out",
                        repeat: -1,
                        repeatDelay: Math.random() * 2
                    });
                });
            }
        }, containerRef);

        return () => ctx.revert();
    }, [darkMode]);


    return (
        <div 
            ref={containerRef}
            className="absolute inset-0 overflow-hidden pointer-events-none"
        >
            {/* Zone de particules */}
            <div 
                ref={particlesRef}
                className="absolute inset-0"
                style={{ zIndex: 1 }}
            >
                {particles.map((p) => (
                    <div
                        key={p.id}
                        className={`absolute rounded-full ${darkMode ? 'bg-amber-500/20' : 'bg-amber-700/15'}`}
                        style={{
                            left: `${p.x}%`,
                            top: `${p.y}%`,
                            width: `${p.size}px`,
                            height: `${p.size}px`,
                        }}
                    />
                ))}
            </div>

            {/* Grille structurée style Midjourney - PAS DE ROTATION */}
            <div className="absolute right-[2%] top-1/2 -translate-y-1/2 w-[50vw] max-w-[700px]" style={{ zIndex: 2 }}>
                <div className="grid grid-cols-2 grid-rows-2 gap-3 md:gap-4 aspect-square">
                    {/* Image 1 - Top Left */}
                    <div
                        ref={el => imagesRef.current[0] = el}
                        className="relative overflow-hidden rounded-lg"
                    >
                        <div className={`relative w-full h-full overflow-hidden rounded-lg border ${darkMode ? 'border-stone-800' : 'border-stone-200'}`}>
                            <img 
                                src={WORKSHOP_IMAGES[0]} 
                                alt="Outils d'atelier"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>

                    {/* Image 2 - Top Right + Bottom Right (span 2 rows) */}
                    <div
                        ref={el => imagesRef.current[1] = el}
                        className="relative row-span-2 overflow-hidden rounded-lg"
                    >
                        <div className={`relative w-full h-full overflow-hidden rounded-lg border ${darkMode ? 'border-stone-800' : 'border-stone-200'}`}>
                            <img 
                                src={WORKSHOP_IMAGES[1]} 
                                alt="Bois massif"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>

                    {/* Image 3 - Bottom Left */}
                    <div
                        ref={el => imagesRef.current[2] = el}
                        className="relative overflow-hidden rounded-lg"
                    >
                        <div className={`relative w-full h-full overflow-hidden rounded-lg border ${darkMode ? 'border-stone-800' : 'border-stone-200'}`}>
                            <img 
                                src={WORKSHOP_IMAGES[2]} 
                                alt="Atelier menuiserie"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default WorkshopHero;
