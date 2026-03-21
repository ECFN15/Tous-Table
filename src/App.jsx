import React, { useState, useEffect, useRef } from 'react';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import {
  onSnapshot, collection, doc, deleteDoc, serverTimestamp, addDoc, query, getDocs, writeBatch
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions'; // Added for logUserConnection
// Auth imports removed (handled in Context)
import {
  Hammer, LogOut, ShieldCheck, Menu, Eye, EyeOff, ShoppingBag, Sun, Moon, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- IMPORTS CONFIG & UTILS ---
import { db, appId, functions, googleProvider } from './firebase/config';
import { getMillis } from './utils/time';
import { useLiveTheme } from './hooks/useLiveTheme'; // Import hook for forcedMode check

import AppRouter from './Router';
import ErrorBoundary from './components/shared/ErrorBoundary';
import CartSidebar from './components/cart/CartSidebar';
import Footer from './components/layout/Footer';
import SEO from './components/shared/SEO';
import AnalyticsProvider from './components/shared/AnalyticsProvider';
import { ToastProvider, useToast } from './components/ui/Toast';


import MarketplaceDiscovery from './components/home/MarketplaceDiscovery';
import ArchitecturalHeader from './designs/architectural/components/ArchitecturalHeader';
import NewsletterModal from './components/auth/NewsletterModal';
import GlobalMenu from './components/layout/GlobalMenu';

const AppContent = () => {
  const toast = useToast();

  // Use Auth Context
  const { user, isAdmin, loading: authLoading, loginWithGoogle, loginWithEmail, signupWithEmail, logout, verifyEmail } = useAuth();

  const [items, setItems] = useState([]);
  const [boardItems, setBoardItems] = useState([]); // New: Planches
  const [contactInfo, setContactInfo] = useState({});


  const [showMarketplacePopup, setShowMarketplacePopup] = useState(false);
  const footerRef = useRef(null);
  const hasTriggeredPopup = useRef(false);
  const hasViewedProduct = useRef(false); // [NEWSLETTER] Track if user visited at least one product detail





  // --- iOS viewport height fix (--vh variable for reliable 100vh) ---
  useEffect(() => {
    const setVh = () => {
      document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
    };
    setVh();
    window.addEventListener('resize', setVh);
    window.addEventListener('orientationchange', setVh);
    return () => {
      window.removeEventListener('resize', setVh);
      window.removeEventListener('orientationchange', setVh);
    };
  }, []);

  // Fetch Contact Info for Menu
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'sys_metadata', 'contact_info'), (snap) => {
      if (snap.exists()) setContactInfo(snap.data());
    });
    return () => unsub();
  }, []);

  // Cart State
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartInteracted, setCartInteracted] = useState(false); // Prevents initial flash
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [stockAlert, setStockAlert] = useState(null); // { currentStock: number }

  // Navigation
  const [view, setView] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      if (['gallery', 'login', 'admin', 'my-orders', 'checkout'].includes(hash)) return hash;
      const params = new URLSearchParams(window.location.search);
      if (params.get('page') === 'gallery') return 'gallery';
    }
    return 'home';
  }); // 'home', 'gallery', 'detail', 'login', 'admin'
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSecretGateOpen, setIsSecretGateOpen] = useState(false);
  const [showFullLogin, setShowFullLogin] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showAuthSuccess, setShowAuthSuccess] = useState(false);
  const [showNewsletter, setShowNewsletter] = useState(false);
  const [pendingItem, setPendingItem] = useState(null);
  const scrollYRef = useRef(0);

  // iOS-safe body scroll lock for modals
  useEffect(() => {
    const anyModalOpen = showFullLogin || showOrderSuccess || stockAlert;
    if (anyModalOpen) {
      scrollYRef.current = window.scrollY;
      document.body.classList.add('modal-open');
      document.body.style.top = `-${scrollYRef.current}px`;
    } else {
      document.body.classList.remove('modal-open');
      document.body.style.top = '';
      window.scrollTo(0, scrollYRef.current);
    }
    return () => {
      document.body.classList.remove('modal-open');
      document.body.style.top = '';
    };
  }, [showFullLogin, showOrderSuccess, stockAlert]);

  // Admin State
  const [adminCollection, setAdminCollection] = useState('dashboard'); // 'dashboard' | 'furniture' | 'cutting_boards' | 'orders'

  // Transition State
  const [isPreparingGallery, setIsPreparingGallery] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);



  const startGalleryTransition = () => {
    setIsPreparingGallery(true);
    setIsTransitioning(true);
  };

  const completeGalleryTransition = () => {
    // We swap the view while the curtain is opaque
    setView('gallery');
    setIsPreparingGallery(false);
    window.scrollTo(0, 0);

    // Lift the curtain after a short delay to ensure rendering
    setTimeout(() => {
      setIsTransitioning(false);
    }, 200);
  };

  // Deep Linking State
  const [pendingDeepLink, setPendingDeepLink] = useState(null);

  // Header Props for Architectural Design
  const [headerProps, setHeaderProps] = useState(null);

  // [NEW] Persistent Gallery State (To restore collection after detail/checkout)
  const [persistentGalleryState, setPersistentGalleryState] = useState({
    activeCollection: 'furniture',
    filter: 'fixed'
  });

  const saveGalleryState = React.useCallback((state) => {
    setPersistentGalleryState(prev => ({ ...prev, ...state }));
  }, []);

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

  const { forcedMode, activeDesignId } = useLiveTheme(darkMode);

  // Effective Dark Mode Logic (Sync State)
  useEffect(() => {
    if (forcedMode === 'dark') {
      setDarkMode(true);
    } else if (forcedMode === 'light') {
      setDarkMode(false);
    }
  }, [forcedMode]);

  // Apply dark mode class to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  // Marketplace Discovery Trigger (STRICTEMENT sur Accueil - Au Footer)
  useEffect(() => {
    // 1. Si déjà vu, on sort
    const alreadySeen = localStorage.getItem('hasSeenMarketplacePopup');
    if (alreadySeen) return;

    // 2. Uniquement sur la page d'accueil (Home)
    if (view !== 'home') return;

    // 3. Trigger au scroll (proche du bas / après FAQ)
    let scrollHandler = null;
    const timer = setTimeout(() => {
      scrollHandler = () => {
        const scrollPosition = window.scrollY + window.innerHeight;
        const pageHeight = document.documentElement.scrollHeight;
        const triggerPoint = pageHeight - 400; // Proche du footer/après FAQ

        if (scrollPosition > triggerPoint && view === 'home') {
          console.log('MARKETPLACE POPUP TRIGGERED (bottom of home)');
          setShowMarketplacePopup(true);
          localStorage.setItem('hasSeenMarketplacePopup', 'true');
          window.removeEventListener('scroll', scrollHandler);
        }
      };
      window.addEventListener('scroll', scrollHandler, { passive: true });
    }, 2000);

    return () => {
      clearTimeout(timer);
      if (scrollHandler) window.removeEventListener('scroll', scrollHandler);
    };
  }, [view]);


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
  // --- CHARGEMENT DONNÉES PUBLIQUES (Stable) ---
  useEffect(() => {
    // 1. Meubles (Données)
    const unsubData = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'furniture'), (snap) => {
      setItems(snap.docs.map(d => ({ id: d.id, collectionName: 'furniture', ...d.data() })).sort((a, b) => getMillis(b.createdAt) - getMillis(a.createdAt)));
    }, (error) => {
      console.error("Erreur lecture meubles:", error);
    });

    // 2. Planches (Données)
    const unsubBoards = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'cutting_boards'), (snap) => {
      setBoardItems(snap.docs.map(d => ({ id: d.id, collectionName: 'cutting_boards', ...d.data() })).sort((a, b) => getMillis(b.createdAt) - getMillis(a.createdAt)));
    }, (error) => {
      console.error("Erreur lecture planches:", error);
    });

    return () => { unsubData(); unsubBoards(); };
  }, []); // Dépendances vides pour éviter le re-subscribe fréquent

  // --- LOGIQUE ROUTING & AUTH (Dépend du User) ---
  useEffect(() => {
    // Logic dependent on user/auth state
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('product');
    const hash = window.location.hash.replace('#', '');

    // --- SECURITY LOG (IP CAPTURE) ---
    if (user && !user.isAnonymous) {
      // We fire and forget. The backend handles rate limiting or lightweight updates.
      httpsCallable(functions, 'logUserConnection')().catch(e => console.error("SecLog Error", e));
    }

    // --- STRIPE SUCCESS HANDLING ---
    if (params.get('order_success') === 'true' && user && !user.isAnonymous) {

      const clearCartAfterStripe = async () => {
        // 1. Déclencher l'UI succès immédiatement
        setShowOrderSuccess(true);
        setView('gallery');

        // 2. Nettoyer l'URL pour éviter de re-déclencher au F5
        window.history.replaceState({}, document.title, '/?page=gallery#gallery');

        // 3. Vider le panier Firestore réellement
        try {
          const cartRef = collection(db, 'users', user.uid, 'cart');
          const snapshot = await getDocs(cartRef);

          const batch = writeBatch(db);
          snapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
          });
          await batch.commit();

          // Mettre à jour l'état local aussi pour être sûr
          setCartItems([]);

        } catch (e) {
          console.error("Erreur nettoyage panier post-paiement:", e);
        }
      };

      clearCartAfterStripe();
    }
    // -------------------------------


    if (params.get('admin') === 'true' || window.location.pathname === '/admin' || hash === 'admin') {
      setIsSecretGateOpen(true);
      if (isAdmin) setView('admin'); else setView('login');
    } else if (productId) {
      setPendingDeepLink(productId);
    } else {
      if (params.get('page') === 'gallery' || hash === 'gallery') setView('gallery');
    }
    setLoading(false);

  }, [user, isAdmin]); // Re-run when auth state changes

  // --- [NEWSLETTER] Track product detail visits ---
  useEffect(() => {
    if (view === 'detail') {
      hasViewedProduct.current = true;
    }
  }, [view]);

  // --- DECLENCHEMENT POPUP V2 (After first product visit) ---
  // Strategy: Only trigger AFTER the user has viewed at least one product and returned to gallery.
  // This is much less aggressive - the user has already shown engagement.
  useEffect(() => {
    const isNewsletterSubscribed = localStorage.getItem('newsletterSubscribed') === 'true';
    const isNewsletterDismissed = localStorage.getItem('newsletterDismissed') === 'true';

    if (
      view === 'gallery' && 
      hasViewedProduct.current &&  // Must have viewed at least one product
      (!user || user.isAnonymous) && 
      !authLoading && 
      !hasTriggeredPopup.current &&
      !isNewsletterSubscribed &&
      !isNewsletterDismissed
    ) {
      hasTriggeredPopup.current = true;
      const timer = setTimeout(() => {
        setShowNewsletter(true);
      }, 2000); // 2s delay after return for smooth UX
      return () => clearTimeout(timer);
    }
  }, [view, user, authLoading]);

  // --- PERSISTANCE NAVIGATION (HASH & URL) ---
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (['home', 'gallery', 'admin', 'login', 'my-orders'].includes(hash)) {
        setView(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Synchronisation URL <-> View State
  useEffect(() => {
    if (view === 'detail' && selectedItemId) {
      // Mode Produit : On affiche l'ID dans l'URL pour le partage
      const newUrl = `/?product=${selectedItemId}`;
      if (window.location.search !== `?product=${selectedItemId}`) {
        window.history.pushState({ view: 'detail', itemId: selectedItemId }, '', newUrl);
      }
    } else if (view !== 'detail' && view !== 'home') {
      // Autres vues : On utilise le hash (ex: #gallery)
      // On nettoie les query params si on sort du détail
      if (window.location.search.includes('product=')) {
        const cleanUrl = `${window.location.pathname}#${view}`;
        window.history.pushState({ view }, '', cleanUrl);
      } else {
        window.location.hash = view;
      }
    } else if (view === 'home') {
      // Home : Clean URL
      if (window.location.hash || window.location.search) {
        window.history.replaceState(null, null, ' ');
      }
    }
  }, [view, selectedItemId]);

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

  // --- AUTO-ADD PENDING ITEM AFTER LOGIN ---
  useEffect(() => {
    if (user && !user.isAnonymous && pendingItem) {
      console.log("Adding pending item to cart after login:", pendingItem.name);
      addToCart(pendingItem);
      setPendingItem(null);
    }
  }, [user, pendingItem]);

  // --- ACTIONS ---
  // Admin actions moved to Router.jsx

  const handleSocialLogin = async (provider) => {
    // For now we only support Google via context helper
    try {
      await loginWithGoogle();
      setShowFullLogin(false);
    } catch (e) { console.error(e); }
  };

  // --- CART ACTIONS ---
  const addToCart = async (item) => {
    // console.log("Add to cart clicked", user);
    if (!user || user.isAnonymous) {
      // console.log("User is not logged in or anonymous, showing login modal");
      setPendingItem(item); // Store for after login
      setShowFullLogin(true);
      return false;
    }

    // [NEW] Check Stock Limit
    const currentStock = item.stock !== undefined ? Number(item.stock) : 1;
    const inCartCount = cartItems.filter(c => c.originalId === item.id).length;

    if (inCartCount >= currentStock) {
      setStockAlert({ currentStock });
      return false;
    }

    const cartItemData = {
      originalId: item.id,
      collectionName: item.collectionName || 'furniture', // [NEW] Save collection
      name: item.name,
      price: item.currentPrice || item.startingPrice,
      image: item.images?.[0] || item.imageUrl,
      material: item.material || 'Bois',
      quantity: 1, // [FIX] Required by Firestore Rules
      addedAt: serverTimestamp()
    };


    try {
      await addDoc(collection(db, 'users', user.uid, 'cart'), cartItemData);
      setCartInteracted(true);
      setIsCartOpen(true);
      return true;
    } catch (e) {
      console.error("Error add cart", e);
      toast("Erreur ajout panier : " + e.message, { type: 'error' });
      return false;
    }
  };

  const removeFromCart = async (cartDocId) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'cart', cartDocId));
  };

  const handlePlaceOrder = async (orderData) => {
    if (!user) return;

    // 1. Create Order - REMOVED (Handled by Cloud Function createOrder)
    // The order is securely created server-side to manage stock transactions.
    // We just need to clear the local cart now.

    // 2. Clear Cart (Batch)
    // Note: In a real app we would use a batch, but loop is fine for small carts
    // We already have cartItems in state
    for (const item of cartItems) {
      await deleteDoc(doc(db, 'users', user.uid, 'cart', item.id));
    }

    // 3. Handle Payment Redirect or Success
    setCartItems([]); // Clear UI cart immediately
    setIsCartOpen(false);
    setShowOrderSuccess(true); // Trigger Success Modal

    // Restore gallery state if we have it
    if (persistentGalleryState) {
      setHeaderProps(prev => ({
        ...prev,
        activeCollection: persistentGalleryState.activeCollection,
        filter: persistentGalleryState.filter
      }));
    }

    setView('gallery'); // Go to Marketplace (behind the modal)

    // Email simulation log
    console.log("Order placed restoration:", persistentGalleryState, orderData);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-transparent"><div className="w-10 h-10 border-[3px] border-stone-200 border-t-stone-900 rounded-full animate-spin"></div></div>;

  // Active Admin List



  // Active Admin List
  const currentAdminItems = adminCollection === 'furniture' ? items : boardItems;
  // Cart Total
  const cartTotal = cartItems.reduce((sum, item) => sum + (item.price || 0), 0);

  return (
    <div className={`min-h-screen font-sans selection:bg-stone-300 transition-colors duration-700 ${darkMode ? 'bg-[#0A0A0A] text-stone-200' : 'bg-[#FAFAF9] text-stone-900'}`}>
      <SEO />
      <AnalyticsProvider
        view={view}
        selectedItemId={selectedItemId}
        selectedItemName={items.concat(boardItems).find(i => i.id === selectedItemId)?.name}
        selectedItemPrice={items.concat(boardItems).find(i => i.id === selectedItemId)?.currentPrice || items.concat(boardItems).find(i => i.id === selectedItemId)?.startingPrice}
      />

      {/* RIDEAU DE TRANSITION GLOBAL (Masque le switch de page) */}
      <div
        className={`fixed inset-0 z-[2000] pointer-events-none transition-opacity duration-400 ease-in-out ${isTransitioning ? 'opacity-100' : 'opacity-0'}`}
        style={{ backgroundColor: darkMode ? '#0A0A0A' : '#FAFAF9' }}
      ></div>

      {loading && <div className="fixed inset-0 z-[999] flex items-center justify-center bg-transparent"><div className="w-10 h-10 border-[3px] border-stone-200 border-t-stone-900 rounded-full animate-spin"></div></div>}

      {/* COMPOSANT PANIER - Global (Disponible dès que la navbar est visible) */}
      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onRemoveItem={removeFromCart}
        totalPrice={cartTotal}
        onCheckout={() => { setIsCartOpen(false); setView('checkout'); window.scrollTo(0, 0); }}
        interacted={cartInteracted}
        darkMode={darkMode}
        activeDesignId={activeDesignId}
      />

      {/* MODAL NEWSLETTER */}
      <NewsletterModal
        showNewsletter={showNewsletter}
        setShowNewsletter={setShowNewsletter}
      />

      {/* MODAL LOGIN (Pour la Marketplace) */}
      {showFullLogin && (
        <div
          className="fixed inset-0 z-[200] bg-stone-900/60 backdrop-blur-md flex items-center justify-center p-4 md:p-6"
          onClick={(e) => { if (e.target === e.currentTarget) setShowFullLogin(false); }}
        >
          <div className="bg-white p-6 md:p-10 rounded-3xl md:rounded-[2.5rem] shadow-2xl max-w-sm w-full text-center space-y-4 md:space-y-6 animate-in zoom-in-95 relative overflow-hidden max-h-[85dvh] overflow-y-auto ios-modal-scroll">

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
                      const userCredential = await signupWithEmail(email, pass);
                      await verifyEmail(userCredential.user);
                      setShowAuthSuccess(true);
                    } else {
                      await loginWithEmail(email, pass);
                      setShowFullLogin(false);
                    }
                  } catch (err) {
                    let msg = "Une erreur est survenue.";
                    if (err.code === 'auth/email-already-in-use') msg = "Cet email est déjà associé à un compte. Connectez-vous.";
                    else if (err.code === 'auth/weak-password') msg = "Le mot de passe doit contenir au moins 6 caractères.";
                    else if (err.code === 'auth/invalid-email') msg = "L'adresse email n'est pas valide.";
                    else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') msg = "Email ou mot de passe incorrect.";

                    toast(msg, { type: 'error' });
                  }
                }} className="space-y-3 pt-2" data-signup="false">

                  <input name="email" type="email" placeholder="Adresse email" className="w-full p-4 rounded-xl bg-stone-50 border border-stone-200 font-bold text-base outline-none focus:ring-2 ring-stone-900 transition-all text-stone-900 placeholder:text-stone-300" required autoComplete="email" />

                  <div className="relative">
                    <input name="password" type={showPassword ? "text" : "password"} placeholder="Mot de passe" className="w-full p-4 rounded-xl bg-stone-50 border border-stone-200 font-bold text-base outline-none focus:ring-2 ring-stone-900 transition-all text-stone-900 placeholder:text-stone-300" required autoComplete="current-password" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-900">
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>

                  <div id="confirm-pass-container" className="hidden transition-all duration-300 overflow-hidden" style={{ maxHeight: '0px' }}>
                    <div className="relative mb-3">
                      <input name="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="Confirmer mot de passe" className="w-full p-4 rounded-xl bg-stone-50 border border-stone-200 font-bold text-base outline-none focus:ring-2 ring-stone-900 transition-all text-stone-900 placeholder:text-stone-300" autoComplete="new-password" />
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
      {/* --- MENU GLOBAL (Toujours disponible sauf Home) --- */}
      {view !== 'home' && (
        <GlobalMenu
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
          setView={setView}
          user={user}
          isAdmin={isAdmin}
          darkMode={darkMode}
          activeDesignId={activeDesignId}
          contactInfo={contactInfo}
        />
      )}

      {/* --- NAVBAR GLOBALE --- */}
      {view !== 'home' && (
        <>
          {activeDesignId === 'architectural' ? (
            <ArchitecturalHeader
              headerProps={headerProps}
              user={user}
              onShowLogin={() => setShowFullLogin(true)}
              onOpenMenu={() => setIsMenuOpen(true)}
              onOpenCart={() => { setCartInteracted(true); setIsCartOpen(true); }}
              cartCount={cartItems.length}
              toggleTheme={() => setDarkMode(!darkMode)}
              darkMode={darkMode}
              onBack={view === 'detail' ? () => setView('gallery') : null}
            />
          ) : (
            <nav className={`fixed top-0 left-0 right-0 z-[110] px-4 md:px-12 pt-[max(4.5rem,env(safe-area-inset-top)+2rem)] pb-4 md:py-8 flex justify-between items-center transition-all duration-500 ease-in-out ${isHeaderVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}`}>
              <div className="flex items-center gap-1.5 md:gap-3 cursor-pointer group" onClick={() => { window.hasShownPreloader = true; setView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                <div className={`w-[28px] h-[28px] md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center backdrop-blur-2xl border transition-all group-hover:rotate-6 shadow-sm ${darkMode ? 'bg-white/10 border-white/20 text-white' : 'bg-white border-stone-300 text-stone-900'}`}>
                  <Hammer size={12} strokeWidth={1.5} className="md:w-4 md:h-4" />
                </div>
                <div className="flex flex-col justify-center">
                  <h1 className={`text-[13px] md:text-lg font-bold uppercase tracking-tight md:tracking-widest leading-none transition-colors ${darkMode ? 'text-white' : 'text-stone-900 shadow-stone-200/50'}`}>Tous à Table</h1>
                  <p className={`font-serif italic text-[11px] md:text-[14px] tracking-[0.05em] md:tracking-[0.1em] leading-none mt-0.5 md:mt-1 ml-0.5 transition-colors ${darkMode ? 'text-white/80' : 'text-stone-600'}`}>Atelier Normand</p>
                </div>
              </div>

              <div className={`flex items-center gap-1 md:gap-4 ${darkMode ? 'text-white' : 'text-stone-900'}`}>
                {user && !user.isAnonymous ? (
                  <div className="flex items-center gap-1.5 md:gap-4 mr-0.5 md:mr-2">
                    <div className="text-right hidden md:block">
                      <div className="flex items-center justify-end gap-2">
                        <p className={`text-[10px] font-black uppercase tracking-widest ${darkMode ? 'text-white' : 'text-stone-900'}`}>{user.displayName || 'Client'}</p>
                        {user.emailVerified && <ShieldCheck size={14} strokeWidth={3} className={darkMode ? 'text-white' : 'text-stone-900'} title="Compte Vérifié" />}
                      </div>
                    </div>
                    <button onClick={() => { logout(); }} className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center backdrop-blur-2xl border shadow-xl transition-all ${darkMode ? 'bg-white/10 border-white/20 text-white hover:bg-white hover:text-stone-900 shadow-white/5' : 'bg-white border-stone-200 text-stone-900 hover:bg-stone-900 hover:text-white shadow-stone-200/50'}`}><LogOut size={12} className="md:w-[15px] md:h-[15px]" /></button>
                  </div>
                ) : !isSecretGateOpen && (
                  <button onClick={() => setShowFullLogin(true)} className={`flex items-center gap-2 px-3 py-2 md:px-5 md:py-2.5 rounded-full backdrop-blur-2xl border shadow-xl transition-all text-[9.5px] md:text-[11px] font-bold uppercase tracking-widest mr-0.5 md:mr-2 ${darkMode ? 'bg-white/10 border-white/20 text-white hover:bg-white hover:text-stone-900 shadow-white/5' : 'bg-white border-stone-200 text-stone-900 hover:bg-stone-900 hover:text-white shadow-stone-200/50'}`}><ShieldCheck size={12} className="md:w-3.5 md:h-3.5" /> <span className="hidden md:inline">Connexion</span></button>
                )}

                {/* CART BUTTON - Uniquement sur marketplace, detail et checkout */}
                {['gallery', 'detail', 'checkout'].includes(view) && (
                  <button
                    onClick={() => { setCartInteracted(true); setIsCartOpen(true); }}
                    className={`w-8 h-8 md:w-auto md:h-auto px-0 md:px-5 md:py-2.5 rounded-full flex items-center justify-center gap-2.5 backdrop-blur-2xl border shadow-xl transition-all group relative ${darkMode ? 'bg-white/15 border-white/20 text-white hover:bg-amber-500 hover:text-white shadow-white/5' : 'bg-white border-stone-200 text-stone-900 hover:bg-amber-500 hover:text-white shadow-stone-200/50'}`}
                  >
                    <ShoppingBag size={14} className="md:w-[15px] md:h-[15px]" />
                    <span className="hidden md:block text-[9.5px] md:text-[11px] font-bold uppercase tracking-widest">Panier</span>
                    {cartItems.length > 0 && (
                      <span className="absolute -top-1 -right-1 md:top-1 md:right-1 w-3 h-3 md:w-4 md:h-4 bg-amber-500 text-white flex items-center justify-center text-[7px] md:text-[9px] font-black rounded-full border border-white shadow-md">
                        {cartItems.length}
                      </span>
                    )}
                  </button>
                )}

                {/* DARK MODE TOGGLE */}
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center backdrop-blur-2xl border shadow-xl transition-all ml-0.5 md:ml-0 ${darkMode ? 'bg-white/15 border-white/20 text-white hover:bg-amber-500 hover:text-white shadow-white/5' : 'bg-white border-stone-200 text-stone-900 hover:bg-amber-500 hover:text-white shadow-stone-200/50'}`}
                  title={darkMode ? 'Mode Clair' : 'Mode Sombre'}
                >
                  {darkMode ? <Sun size={12} className="md:w-[15px] md:h-[15px]" /> : <Moon size={12} className="md:w-[15px] md:h-[15px]" />}
                </button>

                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={`relative w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center backdrop-blur-2xl border shadow-xl group transition-all ml-0.5 md:ml-0 ${darkMode ? 'bg-white/10 border-white/20 hover:bg-white shadow-white/5' : 'bg-white border-stone-200 hover:bg-stone-900 shadow-stone-200/50'}`}>
                  <Menu size={14} className={`absolute md:w-[15px] md:h-[15px] transition-all duration-500 ease-in-out ${darkMode ? 'text-white group-hover:text-stone-900' : 'text-stone-900 group-hover:text-white'} ${isMenuOpen ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'}`} />
                  <X size={14} className={`absolute md:w-[15px] md:h-[15px] transition-all duration-500 ease-in-out ${darkMode ? 'text-white group-hover:text-stone-900' : 'text-stone-900 group-hover:text-white'} ${isMenuOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'}`} />
                </button>
              </div>
            </nav>
          )}
        </>
      )
      }

      {/* --- CONTENU PRINCIPAL --- */}
      <main>
        <AppRouter
          view={view}
          setView={setView}
          items={items}
          boardItems={boardItems}
          isPreparingGallery={isPreparingGallery}
          startGalleryTransition={startGalleryTransition}
          completeGalleryTransition={completeGalleryTransition}
          darkMode={darkMode}
          activeDesignId={activeDesignId}
          isSecretGateOpen={isSecretGateOpen}
          setShowFullLogin={setShowFullLogin}
          setSelectedItemId={setSelectedItemId}
          selectedItemId={selectedItemId}
          addToCart={addToCart}
          cartItems={cartItems}
          cartTotal={cartTotal}
          handlePlaceOrder={handlePlaceOrder}
          showOrderSuccess={showOrderSuccess}
          setShowOrderSuccess={setShowOrderSuccess}
          adminCollection={adminCollection}
          setAdminCollection={setAdminCollection}
          editingItem={editingItem}
          setEditingItem={setEditingItem}
          onOpenMenu={() => setIsMenuOpen(true)}
          onOpenCart={() => { setCartInteracted(true); setIsCartOpen(true); }}
          toggleTheme={() => setDarkMode(!darkMode)}
          onOpenDiscovery={() => setShowMarketplacePopup(true)}
          setHeaderProps={setHeaderProps}
          persistentGalleryState={persistentGalleryState}
          saveGalleryState={saveGalleryState}
        />
      </main>
      {
        ['home', 'gallery', 'detail', 'checkout', 'my-orders'].includes(view) && (
          <div ref={footerRef}>
            <Footer darkMode={darkMode} />
          </div>
        )
      }

      {/* Global Popups */}
      <MarketplaceDiscovery
        isOpen={showMarketplacePopup}
        onClose={() => setShowMarketplacePopup(false)}
        onExplore={() => {
          setShowMarketplacePopup(false);
          startGalleryTransition();
          setTimeout(() => {
            completeGalleryTransition();
          }, 800);
        }}
      />

      {/* MODAL STOCK INSUFFISANT (Premium UI) */}
      <AnimatePresence>
        {stockAlert && (
          <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 md:p-6 bg-stone-900/40 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className={`max-w-md w-full p-8 md:p-12 rounded-[2.5rem] shadow-2xl text-center space-y-8 relative overflow-hidden ${darkMode ? 'bg-stone-800' : 'bg-white'}`}
            >
              <div className="w-20 h-20 bg-amber-500/10 rounded-[2rem] flex items-center justify-center text-amber-500 mx-auto border border-amber-500/20 shadow-inner">
                <AlertTriangle size={40} className="animate-pulse" />
              </div>

              <div className="space-y-4">
                <h3 className="text-2xl md:text-4xl font-black tracking-tighter">Stock insuffisant</h3>
                <div className="w-12 h-1 bg-amber-500 mx-auto rounded-full opacity-30"></div>
                <p className={`text-base md:text-lg font-medium leading-relaxed px-4 ${darkMode ? 'text-stone-300' : 'text-stone-500'}`}>
                  Il ne reste que <strong className={darkMode ? 'text-amber-400' : 'text-stone-900'}>{stockAlert.currentStock} exemplaire(s)</strong> disponible(s) pour cette pièce unique.
                </p>
              </div>

              <button
                onClick={() => setStockAlert(null)}
                className="w-full py-5 bg-stone-950 text-white dark:bg-white dark:text-stone-900 rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-3 group"
              >
                <span>J'ai compris</span>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div >
  );
};
// Wrapper to provide Context
// Wrapper to provide Context
export default function App() {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </ErrorBoundary>
    </AuthProvider>
  );
}