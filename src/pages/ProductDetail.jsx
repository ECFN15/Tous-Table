import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, Award, Mail, Box, Ruler, History, Quote, Heart, MessageCircle, Share2 } from 'lucide-react';
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
  const { palette, isStandardMode } = useLiveTheme(darkMode);
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
  // 4. EARLY RETURN (Only AFTER all hooks)
  if (!item) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 pt-32 text-center animate-in fade-in duration-500">
      <div className="p-6 rounded-full bg-stone-100 mb-4 animate-pulse">
        <Box size={40} className="text-stone-400" />
      </div>
      <div className="space-y-2">
        <h2 className="text-xl md:text-2xl font-black uppercase tracking-widest" style={{ color: palette?.textTitle || '#000' }}>
          Produit Introuvable
        </h2>
        <p className="max-w-md text-sm font-medium opacity-60 mx-auto" style={{ color: palette?.textBody || '#555' }}>
          Ce meuble semble avoir été déplacé ou vendu. <br />Il se peut que les données soient en cours de chargement.
        </p>
      </div>
      <button
        onClick={onBack}
        className="px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all hover:scale-105 hover:shadow-lg bg-stone-900 text-white"
      >
        Retour à la Galerie
      </button>
      <div className="text-[10px] font-mono opacity-30 mt-8">
        Debug ID: {user?.uid ? 'User Connected' : 'Guest'}
      </div>
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
      className="min-h-screen transition-colors duration-500 animate-in fade-in"
      style={isStandardMode ? {
        backgroundImage: `linear-gradient(to bottom, ${palette.bgGradientTop}, ${palette.bgGradientBot})`,
        color: palette.textBody
      } : {}}
    >
      <div className="max-w-6xl mx-auto pt-32 px-6 pb-20">
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

        <button onClick={onBack} className="mb-8 flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest transition-colors" style={{ color: palette.textSubtitle }}>
          <ChevronLeft size={14} /> Retour collection
        </button>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-16" style={{ color: palette.textBody }}>
          {/* Colonne Gauche: Images & Story */}
          <div className="space-y-8">
            <div className="aspect-square rounded-[2.5rem] overflow-hidden ring-1 ring-inset shadow-2xl relative transform-gpu backface-hidden group cursor-pointer" style={{ backgroundColor: palette.cardBg, '--tw-ring-color': palette.switcherBorder }} onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              if (x < rect.width / 2) {
                setActiveImg(prev => prev === 0 ? images.length - 1 : prev - 1);
              } else {
                setActiveImg(prev => prev === images.length - 1 ? 0 : prev + 1);
              }
            }}>
              <img src={images[activeImg]} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt={item.name} />

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

              {item.auctionActive && (
                <div className="absolute bottom-6 left-6 backdrop-blur px-4 py-2 rounded-2xl shadow-xl ring-1 ring-inset" style={{ backgroundColor: palette.switcherBg, '--tw-ring-color': palette.switcherBorder, color: palette.textBody }}>
                  <AuctionTimer endDate={item.auctionEnd} onFinished={() => setForceWinnerCheck(true)} />
                </div>
              )}
            </div>
            {/* Modern Image Navigation Pager */}
            {images.length > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImg(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${activeImg === idx ? 'w-8' : 'w-2 hover:w-4'}`}
                    style={{
                      backgroundColor: activeImg === idx ? palette.accent : palette.textSubtitle,
                      opacity: activeImg === idx ? 1 : 0.3
                    }}
                    aria-label={`Voir image ${idx + 1}`}
                  />
                ))}
              </div>
            )}

            <div className="p-8 rounded-[2.5rem] ring-1 ring-inset shadow-sm relative overflow-hidden group transform-gpu backface-hidden" style={{ backgroundColor: palette.cardBg, '--tw-ring-color': palette.switcherBorder }}>
              <Quote size={48} className="absolute top-4 right-6 transition-colors opacity-5 rotate-12" style={{ color: palette.textBody }} />
              <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-2" style={{ color: palette.textSubtitle }}>
                  <span className="w-4 h-px" style={{ backgroundColor: palette.textSubtitle }}></span> L'histoire de la pièce
                </p>
                <p className="text-sm leading-snug font-medium whitespace-pre-wrap" style={{ color: palette.textBody }}>
                  {item.description}
                </p>
              </div>
            </div>
          </div>

          {/* Colonne Droite: Actions & Stats */}
          <div className="space-y-8 px-1">
            <div className="space-y-3" style={{ color: palette.textBody }}>
              <div className="flex gap-2">
                <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border" style={{ backgroundColor: `${palette.accent}20`, borderColor: `${palette.accent}40`, color: palette.accent }}>Lot n°{item.id.substring(0, 4)}</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-tight" style={{ color: palette.textTitle }}>{item.name}</h1>

              <div className="flex flex-wrap items-center gap-4 md:gap-6 pt-2">
                <button
                  onClick={handleLike}
                  className="flex items-center gap-2 transition-colors group/stat hover:opacity-80"
                  style={{ color: palette.textSubtitle }}
                >
                  <Heart size={16} className={isLiked ? "fill-current text-red-500" : "group-hover/stat:scale-110 transition-transform"} style={{ color: isLiked ? '#ef4444' : palette.textSubtitle }} />
                  <span className="text-xs font-black">{item.likeCount || 0} <span className="hidden sm:inline">Likes</span></span>
                </button>
                <button
                  onClick={() => onShowComments(item)}
                  className="flex items-center gap-2 transition-colors group/stat hover:opacity-80"
                  style={{ color: palette.textSubtitle }}
                >
                  <div className="relative">
                    <MessageCircle size={16} className={item.commentCount > 0 ? "fill-current" : "group-hover/stat:scale-110 transition-transform"} style={{ color: item.commentCount > 0 ? palette.accent : palette.textSubtitle }} />
                  </div>
                  <span className="text-xs font-black">{item.commentCount || 0} <span className="hidden sm:inline">Avis</span></span>
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 transition-colors group/stat hover:opacity-80"
                  style={{ color: palette.textSubtitle }}
                >
                  <Share2 size={16} className={item.shareCount > 0 ? "" : "group-hover/stat:scale-110 transition-transform"} style={{ color: item.shareCount > 0 ? '#a855f7' : palette.textSubtitle }} />
                  <span className="text-xs font-black">{item.shareCount || 0} <span className="hidden sm:inline">Partages</span></span>
                </button>
              </div>
            </div>

            <div className={`p-8 rounded-[3rem] ring-1 ring-inset overflow-hidden transition-all duration-700 transform-gpu backface-hidden ${isWinner ? 'scale-[1.02]' : 'shadow-xl'}`}
              style={{
                backgroundColor: palette.cardBg,
                '--tw-ring-color': isWinner ? palette.accent : palette.switcherBorder,
                color: palette.textBody,
                boxShadow: isWinner ? `0 0 30px -5px ${palette.accent}60` : undefined
              }}
            >
              <div className="flex justify-between items-end mb-8">
                <div className="space-y-0.5">
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Offre actuelle</p>
                  <p className="text-5xl font-black tracking-tighter transition-all" style={{ color: isWinner ? palette.accent : palette.textTitle }}>{item.currentPrice || item.startingPrice} €</p>
                </div>
                {item.auctionActive ? (
                  <div className="text-right space-y-1">
                    <p className="text-[9px] font-black opacity-60 uppercase tracking-widest">Mises</p>
                    <p className="text-2xl font-black">{item.bidCount || 0}</p>
                  </div>
                ) : (item.stock > 1 && (
                  <div className="text-right space-y-1">
                    <p className="text-[9px] font-black opacity-60 uppercase tracking-widest">En Stock</p>
                    <p className="text-2xl font-black text-emerald-600">{item.stock}</p>
                  </div>
                ))}
              </div>

              {isWinner ? (
                <div className="text-center space-y-4 py-6 animate-in zoom-in-95 slide-in-from-top-4 duration-1000">
                  <div className="relative inline-block">
                    <Award size={56} className="mx-auto animate-bounce" style={{ color: palette.accent }} />
                    <div className="absolute -inset-2 blur-xl rounded-full -z-10 animate-pulse" style={{ backgroundColor: palette.accent, opacity: 0.3 }}></div>
                  </div>
                  <h4 className="text-2xl font-black uppercase tracking-tight" style={{ color: palette.accent }}>Vente remportée !</h4>
                  <p className="text-xs italic opacity-70" style={{ color: palette.accent }}>Félicitations. L'artisan vous contactera prochainement.</p>
                </div>
              ) : item.auctionActive && !isAuctionOver ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <p className="text-[10px] font-black uppercase text-stone-400">
                      {item.lastBidderName ? `Mise par ${item.lastBidderName}` : "Soyez le premier à miser"}
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[10, 50, 100].map(inc => (
                      <button key={inc} onClick={() => handleQuickBid(inc)} disabled={bidLoading} className="py-4 bg-stone-50 border border-stone-200 rounded-2xl font-black text-xs hover:border-stone-900 hover:bg-white transition-all active:scale-95 disabled:opacity-50 shadow-sm text-stone-900">+{inc}€</button>
                    ))}
                  </div>
                  {msg && <p className={`text-[10px] font-black text-center uppercase tracking-widest animate-in fade-in slide-in-from-bottom-2 ${msg.type === 'error' ? 'text-red-500' : 'text-emerald-600'}`}>{msg.text}</p>}
                </div>
              ) : !item.auctionActive ? (
                <button
                  onClick={() => onAddToCart(item)}
                  className="w-full py-5 bg-stone-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-amber-600 shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 group"
                >
                  <span>Acquérir cette pièce</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </button>
              ) : (
                <div className="text-center py-4 bg-stone-50 rounded-2xl border border-stone-200 text-stone-400">
                  <p className="text-[10px] font-black uppercase tracking-widest">Enchère clôturée</p>
                </div>
              )}
            </div>

            {item.auctionActive && bidsHistory.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2" style={{ color: palette.textSubtitle }}>
                  <History size={14} />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Activité</h3>
                </div>

                {/* Dynamic Scrollbar Styling */}
                <style>{`
                .themed-scrollbar::-webkit-scrollbar { width: 4px; }
                .themed-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .themed-scrollbar::-webkit-scrollbar-thumb { background-color: ${palette.switcherBorder}; border-radius: 10px; }
                .themed-scrollbar { scrollbar-width: thin; scrollbar-color: ${palette.switcherBorder} transparent; }
              `}</style>

                <div className="themed-scrollbar space-y-2 max-h-48 md:max-h-60 overflow-y-auto pr-2 border-l-2 pl-4" style={{ borderColor: palette.switcherBorder }}>
                  {bidsHistory.map((bid, i) => (
                    <div
                      key={bid.id}
                      className={`flex items-center justify-between p-3 md:p-4 rounded-2xl border transition-all ${i === 0 ? 'shadow-md scale-[1.02]' : 'opacity-60'}`}
                      style={{
                        backgroundColor: i === 0 ? palette.cardBg : palette.switcherBg,
                        borderColor: i === 0 ? palette.accent : palette.switcherBorder,
                        color: palette.textBody
                      }}
                    >
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'animate-pulse' : ''}`} style={{ backgroundColor: i === 0 ? palette.accent : palette.textSubtitle }} />
                        <span className="text-[10px] font-bold truncate max-w-[80px] md:max-w-none" style={{ color: palette.textBody }}>{bid.bidderName}</span>
                      </div>
                      <div className="flex items-center gap-3 md:gap-4 flex-shrink-0 font-mono">
                        <span className="text-[10px] font-black" style={{ color: palette.statusValid }}>+{bid.increment || '??'} €</span>
                        <span className="text-[8px] font-bold opacity-50" style={{ color: palette.textBody }}>{formatTime(bid.timestamp)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 rounded-[2rem] ring-1 ring-inset shadow-sm group transform-gpu backface-hidden" style={{ backgroundColor: palette.cardBg, '--tw-ring-color': palette.switcherBorder }}>
                <p className="text-[9px] font-black uppercase tracking-widest flex items-center gap-2 mb-2" style={{ color: palette.textSubtitle }}>
                  <Box size={14} className="opacity-50" /> Matières
                </p>
                <p className="text-sm font-bold leading-tight" style={{ color: palette.textBody }}>
                  {item.material || "Non spécifié"}
                </p>
              </div>
              <div className="p-6 rounded-[2rem] ring-1 ring-inset shadow-sm group transform-gpu backface-hidden" style={{ backgroundColor: palette.cardBg, '--tw-ring-color': palette.switcherBorder }}>
                <p className="text-[9px] font-black uppercase tracking-widest flex items-center gap-2 mb-2" style={{ color: palette.textSubtitle }}>
                  <Ruler size={14} className="opacity-50" /> Dimensions
                </p>
                <p className="text-sm font-bold leading-tight" style={{ color: palette.textBody }}>
                  {item.width && item.depth && item.height
                    ? `${item.width} x ${item.depth} x ${item.height} cm`
                    : (item.dimensions || "Non spécifié")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;