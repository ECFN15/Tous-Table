import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { addDoc, collection, updateDoc, doc, increment, serverTimestamp } from 'firebase/firestore';
import { db, appId } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';

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

const getTierBadgeClass = (tier, darkMode) => {
    if (tier === 'premium') return darkMode ? 'bg-amber-500/30 text-amber-300 border-amber-400/30' : 'bg-amber-500/30 text-amber-700 border-amber-600/30';
    if (tier === 'expert') return darkMode ? 'bg-stone-800/60 text-white border-white/20' : 'bg-stone-900/60 text-white border-white/30';
    return darkMode ? 'bg-white/10 text-stone-300 border-white/20' : 'bg-white/20 text-stone-700 border-stone-300/30';
};

const ShopProductCard = ({ product, darkMode = false }) => {
    const { isAdmin } = useAuth();
    const [parallax, setParallax] = useState({ x: 0, y: 0 });
    
    const handleAffiliateClick = async (event) => {
        event.preventDefault();
        if (!product?.affiliateUrl) return;

        // Keep popup call synchronous to avoid popup blockers.
        window.open(product.affiliateUrl, '_blank', 'noopener,noreferrer');

        // Exclude admin users from analytics stats
        if (isAdmin) {
            console.log(`[Shop Stats] Admin click on "${product.name}" excluded from tracking.`);
            return;
        }

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

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        setParallax({ x: x * 10, y: y * 10 });
    };

    const handleMouseLeave = () => {
        setParallax({ x: 0, y: 0 });
    };

    return (
        <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="group relative"
        >
            {/* BLOC IMAGE */}
            <div 
                className="relative aspect-[3/4] rounded-[28px] overflow-hidden mb-4 bg-white cursor-default group/img transform-gpu will-change-transform outline outline-1 outline-transparent"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >
                <div className="absolute inset-0 bg-white" />
                
                <motion.img
                    src={product.imageUrl || 'https://images.unsplash.com/photo-1616627456224-a80e6f7dd0bb?auto=format&fit=crop&w=900&q=80'}
                    alt={product.name || 'Produit'}
                    className="relative z-10 w-full h-full object-contain p-5 transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-[1.08]"
                    style={{
                        transform: `translate(${parallax.x * 0.4}px, ${parallax.y * 0.4}px)`
                    }}
                    loading="lazy"
                />
                
                {/* Hover Overlay - Type Vibe_FX (Darken + Translate) */}
                <div className="absolute inset-0 z-20 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out pointer-events-none">
                    {/* Background Sombre */}
                    <div className={`absolute inset-0 ${darkMode ? 'bg-[#0f0e0d]/85' : 'bg-black/80'}`}></div>
                    
                    {/* Contenu Défilant de l'Overlay */}
                    <div className="relative z-30 p-5 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 ease-out flex flex-col h-full justify-end">
                        
                        <div className="max-h-[85%] overflow-y-auto w-full no-scrollbar flex flex-col justify-end pointer-events-auto">
                            
                            <h4 className="text-white font-serif text-[17px] leading-[1.2] mb-3 drop-shadow-sm">
                                {product.name}
                            </h4>

                            <div className="w-6 h-[2px] bg-amber-500 rounded-full mb-3 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>

                            {/* Description Complete */}
                            <p className="text-white/95 text-[11px] leading-[1.6] mb-4">
                                {product.description || product.whyWeRecommend || 'Produit de qualité professionnelle sélectionné par nos soins.'}
                            </p>

                            {product.proTips && (
                                <div className="bg-white/10 rounded-[16px] p-3.5 border border-white/10 mb-2">
                                    <h5 className="text-[9px] uppercase font-black text-amber-500 tracking-[0.15em] mb-1.5 flex items-center gap-1.5 drop-shadow-sm">
                                        ✦ Tip de L'Atelier
                                    </h5>
                                    <p className="text-white text-[11px] leading-relaxed italic font-light opacity-90 drop-shadow-sm">
                                        "{product.proTips}"
                                    </p>
                                </div>
                            )}

                            {product.benefits && (
                                <div className="mt-3 flex flex-wrap gap-1.5">
                                    {(Array.isArray(product.benefits) ? product.benefits : product.benefits.split('-')).filter(b => b.trim()).map((benefit, i) => (
                                        <span key={i} className="text-[9px] px-2 py-1 bg-white/10 text-white rounded-md border border-white/20 shadow-sm">
                                            {benefit.replace(/^- /, '').trim()}
                                        </span>
                                    ))}
                                </div>
                            )}

                        </div>
                    </div>
                </div>
                
                {/* Badge Amazon (Haut-Droit) */}
                <div className={`absolute top-4 right-4 z-30 px-2.5 py-1 rounded-md backdrop-blur-md border flex items-center justify-center transition-opacity duration-300 ${darkMode ? 'bg-white/10 border-white/20 group-hover:bg-transparent group-hover:border-transparent group-hover:backdrop-blur-none group-hover:opacity-0' : 'bg-white/20 border-white/30 text-stone-900 shadow-sm group-hover:opacity-0'}`}>
                    <span className={`text-[8.5px] uppercase tracking-wider font-black ${darkMode ? 'text-white' : 'text-stone-900 group-hover:text-white'}`}>
                        {PROGRAM_LABELS[product.affiliateProgram] || 'Direct'}
                    </span>
                </div>
                
                {/* Badge Gamme (Bas-Gauche) */}
                <div className={`absolute z-30 bottom-4 left-4 px-3 py-1.5 rounded-full backdrop-blur-md shadow-sm border flex items-center justify-center transition-opacity duration-300 ${getTierBadgeClass(product.tier, darkMode)} group-hover:opacity-0`}>
                    <span className="text-[9px] uppercase tracking-wide font-bold">
                        {TIER_LABELS[product.tier] || 'Essentiel'}
                    </span>
                </div>
            </div>

            {/* BLOC TEXTE */}
            <div className="space-y-1.5 sm:space-y-2 mt-4 px-1">
                {/* Marque */}
                <p className={`text-[9px] font-black uppercase tracking-[0.3em] ${darkMode ? 'text-amber-500/80' : 'text-amber-600/80'}`}>
                    {product.brand || 'ATELIER'}
                </p>
                
                {/* Nom du Produit */}
                <h3 className={`text-[19px] md:text-[23px] font-serif leading-tight line-clamp-2 ${darkMode ? 'text-stone-50' : 'text-stone-900'}`}>
                    {product.name || 'Produit de rénovation'}
                </h3>
                
                {/* Prix */}
                <p className={`text-[12px] font-medium tracking-wide ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                    {(Number(product.price) || 0).toFixed(2).replace('.', ',')} EUR
                </p>
                
                {/* Description Courte */}
                <p className={`text-[12px] leading-relaxed line-clamp-2 opacity-60 mt-1 ${darkMode ? 'text-stone-300' : 'text-stone-600'}`}>
                    {product.whyWeRecommend || product.description || 'Sélection atelier pour entretenir et protéger vos meubles.'}
                </p>
            </div>

            {/* CTA - Capsule Glass avec Backdrop Subtil */}
            <motion.a
                href={product.affiliateUrl || '#'}
                target="_blank"
                rel="noopener noreferrer sponsored"
                onClick={handleAffiliateClick}
                className={`
                    mt-3 sm:mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full
                    backdrop-blur-sm border
                    text-[11px] font-medium
                    transition-all duration-300
                    ${darkMode 
                        ? 'bg-white/5 border-white/10 text-stone-300 hover:bg-amber-500/10 hover:border-amber-500/30 hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]' 
                        : 'bg-stone-900/5 border-stone-200/50 text-stone-700 hover:bg-amber-500/10 hover:border-amber-500/30 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                    }
                `}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                <span>Découvrir</span>
                <motion.span
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                    →
                </motion.span>
            </motion.a>
        </motion.article>
    );
};

export default ShopProductCard;
