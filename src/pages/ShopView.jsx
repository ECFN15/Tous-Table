import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { collection, getDocs, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
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
import SplitType from 'split-type';
import { trackAffiliateClick } from '../utils/tracking';
import { getShopProductPath } from '../utils/seoRoutes';
import { warmupShopProductDetailIntent } from '../utils/startupWarmup';

const SHOP_TUTORIALS_CACHE_KEY = 'tat_shop_tutorials';

const getCachedShopTutorials = () => {
    if (typeof localStorage === 'undefined') return [];
    try {
        return JSON.parse(localStorage.getItem(SHOP_TUTORIALS_CACHE_KEY) || '[]') || [];
    } catch {
        return [];
    }
};

const FAMILIES = [
    {
        id: 'huiles',
        title: "Protection Profonde",
        subtitle: "Huiles & Nourrissants",
        description: "Le premier geste pour cherir un meuble en bois massif. Des huiles professionnelles qui penetrent au coeur des fibres pour une protection de l'interieur, respectant le grain et le toucher naturel. Inclut aussi les huiles alimentaires pour vos planches de decoupe artisanales.",
        tutorials: [
            { videoId: "ictKhF92-pY", label: "Application Rubio Monocoat Oil Plus 2C sur meuble", productName: "Rubio Monocoat Oil Plus 2C (Pure/Incolore)" },
            { videoId: "EZ2w0DBLkTI", label: "Comment appliquer Osmo PolyX Oil sur un meuble", productName: "Osmo Polyx-Oil 3032 MAT" },
            { videoId: "KfHoHFA7Av8", label: "John Boos Mystery Oil & Board Cream - entretien planche", productName: "John Boos Mystery Oil (473ml)" }
        ]
    },
    {
        id: 'cires',
        title: "Patine & Finition",
        subtitle: "Cires, Peintures & Effets",
        description: "Sublimez vos meubles avec des cires authentiques, peintures naturelles ou effets decores. Maintenez l'ame de l'ancien ou creez de nouveaux styles sans compromettre la qualite du bois.",
        tutorials: [
            { videoId: "zhV4UVEC_Gg", label: "Effet patine avec la patine Liberon", productName: "Liberon Teinte Antiquaire (Merisier / Chene)" },
            { videoId: "sIXtHjSiIRY", label: "Cire Black Bison Liberon - application sur meuble", productName: "Liberon Black Bison Incolore 500ml" },
            { videoId: "lRTlQNcmyig", label: "Peinture Rust-Oleum Chalky Finish sur meuble", productName: "Rust-Oleum Chalky Finish (Peinture a la Craie)" },
            { videoId: "wh7EQGOqnfI", label: "Creer une table riviere en resine epoxy", productName: "Resin Pro - Resine Epoxy Ultra Transparente (3.2 Kg)" }
        ]
    },
    {
        id: 'savons',
        title: "Le Geste Quotidien",
        subtitle: "Savons & Nettoyants",
        description: "Evitez les produits chimiques qui agressent vos meubles. Entretenez la beaute de votre table jour apres jour avec des nettoyants tres doux concus pour les surfaces huilees.",
        tutorials: [
            { videoId: "ulx9fAGC7BM", label: "Entretien quotidien surfaces bois huilees", productName: "Osmo Wash & Care 8016 (1L)" }
        ]
    },
    {
        id: 'accessoires',
        title: "L'Essentiel du Quotidien",
        subtitle: "Accessoires Essentiels",
        description: "Les petits indispensables qui font la difference. Le materiel de consommation reguliere pour un entretien optimal sans friction.",
        tutorials: [
            { videoId: "sVXN8ASgzi4", label: "Choisir le bon pinceau pour vos finitions bois", productName: "Liberon Pinceau Plat \"Le Spalter\"" }
        ]
    },
    {
        id: 'renovation',
        title: "Seconde Jeunesse",
        subtitle: "Decapage & Retouches",
        description: "Transformez vos meubles fatigues. Decapez efficacement, eliminez les taches sans poncer, ou retouchez precisement les accidents du quotidien.",
        tutorials: [
            { videoId: "0lAtz_V4Xl4", label: "Decapant bois V33 - mode d'emploi", productName: "V33 Decapant Bois Gel Express (1L)" },
            { videoId: "GIB3HJeQgp8", label: "Decaper efficacement un meuble en bois", productName: "Liberon Renovateur pour Meubles" }
        ]
    },
    {
        id: 'outils',
        title: "La Boite a Outils",
        subtitle: "Outils & Materiel Pro",
        description: "Les compagnons fideles de l'artisan. Pinceaux, rouleaux, ciseaux, presses, racloirs - tout le materiel pour travailler comme un pro avec precision et finesse.",
        tutorials: [
            { videoId: "IVAvfGG2lmU", label: "Affutage d'un racloir d'ebeniste", productName: "Bahco 474 Racloir d'Ebeniste / Kit Kirschen" },
            { videoId: "ECMVRc5N3K0", label: "Les racloirs : affuter, preparer, utiliser", productName: "Kit Premium Kirschen (Affiloir + 3 Racloirs)" }
        ]
    }
];

const RITUAL_WORDS = ['NOURRIR', 'PROTEGER', 'RESTAURER'];

const PRICE_FILTERS = [
    { id: 'all', label: 'Tous les prix', shortLabel: 'Tout', min: null, max: null },
    { id: 'under15', label: 'Moins de 15 EUR', shortLabel: '< 15', min: null, max: 15 },
    { id: '15to35', label: '15 a 35 EUR', shortLabel: '15-35', min: 15, max: 35 },
    { id: '35to70', label: '35 a 70 EUR', shortLabel: '35-70', min: 35, max: 70 },
    { id: 'over70', label: 'Plus de 70 EUR', shortLabel: '70+', min: 70, max: null },
];

const SHOP_SEO_FAQ = [
    {
        question: "Quels produits utiliser pour entretenir un meuble ancien en bois ?",
        answer: "Pour un meuble ancien en bois massif, il faut privilegier des produits doux et adaptes a la finition : huile pour nourrir, cire pour proteger une patine, savon naturel pour l'entretien courant et accessoires non abrasifs pour eviter de marquer le bois.",
    },
    {
        question: "Comment proteger une table en bois massif au quotidien ?",
        answer: "Une table en bois massif se protege avec une finition adaptee a son usage : huile dure, cire ou produit de protection specifique. L'entretien regulier doit rester doux, sans detergent agressif ni eponge abrasive.",
    },
    {
        question: "Le Comptoir convient-il aux meubles restaures et aux planches en bois ?",
        answer: "Oui. La selection couvre l'entretien des meubles restaures, tables de ferme, buffets, armoires, commodes, chaises, bancs et planches en bois massif, avec des produits choisis pour respecter la matiere.",
    },
];

const sortShopProducts = (products) => [...products].sort((a, b) => {
    const tierOrder = { expert: 3, premium: 2, essentiel: 1 };
    const aTier = tierOrder[a.tier] || 0;
    const bTier = tierOrder[b.tier] || 0;
    if (bTier !== aTier) return bTier - aTier;
    return (Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
});

const getProductPrice = (product) => {
    const price = Number(product?.price);
    return Number.isFinite(price) && price > 0 ? price : null;
};

const matchesPriceFilter = (product, filterId) => {
    const filter = PRICE_FILTERS.find((item) => item.id === filterId) || PRICE_FILTERS[0];
    if (filter.id === 'all') return true;
    const price = getProductPrice(product);
    if (price === null) return false;
    if (filter.min !== null && price < filter.min) return false;
    if (filter.max !== null && price >= filter.max) return false;
    return true;
};

const buildShopItemList = (products) => products
    .filter((product) => product?.name && getProductPrice(product))
    .slice(0, 24)
    .map((product, index) => {
        const price = getProductPrice(product);
        const description = product.description || product.whyWeRecommend || `${product.name} sélectionné par Tous à Table Made in Normandie.`;
        return {
            '@type': 'ListItem',
            position: index + 1,
            item: {
                '@type': 'Product',
                name: product.name,
                description: description.substring(0, 500),
                ...(product.brand ? { brand: { '@type': 'Brand', name: product.brand } } : {}),
                ...(product.imageUrl ? { image: product.imageUrl } : {}),
                offers: {
                    '@type': 'Offer',
                    priceCurrency: 'EUR',
                    price,
                    availability: 'https://schema.org/InStock',
                    url: 'https://tousatable-madeinnormandie.fr/comptoir',
                },
            },
        };
    });

const RitualWordLoop = React.memo(({ darkMode = false }) => {
    const [activeRitualIndex, setActiveRitualIndex] = useState(0);
    const [typedRitualWord, setTypedRitualWord] = useState('');
    const [isDeletingRitualWord, setIsDeletingRitualWord] = useState(false);

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

    return (
            <div className="space-y-3 sm:space-y-4 md:space-y-5">
            <div className="flex items-center gap-3 hero-reveal">
                <span className={`h-px w-12 ${darkMode ? 'bg-white/15' : 'bg-stone-300/90'}`} />
                <span className={`text-[10px] uppercase tracking-[0.28em] font-black ${darkMode ? 'text-stone-500' : 'text-stone-500'}`}>
                    Rituel Bois
                </span>
            </div>

            <div className="leading-[0.85]">
                <div className={`font-serif text-[2rem] sm:text-[2.2rem] xl:text-[2.8rem] tracking-tight ${darkMode ? 'text-white' : 'text-stone-900'}`}>
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
                    <span className={`ml-2 font-black animate-pulse text-[1.5rem] xl:text-[1.8rem] ${darkMode ? 'text-amber-400/90' : 'text-amber-700/90'}`}>
                        |
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-2.5 md:hidden">
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
    );
});

const ShopView = ({ affiliateProducts = [], darkMode = false, setHeaderProps, onOpenProductDetail }) => {
    const { isAdmin } = useAuth();
    
    const handleTutorialClick = async (event, linkedProduct) => {
        event.preventDefault();
        if (onOpenProductDetail && linkedProduct?.id) {
            onOpenProductDetail(linkedProduct, { source: 'shop_tutorial' });
            return;
        }
        trackAffiliateClick({
            product: linkedProduct,
            source: 'shop_tutorial',
            isAdmin
        });
    };

    const [activeCategory, setActiveCategory] = useState(null);
    const [priceFilter, setPriceFilter] = useState('all');
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [tutorialIndexes, setTutorialIndexes] = useState({});
    const [firestoreTutorials, setFirestoreTutorials] = useState(getCachedShopTutorials);
    const isProgrammaticScrollRef = useRef(false);

    const getTutorialIndex = (categoryId) => tutorialIndexes[categoryId] || 0;
    const setTutorialIndex = (categoryId, idx) => setTutorialIndexes(prev => ({ ...prev, [categoryId]: idx }));

    // Charger les tutoriels depuis Firestore (lecture simple + cache local)
    useEffect(() => {
        let mounted = true;
        const colRef = collection(db, 'artifacts', appId, 'public', 'data', 'shop_tutorials');
        const q = query(colRef, orderBy('order', 'asc'));
        getDocs(q).then((snap) => {
            if (!mounted) return;
            const tutorials = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            setFirestoreTutorials(tutorials);
            try {
                localStorage.setItem(SHOP_TUTORIALS_CACHE_KEY, JSON.stringify(tutorials));
            } catch {
                // Cache unavailable; keep in-memory value.
            }
        }).catch(() => {});
        return () => { mounted = false; };
    }, []);

    // Fusionner les tutoriels Firestore avec les FAMILIES statiques (fallback)
    const getFamilyTutorials = useMemo(() => {
        const tutorialsByCategory = {};
        FAMILIES.forEach(f => { tutorialsByCategory[f.id] = f.tutorials || []; });
        // Les categories ayant des tutoriels Firestore ecrasent les tutoriels statiques correspondants
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

    const totalProductCount = affiliateProducts.length;
    const activePriceLabel = PRICE_FILTERS.find((filter) => filter.id === priceFilter)?.label || PRICE_FILTERS[0].label;

    const rawProductsByFamily = useMemo(() => {
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

    const productsByFamily = useMemo(() => {
        const buckets = {};
        Object.entries(rawProductsByFamily).forEach(([familyId, products]) => {
            buckets[familyId] = products.filter((product) => matchesPriceFilter(product, priceFilter));
        });
        return buckets;
    }, [priceFilter, rawProductsByFamily]);

    const categorySummaries = useMemo(
        () => FAMILIES.map((family) => ({
            ...family,
            count: (productsByFamily[family.id] || []).length,
            totalCount: (rawProductsByFamily[family.id] || []).length,
        })),
        [productsByFamily, rawProductsByFamily]
    );

    const filteredProductCount = useMemo(
        () => Object.values(productsByFamily).reduce((total, products) => total + products.length, 0),
        [productsByFamily]
    );

    const visibleFamilies = useMemo(
        () => categorySummaries.filter((family) => family.count > 0),
        [categorySummaries]
    );

    const activeCategoryLabel = useMemo(() => {
        if (!activeCategory) return 'Toute la selection';
        return categorySummaries.find((family) => family.id === activeCategory)?.title || 'Famille active';
    }, [activeCategory, categorySummaries]);

    const shopSchema = useMemo(() => {
        const shopItemList = buildShopItemList(affiliateProducts);
        const graph = [
            {
                '@type': 'CollectionPage',
                '@id': 'https://tousatable-madeinnormandie.fr/comptoir#collection',
                url: 'https://tousatable-madeinnormandie.fr/comptoir',
                name: 'Le Comptoir - Boutique bois et entretien meuble ancien',
                description: "Selection de produits pour entretenir, proteger et restaurer les meubles en bois massif, les tables de ferme anciennes et les planches en bois.",
                isPartOf: {
                    '@type': 'WebSite',
                    name: 'Tous a Table Made in Normandie',
                    url: 'https://tousatable-madeinnormandie.fr',
                },
                about: [
                    'entretien meuble ancien',
                    'soin du bois massif',
                    'huile bois',
                    'cire meuble bois',
                    'restauration meuble bois',
                ],
            },
            {
                '@type': 'BreadcrumbList',
                '@id': 'https://tousatable-madeinnormandie.fr/comptoir#breadcrumb',
                itemListElement: [
                    {
                        '@type': 'ListItem',
                        position: 1,
                        name: 'Accueil',
                        item: 'https://tousatable-madeinnormandie.fr/',
                    },
                    {
                        '@type': 'ListItem',
                        position: 2,
                        name: 'Le Comptoir',
                        item: 'https://tousatable-madeinnormandie.fr/comptoir',
                    },
                ],
            },
            {
                '@type': 'FAQPage',
                '@id': 'https://tousatable-madeinnormandie.fr/comptoir#faq',
                mainEntity: SHOP_SEO_FAQ.map((item) => ({
                    '@type': 'Question',
                    name: item.question,
                    acceptedAnswer: {
                        '@type': 'Answer',
                        text: item.answer,
                    },
                })),
            },
        ];

        if (shopItemList.length > 0) {
            graph.push({
                '@type': 'ItemList',
                '@id': 'https://tousatable-madeinnormandie.fr/comptoir#selection',
                name: 'Selection entretien bois ancien du Comptoir',
                itemListOrder: 'https://schema.org/ItemListOrderAscending',
                numberOfItems: shopItemList.length,
                itemListElement: shopItemList,
            });
        }

        return {
            '@context': 'https://schema.org',
            '@graph': graph,
        };
    }, [affiliateProducts]);

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

        return () => {
            split.revert();
        };
    }, [affiliateProducts.length]);

    // Scrollspy - highlight sidebar item matching the section currently in view
    useEffect(() => {
        if (affiliateProducts.length === 0) return;
        const observers = [];
        visibleFamilies.forEach(family => {
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
    }, [affiliateProducts.length, visibleFamilies]);

    useEffect(() => {
        if (activeCategory && !visibleFamilies.some((family) => family.id === activeCategory)) {
            setActiveCategory(null);
        }
    }, [activeCategory, visibleFamilies]);

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

    const handleProductDetailOpen = useCallback((product) => {
        warmupShopProductDetailIntent(product);
        onOpenProductDetail?.(product, { source: 'shop_grid' });
    }, [onOpenProductDetail]);

    const handleProductIntent = useCallback((product) => {
        warmupShopProductDetailIntent(product);
    }, []);

    const handleMobileSidebarClose = useCallback(() => {
        setIsMobileSidebarOpen(false);
    }, []);

    return (
        <div className={`min-h-screen w-full max-w-full overflow-x-clip animate-in fade-in duration-500 ${darkMode ? 'bg-[#0a0a0a]' : 'bg-[linear-gradient(180deg,#f8f2e8_0%,#fffaf2_42%,#f1e3cf_100%)]'}`}>
            <SEO
                title="Le Comptoir - Boutique Bois & Entretien Meuble Ancien"
                description="Produits pour entretenir, proteger et restaurer les meubles en bois massif : huiles, cires, savons, accessoires et soins du bois testes en atelier."
                url="/comptoir"
                schema={shopSchema}
            />

            {/* HERO SECTION */}
            <section className="relative min-h-fit sm:min-h-[58svh] md:min-h-[62svh] flex flex-col justify-start md:justify-end px-6 xl:px-12 pb-1 sm:pb-12 md:pb-14 lg:pb-16 pt-3 sm:pt-6 md:pt-24 lg:pt-28 overflow-hidden">
                <WorkshopHero darkMode={darkMode} />

                <div className="relative md:absolute order-1 md:-order-none left-0 md:left-6 xl:left-12 md:top-0 lg:top-0 z-10 pointer-events-none">
                    <style>{`
                        @keyframes ritualLetterIn {
                            0% { opacity: 0; filter: blur(5px); transform: translateY(7px) scale(0.985); }
                            100% { opacity: 1; filter: blur(0px); transform: translateY(0) scale(1); }
                        }
                    `}</style>
                    <RitualWordLoop darkMode={darkMode} />
                </div>

                <div className={`absolute top-0 right-0 w-[50vw] h-[50vw] md:w-[30vw] md:h-[30vw] rounded-full blur-[100px] opacity-20 pointer-events-none z-0 ${darkMode ? 'bg-amber-500/20' : 'bg-amber-700/10'}`} />

                <div className="order-2 md:-order-none max-w-[1760px] mx-auto w-full space-y-2 sm:space-y-4 md:space-y-6 lg:space-y-7 relative z-10 sm:mt-0 pointer-events-none">
                    <h1 className={`hero-reveal font-serif text-[3.35rem] min-[400px]:text-[3.65rem] sm:text-6xl md:text-[3.5rem] lg:text-7xl xl:text-[8.4rem] leading-[0.86] tracking-tighter ${darkMode ? 'text-white' : 'text-stone-900'} w-full md:w-[50%] lg:w-[46%] xl:w-auto pointer-events-auto`}>
                        Le Soin <br className="hidden md:block" />du Bois.
                    </h1>
                    <div className="hero-reveal w-[90%] sm:w-[85%] md:w-[45%] lg:w-[40%] xl:w-full xl:max-w-xl pointer-events-auto">
                        <p className={`text-sm md:text-base lg:text-lg xl:text-xl leading-relaxed ${darkMode ? 'text-stone-400' : 'text-stone-500'} w-full`}>
                            <span className="block sm:inline">Le bois massif est vivant. Protegez, nourrissez</span>{' '}
                            <span className="block sm:inline">et restaurez vos creations avec notre selection</span>{' '}
                            <span className="block sm:inline">pointue des meilleurs produits d'entretien.</span>{' '}
                            <span className="block sm:inline">Exclusivement testes et valides par l'atelier.</span>
                        </p>
                    </div>
                </div>
            </section>

            <section className={`px-6 xl:px-12 pt-1 pb-2 md:py-9 ${darkMode ? 'bg-[#0a0a0a]' : 'bg-transparent'}`}>
                <div className={`max-w-[1760px] mx-auto border-t pt-3 pb-2 md:py-8 ${darkMode ? 'border-white/10' : 'border-[#c79b5d]/28'}`}>
                    <div className="grid gap-6 lg:gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
                        <div>
                            <p className={`text-[10px] font-black uppercase tracking-[0.28em] mb-4 ${darkMode ? 'text-amber-500' : 'text-amber-700'}`}>
                                Boutique bois
                            </p>
                            <h2 className={`font-serif text-3xl md:text-5xl leading-[0.95] tracking-tight ${darkMode ? 'text-white' : 'text-stone-900'}`}>
                                Entretenir un meuble ancien sans trahir sa matiere.
                            </h2>
                        </div>
                        <div className={`grid gap-5 md:grid-cols-3 text-sm md:text-base leading-relaxed ${darkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                            <p>
                                Le Comptoir rassemble les produits utiles pour le soin du bois massif : huiles, cires, savons doux, accessoires et materiel de finition.
                            </p>
                            <p>
                                Chaque famille repond a un geste concret : nourrir une table de ferme, proteger un buffet, raviver une commode ou nettoyer une planche en bois.
                            </p>
                        </div>
                    </div>
                    <nav className={`mt-5 md:mt-8 flex flex-wrap gap-3 text-[10px] font-black uppercase tracking-[0.22em] ${darkMode ? 'text-stone-500' : 'text-stone-500'}`} aria-label="Liens Comptoir">
                        {[
                            { href: '/meubles-anciens', label: 'Voir les meubles anciens' },
                            { href: '/livraison-meubles-anciens-france', label: 'Livraison meubles' },
                            { href: '/a-propos', label: 'L atelier a Ifs' },
                        ].map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                className={`inline-flex items-center border-b pb-1 transition-colors duration-300 ${darkMode ? 'border-white/15 hover:text-amber-400 hover:border-amber-400/60' : 'border-stone-300 hover:text-amber-700 hover:border-amber-700/60'}`}
                            >
                                {link.label}
                            </a>
                        ))}
                    </nav>
                </div>
            </section>

            {/* PRODUCTS SECTION */}
            <div className={`relative ${darkMode ? 'bg-[#0a0a0a]' : 'bg-transparent'}`}>
                {!isMobileSidebarOpen && (
                    <motion.button
                        type="button"
                        onClick={() => setIsMobileSidebarOpen(true)}
                        className={`
                            lg:hidden fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-4 z-[120]
                            flex h-14 w-14 items-center justify-center rounded-full
                            shadow-[0_18px_42px_rgba(0,0,0,0.32)]
                            transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
                            ${darkMode
                                ? 'bg-stone-950/92 text-white ring-1 ring-white/14'
                                : 'bg-stone-950/92 text-white ring-1 ring-white/18'
                            }
                        `}
                        data-shop-filter-trigger="floating"
                        aria-controls="shop-filter-drawer"
                        aria-expanded={isMobileSidebarOpen}
                        aria-label="Ouvrir les filtres du Comptoir"
                        whileTap={{ scale: 0.94 }}
                        initial={{ scale: 0.86, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.35 }}
                    >
                        <SlidersHorizontal size={22} strokeWidth={1.8} />
                        <span className="absolute -right-1 -top-1 flex h-7 min-w-7 items-center justify-center rounded-full bg-white px-1.5 text-[9px] font-black text-stone-950 ring-2 ring-stone-950">
                            {filteredProductCount}
                        </span>
                    </motion.button>
                )}

                {/* Sectioned content - all families in order */}
                <section
                    id="products-grid-section"
                    className={`min-h-screen pt-0 lg:pt-10 pb-[calc(5.5rem+env(safe-area-inset-bottom))] lg:pb-20 px-4 sm:px-6 xl:px-10 ${darkMode ? 'bg-[#0a0a0a]' : 'bg-transparent'}`}
                >
                    <div className="mx-auto grid max-w-[1760px] gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-8 xl:grid-cols-[320px_minmax(0,1fr)]">
                        <ShopSidebar
                            categories={categorySummaries}
                            activeCategory={activeCategory}
                            onCategoryChange={handleCategoryChange}
                            priceFilters={PRICE_FILTERS}
                            activePriceFilter={priceFilter}
                            onPriceFilterChange={setPriceFilter}
                            totalProductCount={totalProductCount}
                            filteredProductCount={filteredProductCount}
                            darkMode={darkMode}
                            isMobileOpen={isMobileSidebarOpen}
                            onMobileClose={handleMobileSidebarClose}
                        />

                        <div className="min-w-0 space-y-0">

                        {visibleFamilies.map((family, familyIndex) => {
                            const products = getProductsForFamily(family.id);

                            const tutorials = getFamilyTutorials[family.id] || [];
                            const currentIdx = getTutorialIndex(family.id);
                            const currentTutorial = tutorials[currentIdx];

                            return (
                                <section
                                    key={family.id}
                                    id={`section-${family.id}`}
                                    className="tat-heavy-section scroll-mt-28 pt-4 lg:pt-16"
                                >
                                    {/* Section separator */}
                                    {familyIndex > 0 && (
                                        <div className={`h-px w-full mb-8 lg:mb-14 ${darkMode ? 'bg-white/5' : 'bg-[#c79b5d]/22'}`} />
                                    )}

                                    {/* Section header */}
                                    <div className="mb-6 grid gap-4 lg:mb-9 lg:grid-cols-[minmax(0,0.74fr)_auto] lg:items-end">
                                        <div className="max-w-[760px]">
                                            <div className="mb-3 flex items-center gap-4 sm:mb-4">
                                                <span className={`h-px w-8 ${darkMode ? 'bg-white/20' : 'bg-stone-300'}`} />
                                                <span className={`text-[10px] md:text-[11px] font-black uppercase tracking-widest ${darkMode ? 'text-amber-500' : 'text-amber-700'}`}>
                                                    {family.subtitle}
                                                </span>
                                            </div>
                                            <h2 className={`font-serif text-3xl leading-[0.94] tracking-tighter sm:text-4xl md:text-5xl xl:text-[3.7rem] ${darkMode ? 'text-white' : 'text-stone-900'}`}>
                                                {family.title}
                                            </h2>
                                            <p className={`mt-3 max-w-2xl text-sm leading-relaxed md:text-[15px] ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                                                {family.description}
                                            </p>
                                        </div>
                                        <div className={`hidden rounded-full border px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] lg:inline-flex ${darkMode ? 'border-white/10 bg-white/5 text-stone-400' : 'border-[#c79b5d]/24 bg-white/55 text-stone-500'}`}>
                                            {products.length} produit{products.length > 1 ? 's' : ''}
                                        </div>
                                    </div>

                                    {/* Products grid - editorial block inline after 4th card */}
                                    <div className="product-grid grid grid-flow-dense grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 xl:gap-6">
                                        {products.map((product, index) => (
                                            <React.Fragment key={product.id}>
                                                <ShopProductCard
                                                    product={product}
                                                    darkMode={darkMode}
                                                    dense
                                                    detailHref={getShopProductPath(product)}
                                                    onProductIntent={handleProductIntent}
                                                    disableAppearAnimation={index < 2}
                                                    onOpenProductDetail={handleProductDetailOpen}
                                                />

                                                {/* Editorial / Video block inline after 4th product ou apres le dernier si < 4 */}
                                                {(index === 3 || (products.length <= 3 && index === products.length - 1)) && tutorials.length > 0 && (
                                                <div className={`col-span-2 rounded-[24px] border p-5 sm:col-span-3 sm:p-7 lg:col-span-3 lg:p-9 xl:col-span-4 2xl:col-span-5 ${darkMode ? 'bg-gradient-to-br from-amber-500/5 to-stone-800/20 border-white/5' : 'bg-[#fff8ed]/82 border-[#c79b5d]/28 shadow-[0_24px_70px_rgba(102,74,36,0.10)]'}`}>
                                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-6 sm:gap-y-8 lg:gap-x-12 lg:items-stretch">

                                                {/* Text */}
                                                <div className="lg:col-span-5 flex flex-col justify-center order-1 lg:order-none">
                                                    <p className={`text-[9px] sm:text-[10px] uppercase tracking-[0.28em] font-black mb-2 sm:mb-3 ${darkMode ? 'text-amber-500' : 'text-amber-700'}`}>
                                                        {family.subtitle} - Tuto Atelier
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
                                                            &gt; {currentTutorial?.label}
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
                                                        // Matching par productId (Firestore) - fallback sur productName (legacy)
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
                                                                                    href={getShopProductPath(linked)}
                                                                                    target={onOpenProductDetail ? undefined : '_blank'}
                                                                                    rel={onOpenProductDetail ? undefined : 'noopener noreferrer sponsored'}
                                                                                    onClick={(e) => handleTutorialClick(e, linked)}
                                                                                    className={`inline-flex items-center justify-center w-full sm:w-auto gap-2 px-6 py-2.5 sm:py-2.5 rounded-full text-[10.5px] lg:text-[11px] font-semibold transition-all duration-200 ${darkMode ? 'bg-amber-500/15 border border-amber-500/30 text-amber-400 hover:bg-amber-500/25' : 'bg-amber-600/10 border border-amber-600/25 text-amber-700 hover:bg-amber-600/20'}`}
                                                                                >
                                                                                    Voir la fiche <span>-&gt;</span>
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
                    </div>
                </section>
            </div>

            <section className={`px-6 md:px-12 py-14 md:py-20 ${darkMode ? 'bg-[#0a0a0a]' : 'bg-transparent'}`}>
                <div className="max-w-[1120px] mx-auto">
                    <div className="mb-8">
                        <p className={`text-[10px] font-black uppercase tracking-[0.28em] mb-3 ${darkMode ? 'text-amber-500' : 'text-amber-700'}`}>
                            Questions atelier
                        </p>
                        <h2 className={`font-serif text-3xl md:text-5xl leading-tight ${darkMode ? 'text-white' : 'text-stone-900'}`}>
                            Bien choisir ses produits d'entretien bois.
                        </h2>
                    </div>
                    <div className={`divide-y border-y ${darkMode ? 'divide-white/10 border-white/10' : 'divide-[#c79b5d]/25 border-[#c79b5d]/28'}`}>
                        {SHOP_SEO_FAQ.map((item) => (
                            <div key={item.question} className="py-6 grid gap-3 md:grid-cols-[0.8fr_1.2fr] md:gap-10">
                                <h3 className={`font-serif text-xl md:text-2xl leading-snug ${darkMode ? 'text-stone-100' : 'text-stone-900'}`}>
                                    {item.question}
                                </h3>
                                <p className={`text-sm md:text-base leading-relaxed ${darkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                                    {item.answer}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* INFO AFFILIATE FOOTER */}
            <section className={`py-12 px-6 md:px-12 ${darkMode ? 'bg-[#0a0a0a]' : 'bg-transparent'}`}>
                <div className={`max-w-[1920px] mx-auto flex flex-col md:flex-row items-center justify-center gap-3 text-[10px] text-center md:text-left ${darkMode ? 'text-stone-500' : 'text-stone-400'}`}>
                    <Info size={14} className={darkMode ? 'text-amber-500' : 'text-amber-600'} />
                    <p className="max-w-2xl leading-relaxed">
                        Cette vitrine contient des liens du Programme Partenaires. En achetant vos produits d'entretien via ces liens, vous soutenez le travail de l'atelier sans aucun surcout pour vous. <br className="hidden md:block"/>
                        <a href="/mentions-legales#affiliation" className="underline underline-offset-4 hover:text-stone-900 dark:hover:text-white transition-colors">Notre politique de transparence</a>
                    </p>
                </div>
            </section>
        </div>
    );
};

export default ShopView;
