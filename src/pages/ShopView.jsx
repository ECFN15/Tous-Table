import React, { useEffect, useState } from 'react';
import { Info } from 'lucide-react';
import SEO from '../components/shared/SEO';
import ShopProductCard from '../components/shop/ShopProductCard';
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
        description: "Le premier geste pour chérir un meuble en bois massif. Des huiles professionnelles qui pénètrent au cœur des fibres pour une protection de l'intérieur, respectant le grain et le toucher naturel."
    },
    {
        id: 'cires',
        title: "Patine Authentique",
        subtitle: "Cires & Finitions",
        description: "Idéales pour sublimer les commodes, buffets et pièces vintage. Maintenez l'âme et la chaleur de l'ancien sans abraser, avec des cires naturelles d'abeille et de carnauba."
    },
    {
        id: 'alimentaire',
        title: "Contact Alimentaire",
        subtitle: "Soins Planches à Découper",
        description: "Le rituel indispensable pour garantir l'hygiène et la durabilité de vos planches artisanales. Huiles minérales et crèmes à la cire d'abeille certifiées 100% « food grade »."
    },
    {
        id: 'savons',
        title: "Le Geste Quotidien",
        subtitle: "Savons Noirs & Nettoyants",
        description: "Évitez les produits chimiques qui agressent vos meubles. Entretenez la beauté de votre table jour après jour avec des nettoyants très doux conçus pour les surfaces huilées."
    },
    {
        id: 'renovation',
        title: "Seconde Jeunesse",
        subtitle: "Soins de Rénovation",
        description: "Votre bois est devenu terne ou présente des micro-rayures ? Effacez les accidents du quotidien ou ravivez la teinte sans poncer, grâce à ces solutions de restauration ciblées."
    },
    {
        id: 'teck',
        title: "Bois Exotiques",
        subtitle: "Spécial Teck & Bois denses",
        description: "L'entretien très particulier des bois exotiques. Des huiles fluides dédiées à la protection et au maintien de la couleur chaude et ambrée de vos colonnes en teck."
    },
    {
        id: 'outils',
        title: "La Boîte à Outils",
        subtitle: "Brosses & Chiffons",
        description: "Les compagnons fidèles de l'artisan. Le bon outil pour faire pénétrer l'huile, lustrer vigoureusement la cire ou préparer la surface avant le traitement."
    }
];

const RITUAL_WORDS = ['NOURRIR', 'PROTEGER', 'RESTAURER'];

