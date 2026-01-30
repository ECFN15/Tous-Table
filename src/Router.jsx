import React, { Suspense } from 'react';
import HomeView from './pages/HomeView';
import GalleryView from './pages/GalleryView';
import ProductDetail from './pages/ProductDetail';
import CheckoutView from './pages/CheckoutView';
import LoginView from './pages/LoginView';
import OrderSuccessModal from './components/OrderSuccessModal';
import AdminForm from './features/admin/AdminForm';
import AdminOrders from './features/admin/AdminOrders';
import AdminComments from './features/admin/AdminComments';
import AdminDashboard from './features/admin/AdminDashboard';
import AdminHomepage from './features/admin/AdminHomepage';
import AdminStudio from './features/admin/AdminStudio';
import AdminItemList from './features/admin/AdminItemList'; // New Scalable List
import { Pencil, Eye, EyeOff, Trash2, Trophy, Mail, Palette } from 'lucide-react';
import { getMillis } from './utils/time';
import { useAuth } from './contexts/AuthContext';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, appId } from './firebase/config';

const CommentsModal = React.lazy(() => import('./components/ui/CommentsModal'));

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
    setSelectedItemForComments,
    setCommentCollection,
    setIsCommentModalOpen,
    addToCart,
    cartItems,
    cartTotal,
    handlePlaceOrder,
    showOrderSuccess,
    setShowOrderSuccess,
    isCommentModalOpen,
    selectedItemForComments,
    commentCollection,
    adminCollection,
    setAdminCollection,
    editingItem,
    setEditingItem
}) => {
    const { user, isAdmin } = useAuth();

    const handleToggleStatus = async (item, col) => {
        try { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', col, item.id), { status: item.status === 'published' ? 'draft' : 'published' }); } catch (e) { console.error(e); }
    };

    const handleDeleteItem = async (year, id, col) => {
        if (!confirm("Supprimer ?")) return;
        try { await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', col, id)); } catch (e) { console.error(e); }
    };

    return (
        <main>
            {/* VUE: ACCUEIL */}
            {(view === 'home' || isPreparingGallery) && (
                <div className={view === 'home' ? 'contents' : 'hidden'}>
                    <HomeView
                        onEnterMarketplace={completeGalleryTransition}
                        onStartMarketplaceTransition={startGalleryTransition}
                        darkMode={darkMode}
                    />
                </div>
            )}

            {/* VUE: GALERIE (MARKETPLACE) */}
            {(view === 'gallery' || isPreparingGallery) && (
                <div
                    className={view === 'gallery' ? 'contents animate-in fade-in duration-500' : 'fixed inset-0 pointer-events-none opacity-0 z-0'}
                    style={{ display: (view === 'gallery' || isPreparingGallery) ? 'block' : 'none' }}
                >
                    <GalleryView
                        items={items}
                        boardItems={boardItems}
                        isAdmin={isAdmin} isSecretGateOpen={isSecretGateOpen} user={user}
                        onShowLogin={() => setShowFullLogin(true)}
                        onSelectItem={(id) => { setSelectedItemId(id); setView('detail'); window.scrollTo(0, 0); }}
                        onShowComments={(item, col) => { setSelectedItemForComments(item); setCommentCollection(col); setIsCommentModalOpen(true); }}
                        darkMode={darkMode}
                    />
                </div>
            )}

            {/* VUE: DETAIL PRODUIT */}
            {view === 'detail' && selectedItemId && (
                <div className="contents">
                    <ProductDetail
                        item={[...items, ...boardItems].find(i => i.id === selectedItemId)}
                        user={user}
                        onBack={() => { setView('gallery'); setSelectedItemId(null); }}
                        onAddToCart={addToCart}
                        onShowComments={(item) => {
                            const col = items.find(i => i.id === item.id) ? 'furniture' : 'cutting_boards';
                            setSelectedItemForComments(item);
                            setCommentCollection(col);
                            setIsCommentModalOpen(true);
                        }}
                        darkMode={darkMode}
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

            {/* MODAL COMMENTAIRES (GLOBAL) */}
            <Suspense fallback={null}>
                <CommentsModal
                    isOpen={isCommentModalOpen}
                    onClose={() => setIsCommentModalOpen(false)}
                    itemId={selectedItemForComments?.id}
                    user={user}
                    isAdmin={isAdmin}
                    activeCollection={commentCollection}
                />
            </Suspense>

            {/* VUE: LOGIN ADMIN */}
            {view === 'login' && isSecretGateOpen && <LoginView onSuccess={() => setView('admin')} />}

            {/* VUE: ADMIN DASHBOARD */}
            {view === 'admin' && isAdmin && (
                <div className={`max-w-6xl mx-auto px-4 py-32 space-y-16 animate-in fade-in ${darkMode ? 'text-white' : 'text-stone-900'}`}>
                    <div className={`flex justify-between items-center border-b pb-8 ${darkMode ? 'border-stone-700' : 'border-stone-200/60'}`}><h2 className="text-4xl font-black tracking-tighter">Gestion Atelier</h2><button onClick={() => setView('gallery')} className={`text-[10px] font-black border-2 px-6 py-2 rounded-xl transition-all ${darkMode ? 'border-white hover:bg-white hover:text-stone-900' : 'border-stone-900 hover:bg-stone-900 hover:text-white'}`}>Retour</button></div>

                    {/* Collection Switcher */}
                    <div className={`flex flex-wrap md:flex-nowrap gap-2 md:gap-4 p-2 md:p-1 border-b md:border-none md:rounded-xl w-full md:w-fit justify-center transition-all shadow-sm md:shadow-none ${darkMode ? 'bg-stone-800 border-stone-700 md:bg-stone-800' : 'bg-[#FAF9F6] border-stone-200/50 md:bg-stone-100'}`}>
                        <button
                            onClick={() => { setAdminCollection('studio'); setEditingItem(null); }}
                            className={`flex-1 md:flex-none px-4 md:px-6 py-3 rounded-xl md:rounded-lg text-[10px] md:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap shadow-sm border md:border-none flex items-center justify-center gap-2 ${adminCollection === 'studio' ? (darkMode ? 'bg-white text-stone-900 border-white md:bg-stone-700 md:text-white md:border-none' : 'bg-stone-900 text-white md:bg-white md:text-stone-900 border-stone-900') : (darkMode ? 'bg-stone-900 text-stone-400 border-stone-700 hover:text-stone-300' : 'bg-white text-stone-400 border-stone-200 hover:text-stone-600')}`}
                        >
                            <Palette size={14} className="md:w-3.5" /> <span className="hidden md:inline">Studio</span>
                        </button>
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

                    <Suspense fallback={<div className="flex items-center justify-center p-20"><div className="w-10 h-10 border-4 border-stone-200 border-t-stone-800 rounded-full animate-spin"></div></div>}>
                        {/* CONTENU ADMIN */}
                        {adminCollection === 'dashboard' ? (
                            <AdminDashboard user={user} darkMode={darkMode} />
                        ) : adminCollection === 'homepage' ? (
                            <AdminHomepage darkMode={darkMode} />
                        ) : adminCollection === 'orders' ? (
                            <AdminOrders darkMode={darkMode} />
                        ) : adminCollection === 'comments' ? (

                            <AdminComments darkMode={darkMode} />
                        ) : adminCollection === 'studio' ? (
                            <AdminStudio darkMode={darkMode} />
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

                                {/* Liste Admin Optimisée */}
                                <div className="pt-10">
                                    <AdminItemList
                                        collectionName={adminCollection}
                                        darkMode={darkMode}
                                        onEdit={(item) => { setEditingItem(item); window.scrollTo(0, 0); }}
                                        onToggleStatus={(item) => handleToggleStatus(item, adminCollection)}
                                        onDelete={(id) => handleDeleteItem(null, id, adminCollection)}
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
