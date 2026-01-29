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
  const { palette } = useLiveTheme(darkMode);
  const [activeImg, setActiveImg] = useState(0);
  const [bidLoading, setBidLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [bidsHistory, setBidsHistory] = useState([]);

  // HOOK TEMPS RÉEL
  const { likedItemIds, toggleLike } = useRealtimeUserLikes(user);
  const isLiked = likedItemIds.includes(item.id);

  if (!item) return null;

  const images = useMemo(() => item.images || [item.imageUrl], [item.images, item.imageUrl]);
  const isAuctionOver = item.auctionActive && getMillis(item.auctionEnd) < Date.now();
  const isWinner = isAuctionOver && user && item.lastBidderId === user.uid;

  // Determine collection name
  const collectionName = useMemo(() => item.collectionName || (item.id.includes('board') ? 'cutting_boards' : 'furniture'), [item]);

  useEffect(() => {
    if (!item.auctionActive) return;

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
  }, [item.id, collectionName, item.auctionActive]);

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

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500 pb-20">
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
          <div className="aspect-square rounded-[2.5rem] overflow-hidden ring-1 ring-inset shadow-2xl relative transform-gpu backface-hidden" style={{ backgroundColor: palette.cardBg, '--tw-ring-color': palette.switcherBorder }}>
            <img src={images[activeImg]} className="w-full h-full object-cover" alt={item.name} />
            {item.auctionActive && (
              <div className="absolute bottom-6 left-6 backdrop-blur px-4 py-2 rounded-2xl shadow-xl ring-1 ring-inset" style={{ backgroundColor: palette.switcherBg, '--tw-ring-color': palette.switcherBorder, color: palette.textBody }}>
                <AuctionTimer endDate={item.auctionEnd} onFinished={() => setForceWinnerCheck(true)} />
              </div>
            )}
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide px-1">
            {images.map((img, idx) => (
              <button key={idx} onClick={() => setActiveImg(idx)} className={`w-14 h-14 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${activeImg === idx ? 'shadow-md scale-105' : 'border-transparent opacity-60 hover:opacity-100'}`} style={{ borderColor: activeImg === idx ? palette.accent : 'transparent' }}>
                <img src={img} className="w-full h-full object-cover" alt={`${item.name} - Vue ${idx + 1}`} />
              </button>
            ))}
          </div>

          <div className="p-8 rounded-[2.5rem] ring-1 ring-inset shadow-sm relative overflow-hidden group transform-gpu backface-hidden" style={{ backgroundColor: palette.cardBg, '--tw-ring-color': palette.switcherBorder }}>
            <Quote size={32} className="absolute -top-2 -right-2 transition-colors opacity-10" style={{ color: palette.textBody }} />
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

          <div className={`p-8 rounded-[3rem] ring-1 ring-inset overflow-hidden transition-all duration-700 transform-gpu backface-hidden ${isWinner ? 'scale-[1.02] shadow-xl' : 'shadow-xl'}`} style={{ backgroundColor: palette.cardBg, '--tw-ring-color': palette.switcherBorder }}>
            <div className="flex justify-between items-end mb-8" style={{ color: palette.textBody }}>
              <div className="space-y-0.5">
                <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Offre actuelle</p>
                <p className="text-5xl font-black tracking-tighter transition-all" style={{ color: palette.textTitle }}>{item.currentPrice || item.startingPrice} €</p>
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
                  <Award size={56} className="mx-auto text-emerald-500 animate-bounce" />
                  <div className="absolute -inset-2 bg-emerald-400/20 blur-xl rounded-full -z-10 animate-pulse"></div>
                </div>
                <h4 className="text-2xl font-black uppercase tracking-tight text-emerald-700">Vente remportée !</h4>
                <p className="text-emerald-600/70 text-xs italic">Félicitations. L'artisan vous contactera prochainement.</p>
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
              <div className="flex items-center gap-2 text-stone-400">
                <History size={14} />
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Activité</h3>
              </div>
              <div className="space-y-2 max-h-48 md:max-h-60 overflow-y-auto pr-2 scrollbar-hide border-l-2 border-stone-100 pl-4">
                {bidsHistory.map((bid, i) => (
                  <div key={bid.id} className={`flex items-center justify-between p-3 md:p-4 rounded-2xl border transition-all ${i === 0 ? 'bg-white border-amber-200 shadow-md scale-[1.02]' : 'bg-white/40 border-stone-100 opacity-60'}`}>
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-amber-500 animate-pulse' : 'bg-stone-300'}`} />
                      <span className="text-[10px] font-bold text-stone-700 truncate max-w-[80px] md:max-w-none">{bid.bidderName}</span>
                    </div>
                    <div className="flex items-center gap-3 md:gap-4 text-stone-900 flex-shrink-0 font-mono">
                      <span className="text-[10px] font-black text-emerald-600">+{bid.increment || '??'} €</span>
                      <span className="text-[8px] font-bold text-stone-300">{formatTime(bid.timestamp)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-stone-50/80 ring-1 ring-inset ring-stone-200/50 shadow-sm text-stone-900 group hover:bg-white transition-colors">
              <p className="text-[9px] font-black text-stone-400 uppercase flex items-center gap-2 group-hover:text-amber-600 transition-colors"><Box size={12} /> Matières</p>
              <p className="text-xs font-bold text-stone-700 mt-1">{item.material || "Non spécifié"}</p>
            </div>
            <div className="p-5 rounded-2xl bg-stone-50/80 ring-1 ring-inset ring-stone-200/50 shadow-sm text-stone-900 group hover:bg-white transition-colors">
              <p className="text-[9px] font-black text-stone-400 uppercase flex items-center gap-2 group-hover:text-amber-600 transition-colors"><Ruler size={12} /> Dimensions</p>
              <p className="text-xs font-bold text-stone-700 mt-1">
                {item.width && item.depth && item.height
                  ? `${item.width} x ${item.depth} x ${item.height} cm`
                  : (item.dimensions || "Non spécifié")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;