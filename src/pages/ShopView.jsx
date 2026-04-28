import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, appId } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { Info, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SEO from '../components/shared/SEO';
import ShopProductCard from '../components/shop/ShopProductCard';
import ShopSidebar from '../components/shop/ShopSidebar';
import WorkshopHero from '../components/shop/WorkshopHero';
import LazyYouTubeEmbed from '../components/ui/LazyYouTubeEmbed';
import { scrollToTarget } from '../utils/smoothScroll';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';
import { trackAffiliateClick } from '../utils/tracking';

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
            { videoId: "IVAvfGG2lmU", label: "Affûtage d'un racloir d'ébéniste", productName: "Bahco 474 Racloir d'Ébéniste / Kit Kirschen" },
            { videoId: "ECMVRc5N3K0", label: "Les racloirs : affûter, préparer, utiliser", productName: "Kit Premium Kirschen (Affiloir + 3 Racloirs)" }
        ]
    }
];

const RITUAL_WORDS = ['NOURRIR', 'PROTEGER', 'RESTAURER'];

const sortShopProducts = (products) => [...products].sort((a, b) => {
    const tierOrder = { expert: 3, premium: 2, essentiel: 1 };
    const aTier = tierOrder[a.tier] || 0;
    const bTier = tierOrder[b.tier] || 0;
    if (bTier !== aTier) return bTier - aTier;
    return (Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
});

const ShopView = ({ affiliateProducts = [], darkMode = false, setHeaderProps }) => {
    const { isAdmin } = useAuth();
    
    const handleTutorialClick = async (event, linkedProduct) => {
        event.preventDefault();
        trackAffiliateClick({
            product: linkedProduct,
            source: 'shop_tutorial',
            isAdmin
        });
    };

    const [activeRitualIndex, setActiveRitualIndex] = useState(0);
    const [typedRitualWord, setTypedRitualWord] = useState('');
    const [isDeletingRitualWord, setIsDeletingRitualWord] = useState(false);
    const [activeCategory, setActiveCategory] = useState(null);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [tutorialIndexes, setTutorialIndexes] = useState({});
    const [firestoreTutorials, setFirestoreTutorials] = useState([]);
    const isProgrammaticScrollRef = useRef(false);

    const getTutorialIndex = (categoryId) => tutorialIndexes[categoryId] || 0;
    const setTutorialIndex = (categoryId, idx) => setTutorialIndexes(prev => ({ ...prev, [categoryId]: idx }));

    // Charger les tutoriels depuis Firestore (temps réel)
    useEffect(() => {
        const colRef = collection(db, 'artifacts', appId, 'public', 'data', 'shop_tutorials');
        const q = query(colRef, orderBy('order', 'asc'));
        const unsub = onSnapshot(q, snap => {
            setFirestoreTutorials(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        }, () => {});
        return () => unsub();
    }, []);

    // Fusionner les tutoriels Firestore avec les FAMILIES statiques (fallback)
    const getFamilyTutorials = useMemo(() => {
        const tutorialsByCategory = {};
        FAMILIES.forEach(f => { tutorialsByCategory[f.id] = f.tutorials || []; });
        // Les catégories ayant des tutoriels Firestore écrasent les tutoriels statiques correspondants
        if (firestoreTutorials.length > 0) {
            const firestoreCategories = new Set(firestoreTutorials.map(t => t.category));
            firestoreCategories.forEach(cat => {
                tutorialsByCategory[cat] = [];
            });
            firestoreTutorials.forEach(t => {
                if (tutorialsByCategory[t.category] !== undefined) {
                    tutorialsByCategory[t.category].push(t);
                }
            });
            // Trier les tutoriels Firestore par ordre
            firestoreCategories.forEach(cat => {
                if (tutorialsByCategory[cat]) {
                    tutorialsByCategory[cat].sort((a,b) => (a.order || 0) - (b.order || 0));
                }
            });
        }
        return tutorialsByCategory;
    }, [firestoreTutorials]);

    const productsByFamily = useMemo(() => {
        const buckets = {};
        FAMILIES.forEach((family) => {
            buckets[family.id] = [];
        });
        affiliateProducts.forEach((product) => {
            if (buckets[product.category]) {
                buckets[product.category].push(product);
            }
        });
        Object.keys(buckets).forEach((familyId) => {
            buckets[familyId] = sortShopProducts(buckets[familyId]);
        });
        return buckets;
    }, [affiliateProducts]);

    const visibleFamilies = useMemo(
        () => FAMILIES.filter((family) => (productsByFamily[family.id] || []).length > 0),
        [productsByFamily]
    );

    useEffect(() => {
        if (setHeaderProps) {
            setHeaderProps({
                title: "Le Comptoir",
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

        return () => {
            split.revert();
        };
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

    // Scrollspy — highlight sidebar item matching the section currently in view
    useEffect(() => {
        if (affiliateProducts.length === 0) return;
        const observers = [];
        FAMILIES.forEach(family => {
            const el = document.getElementById(`section-${family.id}`);
            if (!el) return;
            const observer = new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting && !isProgrammaticScrollRef.current) {
                        setActiveCategory(family.id);
                    }
                },
                { rootMargin: '-100px 0px -55% 0px', threshold: 0 }
            );
            observer.observe(el);
            observers.push(observer);
        });
        return () => observers.forEach(o => o.disconnect());
    }, [affiliateProducts.length]);

    const getProductsForFamily = useCallback((familyId) => {
        return productsByFamily[familyId] || [];
    }, [productsByFamily]);

    const handleCategoryChange = useCallback((cat) => {
        isProgrammaticScrollRef.current = true;
        setActiveCategory(cat);

        const targetId = cat ? `section-${cat}` : 'products-grid-section';
        setTimeout(() => {
            const elem = document.getElementById(targetId);
            if (elem) {
                scrollToTarget(elem, { offset: -100, duration: 0.95 });
            }
            // Re-enable scrollspy after scroll animation completes (~1s)
            setTimeout(() => { isProgrammaticScrollRef.current = false; }, 1000);
        }, 10);
    }, []);

    return (
        <div className={`min-h-screen animate-in fade-in duration-500 ${darkMode ? 'bg-[#0a0a0a]' : 'bg-[#FAFAF9]'}`}>
            <SEO
                title="Le Comptoir - Soin et Entretien du Bois"
                description="Notre sélection de produits professionnels pour protéger, nourrir et restaurer vos meubles en bois massif. Huiles, cires et savons testés à l'atelier."
                url="/?page=shop"
            />

            {/* HERO SECTION */}
            <section className="relative min-h-fit sm:min-h-[85vh] flex flex-col justify-start md:justify-end px-6 xl:px-12 pb-8 sm:pb-16 md:pb-24 pt-3 sm:pt-6 md:pt-[250px] overflow-hidden">
                <WorkshopHero darkMode={darkMode} />

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

                <div className="order-3 md:-order-none max-w-[1920px] mx-auto w-full space-y-2 sm:space-y-4 md:space-y-6 lg:space-y-8 relative z-10 sm:mt-0 pointer-events-none">
                    <h1 className={`hero-reveal font-serif text-[3.6rem] min-[400px]:text-[3.8rem] sm:text-6xl md:text-[3.5rem] lg:text-7xl xl:text-[11.5rem] leading-[0.85] tracking-tighter ${darkMode ? 'text-white' : 'text-stone-900'} w-full md:w-[48%] lg:w-[45%] xl:w-auto pointer-events-auto`}>
                        Le Soin <br className="hidden md:block" />du Bois.
                    </h1>
                    <div className="hero-reveal w-[90%] sm:w-[85%] md:w-[45%] lg:w-[40%] xl:w-full xl:max-w-2xl pointer-events-auto">
                        <p className={`text-sm md:text-base lg:text-lg xl:text-xl leading-relaxed ${darkMode ? 'text-stone-400' : 'text-stone-500'} w-full`}>
                            Le bois massif est vivant. Protégez, nourrissez et restaurez vos créations avec notre sélection pointue des meilleurs produits d'entretien. Exclusivement testés et validés par l'atelier.
                        </p>
                    </div>
                </div>
            </section>

            {/* PRODUCTS SECTION */}
            <div className="relative">
                <ShopSidebar
                    categories={visibleFamilies}
                    activeCategory={activeCategory}
                    onCategoryChange={handleCategoryChange}
                    darkMode={darkMode}
                    isMobileOpen={isMobileSidebarOpen}
                    onMobileClose={() => setIsMobileSidebarOpen(false)}
                />

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

                {/* Sectioned content — all families in order */}
                <section
                    id="products-grid-section"
                    className={`min-h-screen pt-6 lg:pt-12 pb-20 px-6 xl:px-12 lg:pl-[320px] xl:pl-[360px] ${darkMode ? 'bg-[#0a0a0a]' : 'bg-[#FAFAF9]'}`}
                >
                    <div className="max-w-[1920px] mx-auto space-y-0">
                        {visibleFamilies.map((family, familyIndex) => {
                            const products = getProductsForFamily(family.id);

                            const tutorials = getFamilyTutorials[family.id] || [];
                            const currentIdx = getTutorialIndex(family.id);
                            const currentTutorial = tutorials[currentIdx];

                            return (
                                <section
                                    key={family.id}
                                    id={`section-${family.id}`}
                                    className="tat-heavy-section scroll-mt-28 pt-16 lg:pt-20"
                                >
                                    {/* Section separator */}
                                    {familyIndex > 0 && (
                                        <div className={`w-full h-px mb-16 ${darkMode ? 'bg-white/5' : 'bg-stone-200'}`} />
                                    )}

                                    {/* Section header */}
                                    <div className="mb-10 max-w-2xl">
                                        <div className="flex items-center gap-4 mb-5">
                                            <span className={`w-8 h-px ${darkMode ? 'bg-white/20' : 'bg-stone-300'}`} />
                                            <span className={`text-[10px] md:text-[11px] font-black uppercase tracking-widest ${darkMode ? 'text-amber-500' : 'text-amber-700'}`}>
                                                {family.subtitle}
                                            </span>
                                        </div>
                                        <h2 className={`font-serif text-4xl md:text-5xl xl:text-6xl leading-[0.9] tracking-tighter mb-5 ${darkMode ? 'text-white' : 'text-stone-900'}`}>
                                            {family.title}
                                        </h2>
                                        <p className={`text-sm md:text-base leading-relaxed ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                                            {family.description}
                                        </p>
                                    </div>

                                    {/* Products grid — editorial block inline after 4th card */}
                                    <div className="product-grid grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
                                        {products.map((product, index) => (
                                            <React.Fragment key={product.id}>
                                                <ShopProductCard
                                                    product={product}
                                                    darkMode={darkMode}
                                                />

                                                {/* Editorial / Video block inline after 4th product ou après le dernier si < 4 */}
                                                {(index === 3 || (products.length <= 3 && index === products.length - 1)) && tutorials.length > 0 && (
                                                <div className={`col-span-2 sm:col-span-3 lg:col-span-4 p-8 lg:p-12 rounded-[28px] backdrop-blur-xl bg-gradient-to-br from-amber-500/5 to-stone-800/20 border ${darkMode ? 'border-white/5' : 'border-stone-200/50'}`}>
                                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-6 sm:gap-y-8 lg:gap-x-12 lg:items-stretch">

                                                {/* Text */}
                                                <div className="lg:col-span-5 flex flex-col justify-center order-1 lg:order-none">
                                                    <p className={`text-[9px] sm:text-[10px] uppercase tracking-[0.28em] font-black mb-2 sm:mb-3 ${darkMode ? 'text-amber-500' : 'text-amber-700'}`}>
                                                        {family.subtitle} · Tuto Atelier
                                                    </p>
                                                    <h3 className={`text-2xl sm:text-3xl lg:text-4xl font-serif leading-tight mb-2 sm:mb-4 ${darkMode ? 'text-stone-50' : 'text-stone-900'}`}>
                                                        {family.title}
                                                    </h3>
                                                    <p className={`text-[12px] sm:text-sm lg:text-base leading-relaxed opacity-80 ${darkMode ? 'text-stone-300' : 'text-stone-600'}`}>
                                                        {family.description}
                                                    </p>
                                                </div>

                                                {/* Video carousel */}
                                                <div className="lg:col-span-7 lg:col-start-6 lg:row-start-1 lg:row-span-2 w-full flex-shrink-0 flex flex-col justify-center order-2 lg:order-none">
                                                    <div className="relative">
                                                        <AnimatePresence mode="wait">
                                                            <motion.div
                                                                key={currentTutorial?.videoId}
                                                                initial={{ opacity: 0, x: 20 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                exit={{ opacity: 0, x: -20 }}
                                                                transition={{ duration: 0.35 }}
                                                                className="relative aspect-video rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl"
                                                            >
                                                                <LazyYouTubeEmbed
                                                                    videoId={currentTutorial?.videoId}
                                                                    title={currentTutorial?.label}
                                                                    className="absolute inset-0 h-full w-full"
                                                                />
                                                            </motion.div>
                                                        </AnimatePresence>
                                                        {tutorials.length > 1 && (
                                                            <>
                                                                <button
                                                                    onClick={() => setTutorialIndex(family.id, (currentIdx - 1 + tutorials.length) % tutorials.length)}
                                                                    className={`hidden lg:flex absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full items-center justify-center shadow-lg transition-all duration-200 ${darkMode ? 'bg-[#1a1a1a] backdrop-blur-md border border-white/10 text-stone-300 hover:bg-amber-500/20 hover:border-amber-500/30' : 'bg-white backdrop-blur-md border border-stone-200 text-stone-600 hover:bg-amber-50 hover:border-amber-300'}`}
                                                                >
                                                                    <ChevronLeft size={14} />
                                                                </button>
                                                                <button
                                                                    onClick={() => setTutorialIndex(family.id, (currentIdx + 1) % tutorials.length)}
                                                                    className={`hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full items-center justify-center shadow-lg transition-all duration-200 ${darkMode ? 'bg-[#1a1a1a] backdrop-blur-md border border-white/10 text-stone-300 hover:bg-amber-500/20 hover:border-amber-500/30' : 'bg-white backdrop-blur-md border border-stone-200 text-stone-600 hover:bg-amber-50 hover:border-amber-300'}`}
                                                                >
                                                                    <ChevronRight size={14} />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                    <div className="mt-2.5 sm:mt-3 flex items-center justify-between gap-3">
                                                        <p className={`text-[9px] sm:text-[10px] tracking-wide opacity-50 truncate ${darkMode ? 'text-stone-400' : 'text-stone-600'}`}>
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
                                                                                ? `w-3 sm:w-4 h-1 sm:h-1.5 ${darkMode ? 'bg-amber-500' : 'bg-amber-600'}`
                                                                                : `w-1 sm:w-1.5 h-1 sm:h-1.5 ${darkMode ? 'bg-white/20 hover:bg-white/40' : 'bg-stone-300 hover:bg-stone-400'}`
                                                                        }`}
                                                                    />
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Linked product card */}
                                                <div className="lg:col-span-5 lg:col-start-1 lg:row-start-2 flex flex-col justify-end order-3 lg:order-none">
                                                    {(() => {
                                                        // Matching par productId (Firestore) — fallback sur productName (legacy)
                                                        let linked = null;
                                                        if (currentTutorial?.productId) {
                                                            linked = affiliateProducts.find(p => p.id === currentTutorial.productId);
                                                        }
                                                        if (!linked && currentTutorial?.productName) {
                                                            linked = affiliateProducts.find(p =>
                                                                p.name?.toLowerCase().includes(currentTutorial.productName.toLowerCase().slice(0, 20)) ||
                                                                currentTutorial.productName.toLowerCase().includes((p.name || '').toLowerCase().slice(0, 20))
                                                            );
                                                        }
                                                        if (linked) {
                                                            return (
                                                                <AnimatePresence mode="wait">
                                                                    <motion.div
                                                                        key={linked.id}
                                                                        initial={{ opacity: 0, y: 8 }}
                                                                        animate={{ opacity: 1, y: 0 }}
                                                                        exit={{ opacity: 0, y: -8 }}
                                                                        transition={{ duration: 0.3 }}
                                                                        className={`relative mt-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6 p-4 sm:p-5 lg:p-6 rounded-xl sm:rounded-2xl border w-full ${darkMode ? 'bg-white/5 border-white/8' : 'bg-white/70 border-stone-200/80'}`}
                                                                    >
                                                                        {tutorials.length > 1 && (
                                                                            <>
                                                                                <button
                                                                                    onClick={() => setTutorialIndex(family.id, (currentIdx - 1 + tutorials.length) % tutorials.length)}
                                                                                    className={`md:hidden absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shadow-xl transition-all duration-200 ${darkMode ? 'bg-[#1a1a1a] border border-white/10 text-stone-300' : 'bg-white border border-stone-200 text-stone-600'}`}
                                                                                >
                                                                                    <ChevronLeft size={14} />
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => setTutorialIndex(family.id, (currentIdx + 1) % tutorials.length)}
                                                                                    className={`md:hidden absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shadow-xl transition-all duration-200 ${darkMode ? 'bg-[#1a1a1a] border border-white/10 text-stone-300' : 'bg-white border border-stone-200 text-stone-600'}`}
                                                                                >
                                                                                    <ChevronRight size={14} />
                                                                                </button>
                                                                            </>
                                                                        )}
                                                                        {linked.imageUrl && (
                                                                            <div className="w-full sm:w-24 lg:w-32 h-36 sm:h-24 lg:h-32 rounded-lg sm:rounded-xl bg-[#e8d9c6] overflow-hidden flex-shrink-0 flex items-center justify-center p-2 mb-2 sm:mb-0">
                                                                                <img
                                                                                    src={linked.imageUrl}
                                                                                    alt={linked.name}
                                                                                    className="w-full h-full object-contain mix-blend-multiply"
                                                                                    loading="lazy"
                                                                                />
                                                                            </div>
                                                                        )}
                                                                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                                                                            <div className="space-y-1.5 sm:space-y-2">
                                                                                <p className={`text-[8.5px] sm:text-[9px] lg:text-[10px] font-black uppercase tracking-widest ${darkMode ? 'text-amber-500/80' : 'text-amber-700/80'}`}>
                                                                                    {linked.brand}
                                                                                </p>
                                                                                <p className={`text-sm sm:text-[15px] lg:text-lg font-semibold leading-snug line-clamp-2 ${darkMode ? 'text-stone-100' : 'text-stone-900'}`}>
                                                                                    {linked.name}
                                                                                </p>
                                                                                {linked.price && (
                                                                                    <p className={`text-[11px] sm:text-xs lg:text-sm ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                                                                                        {Number(linked.price).toFixed(2).replace('.', ',')} EUR
                                                                                    </p>
                                                                                )}
                                                                            </div>
                                                                            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 sm:mt-auto flex justify-start sm:justify-end border-t sm:border-0 border-stone-200/10 dark:border-white/5">
                                                                                <a
                                                                                    href={linked.affiliateUrl}
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer sponsored"
                                                                                    onClick={(e) => handleTutorialClick(e, linked)}
                                                                                    className={`inline-flex items-center justify-center w-full sm:w-auto gap-2 px-6 py-2.5 sm:py-2.5 rounded-full text-[10.5px] lg:text-[11px] font-semibold transition-all duration-200 ${darkMode ? 'bg-amber-500/15 border border-amber-500/30 text-amber-400 hover:bg-amber-500/25' : 'bg-amber-600/10 border border-amber-600/25 text-amber-700 hover:bg-amber-600/20'}`}
                                                                                >
                                                                                    Découvrir <span>→</span>
                                                                                </a>
                                                                            </div>
                                                                        </div>
                                                                    </motion.div>
                                                                </AnimatePresence>
                                                            );
                                                        }
                                                        if (!currentTutorial) return null;
                                                        return (
                                                            <div className={`flex items-center gap-2 text-[10px] opacity-50 ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                                                                <span className="font-medium">{currentTutorial.label || currentTutorial.productName}</span>
                                                            </div>
                                                        );
                                                    })()}
                                                </div>

                                            </div>
                                        </div>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                </section>
                            );
                        })}
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
