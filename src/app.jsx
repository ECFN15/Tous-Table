import React, { useState, useEffect } from 'react';
import {
  onSnapshot, collection, doc, updateDoc, deleteDoc, serverTimestamp, addDoc, query, orderBy
} from 'firebase/firestore';
import {
  onAuthStateChanged, signInAnonymously, signOut, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification
} from 'firebase/auth';
import {
  Hammer, LogOut, ShieldCheck, Menu, X, Instagram, Mail, User, Eye, EyeOff, Pencil, Trash2, Trophy, ShoppingBag, Sun, Moon
} from 'lucide-react';

// --- IMPORTS CONFIG & UTILS ---
import { auth, db, appId, googleProvider, facebookProvider, twitterProvider, appleProvider, microsoftProvider } from './firebase/config';
import { getMillis } from './utils/time';

// --- IMPORTS VUES ---
import HomeView from './components/HomeView';
import GalleryView from './components/GalleryView';
import ProductDetail from './components/ProductDetail';

import LoginView from './components/LoginView';
import AdminForm from './components/AdminForm';
import AdminOrders from './components/AdminOrders';

import AdminComments from './components/AdminComments'; // New
import AdminDashboard from './components/AdminDashboard'; // New Dashboard
import AdminHomepage from './components/AdminHomepage'; // New Homepage Manager
import CartSidebar from './components/CartSidebar';
import CheckoutView from './components/CheckoutView';
import OrderSuccessModal from './components/OrderSuccessModal';



// --- CONFIG ADMIN ---
const ADMIN_EMAILS = ['matthis.fradin2@gmail.com'];

