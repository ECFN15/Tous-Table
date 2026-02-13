
import React, { Suspense } from 'react';
import HomeView from './pages/HomeView';
import OrderSuccessModal from './components/OrderSuccessModal';

// --- CODE SPLITTING: Chargement différé des pages secondaires ---
// Optimisation critique pour mobile : on ne télécharge pas tout d'un coup.
const GalleryView = React.lazy(() => import('./pages/GalleryView'));
const ProductDetail = React.lazy(() => import('./pages/ProductDetail'));
const CheckoutView = React.lazy(() => import('./pages/CheckoutView'));
const LoginView = React.lazy(() => import('./pages/LoginView'));
import {
    LayoutGrid, Palette, ShoppingBag, Settings,
    CreditCard, Hammer, Gavel, Pencil, Eye, EyeOff, Trash2, Trophy, Mail, Users, Share2, LogOut
} from 'lucide-react';

const AdminDashboard = React.lazy(() => import('./features/admin/AdminDashboard'));
const AdminHomepage = React.lazy(() => import('./features/admin/AdminHomepage'));
const AdminOrders = React.lazy(() => import('./features/admin/AdminOrders'));

const AdminStudio = React.lazy(() => import('./features/admin/AdminStudio'));
const AdminAuctions = React.lazy(() => import('./features/admin/AdminAuctions'));
const AdminForm = React.lazy(() => import('./features/admin/AdminForm'));
const AdminItemList = React.lazy(() => import('./features/admin/AdminItemList'));
const AdminUsers = React.lazy(() => import('./features/admin/AdminUsers'));

const AdminSEO = React.lazy(() => import('./features/admin/AdminSEO'));

const MyOrdersView = React.lazy(() => import('./pages/MyOrdersView'));

