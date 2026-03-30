import React, { useEffect, useState } from 'react';
import { Info, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SEO from '../components/shared/SEO';
import ShopProductCard from '../components/shop/ShopProductCard';
import ShopSidebar from '../components/shop/ShopSidebar';
import WorkshopHero from '../components/shop/WorkshopHero';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';

gsap.registerPlugin(ScrollTrigger);

const FAMILIES = [
    {
        id: 'huiles',
        title: "Protection Profonde",
        subtitle: "Huiles & Nourrissants",
        description: "Le premier geste pour chérir un meuble en bois massif. Des huiles professionnelles qui pénètrent au cœur des fibres pour une protection de l'intérieur, respectant le grain et le toucher naturel. Inclut aussi les huiles alimentaires pour vos planches de découpe artisanales.",
        tutorials: [
            { videoId: "ictKhF92-pY", label: "Application Rubio Monocoat Oil Plus 2C sur meuble", productName: "Rubio Monocoat Oil Plus 2C (Pure/Incolore)" },
            { videoId: "EZ2w0DBLkTI", label: "Comment appliquer Osmo PolyX Oil sur un meuble", productName: "Osmo Polyx-Oil 3032 MAT" },
            { videoId: "KfHoHFA7Av8", label: "John Boos Mystery Oil & Board Cream — entretien planche", productName: "John Boos Mystery Oil (473ml)" }
        ]
    },
    {
        id: 'cires',
        title: "Patine & Finition",
        subtitle: "Cires, Peintures & Effets",
        description: "Sublimez vos meubles avec des cires authentiques, peintures naturelles ou effets décorés. Maintenez l'âme de l'ancien ou créez de nouveaux styles sans compromettre la qualité du bois.",
        tutorials: [
            { videoId: "zhV4UVEC_Gg", label: "Effet patiné avec la patine Libéron", productName: "Libéron Teinte Antiquaire (Merisier / Chêne)" },
            { videoId: "sIXtHjSiIRY", label: "Cire Black Bison Libéron — application sur meuble", productName: "Libéron Black Bison Incolore 500ml" },
            { videoId: "lRTlQNcmyig", label: "Peinture Rust-Oleum Chalky Finish sur meuble", productName: "Rust-Oleum Chalky Finish (Peinture à la Craie)" },
            { videoId: "wh7EQGOqnfI", label: "Créer une table rivière en résine époxy", productName: "Resin Pro — Résine Époxy Ultra Transparente (3.2 Kg)" }
        ]
    },
    {
        id: 'savons',
        title: "Le Geste Quotidien",
        subtitle: "Savons & Nettoyants",
        description: "Évitez les produits chimiques qui agressent vos meubles. Entretenez la beauté de votre table jour après jour avec des nettoyants très doux conçus pour les surfaces huilées.",
        tutorials: [
            { videoId: "2PjMXVGfA_k", label: "Nettoyage bois avec Rubio Monocoat Wood Cleaner", productName: "Rubio Monocoat Wood Cleaner" },
            { videoId: "ulx9fAGC7BM", label: "Entretien quotidien surfaces bois huilées", productName: "Osmo Wash & Care 8016 (1L)" }
        ]
    },
    {
        id: 'accessoires',
        title: "L'Essentiel du Quotidien",
        subtitle: "Accessoires Essentiels",
        description: "Les petits indispensables qui font la différence. Le matériel de consommation régulière pour un entretien optimal sans friction.",
        tutorials: [
            { videoId: "sVXN8ASgzi4", label: "Choisir le bon pinceau pour vos finitions bois", productName: "Libéron Pinceau Plat \"Le Spalter\"" }
        ]
    },
    {
        id: 'renovation',
        title: "Seconde Jeunesse",
        subtitle: "Décapage & Retouches",
        description: "Transformez vos meubles fatigués. Décapez efficacement, éliminez les taches sans poncer, ou retouchez précisément les accidents du quotidien.",
        tutorials: [
            { videoId: "0lAtz_V4Xl4", label: "Décapant bois V33 — mode d'emploi", productName: "V33 Décapant Bois Gel Express (1L)" },
            { videoId: "GIB3HJeQgp8", label: "Décaper efficacement un meuble en bois", productName: "Libéron Rénovateur pour Meubles" }
        ]
    },
    {
        id: 'outils',
        title: "La Boîte à Outils",
        subtitle: "Outils & Matériel Pro",
        description: "Les compagnons fidèles de l'artisan. Pinceaux, rouleaux, ciseaux, presses, racloirs — tout le matériel pour travailler comme un pro avec précision et finesse.",
        tutorials: [
            { videoId: "yAn3HTURb6U", label: "Sélectionner les bons outils de finition bois", productName: "Libéron Pinceau Plat \"Le Spalter\" (40mm)" },
            { videoId: "IVAvfGG2lmU", label: "Affûtage d'un racloir d'ébéniste", productName: "Bahco 474 Racloir d'Ébéniste / Kit Kirschen" },
            { videoId: "ECMVRc5N3K0", label: "Les racloirs : affûter, préparer, utiliser", productName: "Kit Premium Kirschen (Affiloir + 3 Racloirs)" }
        ]
    }
];

const RITUAL_WORDS = ['NOURRIR', 'PROTEGER', 'RESTAURER'];

const ShopView = ({ affiliateProducts = [], darkMode = false, setHeaderProps }) => {
    const [activeRitualIndex, setActiveRitualIndex] = useState(0);
    const [typedRitualWord, setTypedRitualWord] = useState('');
    const [isDeletingRitualWord, setIsDeletingRitualWord] = useState(false);
    const [activeCategory, setActiveCategory] = useState(null);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [tutorialIndexes, setTutorialIndexes] = useState({});

    const getTutorialIndex = (categoryId) => tutorialIndexes[categoryId] || 0;
    const setTutorialIndex = (categoryId, idx) => setTutorialIndexes(prev => ({ ...prev, [categoryId]: idx }));

    useEffect(() => {
        if (setHeaderProps) {
            setHeaderProps({
                title: "L'Atelier",
                hideCollectionFilter: true,
                hideAuctionFilter: true
            });
        }
        return () => {
            if (setHeaderProps) setHeaderProps(null);
        };
    }, [setHeaderProps]);

    useGSAP(() => {
        const split = new SplitType(".hero-reveal", { types: "lines" });
        split.lines.forEach(l => {
            const w = document.createElement("div");
            w.style.overflow = "hidden";
            l.parentNode.insertBefore(w, l);
            w.appendChild(l);
        });
        gsap.from(split.lines, {
            yPercent: 100,
            opacity: 0,
            stagger: 0.1,
            duration: 1.4,
            ease: "power4.out",
            delay: 0.1
        });

        // Effect for the grid
        gsap.utils.toArray('.product-grid').forEach(grid => {
            gsap.from(grid, {
                y: 80,
                opacity: 0,
                duration: 1.2,
                ease: "power4.out",
                scrollTrigger: {
                    trigger: grid,
                    start: "top 85%",
                }
            });
        });

    }, [affiliateProducts.length]);

    useEffect(() => {
        const currentWord = RITUAL_WORDS[activeRitualIndex];
        const typeDelay = 145;
        const eraseDelay = 55;
        const holdDelay = 2800;
        let timeoutId;

        if (!isDeletingRitualWord && typedRitualWord === currentWord) {
            timeoutId = setTimeout(() => setIsDeletingRitualWord(true), holdDelay);
            return () => clearTimeout(timeoutId);
        }

        if (isDeletingRitualWord && typedRitualWord === '') {
            setIsDeletingRitualWord(false);
            setActiveRitualIndex((prev) => (prev + 1) % RITUAL_WORDS.length);
            return undefined;
        }

        timeoutId = setTimeout(() => {
            setTypedRitualWord((prev) => {
                if (isDeletingRitualWord) {
                    return currentWord.slice(0, Math.max(prev.length - 1, 0));
                }
                return currentWord.slice(0, prev.length + 1);
            });
        }, isDeletingRitualWord ? eraseDelay : typeDelay);

        return () => clearTimeout(timeoutId);
    }, [activeRitualIndex, typedRitualWord, isDeletingRitualWord]);

    const getProductsForFamily = (familyId) => {
        return affiliateProducts.filter(p => {
            return p.category === familyId;
        }).sort((a, b) => {
            const tierOrder = { expert: 3, premium: 2, essentiel: 1 };
            const aTier = tierOrder[a.tier] || 0;
            const bTier = tierOrder[b.tier] || 0;
            if (bTier !== aTier) return bTier - aTier;
            return (Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
        });
    };

    const getAllProducts = () => {
        return affiliateProducts.sort((a, b) => {
            const tierOrder = { expert: 3, premium: 2, essentiel: 1 };
            const aTier = tierOrder[a.tier] || 0;
            const bTier = tierOrder[b.tier] || 0;
            if (bTier !== aTier) return bTier - aTier;
            return (Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
        });
    };

    const getFilteredProducts = () => {
        if (!activeCategory) return getAllProducts();
        return getProductsForFamily(activeCategory);
    };

    const filteredProducts = getFilteredProducts();

    return (
        <div className={`min-h-screen animate-in fade-in duration-500 ${darkMode ? 'bg-[#0a0a0a]' : 'bg-[#FAFAF9]'}`}>
            <SEO
                title="L'Atelier - Soin et Entretien du Bois"
                description="Notre sélection de produits professionnels pour protéger, nourrir et restaurer vos meubles en bois massif. Huiles, cires et savons testés à l'atelier."
                url="/?page=shop"
            />

            {/* HERO SECTION - Cinematic Editorial Style avec WorkshopHero */}
            <section className="relative min-h-fit sm:min-h-[85vh] flex flex-col justify-start md:justify-end px-6 xl:px-12 pb-8 sm:pb-16 md:pb-24 pt-3 sm:pt-6 md:pt-[250px] overflow-hidden">
                <WorkshopHero darkMode={darkMode} />

                {/* Top Section - Rituel Bois */}
                <div className="relative md:absolute order-1 md:-order-none left-0 md:left-5 sm:left-6 xl:left-12 md:top-[75px] sm:top-24 md:top-32 lg:top-10 z-10 pointer-events-none">
                    <style>{`
                        @keyframes ritualLetterIn {
                            0% { opacity: 0; filter: blur(5px); transform: translateY(7px) scale(0.985); }
                            100% { opacity: 1; filter: blur(0px); transform: translateY(0) scale(1); }
                        }
                    `}</style>
                    <div className="space-y-4 sm:space-y-5 md:space-y-7">
                        <div className="flex items-center gap-3 hero-reveal">
                            <span className={`h-px w-12 ${darkMode ? 'bg-white/15' : 'bg-stone-300/90'}`} />
                            <span className={`text-[10px] uppercase tracking-[0.28em] font-black ${darkMode ? 'text-stone-500' : 'text-stone-500'}`}>
                                Rituel Bois
                            </span>
                        </div>

                        <div className="leading-[0.85]">
                            <div className={`font-serif text-[2rem] sm:text-[2.6rem] xl:text-[4rem] tracking-tight ${darkMode ? 'text-white' : 'text-stone-900'}`}>
                                <span className={`inline-block transition-all duration-300 ${isDeletingRitualWord ? 'blur-[1.8px] opacity-80' : 'blur-0 opacity-100'} ${darkMode ? 'text-amber-300' : 'text-amber-800'}`}>
                                    {typedRitualWord.split('').map((char, idx, arr) => (
                                        <span
                                            key={`${activeRitualIndex}-${idx}-${arr.length}`}
                                            style={{
                                                display: 'inline-block',
                                                animation: !isDeletingRitualWord && idx === arr.length - 1
                                                    ? 'ritualLetterIn 500ms cubic-bezier(0.16,0.84,0.25,1)'
                                                    : 'none'
                                            }}
                                        >
                                            {char}
                                        </span>
                                    ))}
                                </span>
                                <span className={`ml-2 font-black animate-pulse text-[1.7rem] xl:text-[2.4rem] ${darkMode ? 'text-amber-400/90' : 'text-amber-700/90'}`}>
                                    |
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2.5">
                            {RITUAL_WORDS.map((word, idx) => (
                                <span
                                    key={word}
                                    className={`px-2.5 py-1 rounded-full text-[9px] uppercase tracking-[0.18em] font-black transition-colors duration-300 flex-shrink-0 ${idx === activeRitualIndex
                                        ? (darkMode ? 'bg-amber-400/20 text-amber-300 border border-amber-300/35' : 'bg-amber-700/15 text-amber-800 border border-amber-700/30')
                                        : (darkMode ? 'bg-white/5 text-stone-500 border border-white/10' : 'bg-stone-200/40 text-stone-500 border border-stone-300/70')
                                    }`}
                                >
                                    {word}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
                
                <div className={`absolute top-0 right-0 w-[50vw] h-[50vw] md:w-[30vw] md:h-[30vw] rounded-full blur-[100px] opacity-20 pointer-events-none z-0 ${darkMode ? 'bg-amber-500/20' : 'bg-amber-700/10'}`} />
                
                {/* Bottom Section - Le Soin du Bois */}
                <div className="order-3 md:-order-none max-w-[1920px] mx-auto w-full space-y-2 sm:space-y-4 md:space-y-6 lg:space-y-8 relative z-10 sm:mt-0">
                    <h1 className={`hero-reveal font-serif text-[3.6rem] min-[400px]:text-[3.8rem] sm:text-6xl md:text-[3.5rem] lg:text-7xl xl:text-[11.5rem] leading-[0.85] tracking-tighter ${darkMode ? 'text-white' : 'text-stone-900'} w-full md:w-[48%] lg:w-[45%] xl:w-auto`}>
                        Le Soin <br className="hidden md:block" />du Bois.
                    </h1>
                    <div className="hero-reveal w-[90%] sm:w-[85%] md:w-[45%] lg:w-[40%] xl:w-full xl:max-w-2xl">
                        <p className={`text-sm md:text-base lg:text-lg xl:text-xl leading-relaxed ${darkMode ? 'text-stone-400' : 'text-stone-500'} w-full`}>
                            Le bois massif est vivant. Protégez, nourrissez et restaurez vos créations avec notre sélection pointue des meilleurs produits d'entretien. Exclusivement testés et validés par l'atelier.
                        </p>
                    </div>
                </div>
            </section>

            {/* PRODUCTS SECTION - Avec Sidebar Latérale */}
            <div className="relative">
                {/* SIDEBAR - Desktop Fixed Left + Mobile Drawer */}
                <ShopSidebar
                    categories={FAMILIES.filter(f => getProductsForFamily(f.id).length > 0)}
                    activeCategory={activeCategory}
                    onCategoryChange={setActiveCategory}
                    darkMode={darkMode}
                    isMobileOpen={isMobileSidebarOpen}
                    onMobileClose={() => setIsMobileSidebarOpen(false)}
                />

                {/* MOBILE FLOATING BUTTON - Ouvre le drawer */}
                <motion.button
                    onClick={() => setIsMobileSidebarOpen(true)}
                    className={`
                        lg:hidden fixed bottom-6 right-6 z-40
                        w-14 h-14 rounded-full
                        flex items-center justify-center
                        shadow-2xl backdrop-blur-xl
                        transition-all duration-300
                        ${darkMode 
                            ? 'bg-amber-500/90 hover:bg-amber-500 text-white' 
                            : 'bg-amber-600/90 hover:bg-amber-600 text-white'
                        }
                    `}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    <SlidersHorizontal size={20} />
                </motion.button>

                {/* PRODUCTS GRID - Filtrage avec Animations */}
                <section className={`min-h-screen pt-6 lg:pt-12 pb-12 px-6 xl:px-12 lg:pl-[320px] xl:pl-[360px] ${darkMode ? 'bg-[#0a0a0a]' : 'bg-[#FAFAF9]'}`}>
                <div className="max-w-[1920px] mx-auto">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeCategory || 'all'}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4 }}
                        >
                            {/* Editorial Header si catégorie active */}
                            {activeCategory && (() => {
                                const family = FAMILIES.find(f => f.id === activeCategory);
                                if (!family) return null;
                                return (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2, duration: 0.6 }}
                                        className="mb-12 max-w-2xl"
                                    >
                                        <div className="flex items-center gap-4 mb-6">
                                            <span className={`w-8 h-px ${darkMode ? 'bg-white/20' : 'bg-stone-300'}`}></span>
                                            <span className={`text-[10px] md:text-[11px] font-black uppercase tracking-widest ${darkMode ? 'text-amber-500' : 'text-amber-700'}`}>
                                                {family.subtitle}
                                            </span>
                                        </div>
                                        <h2 className={`font-serif text-4xl md:text-5xl xl:text-6xl leading-[0.9] tracking-tighter mb-6 ${darkMode ? 'text-white' : 'text-stone-900'}`}>
                                            {family.title}
                                        </h2>
                                        <p className={`text-sm md:text-base leading-relaxed ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                                            {family.description}
                                        </p>
                                    </motion.div>
                                );
                            })()}

                            {/* Grille de Produits */}
                            <motion.div
                                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8"
                                initial="hidden"
                                animate="show"
                                variants={{
                                    hidden: { opacity: 0 },
                                    show: {
                                        opacity: 1,
                                        transition: {
                                            staggerChildren: 0.05,
                                            delayChildren: 0.2
                                        }
                                    }
                                }}
                            >
                                {filteredProducts.map((product, index) => (
                                    <React.Fragment key={product.id}>
                                        <motion.div
                                            layoutId={`product-${product.id}`}
                                            variants={{
                                                hidden: { opacity: 0, y: 20 },
                                                show: {
                                                    opacity: 1,
                                                    y: 0,
                                                    transition: {
                                                        duration: 0.8,
                                                        ease: [0.22, 1, 0.36, 1]
                                                    }
                                                }
                                            }}
                                        >
                                            <ShopProductCard
                                                product={product}
                                                darkMode={darkMode}
                                            />
                                        </motion.div>

                                        {/* Bloc Éditorial Inline après le 4ème produit */}
                                        {activeCategory && index === 3 && (() => {
                                            const family = FAMILIES.find(f => f.id === activeCategory);
                                            if (!family) return null;
                                            return (
                                                <motion.div
                                                    key="editorial-block"
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.3, duration: 0.8 }}
                                                    className="col-span-2 sm:col-span-3 lg:col-span-4 p-8 lg:p-12 rounded-[28px] backdrop-blur-xl bg-gradient-to-br from-amber-500/5 to-stone-800/20 border border-white/5"
                                                >
                                                    {(() => {
                                                        const tutorials = family.tutorials || [];
                                                        const currentIdx = getTutorialIndex(family.id);
                                                        const currentTutorial = tutorials[currentIdx];
                                                        return (
                                                            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 lg:items-stretch">
                                                                {/* Texte */}
                                                                <div className="flex-1 min-w-0 flex flex-col">
                                                                    <p className={`text-[10px] uppercase tracking-[0.28em] font-black mb-3 ${darkMode ? 'text-amber-500' : 'text-amber-700'}`}>
                                                                        {family.subtitle} · Tuto Atelier
                                                                    </p>
                                                                    <h3 className={`text-3xl lg:text-4xl font-serif leading-tight mb-4 ${darkMode ? 'text-stone-50' : 'text-stone-900'}`}>
                                                                        {family.title}
                                                                    </h3>
                                                                    <p className={`text-base leading-relaxed opacity-80 ${darkMode ? 'text-stone-300' : 'text-stone-600'}`}>
                                                                        {family.description}
                                                                    </p>
                                                                    {/* Mini carte produit lié à la vidéo — centrée verticalement dans l'espace restant */}
                                                                    <div className="flex-1 flex items-center">
                                                                    {(() => {
                                                                        if (!currentTutorial?.productName) return null;
                                                                        const linked = affiliateProducts.find(p =>
                                                                            p.name?.toLowerCase().includes(currentTutorial.productName.toLowerCase().slice(0, 20)) ||
                                                                            currentTutorial.productName.toLowerCase().includes((p.name || '').toLowerCase().slice(0, 20))
                                                                        );
                                                                        if (linked) {
                                                                            return (
                                                                                <AnimatePresence mode="wait">
                                                                                    <motion.div
                                                                                        key={linked.id}
                                                                                        initial={{ opacity: 0, y: 8 }}
                                                                                        animate={{ opacity: 1, y: 0 }}
                                                                                        exit={{ opacity: 0, y: -8 }}
                                                                                        transition={{ duration: 0.3 }}
                                                                                        className={`mt-0 flex items-stretch gap-7 p-6 rounded-2xl border w-full ${darkMode ? 'bg-white/5 border-white/8' : 'bg-white/70 border-stone-200/80'}`}
                                                                                    >
                                                                                        {linked.imageUrl && (
                                                                                            <div className="w-32 h-32 rounded-xl overflow-hidden flex-shrink-0 self-center">
                                                                                                <img
                                                                                                    src={linked.imageUrl}
                                                                                                    alt={linked.name}
                                                                                                    className="w-full h-full object-cover"
                                                                                                    loading="lazy"
                                                                                                />
                                                                                            </div>
                                                                                        )}
                                                                                        <div className="flex-1 min-w-0 flex flex-col">
                                                                                            <div className="space-y-2">
                                                                                                <p className={`text-[10px] font-black uppercase tracking-widest ${darkMode ? 'text-amber-500/80' : 'text-amber-700/80'}`}>
                                                                                                    {linked.brand}
                                                                                                </p>
                                                                                                <p className={`text-lg font-semibold leading-snug line-clamp-2 ${darkMode ? 'text-stone-100' : 'text-stone-900'}`}>
                                                                                                    {linked.name}
                                                                                                </p>
                                                                                                {linked.price && (
                                                                                                    <p className={`text-sm ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                                                                                                        {Number(linked.price).toFixed(2).replace('.', ',')} EUR
                                                                                                    </p>
                                                                                                )}
                                                                                            </div>
                                                                                            <div className="mt-auto pt-4 flex justify-end">
                                                                                                <a
                                                                                                    href={linked.affiliateUrl}
                                                                                                    target="_blank"
                                                                                                    rel="noopener noreferrer sponsored"
                                                                                                    className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-[11px] font-semibold transition-all duration-200 ${darkMode ? 'bg-amber-500/15 border border-amber-500/30 text-amber-400 hover:bg-amber-500/25' : 'bg-amber-600/10 border border-amber-600/25 text-amber-700 hover:bg-amber-600/20'}`}
                                                                                                >
                                                                                                    Découvrir <span>→</span>
                                                                                                </a>
                                                                                            </div>
                                                                                        </div>
                                                                                    </motion.div>
                                                                                </AnimatePresence>
                                                                            );
                                                                        }
                                                                        return (
                                                                            <div className={`flex items-center gap-2 text-[10px] opacity-50 ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                                                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                                                                                <span className="font-medium">{currentTutorial.productName}</span>
                                                                                <span className={`ml-1 px-2 py-0.5 rounded-full border text-[9px] ${darkMode ? 'border-white/10 text-stone-500' : 'border-stone-200 text-stone-400'}`}>
                                                                                    À ajouter dans l'admin
                                                                                </span>
                                                                            </div>
                                                                        );
                                                                    })()}
                                                                    </div>
                                                                </div>
                                                                {/* Carrousel Vidéo */}
                                                                {tutorials.length > 0 && (
                                                                    <div className="w-full lg:w-[52%] flex-shrink-0">
                                                                        <div className="relative">
                                                                            {/* Player */}
                                                                            <AnimatePresence mode="wait">
                                                                                <motion.div
                                                                                    key={currentTutorial?.videoId}
                                                                                    initial={{ opacity: 0, x: 20 }}
                                                                                    animate={{ opacity: 1, x: 0 }}
                                                                                    exit={{ opacity: 0, x: -20 }}
                                                                                    transition={{ duration: 0.35 }}
                                                                                    className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl"
                                                                                >
                                                                                    <iframe
                                                                                        src={`https://www.youtube.com/embed/${currentTutorial?.videoId}?rel=0&modestbranding=1&color=white`}
                                                                                        title={currentTutorial?.label}
                                                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                                                                        allowFullScreen
                                                                                        loading="lazy"
                                                                                        className="absolute inset-0 w-full h-full"
                                                                                    />
                                                                                </motion.div>
                                                                            </AnimatePresence>
                                                                            {/* Flèches navigation (si plusieurs vidéos) */}
                                                                            {tutorials.length > 1 && (
                                                                                <>
                                                                                    <button
                                                                                        onClick={() => setTutorialIndex(family.id, (currentIdx - 1 + tutorials.length) % tutorials.length)}
                                                                                        className={`absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 ${darkMode ? 'bg-[#1a1a1a] border border-white/10 text-stone-300 hover:bg-amber-500/20 hover:border-amber-500/30' : 'bg-white border border-stone-200 text-stone-600 hover:bg-amber-50 hover:border-amber-300'}`}
                                                                                    >
                                                                                        <ChevronLeft size={14} />
                                                                                    </button>
                                                                                    <button
                                                                                        onClick={() => setTutorialIndex(family.id, (currentIdx + 1) % tutorials.length)}
                                                                                        className={`absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 ${darkMode ? 'bg-[#1a1a1a] border border-white/10 text-stone-300 hover:bg-amber-500/20 hover:border-amber-500/30' : 'bg-white border border-stone-200 text-stone-600 hover:bg-amber-50 hover:border-amber-300'}`}
                                                                                    >
                                                                                        <ChevronRight size={14} />
                                                                                    </button>
                                                                                </>
                                                                            )}
                                                                        </div>
                                                                        {/* Label + Dots */}
                                                                        <div className="mt-3 flex items-center justify-between gap-3">
                                                                            <p className={`text-[10px] tracking-wide opacity-50 truncate ${darkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                                                                                ▶ {currentTutorial?.label}
                                                                            </p>
                                                                            {tutorials.length > 1 && (
                                                                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                                                                    {tutorials.map((_, i) => (
                                                                                        <button
                                                                                            key={i}
                                                                                            onClick={() => setTutorialIndex(family.id, i)}
                                                                                            className={`rounded-full transition-all duration-300 ${
                                                                                                i === currentIdx
                                                                                                    ? `w-4 h-1.5 ${darkMode ? 'bg-amber-500' : 'bg-amber-600'}`
                                                                                                    : `w-1.5 h-1.5 ${darkMode ? 'bg-white/20 hover:bg-white/40' : 'bg-stone-300 hover:bg-stone-400'}`
                                                                                            }`}
                                                                                        />
                                                                                    ))}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })()}
                                                </motion.div>
                                            );
                                        })()}

                                    </React.Fragment>
                                ))}
                            </motion.div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </section>
            </div>

            {/* INFO AFFILIATE FOOTER */}
            <section className={`py-12 px-6 md:px-12 ${darkMode ? 'bg-[#0a0a0a]' : 'bg-[#FAFAF9]'}`}>
                <div className={`max-w-[1920px] mx-auto flex flex-col md:flex-row items-center justify-center gap-3 text-[10px] text-center md:text-left ${darkMode ? 'text-stone-500' : 'text-stone-400'}`}>
                    <Info size={14} className={darkMode ? 'text-amber-500' : 'text-amber-600'} />
                    <p className="max-w-2xl leading-relaxed">
                        Cette vitrine contient des liens du Programme Partenaires. En achetant vos produits d'entretien via ces liens, vous soutenez le travail de l'atelier sans aucun surcoût pour vous. <br className="hidden md:block"/>
                        <a href="/mentions-legales#affiliation" className="underline underline-offset-4 hover:text-stone-900 dark:hover:text-white transition-colors">Notre politique de transparence</a>
                    </p>
                </div>
            </section>
        </div>
    );
};

export default ShopView;
