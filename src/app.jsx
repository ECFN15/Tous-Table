import React, { useState, useEffect } from 'react';
import { 
  onSnapshot, collection, doc, updateDoc, deleteDoc 
} from 'firebase/firestore';
import { 
  onAuthStateChanged, signInAnonymously, signOut, signInWithPopup 
} from 'firebase/auth';
import { 
  Hammer, LogOut, ShieldCheck, Menu, X, Instagram, Mail, User 
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

  // --- CHARGEMENT ---
  useEffect(() => {
    // 1. Meubles (Données)
    const unsubData = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'furniture'), (snap) => {
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => getMillis(b.createdAt) - getMillis(a.createdAt)));
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
      } else if (!u) {
        signInAnonymously(auth).catch(err => console.error(err));
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
              <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl max-w-sm w-full text-center space-y-8 animate-in zoom-in-95">
                  <ShieldCheck size={48} className="mx-auto text-amber-500"/>
                  <h3 className="text-2xl font-black tracking-tight">Vérification</h3>
                  <div className="space-y-3">
                    <button onClick={() => handleSocialLogin(googleProvider)} className="w-full flex items-center justify-center gap-4 bg-stone-900 text-white p-4 rounded-2xl font-bold hover:bg-stone-800 transition-all shadow-lg">Google</button>
                    <div className="grid grid-cols-4 gap-3">
                         <button onClick={() => handleSocialLogin(facebookProvider)} className="p-4 rounded-2xl bg-blue-50 text-blue-600 hover:bg-blue-100 justify-center flex">FB</button>
                         <button onClick={() => handleSocialLogin(appleProvider)} className="p-4 rounded-2xl bg-stone-100 text-stone-900 hover:bg-stone-200 justify-center flex">AP</button>
                         <button onClick={() => handleSocialLogin(twitterProvider)} className="p-4 rounded-2xl bg-sky-50 text-sky-500 hover:bg-sky-100 justify-center flex">Tw</button>
                         <button onClick={() => handleSocialLogin(microsoftProvider)} className="p-4 rounded-2xl bg-orange-50 text-orange-600 hover:bg-orange-100 justify-center flex">Ms</button>
                    </div>
                  </div>
                  <button onClick={() => setShowFullLogin(false)} className="text-[10px] font-black uppercase text-stone-300 hover:text-stone-900">Annuler</button>
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
                      <div className="flex justify-between items-center"><span className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-300">Menu</span><button onClick={() => setIsMenuOpen(false)} className="w-12 h-12 rounded-full border border-stone-100 flex items-center justify-center hover:bg-stone-50"><X size={20}/></button></div>
                      <nav className="flex flex-col gap-10">
                          <button onClick={() => { setView('home'); setIsMenuOpen(false); window.scrollTo(0,0); }} className="text-5xl font-black tracking-tighter hover:text-amber-600 transition-all text-left">Accueil.</button>
                          <button onClick={() => { setView('gallery'); setIsMenuOpen(false); window.scrollTo(0,0); }} className="text-5xl font-black tracking-tighter hover:text-amber-600 transition-all text-left">Marketplace.</button>
                          {isAdmin && <button onClick={() => { setView('admin'); setIsMenuOpen(false); window.scrollTo(0,0); }} className="text-5xl font-black tracking-tighter hover:text-stone-300 transition-all text-left opacity-30">Admin.</button>}
                      </nav>
                  </div>
                  <div className="space-y-6 pt-10 border-t border-stone-100">
                      <div className="flex gap-6">
                          <a href="#" className="w-12 h-12 rounded-full bg-stone-50 flex items-center justify-center hover:bg-stone-900 hover:text-white transition-all"><Instagram size={20}/></a>
                          <a href="mailto:contact@tat.fr" className="w-12 h-12 rounded-full bg-stone-50 flex items-center justify-center hover:bg-stone-900 hover:text-white transition-all"><Mail size={20}/></a>
                      </div>
                  </div>
              </div>
          </div>

          {/* NAVBAR GLOBALE */}
          <nav className="fixed top-0 left-0 right-0 z-[100] px-4 md:px-12 py-6 md:py-8 flex justify-between items-center mix-blend-difference text-white transition-all duration-300">
              <div className="flex items-center gap-3 cursor-pointer group" onClick={() => {setView('home'); window.scrollTo({top:0, behavior:'smooth'});}}>
              <div className="bg-white text-stone-900 p-1.5 rounded-lg shadow-md group-hover:rotate-6 transition-all"><Hammer size={20}/></div>
              <div><h1 className="text-lg font-black uppercase tracking-tighter leading-none">Tous à Table</h1><p className="text-[7px] font-black tracking-[0.3em] uppercase opacity-60">Atelier Normand</p></div>
              </div>
              
              <div className="flex items-center gap-4">
                  {user && !user.isAnonymous ? (
                      <div className="flex items-center gap-4 mr-2">
                          <div className="text-right hidden md:block"><p className="text-[10px] font-black uppercase tracking-widest">{user.displayName || 'Client'}</p></div>
                          <button onClick={() => { signOut(auth); setView('home'); }} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white hover:text-stone-900 backdrop-blur border border-white/20 transition-all"><LogOut size={16}/></button>
                      </div>
                  ) : !isSecretGateOpen && (
                      <button onClick={() => setShowFullLogin(true)} className="flex items-center gap-2 px-5 py-3 rounded-full bg-white/10 backdrop-blur border border-white/20 hover:bg-white hover:text-stone-900 transition-all text-[10px] font-black uppercase tracking-widest mr-2"><ShieldCheck size={14}/> <span>Login</span></button>
                  )}
                  <button onClick={() => setIsMenuOpen(true)} className="w-10 h-10 md:w-auto md:h-auto md:px-6 md:py-3 rounded-full bg-white/10 flex items-center justify-center gap-4 hover:bg-white hover:text-stone-900 backdrop-blur border border-white/20 group transition-all"><span className="hidden md:block text-[10px] font-black uppercase tracking-widest">Menu</span><Menu size={20}/></button>
              </div>
          </nav>
        </>
      )}

      {/* --- CONTENU PRINCIPAL --- */}
      <main>
        {/* VUE: ACCUEIL */}
        {view === 'home' && (
            <HomeView onEnterMarketplace={() => { setView('gallery'); window.scrollTo(0,0); }} />
        )}

        {/* VUE: GALERIE (MARKETPLACE) */}
        {view === 'gallery' && (
          <GalleryView 
            items={items} isAdmin={isAdmin} isSecretGateOpen={isSecretGateOpen} user={user}
            onShowLogin={() => setShowFullLogin(true)}
            onSelectItem={(id) => { setSelectedItemId(id); setView('detail'); window.scrollTo(0,0); }}
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
                {items.map(item => (
                    <div key={item.id} className="bg-white p-4 rounded-[2.5rem] border border-stone-100 flex items-center justify-between shadow-lg">
                      <div className="flex items-center gap-4"><img src={item.images?.[0] || item.imageUrl} className="w-16 h-16 rounded-2xl object-cover" alt="" /><span className="font-black">{item.name}</span></div>
                      <div className="flex gap-2">
                        <button onClick={() => { setEditingItem(item); window.scrollTo(0,0); }} className="w-10 h-10 bg-stone-50 rounded-full flex items-center justify-center hover:bg-stone-900 hover:text-white">✏️</button>
                        <button onClick={() => handleToggleStatus(item)} className="w-10 h-10 bg-stone-50 rounded-full flex items-center justify-center hover:bg-amber-500 hover:text-white">👁️</button>
                        <button onClick={() => handleDeleteItem(item.id)} className="w-10 h-10 bg-red-50 text-red-500 rounded-full flex items-center justify-center hover:bg-red-600 hover:text-white">🗑️</button>
                      </div>
                    </div>
                ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}