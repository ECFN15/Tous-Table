
import React, { Suspense } from 'react';
import HomeView from './pages/HomeView';
import OrderSuccessModal from './components/orders/OrderSuccessModal';
import { motion, AnimatePresence } from 'framer-motion';
import { scrollToTop } from './utils/smoothScroll';

// --- CODE SPLITTING: Chargement différé des pages secondaires ---
// Optimisation critique pour mobile : on ne télécharge pas tout d'un coup.
const GalleryView = React.lazy(() => import('./pages/GalleryView'));
const ShopView = React.lazy(() => import('./pages/ShopView'));
const ProductDetail = React.lazy(() => import('./pages/ProductDetail'));
const CheckoutView = React.lazy(() => import('./pages/CheckoutView'));
const LoginView = React.lazy(() => import('./pages/LoginView'));
import { Palette,
    CreditCard, Mail, Users, Share2, Globe,
    Activity, Home, Package, Layout, LayoutPanelTop, BarChart3, ChevronLeft,
    MoreHorizontal, ChevronDown, ShoppingBag
} from 'lucide-react';

const AdminShop = React.lazy(() => import('./features/admin/AdminShop'));
const AdminDashboard = React.lazy(() => import('./features/admin/AdminDashboard'));
const AdminHomepage = React.lazy(() => import('./features/admin/AdminHomepage'));
const AdminOrders = React.lazy(() => import('./features/admin/AdminOrders'));

const AdminStudio = React.lazy(() => import('./features/admin/AdminStudio'));
const AdminForm = React.lazy(() => import('./features/admin/AdminForm'));
const AdminItemList = React.lazy(() => import('./features/admin/AdminItemList'));
const AdminUsers = React.lazy(() => import('./features/admin/AdminUsers'));
const AdminNewsletter = React.lazy(() => import('./features/admin/AdminNewsletter'));
const AdminAnalytics = React.lazy(() => import('./features/admin/AdminAnalytics'));

const AdminSEO = React.lazy(() => import('./features/admin/AdminSEO'));
const AdminIPManager = React.lazy(() => import('./features/admin/AdminIPManager'));
const AdminPaymentSettings = React.lazy(() => import('./features/admin/AdminPaymentSettings'));

const AdminIPTracker = React.lazy(() => import('./components/admin/AdminIPTracker'));

const MyOrdersView = React.lazy(() => import('./pages/MyOrdersView'));

import { useAuth } from './contexts/AuthContext';
import { doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db, appId } from './firebase/config';

