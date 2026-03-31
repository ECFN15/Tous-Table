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
    if (tier === 'premium') return 'bg-amber-500/20 text-amber-700 border-amber-500/30 font-black'; // Contrasted amber
    if (tier === 'expert') return 'bg-stone-600/80 text-white border-white/20 font-bold'; // Solid gray
    return 'bg-stone-200/80 text-stone-700 border-stone-300 font-bold'; // Light gray
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
            className="group relative flex flex-col h-full"
        >
            {/* BLOC IMAGE */}
            <div 
                className="relative aspect-[3/4] rounded-[16px] lg:rounded-[28px] overflow-hidden mb-4 bg-[#f5f0eb] cursor-default group/img [clip-path:inset(1.5px_round_16px)] lg:[clip-path:inset(1.5px_round_28px)] transform-gpu"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >
                <motion.img
                    src={product.imageUrl || 'https://images.unsplash.com/photo-1616627456224-a80e6f7dd0bb?auto=format&fit=crop&w=900&q=80'}
                    alt={product.name || 'Produit'}
                    className="relative z-10 w-full h-full object-contain p-5 transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-[1.08]"
                    style={{
                        transform: `translate(${parallax.x * 0.4}px, ${parallax.y * 0.4}px)`,
                        mixBlendMode: 'multiply',
                    }}
                    loading="lazy"
                />
                
                {/* Hover Overlay - Type Premium (Citation + Détails) */}
                <div className="absolute inset-0 z-20 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out pointer-events-none">
                    {/* Background Sombre */}
                    <div className={`absolute inset-0 ${darkMode ? 'bg-[#0f0e0d]/95' : 'bg-black/90'} backdrop-blur-[4px]`}></div>
                    
                    {/* Contenu de l'Overlay */}
                    <div className="relative z-30 p-3 sm:p-4 lg:p-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out flex flex-col h-full pointer-events-auto">
                        
                        <div className="flex-1 overflow-y-auto no-scrollbar pt-2 lg:pt-3">
                            {/* Icône de Citation & Projection Emotionnelle */}
                            <div className="mb-3 lg:mb-6">
                                <svg className="w-5 h-5 lg:w-8 lg:h-8 text-amber-500/80 mb-1 lg:mb-3 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 8.44772 14.017 9V12C14.017 12.5523 13.5693 13 13.017 13H11.017V21H14.017ZM5.017 21V18C5.017 16.8954 5.91243 16 7.017 16H10.017C10.5693 16 11.017 15.5523 11.017 15V9C11.017 8.44772 10.5693 8 10.017 8H6.017C5.46472 8 5.017 8.44772 5.017 9V12C5.017 12.5523 4.56929 13 4.017 13H2.017V21H5.017Z" />
                                </svg>
                                <p className="hidden lg:block text-stone-100 font-serif italic text-[11px] sm:text-[12.5px] lg:text-[17px] leading-snug lg:leading-relaxed drop-shadow-sm mt-1 lg:mt-0">
                                    {product.experientialDetail || "Imaginez la transformation de votre intérieur avec ce produit d'exception."}
                                </p>
                            </div>

                            {/* Section Technique / Description */}
                            <div className="space-y-4">
                                <div className="mb-2 lg:mb-0">
                                    <h4 className="text-amber-500/90 text-[8.5px] lg:text-[10px] font-black uppercase tracking-[0.2em] mb-1 lg:mb-2">Détails</h4>
                                    <p className="text-stone-300 text-[9.5px] sm:text-[10.5px] lg:text-[12px] leading-relaxed">
                                        {product.description || product.whyWeRecommend}
                                    </p>
                                </div>

                                {(product.proTips || product.proTip) && (
                                    <div className="hidden lg:block bg-white/5 rounded-lg lg:rounded-xl p-3 lg:p-4 border border-white/10 mt-4 lg:mt-6">
                                        <h5 className="text-[10px] uppercase font-black text-amber-500/90 tracking-[0.1em] mb-1.5 lg:mb-2 flex items-center gap-1.5 lg:gap-2">
                                            <span>✦</span> Conseil de l'Atelier
                                        </h5>
                                        <p className="text-stone-300 text-[11px] leading-relaxed italic opacity-90">
                                            "{product.proTips || product.proTip}"
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Badge Amazon (Haut-Droit) */}
                <div className={`absolute top-2 right-2 sm:top-4 sm:right-4 z-30 px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-md backdrop-blur-md border flex items-center justify-center transition-opacity duration-300 ${darkMode ? 'bg-stone-900/40 border-stone-800/30 group-hover:opacity-0' : 'bg-stone-900/60 border-stone-800/30 shadow-sm group-hover:opacity-0'}`}>
                    <span className="text-[7.5px] sm:text-[10px] uppercase tracking-wider font-black text-white/90">
                        {PROGRAM_LABELS[product.affiliateProgram] || 'Direct'}
                    </span>
                </div>
                
                {/* Badge Gamme (Bas-Gauche) */}
                <div className={`absolute z-30 bottom-2 left-2 sm:bottom-4 sm:left-4 px-2 py-0.5 sm:px-3 sm:py-1.5 rounded-full backdrop-blur-md shadow-sm border flex items-center justify-center transition-opacity duration-300 ${getTierBadgeClass(product.tier, darkMode)} group-hover:opacity-0`}>
                    <span className="text-[7.5px] sm:text-[9px] uppercase tracking-wide font-bold">
                        {TIER_LABELS[product.tier] || 'Essentiel'}
                    </span>
                </div>
            </div>

            {/* BLOC TEXTE ET CTA */}
            <div className="flex flex-col flex-1 mt-4 px-1 pb-2">
                {/* Marque */}
                <p className={`text-[9px] font-black uppercase tracking-[0.3em] mb-1.5 ${darkMode ? 'text-amber-500/80' : 'text-amber-600/80'}`}>
                    {product.brand || 'ATELIER'}
                </p>
                
                {/* Nom du Produit - Taille Ajustée */}
                <h3 className={`text-[18px] md:text-[21px] font-serif leading-tight line-clamp-2 mb-1.5 ${darkMode ? 'text-stone-50' : 'text-stone-900'}`}>
                    {product.name || 'Produit de rénovation'}
                </h3>
                
                {/* PRIX + BOUTON (Groupe toujours poussé en bas de carte) */}
                <div className="mt-auto pt-4 flex flex-col">
                    {/* Prix */}
                    <p className={`text-[12px] font-medium tracking-wide mb-3.5 ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                        Prix : {(Number(product.price) || 0).toFixed(2).replace('.', ',')} EUR
                    </p>

                    {/* CTA */}
                    <div className="flex items-start">
                        <motion.a
                            href={product.affiliateUrl || '#'}
                            target="_blank"
                            rel="noopener noreferrer sponsored"
                            onClick={handleAffiliateClick}
                            className={`
                                inline-flex items-center gap-2 px-4 py-2 rounded-full
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
                    </div>
                </div>
            </div>
        </motion.article>
    );
};

export default ShopProductCard;