export default function App() {
  // États Globaux
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [items, setItems] = useState([]);
  const [boardItems, setBoardItems] = useState([]); // New: Planches

  // Cart State
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);

  // Navigation
  const [view, setView] = useState('home'); // 'home', 'gallery', 'detail', 'login', 'admin'
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSecretGateOpen, setIsSecretGateOpen] = useState(false);
  const [showFullLogin, setShowFullLogin] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showAuthSuccess, setShowAuthSuccess] = useState(false);

  // Admin State
  const [adminCollection, setAdminCollection] = useState('dashboard'); // 'dashboard' | 'furniture' | 'cutting_boards' | 'orders' | 'comments'

  // Deep Linking State
  const [pendingDeepLink, setPendingDeepLink] = useState(null);

  // --- SCROLL HEADER LOGIC ---
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Dark Mode State
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true';
    }
    return false;
  });

  // Apply dark mode class to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < 10) {
        setIsHeaderVisible(true);
        setLastScrollY(currentScrollY);
        return;
      }
      if (currentScrollY > lastScrollY && currentScrollY > 20) {
        setIsHeaderVisible(false);
      } else if (currentScrollY < lastScrollY) {
        setIsHeaderVisible(true);
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // --- CHARGEMENT ---
  useEffect(() => {
    // 1. Meubles (Données)
    const unsubData = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'furniture'), (snap) => {
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => getMillis(b.createdAt) - getMillis(a.createdAt)));
    });

    // 2. Planches (Données)
    const unsubBoards = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'cutting_boards'), (snap) => {
      setBoardItems(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => getMillis(b.createdAt) - getMillis(a.createdAt)));
    });

    // 3. Auth (Utilisateur)
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);

      // Sécurité : Vérifie si l'email est autorisé
      const isRealAdmin = u && !u.isAnonymous && ADMIN_EMAILS.includes(u.email);
      setIsAdmin(isRealAdmin);

      const params = new URLSearchParams(window.location.search);
      const productId = params.get('product');

      if (params.get('admin') === 'true' || window.location.pathname === '/admin') {
        setIsSecretGateOpen(true);
        if (isRealAdmin) setView('admin'); else setView('login');
      } else if (productId) {
        // Deep Link détecté : on attend que les données chargent
        setPendingDeepLink(productId);
      } else {
        if (params.get('page') === 'gallery') setView('gallery');

        if (!u) {
          signInAnonymously(auth).catch(err => console.error(err));
        }
      }
      setLoading(false);
    });

    return () => { unsubData(); unsubBoards(); unsubAuth(); };
  }, []);

  // --- TRAITEMENT DEEP LINK ---
  useEffect(() => {
    if (pendingDeepLink && (items.length > 0 || boardItems.length > 0)) {
      const allItems = [...items, ...boardItems];
      const targetItem = allItems.find(i => i.id === pendingDeepLink);

      if (targetItem) {
        console.log("Deep link activated for:", targetItem.name);
        setSelectedItemId(pendingDeepLink);
        setView('detail');
        setPendingDeepLink(null); // Lien consommé
        // Nettoyer l'URL sans recharger
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [items, boardItems, pendingDeepLink]);

  // --- CART SYNC ---
  useEffect(() => {
    if (user && !user.isAnonymous) {
      console.log("Subscribing to cart for user:", user.uid);
      // Removing orderBy for debugging to avoid index issues
      const q = query(collection(db, 'users', user.uid, 'cart'));
      const unsubCart = onSnapshot(q, (snap) => {
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setCartItems(items);
      }, (err) => {
        console.error("Cart sync error:", err);
      });
      return () => unsubCart();
    } else {
      setCartItems([]);
    }
  }, [user]);

  // --- ACTIONS ---
  const handleToggleStatus = async (item, col) => {
    try { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', col, item.id), { status: item.status === 'published' ? 'draft' : 'published' }); } catch (e) { console.error(e); }
  };
  const handleDeleteItem = async (year, id, col) => { // 'year' removed from logic mostly, simplified
    if (!confirm("Supprimer ?")) return;
    try { await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', col, id)); } catch (e) { console.error(e); }
  };
  const handleSocialLogin = async (provider) => {
    try { await signInWithPopup(auth, provider); setShowFullLogin(false); } catch (e) { console.error(e); }
  };

  // --- CART ACTIONS ---
  const addToCart = async (item) => {
    // console.log("Add to cart clicked", user);
    if (!user || user.isAnonymous) {
      // console.log("User is not logged in or anonymous, showing login modal");
      setShowFullLogin(true);
      return;
    }

    const cartItemData = {
      originalId: item.id,
      name: item.name,
      price: item.currentPrice || item.startingPrice,
      image: item.images?.[0] || item.imageUrl,
      material: item.material || 'Bois',
      addedAt: serverTimestamp()
    };

    try {
      await addDoc(collection(db, 'users', user.uid, 'cart'), cartItemData);
      setIsCartOpen(true);
    } catch (e) {
      console.error("Error add cart", e);
      alert("Erreur ajout panier : " + e.message);
    }
  };

  const removeFromCart = async (cartDocId) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'cart', cartDocId));
  };

  const handlePlaceOrder = async (orderData) => {
    if (!user) return;

    // 1. Create Order
    const dbOrder = {
      ...orderData,
      userId: user.uid,
      userEmail: user.email,
      createdAt: serverTimestamp(),
      status: orderData.paymentMethod === 'deferred' ? 'pending_payment' : 'pending_stripe'
    };

    // Add items details to order for persistence
    const orderRef = await addDoc(collection(db, 'orders'), dbOrder);

    // 2. Clear Cart (Batch)
    // Note: In a real app we would use a batch, but loop is fine for small carts
    // We already have cartItems in state
    for (const item of cartItems) {
      await deleteDoc(doc(db, 'users', user.uid, 'cart', item.id));
    }
    setCartItems([]); // Optimistic update

    // 3. Handle Payment Redirect or Success
    setCartItems([]); // Clear UI cart immediately
    setIsCartOpen(false);
    setShowOrderSuccess(true); // Trigger Success Modal
    setView('gallery'); // Go to Marketplace (behind the modal)

    // Email simulation log
    console.log("Order placed:", orderData);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]"><div className="w-10 h-10 border-[3px] border-stone-200 border-t-stone-900 rounded-full animate-spin"></div></div>;



  // Active Admin List
  const currentAdminItems = adminCollection === 'furniture' ? items : boardItems;
  // Cart Total
  const cartTotal = cartItems.reduce((sum, item) => sum + (item.price || 0), 0);

  return (
    <div className={`min-h-screen font-sans selection:bg-amber-100 transition-colors duration-500 ${darkMode ? 'bg-stone-900 text-white' : 'bg-[#FAF9F6] text-stone-900'}`}>

      {/* COMPOSANT PANIER */}
      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onRemoveItem={removeFromCart}
        totalPrice={cartTotal}
        onCheckout={() => { setIsCartOpen(false); setView('checkout'); window.scrollTo(0, 0); }}
      />

      {/* MODAL LOGIN (Pour la Marketplace) */}
      {showFullLogin && (
        <div className="fixed inset-0 z-[200] bg-stone-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl max-w-sm w-full text-center space-y-6 animate-in zoom-in-95 relative overflow-hidden">

            {showAuthSuccess ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-500 border border-emerald-100 shadow-sm">
                  <ShieldCheck size={40} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black tracking-tight text-stone-900">Vérifiez vos emails !</h3>
                  <p className="text-sm text-stone-500 font-medium px-2 leading-relaxed">
                    Un lien de confirmation vient d'être envoyé. <br />
                    <span className="text-amber-600 font-bold">Pensez à regarder dans vos spams.</span>
                  </p>
                </div>
                <button onClick={() => { setShowFullLogin(false); setShowAuthSuccess(false); }} className="w-full py-4 bg-stone-900 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-stone-800 transition-all shadow-lg">
                  C'est compris
                </button>
              </div>
            ) : (
              <>
                {/* HEADER */}
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-amber-500 border border-amber-100 shadow-sm">
                    <ShieldCheck size={32} />
                  </div>
                  <h3 className="text-2xl font-black tracking-tight text-stone-900">Vérification</h3>
                  <p className="text-xs text-stone-400 font-medium px-4">Identifiez-vous pour accéder à la vente.</p>
                </div>

                {/* FORMULAIRE EMAIL */}
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const email = e.target.email.value;
                  const pass = e.target.password.value;
                  const confirmPass = e.target.confirmPassword?.value;
                  const isSignUp = e.target.getAttribute('data-signup') === 'true';

                  try {
                    if (isSignUp) {
                      if (pass !== confirmPass) throw new Error("Les mots de passe ne correspondent pas.");
                      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
                      await sendEmailVerification(userCredential.user, {
                        url: window.location.origin + '?page=gallery',
                        handleCodeInApp: true
                      });
                      setShowAuthSuccess(true);
                    } else {
                      await signInWithEmailAndPassword(auth, email, pass);
                      setShowFullLogin(false);
                    }
                  } catch (err) {
                    let msg = "Une erreur est survenue.";
                    if (err.code === 'auth/email-already-in-use') msg = "Cet email est déjà associé à un compte. Connectez-vous.";
                    else if (err.code === 'auth/weak-password') msg = "Le mot de passe doit contenir au moins 6 caractères.";
                    else if (err.code === 'auth/invalid-email') msg = "L'adresse email n'est pas valide.";
                    else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') msg = "Email ou mot de passe incorrect.";

                    alert(msg);
                  }
                }} className="space-y-3 pt-2" data-signup="false">

                  <input name="email" type="email" placeholder="Adresse email" className="w-full p-4 rounded-xl bg-stone-50 border border-stone-200 font-bold text-sm outline-none focus:ring-2 ring-stone-900 transition-all text-stone-900 placeholder:text-stone-300" required />

                  <div className="relative">
                    <input name="password" type={showPassword ? "text" : "password"} placeholder="Mot de passe" className="w-full p-4 rounded-xl bg-stone-50 border border-stone-200 font-bold text-sm outline-none focus:ring-2 ring-stone-900 transition-all text-stone-900 placeholder:text-stone-300" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-900">
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>

                  <div id="confirm-pass-container" className="hidden transition-all duration-300 overflow-hidden" style={{ maxHeight: '0px' }}>
                    <div className="relative mb-3">
                      <input name="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="Confirmer mot de passe" className="w-full p-4 rounded-xl bg-stone-50 border border-stone-200 font-bold text-sm outline-none focus:ring-2 ring-stone-900 transition-all text-stone-900 placeholder:text-stone-300" />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-900">
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <button type="submit" className="w-full py-4 bg-stone-100 text-stone-900 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-stone-200 transition-all">
                    <span id="btn-text">Continuer</span>
                  </button>
                </form>

                {/* DIVIDER */}
                <div className="flex items-center gap-4 opacity-50">
                  <div className="h-px bg-stone-200 flex-1"></div>
                  <span className="text-[9px] font-black uppercase text-stone-300">OU</span>
                  <div className="h-px bg-stone-200 flex-1"></div>
                </div>

                {/* GOOGLE */}
                <button onClick={() => handleSocialLogin(googleProvider)} className="w-full flex items-center justify-center gap-3 bg-[#1a1a1a] text-white p-4 rounded-xl font-bold hover:scale-[1.02] transition-all shadow-xl group">
                  <div className="bg-white rounded-full p-1"><img src="https://www.google.com/favicon.ico" className="w-3 h-3" alt="G" /></div>
                  <span>Continuer avec Google</span>
                </button>

                {/* FOOTER ACTIONS */}
                <div className="pt-2 flex justify-between items-center px-1">
                  <button onClick={() => {
                    const form = document.querySelector('form');
                    const container = document.getElementById('confirm-pass-container');
                    const isSignUp = form.getAttribute('data-signup') === 'true';

                    form.setAttribute('data-signup', !isSignUp);

                    if (!isSignUp) { // Opening
                      container.classList.remove('hidden');
                      void container.offsetWidth;
                      container.style.maxHeight = '100px';
                      document.querySelector('input[name="confirmPassword"]').required = true;
                      setTimeout(() => { container.style.overflow = 'visible'; }, 300);
                    } else { // Closing
                      container.style.overflow = 'hidden';
                      container.style.maxHeight = '0px';
                      setTimeout(() => container.classList.add('hidden'), 300);
                      document.querySelector('input[name="confirmPassword"]').required = false;
                    }

                    document.getElementById('btn-text').innerText = !isSignUp ? "S'inscrire" : "Continuer";
                    document.getElementById('toggle-text').innerText = !isSignUp ? "J'ai déjà un compte" : "Pas de compte ?";
                  }} className="text-[10px] font-bold text-stone-400 hover:text-stone-900 transition-colors" id="toggle-text">Pas de compte ?</button>

                  <button onClick={() => setShowFullLogin(false)} className="text-[10px] font-black uppercase text-stone-300 hover:text-red-400 transition-colors">Annuler</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* --- NAVBAR & MENU GLOBAUX (NE S'AFFICHENT PAS SUR LA PAGE D'ACCUEIL) --- */}
      {view !== 'home' && (
        <>
          {/* MENU LATERAL (OVERLAY) */}
          <div className={`fixed inset-0 z-[110] transition-all duration-700 ${isMenuOpen ? 'visible' : 'invisible pointer-events-none'}`}>
            <div className={`absolute inset-0 bg-stone-900/60 backdrop-blur-md transition-opacity duration-700 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setIsMenuOpen(false)}></div>
            <div className={`absolute right-0 top-0 bottom-0 w-full md:w-[450px] shadow-2xl transition-all duration-700 ease-expo p-12 flex flex-col justify-between ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'} ${darkMode ? 'bg-stone-900 border-l border-stone-800' : 'bg-white'}`}>
              <div className="space-y-20">
                <div className="flex justify-between items-center"><span className={`text-[10px] font-black uppercase tracking-[0.3em] ${darkMode ? 'text-stone-500' : 'text-stone-300'}`}>Menu</span><button onClick={() => setIsMenuOpen(false)} className={`w-12 h-12 rounded-full border flex items-center justify-center transition-colors ${darkMode ? 'border-stone-800 text-white hover:bg-stone-800' : 'border-stone-100 hover:bg-stone-50'}`}><X size={20} /></button></div>
                <nav className="flex flex-col gap-10">
                  <button onClick={() => { setView('home'); setIsMenuOpen(false); window.scrollTo(0, 0); }} className={`text-5xl font-black tracking-tighter transition-all text-left ${darkMode ? 'text-white hover:text-amber-500' : 'text-stone-900 hover:text-amber-600'}`}>Accueil.</button>
                  <button onClick={() => { setView('gallery'); setIsMenuOpen(false); window.scrollTo(0, 0); }} className={`text-5xl font-black tracking-tighter transition-all text-left ${darkMode ? 'text-white hover:text-amber-500' : 'text-stone-900 hover:text-amber-600'}`}>Marketplace.</button>
                  {isAdmin && <button onClick={() => { setView('admin'); setIsMenuOpen(false); window.scrollTo(0, 0); }} className={`text-5xl font-black tracking-tighter transition-all text-left opacity-30 ${darkMode ? 'text-stone-600 hover:text-stone-300' : 'hover:text-stone-300'}`}>Admin.</button>}
                </nav>
              </div>
              <div className={`space-y-6 pt-10 border-t ${darkMode ? 'border-stone-800' : 'border-stone-100'}`}>
                {user && !user.isAnonymous && (
                  <div className="mb-4">
                    <p className={`text-xs font-bold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-stone-900'}`}>
                      {user.displayName || user.email}
                      {user.emailVerified && <span className="text-blue-500 text-[10px] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">Vérifié</span>}
                    </p>
                    <p className={`text-[10px] uppercase tracking-widest ${darkMode ? 'text-stone-500' : 'text-stone-400'}`}>Connecté</p>
                  </div>
                )}
                <div className="flex gap-6">
                  <a href="#" className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${darkMode ? 'bg-stone-800 text-white hover:bg-stone-700' : 'bg-stone-50 hover:bg-stone-900 hover:text-white'}`}><Instagram size={20} /></a>
                  <a href="mailto:contact@tat.fr" className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${darkMode ? 'bg-stone-800 text-white hover:bg-stone-700' : 'bg-stone-50 hover:bg-stone-900 hover:text-white'}`}><Mail size={20} /></a>
                </div>
              </div>
            </div>
          </div>

          {/* NAVBAR GLOBALE (Auto-Hide) */}
          <nav className={`fixed top-0 left-0 right-0 z-[100] px-4 md:px-12 py-6 md:py-8 flex justify-between items-center mix-blend-difference text-white transition-transform duration-300 ease-in-out ${isHeaderVisible ? 'translate-y-0' : '-translate-y-full pointer-events-none'}`}>
            <div className="flex items-center gap-2 md:gap-3 cursor-pointer group" onClick={() => { setView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
              <div className="bg-white text-stone-900 p-1 md:p-1.5 rounded-lg shadow-md group-hover:rotate-6 transition-all"><Hammer size={16} className="md:w-5 md:h-5" /></div>
              <div><h1 className="text-base md:text-lg font-black uppercase tracking-tighter leading-none">Tous à Table</h1><p className="text-[6px] md:text-[7px] font-black tracking-[0.3em] uppercase opacity-60">Atelier Normand</p></div>
            </div>

            <div className="flex items-center gap-4">
              {user && !user.isAnonymous ? (
                <div className="flex items-center gap-2 md:gap-4 mr-1 md:mr-2">
                  <div className="text-right hidden md:block">
                    <div className="flex items-center justify-end gap-2">
                      <p className="text-[10px] font-black uppercase tracking-widest">{user.displayName || 'Client'}</p>
                      {user.emailVerified && <ShieldCheck size={14} strokeWidth={3} title="Compte Vérifié" />}
                    </div>
                  </div>
                  <button onClick={() => { signOut(auth); }} className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white hover:text-stone-900 backdrop-blur border border-white/20 transition-all"><LogOut size={14} className="md:w-4 md:h-4" /></button>
                </div>
              ) : !isSecretGateOpen && (
                <button onClick={() => setShowFullLogin(true)} className="flex items-center gap-2 px-2.5 py-1.5 md:px-5 md:py-3 rounded-full bg-white/10 backdrop-blur border border-white/20 hover:bg-white hover:text-stone-900 transition-all text-[9px] md:text-[10px] font-black uppercase tracking-widest mr-1 md:mr-2"><ShieldCheck size={12} className="md:w-3.5 md:h-3.5" /> <span className="hidden md:inline">Login</span></button>
              )}

              {/* CART BUTTON */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="w-8 h-8 md:w-auto md:h-auto px-0 md:px-5 md:py-3 rounded-full bg-white/10 flex items-center justify-center gap-3 hover:bg-amber-500 hover:text-white backdrop-blur border border-white/20 transition-all group relative"
              >
                <ShoppingBag size={16} className="md:w-5 md:h-5" />
                <span className="hidden md:block text-[10px] font-black uppercase tracking-widest">Panier</span>
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 md:top-1 md:right-1 w-3.5 h-3.5 md:w-5 md:h-5 bg-stone-900 text-white flex items-center justify-center text-[7px] md:text-[9px] font-black rounded-full border border-white">
                    {cartItems.length}
                  </span>
                )}
              </button>

              {/* DARK MODE TOGGLE */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-amber-500 hover:text-white backdrop-blur border border-white/20 transition-all ml-1 md:ml-0"
                title={darkMode ? 'Mode Clair' : 'Mode Sombre'}
              >
                {darkMode ? <Sun size={14} className="md:w-[18px] md:h-[18px]" /> : <Moon size={14} className="md:w-[18px] md:h-[18px]" />}
              </button>

              <button onClick={() => setIsMenuOpen(true)} className="w-8 h-8 md:w-auto md:h-auto px-0 md:px-6 md:py-3 rounded-full bg-white/10 flex items-center justify-center gap-4 hover:bg-white hover:text-stone-900 backdrop-blur border border-white/20 group transition-all ml-1 md:ml-0"><span className="hidden md:block text-[10px] font-black uppercase tracking-widest">Menu</span><Menu size={16} className="md:w-5 md:h-5" /></button>
            </div>
          </nav>
        </>
      )}

      {/* --- CONTENU PRINCIPAL --- */}
      <main>
        {/* VUE: ACCUEIL */}
        {view === 'home' && (
          <HomeView onEnterMarketplace={() => { setView('gallery'); window.scrollTo(0, 0); }} darkMode={darkMode} />
        )}

        {/* VUE: GALERIE (MARKETPLACE) */}
        {view === 'gallery' && (
          <GalleryView
            items={items}
            boardItems={boardItems}
            isAdmin={isAdmin} isSecretGateOpen={isSecretGateOpen} user={user}
            onShowLogin={() => setShowFullLogin(true)}
            onSelectItem={(id) => { setSelectedItemId(id); setView('detail'); window.scrollTo(0, 0); }}
            darkMode={darkMode}
          />
        )}

        {/* VUE: DETAIL PRODUIT */}
        {view === 'detail' && selectedItemId && (
          <div className="pt-32 px-6">
            <ProductDetail
              item={[...items, ...boardItems].find(i => i.id === selectedItemId)}
              user={user}
              onBack={() => { setView('gallery'); setSelectedItemId(null); }}
              onAddToCart={addToCart}
            />
          </div>
        )}

        {/* VUE: CHECKOUT */}
        {view === 'checkout' && (
          <CheckoutView
            cartItems={cartItems}
            total={cartTotal}
            user={user}
            onBack={() => setView('gallery')}
            onPlaceOrder={handlePlaceOrder}
          />
        )}

        {/* MODAL SUCCESS ORDER */}
        {showOrderSuccess && <OrderSuccessModal onClose={() => setShowOrderSuccess(false)} />}

        {/* VUE: LOGIN ADMIN */}
        {view === 'login' && isSecretGateOpen && <LoginView onSuccess={() => setView('admin')} />}

        {/* VUE: ADMIN DASHBOARD */}
        {view === 'admin' && isAdmin && (
          <div className={`max-w-6xl mx-auto px-4 py-32 space-y-16 animate-in fade-in ${darkMode ? 'text-white' : 'text-stone-900'}`}>
            <div className={`flex justify-between items-center border-b pb-8 ${darkMode ? 'border-stone-700' : 'border-stone-200/60'}`}><h2 className="text-4xl font-black tracking-tighter">Gestion Atelier</h2><button onClick={() => setView('gallery')} className={`text-[10px] font-black border-2 px-6 py-2 rounded-xl transition-all ${darkMode ? 'border-white hover:bg-white hover:text-stone-900' : 'border-stone-900 hover:bg-stone-900 hover:text-white'}`}>Retour</button></div>

            {/* Collection Switcher */}
            {/* Collection Switcher */}
            <div className={`flex flex-wrap md:flex-nowrap gap-2 md:gap-4 p-2 md:p-1 border-b md:border-none md:rounded-xl w-full md:w-fit justify-center transition-all shadow-sm md:shadow-none ${darkMode ? 'bg-stone-800 border-stone-700 md:bg-stone-800' : 'bg-[#FAF9F6] border-stone-200/50 md:bg-stone-100'}`}>
              <button
                onClick={() => { setAdminCollection('dashboard'); setEditingItem(null); }}
                className={`flex-1 md:flex-none px-4 md:px-6 py-3 rounded-xl md:rounded-lg text-[10px] md:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap shadow-sm border md:border-none ${adminCollection === 'dashboard' ? (darkMode ? 'bg-white text-stone-900 border-white md:bg-stone-700 md:text-white md:border-none' : 'bg-stone-900 text-white md:bg-white md:text-stone-900 border-stone-900') : (darkMode ? 'bg-stone-900 text-stone-400 border-stone-700 hover:text-stone-300' : 'bg-white text-stone-400 border-stone-200 hover:text-stone-600')}`}
              >
                Dashboard
              </button>
              <button
                onClick={() => { setAdminCollection('homepage'); setEditingItem(null); }}
                className={`flex-1 md:flex-none px-4 md:px-6 py-3 rounded-xl md:rounded-lg text-[10px] md:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap shadow-sm border md:border-none ${adminCollection === 'homepage' ? (darkMode ? 'bg-white text-stone-900 border-white md:bg-stone-700 md:text-white md:border-none' : 'bg-stone-900 text-white md:bg-white md:text-stone-900 border-stone-900') : (darkMode ? 'bg-stone-900 text-stone-400 border-stone-700 hover:text-stone-300' : 'bg-white text-stone-400 border-stone-200 hover:text-stone-600')}`}
              >
                Homepage
              </button>
              <button
                onClick={() => { setAdminCollection('orders'); setEditingItem(null); }}
                className={`flex-1 md:flex-none px-4 md:px-6 py-3 rounded-xl md:rounded-lg text-[10px] md:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap shadow-sm border md:border-none ${adminCollection === 'orders' ? (darkMode ? 'bg-white text-stone-900 border-white md:bg-stone-700 md:text-white md:border-none' : 'bg-stone-900 text-white md:bg-white md:text-stone-900 border-stone-900') : (darkMode ? 'bg-stone-900 text-stone-400 border-stone-700 hover:text-stone-300' : 'bg-white text-stone-400 border-stone-200 hover:text-stone-600')}`}
              >
                Commandes
              </button>
              <button
                onClick={() => { setAdminCollection('furniture'); setEditingItem(null); }}
                className={`flex-1 md:flex-none px-4 md:px-6 py-3 rounded-xl md:rounded-lg text-[10px] md:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap shadow-sm border md:border-none ${adminCollection === 'furniture' ? (darkMode ? 'bg-white text-stone-900 border-white md:bg-stone-700 md:text-white md:border-none' : 'bg-stone-900 text-white md:bg-white md:text-stone-900 border-stone-900') : (darkMode ? 'bg-stone-900 text-stone-400 border-stone-700 hover:text-stone-300' : 'bg-white text-stone-400 border-stone-200 hover:text-stone-600')}`}
              >
                Mobilier
              </button>
              <button
                onClick={() => { setAdminCollection('cutting_boards'); setEditingItem(null); }}
                className={`flex-1 md:flex-none px-4 md:px-6 py-3 rounded-xl md:rounded-lg text-[10px] md:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap shadow-sm border md:border-none ${adminCollection === 'cutting_boards' ? (darkMode ? 'bg-white text-stone-900 border-white md:bg-stone-700 md:text-white md:border-none' : 'bg-stone-900 text-white md:bg-white md:text-stone-900 border-stone-900') : (darkMode ? 'bg-stone-900 text-stone-400 border-stone-700 hover:text-stone-300' : 'bg-white text-stone-400 border-stone-200 hover:text-stone-600')}`}
              >
                <span className="md:hidden">Planches</span>
                <span className="hidden md:inline">Planches à Découper</span>
              </button>
              <button
                onClick={() => { setAdminCollection('comments'); setEditingItem(null); }}
                className={`flex-1 md:flex-none px-4 md:px-6 py-3 rounded-xl md:rounded-lg text-[10px] md:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap shadow-sm border md:border-none ${adminCollection === 'comments' ? (darkMode ? 'bg-white text-stone-900 border-white md:bg-stone-700 md:text-white md:border-none' : 'bg-stone-900 text-white md:bg-white md:text-stone-900 border-stone-900') : (darkMode ? 'bg-stone-900 text-stone-400 border-stone-700 hover:text-stone-300' : 'bg-white text-stone-400 border-stone-200 hover:text-stone-600')}`}
              >
                Avis
              </button>
            </div>

            {/* CONTENU ADMIN */}
            {adminCollection === 'dashboard' ? (
              <AdminDashboard user={user} darkMode={darkMode} />
            ) : adminCollection === 'homepage' ? (
              <AdminHomepage darkMode={darkMode} />
            ) : adminCollection === 'orders' ? (
              <AdminOrders darkMode={darkMode} />
            ) : adminCollection === 'comments' ? (
              <AdminComments darkMode={darkMode} />
            ) : (
              <>
                {/* Formulaire Admin */}
                <AdminForm
                  key={adminCollection}
                  editData={editingItem}
                  onCancelEdit={() => setEditingItem(null)}
                  collectionName={adminCollection}
                  darkMode={darkMode}
                />

                {/* Liste Admin */}
                <div className="grid gap-4 pt-10 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
                  {currentAdminItems.map(item => {
                    const isAuctionOver = item.auctionActive && item.auctionEnd && (getMillis(item.auctionEnd) < Date.now());
                    const hasWinner = isAuctionOver && item.lastBidderEmail;

                    return (
                      <div key={item.id} className={`p-4 md:p-5 rounded-3xl md:rounded-[2.5rem] border shadow-sm hover:shadow-md transition-all relative overflow-hidden group ${darkMode ? 'bg-stone-800 border-stone-700' : 'bg-[#FAF9F6] border-stone-200'}`}>
                        <div className="flex flex-col md:flex-row md:items-center justify-between relative z-10 gap-6">
                          <div className="flex items-center md:items-center gap-4 md:gap-8">
                            <div className="relative flex-shrink-0">
                              <img src={item.images?.[0] || item.imageUrl} className={`w-16 h-16 md:w-20 md:h-20 rounded-xl md:rounded-2xl object-cover shadow-sm border ${darkMode ? 'border-stone-700' : 'border-white'}`} alt="" />
                              {hasWinner && <div className={`absolute -top-2 -right-2 p-1 md:p-1.5 rounded-full shadow-md border-2 ${darkMode ? 'bg-amber-500 border-stone-800' : 'bg-amber-400 border-white'} text-white`}><Trophy size={12} fill="currentColor" className="md:w-3.5 md:h-3.5" /></div>}
                            </div>

                            <div className="space-y-1 md:space-y-2 min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2 md:gap-3">
                                <span className={`font-black text-base md:text-xl truncate ${darkMode ? 'text-white' : 'text-stone-900'}`}>{item.name}</span>
                                <span className={`text-[8px] md:text-[9px] font-black uppercase tracking-widest px-2 py-0.5 md:px-2.5 md:py-1 rounded-lg ${item.status === 'published' ? (darkMode ? 'bg-emerald-900/40 text-emerald-400' : 'bg-emerald-100 text-emerald-700') : (darkMode ? 'bg-stone-700 text-stone-500' : 'bg-stone-200 text-stone-500')}`}>
                                  {item.status === 'published' ? 'Public' : 'Brouillon'}
                                </span>
                              </div>

                              {hasWinner ? (
                                <div className={`flex flex-col gap-0.5 md:gap-1 border px-3 py-1.5 md:px-4 md:py-2 rounded-xl animate-in slide-in-from-left-4 shadow-sm w-fit ${darkMode ? 'bg-amber-950/20 border-amber-900/40' : 'bg-amber-50 border-amber-200'}`}>
                                  <p className={`text-[8px] md:text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 md:gap-2 ${darkMode ? 'text-amber-400' : 'text-amber-800'}`}>
                                    <span className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                    Vainqueur
                                  </p>
                                  <div className="pl-2.5 md:pl-3.5">
                                    <p className={`text-xs md:text-sm font-bold ${darkMode ? 'text-stone-200' : 'text-stone-800'}`}>{item.lastBidderName}</p>
                                    <p className={`text-[10px] md:text-xs font-mono select-all flex items-center gap-1 transition-colors cursor-pointer ${darkMode ? 'text-stone-500 hover:text-amber-400' : 'text-stone-500 hover:text-amber-700'}`} title="Copier">
                                      <Mail size={10} className="md:w-3" /> {item.lastBidderEmail}
                                    </p>
                                  </div>
                                </div>
                              ) : item.auctionActive && (
                                <div className="text-[10px] md:text-xs text-stone-400 font-medium pl-1">
                                  Enchère en cours • {item.bidCount || 0} offre(s)
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center justify-end md:justify-start gap-2 md:gap-3 w-full md:w-auto mt-2 md:mt-0 border-t md:border-none pt-3 md:pt-0">
                            <button onClick={() => { setEditingItem(item); window.scrollTo(0, 0); }} className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shadow-sm border transition-all hover:scale-110 ${darkMode ? 'bg-stone-700 text-white border-stone-600' : 'bg-white text-stone-900 border-stone-100'}`} title="Modifier"><Pencil size={16} className="md:w-[18px]" /></button>
                            <button onClick={() => handleToggleStatus(item, adminCollection)} className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shadow-sm transition-all hover:scale-110 ${item.status === 'published' ? (darkMode ? 'bg-emerald-600 text-white shadow-emerald-900/40' : 'bg-emerald-500 text-white shadow-emerald-200') : (darkMode ? 'bg-stone-700 text-stone-500' : 'bg-stone-200 text-stone-400')}`} title={item.status === 'published' ? 'Masquer' : 'Publier'}>{item.status === 'published' ? <Eye size={16} className="md:w-[18px]" /> : <EyeOff size={16} className="md:w-[18px]" />}</button>
                            <button onClick={() => handleDeleteItem(null, item.id, adminCollection)} className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shadow-sm border transition-all hover:scale-110 ${darkMode ? 'bg-red-950/40 text-red-500 border-red-900/40 hover:bg-red-500 hover:text-white' : 'bg-red-50 text-red-500 border-red-100 hover:bg-red-500 hover:text-white'}`} title="Supprimer"><Trash2 size={16} className="md:w-[18px]" /></button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )
        }
      </main >
    </div >
  );
}