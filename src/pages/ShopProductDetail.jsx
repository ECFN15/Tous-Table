import React, { useMemo } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SEO from '../components/shared/SEO';
import { useAuth } from '../contexts/AuthContext';
import { trackAffiliateClick } from '../utils/tracking';
import { getShopProductPath } from '../utils/seoRoutes';

gsap.registerPlugin(ScrollTrigger);

const CATEGORY_LABELS = {
    huiles: 'Huiles et finitions',
    cires: 'Cires et patines',
    savons: 'Savons et nettoyants',
    accessoires: 'Accessoires atelier',
    renovation: 'Renovation',
    outils: 'Outils'
};

const TIER_LABELS = {
    essentiel: 'Essentiel',
    premium: 'Premium',
    expert: 'Expert'
};

const fallbackDraft = (product) => ({
    shortTitle: product?.name || 'Produit du Comptoir',
    correctedBrand: product?.brand || 'Atelier',
    productType: product?.category || 'selection-atelier',
    detailStatus: 'needs-source-check',
    confidence: 'medium',
    detailIntro: product?.description || product?.whyWeRecommend || 'Produit selectionne pour le soin et la restauration du bois.',
    customerDescription: product?.description || product?.whyWeRecommend || 'Ce produit fait partie de la selection du Comptoir. La fiche detail complete sera enrichie avec les sources fabricant, les usages d atelier et les precautions utiles avant achat.',
    useCases: product?.category ? [`Usage ${CATEGORY_LABELS[product.category] || product.category}`] : ['Entretien du bois'],
    strengths: [product?.whyWeRecommend || 'Selection utile pour l atelier'],
    atelierTips: [product?.proTips || product?.proTip || 'Faire un essai discret avant application sur une zone visible.'],
    safetyNotes: ['Lire les consignes du fabricant avant utilisation.'],
    avoidIf: ['Ne pas utiliser sur un support incompatible sans essai prealable.'],
    sourceUrls: []
});

const hostLabel = (value) => {
    try {
        return new URL(value).hostname.replace(/^www\./, '');
    } catch {
        return value;
    }
};

const formatPrice = (price) => {
    const value = Number(price);
    if (!Number.isFinite(value) || value <= 0) return 'Prix indicatif';
    return `${value.toFixed(2).replace('.', ',')} EUR`;
};

const buildSchema = (product, draft, path) => {
    const price = Number(product?.price);
    return {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: draft.shortTitle || product?.name,
        description: draft.customerDescription || draft.detailIntro || product?.description,
        image: product?.imageUrl ? [product.imageUrl] : undefined,
        brand: draft.correctedBrand ? { '@type': 'Brand', name: draft.correctedBrand } : undefined,
        offers: {
            '@type': 'Offer',
            priceCurrency: 'EUR',
            ...(Number.isFinite(price) && price > 0 ? { price } : {}),
            availability: 'https://schema.org/InStock',
            url: `https://tousatable-madeinnormandie.fr${path}`
        }
    };
};

