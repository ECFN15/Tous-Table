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
import AdminStudio from './features/admin/AdminStudio'; // NEW
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

    // Admin Actions (Moved here or kept in App? Kept logic here for Admin View rendering)
    // Actually, handleToggleStatus and handleDeleteItem were in App.jsx. 
    // We can recreate them here or pass them. To clean App.jsx, let's keep them here if possible, 
    // or define them here since they interact with Firebase directly.

    const handleToggleStatus = async (item, col) => {
        try { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', col, item.id), { status: item.status === 'published' ? 'draft' : 'published' }); } catch (e) { console.error(e); }
    };

    const handleDeleteItem = async (year, id, col) => {
        if (!confirm("Supprimer ?")) return;
        try { await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', col, id)); } catch (e) { console.error(e); }
    };

    const currentAdminItems = adminCollection === 'furniture' ? items : boardItems;

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
                <div className="pt-32 px-6">
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
                    </Suspense>
                </div>
            )}
        </main>
    );
};

export default AppRouter;
