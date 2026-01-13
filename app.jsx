import React, { useState, useEffect, useRef, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, doc, onSnapshot, addDoc, 
  updateDoc, deleteDoc, serverTimestamp, runTransaction, 
  query, Timestamp, orderBy, limit 
} from 'firebase/firestore';
import { 
  getAuth, signInAnonymously, onAuthStateChanged, 
  signInWithEmailAndPassword, signOut, GoogleAuthProvider, 
  FacebookAuthProvider, TwitterAuthProvider, OAuthProvider, signInWithPopup 
} from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { 
  Hammer, Lock, Eye, EyeOff, Upload, Trash2, 
  ChevronLeft, Award, TrendingUp, LogOut, ShieldCheck, 
  Timer, Mail, ArrowUpRight, Box, Ruler, History, Terminal, Pencil, Quote, Menu, X, ArrowRight, Sparkles, Instagram, User
} from 'lucide-react';

// --- CONFIGURATION FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyCtuul_bp1r6W__c_6B37ank6Nl7Im0H8o",
  authDomain: "tatmadeinnormandie.firebaseapp.com",
  projectId: "tatmadeinnormandie",
  storageBucket: "tatmadeinnormandie.firebasestorage.app",
  messagingSenderId: "116427088828",
  appId: "1:116427088828:web:614ea24f006431d4d581b9",
  measurementId: "G-Z58ZWH97Z2"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const appId = 'tat-made-in-normandie';

// --- PROVIDERS AUTHENTIFICATION ---
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();
const twitterProvider = new TwitterAuthProvider();
const appleProvider = new OAuthProvider('apple.com');
const microsoftProvider = new OAuthProvider('microsoft.com');

// --- HELPERS ---
const getMillis = (ts) => {
    if (!ts) return 0;
    return typeof ts.toMillis === 'function' ? ts.toMillis() : (ts.seconds * 1000 || 0);
};

const formatTime = (ts) => {
    const ms = getMillis(ts);
    if (!ms) return "...";
    return new Date(ms).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
};