const InfoList = ({ title, items = [], darkMode, className = '' }) => (
    <div className={`shop-detail-reveal ${className} rounded-[1.5rem] p-5 md:p-8 border ${darkMode ? 'bg-white/[0.035] border-white/10' : 'bg-white/72 border-[#d8c2a2]/60 shadow-[0_20px_70px_rgba(91,64,38,0.08)]'}`}>
        <p className={`text-[10px] uppercase tracking-[0.24em] font-black mb-4 md:mb-5 ${darkMode ? 'text-amber-300/80' : 'text-amber-800/80'}`}>
            {title}
        </p>
        <div className="space-y-3 md:space-y-4">
            {items.map((item) => (
                <div key={item} className="flex gap-4">
                    <span className={`mt-2 h-1.5 w-1.5 rounded-full flex-none ${darkMode ? 'bg-amber-300' : 'bg-amber-700'}`} />
                    <p className={`text-sm md:text-[15px] leading-relaxed ${darkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                        {item}
                    </p>
                </div>
            ))}
        </div>
    </div>
);

const ShopProductDetail = ({ product, isLoading = false, darkMode = false, onBack }) => {
    const { isAdmin } = useAuth();
    const draft = useMemo(() => product?.detailDraft || fallbackDraft(product), [product]);
    const pagePath = useMemo(() => product ? getShopProductPath(product) : '/comptoir', [product]);
    const sourceLabels = (draft.sourceUrls || []).map(hostLabel);

    useGSAP(() => {
        gsap.fromTo('.shop-detail-reveal',
            { y: 42, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 0.9,
                stagger: 0.08,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: '.shop-detail-root',
                    start: 'top 80%'
                }
            }
        );

        gsap.utils.toArray('.shop-detail-media').forEach((el) => {
            gsap.fromTo(el,
                { scale: 0.92, opacity: 0.75 },
                {
                    scale: 1,
                    opacity: 1,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: el,
                        start: 'top 85%',
                        end: 'bottom 30%',
                        scrub: true
                    }
                }
            );
        });

        return () => ScrollTrigger.getAll().forEach((trigger) => {
            if (trigger.trigger?.closest?.('.shop-detail-root')) trigger.kill();
        });
    }, [product?.id]);

    const handleBuy = (event) => {
        event.preventDefault();
        trackAffiliateClick({
            product,
            source: 'shop_detail',
            isAdmin
        });
    };

    if (isLoading) {
        return (
            <main className={`min-h-[100dvh] flex items-center justify-center px-6 ${darkMode ? 'bg-[#090806]' : 'bg-[#f8f2e8]'}`}>
                <div className={`h-10 w-10 rounded-full border-[3px] ${darkMode ? 'border-white/10 border-t-amber-300' : 'border-stone-200 border-t-stone-950'} animate-spin`} />
            </main>
        );
    }

    if (!product) {
        return (
            <main className={`min-h-[100dvh] px-6 pt-36 pb-24 ${darkMode ? 'bg-[#090806] text-white' : 'bg-[#f8f2e8] text-stone-950'}`}>
                <SEO
                    title="Produit Comptoir introuvable"
                    description="Ce produit du Comptoir n'est pas disponible."
                    url="/comptoir"
                />
                <div className="mx-auto max-w-3xl text-center space-y-8">
                    <p className="text-[10px] uppercase tracking-[0.28em] font-black text-amber-700">Le Comptoir</p>
                    <h1 className="font-serif text-4xl md:text-6xl leading-tight">Produit introuvable</h1>
                    <button
                        type="button"
                        onClick={onBack}
                        className={`inline-flex items-center gap-3 rounded-full px-7 py-4 text-sm font-black transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] ${darkMode ? 'bg-white text-stone-950' : 'bg-stone-950 text-white'}`}
                    >
                        Retour au Comptoir
                    </button>
                </div>
            </main>
        );
    }

    const schema = buildSchema(product, draft, pagePath);
    const title = draft.shortTitle || product.name;
    const brand = draft.correctedBrand || product.brand || 'Atelier';

    return (
        <main className={`shop-detail-root overflow-x-hidden w-full max-w-full ${darkMode ? 'bg-[#090806] text-stone-100' : 'bg-[linear-gradient(180deg,#f7efe4_0%,#fffaf2_44%,#eadcc8_100%)] text-stone-950'}`}>
            <SEO
                title={`${title} - Le Comptoir`}
                description={draft.customerDescription || draft.detailIntro}
                image={product.imageUrl}
                url={pagePath}
                type="product"
                schema={schema}
            />

            <section className="relative px-4 md:px-10 xl:px-14 pt-28 md:pt-40 pb-8 md:pb-36 lg:min-h-[100dvh] overflow-hidden">
                <div className={`absolute inset-x-0 top-0 h-[38rem] pointer-events-none ${darkMode ? 'bg-[radial-gradient(circle_at_72%_20%,rgba(217,151,63,0.22),transparent_34%),radial-gradient(circle_at_18%_12%,rgba(255,255,255,0.08),transparent_28%)]' : 'bg-[radial-gradient(circle_at_72%_20%,rgba(177,111,45,0.18),transparent_34%),radial-gradient(circle_at_18%_12%,rgba(255,255,255,0.85),transparent_28%)]'}`} />

                <div className="relative mx-auto max-w-[1920px] grid grid-cols-1 lg:grid-cols-12 gap-7 lg:gap-14 items-center">
                    <div className="lg:col-span-7 shop-detail-reveal">
                        <button
                            type="button"
                            onClick={onBack}
                            className={`mb-7 md:mb-10 inline-flex items-center gap-3 rounded-full px-5 py-3 text-[10px] uppercase tracking-[0.2em] font-black transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] ${darkMode ? 'bg-white/8 text-stone-300 hover:bg-white/12' : 'bg-white/72 text-stone-700 hover:bg-white'}`}
                        >
                            <span className={`flex h-7 w-7 items-center justify-center rounded-full ${darkMode ? 'bg-white/10' : 'bg-stone-950 text-white'}`}>&lt;</span>
                            Comptoir
                        </button>

                        <div className="flex flex-wrap items-center gap-3 mb-5 md:mb-7">
                            {[brand, CATEGORY_LABELS[product.category] || product.category, TIER_LABELS[product.tier] || product.tier].filter(Boolean).map((item) => (
                                <span key={item} className={`rounded-full px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] font-black ${darkMode ? 'bg-white/7 text-amber-200/80' : 'bg-white/76 text-amber-900/80'}`}>
                                    {item}
                                </span>
                            ))}
                        </div>

                        <h1 className={`max-w-5xl font-serif text-[clamp(3rem,6.2vw,7.75rem)] leading-[0.9] tracking-tight ${darkMode ? 'text-white' : 'text-stone-950'}`}>
                            {title}
                        </h1>

                        <p className={`mt-6 md:mt-8 max-w-3xl text-lg md:text-2xl leading-relaxed ${darkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                            {draft.customerDescription || draft.detailIntro}
                        </p>

                        <div className="mt-7 md:mt-10 flex flex-col sm:flex-row gap-4 sm:items-center">
                            <a
                                href={product.affiliateUrl}
                                onClick={handleBuy}
                                target="_blank"
                                rel="noopener noreferrer sponsored"
                                className={`group inline-flex items-center justify-center gap-5 rounded-full px-7 py-4 text-sm font-black transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] ${darkMode ? 'bg-amber-300 text-stone-950 hover:bg-amber-200' : 'bg-stone-950 text-white hover:bg-stone-800'}`}
                            >
                                Acheter sur Amazon
                                <span className={`flex h-9 w-9 items-center justify-center rounded-full transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1 group-hover:-translate-y-[1px] ${darkMode ? 'bg-stone-950 text-amber-200' : 'bg-white/12 text-white'}`}>
                                    &gt;
                                </span>
                            </a>
                            <div className={`${darkMode ? 'text-stone-500' : 'text-stone-500'} text-xs leading-relaxed max-w-sm`}>
                                Lien partenaire Amazon. Prix indicatif : <span className={darkMode ? 'text-stone-300' : 'text-stone-800'}>{formatPrice(product.price)}</span>.
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-5 shop-detail-media">
                        <div className={`rounded-[2rem] p-2 ${darkMode ? 'bg-white/7 ring-1 ring-white/10' : 'bg-white/70 ring-1 ring-[#d8c2a2]/70 shadow-[0_30px_100px_rgba(91,64,38,0.14)]'}`}>
                            <div className={`relative aspect-[4/5] rounded-[1.5rem] overflow-hidden ${darkMode ? 'bg-[#14110d]' : 'bg-[#eadcc8]'}`}>
                                <img
                                    src={product.imageUrl || 'https://picsum.photos/seed/atelier-wood-finish/1200/1500'}
                                    alt={product.name}
                                    className="h-full w-full object-contain p-6 md:p-12 transition-transform duration-1000 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.035]"
                                />
                                <div className={`absolute bottom-5 left-5 right-5 rounded-[1.25rem] px-5 py-4 ${darkMode ? 'bg-black/55 text-stone-200' : 'bg-white/82 text-stone-800'}`}>
                                    <p className="text-[10px] uppercase tracking-[0.2em] font-black opacity-60">Source produit</p>
                                    <p className="mt-1 font-serif text-xl">{product.affiliateProgram === 'amazon' ? 'Amazon' : product.affiliateProgram || 'Lien partenaire'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="px-4 md:px-10 xl:px-14 pt-8 pb-10 md:py-36">
                <div className="mx-auto max-w-[1500px] grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 grid-flow-dense">
                    <div className={`shop-detail-reveal lg:col-span-7 rounded-[1.75rem] p-6 md:p-10 ${darkMode ? 'bg-white/[0.035] border border-white/10' : 'bg-white/78 border border-[#d8c2a2]/60 shadow-[0_22px_80px_rgba(91,64,38,0.08)]'}`}>
                        <p className={`text-[10px] uppercase tracking-[0.24em] font-black mb-4 md:mb-5 ${darkMode ? 'text-amber-300/80' : 'text-amber-800/80'}`}>A quoi ca sert</p>
                        <p className={`font-serif text-3xl md:text-5xl leading-tight ${darkMode ? 'text-white' : 'text-stone-950'}`}>
                            {draft.detailIntro}
                        </p>
                    </div>
                    <InfoList className="lg:col-span-5" title="Usages concrets" items={draft.useCases} darkMode={darkMode} />
                    <InfoList className="lg:col-span-4" title="Points forts" items={draft.strengths} darkMode={darkMode} />
                    <InfoList className="lg:col-span-4" title="Conseil atelier" items={draft.atelierTips} darkMode={darkMode} />
                    <InfoList className="lg:col-span-4" title="A verifier" items={draft.avoidIf} darkMode={darkMode} />
                </div>
            </section>

            <section className="px-4 md:px-10 xl:px-14 pb-10 md:pb-40">
                <div className={`shop-detail-reveal mx-auto max-w-[1500px] rounded-[2rem] p-6 md:p-12 grid gap-5 md:gap-8 lg:grid-cols-[0.85fr_1.15fr] ${darkMode ? 'bg-[#120f0a] border border-amber-300/10' : 'bg-[#24170d] text-white shadow-[0_30px_110px_rgba(67,39,18,0.22)]'}`}>
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.26em] font-black text-amber-200/70">Precautions</p>
                        <h2 className="mt-4 md:mt-5 font-serif text-4xl md:text-6xl leading-[0.95]">Avant d'ouvrir le pot.</h2>
                    </div>
                    <div className="space-y-5">
                        {(draft.safetyNotes || []).map((item) => (
                            <div key={item} className="flex gap-4">
                                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-amber-200 flex-none" />
                                <p className="text-sm md:text-base leading-relaxed text-stone-200">{item}</p>
                            </div>
                        ))}
                        {sourceLabels.length > 0 && (
                            <div className="pt-6 flex flex-wrap gap-2">
                                {sourceLabels.map((item) => (
                                    <span key={item} className="rounded-full bg-white/8 px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] font-black text-stone-300">
                                        {item}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <section className="px-4 md:px-10 xl:px-14 pb-16 md:pb-40">
                <div className="mx-auto max-w-[1500px] text-center">
                    <p className={`shop-detail-reveal mx-auto max-w-3xl text-base md:text-xl leading-relaxed ${darkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                        Le bouton ci-dessous ouvre Amazon dans un nouvel onglet. La fiche reste ici pour garder les conseils, les precautions et le contexte d'usage sous la main.
                    </p>
                    <div className="shop-detail-reveal mt-7 md:mt-10 flex justify-center">
                        <a
                            href={product.affiliateUrl}
                            onClick={handleBuy}
                            target="_blank"
                            rel="noopener noreferrer sponsored"
                            className={`group inline-flex items-center justify-center gap-5 rounded-full px-8 py-5 text-sm font-black transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] ${darkMode ? 'bg-white text-stone-950 hover:bg-amber-200' : 'bg-stone-950 text-white hover:bg-stone-800'}`}
                        >
                            Acheter sur Amazon
                            <span className={`flex h-9 w-9 items-center justify-center rounded-full transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1 group-hover:-translate-y-[1px] ${darkMode ? 'bg-stone-950 text-white' : 'bg-white/12 text-white'}`}>
                                &gt;
                            </span>
                        </a>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default ShopProductDetail;