import { getMillis } from './utils/time';
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
    adminCollection,
    setAdminCollection,
    editingItem,
    setEditingItem,
    onOpenMenu,
    onOpenCart,
    toggleTheme
}) => {
    const { user, isAdmin, logout } = useAuth();

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

    return (
        <main>
            {(view === 'home' || isPreparingGallery) && (
                <div className={view === 'home' ? 'contents' : 'hidden'}>
                    <HomeView
                        onEnterMarketplace={completeGalleryTransition}
                        onStartMarketplaceTransition={startGalleryTransition}
                        darkMode={darkMode}
                    />
                </div>
            )}

            {(view === 'gallery' || isPreparingGallery) && (
                <div
                    className={view === 'gallery' ? 'contents animate-in fade-in duration-500' : 'fixed inset-0 pointer-events-none opacity-0 z-0'}
                    style={{ display: (view === 'gallery' || isPreparingGallery) ? 'block' : 'none' }}
                >
                    <Suspense fallback={<div className="min-h-screen bg-[#0A0A0A]"></div>}>
                        <GalleryView
                            items={items}
                            boardItems={boardItems}
                            isAdmin={isAdmin} isSecretGateOpen={isSecretGateOpen} user={user}
                            onShowLogin={() => setShowFullLogin(true)}
                            onSelectItem={(id) => { setSelectedItemId(id); setView('detail'); window.scrollTo(0, 0); }}
                            darkMode={darkMode}
                            onOpenMenu={onOpenMenu}
                            onOpenCart={onOpenCart}
                            toggleTheme={toggleTheme}
                        />
                    </Suspense>
                </div>
            )}

            {view === 'detail' && selectedItemId && (
                <Suspense fallback={<div className="min-h-screen bg-[#FAFAF9]"></div>}>
                    <div className="contents">
                        <ProductDetail
                            item={[...items, ...boardItems].find(i => i.id === selectedItemId)}
                            user={user}
                            onBack={() => { setView('gallery'); setSelectedItemId(null); }}
                            onAddToCart={addToCart}
                            darkMode={darkMode}
                            onOpenMenu={onOpenMenu}
                            onOpenCart={onOpenCart}
                            onShowLogin={() => setShowFullLogin(true)}
                            toggleTheme={toggleTheme}
                        />
                    </div>
                </Suspense>
            )}

            {view === 'checkout' && (
                <Suspense fallback={<div className="min-h-screen bg-[#FAFAF9]"></div>}>
                    <CheckoutView
                        cartItems={cartItems}
                        total={cartTotal}
                        user={user}
                        darkMode={darkMode}
                        onBack={() => setView('gallery')}
                        onPlaceOrder={handlePlaceOrder}
                    />
                </Suspense>
            )}

            {view === 'my-orders' && user && (
                <Suspense fallback={<div className="min-h-screen bg-[#FAF9F6]"></div>}>
                    <MyOrdersView
                        user={user}
                        onBack={() => setView('gallery')}
                        darkMode={darkMode}
                    />
                </Suspense>
            )}

            {showOrderSuccess && <OrderSuccessModal onClose={() => setShowOrderSuccess(false)} />}



            {view === 'login' && isSecretGateOpen && <Suspense fallback={null}><LoginView onSuccess={() => setView('admin')} /></Suspense>}

            {view === 'admin' && isAdmin && (
                <div className={`max-w-6xl mx-auto px-4 py-24 md:py-32 space-y-12 md:space-y-16 animate-in fade-in ${darkMode ? 'text-white' : 'text-stone-900'}`}>
                    <div className={`flex justify-between items-center border-b pb-8 ${darkMode ? 'border-stone-700' : 'border-stone-200/60'}`}>
                        <h2 className="text-3xl md:text-4xl font-black tracking-tighter">Gestion Atelier</h2>
                        <button onClick={() => setView('gallery')} className={`text-[10px] font-black border-2 px-4 md:px-6 py-2 rounded-xl transition-all ${darkMode ? 'border-white hover:bg-white hover:text-stone-900' : 'border-stone-900 hover:bg-stone-900 hover:text-white'}`}>Retour</button>
                    </div>

                    {/* ADMIN NAVIGATION - FULLY RESPONSIVE WRAPPING */}
                    <div className="w-full">
                        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 p-1 pb-4 md:pb-0">
                            <button
                                onClick={() => { setAdminCollection('studio'); setEditingItem(null); }}
                                className={`px-3 md:px-5 lg:px-6 py-3 rounded-xl md:rounded-lg text-[10px] md:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap shadow-sm border md:border-none flex items-center justify-center gap-2 ${adminCollection === 'studio' ? (darkMode ? 'bg-white text-stone-900 border-white' : 'bg-stone-900 text-white border-stone-900') : (darkMode ? 'bg-stone-900 text-stone-400 border-stone-700 hover:text-stone-300' : 'bg-white text-stone-400 border-stone-200 hover:text-stone-600')}`}
                            >
                                <Palette size={14} className="shrink-0" /> Studio
                            </button>
                            <button
                                onClick={() => { setAdminCollection('dashboard'); setEditingItem(null); }}
                                className={`px-4 md:px-5 lg:px-6 py-3 rounded-xl md:rounded-lg text-[10px] md:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap shadow-sm border md:border-none ${adminCollection === 'dashboard' ? (darkMode ? 'bg-white text-stone-900 border-white' : 'bg-stone-900 text-white border-stone-900') : (darkMode ? 'bg-stone-900 text-stone-400 border-stone-700 hover:text-stone-300' : 'bg-white text-stone-400 border-stone-200 hover:text-stone-600')}`}
                            >
                                Dashboard
                            </button>
                            <button
                                onClick={() => { setAdminCollection('homepage'); setEditingItem(null); }}
                                className={`px-4 md:px-5 lg:px-6 py-3 rounded-xl md:rounded-lg text-[10px] md:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap shadow-sm border md:border-none ${adminCollection === 'homepage' ? (darkMode ? 'bg-white text-stone-900 border-white' : 'bg-stone-900 text-white border-stone-900') : (darkMode ? 'bg-stone-900 text-stone-400 border-stone-700 hover:text-stone-300' : 'bg-white text-stone-400 border-stone-200 hover:text-stone-600')}`}
                            >
                                Homepage
                            </button>
                            <button
                                onClick={() => { setAdminCollection('orders'); setEditingItem(null); }}
                                className={`px-4 md:px-5 lg:px-6 py-3 rounded-xl md:rounded-lg text-[10px] md:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap shadow-sm border md:border-none ${adminCollection === 'orders' ? (darkMode ? 'bg-white text-stone-900 border-white' : 'bg-stone-900 text-white border-stone-900') : (darkMode ? 'bg-stone-900 text-stone-400 border-stone-700 hover:text-stone-300' : 'bg-white text-stone-400 border-stone-200 hover:text-stone-600')}`}
                            >
                                Commandes
                            </button>
                            <button
                                onClick={() => { setAdminCollection('auctions'); setEditingItem(null); }}
                                className={`px-3 md:px-5 lg:px-6 py-3 rounded-xl md:rounded-lg text-[10px] md:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap shadow-sm border md:border-none flex items-center justify-center gap-2 ${adminCollection === 'auctions' ? (darkMode ? 'bg-white text-stone-900 border-white' : 'bg-stone-900 text-white border-stone-900') : (darkMode ? 'bg-stone-900 text-stone-400 border-stone-700 hover:text-stone-300' : 'bg-white text-stone-400 border-stone-200 hover:text-stone-600')}`}
                            >
                                <Gavel size={14} className="shrink-0" /> Enchères
                            </button>
                            <button
                                onClick={() => { setAdminCollection('furniture'); setEditingItem(null); }}
                                className={`px-4 md:px-5 lg:px-6 py-3 rounded-xl md:rounded-lg text-[10px] md:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap shadow-sm border md:border-none ${adminCollection === 'furniture' ? (darkMode ? 'bg-white text-stone-900 border-white' : 'bg-stone-900 text-white border-stone-900') : (darkMode ? 'bg-stone-900 text-stone-400 border-stone-700 hover:text-stone-300' : 'bg-white text-stone-400 border-stone-200 hover:text-stone-600')}`}
                            >
                                Mobilier
                            </button>
                            <button
                                onClick={() => { setAdminCollection('cutting_boards'); setEditingItem(null); }}
                                className={`px-4 md:px-5 lg:px-6 py-3 rounded-xl md:rounded-lg text-[10px] md:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap shadow-sm border md:border-none ${adminCollection === 'cutting_boards' ? (darkMode ? 'bg-white text-stone-900 border-white' : 'bg-stone-900 text-white border-stone-900') : (darkMode ? 'bg-stone-900 text-stone-400 border-stone-700 hover:text-stone-300' : 'bg-white text-stone-400 border-stone-200 hover:text-stone-600')}`}
                            >
                                Planches
                            </button>

                            <button
                                onClick={() => { setAdminCollection('users'); setEditingItem(null); }}
                                className={`px-3 md:px-5 lg:px-6 py-3 rounded-xl md:rounded-lg text-[10px] md:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap shadow-sm border md:border-none flex items-center justify-center gap-2 ${adminCollection === 'users' ? (darkMode ? 'bg-white text-stone-900 border-white' : 'bg-stone-900 text-white border-stone-900') : (darkMode ? 'bg-stone-900 text-stone-400 border-stone-700 hover:text-stone-300' : 'bg-white text-stone-400 border-stone-200 hover:text-stone-600')}`}
                            >
                                <Users size={14} className="shrink-0" /> Utilisateurs
                            </button>

                            <button
                                onClick={() => { setAdminCollection('seo'); setEditingItem(null); }}
                                className={`px-3 md:px-5 lg:px-6 py-3 rounded-xl md:rounded-lg text-[10px] md:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap shadow-sm border md:border-none flex items-center justify-center gap-2 ${adminCollection === 'seo' ? (darkMode ? 'bg-white text-stone-900 border-white' : 'bg-stone-900 text-white border-stone-900') : (darkMode ? 'bg-stone-900 text-stone-400 border-stone-700 hover:text-stone-300' : 'bg-white text-stone-400 border-stone-200 hover:text-stone-600')}`}
                            >
                                <Share2 size={14} className="shrink-0" /> SEO
                            </button>
                        </div>
                    </div>

                    <Suspense fallback={<div className="flex items-center justify-center p-20"><div className="w-10 h-10 border-4 border-stone-200 border-t-stone-800 rounded-full animate-spin"></div></div>}>
                        {adminCollection === 'dashboard' ? (
                            <AdminDashboard user={user} darkMode={darkMode} />
                        ) : adminCollection === 'homepage' ? (
                            <AdminHomepage darkMode={darkMode} />
                        ) : adminCollection === 'orders' ? (
                            <AdminOrders darkMode={darkMode} />

                        ) : adminCollection === 'auctions' ? (
                            <AdminAuctions darkMode={darkMode} />
                        ) : adminCollection === 'studio' ? (
                            <AdminStudio darkMode={darkMode} />
                        ) : adminCollection === 'users' ? (
                            <AdminUsers darkMode={darkMode} />
                        ) : adminCollection === 'seo' ? (
                            <AdminSEO darkMode={darkMode} />
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
                                        onEdit={(item) => { setEditingItem(item); window.scrollTo(0, 0); }}
                                        onToggleStatus={(item) => handleToggleStatus(item, adminCollection)}
                                        onDelete={(id) => handleDeleteItem(null, id, adminCollection)}
                                        onMarkAsSold={(item) => handleMarkAsSold(item, adminCollection)}
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