const AppRouter = ({
    view,
    setView,
    items,
    boardItems,
    isPreparingGallery,
    startGalleryTransition,
    completeGalleryTransition,
    darkMode,
    activeDesignId,
    isSecretGateOpen,
    setShowFullLogin,
    setSelectedItemId,
    selectedItemId,
    addToCart,
    cartItems,
    cartTotal,
    handlePlaceOrder,
    showOrderSuccess,
    setShowOrderSuccess,
    orderSuccessMethod,
    adminCollection,
    setAdminCollection,
    editingItem,
    setEditingItem,
    onOpenMenu,
    onOpenCart,
    toggleTheme,
    onOpenDiscovery,
    setHeaderProps,
    persistentGalleryState,
    saveGalleryState,
    affiliateProducts
}) => {
    const { user, isAdmin, logout } = useAuth();
    const [isMoreMenuOpen, setIsMoreMenuOpen] = React.useState(false);

    const adminTabs = [
        { id: 'dashboard', label: 'Stats', icon: Activity },
        { id: 'analytics', label: 'Data', icon: BarChart3 },
        { id: 'furniture', label: 'Mobilier', icon: Layout },
        { id: 'cutting_boards', label: 'Planches', icon: LayoutPanelTop },
        { id: 'studio', label: 'Studio', icon: Palette },
        { id: 'homepage', label: 'Accueil', icon: Home },
        { id: 'orders', label: 'Commandes', icon: Package },
        { id: 'shop', label: 'Boutique', icon: ShoppingBag },
        { id: 'users', label: 'Admin', icon: Users },
        { id: 'ip_manager', label: 'Session Exclu', icon: Globe },
        { id: 'seo', label: 'SEO', icon: Share2 },
        { id: 'newsletter', label: 'Newsletter', icon: Mail },
        { id: 'payment_settings', label: 'Paiement', icon: CreditCard },
    ];

    const handleToggleStatus = async (item, col) => {
        try { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', col, item.id), { status: item.status === 'published' ? 'draft' : 'published' }); } catch (e) { console.error(e); }
    };



    const handleDeleteItem = async (year, id, col) => {
        if (!confirm("Supprimer ?")) return;
        try { await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', col, id)); } catch (e) { console.error(e); }
    };

    const handleMarkAsSold = async (item, col) => {
        if (!confirm(`Marquer "${item.name}" comme VENDU ? (Stock à 0)`)) return;
        try {
            await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', col, item.id), {
                sold: true,
                stock: 0,
                soldAt: serverTimestamp()
            });
            alert("✓ Mis à jour avec succès");
        } catch (e) {
            console.error(e);
            alert("❌ Erreur lors de la mise à jour : " + e.message);
        }
    };

    const handleMarkAsAvailable = async (item, col) => {
        if (!confirm(`Remettre "${item.name}" en vente ? (Stock à 1)`)) return;
        try {
            await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', col, item.id), {
                sold: false,
                stock: 1,
                soldAt: null
            });
            alert("✓ Remis en vente avec succès");
        } catch (e) {
            console.error(e);
            alert("❌ Erreur lors de la mise à jour : " + e.message);
        }
    };

    return (
        <main>
            {(view === 'home' || isPreparingGallery) && (
                <div className={view === 'home' ? 'contents' : 'hidden'}>
                    <HomeView
                        onEnterMarketplace={completeGalleryTransition}
                        onStartMarketplaceTransition={startGalleryTransition}
                        darkMode={darkMode}
                        onOpenDiscovery={onOpenDiscovery}
                    />
                </div>
            )}

            {(view === 'gallery' || isPreparingGallery) && (
                <div
                    className={view === 'gallery' ? 'contents animate-in fade-in duration-500' : 'fixed inset-0 pointer-events-none opacity-0 z-0'}
                    style={{ display: (view === 'gallery' || isPreparingGallery) ? 'block' : 'none' }}
                >
                    <Suspense fallback={<div className="min-h-screen bg-transparent"></div>}>
                        <GalleryView
                            items={items}
                            boardItems={boardItems}
                            isAdmin={isAdmin} isSecretGateOpen={isSecretGateOpen} user={user}
                            onShowLogin={() => setShowFullLogin(true)}
                            onSelectItem={(id) => { setSelectedItemId(id); setView('detail'); scrollToTop(); }}
                            onOpenShop={() => { setView('shop'); window.location.hash = 'shop'; scrollToTop(); }}
                            darkMode={darkMode}
                            onOpenMenu={onOpenMenu}
                            onOpenCart={onOpenCart}
                            toggleTheme={toggleTheme}
                            setHeaderProps={setHeaderProps}
                            persistentGalleryState={persistentGalleryState}
                            saveGalleryState={saveGalleryState}
                        />
                    </Suspense>
                </div>
            )}

            {view === 'shop' && (
                <Suspense fallback={<div className="min-h-screen bg-transparent"></div>}>
                    <ShopView
                        affiliateProducts={affiliateProducts}
                        darkMode={darkMode}
                        onOpenMenu={onOpenMenu}
                        onOpenCart={onOpenCart}
                        toggleTheme={toggleTheme}
                        setHeaderProps={setHeaderProps}
                    />
                </Suspense>
            )}

            {view === 'detail' && selectedItemId && (
                <Suspense fallback={<div className="min-h-screen bg-transparent"></div>}>
                    <div className="contents">
                        <ProductDetail
                            item={[...items, ...boardItems].find(i => i.id === selectedItemId)}
                            user={user}
                            onBack={() => { 
                                // Restore sub-view before returning
                                if (persistentGalleryState) {
                                    setHeaderProps(prev => ({
                                        ...prev,
                                        activeCollection: persistentGalleryState.activeCollection,
                                        filter: persistentGalleryState.filter
                                    }));
                                }
                                setView('gallery'); 
                                setSelectedItemId(null); 
                            }}
                            onAddToCart={addToCart}
                            cartItems={cartItems}
                            darkMode={darkMode}
                            onOpenMenu={onOpenMenu}
                            onOpenCart={onOpenCart}
                            onShowLogin={() => setShowFullLogin(true)}
                            toggleTheme={toggleTheme}
                            setHeaderProps={setHeaderProps}
                            affiliateProducts={affiliateProducts}
                        />
                    </div>
                </Suspense>
            )}

            {view === 'checkout' && (
                <Suspense fallback={<div className="min-h-screen bg-transparent"></div>}>
                    <CheckoutView
                        cartItems={cartItems}
                        total={cartTotal}
                        user={user}
                        darkMode={darkMode}
                        onBack={() => {
                            if (persistentGalleryState) {
                                setHeaderProps(prev => ({
                                    ...prev,
                                    activeCollection: persistentGalleryState.activeCollection,
                                    filter: persistentGalleryState.filter
                                }));
                            }
                            setView('gallery');
                        }}
                        onPlaceOrder={handlePlaceOrder}
                    />
                </Suspense>
            )}

            {view === 'my-orders' && user && (
                <Suspense fallback={<div className="min-h-screen bg-transparent"></div>}>
                    <MyOrdersView
                        user={user}
                        onBack={() => setView('gallery')}
                        darkMode={darkMode}
                        activeDesignId={activeDesignId}
                    />
                </Suspense>
            )}

            {showOrderSuccess && <OrderSuccessModal onClose={() => setShowOrderSuccess(false)} paymentMethod={orderSuccessMethod} />}



            {view === 'login' && isSecretGateOpen && <Suspense fallback={null}><LoginView onSuccess={() => setView('admin')} /></Suspense>}

            {view === 'admin' && isAdmin && (
                <div className={`max-w-6xl mx-auto px-4 py-24 md:py-32 space-y-12 md:space-y-16 animate-in fade-in ${darkMode ? 'text-white' : 'text-stone-900'}`}>
                    <Suspense fallback={null}>
                        <AdminIPTracker />
                    </Suspense>
                    {/* GESTION ATELIER HEADER */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-2">
                            <p className={`text-[10px] uppercase font-black tracking-[0.3em] ${darkMode ? 'text-stone-500' : 'text-stone-400'}`}>Système de Contrôle</p>
                            <h2 className="text-4xl md:text-5xl font-black tracking-tighter">Gestion Atelier</h2>
                        </div>
                        <button 
                            onClick={() => setView('gallery')} 
                            className={`group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border-2 px-6 py-2.5 rounded-2xl transition-all ${darkMode ? 'border-white/10 hover:border-white hover:bg-white hover:text-stone-900' : 'border-stone-900 hover:bg-stone-900 hover:text-white'}`}
                        >
                            <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                            Retour au site
                        </button>
                    </div>

                    {/* PREMIUM ADMIN NAVIGATION - BENTO PILL DESIGN */}
                    <div className="relative flex flex-col items-center">
                        <div className={`w-full p-2 rounded-[2.5rem] border ${darkMode ? 'bg-[#111111]/80 border-white/5 backdrop-blur-xl' : 'bg-white/80 border-stone-200/60 backdrop-blur-xl shadow-lg shadow-stone-200/20'}`}>
                            <div className="flex flex-wrap items-center justify-center gap-1.5 md:gap-2">
                                {/* Desktop: All tabs | Mobile: First 4 */}
                                {adminTabs.map((tab, idx) => {
                                    const Icon = tab.icon;
                                    const isActive = adminCollection === tab.id;
                                    const isAlwaysVisible = idx < 4;
                                    const isDesktopVisible = idx < 9;
                                    
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => { setAdminCollection(tab.id); setEditingItem(null); setIsMoreMenuOpen(false); }}
                                            className={`group relative flex-none flex items-center gap-2 px-3 md:px-5 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                                                isAlwaysVisible ? 'flex' : isDesktopVisible ? 'hidden md:flex' : 'hidden'
                                            } ${
                                                isActive 
                                                    ? (darkMode ? 'bg-white text-stone-900 shadow-[0_0_20px_rgba(255,255,255,0.15)]' : 'bg-stone-900 text-white shadow-xl')
                                                    : (darkMode ? 'text-stone-500 hover:text-white hover:bg-white/5' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-50')
                                            }`}
                                        >
                                            <Icon size={14} className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110 group-hover:rotate-6'}`} />
                                            <span className={`${isActive ? 'opacity-100' : 'opacity-80'}`}>{tab.label}</span>
                                            {isActive && (
                                                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-current opacity-40"></span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        
                        {/* "More" Button - Universal (Now showing items from line 2) */}
                        <button
                            onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                            className={`mt-6 flex items-center gap-2 px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-300 hover:scale-105 active:scale-95 ${
                                isMoreMenuOpen || adminTabs.slice(9).some(t => t.id === adminCollection)
                                    ? (darkMode ? 'text-white bg-white/10' : 'text-stone-900 bg-stone-100')
                                    : (darkMode ? 'text-stone-600 hover:text-stone-400' : 'text-stone-400 hover:text-stone-600')
                            }`}
                        >
                            <span className="opacity-50 tracking-tighter">•••</span>
                            <span>{isMoreMenuOpen ? 'Fermer' : 'Plus d\'options'}</span>
                            <ChevronDown size={12} className={`transition-transform duration-500 ${isMoreMenuOpen ? 'rotate-180' : 'opacity-40'}`} />
                        </button>

                        {/* Universal Dropdown - Premium Bento Style */}
                        <AnimatePresence>
                            {isMoreMenuOpen && (
                                <>
                                    <motion.div 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        onClick={() => setIsMoreMenuOpen(false)}
                                        className="fixed inset-0 z-40"
                                    />
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className={`absolute top-full left-0 right-0 mt-2 z-50 p-3 rounded-[2.5rem] border grid grid-cols-2 md:grid-cols-4 gap-2 max-w-4xl mx-auto ${
                                            darkMode 
                                                ? 'bg-[#161616] border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]' 
                                                : 'bg-white border-stone-200 shadow-[0_20px_50px_rgba(0,0,0,0.1)]'
                                        }`}
                                    >
                                        {adminTabs.slice(4).map((tab, idx) => {
                                            const realIdx = idx + 4;
                                            const isDesktopShown = realIdx < 9;
                                            const Icon = tab.icon;
                                            const isActive = adminCollection === tab.id;
                                            
                                            return (
                                                <button
                                                    key={tab.id}
                                                    onClick={() => { 
                                                        setAdminCollection(tab.id); 
                                                        setEditingItem(null); 
                                                        setIsMoreMenuOpen(false); 
                                                    }}
                                                    className={`items-center gap-3 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${isDesktopShown ? 'md:hidden flex' : 'flex'} ${
                                                        isActive
                                                            ? (darkMode ? 'bg-white text-stone-900' : 'bg-stone-900 text-white')
                                                            : (darkMode ? 'bg-white/5 text-stone-400 hover:text-white' : 'bg-stone-50 text-stone-500 hover:text-stone-900')
                                                    }`}
                                                >
                                                    <Icon size={14} />
                                                    {tab.label}
                                                </button>
                                            );
                                        })}
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>

                    <Suspense fallback={<div className="flex items-center justify-center p-20"><div className="w-10 h-10 border-4 border-stone-200 border-t-stone-800 rounded-full animate-spin"></div></div>}>
                        {adminCollection === 'dashboard' ? (
                            <AdminDashboard user={user} darkMode={darkMode} />
                        ) : adminCollection === 'homepage' ? (
                            <AdminHomepage darkMode={darkMode} />
                        ) : adminCollection === 'orders' ? (
                            <AdminOrders darkMode={darkMode} />

                        ) : adminCollection === 'studio' ? (
                            <AdminStudio darkMode={darkMode} />
                        ) : adminCollection === 'users' ? (
                            <AdminUsers darkMode={darkMode} />
                        ) : adminCollection === 'ip_manager' ? (
                            <AdminIPManager darkMode={darkMode} />
                        ) : adminCollection === 'newsletter' ? (
                            <AdminNewsletter darkMode={darkMode} />
                        ) : adminCollection === 'seo' ? (
                            <AdminSEO darkMode={darkMode} />
                        ) : adminCollection === 'analytics' ? (
                            <AdminAnalytics darkMode={darkMode} />
                        ) : adminCollection === 'payment_settings' ? (
                            <AdminPaymentSettings darkMode={darkMode} />
                        ) : adminCollection === 'shop' ? (
                            <AdminShop darkMode={darkMode} />
                        ) : (
                            <>
                                <AdminForm
                                    key={adminCollection}
                                    editData={editingItem}
                                    onCancelEdit={() => setEditingItem(null)}
                                    collectionName={adminCollection}
                                    darkMode={darkMode}
                                />
                                <div className="pt-10">
                                    <AdminItemList
                                        collectionName={adminCollection}
                                        darkMode={darkMode}
                                onEdit={(item) => { setEditingItem(item); scrollToTop(); }}
                                        onToggleStatus={(item) => handleToggleStatus(item, adminCollection)}
                                        onDelete={(id) => handleDeleteItem(null, id, adminCollection)}
                                        onMarkAsSold={(item) => handleMarkAsSold(item, adminCollection)}
                                        onMarkAsAvailable={(item) => handleMarkAsAvailable(item, adminCollection)}
                                    />
                                </div>
                            </>
                        )}
                    </Suspense>
                </div>
            )}
        </main>
    );
};

export default AppRouter;
