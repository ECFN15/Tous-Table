import React from 'react';
import { ExternalLink } from 'lucide-react';
import { addDoc, collection, updateDoc, doc, increment, serverTimestamp } from 'firebase/firestore';
import { db, appId } from '../../firebase/config';

const PROGRAM_LABELS = {
    amazon: 'Amazon',
    manomano: 'ManoMano',
    leroymerlin: 'Leroy Merlin',
    rakuten: 'Rakuten',
    castorama: 'Castorama',
    direct: 'Direct'
};

const TIER_LABELS = {
    essentiel: 'Essentiel',
    premium: 'Premium',
    expert: 'Expert'
};

const getTierBadgeClass = (tier) => {
    if (tier === 'premium') return 'bg-amber-400 text-white';
    if (tier === 'expert') return 'bg-stone-900/90 text-white backdrop-blur-sm';
    return 'bg-white/90 text-stone-700';
};

const ShopProductCard = ({ product, darkMode = false }) => {
    const handleAffiliateClick = async (event) => {
        event.preventDefault();
        if (!product?.affiliateUrl) return;

        // Keep popup call synchronous to avoid popup blockers.
        window.open(product.affiliateUrl, '_blank', 'noopener,noreferrer');

        try {
            await addDoc(collection(db, 'affiliate_clicks'), {
                productId: product.id,
                productName: product.name || '',
                affiliateProgram: product.affiliateProgram || 'direct',
                category: product.category || 'unknown',
                tier: product.tier || 'essentiel',
                timestamp: serverTimestamp(),
                sessionId: sessionStorage.getItem('analytics_session_id') || null,
                referrer: 'shop'
            });

            await updateDoc(
                doc(db, 'artifacts', appId, 'public', 'data', 'affiliate_products', product.id),
                { clickCount: increment(1) }
            );
        } catch (error) {
            console.error('Affiliate tracking failed:', error);
        }
    };

    return (
        <article className="group transition-transform duration-300 hover:-translate-y-1">
            <div className="relative overflow-hidden rounded-3xl border border-stone-200/60 bg-stone-100/40 dark:bg-stone-900/30 dark:border-white/5">
                <img
                    src={product.imageUrl || 'https://images.unsplash.com/photo-1616627456224-a80e6f7dd0bb?auto=format&fit=crop&w=900&q=80'}
                    alt={product.name || 'Produit'}
                    className="w-full aspect-[1/1] md:aspect-[4/5] object-cover transition-transform duration-[800ms] ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-110"
                    loading="lazy"
                />

                <span className={`absolute bottom-3 left-3 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest rounded-full ${getTierBadgeClass(product.tier)}`}>
                    {TIER_LABELS[product.tier] || 'Essentiel'}
                </span>

                <span className={`absolute top-3 right-3 px-2 py-1 rounded-lg text-[8px] font-black uppercase backdrop-blur-sm ${darkMode ? 'bg-black/70 text-stone-200' : 'bg-white/90 text-stone-500'}`}>
                    {PROGRAM_LABELS[product.affiliateProgram] || 'Direct'}
                </span>
            </div>

            <div className="pt-3 space-y-2.5">
                <div className="space-y-1.5">
                    <p className={`text-[10px] uppercase tracking-[0.2em] font-black ${darkMode ? 'text-stone-500' : 'text-stone-400'}`}>
                        {product.brand || 'Atelier'}
                    </p>
                    <h3 className={`font-serif text-[15px] md:text-[16px] leading-tight ${darkMode ? 'text-white' : 'text-stone-900'}`}>
                        {product.name || 'Produit de rénovation'}
                    </h3>
                    <p className={`text-[12px] font-black ${darkMode ? 'text-stone-300' : 'text-stone-600'}`}>
                        {(Number(product.price) || 0).toFixed(2).replace('.', ',')} EUR
                    </p>
                    <p className={`text-[11px] leading-relaxed line-clamp-2 ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                        {product.whyWeRecommend || product.description || 'Sélection atelier pour entretenir et protéger vos meubles.'}
                    </p>
                </div>

                <div className="space-y-1">
                    <a
                        href={product.affiliateUrl || '#'}
                        target="_blank"
                        rel="noopener noreferrer sponsored"
                        onClick={handleAffiliateClick}
                        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-colors duration-300 ${darkMode ? 'bg-white text-stone-900 hover:bg-stone-100' : 'bg-stone-900 text-white hover:bg-stone-700'}`}
                    >
                        Voir l'offre
                        <ExternalLink size={12} />
                    </a>
                    <p className={`text-[9px] uppercase tracking-wider ${darkMode ? 'text-stone-600' : 'text-stone-400'}`}>
                        Lien partenaire
                    </p>
                </div>
            </div>
        </article>
    );
};

export default ShopProductCard;
