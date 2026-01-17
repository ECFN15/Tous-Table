import React, { useState, useEffect } from 'react';
import {
  onSnapshot, collection, doc, updateDoc, deleteDoc
} from 'firebase/firestore';
import {
  onAuthStateChanged, signInAnonymously, signOut, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification
} from 'firebase/auth';
import {
  Hammer, LogOut, ShieldCheck, Menu, X, Instagram, Mail, User, Eye, EyeOff, Pencil, Trash2, Trophy
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

export default function App() {
  // États Globaux
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [items, setItems] = useState([]);

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

  // --- CHARGEMENT ---
  useEffect(() => {
    // 1. Meubles (Données)
    const unsubData = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'furniture'), (snap) => {
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => getMillis(b.createdAt) - getMillis(a.createdAt)));
    });

    // 2. Auth (Utilisateur)
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      const isRealAdmin = u && !u.isAnonymous && u.providerData.some(p => p.providerId === 'password');
      setIsAdmin(isRealAdmin);

      const params = new URLSearchParams(window.location.search);
      if (params.get('admin') === 'true') {
        setIsSecretGateOpen(true);
        if (isRealAdmin) setView('admin'); else setView('login');
      } else {
        if (params.get('page') === 'gallery') setView('gallery');

        if (!u) {
          signInAnonymously(auth).catch(err => console.error(err));
        }
      }
      setLoading(false);
    });

    return () => { unsubData(); unsubAuth(); };
  }, []);

  // --- ACTIONS ---
  const handleToggleStatus = async (item) => {
    try { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'furniture', item.id), { status: item.status === 'published' ? 'draft' : 'published' }); } catch (e) { console.error(e); }
  };
  const handleDeleteItem = async (id) => {
    if (!confirm("Supprimer ?")) return;
    try { await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'furniture', id)); } catch (e) { console.error(e); }
  };
  const handleSocialLogin = async (provider) => {
    try { await signInWithPopup(auth, provider); setShowFullLogin(false); } catch (e) { console.error(e); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]"><div className="w-10 h-10 border-[3px] border-stone-200 border-t-stone-900 rounded-full animate-spin"></div></div>;

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-stone-900 font-sans overflow-x-hidden selection:bg-amber-100">

      {/* MODAL LOGIN (Pour la Marketplace) */}
      {showFullLogin && (
        <div className="fixed inset-0 z-[100] bg-stone-900/60 backdrop-blur-md flex items-center justify-center p-4">
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
            <div className={`absolute right-0 top-0 bottom-0 w-full md:w-[450px] bg-white shadow-2xl transition-transform duration-700 ease-expo p-12 flex flex-col justify-between ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
              <div className="space-y-20">
                <div className="flex justify-between items-center"><span className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-300">Menu</span><button onClick={() => setIsMenuOpen(false)} className="w-12 h-12 rounded-full border border-stone-100 flex items-center justify-center hover:bg-stone-50"><X size={20} /></button></div>
                <nav className="flex flex-col gap-10">
                  <button onClick={() => { setView('home'); setIsMenuOpen(false); window.scrollTo(0, 0); }} className="text-5xl font-black tracking-tighter hover:text-amber-600 transition-all text-left">Accueil.</button>
                  <button onClick={() => { setView('gallery'); setIsMenuOpen(false); window.scrollTo(0, 0); }} className="text-5xl font-black tracking-tighter hover:text-amber-600 transition-all text-left">Marketplace.</button>
                  {isAdmin && <button onClick={() => { setView('admin'); setIsMenuOpen(false); window.scrollTo(0, 0); }} className="text-5xl font-black tracking-tighter hover:text-stone-300 transition-all text-left opacity-30">Admin.</button>}
                </nav>
              </div>
              <div className="space-y-6 pt-10 border-t border-stone-100">
                {user && !user.isAnonymous && (
                  <div className="mb-4">
                    <p className="text-xs font-bold text-stone-900 flex items-center gap-2">
                      {user.displayName || user.email}
                      {user.emailVerified && <span className="text-blue-500 text-[10px] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">Vérifié</span>}
                    </p>
                    <p className="text-[10px] text-stone-400 uppercase tracking-widest">Connecté</p>
                  </div>
                )}
                <div className="flex gap-6">
                  <a href="#" className="w-12 h-12 rounded-full bg-stone-50 flex items-center justify-center hover:bg-stone-900 hover:text-white transition-all"><Instagram size={20} /></a>
                  <a href="mailto:contact@tat.fr" className="w-12 h-12 rounded-full bg-stone-50 flex items-center justify-center hover:bg-stone-900 hover:text-white transition-all"><Mail size={20} /></a>
                </div>
              </div>
            </div>
          </div>

          {/* NAVBAR GLOBALE */}
          <nav className="fixed top-0 left-0 right-0 z-[100] px-4 md:px-12 py-6 md:py-8 flex justify-between items-center mix-blend-difference text-white transition-all duration-300">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => { setView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
              <div className="bg-white text-stone-900 p-1.5 rounded-lg shadow-md group-hover:rotate-6 transition-all"><Hammer size={20} /></div>
              <div><h1 className="text-lg font-black uppercase tracking-tighter leading-none">Tous à Table</h1><p className="text-[7px] font-black tracking-[0.3em] uppercase opacity-60">Atelier Normand</p></div>
            </div>

            <div className="flex items-center gap-4">
              {user && !user.isAnonymous ? (
                <div className="flex items-center gap-4 mr-2">
                  <div className="text-right hidden md:block">
                    <div className="flex items-center justify-end gap-2">
                      <p className="text-[10px] font-black uppercase tracking-widest">{user.displayName || 'Client'}</p>
                      {user.emailVerified && <ShieldCheck size={14} strokeWidth={3} title="Compte Vérifié" />}
                    </div>
                  </div>
                  <button onClick={() => { signOut(auth); setView('home'); }} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white hover:text-stone-900 backdrop-blur border border-white/20 transition-all"><LogOut size={16} /></button>
                </div>
              ) : !isSecretGateOpen && (
                <button onClick={() => setShowFullLogin(true)} className="flex items-center gap-2 px-5 py-3 rounded-full bg-white/10 backdrop-blur border border-white/20 hover:bg-white hover:text-stone-900 transition-all text-[10px] font-black uppercase tracking-widest mr-2"><ShieldCheck size={14} /> <span>Login</span></button>
              )}
              <button onClick={() => setIsMenuOpen(true)} className="w-10 h-10 md:w-auto md:h-auto md:px-6 md:py-3 rounded-full bg-white/10 flex items-center justify-center gap-4 hover:bg-white hover:text-stone-900 backdrop-blur border border-white/20 group transition-all"><span className="hidden md:block text-[10px] font-black uppercase tracking-widest">Menu</span><Menu size={20} /></button>
            </div>
          </nav>
        </>
      )}

      {/* --- CONTENU PRINCIPAL --- */}
      <main>
        {/* VUE: ACCUEIL */}
        {view === 'home' && (
          <HomeView onEnterMarketplace={() => { setView('gallery'); window.scrollTo(0, 0); }} />
        )}

        {/* VUE: GALERIE (MARKETPLACE) */}
        {view === 'gallery' && (
          <GalleryView
            items={items} isAdmin={isAdmin} isSecretGateOpen={isSecretGateOpen} user={user}
            onShowLogin={() => setShowFullLogin(true)}
            onSelectItem={(id) => { setSelectedItemId(id); setView('detail'); window.scrollTo(0, 0); }}
          />
        )}

        {/* VUE: DETAIL PRODUIT */}
        {view === 'detail' && selectedItemId && (
          <div className="pt-32 px-6">
            <ProductDetail item={items.find(i => i.id === selectedItemId)} user={user} onBack={() => { setView('gallery'); setSelectedItemId(null); }} />
          </div>
        )}

        {/* VUE: LOGIN ADMIN */}
        {view === 'login' && isSecretGateOpen && <LoginView onSuccess={() => setView('admin')} />}

        {/* VUE: ADMIN DASHBOARD */}
        {view === 'admin' && isAdmin && (
          <div className="max-w-6xl mx-auto px-4 py-32 space-y-16 animate-in fade-in text-stone-900">
            <div className="flex justify-between items-center border-b border-stone-200/60 pb-8"><h2 className="text-4xl font-black tracking-tighter">Gestion Atelier</h2><button onClick={() => setView('gallery')} className="text-[10px] font-black border-2 border-stone-900 px-6 py-2 rounded-xl hover:bg-stone-900 hover:text-white transition-all">Retour</button></div>

            {/* Formulaire Admin */}
            <AdminForm editData={editingItem} onCancelEdit={() => setEditingItem(null)} />

            {/* Liste Admin */}
            <div className="grid gap-4 pt-10">
              {items.map(item => {
                const isAuctionOver = item.auctionActive && item.auctionEnd && (getMillis(item.auctionEnd) < Date.now());
                const hasWinner = isAuctionOver && item.lastBidderEmail;

                return (
                  <div key={item.id} className="bg-[#FAF9F6] p-5 rounded-[2.5rem] border border-stone-200 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-8">
                        <div className="relative">
                          <img src={item.images?.[0] || item.imageUrl} className="w-20 h-20 rounded-2xl object-cover shadow-sm border border-white" alt="" />
                          {hasWinner && <div className="absolute -top-2 -right-2 bg-amber-400 text-white p-1.5 rounded-full shadow-md border-2 border-white"><Trophy size={14} fill="currentColor" /></div>}
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <span className="font-black text-xl text-stone-900">{item.name}</span>
                            <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${item.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-200 text-stone-500'}`}>
                              {item.status === 'published' ? 'Public' : 'Brouillon'}
                            </span>
                          </div>

                          {hasWinner ? (
                            <div className="flex flex-col gap-1 bg-amber-50 border border-amber-200 px-4 py-2 rounded-xl animate-in slide-in-from-left-4 shadow-sm w-fit">
                              <p className="text-[10px] font-black uppercase tracking-widest text-amber-800 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                Vainqueur
                              </p>
                              <div className="pl-3.5">
                                <p className="text-sm font-bold text-stone-800">{item.lastBidderName}</p>
                                <p className="text-xs text-stone-500 font-mono select-all flex items-center gap-1.5 hover:text-amber-700 transition-colors cursor-pointer" title="Copier">
                                  <Mail size={12} /> {item.lastBidderEmail}
                                </p>
                              </div>
                            </div>
                          ) : item.auctionActive && (
                            <div className="text-xs text-stone-400 font-medium pl-1">
                              Enchère en cours • {item.bidCount || 0} offre(s)
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button onClick={() => { setEditingItem(item); window.scrollTo(0, 0); }} className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-stone-900 shadow-sm border border-stone-100 hover:scale-110 transition-transform"><Pencil size={18} /></button>
                        <button onClick={() => handleToggleStatus(item)} className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm transition-all hover:scale-110 ${item.status === 'published' ? 'bg-emerald-500 text-white shadow-emerald-200' : 'bg-stone-200 text-stone-400'}`}>{item.status === 'published' ? <Eye size={18} /> : <EyeOff size={18} />}</button>
                        <button onClick={() => handleDeleteItem(item.id)} className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center shadow-sm border border-red-100 hover:bg-red-500 hover:text-white hover:scale-110 transition-all"><Trash2 size={18} /></button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}