// --- COMPOSANT LANDING PAGE (HOME) ---
const HomeView = ({ onEnterMarketplace }) => {
    // État pour le slider Hero
    const [currentHeroIdx, setCurrentHeroIdx] = useState(0);
    const heroImages = [
        "https://images.unsplash.com/photo-1581428982868-e410dd047a90?q=80&w=2070&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1540638349517-3abd5afc5847?q=80&w=2070&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=2069&auto=format&fit=crop"
    ];

    const autoSlideTimer = useRef(null);

    // Fonction pour démarrer/redémarrer le défilement auto
    const startAutoSlide = () => {
        if (autoSlideTimer.current) clearInterval(autoSlideTimer.current);
        autoSlideTimer.current = setInterval(() => {
            setCurrentHeroIdx(prev => (prev + 1) % heroImages.length);
        }, 5000);
    };

    useEffect(() => {
        startAutoSlide();
        return () => { if (autoSlideTimer.current) clearInterval(autoSlideTimer.current); };
    }, [heroImages.length]);

    // Passage manuel à l'image suivante (droite) ou précédente (gauche)
    const handleHeroClick = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left; // position X relative au bloc
        const width = rect.width;

        if (x > width / 2) {
            // Clic à droite -> Avancer (1 -> 2 -> 3 -> 1)
            setCurrentHeroIdx(prev => (prev + 1) % heroImages.length);
        } else {
            // Clic à gauche -> Reculer (1 -> 3 -> 2 -> 1)
            setCurrentHeroIdx(prev => (prev - 1 + heroImages.length) % heroImages.length);
        }
        
        // On redémarre le timer pour que l'utilisateur ait 5s pleines sur l'image choisie
        startAutoSlide();
    };

    // Données enrichies pour le Marquee
    const row1Items = [
        { type: 'img', url: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=600", width: 'w-[140px] md:w-[320px]' },
        { type: 'img', url: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?q=80&w=600", width: 'w-[100px] md:w-[240px]' },
        { type: 'data', val: '50+', label: 'Tables sauvées', color: 'bg-blue-50/80' },
        { type: 'img', url: "https://images.unsplash.com/photo-1540638349517-3abd5afc5847?q=80&w=2070&auto=format&fit=crop", width: 'w-[150px] md:w-[380px]' },
        { type: 'img', url: "https://images.unsplash.com/photo-1581428982868-e410dd047a90?q=80&w=600", width: 'w-[120px] md:w-[280px]' },
        { type: 'data', val: '1.2k', label: 'Heures de ponçage', color: 'bg-rose-50/80' },
        { type: 'img', url: "https://images.unsplash.com/photo-1505691938895-1758d7eaa511?q=80&w=600", width: 'w-[130px] md:w-[310px]' },
    ];

    const row2Items = [
        { type: 'img', url: "https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?q=80&w=600", width: 'w-[155px] md:w-[350px]' },
        { type: 'data', val: '100%', label: 'Origine Normandie', color: 'bg-emerald-50/80' },
        { type: 'img', url: "https://images.unsplash.com/photo-1517705008128-361805f42e86?q=80&w=600", width: 'w-[110px] md:w-[260px]' },
        { type: 'img', url: "https://images.unsplash.com/photo-1581428982868-e410dd047a90?q=80&w=2070&auto=format&fit=crop", width: 'w-[140px] md:w-[330px]' },
        { type: 'data', val: '8.5', label: 'Note moyenne', color: 'bg-purple-50/80' },
        { type: 'img', url: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=600", width: 'w-[125px] md:w-[290px]' },
        { type: 'img', url: "https://images.unsplash.com/photo-1455792244736-3ed96c3d7f7e?q=80&w=2070&auto=format&fit=crop", width: 'w-[160px] md:w-[400px]' },
    ];

    const MarqueeItem = ({ item }) => {
        if (item.type === 'img') {
            return (
                <div className={`inline-block h-[160px] md:h-[350px] ${item.width} rounded-2xl md:rounded-3xl bg-white shadow-lg md:shadow-xl overflow-hidden border-2 md:border-8 border-white flex-shrink-0 mx-1.5 md:mx-4 transition-transform duration-700 hover:scale-105 active:scale-95 cursor-pointer`}>
                    <img src={item.url} className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-700" alt="" />
                </div>
            );
        }
        return (
            <div className={`inline-flex flex-col justify-center px-6 md:px-12 h-[160px] md:h-[350px] mx-1.5 md:mx-4 rounded-2xl md:rounded-3xl border border-stone-100 min-w-[120px] md:min-w-[280px] shadow-sm ${item.color}`}>
                <span className="text-3xl md:text-7xl font-black text-stone-900 tracking-tighter leading-none">{item.val}</span>
                <span className="text-[7px] md:text-[11px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em] text-amber-600 mt-2 md:mt-4">{item.label}</span>
            </div>
        );
    };

    return (
        <div className="animate-in fade-in duration-1000">
            {/* HERO SECTION */}
            <section className="min-h-[85vh] md:min-h-screen flex flex-col justify-center px-6 md:px-20 pt-32 pb-12 md:py-20 relative overflow-hidden">
                <div className="max-w-5xl z-10">
                    <p className="text-amber-600 font-bold tracking-[0.3em] uppercase text-[10px] mb-4 md:mb-6 animate-in slide-in-from-bottom-4 duration-700">Atelier d'ébénisterie normand</p>
                    <h1 className="text-5xl md:text-9xl font-black tracking-tighter text-stone-900 leading-[0.85] mb-8 md:mb-10 font-serif italic text-balance">
                        Rénovation <br /> 
                        <span className="text-stone-300 not-italic">d'ancienne table</span> <br />
                        de ferme.
                    </h1>
                    <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-center">
                        <button 
                            onClick={onEnterMarketplace}
                            className="group flex items-center gap-4 bg-stone-900 text-white px-8 md:px-10 py-5 md:py-6 rounded-full font-black uppercase text-xs tracking-widest hover:bg-amber-600 transition-all shadow-2xl active:scale-95"
                        >
                            Explorer la collection <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                        </button>
                        <p className="text-stone-400 max-w-xs text-sm font-medium leading-relaxed italic">
                            Chaque pièce est une renaissance. Nous sauvons le patrimoine normand, un plateau après l'autre.
                        </p>
                    </div>
                </div>

                {/* ESPACE MEDIA HERO - SLIDER INTERACTIF FORCE (1-2-3-1...) */}
                <div 
                  onClick={handleHeroClick}
                  className="mt-12 md:mt-20 w-full aspect-video md:aspect-[21/9] rounded-[2rem] md:rounded-[3rem] overflow-hidden bg-stone-100 border border-stone-200 shadow-2xl relative group cursor-pointer touch-none"
                >
                    <div className="absolute inset-0 bg-stone-900/10 group-hover:bg-transparent transition-colors duration-700 z-10 pointer-events-none"></div>
                    
                    <div className="relative w-full h-full flex transition-transform duration-1000 ease-in-out" style={{ transform: `translateX(-${currentHeroIdx * 100}%)` }}>
                        {heroImages.map((img, i) => (
                            <img 
                                key={i}
                                src={img} 
                                className="w-full h-full object-cover grayscale-[0.3] flex-shrink-0"
                                alt="Atelier"
                            />
                        ))}
                    </div>

                    {/* BARRES DE NAVIGATION (PROGRESSION VISUELLE) */}
                    <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
                        {heroImages.map((_, i) => (
                            <div 
                                key={`${i}-${currentHeroIdx}`} // Key incluant l'index courant pour reset l'anim
                                className={`h-1 rounded-full transition-all duration-500 overflow-hidden ${currentHeroIdx === i ? 'w-10 md:w-12 bg-white' : 'w-4 md:w-6 bg-white/30'}`}
                            >
                                {currentHeroIdx === i && (
                                    <div className="h-full bg-amber-500 animate-progress-bar origin-left"></div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="absolute bottom-10 left-10 text-white z-20 hidden md:block">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">En direct de l'atelier</p>
                        <p className="text-2xl font-serif italic">Artisanat authentique.</p>
                    </div>
                </div>
            </section>

            {/* SECTION L'ARTISAN */}
            <section className="py-12 md:py-32 px-6 md:px-20 bg-stone-900 text-white rounded-[2.5rem] md:rounded-[4rem] mx-6 md:mx-20 my-6 md:my-20">
                <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center max-w-7xl mx-auto">
                    <div className="space-y-6 md:space-y-8">
                        <div className="w-16 md:w-20 h-1 bg-amber-500"></div>
                        <h2 className="text-4xl md:text-7xl font-serif italic leading-tight">Le geste, <br/> la patience.</h2>
                        <p className="text-stone-400 text-base md:text-lg leading-relaxed font-light">
                            "Mon travail consiste à écouter ce que le bois a à dire. Une table de ferme n'est pas qu'un meuble, c'est le témoin de décennies de repas, de rires et de vie. Ma mission est de lui redonner sa noblesse sans effacer ses cicatrices."
                        </p>
                        <div className="flex items-center gap-4 text-amber-500 font-black uppercase text-[9px] md:text-[10px] tracking-widest pt-4">
                            <Sparkles size={16} /> 100% Fait main en Normandie
                        </div>
                    </div>
                    <div className="aspect-[3/4] rounded-[2rem] md:rounded-[3rem] overflow-hidden border-[6px] md:border-[12px] border-stone-800 shadow-2xl">
                        <img 
                            src="https://images.unsplash.com/photo-1455792244736-3ed96c3d7f7e?q=80&w=2070&auto=format&fit=crop" 
                            className="w-full h-full object-cover" 
                            alt="Artisan" 
                        />
                    </div>
                </div>
            </section>

            {/* SECTION DYNAMIQUE (Vision d'ensemble sur mobile) */}
            <section className="py-10 md:py-24 overflow-hidden bg-[#FAF9F6]">
                <div className="mb-8 md:mb-16 px-6 md:px-20 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-6">
                    <div className="space-y-1">
                        <h3 className="text-3xl md:text-5xl font-black tracking-tighter text-stone-900">L'Atelier en mouvement</h3>
                        <p className="text-stone-400 font-serif italic text-sm md:text-lg leading-none md:leading-normal">Instants de vie et chiffres clés.</p>
                    </div>
                    <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-stone-300">Continuous Feed</p>
                </div>

                <div className="space-y-4 md:space-y-12">
                    {/* LIGNE 1 : Défilement Gauche */}
                    <div className="flex animate-marquee-left">
                        {[...row1Items, ...row1Items].map((item, i) => (
                            <MarqueeItem key={i} item={item} />
                        ))}
                    </div>

                    {/* LIGNE 2 : Défilement Droite */}
                    <div className="flex animate-marquee-right">
                        {[...row2Items, ...row2Items].map((item, i) => (
                            <MarqueeItem key={i} item={item} />
                        ))}
                    </div>
                </div>

                <style>{`
                    @keyframes marquee-left {
                        0% { transform: translateX(0); }
                        100% { transform: translateX(-50%); }
                    }
                    @keyframes marquee-right {
                        0% { transform: translateX(-50%); }
                        100% { transform: translateX(0); }
                    }
                    @keyframes progress-bar {
                        0% { transform: scaleX(0); }
                        100% { transform: scaleX(1); }
                    }
                    .animate-marquee-left {
                        animation: marquee-left 50s linear infinite;
                        width: max-content;
                    }
                    .animate-marquee-right {
                        animation: marquee-right 50s linear infinite;
                        width: max-content;
                    }
                    .animate-progress-bar {
                        animation: progress-bar 5000ms linear forwards;
                    }
                `}</style>
            </section>

            {/* FINAL CTA */}
            <section className="min-h-[40vh] md:min-h-[60vh] flex flex-col items-center justify-center text-center px-6 py-20 md:py-40">
                <h2 className="text-4xl md:text-8xl font-black tracking-tighter mb-8 md:mb-10 leading-none text-stone-900">
                    Prêt pour votre <br/>
                    <span className="font-serif italic text-amber-600 text-stone-900">pièce unique ?</span>
                </h2>
                <button 
                    onClick={onEnterMarketplace}
                    className="bg-stone-900 text-white px-10 md:px-16 py-6 md:py-8 rounded-full font-black uppercase text-xs md:text-sm tracking-[0.3em] hover:bg-amber-600 transition-all shadow-2xl active:scale-95 text-white"
                >
                    Entrer dans la Marketplace
                </button>
            </section>
        </div>
    );
};

// --- COMPOSANT CELEBRATION ---
const ConfettiRain = () => {
    const particles = useMemo(() => Array.from({ length: 50 }), []);
    return (
        <div className="fixed inset-0 pointer-events-none z-[110] overflow-hidden">
            {particles.map((_, i) => (
                <div 
                    key={i}
                    className="absolute w-2 h-2 rounded-full animate-fall"
                    style={{
                        left: `${Math.random() * 100}%`,
                        backgroundColor: ['#10b981', '#fbbf24', '#3b82f6', '#f43f5e', '#8b5cf6'][Math.floor(Math.random() * 5)],
                        top: `-20px`,
                        animationDelay: `${Math.random() * 4}s`,
                        animationDuration: `${2.5 + Math.random() * 2}s`,
                        opacity: 0.6 + Math.random() * 0.4
                    }}
                />
            ))}
            <style>{`
                @keyframes fall {
                    0% { transform: translateY(0) rotate(0deg); }
                    100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
                }
                .animate-fall { animation-name: fall; animation-timing-function: cubic-bezier(0.4, 0, 1, 1); animation-iteration-count: infinite; }
            `}</style>
        </div>
    );
};

// --- COMPOSANTS UI ---
const AuctionTimer = ({ endDate, onFinished }) => {
    const [label, setLabel] = useState("");
    const [isFinished, setIsFinished] = useState(false);
    
    useEffect(() => {
        if (!endDate) return;
        const tick = () => {
            const distance = getMillis(endDate) - Date.now();
            if (distance <= 0) {
                setLabel("TERMINEE");
                if (!isFinished) {
                    setIsFinished(true);
                    if (onFinished) onFinished();
                }
                return true;
            } else {
                const h = Math.floor((distance % 86400000) / 3600000);
                const m = Math.floor((distance % 3600000) / 60000);
                const s = Math.floor((distance % 60000) / 1000);
                setLabel(`${h}h ${m}m ${s}s`);
                return false;
            }
        };
        tick();
        const interval = setInterval(() => { if (tick()) clearInterval(interval); }, 1000);
        return () => clearInterval(interval);
    }, [endDate, isFinished]);

    return (
        <div className={`flex items-center gap-2 font-black text-[9px] uppercase tracking-widest ${isFinished ? 'text-stone-400' : 'text-amber-600'}`}>
            <Timer size={12} className={!isFinished ? 'animate-pulse' : ''} />
            {label}
        </div>
    );
};

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

export default function App() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [items, setItems] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [view, setView] = useState('home'); 
  const [loading, setLoading] = useState(true);
  const [isSecretGateOpen, setIsSecretGateOpen] = useState(false);
  const [showFullLogin, setShowFullLogin] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const unsubData = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'furniture'), (snap) => {
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => getMillis(b.createdAt) - getMillis(a.createdAt)));
    });

    const unsubAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      const isRealAdmin = u && !u.isAnonymous && u.providerData.some(p => p.providerId === 'password');
      setIsAdmin(isRealAdmin);
      
      const params = new URLSearchParams(window.location.search);
      if (params.get('admin') === 'true') {
        setIsSecretGateOpen(true);
        if (isRealAdmin) setView('admin'); else setView('login');
      } else if (!u) {
        signInAnonymously(auth);
      }
      setLoading(false);
    });

    return () => { unsubData(); unsubAuth(); };
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6] text-stone-900"><div className="w-10 h-10 border-[3px] border-stone-200 border-t-stone-900 rounded-full animate-spin"></div></div>;

  const handleToggleStatus = async (item) => {
      const nextStatus = item.status === 'published' ? 'draft' : 'published';
      try {
          await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'furniture', item.id), { status: nextStatus });
      } catch (e) { console.error(e); }
  };

  const handleDeleteItem = async (id) => {
      if (!confirm("Supprimer définitivement ?")) return;
      try { await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'furniture', id)); }
      catch (e) { console.error(e); }
  };

  const handleSocialLogin = async (provider) => {
    try {
        await signInWithPopup(auth, provider);
        setShowFullLogin(false);
    } catch (e) {
        console.error("Erreur login:", e);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-stone-900 font-sans selection:bg-amber-100 overflow-x-hidden">
      
      {/* SIDE MENU */}
      <div className={`fixed inset-0 z-[110] transition-all duration-700 ${isMenuOpen ? 'visible' : 'invisible pointer-events-none'}`}>
          <div className={`absolute inset-0 bg-stone-900/60 backdrop-blur-md transition-opacity duration-700 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setIsMenuOpen(false)}></div>
          <div className={`absolute right-0 top-0 bottom-0 w-full md:w-[450px] bg-white shadow-2xl transition-transform duration-700 ease-expo p-12 flex flex-col justify-between ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
              <div className="space-y-20">
                  <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-300">Menu Navigation</span>
                      <button onClick={() => setIsMenuOpen(false)} className="w-12 h-12 rounded-full border border-stone-100 flex items-center justify-center hover:bg-stone-50 transition-colors"><X size={20}/></button>
                  </div>
                  <nav className="flex flex-col gap-10">
                      <button onClick={() => { setView('home'); setIsMenuOpen(false); window.scrollTo(0,0); }} className="text-5xl font-black tracking-tighter hover:italic hover:text-amber-600 transition-all text-left">Accueil.</button>
                      <button onClick={() => { setView('gallery'); setIsMenuOpen(false); window.scrollTo(0,0); }} className="text-5xl font-black tracking-tighter hover:italic hover:text-amber-600 transition-all text-left">Marketplace.</button>
                      {isAdmin && (
                        <button onClick={() => { setView('admin'); setIsMenuOpen(false); window.scrollTo(0,0); }} className="text-5xl font-black tracking-tighter hover:italic hover:text-stone-300 transition-all text-left opacity-30">Atelier Admin.</button>
                      )}
                  </nav>
              </div>
              <div className="space-y-6 pt-10 border-t border-stone-100">
                  <div className="flex gap-6">
                      <a href="#" className="w-12 h-12 rounded-full bg-stone-50 flex items-center justify-center hover:bg-stone-900 hover:text-white transition-all"><Instagram size={20}/></a>
                      <a href="mailto:contact@tat.fr" className="w-12 h-12 rounded-full bg-stone-50 flex items-center justify-center hover:bg-stone-900 hover:text-white transition-all"><Mail size={20}/></a>
                  </div>
                  <p className="text-[10px] font-bold text-stone-300 uppercase tracking-widest">Tous à Table © 2024 - Normandie</p>
              </div>
          </div>
      </div>

      {showFullLogin && (
          <div className="fixed inset-0 z-[100] bg-stone-900/60 backdrop-blur-md flex items-center justify-center p-4">
              <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl max-w-sm w-full text-center space-y-8 animate-in zoom-in-95">
                  <ShieldCheck size={48} className="mx-auto text-amber-500"/>
                  <h3 className="text-2xl font-black tracking-tight">Vérification</h3>
                  <p className="text-stone-400 text-xs">Identifiez-vous pour accéder à la vente.</p>
                  
                  <div className="space-y-3">
                    <button onClick={() => handleSocialLogin(googleProvider)} className="w-full flex items-center justify-center gap-4 bg-stone-900 text-white p-4 rounded-2xl font-bold hover:bg-stone-800 transition-all shadow-lg text-white">
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5 bg-white rounded-full p-0.5" alt=""/>
                        Continuer avec Google
                    </button>
                    
                    <div className="grid grid-cols-4 gap-3">
                         <button onClick={() => handleSocialLogin(facebookProvider)} className="p-4 rounded-2xl bg-blue-50 text-blue-600 hover:bg-blue-100 hover:scale-105 transition-all flex items-center justify-center shadow-sm" title="Facebook">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0" className="fill-current"><path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036c-2.148 0-2.971.956-2.971 3.594v.376h3.368l-.536 3.668h-2.832v7.98H9.101Z"></path></svg>
                         </button>
                         <button onClick={() => handleSocialLogin(appleProvider)} className="p-4 rounded-2xl bg-stone-100 text-stone-900 hover:bg-stone-200 hover:scale-105 transition-all flex items-center justify-center shadow-sm" title="Apple">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z"/><path d="M10 2c1 .5 2 2 2 5"/></svg>
                         </button>
                         <button onClick={() => handleSocialLogin(twitterProvider)} className="p-4 rounded-2xl bg-sky-50 text-sky-500 hover:bg-sky-100 hover:scale-105 transition-all flex items-center justify-center shadow-sm" title="Twitter/X">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0" className="fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>
                         </button>
                         <button onClick={() => handleSocialLogin(microsoftProvider)} className="p-4 rounded-2xl bg-orange-50 text-orange-600 hover:bg-orange-100 hover:scale-105 transition-all flex items-center justify-center shadow-sm" title="Microsoft">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0" className="fill-current"><path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z"></path></svg>
                         </button>
                    </div>
                  </div>

                  <button onClick={() => setShowFullLogin(false)} className="text-[10px] font-black uppercase text-stone-300 hover:text-stone-900 transition-colors">Annuler</button>
              </div>
          </div>
      )}

      {/* HEADER DISCRET - Ajustement Mobile */}
      <nav className="fixed top-0 left-0 right-0 z-[100] px-4 md:px-12 py-6 md:py-8 flex justify-between items-center mix-blend-difference text-white transition-all duration-300">
        <div className="flex items-center gap-2 md:gap-3 cursor-pointer group" onClick={() => {setView('home'); window.scrollTo({top:0, behavior:'smooth'});}}>
          <div className="bg-white text-stone-900 p-1 md:p-1.5 rounded-lg shadow-md transition-all group-hover:rotate-6"><Hammer size={20} className="w-4 h-4 md:w-5 md:h-5"/></div>
          <div>
            <h1 className="text-base md:text-lg font-black uppercase tracking-tighter leading-none">Tous à Table</h1>
            <p className="text-[7px] font-black tracking-[0.3em] uppercase mt-0.5 leading-none opacity-60">Atelier Normand</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
            {/* AUTH SECTION */}
            {user && !user.isAnonymous ? (
                <div className="flex items-center gap-2 md:gap-4 mr-1 md:mr-2">
                    <div className="text-right hidden md:block">
                        <p className="text-[10px] font-black uppercase tracking-widest leading-none">{user.displayName || 'Client'}</p>
                        <p className="text-[7px] font-bold opacity-60 mt-0.5">Connecté</p>
                    </div>
                    {/* MODIFICATION ICI : Style harmonisé avec les boutons voisins (Logout/Menu) */}
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20 backdrop-blur-md hover:bg-white hover:text-stone-900 transition-all">
                        <User size={14} className="md:w-4 md:h-4"/>
                    </div>
                    <button onClick={() => { signOut(auth); setView('home'); }} className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white hover:text-stone-900 transition-all backdrop-blur-md border border-white/20"><LogOut size={14} className="md:w-4 md:h-4"/></button>
                </div>
            ) : !isSecretGateOpen && (
                <button onClick={() => setShowFullLogin(true)} className="flex items-center gap-2 px-4 py-2 md:px-5 md:py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white hover:text-stone-900 transition-all text-[8px] md:text-[10px] font-black uppercase tracking-widest mr-1 md:mr-2 group">
                    <ShieldCheck size={12} className="md:w-3.5 md:h-3.5 group-hover:scale-110 transition-transform"/> 
                    <span>S'identifier</span>
                </button>
            )}

            <button onClick={() => setIsMenuOpen(true)} className="w-8 h-8 md:w-auto md:h-auto md:px-6 md:py-3 rounded-full bg-white/10 flex items-center justify-center gap-0 md:gap-4 hover:bg-white hover:text-stone-900 transition-all backdrop-blur-md border border-white/20 group">
                <span className="hidden md:block text-[10px] font-black uppercase tracking-widest group-hover:text-stone-900">Explore</span>
                <Menu size={20} className="w-4 h-4 md:w-5 md:h-5 group-hover:rotate-90 transition-transform group-hover:text-stone-900"/>
            </button>
        </div>
      </nav>

      <main>
        {view === 'home' && <HomeView onEnterMarketplace={() => { setView('gallery'); window.scrollTo(0,0); }} />}

        {view === 'gallery' && (
          <div className="max-w-6xl mx-auto px-4 md:px-8 py-32 animate-in fade-in duration-700">
            <div className="space-y-4 border-b border-stone-200/60 pb-10 mb-16">
                <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-none text-stone-900">Marketplace.</h2>
                <p className="text-stone-400 font-serif italic text-lg">Acquérez une pièce d'histoire.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
                {items.filter(i => i.status === 'published' || (isAdmin && isSecretGateOpen)).map(item => (
                <div key={item.id} className="group cursor-pointer space-y-6" onClick={() => {
                    if (item.auctionActive && user?.isAnonymous) setShowFullLogin(true); 
                    else { setSelectedItemId(item.id); setView('detail'); window.scrollTo({top:0, behavior:'smooth'}); }
                }}>
                    <div className="aspect-[4/5] overflow-hidden rounded-[2.5rem] bg-white shadow-xl relative border-[12px] border-white group-hover:shadow-2xl transition-all duration-700">
                        <img src={item.images?.[0] || item.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt="" loading="lazy" />
                        <div className="absolute top-6 right-6 bg-white/95 px-4 py-2 rounded-xl shadow-lg border border-stone-100 flex flex-col items-center">
                            <span className="text-[7px] font-black text-stone-400 uppercase leading-none mb-0.5">{item.auctionActive ? 'Offre' : 'Fixe'}</span>
                            <p className="text-sm font-black">{item.currentPrice || item.startingPrice} €</p>
                        </div>
                        {item.auctionActive && <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur px-3 py-1.5 rounded-xl shadow-md border border-stone-100"><AuctionTimer endDate={item.auctionEnd} /></div>}
                        {isAdmin && isSecretGateOpen && item.status === 'draft' && (
                            <div className="absolute top-6 left-6 bg-amber-500 text-white px-2 py-0.5 rounded-md text-[7px] font-black uppercase shadow-md text-white">Brouillon</div>
                        )}
                    </div>
                    <div className="px-2 flex justify-between items-center text-stone-900">
                        <div className="space-y-1 text-stone-900">
                            <h3 className="text-2xl font-black tracking-tighter leading-none group-hover:text-amber-700 transition-colors text-stone-900">{item.name}</h3>
                            <p className="text-[9px] font-bold text-stone-300 uppercase tracking-widest">{item.material || 'Artisanal'}</p>
                        </div>
                        <div className="w-12 h-12 rounded-full border border-stone-200 flex items-center justify-center text-stone-200 group-hover:text-stone-900 group-hover:border-stone-900 transition-all group-hover:rotate-45">
                            <ArrowUpRight size={20} />
                        </div>
                    </div>
                </div>
                ))}
            </div>
          </div>
        )}

        {view === 'detail' && selectedItemId && (
          <div className="pt-32 px-6">
            <ProductDetail 
                item={items.find(i => i.id === selectedItemId)} 
                user={user} 
                onBack={() => { setView('gallery'); setSelectedItemId(null); }} 
            />
          </div>
        )}

        {view === 'login' && isSecretGateOpen && <LoginView onSuccess={() => setView('admin')} />}
        
        {view === 'admin' && isAdmin && (
          <div className="max-w-6xl mx-auto px-4 md:px-8 py-32 space-y-16 animate-in fade-in text-stone-900">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-stone-200/60 pb-8 gap-4 text-stone-900">
                <h2 className="text-4xl font-black tracking-tighter text-stone-900">Gestion Atelier</h2>
                <button onClick={() => setView('gallery')} className="w-full md:w-auto text-[10px] font-black border-2 border-stone-900 px-6 py-2 rounded-xl hover:bg-stone-900 hover:text-white transition-all shadow-md text-stone-900">Retour Marketplace</button>
            </div>
            
            <AdminForm db={db} storage={storage} appId={appId} editData={editingItem} onCancelEdit={() => setEditingItem(null)} />

            <div className="grid gap-4 pt-10 text-stone-900">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-4 mb-2 text-stone-300">Suivi des lots</h3>
                <div className="space-y-4">
                  {items.map(item => {
                    const isEnded = item.auctionActive && getMillis(item.auctionEnd) < Date.now();
                    return (
                    <div key={item.id} className={`bg-white p-4 md:p-5 rounded-[2.5rem] border flex flex-col md:flex-row items-start md:items-center justify-between shadow-lg transition-all gap-4 ${isEnded ? 'border-amber-200 bg-amber-50/10' : 'border-stone-100'}`}>
                      <div className="flex items-center gap-4 md:gap-8 w-full md:w-auto">
                        <img src={item.images?.[0] || item.imageUrl} className="w-16 h-20 rounded-2xl object-cover shadow-md flex-shrink-0" alt="" />
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 md:gap-4 text-stone-900">
                            <span className="text-lg md:text-xl font-black tracking-tighter leading-tight truncate text-stone-900">{item.name}</span>
                            <span className={`px-2 py-0.5 rounded-md text-[7px] font-black uppercase tracking-widest border ${item.status === 'published' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                              {item.status === 'published' ? 'Public' : 'Brouillon'}
                            </span>
                          </div>
                          {isEnded && item.lastBidderName ? (
                              <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-xl border border-amber-200 shadow-sm w-fit max-w-full">
                                  <Award size={14} className="text-amber-500 flex-shrink-0" />
                                  <div className="text-[10px] min-w-0">
                                      <span className="font-black uppercase block leading-none truncate text-stone-900 text-amber-600">Vainqueur : {item.lastBidderName}</span>
                                      <span className="text-stone-400 flex items-center gap-1 font-bold truncate"><Mail size={10} className="flex-shrink-0"/> {item.lastBidderEmail}</span>
                                  </div>
                              </div>
                          ) : (
                              <p className="text-stone-400 text-[9px] font-bold uppercase tracking-widest">{item.startingPrice}€ • {item.bidCount || 0} mises</p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-stone-50">
                        <button onClick={() => { setEditingItem(item); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-stone-50 text-stone-900 flex items-center justify-center hover:bg-stone-900 hover:text-white transition-all shadow-sm"><Pencil size={20} /></button>
                        <button onClick={() => handleToggleStatus(item)} className={`w-11 h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all ${item.status === 'published' ? 'bg-stone-50 text-stone-300' : 'bg-emerald-500 text-white shadow-md'}`}>
                          {item.status === 'published' ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                        <button onClick={() => handleDeleteItem(item.id)} className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"><Trash2 size={20} /></button>
                      </div>
                    </div>
                  )})}
                </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function LoginView({ onSuccess }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const handle = async (e) => {
    e.preventDefault();
    try { await signInWithEmailAndPassword(auth, email, pass); onSuccess(); }
    catch(err) { setErrorMsg("Identifiants incorrects."); }
  };
  return (
    <div className="max-w-xs mx-auto py-40 text-center space-y-6 animate-in zoom-in-95 text-stone-900">
        <div className="w-16 h-16 bg-stone-900 text-white rounded-2xl flex items-center justify-center mx-auto shadow-xl transition-transform hover:scale-105 hover:rotate-3"><Lock size={32}/></div>
        <div className="space-y-2 text-stone-900">
            <h2 className="text-3xl font-black tracking-tighter leading-tight text-stone-900">Portail Maître</h2>
            <p className="text-stone-400 text-xs italic font-serif">Accès restreint à l&apos;administration</p>
        </div>
        <form onSubmit={handle} className="space-y-3">
          <input type="email" placeholder="Email artisan" className="w-full p-5 rounded-2xl bg-white border border-stone-200 font-bold outline-none focus:ring-4 ring-amber-50 transition-all shadow-sm text-stone-900 text-stone-900" onChange={e => setEmail(e.target.value)} required />
          <input type="password" placeholder="Mot de passe" className="w-full p-5 rounded-2xl bg-white border border-stone-200 font-bold outline-none focus:ring-4 ring-amber-50 transition-all shadow-sm text-stone-900 text-stone-900" onChange={e => setPass(e.target.value)} required />
          {errorMsg && <p className="text-[10px] text-red-600 font-bold bg-red-50 py-2 rounded-lg">{errorMsg}</p>}
          <button type="submit" className="w-full py-5 bg-stone-900 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-lg hover:bg-stone-800 active:scale-95 transition-all text-white">Entrer</button>
        </form>
    </div>
  );
}

function AdminForm({ db, storage, appId, editData, onCancelEdit }) {
  const [formData, setFormData] = useState({ 
    name: '', 
    description: '', 
    startingPrice: 0, 
    material: '', 
    dimensions: '', 
    width: '', 
    depth: '', 
    height: '', 
    auctionActive: false, 
    durationMinutes: 0 
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");
  const fileInputRef = useRef();

  useEffect(() => {
    if (editData) {
      const duration = editData.auctionEnd ? Math.round((getMillis(editData.auctionEnd) - Date.now()) / 60000) : 0;
      setFormData({
        name: editData.name || '', 
        description: editData.description || '',
        startingPrice: editData.startingPrice || 0, 
        material: editData.material || '',
        dimensions: editData.dimensions || '',
        width: editData.width || '',
        depth: editData.depth || '',
        height: editData.height || '',
        auctionActive: editData.auctionActive || false,
        durationMinutes: duration > 0 ? duration : 0
      });
      setPreviews(editData.images || [editData.imageUrl] || []);
    } else { resetForm(); }
  }, [editData]);

  const resetForm = () => {
    setFormData({ 
      name: '', 
      description: '', 
      startingPrice: 0, 
      material: '', 
      dimensions: '', 
      width: '', 
      depth: '', 
      height: '', 
      auctionActive: false, 
      durationMinutes: 0 
    });
    setImageFiles([]); setPreviews([]);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setImageFiles(prev => [...prev, ...files]);
      setPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
    }
  };

  const addMeuble = async () => {
    if (!formData.name) { setMsg("⚠️ Nom requis"); return; }
    setUploading(true); setMsg("⏳ Envoi...");
    try {
        let imageUrls = [...previews.filter(p => !p.startsWith('blob:'))];
        if (imageFiles.length > 0) {
            for (const file of imageFiles) {
                const imageRef = ref(storage, `furniture/${Date.now()}_${file.name}`);
                await uploadBytes(imageRef, file);
                imageUrls.push(await getDownloadURL(imageRef));
            }
        }
        const data = {
          ...formData, images: imageUrls, imageUrl: imageUrls[0],
          currentPrice: Number(formData.startingPrice),
          startingPrice: Number(formData.startingPrice),
          durationMinutes: Number(formData.durationMinutes),
          auctionEnd: formData.auctionActive ? Timestamp.fromMillis(Date.now() + (Number(formData.durationMinutes) * 60000)) : null,
        };
        if (editData) {
            await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'furniture', editData.id), data);
            onCancelEdit();
        } else {
            await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'furniture'), { ...data, status: 'draft', bidCount: 0, createdAt: serverTimestamp() });
        }
        setMsg("✅ Succès !"); resetForm();
    } catch (err) { setMsg(`❌ Erreur: ${err.message}`); }
    finally { setUploading(false); setTimeout(() => setMsg(""), 3000); }
  };

  return (
    <div className="p-8 md:p-12 bg-white rounded-[3rem] border border-stone-200/60 shadow-2xl space-y-10 animate-in slide-in-from-top-4 text-stone-900">
      <div className="flex justify-between items-center border-b border-stone-100 pb-6 text-stone-900">
        <p className="text-xs font-black uppercase tracking-widest text-stone-900">{editData ? 'Modification en cours' : 'Nouvelle création'}</p>
        {editData && <button onClick={onCancelEdit} className="text-[10px] font-black text-red-500 uppercase hover:text-red-700 transition-colors">Annuler</button>}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 text-stone-900">
        <div className="lg:col-span-4 space-y-4">
            <div className="grid grid-cols-2 gap-3 text-stone-900">
                {previews.map((url, idx) => (
                    <div key={idx} className="aspect-square rounded-2xl overflow-hidden relative group shadow-md border border-stone-50 text-stone-900">
                        <img src={url} className="w-full h-full object-cover text-stone-900" alt="" />
                        <button onClick={() => {setPreviews(p=>p.filter((_,i)=>i!==idx)); setImageFiles(f=>f.filter((_,i)=>i!==idx));}} className="absolute inset-0 bg-red-500/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300 text-white text-white"><Trash2 size={20}/></button>
                    </div>
                ))}
                <button onClick={() => !uploading && fileInputRef.current.click()} className="aspect-square rounded-2xl bg-stone-50 border-2 border-dashed border-stone-200 flex flex-col items-center justify-center hover:bg-stone-100 hover:border-stone-300 transition-all text-stone-300"><Upload size={20} /></button>
            </div>
            <input type="file" id="fileInput" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleImageChange} />
        </div>
        <div className="lg:col-span-8 space-y-6 text-stone-900">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-stone-900">
                <div className="space-y-1.5 text-stone-900">
                    <label className="text-[9px] font-black uppercase text-stone-400 ml-2">Nom de l'ouvrage</label>
                    <input placeholder="Table de monastère..." className="w-full p-4 rounded-xl bg-stone-50 border-none font-bold outline-none focus:ring-4 ring-stone-100 transition-all shadow-inner text-stone-900 text-stone-900" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="space-y-1.5 text-stone-900">
                    <label className="text-[9px] font-black uppercase text-stone-400 ml-2">Prix de départ (€)</label>
                    <input type="number" placeholder="0" className="w-full p-4 rounded-xl bg-stone-50 border-none font-bold outline-none focus:ring-4 ring-stone-100 transition-all shadow-inner text-stone-900 text-stone-900" value={formData.startingPrice === 0 ? "" : formData.startingPrice} onChange={e => setFormData({...formData, startingPrice: e.target.value === "" ? 0 : Number(e.target.value)})} />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-stone-900">
                <div className="space-y-1.5 text-stone-900">
                    <label className="text-[9px] font-black uppercase text-stone-400 ml-2">Essence de bois</label>
                    <input placeholder="Chêne, noyer..." className="w-full p-4 rounded-xl bg-stone-50 border-none font-bold outline-none text-sm focus:ring-4 ring-stone-100 transition-all shadow-inner text-stone-900 text-stone-900" value={formData.material} onChange={e => setFormData({...formData, material: e.target.value})} />
                </div>
                <div className="space-y-1.5 text-stone-900">
                    <label className="text-[9px] font-black uppercase text-stone-400 ml-2">Dimensions (L x P x H cm)</label>
                    <div className="grid grid-cols-3 gap-2 text-stone-900">
                        <input type="number" placeholder="L" className="w-full p-4 rounded-xl bg-stone-50 border-none font-bold outline-none text-xs text-center focus:ring-4 ring-stone-100 text-stone-900 text-stone-900" value={formData.width} onChange={e => setFormData({...formData, width: e.target.value})} />
                        <input type="number" placeholder="P" className="w-full p-4 rounded-xl bg-stone-50 border-none font-bold outline-none text-xs text-center focus:ring-4 ring-stone-100 text-stone-900 text-stone-900" value={formData.depth} onChange={e => setFormData({...formData, depth: e.target.value})} />
                        <input type="number" placeholder="H" className="w-full p-4 rounded-xl bg-stone-50 border-none font-bold outline-none text-xs text-center focus:ring-4 ring-stone-100 text-stone-900 text-stone-900" value={formData.height} onChange={e => setFormData({...formData, height: e.target.value})} />
                    </div>
                </div>
            </div>
            <div className="bg-amber-50/60 p-6 rounded-3xl border border-amber-200/40 flex flex-col sm:flex-row justify-between items-center gap-6 shadow-sm text-stone-900">
                <div className="flex items-center gap-4 cursor-pointer text-stone-900 text-stone-900 text-stone-900" onClick={() => setFormData({...formData, auctionActive: !formData.auctionActive})}>
                    <div className={`w-12 h-7 rounded-full p-1 transition-all ${formData.auctionActive ? 'bg-amber-500 shadow-inner' : 'bg-stone-200 shadow-inner'}`}><div className={`w-5 h-5 bg-white rounded-full transition-all shadow-md ${formData.auctionActive ? 'translate-x-5' : ''}`} /></div><p className="text-[10px] font-black uppercase tracking-widest text-stone-900">Vendre aux enchères</p>
                </div>
                {formData.auctionActive && (
                    <div className="flex flex-col gap-3 w-full sm:w-auto text-stone-900 text-stone-900">
                        <div className="flex items-center gap-4 text-stone-900 text-stone-900 text-stone-900">
                            <span className="text-[9px] font-black uppercase text-amber-700">Durée (min) :</span>
                            <input 
                                type="number" 
                                className="w-full sm:w-24 bg-white px-3 py-2 rounded-xl font-bold text-xs outline-none border border-amber-200/50 shadow-sm focus:ring-2 ring-amber-100 text-stone-900 text-stone-900" 
                                value={formData.durationMinutes === 0 ? "" : formData.durationMinutes} 
                                onChange={(e) => setFormData({...formData, durationMinutes: e.target.value === "" ? 0 : Number(e.target.value)})} 
                                placeholder="0"
                            />
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide text-stone-900 text-stone-900">
                            {[1440, 2880, 4320].map(m => (
                                <button key={m} type="button" onClick={() => setFormData({...formData, durationMinutes: m})} className={`px-3 py-1 rounded-lg text-[8px] font-black border transition-all whitespace-nowrap ${formData.durationMinutes === m ? 'bg-stone-900 text-white border-stone-900 shadow-md' : 'bg-white text-stone-400 border-stone-100 hover:border-amber-200'}`}>
                                    {m/60}H
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <div className="space-y-1.5 text-stone-900">
                <label className="text-[9px] font-black uppercase text-stone-400 ml-2">L'histoire de l'objet</label>
                <textarea placeholder="Décrivez l'origine du bois, le temps de travail, les détails uniques..." className="w-full p-5 rounded-2xl bg-stone-50 border-none font-bold text-sm h-32 resize-none outline-none focus:ring-4 ring-stone-100 transition-all shadow-inner text-stone-900 text-stone-900" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            </div>
        </div>
      </div>
      <div className="flex flex-col items-end gap-3 border-t border-stone-100 pt-6 text-stone-900">
        {msg && <div className={`text-[9px] font-black uppercase px-4 py-2 rounded-full border shadow-sm ${msg.includes('✅') ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>{msg}</div>}
        <button onClick={addMeuble} disabled={uploading} className="w-full md:w-auto px-16 py-5 bg-stone-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl hover:bg-stone-800 hover:translate-y-[-2px] active:translate-y-[1px] transition-all disabled:opacity-50 text-white">
            {editData ? "Confirmer les modifications" : "Publier l'ouvrage"}
        </button>
      </div>
    </div>
  );
}