const ShopView = ({ affiliateProducts = [], darkMode = false, setHeaderProps }) => {
    const [activeRitualIndex, setActiveRitualIndex] = useState(0);
    const [typedRitualWord, setTypedRitualWord] = useState(RITUAL_WORDS[0]);

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
        let cancelled = false;
        let timeoutId;
        const currentWord = RITUAL_WORDS[activeRitualIndex];
        let charIndex = 0;

        setTypedRitualWord('');

        const typeNextChar = () => {
            if (cancelled) return;
            setTypedRitualWord(currentWord.slice(0, charIndex));

            if (charIndex <= currentWord.length) {
                charIndex += 1;
                timeoutId = setTimeout(typeNextChar, 110);
                return;
            }

            timeoutId = setTimeout(() => {
                if (cancelled) return;
                setActiveRitualIndex(prev => (prev + 1) % RITUAL_WORDS.length);
            }, 1800);
        };

        timeoutId = setTimeout(typeNextChar, 180);

        return () => {
            cancelled = true;
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [activeRitualIndex]);

    const getProductsForFamily = (familyId) => {
        return affiliateProducts.filter(p => {
            const cat = p.category?.toLowerCase() || '';
            // Matching directly logic including fallbacks for legacy
            if (familyId === 'huiles') return cat === 'huiles' || cat === 'huile';
            if (familyId === 'cires') return cat === 'cires' || cat === 'patines_cires';
            if (familyId === 'alimentaire') return cat === 'alimentaire';
            if (familyId === 'savons') return cat === 'savons' || cat === 'nettoyants' || cat === 'preparation';
            if (familyId === 'renovation') return cat === 'renovation' || cat === 'peintures' || cat === 'resines';
            if (familyId === 'outils') return cat === 'outils';
            if (familyId === 'teck') return cat === 'teck';
            return false;
        }).sort((a, b) => {
            const tierOrder = { expert: 3, premium: 2, essentiel: 1 };
            const aTier = tierOrder[a.tier] || 0;
            const bTier = tierOrder[b.tier] || 0;
            if (bTier !== aTier) return bTier - aTier;
            return (Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
        });
    };

    return (
        <div className={`min-h-screen animate-in fade-in duration-500 ${darkMode ? 'bg-[#0a0a0a]' : 'bg-[#FAFAF9]'}`}>
            <SEO
                title="L'Atelier - Soin et Entretien du Bois"
                description="Notre sélection de produits professionnels pour protéger, nourrir et restaurer vos meubles en bois massif. Huiles, cires et savons testés à l'atelier."
                url="/?page=shop"
            />

            {/* HERO SECTION - Cinematic Editorial Style avec WorkshopHero */}
            <section className="relative min-h-[60vh] md:min-h-[85vh] flex flex-col justify-end px-6 xl:px-12 pb-16 md:pb-24 pt-32 overflow-hidden">
                <WorkshopHero darkMode={darkMode} />

                <div className="hidden lg:block absolute left-6 xl:left-12 top-10 z-10 pointer-events-none">
                    <div className="space-y-7">
                        <div className="flex items-center gap-3">
                            <span className={`h-px w-12 ${darkMode ? 'bg-white/15' : 'bg-stone-300/90'}`} />
                            <span className={`text-[10px] uppercase tracking-[0.28em] font-black ${darkMode ? 'text-stone-500' : 'text-stone-500'}`}>
                                Rituel Bois
                            </span>
                        </div>

                        <div className="leading-[0.85]">
                            <div className={`font-serif text-[2.6rem] xl:text-[4rem] tracking-tight ${darkMode ? 'text-white' : 'text-stone-900'}`}>
                                <span className={`${darkMode ? 'text-amber-300' : 'text-amber-800'}`}>
                                    {typedRitualWord}
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
                                    className={`px-2.5 py-1 rounded-full text-[9px] uppercase tracking-[0.18em] font-black transition-colors duration-300 ${idx === activeRitualIndex
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
                
                <div className={`absolute top-0 right-0 w-[50vw] h-[50vw] md:w-[30vw] md:h-[30vw] rounded-full blur-[100px] opacity-20 pointer-events-none ${darkMode ? 'bg-amber-500/20' : 'bg-amber-700/10'}`} />
                
                <div className="max-w-[1920px] mx-auto w-full space-y-6 md:space-y-10 relative z-10">
                    <h1 className={`hero-reveal font-serif text-6xl md:text-8xl xl:text-[11.5rem] leading-[0.85] tracking-tighter ${darkMode ? 'text-white' : 'text-stone-900'}`}>
                        Le Soin<br />du Bois.
                    </h1>
                    <div className="hero-reveal max-w-2xl">
                        <p className={`text-base md:text-lg xl:text-xl leading-relaxed ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                            Le bois massif est vivant. Protégez, nourrissez et restaurez vos créations avec notre sélection pointue des meilleurs produits d'entretien. Exclusivement testés et validés par l'atelier.
                        </p>
                    </div>
                </div>
            </section>

            {/* TOC NAV - Hairline Architecture */}
            <section className={`border-b ${darkMode ? 'bg-[#0a0a0a] border-white/5' : 'bg-[#FAFAF9] border-stone-200/60'}`}>
                <div className="max-w-[1920px] mx-auto px-6 xl:px-12 py-3 md:py-4">
                    <div className="flex gap-4 md:gap-8 overflow-x-auto scrollbar-none pb-1 items-center">
                        <span className={`text-[9px] font-black uppercase tracking-widest shrink-0 ${darkMode ? 'text-stone-600' : 'text-stone-400'}`}>Aller à :</span>
                        {FAMILIES.map((family) => {
                            const hasProducts = getProductsForFamily(family.id).length > 0;
                            if (!hasProducts) return null;
                            return (
                                <button
                                    key={`nav-${family.id}`}
                                    onClick={() => {
                                        const el = document.getElementById(`fam-${family.id}`);
                                        if (el) {
                                            const y = el.getBoundingClientRect().top + window.scrollY - 100;
                                            window.scrollTo({ top: y, behavior: 'smooth' });
                                        }
                                    }}
                                    className={`shrink-0 text-[10px] md:text-[11px] font-bold uppercase tracking-widest transition-colors ${darkMode ? 'text-white hover:text-amber-500' : 'text-stone-900 hover:text-amber-700'}`}
                                >
                                    {family.subtitle}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* EDITORIAL SECTIONS - StickyStoryTellingLayouts */}
            <div className="flex flex-col">
                {FAMILIES.map((family, index) => {
                    const products = getProductsForFamily(family.id);
                    if (products.length === 0) return null;

                    return (
                        <section key={family.id} id={`fam-${family.id}`} className={`border-b ${darkMode ? 'border-white/5' : 'border-stone-200/60'} relative w-full`}>
                            <div className="max-w-[1920px] mx-auto flex flex-col lg:flex-row">
                                
                                {/* LEFT : Sticky Info (Editorial) */}
                                <div className={`lg:w-[30%] xl:w-[26%] lg:border-r ${darkMode ? 'border-white/5' : 'border-stone-200/60'} p-6 md:p-10 lg:sticky lg:top-[88px] lg:h-[calc(100vh-88px)] lg:overflow-y-auto scrollbar-none flex flex-col justify-between`}>
                                    <div className="space-y-6 md:space-y-10 lg:pb-12">
                                        <div className="flex items-center gap-4">
                                            <span className={`text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] ${darkMode ? 'text-stone-500' : 'text-stone-400'}`}>
                                                {String(index + 1).padStart(2, '0')}
                                            </span>
                                            <span className={`w-8 h-px ${darkMode ? 'bg-white/20' : 'bg-stone-300'}`}></span>
                                            <span className={`text-[10px] md:text-[11px] font-black uppercase tracking-widest ${darkMode ? 'text-amber-500' : 'text-amber-700'}`}>
                                                {family.subtitle}
                                            </span>
                                        </div>
                                        
                                        <h2 className={`font-serif text-4xl md:text-5xl xl:text-6xl leading-[0.9] tracking-tighter ${darkMode ? 'text-white' : 'text-stone-900'}`}>
                                            {family.title}
                                        </h2>

                                        <p className={`text-sm md:text-base leading-relaxed max-w-sm ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                                            {family.description}
                                        </p>
                                    </div>

                                    <div className="hidden lg:flex items-center gap-3">
                                        <span className={`w-12 h-12 rounded-full border flex items-center justify-center text-[10px] font-black ${darkMode ? 'border-white/10 text-stone-400' : 'border-stone-200 text-stone-500'}`}>
                                            {products.length}
                                        </span>
                                        <span className={`text-[9px] uppercase tracking-widest font-bold ${darkMode ? 'text-stone-600' : 'text-stone-400'}`}>Réf.</span>
                                    </div>
                                </div>

                                {/* RIGHT : Scrollable Products Grid */}
                                <div className={`lg:w-[70%] xl:w-[74%] p-6 md:p-10 lg:py-16 ${darkMode ? 'bg-[#050505]/40' : 'bg-stone-50/50'}`}>
                                    <div className="product-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5 md:gap-6 xl:gap-7">
                                        {products.map((product) => (
                                            <ShopProductCard
                                                key={product.id}
                                                product={product}
                                                darkMode={darkMode}
                                            />
                                        ))}
                                    </div>
                                </div>

                            </div>
                        </section>
                    );
                })}
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
