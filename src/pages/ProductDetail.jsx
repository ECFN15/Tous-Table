import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, Award, Mail, Box, Ruler, History, Quote, Heart, MessageCircle, Share2, ArrowRight } from 'lucide-react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db, appId, functions } from '../firebase/config';
import { httpsCallable } from 'firebase/functions';
import { getMillis, formatTime } from '../utils/time';
import AuctionTimer from '../components/ui/AuctionTimer';
import ConfettiRain from '../components/ui/ConfettiRain';
const SEO = React.lazy(() => import('../components/SEO'));

const placeBidFunction = httpsCallable(functions, 'placeBid');

import { useRealtimeUserLikes } from '../hooks/useRealtimeUserLikes'; // Import
import { useLiveTheme } from '../hooks/useLiveTheme';

const ProductDetail = ({ item, user, onBack, onAddToCart, onShowComments, darkMode }) => {
  const { palette, isStandardMode, activeDesignId } = useLiveTheme(darkMode); // Add activeDesignId
  const [activeImg, setActiveImg] = useState(0);
  const [bidLoading, setBidLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [bidsHistory, setBidsHistory] = useState([]);

  // HOOK TEMPS RÉEL
  const { likedItemIds, toggleLike } = useRealtimeUserLikes(user);

  // MISSING STATE CORRECTION
  const [forceWinnerCheck, setForceWinnerCheck] = useState(false);

  // 1. SAFEGUARD "isLiked"
  const isLiked = item ? likedItemIds.includes(item.id) : false;
  const isArch = activeDesignId === 'architectural'; // Architectural Flag

  // 2. HOOKS (MUST RUN BEFORE ANY RETURN)
  const images = useMemo(() => {
    if (!item) return [];
    const imgs = item.images || (item.imageUrl ? [item.imageUrl] : []);
    return Array.isArray(imgs) ? imgs : [item.imageUrl || ""];
  }, [item]);

  const collectionName = useMemo(() => {
    if (!item) return 'furniture';
    return item.collectionName || ((item.id && item.id.includes('board')) ? 'cutting_boards' : 'furniture');
  }, [item]);

  // OPTIMIZATION: Preload images for instant navigation
  useEffect(() => {
    if (!images || images.length === 0) return;
    images.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [images]);

  useEffect(() => {
    // Only subscribe if item exists AND is auction
    if (!item?.auctionActive) return;

    try {
      const q = query(
        collection(db, 'artifacts', appId, 'public', 'data', collectionName, item.id, 'bids'),
        orderBy('timestamp', 'desc'),
        limit(10)
      );
      return onSnapshot(q, (snap) => setBidsHistory(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    } catch (err) {
      console.error("Error subscribing to bids:", err);
    }
  }, [item?.id, collectionName, item?.auctionActive]);

  // 3. SAFE DERIVED VARIABLES
  const isAuctionOver = item?.auctionActive && getMillis(item.auctionEnd) < Date.now();
  const isWinner = isAuctionOver && user && item?.lastBidderId === user.uid;

  // 4. EARLY RETURN (Only AFTER all hooks)
  if (!item) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 pt-32 text-center animate-in fade-in duration-500">
      {/* Error state can remain similiar, maybe simplified */}
      <div className="p-6 rounded-full bg-stone-100 mb-4 animate-pulse">
        <Box size={40} className="text-stone-400" />
      </div>
      <div className="space-y-2">
        <h2 className="text-xl md:text-2xl font-black uppercase tracking-widest">
          Produit Introuvable
        </h2>
      </div>
      <button onClick={onBack} className="px-8 py-3 bg-stone-900 text-white uppercase tracking-widest text-xs font-bold">Retour</button>
    </div>
  );

  // Appel sécurisé via Cloud Function
  const handleQuickBid = async (inc) => {
    if (bidLoading) return;
    if (!user) {
      setMsg({ type: 'error', text: 'Connectez-vous pour enchérir.' });
      return;
    }

    setBidLoading(true);
    try {
      const result = await placeBidFunction({
        itemId: item.id,
        collectionName: 'furniture', // ou 'cutting_boards' selon le contexte
        increment: inc
      });

      if (result.data.success) {
        setMsg({ type: 'success', text: `Offre validée ! Nouveau prix: ${result.data.newPrice}€` });
      }
    } catch (e) {
      // Extraire le message d'erreur de la Cloud Function
      const errorMessage = e.message || 'Erreur lors de l\'enchère.';
      setMsg({ type: 'error', text: errorMessage });
    } finally {
      setBidLoading(false);
      setTimeout(() => setMsg(null), 3000);
    }
  };

  const handleLike = async () => {
    if (!user) {
      setMsg({ type: 'error', text: 'Connectez-vous pour liker.' });
      return;
    }
    const col = item.collectionName || (item.id.includes('board') ? 'cutting_boards' : 'furniture');
    await toggleLike(item.id, col);
  };

  const handleShare = async () => {
    const col = item.collectionName || (item.id.includes('board') ? 'cutting_boards' : 'furniture');
    const shareData = {
      title: item.name,
      text: `Découvrez ${item.name} sur Tous à Table`,
      url: window.location.origin + '/?product=' + item.id
    };
    try {
      if (navigator.share) await navigator.share(shareData);
      else {
        await navigator.clipboard.writeText(shareData.url);
        alert("Lien copié !");
      }
      const trackShareFn = httpsCallable(functions, 'trackShare');
      trackShareFn({ itemId: item.id, collectionName: col });
    } catch (e) { }
  };

  // --- SCHEMA.ORG (SEO) ---
  const productSchema = useMemo(() => {
    return {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": item.name,
      "image": images,
      "description": item.description,
      "brand": {
        "@type": "Brand",
        "name": "Tous à Table - Atelier Normand"
      },
      "offers": {
        "@type": "Offer",
        "url": `${window.location.origin}/?product=${item.id}`,
        "priceCurrency": "EUR",
        "price": item.currentPrice || item.startingPrice,
        "availability": !item.sold ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        "itemCondition": "https://schema.org/RefurbishedCondition"
      }
    };
  }, [item, images]);



  // --- RENDER ---
  return (
    <div
      className={`min-h-screen transition-colors duration-500 animate-in fade-in ${isArch ? (darkMode ? 'bg-[#0A0A0A] text-stone-200' : 'bg-[#FAFAF9] text-stone-900') : ''}`}
      style={isStandardMode && !isArch ? {
        backgroundImage: `linear-gradient(to bottom, ${palette.bgGradientTop}, ${palette.bgGradientBot})`,
        color: palette.textBody
      } : {}}
    >
      <div className="max-w-[1920px] mx-auto pt-24 md:pt-32 px-6 md:px-12 pb-20">
        <React.Suspense fallback={null}>
          <SEO
            title={`${item.name} - Tous à Table`}
            description={item.description || `Découvrez cette pièce unique : ${item.name}.`}
            image={item.images?.[0] || item.imageUrl}
            url={`/?product=${item.id}`}
            schema={productSchema}
          />
        </React.Suspense>

        {isWinner && <ConfettiRain />}

        <button onClick={onBack} className={`mb-8 flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest transition-colors ${isArch ? 'px-0' : ''}`} style={!isArch ? { color: palette.textSubtitle } : {}}>
          <ChevronLeft size={14} /> Retour collection
        </button>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-24" style={!isArch ? { color: palette.textBody } : {}}>
          {/* Colonne Gauche: Images & Story */}
          <div className="space-y-8 sticky top-32 h-fit">
            <div className={`aspect-square overflow-hidden relative transform-gpu backface-hidden group cursor-pointer ${isArch ? 'rounded-none' : 'ring-1 ring-inset rounded-2xl'}`}
              style={!isArch ? { backgroundColor: palette.cardBg, '--tw-ring-color': palette.switcherBorder, borderRadius: palette.borderRadius, boxShadow: palette.cardShadow } : {}}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                if (x < rect.width / 2) {
                  setActiveImg(prev => prev === 0 ? images.length - 1 : prev - 1);
                } else {
                  setActiveImg(prev => prev === images.length - 1 ? 0 : prev + 1);
                }
              }}>
              <img src={images[activeImg]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={item.name} />

              {/* Hover Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <div className="absolute top-1/2 left-4 -translate-y-1/2 p-3 rounded-full bg-black/20 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black/40">
                    <ChevronLeft size={24} />
                  </div>
                  <div className="absolute top-1/2 right-4 -translate-y-1/2 p-3 rounded-full bg-black/20 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black/40 rotate-180">
                    <ChevronLeft size={24} />
                  </div>
                </>
              )}
            </div>

            {/* Modern Image Navigation Pager */}
            {images.length > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImg(idx)}
                    className={`h-0.5 transition-all duration-300 ${activeImg === idx ? 'w-8 bg-black dark:bg-white' : 'w-4 bg-stone-300 dark:bg-stone-700'}`}
                    aria-label={`Voir image ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Colonne Droite: Actions & Stats */}
          <div className="space-y-10 px-1 py-4">

            {/* Header Product */}
            <div className="space-y-4">
              <div className="flex gap-2">
                <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest border ${isArch ? 'border-stone-200 dark:border-stone-800 bg-transparent text-stone-500' : 'rounded-full'}`} style={!isArch ? { backgroundColor: `${palette.accent}20`, borderColor: `${palette.accent}40`, color: palette.accent } : {}}>Lot n°{item.id.substring(0, 4)}</span>
              </div>
              <h1 className={`text-4xl md:text-6xl font-black tracking-tighter leading-none ${isArch ? 'font-serif font-normal italic' : ''}`} style={!isArch ? { color: palette.textTitle } : {}}>{item.name}</h1>

              <div className="flex flex-wrap items-center gap-6 pt-2">
                <button onClick={handleLike} className="flex items-center gap-2 transition-colors group/stat hover:opacity-80 opacity-60 hover:opacity-100">
                  <Heart size={16} className={isLiked ? "fill-current text-red-500" : ""} />
                  <span className="text-xs font-bold">{item.likeCount || 0} Likes</span>
                </button>
                <button onClick={() => onShowComments(item)} className="flex items-center gap-2 transition-colors group/stat hover:opacity-80 opacity-60 hover:opacity-100">
                  <MessageCircle size={16} />
                  <span className="text-xs font-bold">{item.commentCount || 0} Avis</span>
                </button>
                <button onClick={handleShare} className="flex items-center gap-2 transition-colors group/stat hover:opacity-80 opacity-60 hover:opacity-100">
                  <Share2 size={16} />
                  <span className="text-xs font-bold">Partager</span>
                </button>
              </div>
            </div>

            {/* Description */}
            <div className={`p-8 ${isArch ? 'border-l pl-8 border-stone-200 dark:border-stone-800 p-0' : 'ring-1 ring-inset rounded-2xl'}`} style={!isArch ? { backgroundColor: palette.cardBg, '--tw-ring-color': palette.switcherBorder, borderRadius: palette.borderRadius, boxShadow: palette.cardShadow } : {}}>
              <p className="text-lg leading-relaxed font-light opacity-80 whitespace-pre-wrap">
                {item.description}
              </p>
            </div>

            {/* Price & Action */}
            <div className={`p-8 ${isArch ? 'bg-transparent border-t border-b border-stone-200 dark:border-stone-800' : 'ring-1 ring-inset rounded-2xl overflow-hidden'}`}
              style={!isArch ? {
                backgroundColor: palette.cardBg,
                '--tw-ring-color': isWinner ? palette.accent : palette.switcherBorder,
                color: palette.textBody,
                boxShadow: isWinner ? `0 0 30px -5px ${palette.accent}60` : palette.cardShadow,
                borderRadius: palette.borderRadius
              } : {}}
            >
              <div className="flex justify-between items-end mb-8">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Prix Actuel</p>
                  <p className={`text-6xl font-black tracking-tighter ${isArch ? 'font-serif italic font-normal' : ''}`}>{item.currentPrice || item.startingPrice} €</p>
                </div>
              </div>

              {item.auctionActive && !isAuctionOver ? (
                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase opacity-40">Placer une enchère rapide</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[10, 50, 100].map(inc => (
                      <button key={inc} onClick={() => handleQuickBid(inc)} disabled={bidLoading}
                        className={`py-4 border font-black text-xs hover:bg-black hover:text-white transition-all 
                                    ${isArch ? 'border-stone-200 dark:border-stone-700 bg-transparent' : 'bg-stone-50 border-stone-200 rounded-2xl'}`}>
                        +{inc}€
                      </button>
                    ))}
                  </div>
                </div>
              ) : !item.auctionActive ? (
                <button
                  onClick={() => onAddToCart(item)}
                  className={`w-full py-6 text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-emerald-600 transition-all flex items-center justify-center gap-4 group 
                    ${isArch ? 'bg-[#0A0A0A] dark:bg-white dark:text-black rounded-none' : 'bg-stone-900 rounded-2xl shadow-xl'}`}
                >
                  <span>Acquérir cette pièce</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <div className="text-center py-4 bg-stone-50 rounded-none border border-stone-200 text-stone-400">
                  <span className="font-serif italic">Vente terminée</span>
                </div>
              )}
            </div>

            {/* Specifications */}
            <div className="grid grid-cols-2 gap-8 pt-4">
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest mb-2 opacity-50">Matières</p>
                <p className="text-sm font-medium">{item.material || "Non spécifié"}</p>
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest mb-2 opacity-50">Dimensions</p>
                <p className="text-sm font-medium font-mono opacity-80">{item.width ? `${item.width} x ${item.depth} x ${item.height} cm` : item.dimensions}</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;