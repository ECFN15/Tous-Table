import React, { useState, useEffect } from 'react';
import {
    TrendingUp, ShoppingBag, ArrowUpRight, AlertTriangle, RefreshCw, Mail,
    Gavel, Package, CheckCircle, Clock, Archive, Users
} from 'lucide-react';
import { collection, getDocs, writeBatch, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, appId, functions } from '../../firebase/config';
import { getMillis } from '../../utils/time';

const AdminDashboard = ({ user, darkMode = false }) => {
    // Revised State for Business Logic
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        totalStockValue: 0, // [NEW] Potential Revenue
        activeAuctionsCount: 0, // [NEW] Live Auctions
        totalItemsForSale: 0,
        registeredUsers: 0
    });

    const [activeAuctions, setActiveAuctions] = useState([]); // [NEW] List of live auctions
    const [recentSales, setRecentSales] = useState([]); // [NEW] Recently sold items list
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal States
    const [isOrderResetModalOpen, setIsOrderResetModalOpen] = useState(false);
    const [resettingOrders, setResettingOrders] = useState(false);
    const [allOrders, setAllOrders] = useState([]);
    const [cleaning, setCleaning] = useState(false);
    const [isCleaningModalOpen, setIsCleaningModalOpen] = useState(false);
    const [resettingUsers, setResettingUsers] = useState(false);
    const [isResetUsersModalOpen, setIsResetUsersModalOpen] = useState(false);
    const [exportingUsers, setExportingUsers] = useState(false);
    const [isPurgeAnonymousModalOpen, setIsPurgeAnonymousModalOpen] = useState(false);
    const [purgingAnonymous, setPurgingAnonymous] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch Orders for Financials
                const ordersSnapshot = await getDocs(collection(db, 'orders'));
                let revenue = 0;
                let orderCount = 0;
                const orders = [];

                ordersSnapshot.forEach(doc => {
                    const data = doc.data();
                    const isCancelled = data.status === 'cancelled' || data.status === 'cancelled_by_client';

                    if (!isCancelled) {
                        revenue += (data.total || 0);
                        orderCount++;
                    }
                    orders.push({ id: doc.id, ...data });
                });

                // Filter out cancelled orders for the "Recent Orders" widget to keep dashboard focused on active business
                const activeOrders = orders.filter(o => o.status !== 'cancelled' && o.status !== 'cancelled_by_client');
                const sortedOrders = activeOrders.sort((a, b) => getMillis(b.createdAt) - getMillis(a.createdAt)).slice(0, 5);
                setRecentOrders(sortedOrders);
                setAllOrders(orders); // Keep all orders for background usage (e.g. Export)

                // 2. Fetch Items for Stock & Business Stats (Furniture + Boards)
                const furnitureSnap = await getDocs(collection(db, 'artifacts', appId, 'public', 'data', 'furniture'));
                const boardSnap = await getDocs(collection(db, 'artifacts', appId, 'public', 'data', 'cutting_boards'));

                let stockValue = 0;
                let itemsForSale = 0;
                let auctions = [];
                let soldItems = [];

                const processItem = (doc, type) => {
                    const data = doc.data();
                    const price = data.currentPrice || data.startingPrice || 0;
                    const stock = data.stock !== undefined ? Number(data.stock) : 1;

                    // A. Stock Value Calculation (Only available items)
                    if (!data.sold && stock > 0) {
                        stockValue += (price * stock);
                        itemsForSale += stock;
                    }

                    // B. Active Auctions
                    if (data.auctionActive && !data.sold && stock > 0) {
                        const endTime = data.auctionEnd ? getMillis(data.auctionEnd) : 0;
                        const timeLeft = Math.max(0, endTime - Date.now());
                        auctions.push({
                            id: doc.id,
                            ...data,
                            type,
                            timeLeft,
                            bidCount: data.bidCount || 0
                        });
                    }

                    // C. Recent Sales (To celebrate success)
                    if (data.sold || stock <= 0) {
                        soldItems.push({
                            id: doc.id,
                            ...data,
                            soldAt: data.soldAt ? getMillis(data.soldAt) : 0
                        });
                    }
                };

                furnitureSnap.forEach(doc => processItem(doc, 'Mobilier'));
                boardSnap.forEach(doc => processItem(doc, 'Planche'));

                // Sort Auctions by urgency (ending soonest)
                auctions.sort((a, b) => a.timeLeft - b.timeLeft);

                // Sort Sales by recent
                soldItems.sort((a, b) => b.soldAt - a.soldAt);

                setActiveAuctions(auctions);
                setRecentSales(soldItems.slice(0, 5)); // Top 5 sold

                setStats({
                    totalRevenue: revenue,
                    totalOrders: orderCount,
                    averageOrderValue: orderCount > 0 ? Math.round(revenue / orderCount) : 0,
                    totalStockValue: stockValue,
                    activeAuctionsCount: auctions.length,
                    totalItemsForSale: itemsForSale,
                    registeredUsers: 0 // Placeholder, fetched below
                });

                // 3. Fetch User Stats (Async to not block UI if slow)
                httpsCallable(functions, 'getUserStats')().then(res => {
                    setStats(prev => ({ ...prev, registeredUsers: res.data.count }));
                }).catch(err => console.error("Failed to fetch user stats", err));

                setLoading(false);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
                setLoading(false);
            }
        };

        fetchData();
        // Refresh auctions timer every minute? No, simple load is enough for admin dash overview.
    }, []);


    // --- ACTIONS (Reset, Export, Clean) SAME AS BEFORE ---
    const handleResetOrdersClick = () => setIsOrderResetModalOpen(true);

    const exportToExcel = async (orders) => {
        const XLSX = await import('xlsx');
        const data = orders.map(order => ({
            'ID Commande': order.id,
            'Date': new Date(getMillis(order.createdAt)).toLocaleString(),
            'Client': order.shipping?.fullName || 'N/A',
            'Total': `${order.total} €`,
            'Statut': order.status || 'N/A',
            'Articles': order.items?.map(item => `${item.name} (x${item.quantity})`).join(', ') || ''
        }));
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Commandes");
        XLSX.writeFile(wb, `Commandes_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const confirmResetOrders = async () => {
        setResettingOrders(true);
        try {
            await exportToExcel(allOrders);
            const resetOrdersFn = httpsCallable(functions, 'resetAllOrders');
            const result = await resetOrdersFn();
            const count = result.data.count;

            setStats(prev => ({ ...prev, totalRevenue: 0, totalOrders: 0, averageOrderValue: 0 }));
            setRecentOrders([]);
            setAllOrders([]);
            setIsOrderResetModalOpen(false);
            alert(`Succès ! ${count} commandes archivées et supprimées.`);
        } catch (error) {
            console.error(error);
            alert("Erreur purge commandes: " + error.message);
        } finally {
            setResettingOrders(false);
        }
    };

    const confirmCleaning = async () => {
        setCleaning(true);
        try {
            const garbageCollectorFn = httpsCallable(functions, 'runGarbageCollector');
            const result = await garbageCollectorFn();
            const s = result.data.stats;
            const freedMb = (s.storageSpaceFreedBytes / (1024 * 1024)).toFixed(2);
            setIsCleaningModalOpen(false);
            alert(`✅ Nettoyage terminé.\nEspace libéré : ${freedMb} Mo\nImages supprimées : ${s.orphanedImagesDeleted}`);
        } catch (error) {
            console.error(error);
            alert("Erreur nettoyage: " + error.message);
        } finally {
            setCleaning(false);
        }
    };

    const confirmResetUsers = async () => {
        setResettingUsers(true);
        try {
            const resetUsersFn = httpsCallable(functions, 'resetAllUsers');
            const result = await resetUsersFn();
            const { count, message } = result.data;
            setIsResetUsersModalOpen(false);
            alert(`✅ Succès !\n${message}`);
        } catch (error) {
            console.error(error);
            alert("Erreur purge utilisateurs: " + error.message);
        } finally {
            setResettingUsers(false);
        }
    };

    const confirmPurgeAnonymous = async () => {
        setPurgingAnonymous(true);
        try {
            const purgeAnonymousFn = httpsCallable(functions, 'purgeAnonymousUsers');
            const result = await purgeAnonymousFn();
            const { count, message } = result.data;
            setIsPurgeAnonymousModalOpen(false);
            alert(`✅ Succès !\n${message}`);
        } catch (error) {
            console.error(error);
            alert("Erreur purge anonymes: " + error.message);
        } finally {
            setPurgingAnonymous(false);
        }
    };

    const handleExportUsers = async () => {
        setExportingUsers(true);
        try {
            const getUserStatsFn = httpsCallable(functions, 'getUserStats');
            const result = await getUserStatsFn();
            const users = result.data.users;

            const data = users.map(u => ({
                'ID': u.uid,
                'Email': u.email,
                'Nom': u.displayName,
                'Date Inscription': new Date(u.creationTime).toLocaleDateString(),
                'Dernière Connexion': new Date(u.lastSignInTime).toLocaleDateString(),
                'Provider': u.provider,
                'IP': u.lastIp || 'N/A',
                'Device': u.lastUserAgent || 'N/A'
            }));

            const XLSX = await import('xlsx');
            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Clients");
            XLSX.writeFile(wb, `Clients_${new Date().toISOString().split('T')[0]}.xlsx`);

            alert(`✅ Export réussi : ${users.length} clients exportés.`);
        } catch (error) {
            console.error(error);
            alert("Erreur export utilisateurs: " + error.message);
        } finally {
            setExportingUsers(false);
        }
    };

    if (loading) return <div className="p-12 text-center text-stone-400 font-bold animate-pulse">Chargement...</div>;

    // Helper for formatting duration
    const formatDuration = (ms) => {
        if (ms <= 0) return "Terminée";
        const days = Math.floor(ms / (1000 * 60 * 60 * 24));
        const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        return days > 0 ? `${days}j ${hours}h` : `${hours}h rest.`;
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">

            {/* KPI ROW - ADAPTIVE GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                <KpiCard
                    title="Chiffre d'Affaires"
                    value={`${stats.totalRevenue} €`}
                    icon={<TrendingUp size={20} className="text-emerald-500" />}
                    trend={`Panier moyen : ${stats.averageOrderValue} €`}
                    trendColor="text-emerald-600"
                    bg="bg-emerald-50/50 ring-1 ring-inset ring-emerald-100"
                    darkMode={darkMode}
                />
                <KpiCard
                    title="Valeur Catalogue" // Replaces Engagement
                    value={`${stats.totalStockValue} €`}
                    icon={<Package size={20} className="text-amber-500" />}
                    trend={`${stats.totalItemsForSale} pièces en stock`}
                    trendColor="text-amber-600"
                    bg="bg-amber-50/50 ring-1 ring-inset ring-amber-100"
                    darkMode={darkMode}
                />
                <KpiCard
                    title="Commandes"
                    value={stats.totalOrders}
                    icon={<ShoppingBag size={20} className="text-blue-500" />}
                    trend="Total cumulé"
                    bg="bg-blue-50/50 ring-1 ring-inset ring-blue-100"
                    darkMode={darkMode}
                />
                <KpiCard
                    title="Enchères Actives" // Replaces Shares
                    value={stats.activeAuctionsCount}
                    icon={<Gavel size={20} className="text-purple-500" />}
                    trend="Salle des ventes"
                    bg="bg-purple-50/50 ring-1 ring-inset ring-purple-100"
                    darkMode={darkMode}
                />
                <KpiCard
                    title="Clients Inscrits"
                    value={stats.registeredUsers}
                    icon={<Users size={20} className="text-pink-500" />}
                    trend="Comptes vérifiés"
                    bg="bg-pink-50/50 ring-1 ring-inset ring-pink-100"
                    darkMode={darkMode}
                    action={
                        <button
                            onClick={handleExportUsers}
                            disabled={exportingUsers}
                            className="mt-2 text-[10px] bg-white ring-1 ring-pink-200 text-pink-600 px-3 py-1 rounded-full font-bold uppercase hover:bg-pink-50 transition-colors flex items-center gap-1"
                        >
                            {exportingUsers ? <RefreshCw size={10} className="animate-spin" /> : <Archive size={10} />} Excel
                        </button>
                    }
                />
            </div>

            {/* SECTION 1 : FLUX D'ACTIVITÉ (MOTEUR DU SITE - FULL WIDTH) */}
            <div className={`p-8 rounded-[2.5rem] shadow-sm transform-gpu backface-hidden will-change-transform overflow-hidden ${darkMode ? 'bg-stone-800 ring-1 ring-inset ring-stone-700' : 'bg-white ring-1 ring-inset ring-stone-100'}`}>
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h3 className={`text-xl font-black uppercase tracking-[0.2em] ${darkMode ? 'text-white' : 'text-stone-900'}`}>Flux Activité</h3>
                        <p className="text-[10px] text-stone-400 font-bold mt-1 uppercase tracking-widest">Le moteur du site - Dernières commandes en direct</p>
                    </div>
                    <ShoppingBag size={20} className="text-stone-300" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    {recentOrders.length === 0 ? (
                        <div className="col-span-full py-12 text-center border-2 border-dashed border-stone-100 rounded-[2rem]">
                            <p className="text-xs text-stone-400 italic">En attente d'activité...</p>
                        </div>
                    ) : (
                        recentOrders.slice(0, 4).map(order => (
                            <div key={order.id} className={`group relative p-6 rounded-[2.5rem] transition-all border transform-gpu hover:scale-[1.02] ${darkMode ? 'bg-stone-900/40 border-stone-700/50 hover:bg-stone-900/60 hover:border-stone-600' : 'bg-white border-stone-100 hover:shadow-2xl hover:shadow-stone-200/40'}`}>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center font-black text-sm transition-all shadow-sm ${darkMode ? 'bg-stone-800 text-emerald-400 ring-1 ring-stone-700' : 'bg-stone-900 text-white group-hover:bg-emerald-500 group-hover:scale-105 group-hover:rotate-3'}`}>
                                        {order.shipping?.fullName?.[0] || '?'}
                                    </div>
                                    <div className="min-w-0">
                                        <p className={`text-xs font-black truncate tracking-tight ${darkMode ? 'text-white' : 'text-stone-900'}`}>{order.shipping?.fullName || 'Client Anonyme'}</p>
                                        <p className="text-[10px] text-stone-400 font-bold mt-0.5 opacity-60">
                                            {new Date(getMillis(order.createdAt)).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} • {new Date(getMillis(order.createdAt)).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className={`text-2xl font-black tracking-tighter ${darkMode ? 'text-white' : 'text-stone-900'}`}>{order.total}€</p>
                                    <div className={`text-[9px] font-black uppercase tracking-[0.15em] px-4 py-1.5 rounded-xl border shadow-sm transition-colors ${order.status === 'shipped'
                                        ? 'text-indigo-400 border-indigo-400/30 bg-indigo-400/10'
                                        : (order.status === 'completed' || order.status === 'paid')
                                            ? 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10'
                                            : 'text-amber-500 border-amber-500/30 bg-amber-500/10'
                                        }`}>
                                        {order.status === 'shipped' ? 'Expédié' : (order.status === 'completed' || order.status === 'paid') ? 'Payé' : 'En attente'}
                                    </div>
                                </div>
                                {/* Subtle indicator line */}
                                <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 rounded-t-full transition-all duration-500 ${order.status === 'shipped' ? 'bg-indigo-500' : (order.status === 'completed' || order.status === 'paid') ? 'bg-emerald-500' : 'bg-amber-500'
                                    } opacity-0 group-hover:opacity-100 group-hover:w-24`} />
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* SECTION 2 : SALLE DES VENTES (FULL WIDTH) */}
            <div className={`p-8 rounded-[2.5rem] shadow-sm overflow-hidden transform-gpu backface-hidden will-change-transform ${darkMode ? 'bg-stone-800 ring-1 ring-inset ring-stone-700' : 'bg-white ring-1 ring-inset ring-stone-100'}`}>
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h3 className={`text-2xl font-black tracking-tight flex items-center gap-3 ${darkMode ? 'text-white' : 'text-stone-900'}`}>
                            Salle des Ventes <span className="text-[10px] bg-red-500 text-white px-3 py-1 rounded-full animate-pulse tracking-widest uppercase">Live Control</span>
                        </h3>
                        <p className="text-xs text-stone-400 font-bold uppercase tracking-widest mt-1">Surveillance des enchères actives en temps réel</p>
                    </div>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${darkMode ? 'bg-stone-900 border-stone-700 text-stone-400' : 'bg-stone-50 border-stone-100 text-stone-300'}`}>
                        <Gavel size={24} />
                    </div>
                </div>

                <div className="space-y-4">
                    {activeAuctions.length === 0 ? (
                        <div className="text-center py-20 opacity-40 border-2 border-dashed border-stone-100 rounded-[2.5rem]">
                            <Gavel size={48} className="mx-auto mb-4 text-stone-200" />
                            <p className="text-sm font-bold text-stone-400 uppercase tracking-[0.2em]">Le marteau est au repos</p>
                        </div>
                    ) : (
                        activeAuctions.map((item) => (
                            <div key={item.id} className={`group flex items-center justify-between p-6 rounded-[2rem] ring-1 ring-inset transition-all transform-gpu hover:scale-[1.01] ${darkMode ? 'ring-stone-700 bg-stone-900/40 hover:bg-stone-900/60' : 'ring-stone-100 bg-stone-50/40 hover:bg-white hover:shadow-2xl hover:shadow-stone-200/40'}`}>
                                <div className="flex items-center gap-6">
                                    <div className="relative">
                                        <img src={item.images?.[0] || item.imageUrl} className="w-16 h-16 rounded-2xl object-cover shadow-lg transition-transform group-hover:rotate-2" alt="" />
                                        <div className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 rounded-xl ring-4 ring-white flex items-center justify-center text-[10px] font-black text-white shadow-xl">{item.bidCount}</div>
                                    </div>
                                    <div>
                                        <h4 className={`font-black text-lg ${darkMode ? 'text-white' : 'text-stone-900'}`}>{item.name}</h4>
                                        <p className="text-[11px] font-bold text-amber-600 uppercase tracking-wider flex items-center gap-2 mt-1">
                                            <Users size={12} className="opacity-50" /> {item.lastBidderName || 'Aucune offre active'}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`font-black text-3xl tracking-tighter ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                                        {item.currentPrice || item.startingPrice} €
                                    </p>
                                    <p className="text-[10px] font-black text-stone-400 flex items-center justify-end gap-2 mt-1.5 bg-stone-100/50 px-2 py-0.5 rounded-full inline-flex">
                                        <Clock size={12} className="text-red-400" /> {formatDuration(item.timeLeft)}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* SECTION 3 : CONTRÔLES & MAINTENANCE (GRID BOTTOM) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-8 border-t border-dashed border-stone-200 opacity-80 hover:opacity-100 transition-opacity">
                {/* DIAGNOSTICS */}
                <div className={`p-8 rounded-[2.5rem] shadow-sm ${darkMode ? 'bg-stone-800 ring-1 ring-inset ring-stone-700' : 'bg-white ring-1 ring-inset ring-stone-100'}`}>
                    <div className="flex items-center gap-3 mb-6 text-stone-400">
                        <RefreshCw size={18} />
                        <h3 className={`text-xs font-black uppercase tracking-widest ${darkMode ? 'text-white' : 'text-stone-900'}`}>Contrôles Système</h3>
                    </div>
                    <button onClick={async () => {
                        if (!confirm("Tester flux email ?")) return;
                        try {
                            const res = await httpsCallable(functions, 'sendTestEmail')();
                            alert(res.data.success ? "✅ Mail Flux OK" : "❌ Erreur Mail");
                        } catch (e) { alert(e.message); }
                    }} className={`w-full py-4 rounded-xl font-black uppercase text-[10px] tracking-widest border transition-all ${darkMode ? 'bg-stone-700 border-stone-600 text-stone-300 hover:bg-stone-600' : 'bg-stone-50 border-stone-200 text-stone-500 hover:bg-white hover:shadow-sm shadow-inner'}`}>
                        <Mail size={14} className="inline mr-2" /> Diagnostic Mail
                    </button>
                </div>

                {/* DANGER ZONE (FULL SPAN REST) */}
                {user?.email === 'matthis.fradin2@gmail.com' && (
                    <div className={`lg:col-span-2 p-8 rounded-[2.5rem] border-2 border-dashed transition-all duration-500 ${darkMode ? 'border-red-500/20 bg-red-500/5' : 'border-red-200/50 bg-red-50/30'}`}>
                        <div className={`flex items-center gap-3 mb-6 ${darkMode ? 'text-red-400' : 'text-red-900/40'}`}>
                            <AlertTriangle size={18} />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Commandes Critiques</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                            <button onClick={handleResetOrdersClick} className={`py-3.5 rounded-2xl font-black uppercase text-[9px] tracking-widest transition-all border shadow-sm active:scale-95 ${darkMode ? 'bg-stone-950 border-red-900/40 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-white border-red-100 text-red-500 hover:bg-red-500 hover:text-white'}`}>Reset Ventes</button>
                            <button onClick={() => setIsCleaningModalOpen(true)} className={`py-3.5 rounded-2xl font-black uppercase text-[9px] tracking-widest transition-all border shadow-sm active:scale-95 ${darkMode ? 'bg-stone-950 border-orange-900/40 text-orange-500 hover:bg-orange-500 hover:text-white' : 'bg-white border-orange-100 text-orange-500 hover:bg-orange-500 hover:text-white'}`}>Clean Cloud</button>
                            <button onClick={() => setIsPurgeAnonymousModalOpen(true)} className={`py-3.5 rounded-2xl font-black uppercase text-[9px] tracking-widest transition-all border shadow-sm active:scale-95 ${darkMode ? 'bg-stone-950 border-amber-900/40 text-amber-500 hover:bg-amber-500 hover:text-white' : 'bg-white border-amber-200 text-amber-600 hover:bg-amber-600 hover:text-white'}`}>Purge Anonymes</button>
                            <button onClick={() => setIsResetUsersModalOpen(true)} className={`py-3.5 rounded-2xl font-black uppercase text-[9px] tracking-widest transition-all border shadow-sm active:scale-95 ${darkMode ? 'bg-stone-950 border-red-900/40 text-red-600 hover:bg-red-600 hover:text-white' : 'bg-white border-red-200 text-red-700 hover:bg-red-700 hover:text-white'}`}>Purge Clients</button>
                        </div>
                    </div>
                )}
            </div>
            {isOrderResetModalOpen && (
                <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm ${darkMode ? 'bg-black/70' : 'bg-stone-900/50'}`}>
                    <div className={`rounded-[2rem] p-8 max-w-sm w-full shadow-2xl border text-center space-y-4 ${darkMode ? 'bg-stone-800 border-stone-700' : 'bg-white border-stone-100'}`}>
                        <h3 className={`text-lg font-black ${darkMode ? 'text-white' : 'text-stone-900'}`}>Purger Commandes ?</h3>
                        <p className="text-xs text-stone-400">Export Excel + Suppression définitive.</p>
                        <div className="flex gap-2">
                            <button onClick={confirmResetOrders} className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold text-xs">Confirmer</button>
                            <button onClick={() => setIsOrderResetModalOpen(false)} className="flex-1 py-3 bg-stone-200 text-stone-600 rounded-xl font-bold text-xs">Annuler</button>
                        </div>
                    </div>
                </div>
            )}
            {isCleaningModalOpen && (
                <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm ${darkMode ? 'bg-black/70' : 'bg-stone-900/50'}`}>
                    <div className={`rounded-[2rem] p-8 max-w-sm w-full shadow-2xl border text-center space-y-4 ${darkMode ? 'bg-stone-800 border-stone-700' : 'bg-white border-stone-100'}`}>
                        <h3 className={`text-lg font-black ${darkMode ? 'text-white' : 'text-stone-900'}`}>Nettoyage Système ?</h3>
                        <p className="text-xs text-stone-400">Supprime les images orphelines du stockage.</p>
                        <div className="flex gap-2">
                            <button onClick={confirmCleaning} className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-bold text-xs">Lancer</button>
                            <button onClick={() => setIsCleaningModalOpen(false)} className="flex-1 py-3 bg-stone-200 text-stone-600 rounded-xl font-bold text-xs">Annuler</button>
                        </div>
                    </div>
                </div>
            )}
            {isResetUsersModalOpen && (
                <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm ${darkMode ? 'bg-black/70' : 'bg-stone-900/50'}`}>
                    <div className={`rounded-[2rem] p-8 max-w-sm w-full shadow-2xl border text-center space-y-4 ${darkMode ? 'bg-stone-800 border-stone-700 border-red-900/30' : 'bg-white border-stone-100 border-red-100'}`}>
                        <h3 className={`text-lg font-black text-red-500`}>Danger : Purge Totale ?</h3>
                        <p className={`text-xs ${darkMode ? 'text-stone-300' : 'text-stone-600'}`}>
                            Cela va supprimer <b>TOUS les comptes utilisateurs</b> (clients et tests) de Firebase Auth.<br /><br />
                            Seuls les Super Admins (<code>matthis.fradin...</code>) seront épargnés.
                        </p>
                        <div className="flex gap-2 pt-2">
                            <button onClick={confirmResetUsers} className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-500/20">Confirmer</button>
                            <button onClick={() => setIsResetUsersModalOpen(false)} className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-wider ${darkMode ? 'bg-stone-700 text-stone-300 hover:bg-stone-600' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'}`}>Annuler</button>
                        </div>
                    </div>
                </div>
            )}
            {isPurgeAnonymousModalOpen && (
                <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm ${darkMode ? 'bg-black/70' : 'bg-stone-900/50'}`}>
                    <div className={`rounded-[2rem] p-8 max-w-sm w-full shadow-2xl border text-center space-y-4 ${darkMode ? 'bg-stone-800 border-stone-700 border-amber-900/30' : 'bg-white border-stone-100 border-amber-100'}`}>
                        <h3 className={`text-lg font-black text-amber-500`}>Purge Anonymes ?</h3>
                        <p className={`text-xs ${darkMode ? 'text-stone-300' : 'text-stone-600'}`}>
                            Cela va supprimer <b>UNIQUEMENT les comptes anonymes</b> de Firebase Auth.<br /><br />
                            Vos vrais clients et admins ne seront pas affectés.
                        </p>
                        <div className="flex gap-2 pt-2">
                            <button onClick={confirmPurgeAnonymous} disabled={purgingAnonymous} className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 disabled:opacity-50 flex items-center justify-center">
                                {purgingAnonymous ? <RefreshCw size={14} className="animate-spin" /> : 'Confirmer'}
                            </button>
                            <button onClick={() => setIsPurgeAnonymousModalOpen(false)} disabled={purgingAnonymous} className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-wider ${darkMode ? 'bg-stone-700 text-stone-300 hover:bg-stone-600' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'} disabled:opacity-50`}>Annuler</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const KpiCard = ({ title, value, icon, trend, trendColor = "text-stone-400", bg = "bg-white", darkMode = false, action }) => (
    <div className={`p-6 rounded-[2rem] shadow-sm transition-all duration-300 hover:scale-[1.05] transform-gpu backface-hidden will-change-transform overflow-hidden ${darkMode ? 'bg-stone-800 ring-1 ring-inset ring-stone-700' : (bg.includes('white') ? 'ring-1 ring-inset ring-stone-100 bg-white' : bg)}`}>
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-2xl shadow-sm ring-1 ring-inset ${darkMode ? 'bg-stone-700 ring-stone-600' : 'bg-white ring-stone-100/50'}`}>{icon}</div>
            {action}
        </div>
        <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">{title}</p>
            <h4 className={`text-2xl font-black tracking-tighter mb-2 ${darkMode ? 'text-white' : 'text-stone-900'}`}>{value}</h4>
            <p className={`text-[10px] font-bold opacity-80 ${trendColor}`}>{trend}</p>
        </div>
    </div>
);

export default AdminDashboard;
