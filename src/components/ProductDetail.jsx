import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, Award, Timer, Mail, Box, Ruler, History, Quote } from 'lucide-react';
import { doc, onSnapshot, runTransaction, collection, query, orderBy, limit, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db, appId } from '../firebase/config';
import { getMillis, formatTime } from '../utils/time';
import AuctionTimer from './ui/AuctionTimer';
import ConfettiRain from './ui/ConfettiRain';

const ProductDetail = ({ item, user, onBack }) => {
  const [activeImg, setActiveImg] = useState(0);
  const [bidLoading, setBidLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [bidsHistory, setBidsHistory] = useState([]);
  const [forceWinnerCheck, setForceWinnerCheck] = useState(false);

  if (!item) return null;

  const images = useMemo(() => item.images || [item.imageUrl], [item.images, item.imageUrl]);
  const isAuctionOver = item.auctionActive && getMillis(item.auctionEnd) < Date.now();
  const isWinner = isAuctionOver && user && item.lastBidderId === user.uid;

  useEffect(() => {
      const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'furniture', item.id, 'bids'), orderBy('timestamp', 'desc'), limit(10));
      return onSnapshot(q, (snap) => setBidsHistory(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, [item.id]);

  const handleQuickBid = async (inc) => {
    if (bidLoading) return;
    setBidLoading(true);
    try {
        await runTransaction(db, async (transaction) => {
            const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'furniture', item.id);
            const snap = await transaction.get(docRef);
            if (!snap.exists()) throw "Produit introuvable.";
            
            const data = snap.data();
            const serverPrice = data.currentPrice || data.startingPrice;
            const finalAmount = serverPrice + inc;

            if (getMillis(data.auctionEnd) < Date.now()) throw "Vente terminée.";
            
            let newEnd = data.auctionEnd;
            if ((getMillis(data.auctionEnd) - Date.now()) < 120000) {
                newEnd = Timestamp.fromMillis(Date.now() + 120000);
            }

            transaction.update(docRef, {
                currentPrice: finalAmount,
                bidCount: (data.bidCount || 0) + 1,
                lastBidderId: user.uid,
                lastBidderName: user.displayName || "Anonyme",
                lastBidderEmail: user.email || "Non renseigné",
                lastBidderPhoto: user.photoURL || "",
                auctionEnd: newEnd,
                lastBidAt: serverTimestamp()
            });
            
            const bidRef = doc(collection(db, 'artifacts', appId, 'public', 'data', 'furniture', item.id, 'bids'));
            transaction.set(bidRef, { amount: finalAmount, increment: inc, bidderName: user.displayName || "Anonyme", timestamp: serverTimestamp() });
        });
        setMsg({ type: 'success', text: `Offre validée !` });
    } catch (e) {
        setMsg({ type: 'error', text: e.toString() });
    } finally {
        setBidLoading(false);
        setTimeout(() => setMsg(null), 3000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500 pb-20">
      {isWinner && <ConfettiRain />}
      
      <button onClick={onBack} className="mb-8 flex items-center gap-2 text-stone-400 hover:text-stone-900 font-bold text-[10px] uppercase tracking-widest transition-colors">
        <ChevronLeft size={14} /> Retour collection
      </button>

      <div className="grid md:grid-cols-2 gap-12 lg:gap-16 text-stone-900">
        <div className="space-y-8">
          <div className="aspect-square rounded-[2.5rem] overflow-hidden bg-white border border-stone-200/60 shadow-2xl relative">
            <img src={images[activeImg]} className="w-full h-full object-cover" alt="" />
            {item.auctionActive && (
                <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur px-4 py-2 rounded-2xl shadow-xl border border-stone-100 text-stone-900">
                    <AuctionTimer endDate={item.auctionEnd} onFinished={() => setForceWinnerCheck(true)} />
                </div>
            )}
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide px-1">
            {images.map((img, idx) => (
              <button key={idx} onClick={() => setActiveImg(idx)} className={`w-14 h-14 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${activeImg === idx ? 'border-amber-500 shadow-md scale-105' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                <img src={img} className="w-full h-full object-cover" alt="" />
              </button>
            ))}
          </div>

          <div className="p-8 rounded-[2.5rem] bg-stone-50/50 border border-stone-200/40 shadow-sm relative overflow-hidden group">
            <Quote size={32} className="absolute -top-2 -right-2 text-stone-100 group-hover:text-amber-100 transition-colors" />
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-4 flex items-center gap-2">
                <span className="w-4 h-px bg-stone-300"></span> L'histoire de la pièce
              </p>
              <p className="text-sm text-stone-700 leading-relaxed italic font-light font-serif">
                "{item.description}"
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-8 px-1">
          <div className="space-y-3 text-stone-900">
             <div className="flex gap-2">
                <span className="bg-amber-100/50 text-amber-800 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-amber-200/50">Lot n°{item.id.substring(0,4)}</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-stone-900 leading-tight">{item.name}</h2>
          </div>

          <div className={`p-8 rounded-[3rem] border transition-all duration-700 ${isWinner ? 'bg-emerald-50 border-emerald-200 shadow-xl scale-[1.02]' : 'bg-white border-stone-200 shadow-xl'}`}>
            <div className="flex justify-between items-end mb-8 text-stone-900">
                <div className="space-y-0.5">
                    <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest">{item.auctionActive ? 'Offre actuelle' : 'Prix fixe'}</p>
                    <p className="text-5xl font-black tracking-tighter transition-all">{item.currentPrice || item.startingPrice} €</p>
                </div>
                {item.auctionActive && (
                    <div className="text-right space-y-1">
                        <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Mises</p>
                        <p className="text-2xl font-black">{item.bidCount || 0}</p>
                    </div>
                )}
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
                <button className="w-full py-5 bg-stone-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-amber-600 shadow-xl transition-all active:scale-95 text-white">Acquérir cette pièce</button>
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
             <div className="p-5 rounded-2xl bg-stone-50/80 border border-stone-200/50 shadow-sm text-stone-900 group hover:bg-white transition-colors">
                <p className="text-[9px] font-black text-stone-400 uppercase flex items-center gap-2 group-hover:text-amber-600 transition-colors"><Box size={12}/> Matières</p>
                <p className="text-xs font-bold text-stone-700 mt-1">{item.material || "Non spécifié"}</p>
             </div>
             <div className="p-5 rounded-2xl bg-stone-50/80 border border-stone-200/50 shadow-sm text-stone-900 group hover:bg-white transition-colors">
                <p className="text-[9px] font-black text-stone-400 uppercase flex items-center gap-2 group-hover:text-amber-600 transition-colors"><Ruler size={12}/> Dimensions</p>
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