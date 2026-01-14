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

// --- IMPORTS DE CONFIGURATION ET UTILITAIRES ---
import { auth, db, appId, googleProvider, facebookProvider, twitterProvider, appleProvider, microsoftProvider } from './firebase/config';
import { getMillis } from './utils/time';

// --- IMPORTS DES VUES (COMPOSANTS) ---
import HomeView from './components/HomeView';
import GalleryView from './components/GalleryView';
import ProductDetail from './components/ProductDetail';
import LoginView from './components/LoginView';
import AdminForm from './components/AdminForm';

// --- COMPOSANT PRINCIPAL ---
export default function App() {
  // États Globaux
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [items, setItems] = useState([]);
  
  // Navigation & UI
  const [view, setView] = useState('home'); // 'home', 'gallery', 'detail', 'login', 'admin'
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSecretGateOpen, setIsSecretGateOpen] = useState(false);
  const [showFullLogin, setShowFullLogin] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // Pour passer l'item à modifier au formulaire admin
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // --- EFFETS (Chargement Données & Auth) ---
  useEffect(() => {
    // 1. Écoute en temps réel des meubles
    const unsubData = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'furniture'), (snap) => {
      setItems(snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a,b) => getMillis(b.createdAt) - getMillis(a.createdAt))
      );
    });

    // 2. Gestion de l'authentification
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      // Admin si connecté ET non anonyme ET méthode password (email/mdp)
      const isRealAdmin = u && !u.isAnonymous && u.providerData.some(p => p.providerId === 'password');
      setIsAdmin(isRealAdmin);
      
      // "Porte dérobée" via URL ?admin=true
      const params = new URLSearchParams(window.location.search);
      if (params.get('admin') === 'true') {
        setIsSecretGateOpen(true);
        if (isRealAdmin) setView('admin'); else setView('login');
      } else if (!u) {
        // Sinon connexion anonyme par défaut pour le public
        signInAnonymously(auth).catch(err => console.error("Erreur auth anonyme", err));
      }
      setLoading(false);
    });

    return () => { unsubData(); unsubAuth(); };
  }, []);

  // --- ACTIONS GLOBALES ---
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

  // --- RENDU ---
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6] text-stone-900">
        <div className="w-10 h-10 border-[3px] border-stone-200 border-t-stone-900 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-stone-900 font-sans selection:bg-amber-100 overflow-x-hidden">
      
      {/* --- MENU LATERAL (OVERLAY) --- */}
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

      {/* --- MODAL LOGIN (VISITEURS) --- */}
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
                    {/* Autres providers sociaux ici si besoin, simplifiés pour la lisibilité */}
                    <div className="grid grid-cols-4 gap-3">
                         <button onClick={() => handleSocialLogin(facebookProvider)} className="p-4 rounded-2xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all flex items-center justify-center shadow-sm">FB</button>
                         <button onClick={() => handleSocialLogin(appleProvider)} className="p-4 rounded-2xl bg-stone-100 text-stone-900 hover:bg-stone-200 transition-all flex items-center justify-center shadow-sm">AP</button>
                         <button onClick={() => handleSocialLogin(twitterProvider)} className="p-4 rounded-2xl bg-sky-50 text-sky-500 hover:bg-sky-100 transition-all flex items-center justify-center shadow-sm">Tw</button>
                         <button onClick={() => handleSocialLogin(microsoftProvider)} className="p-4 rounded-2xl bg-orange-50 text-orange-600 hover:bg-orange-100 transition-all flex items-center justify-center shadow-sm">Ms</button>
                    </div>
                  </div>
                  <button onClick={() => setShowFullLogin(false)} className="text-[10px] font-black uppercase text-stone-300 hover:text-stone-900 transition-colors">Annuler</button>
              </div>
          </div>
      )}

      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 left-0 right-0 z-[100] px-4 md:px-12 py-6 md:py-8 flex justify-between items-center mix-blend-difference text-white transition-all duration-300">
        <div className="flex items-center gap-2 md:gap-3 cursor-pointer group" onClick={() => {setView('home'); window.scrollTo({top:0, behavior:'smooth'});}}>
          <div className="bg-white text-stone-900 p-1 md:p-1.5 rounded-lg shadow-md transition-all group-hover:rotate-6"><Hammer size={20} className="w-4 h-4 md:w-5 md:h-5"/></div>
          <div>
            <h1 className="text-base md:text-lg font-black uppercase tracking-tighter leading-none">Tous à Table</h1>
            <p className="text-[7px] font-black tracking-[0.3em] uppercase mt-0.5 leading-none opacity-60">Atelier Normand</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
            {user && !user.isAnonymous ? (
                <div className="flex items-center gap-2 md:gap-4 mr-1 md:mr-2">
                    <div className="text-right hidden md:block">
                        <p className="text-[10px] font-black uppercase tracking-widest leading-none">{user.displayName || 'Client'}</p>
                        <p className="text-[7px] font-bold opacity-60 mt-0.5">Connecté</p>
                    </div>
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

      {/* --- CONTENU PRINCIPAL --- */}
      <main>
        {/* VUE: ACCUEIL */}
        {view === 'home' && <HomeView onEnterMarketplace={() => { setView('gallery'); window.scrollTo(0,0); }} />}

        {/* VUE: GALERIE (MARKETPLACE) */}
        {view === 'gallery' && (
          <GalleryView 
            items={items}
            isAdmin={isAdmin}
            isSecretGateOpen={isSecretGateOpen}
            user={user}
            onShowLogin={() => setShowFullLogin(true)}
            onSelectItem={(id) => { setSelectedItemId(id); setView('detail'); window.scrollTo({top:0, behavior:'smooth'}); }}
          />
        )}

        {/* VUE: DETAIL PRODUIT */}
        {view === 'detail' && selectedItemId && (
          <div className="pt-32 px-6">
            <ProductDetail 
                item={items.find(i => i.id === selectedItemId)} 
                user={user} 
                onBack={() => { setView('gallery'); setSelectedItemId(null); }} 
            />
          </div>
        )}

        {/* VUE: LOGIN ADMIN */}
        {view === 'login' && isSecretGateOpen && <LoginView onSuccess={() => setView('admin')} />}
        
        {/* VUE: ADMIN DASHBOARD */}
        {view === 'admin' && isAdmin && (
          <div className="max-w-6xl mx-auto px-4 md:px-8 py-32 space-y-16 animate-in fade-in text-stone-900">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-stone-200/60 pb-8 gap-4 text-stone-900">
                <h2 className="text-4xl font-black tracking-tighter text-stone-900">Gestion Atelier</h2>
                <button onClick={() => setView('gallery')} className="w-full md:w-auto text-[10px] font-black border-2 border-stone-900 px-6 py-2 rounded-xl hover:bg-stone-900 hover:text-white transition-all shadow-md text-stone-900">Retour Marketplace</button>
            </div>
            
            {/* Formulaire d'ajout/édition externe */}
            <AdminForm editData={editingItem} onCancelEdit={() => setEditingItem(null)} />

            {/* Liste simplifiée pour gestion (Status/Delete/Edit) */}
            <div className="grid gap-4 pt-10 text-stone-900">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-300 ml-4 mb-2">Suivi des lots</h3>
                <div className="space-y-4">
                  {items.map(item => (
                    // Ici, je garde la logique d'affichage de la liste admin directement dans App pour l'instant 
                    // car elle contient des boutons d'actions spécifiques (handleDeleteItem, handleToggleStatus)
                    // liés à l'état global de App. On pourrait en faire un composant 'AdminList' plus tard.
                    <div key={item.id} className={`bg-white p-4 md:p-5 rounded-[2.5rem] border flex flex-col md:flex-row items-start md:items-center justify-between shadow-lg transition-all gap-4 ${item.status === 'published' ? 'border-stone-100' : 'border-amber-200 bg-amber-50/10'}`}>
                      <div className="flex items-center gap-4 md:gap-8 w-full md:w-auto">
                        <img src={item.images?.[0] || item.imageUrl} className="w-16 h-20 rounded-2xl object-cover shadow-md flex-shrink-0" alt="" />
                        <div className="space-y-1 flex-1 min-w-0">
                           <span className="text-lg font-black tracking-tighter block">{item.name}</span>
                           <span className={`px-2 py-0.5 rounded-md text-[7px] font-black uppercase tracking-widest border ${item.status === 'published' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                              {item.status === 'published' ? 'Public' : 'Brouillon'}
                           </span>
                        </div>
                      </div>
                      <div className="flex gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-stone-50">
                        {/* Boutons d'action */}
                        <button onClick={() => { setEditingItem(item); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="btn-icon bg-stone-50 hover:bg-stone-900 hover:text-white rounded-full w-12 h-12 flex items-center justify-center transition-colors">✏️</button>
                        <button onClick={() => handleToggleStatus(item)} className="btn-icon bg-stone-50 hover:bg-amber-500 hover:text-white rounded-full w-12 h-12 flex items-center justify-center transition-colors">👁️</button>
                        <button onClick={() => handleDeleteItem(item.id)} className="btn-icon bg-red-50 text-red-500 hover:bg-red-600 hover:text-white rounded-full w-12 h-12 flex items-center justify-center transition-colors">🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}