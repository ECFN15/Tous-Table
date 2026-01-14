import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

// --- COMPOSANT LANDING PAGE (HOME) ---
const HomeView = ({ onEnterMarketplace }) => {
    // État pour le slider Hero
    const [currentHeroIdx, setCurrentHeroIdx] = useState(0);
    const heroImages = [
        "https://images.unsplash.com/photo-1581428982868-e410dd047a90?q=80&w=2070&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1540638349517-3abd5afc5847?q=80&w=2070&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=2069&auto=format&fit=crop"
    ];

    const autoSlideTimer = useRef(null);

    // Fonction pour démarrer/redémarrer le défilement auto
    const startAutoSlide = () => {
        if (autoSlideTimer.current) clearInterval(autoSlideTimer.current);
        autoSlideTimer.current = setInterval(() => {
            setCurrentHeroIdx(prev => (prev + 1) % heroImages.length);
        }, 5000);
    };

    useEffect(() => {
        startAutoSlide();
        return () => { if (autoSlideTimer.current) clearInterval(autoSlideTimer.current); };
    }, [heroImages.length]);

    // Passage manuel à l'image suivante (droite) ou précédente (gauche)
    const handleHeroClick = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left; // position X relative au bloc
        const width = rect.width;

        if (x > width / 2) {
            // Clic à droite -> Avancer (1 -> 2 -> 3 -> 1)
            setCurrentHeroIdx(prev => (prev + 1) % heroImages.length);
        } else {
            // Clic à gauche -> Reculer (1 -> 3 -> 2 -> 1)
            setCurrentHeroIdx(prev => (prev - 1 + heroImages.length) % heroImages.length);
        }
        
        // On redémarre le timer pour que l'utilisateur ait 5s pleines sur l'image choisie
        startAutoSlide();
    };

    // Données enrichies pour le Marquee
    const row1Items = [
        { type: 'img', url: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=600", width: 'w-[140px] md:w-[320px]' },
        { type: 'img', url: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?q=80&w=600", width: 'w-[100px] md:w-[240px]' },
        { type: 'data', val: '50+', label: 'Tables sauvées', color: 'bg-blue-50/80' },
        { type: 'img', url: "https://images.unsplash.com/photo-1540638349517-3abd5afc5847?q=80&w=2070&auto=format&fit=crop", width: 'w-[150px] md:w-[380px]' },
        { type: 'img', url: "https://images.unsplash.com/photo-1581428982868-e410dd047a90?q=80&w=600", width: 'w-[120px] md:w-[280px]' },
        { type: 'data', val: '1.2k', label: 'Heures de ponçage', color: 'bg-rose-50/80' },
        { type: 'img', url: "https://images.unsplash.com/photo-1505691938895-1758d7eaa511?q=80&w=600", width: 'w-[130px] md:w-[310px]' },
    ];

    const row2Items = [
        { type: 'img', url: "https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?q=80&w=600", width: 'w-[155px] md:w-[350px]' },
        { type: 'data', val: '100%', label: 'Origine Normandie', color: 'bg-emerald-50/80' },
        { type: 'img', url: "https://images.unsplash.com/photo-1517705008128-361805f42e86?q=80&w=600", width: 'w-[110px] md:w-[260px]' },
        { type: 'img', url: "https://images.unsplash.com/photo-1581428982868-e410dd047a90?q=80&w=2070&auto=format&fit=crop", width: 'w-[140px] md:w-[330px]' },
        { type: 'data', val: '8.5', label: 'Note moyenne', color: 'bg-purple-50/80' },
        { type: 'img', url: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=600", width: 'w-[125px] md:w-[290px]' },
        { type: 'img', url: "https://images.unsplash.com/photo-1455792244736-3ed96c3d7f7e?q=80&w=2070&auto=format&fit=crop", width: 'w-[160px] md:w-[400px]' },
    ];

    const MarqueeItem = ({ item }) => {
        if (item.type === 'img') {
            return (
                <div className={`inline-block h-[160px] md:h-[350px] ${item.width} rounded-2xl md:rounded-3xl bg-white shadow-lg md:shadow-xl overflow-hidden border-2 md:border-8 border-white flex-shrink-0 mx-1.5 md:mx-4 transition-transform duration-700 hover:scale-105 active:scale-95 cursor-pointer`}>
                    <img src={item.url} className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-700" alt="" />
                </div>
            );
        }
        return (
            <div className={`inline-flex flex-col justify-center px-6 md:px-12 h-[160px] md:h-[350px] mx-1.5 md:mx-4 rounded-2xl md:rounded-3xl border border-stone-100 min-w-[120px] md:min-w-[280px] shadow-sm ${item.color}`}>
                <span className="text-3xl md:text-7xl font-black text-stone-900 tracking-tighter leading-none">{item.val}</span>
                <span className="text-[7px] md:text-[11px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em] text-amber-600 mt-2 md:mt-4">{item.label}</span>
            </div>
        );
    };

    return (
        <div className="animate-in fade-in duration-1000">
            {/* HERO SECTION */}
            <section className="min-h-[85vh] md:min-h-screen flex flex-col justify-center px-6 md:px-20 pt-32 pb-12 md:py-20 relative overflow-hidden">
                <div className="max-w-5xl z-10">
                    <p className="text-amber-600 font-bold tracking-[0.3em] uppercase text-[10px] mb-4 md:mb-6 animate-in slide-in-from-bottom-4 duration-700">Atelier d'ébénisterie normand</p>
                    <h1 className="text-5xl md:text-9xl font-black tracking-tighter text-stone-900 leading-[0.85] mb-8 md:mb-10 font-serif italic text-balance">
                        Rénovation <br /> 
                        <span className="text-stone-300 not-italic">d'ancienne table</span> <br />
                        de ferme.
                    </h1>
                    <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-center">
                        <button 
                            onClick={onEnterMarketplace}
                            className="group flex items-center gap-4 bg-stone-900 text-white px-8 md:px-10 py-5 md:py-6 rounded-full font-black uppercase text-xs tracking-widest hover:bg-amber-600 transition-all shadow-2xl active:scale-95"
                        >
                            Explorer la collection <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                        </button>
                        <p className="text-stone-400 max-w-xs text-sm font-medium leading-relaxed italic">
                            Chaque pièce est une renaissance. Nous sauvons le patrimoine normand, un plateau après l'autre.
                        </p>
                    </div>
                </div>

                {/* ESPACE MEDIA HERO - SLIDER INTERACTIF FORCE (1-2-3-1...) */}
                <div 
                  onClick={handleHeroClick}
                  className="mt-12 md:mt-20 w-full aspect-video md:aspect-[21/9] rounded-[2rem] md:rounded-[3rem] overflow-hidden bg-stone-100 border border-stone-200 shadow-2xl relative group cursor-pointer touch-none"
                >
                    <div className="absolute inset-0 bg-stone-900/10 group-hover:bg-transparent transition-colors duration-700 z-10 pointer-events-none"></div>
                    
                    <div className="relative w-full h-full flex transition-transform duration-1000 ease-in-out" style={{ transform: `translateX(-${currentHeroIdx * 100}%)` }}>
                        {heroImages.map((img, i) => (
                            <img 
                                key={i}
                                src={img} 
                                className="w-full h-full object-cover grayscale-[0.3] flex-shrink-0"
                                alt="Atelier"
                            />
                        ))}
                    </div>

                    {/* BARRES DE NAVIGATION (PROGRESSION VISUELLE) */}
                    <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
                        {heroImages.map((_, i) => (
                            <div 
                                key={`${i}-${currentHeroIdx}`} // Key incluant l'index courant pour reset l'anim
                                className={`h-1 rounded-full transition-all duration-500 overflow-hidden ${currentHeroIdx === i ? 'w-10 md:w-12 bg-white' : 'w-4 md:w-6 bg-white/30'}`}
                            >
                                {currentHeroIdx === i && (
                                    <div className="h-full bg-amber-500 animate-progress-bar origin-left"></div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="absolute bottom-10 left-10 text-white z-20 hidden md:block">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">En direct de l'atelier</p>
                        <p className="text-2xl font-serif italic">Artisanat authentique.</p>
                    </div>
                </div>
            </section>

            {/* SECTION L'ARTISAN */}
            <section className="py-12 md:py-32 px-6 md:px-20 bg-stone-900 text-white rounded-[2.5rem] md:rounded-[4rem] mx-6 md:mx-20 my-6 md:my-20">
                <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center max-w-7xl mx-auto">
                    <div className="space-y-6 md:space-y-8">
                        <div className="w-16 md:w-20 h-1 bg-amber-500"></div>
                        <h2 className="text-4xl md:text-7xl font-serif italic leading-tight">Le geste, <br/> la patience.</h2>
                        <p className="text-stone-400 text-base md:text-lg leading-relaxed font-light">
                            "Mon travail consiste à écouter ce que le bois a à dire. Une table de ferme n'est pas qu'un meuble, c'est le témoin de décennies de repas, de rires et de vie. Ma mission est de lui redonner sa noblesse sans effacer ses cicatrices."
                        </p>
                        <div className="flex items-center gap-4 text-amber-500 font-black uppercase text-[9px] md:text-[10px] tracking-widest pt-4">
                            <Sparkles size={16} /> 100% Fait main en Normandie
                        </div>
                    </div>
                    <div className="aspect-[3/4] rounded-[2rem] md:rounded-[3rem] overflow-hidden border-[6px] md:border-[12px] border-stone-800 shadow-2xl">
                        <img 
                            src="https://images.unsplash.com/photo-1455792244736-3ed96c3d7f7e?q=80&w=2070&auto=format&fit=crop" 
                            className="w-full h-full object-cover" 
                            alt="Artisan" 
                        />
                    </div>
                </div>
            </section>

            {/* SECTION DYNAMIQUE (Vision d'ensemble sur mobile) */}
            <section className="py-10 md:py-24 overflow-hidden bg-[#FAF9F6]">
                <div className="mb-8 md:mb-16 px-6 md:px-20 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-6">
                    <div className="space-y-1">
                        <h3 className="text-3xl md:text-5xl font-black tracking-tighter text-stone-900">L'Atelier en mouvement</h3>
                        <p className="text-stone-400 font-serif italic text-sm md:text-lg leading-none md:leading-normal">Instants de vie et chiffres clés.</p>
                    </div>
                    <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-stone-300">Continuous Feed</p>
                </div>

                <div className="space-y-4 md:space-y-12">
                    {/* LIGNE 1 : Défilement Gauche */}
                    <div className="flex animate-marquee-left">
                        {[...row1Items, ...row1Items].map((item, i) => (
                            <MarqueeItem key={i} item={item} />
                        ))}
                    </div>

                    {/* LIGNE 2 : Défilement Droite */}
                    <div className="flex animate-marquee-right">
                        {[...row2Items, ...row2Items].map((item, i) => (
                            <MarqueeItem key={i} item={item} />
                        ))}
                    </div>
                </div>

                <style>{`
                    @keyframes marquee-left {
                        0% { transform: translateX(0); }
                        100% { transform: translateX(-50%); }
                    }
                    @keyframes marquee-right {
                        0% { transform: translateX(-50%); }
                        100% { transform: translateX(0); }
                    }
                    @keyframes progress-bar {
                        0% { transform: scaleX(0); }
                        100% { transform: scaleX(1); }
                    }
                    .animate-marquee-left {
                        animation: marquee-left 50s linear infinite;
                        width: max-content;
                    }
                    .animate-marquee-right {
                        animation: marquee-right 50s linear infinite;
                        width: max-content;
                    }
                    .animate-progress-bar {
                        animation: progress-bar 5000ms linear forwards;
                    }
                `}</style>
            </section>

            {/* FINAL CTA */}
            <section className="min-h-[40vh] md:min-h-[60vh] flex flex-col items-center justify-center text-center px-6 py-20 md:py-40">
                <h2 className="text-4xl md:text-8xl font-black tracking-tighter mb-8 md:mb-10 leading-none text-stone-900">
                    Prêt pour votre <br/>
                    <span className="font-serif italic text-amber-600 text-stone-900">pièce unique ?</span>
                </h2>
                <button 
                    onClick={onEnterMarketplace}
                    className="bg-stone-900 text-white px-10 md:px-16 py-6 md:py-8 rounded-full font-black uppercase text-xs md:text-sm tracking-[0.3em] hover:bg-amber-600 transition-all shadow-2xl active:scale-95 text-white"
                >
                    Entrer dans la Marketplace
                </button>
            </section>
        </div>
    );
};

export default HomeView;